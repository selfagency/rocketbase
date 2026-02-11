FROM golang:1.24 AS builder
WORKDIR /src
COPY . .
RUN go env -w GOPROXY=https://proxy.golang.org && \
	go get go.opentelemetry.io/contrib@latest go.opentelemetry.io/otel@latest && \
	go mod tidy
RUN CGO_ENABLED=0 go build -o /bin/otel-proxy ./main.go

FROM alpine:3.18
RUN apk add --no-cache ca-certificates
COPY --from=builder /bin/otel-proxy /usr/local/bin/otel-proxy
EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/otel-proxy"]
