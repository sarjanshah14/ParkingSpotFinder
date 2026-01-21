from django.http import HttpResponse
from django.conf import settings
import os
import logging

logger = logging.getLogger(__name__)

import mimetypes

def serve_react_app(request):
    """
    Serve the React app. First checks if requested path exists as a file,
    otherwise falls back to index.html for SPA routing.
    """
    try:
        # Get the path relative to the root
        path = request.path.lstrip('/')
        
        # Base directory where frontend files are copied
        frontend_dir = os.path.join(settings.BASE_DIR, 'frontend_build')
        
        # Check if the requested path is a file in the frontend_build folder
        if path:
            requested_file = os.path.join(frontend_dir, path)
            if os.path.isfile(requested_file):
                content_type, _ = mimetypes.guess_type(requested_file)
                with open(requested_file, 'rb') as f:
                    return HttpResponse(f.read(), content_type=content_type)
        
        # Fallback to index.html
        index_path = os.path.join(frontend_dir, 'index.html')
        if os.path.exists(index_path):
            with open(index_path, 'r', encoding='utf-8') as f:
                return HttpResponse(f.read(), content_type='text/html')
        else:
            logger.error(f"index.html not found at {index_path}")
            return HttpResponse(
                f"<h1>Frontend not built</h1><p>index.html not found at {index_path}</p>",
                status=500
            )
    except Exception as e:
        logger.exception("Error serving React app")
        return HttpResponse(f"<h1>Error</h1><p>{str(e)}</p>", status=500)
