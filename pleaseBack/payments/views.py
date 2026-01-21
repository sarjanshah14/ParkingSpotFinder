import logging
from datetime import datetime
import stripe
from django.conf import settings
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Payment

logger = logging.getLogger(__name__)

stripe.api_key = settings.STRIPE_SECRET_KEY


# ------------------------------------------------------------------
# CREATE CHECKOUT SESSION
# ------------------------------------------------------------------
@api_view(['POST'])
@permission_classes([AllowAny]) # or IsAuthenticated if you require login
def create_checkout_session(request):
    try:
        data = request.data
        # Log incoming data for debugging
        logger.info(f"Create Checkout Session Payload: {data}")

        plan_id = data.get("plan_id")
        billing_period = data.get("billing_period")
        customer_email = data.get("customer_email")

        if not all([plan_id, billing_period, customer_email]):
            missing = [k for k in ["plan_id", "billing_period", "customer_email"] if not data.get(k)]
            error_msg = f"Missing required fields: {', '.join(missing)}"
            logger.error(error_msg)
            return Response({"error": error_msg}, status=status.HTTP_400_BAD_REQUEST)

        price_key = f"{plan_id}_{billing_period}"
        price_id = settings.STRIPE_PRICE_IDS.get(price_key)

        logger.info(f"Resolving Price Key: {price_key} -> {price_id}")

        if not price_id:
            available_keys = list(settings.STRIPE_PRICE_IDS.keys())
            logger.error(f"Invalid plan configuration. Key: {price_key}, Available: {available_keys}")
            return Response(
                {"error": f"Invalid plan configuration for {price_key}. Contact support."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Base metadata
        metadata = {
            "plan_id": plan_id,
            "billing_period": billing_period,
            "customer_email": customer_email,
        }
        
        # Add user ID to metadata if authenticated
        if request.user.is_authenticated:
            metadata["user_id"] = str(request.user.id)

        # Construct URLs
        # Construct URLs
        raw_frontend_url = getattr(settings, 'FRONTEND_URL', '')
        
        # Aggressive cleaning of misconfigured env var
        if raw_frontend_url:
            base_url = str(raw_frontend_url).strip()
            # Remove common copypaste errors like "FRONTEND_URL="
            if "=" in base_url:
                base_url = base_url.split("=")[-1].strip()
        else:
            base_url = "https://parkingspotfinder.onrender.com"
            
        # Fallback ensuring it looks like a URL
        if not base_url.startswith("http"):
            # If completely borked, default to prod
            base_url = "https://parkingspotfinder.onrender.com"
            
        # Ensure no trailing slash
        if base_url.endswith('/'):
            base_url = base_url[:-1]

        success_url = f"{base_url}/success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{base_url}/pricing"
        
        logger.info(f"Stripe URLs: Success={success_url}, Cancel={cancel_url}")

        session = stripe.checkout.Session.create(
            mode="subscription",
            payment_method_types=["card"],
            customer_email=customer_email,
            line_items=[{"price": price_id, "quantity": 1}],
            success_url=success_url,
            cancel_url=cancel_url,
            metadata=metadata,
            subscription_data={
                "metadata": metadata
            },
        )

        logger.info("Stripe checkout created: %s", session.id)
        return Response({"sessionId": session.id})

    except stripe.error.StripeError as e:
        logger.error("Stripe error: %s", str(e))
        # Include the tried URL in the error for debugging (remove in prod if needed)
        return Response({"error": f"{str(e)} | Used Success URL: {success_url}"}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        logger.exception("Unexpected error in create_checkout_session")
        return Response({"error": "Server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ------------------------------------------------------------------
# VERIFY PAYMENT
# ------------------------------------------------------------------
@api_view(['GET'])
@permission_classes([AllowAny]) # We handle user association manually if present
def verify_payment(request):
    session_id = request.query_params.get("session_id")
    if not session_id:
        return Response({"error": "session_id required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        session = stripe.checkout.Session.retrieve(
            session_id, expand=["subscription", "customer"]
        )

        subscription = session.subscription
        customer_email = session.customer_email
        
        # Safely get metadata
        meta = session.metadata or {}
        plan_id = meta.get("plan_id", "unknown")
        billing_period = meta.get("billing_period", "unknown")
        
        # Try to resolve user from metadata or request
        user = None
        if request.user.is_authenticated:
            user = request.user
        elif meta.get("user_id"):
            from django.contrib.auth import get_user_model
            User = get_user_model()
            try:
                user = User.objects.get(pk=meta.get("user_id"))
            except User.DoesNotExist:
                pass

        response_data = {
            "status": session.payment_status,
            "session_id": session.id,
            "customer_email": customer_email,
            "plan_id": plan_id,
            "billing_period": billing_period,
        }

        if subscription:
            # It's a subscription object (object because of expand)
            # Be careful if expand failed or type is different, but for 'subscription' mode it should be obj
            sub_id = getattr(subscription, 'id', None)
            sub_status = getattr(subscription, 'status', 'unknown')
            current_period_end = getattr(subscription, 'current_period_end', None)

            response_data.update({
                "subscription_id": sub_id,
                "subscription_status": sub_status,
                "current_period_end": current_period_end,
            })

            # Calculate amount safely
            amount = 0
            if session.amount_total:
                amount = session.amount_total / 100

            expires_at = None
            if current_period_end:
                expires_at = datetime.fromtimestamp(current_period_end, tz=timezone.utc)

            # Update or Create Payment Record
            Payment.objects.update_or_create(
                stripe_session_id=session.id,
                defaults={
                    "user": user,
                    "plan_id": plan_id,
                    "billing_period": billing_period,
                    "stripe_subscription_id": sub_id,
                    "amount_paid": amount,
                    "status": "completed" if session.payment_status == "paid" else "pending",
                    "expires_at": expires_at,
                },
            )

        return Response(response_data)

    except stripe.error.InvalidRequestError:
        return Response({"error": "Invalid session ID"}, status=status.HTTP_400_BAD_REQUEST)

    except stripe.error.StripeError as e:
        logger.error("Stripe error: %s", str(e))
        return Response({"error": "Stripe error"}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        logger.exception("Verify payment failed")
        # Return the actual error in dev mode or log it, but generic for prod
        return Response({"error": f"Server error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
