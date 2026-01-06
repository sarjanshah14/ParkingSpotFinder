from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import Review
from .serializers import ReviewSerializer

class ReviewListCreate(generics.ListCreateAPIView):
    queryset = Review.objects.filter(approved=True)  # Only show approved reviews
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]  # Or adjust based on your needs

    def perform_create(self, serializer):
        # You might want to add additional logic here
        serializer.save()