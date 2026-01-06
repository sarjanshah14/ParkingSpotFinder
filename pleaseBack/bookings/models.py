from django.db import models
from django.contrib.auth import get_user_model
from premises.models import Premise
from django.utils import timezone
from .utils import send_booking_confirmation_sms
from django.dispatch import receiver
from django.db.models.signals import post_save


User = get_user_model()

class Booking(models.Model):
    STATUS_CHOICES = [
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    premise = models.ForeignKey(Premise, on_delete=models.CASCADE, related_name='bookings')
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    duration = models.PositiveIntegerField(default=1)  # in hours
    booking_time = models.DateTimeField(auto_now_add=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='confirmed')

    def __str__(self):
        return f"{self.user.email} - {self.premise.name}"

    def save(self, *args, **kwargs):
        # Set start_time to current time if not specified
        if not self.pk:  # Only for new bookings
            self.start_time = timezone.now()
        
        # Calculate end_time based on start_time and duration
        self.end_time = self.start_time + timezone.timedelta(hours=self.duration)
        
        # Calculate price
        try:
            price_str = self.premise.price
            price_per_hour = int(''.join(filter(str.isdigit, price_str.split('/')[0])))
            self.total_price = price_per_hour * self.duration
        except (ValueError, IndexError, AttributeError):
            self.total_price = 0
        
        super().save(*args, **kwargs)

@receiver(post_save, sender=Booking)
def send_booking_sms(sender, instance, created, **kwargs):
    if created:
        booking_details = {
            'id': instance.id,
            'premise_name': instance.premise.name,
            'premise_location': instance.premise.location,
            'duration': instance.duration,
            'total_price': instance.total_price,
            'start_time': instance.start_time.strftime("%Y-%m-%d %H:%M")
        }
        send_booking_confirmation_sms(instance.phone, booking_details)