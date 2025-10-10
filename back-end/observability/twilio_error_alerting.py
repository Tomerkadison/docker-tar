import json

from twilio.rest import Client

from config import config

twilio_client = Client(config.twilio.account_sid, config.twilio.auth_token)

def send_error_message(image_name:str,image_tag:str,token:str,architecture:str,exception: Exception):

    print(json.dumps({"image_name": image_name, "image_tag": image_tag, "token": token,
                                      "architecture": architecture, "exception": str(exception)}))
    twilio_client.messages.create(
        from_=config.twilio.from_number,
    content_sid=config.twilio.content_sid,
        content_variables=f'{{"image_name": "{image_name}", "image_tag": "{image_tag}", "token": "{token}", "architecture": "{architecture}", "exception": "{str(exception)}"}}',
        to=config.twilio.to_number
    )