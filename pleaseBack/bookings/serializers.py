from rest_framework import serializers
from .models import Booking
from premises.serializers import PremiseSerializer
from premises.models import Premise
from django.utils.timezone import localtime

class BookingSerializer(serializers.ModelSerializer):
    premise = PremiseSerializer(read_only=True)
    premise_id = serializers.PrimaryKeyRelatedField(
        queryset=Premise.objects.all(),
        source='premise',
        write_only=True,
        required=True
    )
    
    display_date = serializers.SerializerMethodField()
    display_time_range = serializers.SerializerMethodField()
    display_duration = serializers.SerializerMethodField()
    booking_time = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id', 'premise', 'premise_id', 'name', 'phone',
            'duration', 'display_date', 'display_time_range', 'display_duration',
            'start_time', 'end_time', 'total_price', 'status', 'booking_time'
        ]
        read_only_fields = [
            'premise', 'start_time', 'end_time', 
            'total_price', 'status', 'booking_time',
            'display_date', 'display_time_range', 'display_duration'
        ]

    def get_display_date(self, obj):
        return localtime(obj.start_time).strftime('%Y-%m-%d')

    def get_display_time_range(self, obj):
        start = localtime(obj.start_time).strftime('%H:%M')
        end = localtime(obj.end_time).strftime('%H:%M')
        return f"{start} - {end}"

    def get_display_duration(self, obj):
        return f"{obj.duration} hour{'s' if obj.duration != 1 else ''}"

    def create(self, validated_data):
        # Only pass validated_data to create()
        return Booking.objects.create(**validated_data)
    
    def get_booking_time(self, obj):
        return localtime(obj.booking_time).strftime('%Y-%m-%d %H:%M:%S')