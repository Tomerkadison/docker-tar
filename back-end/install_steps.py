import requests
from docker.constants import DEFAULT_DATA_CHUNK_SIZE
from docker.models.images import Image
from fastapi import HTTPException

from config import config
from docker_client import client
from traces import start_span_with_image_artibutes,trace


@start_span_with_image_artibutes("verifying_token")
def veirfy_token(token: str, **trace_kwargs):
    if token == config.turnstile.skip_verify_token:
        print("Skipping verification ...")
        span = trace.get_current_span()
        span.set_attributes({"test":"True"})
        return
    print("verifying token...")
    try:
        data = {
            'secret': config.turnstile.secret_token,
            'response': token
        }
        response = requests.post(config.turnstile.verify_url, data=data, timeout=10)
        response.raise_for_status()
        if not response.json()['success']:
            raise HTTPException(detail="Failed Turnstile Validation", status_code=403)
        print("Turnstile validation passed!")
    except requests.RequestException as e:
        raise HTTPException(detail="Failed Turnstile Request", status_code=500)


@start_span_with_image_artibutes("pulling_image")
def pull_image(image_name: str, image_tag: str, architecture: str = "linux/amd64", **trace_kwargs) -> Image:
    # If architecture is linux/amd64, use default pull (no platform parameter)
    if architecture == "linux/amd64":
        image = client.images.pull(image_name, tag=image_tag)
    else:
        # For non-amd64 architectures, specify the platform
        image = client.images.pull(image_name, tag=image_tag, platform=architecture)

    if not image:
        raise HTTPException(status_code=500, detail="Failed to pull image")
    return image


@start_span_with_image_artibutes("saving_image")
def save_image(image: Image, **trace_kwargs):
    return image.save(named=True, chunk_size=DEFAULT_DATA_CHUNK_SIZE)


# @start_span_with_image_artibutes("deleting_image")
def delete_image(image_name: str, image_tag: str, **trace_kwargs):
    client.images.remove(f"{image_name}:{image_tag}")
