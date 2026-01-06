from rest_framework import serializers
from .models import Premise

class PremiseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Premise
        fields = '__all__'
