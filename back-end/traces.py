import os
from functools import wraps

from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.trace import Span
from cachetools import TTLCache

active_root_spans : dict[str,Span] = TTLCache(maxsize=10000,ttl=1800)
active_response_spans : dict[str,Span] = TTLCache(maxsize=10000,ttl=1800)

resource = Resource.create({"service.name": "docker-tar-backend"})
trace.set_tracer_provider(TracerProvider(resource=resource))
GRAFANA_TEMPO_ENDPOINT = os.getenv('GRAFANA_TEMPO_ENDPOINT', 'https://tempo-prod-15-prod-us-west-0.grafana.net/tempo')
GRAFANA_API_KEY = os.getenv('GRAFANA_API_KEY',
                            'glc_eyJvIjoiMTUzNjQ1NiIsIm4iOiJ0ZW1wby10ZW1wbyIsImsiOiJIMjQ3NE85MkxzUnpROTdTN3pjSzBYbVoiLCJtIjp7InIiOiJ1cyJ9fQ==')
GRAFANA_USER_ID = os.getenv('GRAFANA_USER_ID', '1330532')  # Your Grafana user ID

# Configure OTLP exporter for Grafana Cloud Tempo
if GRAFANA_API_KEY:
    import base64

    # Format: Basic base64(userid:api_key)
    auth_string = f"{GRAFANA_USER_ID}:{GRAFANA_API_KEY}"
    auth_bytes = auth_string.encode('ascii')
    auth_b64 = base64.b64encode(auth_bytes).decode('ascii')

    otlp_exporter = OTLPSpanExporter(
        endpoint=GRAFANA_TEMPO_ENDPOINT,
        headers={
            "authorization": f"Basic {auth_b64}"
        }
    )
else:
    from opentelemetry.sdk.trace.export import ConsoleSpanExporter

    otlp_exporter = ConsoleSpanExporter()

trace.get_tracer_provider().add_span_processor(
    BatchSpanProcessor(otlp_exporter)
)

tracer = trace.get_tracer("docker-tar-backend")


def instrument_fastapi(app):
    from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
    FastAPIInstrumentor.instrument_app(app)


def start_response_span(image_name: str, image_tag: str, token: str, root_span: Span):
    span = tracer.start_span("response_sending", context=trace.set_span_in_context(root_span))
    span.set_attributes({
        "image.name": image_name,
        "image.tag": image_tag
    })
    active_response_spans[token] = span
    return span


def start_root_span(image_name: str, image_tag: str, token: str):
    span = tracer.start_span("download_image")
    span.set_attributes({
        "image.name": image_name,
        "image.tag": image_tag
    })
    active_root_spans[token] = span
    return span


def start_span_with_image_artibutes(span_name: str, **kw):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            with tracer.start_as_current_span(span_name, context=trace.set_span_in_context(kwargs['root_span']),
                                              **kw) as span:
                span.set_attributes({
                    "image.name": kwargs['image_name'],
                    "image.tag": kwargs['image_tag']
                })
                return func(*args, **kwargs)

        return wrapper

    return decorator
