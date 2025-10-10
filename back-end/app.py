import uvicorn
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from install_steps import veirfy_token, pull_image, delete_image, save_image
from observability.metrics import IMAGE_DOWNLOADS_METRIC, IMAGE_FAILED_DOWNLOADS_METRIC, IMAGE_SUCCESS_DOWNLOADS_METRIC, \
    DOWNLOAD_BYTES_PER_SECOND, metrics_router
from observability.traces import trace, start_root_span, start_response_span, active_response_spans, active_root_spans
from observability.twilio_error_alerting import send_error_message

app = FastAPI()
app.include_router(metrics_router)
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/install/image-tar")
async def install_image(image_name: str, token: str, background_tasks: BackgroundTasks, image_tag: str = "", architecture: str = "linux/amd64"):
    root_span = start_root_span(image_name, image_tag, token)
    try:
        veirfy_token(token, image_name=image_name, image_tag=image_tag, root_span=root_span)
        image = pull_image(image_name=image_name, image_tag=image_tag, architecture=architecture, root_span=root_span)
        saved_image = save_image(image, image_name=image_name, image_tag=image_tag, root_span=root_span)
        background_tasks.add_task(delete_image, image_name=image_name, image_tag=image_tag, root_span=root_span)
        headers = {'Content-Disposition': f'attachment; filename="{image_name}.tar"',
                   'trace-id': str(root_span.get_span_context().trace_id)}
        start_response_span(image_name, image_tag, token, root_span)
        return StreamingResponse(saved_image, headers=headers, media_type='application/x-tar')
    except Exception as e:
        IMAGE_FAILED_DOWNLOADS_METRIC.labels(image_name=image_name, image_tag=image_tag).inc()
        root_span.record_exception(e)
        root_span.set_status(trace.Status(trace.StatusCode.ERROR))
        root_span.end()
        send_error_message(image_name=image_name, image_tag=image_tag, token=token, architecture=architecture, exception=e)
        raise e
    finally:
        IMAGE_DOWNLOADS_METRIC.labels(image_name=image_name, image_tag=image_tag).inc()


@app.post("/success")
def end_trace(token: str, size: int):
    root_span = active_root_spans.pop(token, None)
    response_span = active_response_spans.pop(token, None)
    if root_span and response_span:
        response_span.set_status(trace.Status(trace.StatusCode.OK))
        root_span.set_status(trace.Status(trace.StatusCode.OK))
        response_span.end()
        root_span.end()

        image_name = root_span._attributes._dict.get("image.name")
        image_tag = root_span._attributes._dict.get("image.tag")
        IMAGE_SUCCESS_DOWNLOADS_METRIC.labels(image_name=image_name, image_tag=image_tag).inc()

        duration_in_seconds = (root_span._end_time - root_span._start_time) / 1_000_000_000
        DOWNLOAD_BYTES_PER_SECOND.set(size / duration_in_seconds)

        return f"reported success for token '{token}'"
    raise HTTPException(status_code=500, detail="No active trace found")


uvicorn.run(app, port=8080, host="0.0.0.0")
