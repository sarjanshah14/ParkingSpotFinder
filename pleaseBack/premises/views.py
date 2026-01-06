from rest_framework import generics
from .models import Premise
from .serializers import PremiseSerializer

class PremiseListView(generics.ListAPIView):
    queryset = Premise.objects.all()
    serializer_class = PremiseSerializer

class PremiseDetailView(generics.RetrieveAPIView):
    queryset = Premise.objects.all()
    serializer_class = PremiseSerializer

