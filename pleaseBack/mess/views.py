from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import ContactMessage
import json

@csrf_exempt
def contact_submit(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            ContactMessage.objects.create(
                name=data['name'],
                email=data['email'],
                message=data['message']
            )
            return JsonResponse({'status': 'success'})
        except:
            return JsonResponse({'status': 'error'}, status=400)
    return JsonResponse({'status': 'method not allowed'}, status=405)