import requests
import json

url = "https://parking-backend-pypn.onrender.com/api/create-checkout-session/"

payload = {
    "plan_id": "basic",
    "billing_period": "month",
    "customer_email": "shahsarjan968@gmail.com"
}

headers = {
    "Content-Type": "application/json"
}

print(f"Sending POST to {url}")
print(f"Payload: {json.dumps(payload, indent=2)}")

try:
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    print("Response Body:")
    print(response.text)
except Exception as e:
    print(f"Error: {e}")
