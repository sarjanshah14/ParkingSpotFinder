from django.contrib import admin
from .models import Premise

@admin.register(Premise)
class PremiseAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'location', 'latitude', 'longitude', 'price', 'available', 'total', 'rating')
    search_fields = ('name', 'location')
    list_filter = ('rating',)
