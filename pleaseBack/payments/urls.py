from django.urls import path
from .views import create_checkout_session, verify_payment

urlpatterns = [
    path('create-checkout-session/', create_checkout_session, name='create-checkout-session'),
    path('verify-payment/', verify_payment, name='verify-payment'),
]