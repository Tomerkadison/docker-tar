import requests
from docker.constants import DEFAULT_DATA_CHUNK_SIZE
from docker.models.images import Image
from fastapi import HTTPException

from docker_client import client
from traces import start_span_with_image_artibutes


@start_span_with_image_artibutes("verifying_token")
def veirfy_token(token: str, **trace_kwargs):
    print("verifing token...")
    try:
        data = {
            'secret': "0x4AAAAAAB02nEkMAzN8uvVfayPGx5RPwyc",
            'response': token
        }
        response = requests.post("https://challenges.cloudflare.com/turnstile/v0/siteverify", data=data, timeout=10)
        response.raise_for_status()
        if not response.json()['success']:
            raise HTTPException(detail="Failed Turnstile Validation", status_code=403)
        print("Turnstile validation passed!")
    except requests.RequestException as e:
        raise HTTPException(detail="Failed Turnstile Request", status_code=500)


@start_span_with_image_artibutes("pulling_image")
def pull_image(image_name: str, image_tag: str,**trace_kwargs) -> Image:
    image = client.images.pull(image_name, tag=image_tag)
    if not image:
        raise HTTPException(status_code=500, detail="Failed to pull image")
    return image


@start_span_with_image_artibutes("saving_image")
def save_image(image: Image,**trace_kwargs):
    return image.save(named=True, chunk_size=DEFAULT_DATA_CHUNK_SIZE)


#@start_span_with_image_artibutes("deleting_image")
def delete_image(image_name: str, image_tag: str,**trace_kwargs):
    client.images.remove(f"{image_name}:{image_tag}")
