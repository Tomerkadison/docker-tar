from docker_client import client
import requests
from docker.models.images import Image
from fastapi import HTTPException
from docker.constants import DEFAULT_DATA_CHUNK_SIZE
from metrics import VERIFYING_TIME_METRIC,SAVING_TIME_METRIC,PULLING_TIME_METRIC,DELETING_TIME_METRIC
from traces import tracer

@tracer.start_as_current_span("user_verification")
def veirfy_token(token: str, image_name: str = "unknown", image_tag: str = "unknown"):
    print("verifing token...")
    with VERIFYING_TIME_METRIC.labels(image_name=image_name, image_tag=image_tag).time():
        try:
            data = {
                'secret': "0x4AAAAAAB02nEkMAzN8uvVfayPGx5RPwyc",
                'response': token
            }
            response = requests.post("https://challenges.cloudflare.com/turnstile/v0/siteverify", data=data, timeout=10)
            response.raise_for_status()
            if not response.json()['success']:
                raise HTTPException(detail="Failed Turnstile Validation",status_code=403)
            print("Turnstile validation passed!")
        except requests.RequestException as e:
            raise HTTPException(detail="Failed Turnstile Request",status_code=500)

@tracer.start_as_current_span("pull_docker_image")
def pull_image(image_name:str, image_tag:str) -> Image:
    with PULLING_TIME_METRIC.labels(image_name=image_name, image_tag=image_tag).time():
        image = client.images.pull(image_name, tag=image_tag)
        if not image:
            raise HTTPException(status_code=500, detail="Failed to pull image")
        return image

@tracer.start_as_current_span("save_image_tar")
def save_image(image: Image, image_name: str, image_tag: str):
    with SAVING_TIME_METRIC.labels(image_name=image_name, image_tag=image_tag).time():
        return image.save(named=True, chunk_size=DEFAULT_DATA_CHUNK_SIZE)   

@tracer.start_as_current_span("cleanup_image")
def delete_image(image_name: str, image_tag: str):
    with DELETING_TIME_METRIC.labels(image_name=image_name, image_tag=image_tag).time():
        client.images.remove(f"{image_name}:{image_tag}")
