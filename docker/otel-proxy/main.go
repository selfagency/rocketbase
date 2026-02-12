package main

import (
	"context"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strings"
	"time"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.21.0"
	"go.opentelemetry.io/otel/trace"
)

func initTracer(ctx context.Context, collectorURL string, serviceName string) (*sdktrace.TracerProvider, error) {
	var exporter sdktrace.SpanExporter
	var err error
	if collectorURL != "" {
		// otlptracehttp.WithEndpoint expects host:port (no scheme). Accept
		// collector URLs with or without scheme and normalize.
		endpoint := collectorURL
		insecure := false
		if strings.HasPrefix(endpoint, "http://") {
			endpoint = strings.TrimPrefix(endpoint, "http://")
			insecure = true
		} else if strings.HasPrefix(endpoint, "https://") {
			endpoint = strings.TrimPrefix(endpoint, "https://")
			insecure = false
		}
		if insecure {
			exporter, err = otlptracehttp.New(ctx, otlptracehttp.WithEndpoint(endpoint), otlptracehttp.WithInsecure())
		} else {
			exporter, err = otlptracehttp.New(ctx, otlptracehttp.WithEndpoint(endpoint))
		}
	} else {
		exporter, err = otlptracehttp.New(ctx)
	}
	if err != nil {
		return nil, err
	}

	res, _ := resource.New(ctx,
		resource.WithAttributes(
			semconv.ServiceNameKey.String(serviceName),
		),
	)

	tp := sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(exporter),
		sdktrace.WithResource(res),
	)
	otel.SetTracerProvider(tp)
	return tp, nil
}

// tracedTransport wraps a RoundTripper and creates a span for each proxied request.
type tracedTransport struct {
	base   http.RoundTripper
	tracer trace.Tracer
}

func (t *tracedTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	ctx := req.Context()
	ctx, span := t.tracer.Start(ctx, "proxy.request")
	span.SetAttributes(
		semconv.HTTPMethodKey.String(req.Method),
		semconv.HTTPTargetKey.String(req.URL.Path),
	)
	defer span.End()

	req = req.WithContext(ctx)
	resp, err := t.base.RoundTrip(req)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())
		return nil, err
	}
	span.SetAttributes(semconv.HTTPStatusCodeKey.Int(resp.StatusCode))
	return resp, nil
}

func main() {
	upstream := os.Getenv("UPSTREAM_URL")
	if upstream == "" {
		log.Fatal("UPSTREAM_URL is required, e.g. http://pocketbase:8090")
	}
	collector := os.Getenv("OTEL_COLLECTOR_ENDPOINT") // e.g. collector:4318
	serviceName := os.Getenv("OTEL_SERVICE_NAME")
	if serviceName == "" {
		serviceName = "otel-proxy"
	}

	ctx := context.Background()
	tp, err := initTracer(ctx, collector, serviceName)
	if err != nil {
		log.Fatalf("failed to init tracer: %v", err)
	}
	defer func() {
		_ = tp.Shutdown(ctx)
	}()

	upstreamURL, err := url.Parse(upstream)
	if err != nil {
		log.Fatalf("invalid UPSTREAM_URL: %v", err)
	}

	proxy := httputil.NewSingleHostReverseProxy(upstreamURL)

	tracer := otel.Tracer("otel-proxy")

	// Wrap the transport to create a span for each proxied request
	baseTransport := &http.Transport{
		Proxy: http.ProxyFromEnvironment,
	}

	proxy.Transport = &tracedTransport{base: baseTransport, tracer: tracer}

	srv := &http.Server{
		Addr:         ":8080",
		Handler:      proxy,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 60 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	log.Printf("starting otel-proxy forwarding to %s (service=%s)", upstream, serviceName)
	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("server error: %v", err)
	}
}
