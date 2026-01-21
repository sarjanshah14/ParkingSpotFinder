from django.http import JsonResponse
from django.conf import settings
import os

def debug_files(request):
    """Debug endpoint to check if frontend files exist"""
    base_dir = settings.BASE_DIR
    frontend_build = os.path.join(base_dir, 'frontend_build')
    index_path = os.path.join(frontend_build, 'index.html')
    
    return JsonResponse({
        'BASE_DIR': str(base_dir),
        'frontend_build_exists': os.path.exists(frontend_build),
        'frontend_build_path': frontend_build,
        'index_html_exists': os.path.exists(index_path),
        'index_html_path': index_path,
        'frontend_build_contents': os.listdir(frontend_build) if os.path.exists(frontend_build) else 'Directory does not exist',
    })
