import { registerOTel } from "@vercel/otel";

/**
 * OpenTelemetry instrumentation entrypoint. Next.js calls `register()` once at
 * server startup (Node.js and Edge runtimes).
 *
 * `@vercel/otel` wires up the OTel SDK and auto-instruments Next.js. It is
 * vendor-neutral: traces are exported over OTLP, so point it at any backend
 * (Grafana Tempo, Honeycomb, Dash0, Jaeger, SigNoz, Vercel, …) via standard
 * OTEL_* env vars:
 *
 *   OTEL_EXPORTER_OTLP_ENDPOINT   e.g. https://otlp.your-backend.io
 *   OTEL_EXPORTER_OTLP_HEADERS    e.g. "authorization=Bearer <token>"
 *
 * On Vercel, traces also surface in the dashboard automatically with no config.
 */
export function register() {
  registerOTel({
    serviceName: process.env.OTEL_SERVICE_NAME ?? "ai-builder-template",
  });
}
