from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from .models import Booking
from .serializers import BookingSerializer
from premises.models import Premise
from rest_framework import status
from .utils import send_booking_confirmation_sms
import datetime
class BookingCreateView(generics.CreateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create booking
        booking = serializer.save(user=request.user)
        
        # Prepare SMS details
        booking_details = {
            'id': booking.id,
            'premise_name': booking.premise.name,
            'premise_location': booking.premise.location,
            'duration': booking.duration,
            'total_price': booking.total_price,
            'start_time': booking.start_time.strftime("%Y-%m-%d %H:%M")
        }
        # Send SMS (async would be better in production)
        send_booking_confirmation_sms(booking.phone, booking_details)
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
class UserBookingListView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        status_param = self.request.query_params.get('status', None)
        queryset = Booking.objects.filter(user=self.request.user).select_related('premise')
        
        if status_param:
            queryset = queryset.filter(status=status_param.lower())
        return queryset

class BookingCancelView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, booking_id):
        try:
            booking = Booking.objects.select_related('premise').get(
                id=booking_id, 
                user=request.user,
                status='confirmed'  # Only allow cancelling active bookings
            )
            
            # Increment available slots
            booking.premise.available += 1
            booking.premise.save()
            
            booking.status = 'cancelled'
            booking.save()

            return Response(
                {'status': 'Booking cancelled successfully'}, 
                status=status.HTTP_200_OK
            )
            
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Booking not found or not eligible for cancellation'}, 
                status=status.HTTP_404_NOT_FOUND
            )

class BookingCompleteView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, booking_id):
        try:
            booking = Booking.objects.select_related('premise').get(
                id=booking_id,
                user=request.user,
                status='confirmed'  # Only allow completing active bookings
            )
            
            # Update premise available slots
            booking.premise.available += 1
            booking.premise.save()
            
            # Mark booking as completed
            booking.status = 'completed'
            booking.save()
            
            return Response(
                {'status': 'Booking completed successfully'},
                status=status.HTTP_200_OK
            )
            
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Booking not found or not eligible for completion'},
                status=status.HTTP_404_NOT_FOUND
            )

class BookingDetailView(generics.RetrieveAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return super().get_queryset().filter(user=self.request.user)