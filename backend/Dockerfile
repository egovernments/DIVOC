FROM golang:1.15-alpine AS build_base

RUN  apk add make git gcc musl-dev
# Set the Current Working Directory inside the container
WORKDIR /tmp/divoc
COPY vaccination_api/go.mod ./vaccination_api/go.mod
COPY vaccination_api/go.sum ./vaccination_api/go.sum
COPY kernel_library/go.mod ./kernel_library/go.mod
COPY kernel_library/go.sum ./kernel_library/go.sum
RUN cd vaccination_api && go mod download
COPY vaccination_api/Makefile ./vaccination_api/Makefile
RUN cd vaccination_api && make deps
COPY . .
RUN cd vaccination_api && GOFLAGS=" -tags=musl" SPEC_FILE="../interfaces/vaccination-api.yaml" make all
# Start fresh from a smaller image
FROM alpine:3.9
RUN apk add ca-certificates


COPY --from=build_base /tmp/divoc/vaccination_api/divoc-server /app/divoc-server
COPY vaccination_api/config /config

# This container exposes port 8080 to the outside world
EXPOSE 8000

# Run the binary program produced by `go install`
CMD ["/app/divoc-server", "--scheme", "http", "--port", "8000"]