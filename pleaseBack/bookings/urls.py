from django.urls import path
from .views import BookingCreateView, BookingCancelView, UserBookingListView,BookingCompleteView

urlpatterns = [
    path('bookings/', BookingCreateView.as_view(), name='booking-create'),
    path('bookings/<int:booking_id>/cancel/', BookingCancelView.as_view(), name='booking-cancel'),
    path('user-bookings/', UserBookingListView.as_view(), name='user-bookings'),
    path('bookings/<int:booking_id>/complete/', BookingCompleteView.as_view(), name='booking-complete'),
]