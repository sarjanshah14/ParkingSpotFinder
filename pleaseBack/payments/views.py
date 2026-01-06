from datetime import datetime
import json
import logging
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import stripe
from django.utils import timezone
from .models import Payment

# Initialize Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

# Configure logging
logger = logging.getLogger(__name__)

# Price IDs from your Stripe Dashboard
PRICE_IDS = {
    'basic_month': 'price_1Rw3fu1yRBtzWAxgiZK4fbiI',
    'basic_year': 'price_1RwL1t1yRBtzWAxgn0N8rJKP',
    'standard_month': 'price_1Rw3gW1yRBtzWAxgMu9NZuP2',
    'standard_year': 'price_1RwL2B1yRBtzWAxgKVVtzAru',
    'premium_month': 'price_1Rw3gr1yRBtzWAxga91hIJAx',
    'premium_year': 'price_1RwL3F1yRBtzWAxg3KV8B9iJ'
}

@csrf_exempt
def create_checkout_session(request):
    """
    Creates a Stripe checkout session for subscription
    Required POST data:
    {
        "plan_id": "basic|standard|premium",
        "billing_period": "month|year",
        "customer_email": "valid@email.com"
    }
    """
    if request.method != 'POST':
        logger.warning('Invalid request method: %s', request.method)
        return JsonResponse(
            {'error': 'Only POST method is allowed'}, 
            status=405,
            headers={'Allow': 'POST'}
        )

    try:
        # Parse and validate request data
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError as e:
            logger.error('JSON decode error: %s', str(e))
            return JsonResponse(
                {'error': 'Invalid JSON format'}, 
                status=400
            )

        plan_id = data.get('plan_id')
        billing_period = data.get('billing_period')
        customer_email = data.get('customer_email')

        # Validate required fields
        if not all([plan_id, billing_period, customer_email]):
            missing = [field for field in ['plan_id', 'billing_period', 'customer_email'] 
                      if not data.get(field)]
            logger.error('Missing required fields: %s', missing)
            return JsonResponse(
                {'error': f'Missing required fields: {missing}'},
                status=400
            )

        # Validate plan and billing period combination
        price_key = f"{plan_id}_{billing_period}"
        price_id = PRICE_IDS.get(price_key)
        
        if not price_id:
            logger.error('Invalid price key: %s', price_key)
            return JsonResponse(
                {'error': 'Invalid plan or billing period combination'},
                status=400
            )

        # Create Stripe checkout session
        try:
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price': price_id,
                    'quantity': 1,
                }],
                mode='subscription',
                customer_email=customer_email,
                success_url=(
                    f'{settings.FRONTEND_URL}/success?'
                    f'session_id={{CHECKOUT_SESSION_ID}}'
                ),
                cancel_url=f'{settings.FRONTEND_URL}/pricing',
                metadata={
                    'plan_id': plan_id,
                    'billing_period': billing_period,
                    'customer_email': customer_email
                },
                subscription_data={
                    'metadata': {
                        'plan_id': plan_id,
                        'billing_period': billing_period
                    }
                }
            )
            
            logger.info(
                'Created checkout session for %s (%s)',
                customer_email,
                price_key
            )
            return JsonResponse({
                'sessionId': session.id,
                'publicKey': settings.STRIPE_PUBLIC_KEY
            })
            
        except stripe.error.StripeError as e:
            logger.error('Stripe API error: %s', str(e))
            return JsonResponse(
                {'error': f'Payment processing error: {str(e)}'},
                status=400
            )

    except Exception as e:
        logger.exception('Unexpected error in create_checkout_session')
        return JsonResponse(
            {'error': 'Internal server error'},
            status=500
        )

@csrf_exempt
def verify_payment(request):
    """
    Verifies payment status with comprehensive error handling
    """
    if request.method != 'GET':
        logger.warning('Invalid request method')
        return JsonResponse(
            {'status': 'error', 'message': 'Only GET method is allowed'},
            status=405
        )

    session_id = request.GET.get('session_id')
    if not session_id:
        logger.error('Missing session_id parameter')
        return JsonResponse(
            {'status': 'error', 'message': 'session_id parameter is required'},
            status=400
        )

    try:
        logger.info(f'Retrieving Stripe session: {session_id}')
        
        # Retrieve session with expanded data
        session = stripe.checkout.Session.retrieve(
            session_id,
            expand=['subscription', 'customer']
        )
        logger.debug(f'Session data: {session}')

        # Validate essential session data
        if not hasattr(session, 'payment_status'):
            logger.error('Invalid session object from Stripe')
            return JsonResponse(
                {'status': 'error', 'message': 'Invalid payment session'},
                status=400
            )

        # Get customer email
        customer_email = None
        if hasattr(session, 'customer_details') and session.customer_details:
            customer_email = session.customer_details.email
        elif hasattr(session, 'customer_email'):
            customer_email = session.customer_email

        # Prepare basic response
        response_data = {
            'payment_id': session.id,
            'status': 'success',
            'payment_status': session.payment_status,
            'amount': session.amount_total / 100 if hasattr(session, 'amount_total') else 0,
            'currency': session.currency.upper() if hasattr(session, 'currency') else '',
            'customer_email': customer_email
        }

        # Get metadata
        if hasattr(session, 'metadata'):
            response_data.update({
                'plan_id': session.metadata.get('plan_id'),
                'billing_period': session.metadata.get('billing_period')
            })

        # Handle subscription data
        if hasattr(session, 'subscription') and session.subscription:
            subscription = session.subscription
            subscription_data = {
                'subscription_id': subscription.id,
                'subscription_status': getattr(subscription, 'status', 'active')
            }
            
            # Safely handle subscription dates
            if hasattr(subscription, 'current_period_end'):
                subscription_data['current_period_end'] = subscription.current_period_end
                subscription_data['next_billing_date'] = datetime.fromtimestamp(
                    subscription.current_period_end
                ).strftime('%Y-%m-%d %H:%M:%S')
            
            response_data.update(subscription_data)

            # Create/update payment record
            try:
                from django.contrib.auth import get_user_model
                User = get_user_model()
                
                # Try to find user by email (adjust this based on your auth system)
                user = None
                if customer_email:
                    try:
                        user = User.objects.get(email=customer_email)
                    except User.DoesNotExist:
                        pass

                payment, created = Payment.objects.update_or_create(
                    stripe_session_id=session_id,
                    defaults={
                        'user': user,
                        'plan_id': response_data.get('plan_id', ''),
                        'billing_period': response_data.get('billing_period', ''),
                        'amount_paid': response_data['amount'],
                        'stripe_subscription_id': subscription.id,
                        'status': 'completed' if session.payment_status == 'paid' else 'pending',
                        'expires_at': datetime.fromtimestamp(subscription.current_period_end, tz=timezone.utc) if hasattr(subscription, 'current_period_end') else None
                    }
                )
                response_data['payment_id'] = payment.id
                logger.info(f'Payment record {"created" if created else "updated"}: {payment.id}')
            except Exception as e:
                logger.error(f'Failed to save payment: {str(e)}', exc_info=True)
                # Continue even if saving fails, but log the error

        logger.info('Payment verification successful')
        return JsonResponse(response_data)

    except stripe.error.InvalidRequestError as e:
        logger.error(f'Invalid Stripe request: {str(e)}')
        return JsonResponse(
            {'status': 'error', 'message': 'Invalid payment session ID'},
            status=400
        )
    except stripe.error.AuthenticationError as e:
        logger.error(f'Stripe authentication error: {str(e)}')
        return JsonResponse(
            {'status': 'error', 'message': 'Payment service configuration error'},
            status=500
        )
    except stripe.error.APIConnectionError as e:
        logger.error(f'Stripe connection error: {str(e)}')
        return JsonResponse(
            {'status': 'error', 'message': 'Could not connect to payment service'},
            status=503
        )
    except stripe.error.StripeError as e:
        logger.error(f'Stripe API error: {str(e)}')
        return JsonResponse(
            {'status': 'error', 'message': 'Payment processing error'},
            status=400
        )
    except Exception as e:
        logger.exception(f'Unexpected error in verify_payment: {str(e)}')
        return JsonResponse(
            {'status': 'error', 'message': 'Internal server error'},
            status=500
        )