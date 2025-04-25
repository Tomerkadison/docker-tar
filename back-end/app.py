import time

import docker
import uvicorn
from docker.constants import DEFAULT_DATA_CHUNK_SIZE
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

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


def delete_image(image_name: str, image_tag: str):
    global current_time
    global total_time
    print("returning image: ", time.time() - current_time)
    print("total: ", time.time() - total_time)
    start = time.time()
    print(client.images.get(f"{image_name}:{image_tag}"))
    client.images.remove(f"{image_name}:{image_tag}")
    print("deleting: ", time.time() - start)


@app.get("/install/image-tar")
async def install_image(image_name: str, background_tasks: BackgroundTasks, image_tag: str = "latest"):
    print("starting download: ", image_name,":",image_tag)
    background_tasks.add_task(delete_image, image_name, image_tag)
    start = time.time()
    global total_time
    total_time = time.time()
    image = client.images.pull(image_name, tag=image_tag)
    print("pulling: ", time.time() - start)
    if not image:
        raise HTTPException(status_code=500, detail="Failed to pull image")
    start = time.time()
    headers = {'Content-Disposition': f'attachment; filename="{image_name}.tar"'}
    saved_image = image.save(named=True, chunk_size=DEFAULT_DATA_CHUNK_SIZE)
    print("saving: ", time.time() - start)
    global current_time
    current_time = time.time()
    return StreamingResponse(saved_image, headers=headers, media_type='application/x-tar')


uvicorn.run(app, port=8080,host="0.0.0.0")