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
    path('debug-files/', __import__('backend.debug_views', fromlist=['debug_files']).debug_files),
]

# Fallback for SPA - serve React app for all non-API routes
from django.urls import re_path
from backend.spa_views import serve_react_app

urlpatterns += [re_path(r'^.*$', serve_react_app)]
