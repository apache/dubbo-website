---
aliases:
  - /en/docs3-v2/dubbo-go-pixiu/user/networkfilter/grpc-reflection/
description: gRPC Server Reflection Support in Pixiu
linkTitle: gRPC Server Reflection
title: gRPC Server Reflection Support
type: docs
weight: 21
---

# gRPC Server Reflection Support

> [Implementation Reference](https://github.com/apache/dubbo-go-pixiu/pull/849)

The gRPC Proxy filter (`dgp.filter.grpc.proxy`) now supports **gRPC Server Reflection**, enabling dynamic message parsing and inspection at the gateway level without requiring pre-compiled proto files.

## Overview

gRPC Server Reflection is a feature that allows Pixiu gateway to dynamically discover and decode gRPC service definitions at runtime. This eliminates the need to maintain proto files in the gateway configuration.

### Key Features

- **Three Reflection Modes**: Passthrough, Reflection, and Hybrid
- **Dynamic Message Decoding**: Parse messages at runtime without proto files
- **TTL-based Caching**: Efficient descriptor caching with automatic cleanup
- **Protocol Detection**: Support for both gRPC and Triple protocols
- **Graceful Fallback**: Hybrid mode provides automatic passthrough fallback

## Reflection Modes

### Passthrough Mode (Default)

Performs transparent binary proxying without decoding messages.

**Use Cases:**
- High-performance scenarios where message inspection is not needed
- Simple routing based on service/method names only

**Configuration:**
```yaml
grpc_filters:
  - name: dgp.filter.grpc.proxy
    config:
      reflection_mode: "passthrough"  # or omit (default)
```

### Reflection Mode

Uses gRPC Server Reflection API to dynamically decode and inspect message contents.

**Use Cases:**
- Content-aware routing (route based on message fields)
- Field-level filtering or transformation
- Logging and debugging with full message inspection

**Configuration:**
```yaml
grpc_filters:
  - name: dgp.filter.grpc.proxy
    config:
      reflection_mode: "reflection"
      descriptor_cache_ttl: 300  # 5 minutes cache
```

### Hybrid Mode

Tries reflection first, falls back to passthrough on failure.

**Use Cases:**
- Mixed environments with varying reflection support
- Migration scenarios (gradually enabling reflection)
- Production environments requiring high availability

**Configuration:**
```yaml
grpc_filters:
  - name: dgp.filter.grpc.proxy
    config:
      reflection_mode: "hybrid"
      reflection_timeout: 5s
```

## Complete Configuration Example

```yaml
static_resources:
  listeners:
    - name: "grpc-gateway"
      protocol_type: "GRPC"
      address:
        socket_address:
          address: "0.0.0.0"
          port: 8882
      filter_chains:
        filters:
          - name: dgp.filter.network.grpcconnectionmanager
            config:
              route_config:
                routes:
                  - match:
                      prefix: "/echo.EchoService/"
                    route:
                      cluster: "echo-grpc"
              grpc_filters:
                - name: dgp.filter.grpc.proxy
                  config:
                    # Reflection mode (default: "passthrough")
                    reflection_mode: "reflection"

                    # Cache TTL for method descriptors (seconds)
                    descriptor_cache_ttl: 300

                    # Enable Triple protocol detection
                    enable_protocol_detection: true

                    # Reflection timeout for hybrid mode
                    reflection_timeout: 5s

  clusters:
    - name: "echo-grpc"
      lb_policy: "RoundRobin"
      endpoints:
        - socket_address:
            address: 127.0.0.1
            port: 50051
            protocol_type: "GRPC"
```

## Configuration Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `reflection_mode` | string | `"passthrough"` | Reflection mode: `"passthrough"`, `"reflection"`, or `"hybrid"` |
| `descriptor_cache_ttl` | int | `300` | Cache TTL for method descriptors in seconds |
| `enable_protocol_detection` | bool | `false` | Enable Triple protocol detection |
| `reflection_timeout` | string | `"5s"` | Max time to wait for reflection in hybrid mode |
| `enable_tls` | bool | `false` | Enable TLS for backend connections |
| `tls_cert_file` | string | `""` | Path to TLS certificate file |
| `tls_key_file` | string | `""` | Path to TLS key file |
| `keepalive_time` | string | `"300s"` | Keepalive time for backend connections |
| `keepalive_timeout` | string | `"5s"` | Keepalive timeout |
| `connect_timeout` | string | `"5s"` | Connection timeout |
| `max_concurrent_streams` | uint32 | `0` (unlimited) | Max concurrent streams |

## Enabling Server Reflection

To use `reflection` or `hybrid` modes, your backend gRPC server must have Server Reflection enabled.

### Go (gRPC-Go)

```go
import (
    "google.golang.org/grpc"
    "google.golang.org/grpc/reflection"
)

func main() {
    server := grpc.NewServer()

    // Register your service
    echo.RegisterEchoServiceServer(server, &echoServer{})

    // Enable server reflection
    reflection.Register(server)

    // Start server
    lis, _ := net.Listen("tcp", ":50051")
    server.Serve(lis)
}
```

### Java (gRPC-Java)

```java
import io.grpc.Server;
import io.grpc.ServerBuilder;
import io.grpc.reflection.v1alpha.ServerReflectionGrpc;

public class EchoServer {
    public static void main(String[] args) throws Exception {
        Server server = ServerBuilder
            .forPort(50051)
            .addService(new EchoServiceImpl())
            // Enable server reflection
            .addService(ServerReflectionGrpc.newInstance())
            .build()
            .start();

        server.awaitTermination();
    }
}
```

### Python (gRPC-Python)

```python
import grpc
from grpc_reflection.v1alpha import reflection
from concurrent import futures

class EchoService(echo_pb2_grpc.EchoServiceServicer):
    # ... implementation ...

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    echo_pb2_grpc.add_EchoServiceServicer_to_server(EchoService(), server)

    # Enable server reflection
    reflection.enable_server_reflection(
        service_names=[echo.DESCRIPTOR.services_by_name['EchoService'].full_name,
                       reflection.SERVICE_NAME],
        server=server
    )

    server.add_insecure_port('[::]:50051')
    server.start()
    server.wait_for_termination()
```

## Mode Comparison

| Feature | Passthrough | Reflection | Hybrid |
|---------|-------------|------------|--------|
| **Performance** | Best | Good | Better |
| **Message Inspection** | No | Yes | Yes (when available) |
| **Requires Reflection** | No | Yes | Optional |
| **Fallback** | N/A | No | Yes |

## Descriptor Cache

The reflection mode uses a TTL-based cache to store method descriptors retrieved from the backend server.

**Recommended TTL Values:**
- Development: `60` (1 minute)
- Testing: `300` (5 minutes)
- Production: `1800` (30 minutes)

## Triple Protocol Detection

Pixiu supports the **Dubbo Triple protocol**, a gRPC-compatible protocol developed by the Apache Dubbo community.

**Enable protocol detection:**
```yaml
grpc_filters:
  - name: dgp.filter.grpc.proxy
    config:
      enable_protocol_detection: true
```

## Troubleshooting

### Problem: Reflection mode returns "service not found"

**Cause**: Backend server does not have Server Reflection enabled.

**Solution**: Enable reflection on your server:
```go
reflection.Register(grpcServer)
```

### Problem: Hybrid mode falls back to passthrough

**Cause**: Reflection timeout exceeded or reflection service unavailable.

**Solution**:
1. Check if reflection is enabled on the backend
2. Increase `reflection_timeout` value
3. Check network connectivity

## Related Resources

- [Issue #821](https://github.com/apache/dubbo-go-pixiu/issues/821) - Original feature request
- [PR #849](https://github.com/apache/dubbo-go-pixiu/pull/849) - Implementation details
- [Sample Code](https://github.com/apache/dubbo-go-pixiu-samples/tree/master/grpc/reflection) - Complete working examples
- [gRPC Server Reflection Protocol](https://github.com/grpc/grpc/blob/master/doc/server-reflection.md) - Official specification
