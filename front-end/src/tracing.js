import { trace } from '@opentelemetry/api';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { registerInstrumentations } from '@opentelemetry/instrumentation';

// Get Grafana Cloud configuration from environment variables or use defaults
const GRAFANA_TEMPO_ENDPOINT = process.env.REACT_APP_GRAFANA_TEMPO_ENDPOINT || 'https://tempo-us-central1.grafana.net/otlp/v1/traces';
const GRAFANA_AUTH_HEADER = process.env.REACT_APP_GRAFANA_AUTH_HEADER || '';

// Configure the tracer provider
const provider = new WebTracerProvider();

// Configure OTLP exporter for Grafana Cloud Tempo
let exporter;
if (GRAFANA_AUTH_HEADER) {
    exporter = new OTLPTraceExporter({
        url: GRAFANA_TEMPO_ENDPOINT,
        headers: {
            'Authorization': GRAFANA_AUTH_HEADER
        }
    });
} else {
    // Fallback to console exporter for development
    const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-base');
    exporter = new ConsoleSpanExporter();
}

// Add the exporter to the tracer provider
provider.addSpanProcessor(new BatchSpanProcessor(exporter));

// Register the provider globally
provider.register({
    contextManager: new ZoneContextManager(),
});

// Register automatic instrumentations
registerInstrumentations({
    instrumentations: [
        new DocumentLoadInstrumentation(),
    ],
});

// Create and export a tracer instance for the application
export const tracer = trace.getTracer('docker-tar-frontend');

// Initialize tracing
export const initializeTracing = () => {
    console.log('OpenTelemetry tracing initialized for frontend');
};