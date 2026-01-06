from django.db import models
from django.conf import settings
from django.utils import timezone

class Payment(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payments'  # Added related_name for better querying
    )
    plan_id = models.CharField(max_length=50)
    billing_period = models.CharField(max_length=10)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Stripe fields
    stripe_session_id = models.CharField(max_length=100, unique=True)
    stripe_subscription_id = models.CharField(max_length=100, blank=True, null=True)
    stripe_payment_intent_id = models.CharField(max_length=100, blank=True, null=True)
    
    # Dates
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(blank=True, null=True)
    
    # Status
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    status = models.CharField(
        max_length=50,
        choices=STATUS_CHOICES,
        default='pending'
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Payment"
        verbose_name_plural = "Payments"

    def __str__(self):
        return f"{self.billing_period}ly payment of ₹{self.amount_paid} by {self.user}"