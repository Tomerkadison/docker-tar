from docker_client import client
import requests
from docker.models.images import Image
from fastapi import HTTPException   
from docker.constants import DEFAULT_DATA_CHUNK_SIZE
from metrics import VERIFYING_TIME_METRIC,SAVING_TIME_METRIC,PULLING_TIME_METRIC,DELETING_TIME_METRIC

@VERIFYING_TIME_METRIC.time()
def veirfy_token(token: str):
    print("verifing token...")
    try:
        data = data = {
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

@PULLING_TIME_METRIC.time()
def pull_image(image_name:str, image_tag:str) -> Image:
    image = client.images.pull(image_name, tag=image_tag)
    if not image:
        raise HTTPException(status_code=500, detail="Failed to pull image")
    return image

@SAVING_TIME_METRIC.time()
def save_image(image: Image):
    return image.save(named=True, chunk_size=DEFAULT_DATA_CHUNK_SIZE)   

@DELETING_TIME_METRIC.time()
def delete_image(image_name: str, image_tag: str):
    client.images.remove(f"{image_name}:{image_tag}")
