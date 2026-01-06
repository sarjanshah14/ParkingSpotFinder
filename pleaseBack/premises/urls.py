from django.urls import path
from .views import PremiseListView, PremiseDetailView

urlpatterns = [
    path('premises/', PremiseListView.as_view(), name='premises-list'),
    path('premises/<int:pk>/', PremiseDetailView.as_view(), name='premise-detail'),
]
