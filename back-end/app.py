import time

import docker
import uvicorn
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from install_steps import veirfy_token,pull_image,delete_image,save_image
from metrics import IMAGE_DOWNLOADS_METRIC,IMAGE_FAILED_DOWNLOADS_METRIC
from traces import tracer, instrument_fastapi

app = FastAPI()
client = docker.from_env(timeout=650)
global current_time
global total_time
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instrument FastAPI for automatic tracing
instrument_fastapi(app)


@app.get("/install/image-tar")
async def install_image(image_name: str,token:str,background_tasks: BackgroundTasks,image_tag: str = ""):
    with tracer.start_as_current_span("process_download_request") as span:
        span.set_attributes({
            "image.name": image_name,
            "image.tag": image_tag or "latest"
        })

        try:
            veirfy_token(token, image_name, image_tag)
            image = pull_image(image_name, image_tag)
            saved_image = save_image(image, image_name, image_tag)
            background_tasks.add_task(delete_image, image_name, image_tag)
            headers = {'Content-Disposition': f'attachment; filename="{image_name}.tar"'}
            return StreamingResponse(saved_image, headers=headers, media_type='application/x-tar')
        except:
            IMAGE_FAILED_DOWNLOADS_METRIC.labels(image_name=image_name, image_tag=image_tag).inc()
            raise HTTPException(status_code=500, detail="Internal Server Error")
        finally:
            IMAGE_DOWNLOADS_METRIC.labels(image_name=image_name, image_tag=image_tag).inc()




uvicorn.run(app, port=8080,host="0.0.0.0")
