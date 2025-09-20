from prometheus_client import start_http_server, Gauge,Counter

VERIFYING_TIME_METRIC = Gauge('verifying_time', 'Time spent verifying the token', ['image_name', 'image_tag'])
PULLING_TIME_METRIC = Gauge('pulling_time', 'Time spent pulling the image', ['image_name', 'image_tag'])
SAVING_TIME_METRIC = Gauge('saving_time', 'Time spent saving the pulled image', ['image_name', 'image_tag'])
DELETING_TIME_METRIC = Gauge('deleting_time', 'Time spent deleting the image', ['image_name', 'image_tag'])

IMAGE_DOWNLOADS_METRIC = Counter('image_downloads', 'Number of image downloads',['image_name','image_tag'])
IMAGE_FAILED_DOWNLOADS_METRIC = Counter('image_failed_downloads', 'Number of failed image downloads (got exception)',['image_name','image_tag'])

start_http_server(8000)