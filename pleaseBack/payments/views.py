import json
import logging
from datetime import datetime

import stripe
from django.conf import settings
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

from .models import Payment

logger = logging.getLogger(__name__)

stripe.api_key = settings.STRIPE_SECRET_KEY


# ---- PRICE MAP (FROM ENV) ----
PRICE_MAP = {
    "basic_month": settings.STRIPE_BASIC_MONTH,
    "basic_year": settings.STRIPE_BASIC_YEAR,
    "standard_month": settings.STRIPE_STANDARD_MONTH,
    "standard_year": settings.STRIPE_STANDARD_YEAR,
    "premium_month": settings.STRIPE_PREMIUM_MONTH,
    "premium_year": settings.STRIPE_PREMIUM_YEAR,
}


# ------------------------------------------------------------------
# CREATE CHECKOUT SESSION
# ------------------------------------------------------------------
@csrf_exempt
def create_checkout_session(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST only"}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    plan_id = data.get("plan_id")
    billing_period = data.get("billing_period")
    customer_email = data.get("customer_email")

    if not all([plan_id, billing_period, customer_email]):
        return JsonResponse(
            {"error": "plan_id, billing_period, customer_email required"},
            status=400,
        )

    price_key = f"{plan_id}_{billing_period}"
    price_id = PRICE_MAP.get(price_key)

    if not price_id:
        return JsonResponse({"error": "Invalid plan"}, status=400)

    try:
        session = stripe.checkout.Session.create(
            mode="subscription",
            payment_method_types=["card"],
            customer_email=customer_email,
            line_items=[
                {
                    "price": price_id,
                    "quantity": 1,
                }
            ],
            success_url=f"{settings.FRONTEND_URL}/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.FRONTEND_URL}/pricing",
            metadata={
                "plan_id": plan_id,
                "billing_period": billing_period,
                "customer_email": customer_email,
            },
            subscription_data={
                "metadata": {
                    "plan_id": plan_id,
                    "billing_period": billing_period,
                }
            },
        )

        logger.info("Stripe checkout created: %s", session.id)

        return JsonResponse({"sessionId": session.id})

    except stripe.error.StripeError as e:
        logger.error("Stripe error: %s", str(e))
        return JsonResponse({"error": str(e)}, status=400)

    except Exception as e:
        logger.exception("Unexpected error")
        return JsonResponse({"error": "Server error"}, status=500)


# ------------------------------------------------------------------
# VERIFY PAYMENT
# ------------------------------------------------------------------
@csrf_exempt
def verify_payment(request):
    session_id = request.GET.get("session_id")
    if not session_id:
        return JsonResponse({"error": "session_id required"}, status=400)

    try:
        session = stripe.checkout.Session.retrieve(
            session_id, expand=["subscription", "customer"]
        )

        subscription = session.subscription
        customer_email = session.customer_email

        response = {
            "status": session.payment_status,
            "session_id": session.id,
            "customer_email": customer_email,
            "plan_id": session.metadata.get("plan_id"),
            "billing_period": session.metadata.get("billing_period"),
        }

        if subscription:
            response.update(
                {
                    "subscription_id": subscription.id,
                    "subscription_status": subscription.status,
                    "current_period_end": subscription.current_period_end,
                }
            )

            # Save payment record
            Payment.objects.update_or_create(
                stripe_session_id=session.id,
                defaults={
                    "plan_id": response["plan_id"],
                    "billing_period": response["billing_period"],
                    "stripe_subscription_id": subscription.id,
                    "amount_paid": session.amount_total / 100
                    if session.amount_total
                    else 0,
                    "status": "completed"
                    if session.payment_status == "paid"
                    else "pending",
                    "expires_at": datetime.fromtimestamp(
                        subscription.current_period_end, tz=timezone.utc
                    ),
                },
            )

        return JsonResponse(response)

    except stripe.error.InvalidRequestError:
        return JsonResponse({"error": "Invalid session ID"}, status=400)

    except stripe.error.StripeError as e:
        logger.error("Stripe error: %s", str(e))
        return JsonResponse({"error": "Stripe error"}, status=400)

    except Exception as e:
        logger.exception("Verify payment failed")
        return JsonResponse({"error": "Server error"}, status=500)
