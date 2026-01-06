# utils/twilio_service.py
from django.conf import settings
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException
import logging

logger = logging.getLogger(__name__)

def send_booking_confirmation_sms(phone_number, booking_details):
    try:
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        
        message = client.messages.create(
            body=(
                f"Parking Booking Confirmed\n"
                f"Location: {booking_details['premise_name']}\n"
                f"Duration: {booking_details['duration']} hours\n"
                f"Total: INR {booking_details['total_price']}\n"
                f"Booking ID: {booking_details['id']}\n"
                f"Start Time: {booking_details['start_time']}\n"
                f"Thank you for using letsPark!"
            ),
            from_=settings.TWILIO_PHONE_NUMBER,
            to=f"+91{phone_number}"
        )
        logger.info(f"SMS sent to {phone_number}, SID: {message.sid}")
        return True
    except TwilioRestException as e:
        logger.error(f"Twilio API Error: {e}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error sending SMS: {e}")
        return False