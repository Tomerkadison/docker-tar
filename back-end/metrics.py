from prometheus_client import start_http_server, Summary,Counter

VERIFYING_TIME_METRIC = Summary('verifying_time', 'Time spent verifying the token')
PULLING_TIME_METRIC = Summary('pulling_time', 'Time spent pulling the image')
SAVING_TIME_METRIC = Summary('saving_time', 'Time spent saving the pulled image')
DELETING_TIME_METRIC = Summary('deleting_time', 'Time spent deleting the image')

IMAGE_DOWNLOADS_METRIC = Counter('image_downloads', 'Number of image downloads',['image_name','image_tag'])
IMAGE_FAILED_DOWNLOADS_METRIC = Counter('image_failed_downloads', 'Number of failed image downloads (got exception)',['image_name','image_tag'])

start_http_server(8000)