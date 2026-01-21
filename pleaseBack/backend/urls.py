from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/', include('premises.urls')),
    path('api/bookings/', include('bookings.urls')),
    path('api/', include('payments.urls')),
    path('api/mess/', include('mess.urls')),
    path('api/', include('reviews.urls')),
]

# Fallback for SPA (if static missing)
from django.views.generic import TemplateView
from django.urls import re_path

urlpatterns += [re_path(r'^.*$', TemplateView.as_view(template_name='index.html'))]
