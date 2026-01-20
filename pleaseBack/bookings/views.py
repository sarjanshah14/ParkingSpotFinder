from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from .models import Booking
from .serializers import BookingSerializer
from premises.models import Premise
from rest_framework import status
from .utils import send_sms
import datetime
class BookingCreateView(generics.CreateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            # Create booking
            # The post_save signal in models.py handles sending the SMS, 
            # so we don't need to do it here manually.
            booking = serializer.save(user=request.user)
            
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except Exception as e:
            # Log the full stack trace to console (visible in Render logs)
            import traceback
            traceback.print_exc() 
            # Return the error message in the response to help debugging
            return Response(
                {"error": "Internal Server Error", "details": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
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