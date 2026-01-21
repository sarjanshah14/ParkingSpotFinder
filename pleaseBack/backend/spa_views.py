from django.http import HttpResponse
from django.conf import settings
import os
import logging

logger = logging.getLogger(__name__)

def serve_react_app(request):
    """
    Serve the React app's index.html for all non-API routes.
    This enables client-side routing with React Router.
    """
    try:
        # Try to find index.html in frontend_build
        index_path = os.path.join(settings.BASE_DIR, 'frontend_build', 'index.html')
        
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
