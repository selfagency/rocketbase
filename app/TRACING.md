# Tracing (OpenTelemetry -> Zipkin)

This project includes optional server-side OpenTelemetry tracing for SvelteKit (experimental). Tracing is disabled by default.

Quick start (dev)

1. Start dev services (includes Zipkin):

```bash
# from repo root
docker-compose -f docker-compose.dev.yml up -d
```

1. Install tracing packages (one-time):

```bash
cd app
pnpm add -D @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node @opentelemetry/exporter-zipkin import-in-the-middle
```

1. Enable tracing and start dev server:

```bash
cd app
# quick: use convenience script
pnpm run dev:trace
# or set env explicitly
ENABLE_TRACING=1 ZIPKIN_URL=http://localhost:9411/api/v2/spans SERVICE_NAME=rocketbase-app pnpm run dev
```

1. Open Zipkin UI: <http://localhost:9411> and search for the service name (`rocketbase-app` by default).

Notes

- The instrumentation initializer is `src/instrumentation.server.ts`. It will only import OpenTelemetry modules when `ENABLE_TRACING=1` to avoid requiring those packages unless enabled.
- SvelteKit must have the experimental flags enabled (already configured in `svelte.config.js`): `kit.experimental.tracing.server` and `kit.experimental.instrumentation.server`.
- For production or CI, consider using an OTLP collector instead of sending directly to Zipkin.

Troubleshooting

- If you see module not found errors, ensure the tracing packages are installed in `app`.
- If no traces appear, verify `ENABLE_TRACING=1` and that Zipkin is reachable at `ZIPKIN_URL`.
