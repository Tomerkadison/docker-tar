import os
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

# Configure the tracer provider
trace.set_tracer_provider(TracerProvider())

# Get Grafana Cloud configuration from environment variables
GRAFANA_TEMPO_ENDPOINT = os.getenv('GRAFANA_TEMPO_ENDPOINT', 'https://tempo-prod-15-prod-us-west-0.grafana.net/tempo')
GRAFANA_API_KEY = os.getenv('GRAFANA_API_KEY', 'glc_eyJvIjoiMTUzNjQ1NiIsIm4iOiJ0ZW1wby10ZW1wbyIsImsiOiJIMjQ3NE85MkxzUnpROTdTN3pjSzBYbVoiLCJtIjp7InIiOiJ1cyJ9fQ==')
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
    # Fallback to console exporter for development
    from opentelemetry.sdk.trace.export import ConsoleSpanExporter
    otlp_exporter = ConsoleSpanExporter()

# Add the exporter to the tracer provider
trace.get_tracer_provider().add_span_processor(
    BatchSpanProcessor(otlp_exporter)
)

# Create a tracer instance for the application
tracer = trace.get_tracer("docker-tar-backend")

def instrument_fastapi(app):
    """Instrument FastAPI application for automatic request tracing"""
    FastAPIInstrumentor.instrument_app(app)