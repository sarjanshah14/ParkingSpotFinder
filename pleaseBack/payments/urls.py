from django.urls import path
from .views import create_checkout_session, verify_payment, get_stripe_config

urlpatterns = [
    path('config/', get_stripe_config, name='stripe-config'),
    path('create-checkout-session/', create_checkout_session, name='create-checkout-session'),
    path('verify-payment/', verify_payment, name='verify-payment'),
]