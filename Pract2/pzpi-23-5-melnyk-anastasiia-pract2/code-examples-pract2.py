import os
import requests
import json

def send_whatsapp_text(phone_number, text_message):
    access_token = os.environ.get("WHATSAPP_ACCESS_TOKEN")
    phone_number_id = os.environ.get("WHATSAPP_PHONE_NUMBER_ID")
    
    url = f"https://graph.facebook.com/v17.0/{phone_number_id}/messages"
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "messaging_product": "whatsapp",
        "to": phone_number,
        "type": "text",
        "text": {
            "body": text_message
        }
    }
    
    try:
        response = requests.post(url, headers=headers, data=json.dumps(payload))
        response.raise_for_status()
        print(f"Повідомлення успішно надіслано: {response.json()}")
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Помилка при відправці: {e}")
        if response.text:
            print(f"Деталі помилки API: {response.text}")
        return None



def send_lead_template(phone_number, template_name, dynamic_name):
    access_token = os.environ.get("WHATSAPP_ACCESS_TOKEN")
    phone_number_id = os.environ.get("WHATSAPP_PHONE_NUMBER_ID")
    
    url = f"https://graph.facebook.com/v17.0/{phone_number_id}/messages"
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": phone_number,
        "type": "template",
        "template": {
            "name": template_name,
            "language": {
                "code": "en_US"
            },
            "components": [
                {
                    "type": "body",
                    "parameters": [
                        {
                            "type": "text",
                            "text": dynamic_name 
                        }
                    ]
                }
            ]
        }
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        print("Шаблонне повідомлення успішно надіслано.")
        return True
    except requests.exceptions.RequestException as e:
        print(f"Помилка інтеграції: {e}")
        return False

# Приклад виклику
# send_lead_template("380991234567", "intro_outreach_v1", "Олександре")