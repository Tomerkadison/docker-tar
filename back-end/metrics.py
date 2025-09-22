from prometheus_client import start_http_server, Gauge,Counter

IMAGE_DOWNLOADS_METRIC = Counter('image_downloads', 'Number of image downloads',['image_name','image_tag'])
IMAGE_FAILED_DOWNLOADS_METRIC = Counter('image_failed_downloads', 'Number of failed image downloads (got exception)',['image_name','image_tag'])
IMAGE_SUCCESS_DOWNLOADS_METRIC = Counter('image_success_downloads', 'Number of success image downloads (got ack from client)',['image_name','image_tag'])
DOWNLOAD_BYTES_PER_SECOND = Gauge('download_bytes_per_second','the size of the image / the time it took to download the image')

start_http_server(8000)