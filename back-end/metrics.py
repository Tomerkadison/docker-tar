from fastapi import HTTPException, Depends
from fastapi import Request, APIRouter
from fastapi.responses import PlainTextResponse
from prometheus_client import Gauge, Counter
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST

from config import config

metrics_router = APIRouter()

IMAGE_DOWNLOADS_METRIC = Counter('image_downloads', 'Number of image downloads', ['image_name', 'image_tag'])
IMAGE_FAILED_DOWNLOADS_METRIC = Counter('image_failed_downloads', 'Number of failed image downloads (got exception)',
                                        ['image_name', 'image_tag'])
IMAGE_SUCCESS_DOWNLOADS_METRIC = Counter('image_success_downloads',
                                         'Number of success image downloads (got ack from client)',
                                         ['image_name', 'image_tag'])
DOWNLOAD_BYTES_PER_SECOND = Gauge('download_bytes_per_second',
                                  'the size of the image / the time it took to download the image')


def verify_token(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or auth_header != f"Bearer {config.metrics_route_token}":
        raise HTTPException(status_code=401, detail="Unauthorized")


@metrics_router.get("/metrics", response_class=PlainTextResponse)
def metrics(dep=Depends(verify_token)):
    return PlainTextResponse(generate_latest(), media_type=CONTENT_TYPE_LATEST)
