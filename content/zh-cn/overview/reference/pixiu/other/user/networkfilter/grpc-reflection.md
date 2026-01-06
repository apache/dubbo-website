---
aliases:
  - /zh/docs3-v2/dubbo-go-pixiu/user/networkfilter/grpc-reflection/
  - /zh-cn/docs3-v2/dubbo-go-pixiu/user/networkfilter/grpc-reflection/
description: Pixiu 中的 gRPC Server Reflection 支持
linkTitle: gRPC Server Reflection
title: gRPC Server Reflection 支持
type: docs
weight: 21
---

# gRPC Server Reflection 支持

> [实现参考](https://github.com/apache/dubbo-go-pixiu/pull/849)

gRPC Proxy 过滤器（`dgp.filter.grpc.proxy`）现已支持 **gRPC Server Reflection**，使得网关能够在不需要预编译 proto 文件的情况下动态解析和检查消息内容。

## 概述

gRPC Server Reflection 是一项允许 Pixiu 网关在运行时动态发现和解码 gRPC 服务定义的功能。这消除了在网关配置中维护 proto 文件的需要。

### 核心特性

- **三种反射模式**: 透传、反射和混合模式
- **动态消息解码**: 在运行时解析消息，无需 proto 文件
- **基于 TTL 的缓存**: 高效的描述符缓存，自动清理过期条目
- **协议检测**: 同时支持 gRPC 和 Triple 协议
- **优雅降级**: 混合模式提供自动回退到透传模式

## 反射模式

### 透传模式（Passthrough，默认）

执行透明的二进制代理，不解码消息。

**使用场景:**
- 不需要消息检查的高吞吐场景
- 仅基于服务/方法名称的简单路由

**配置:**
```yaml
grpc_filters:
  - name: dgp.filter.grpc.proxy
    config:
      reflection_mode: "passthrough"  # 或省略（默认值）
```

### 反射模式（Reflection）

使用 gRPC Server Reflection API 动态解码和检查消息内容。

**使用场景:**
- 基于内容的路由（根据消息字段路由）
- 字段级别的过滤或转换
- 完整消息检查的日志记录和调试

**配置:**
```yaml
grpc_filters:
  - name: dgp.filter.grpc.proxy
    config:
      reflection_mode: "reflection"
      descriptor_cache_ttl: 300  # 5分钟缓存
```

### 混合模式（Hybrid）

先尝试反射，失败时回退到透传模式。

**使用场景:**
- 反射支持程度不一的混合环境
- 迁移场景（逐步启用反射）
- 需要高可用的生产环境

**配置:**
```yaml
grpc_filters:
  - name: dgp.filter.grpc.proxy
    config:
      reflection_mode: "hybrid"
      reflection_timeout: 5s
```

## 完整配置示例

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
                    # 反射模式（默认: "passthrough"）
                    reflection_mode: "reflection"

                    # 方法描述符缓存 TTL（秒）
                    descriptor_cache_ttl: 300

                    # 启用 Triple 协议检测
                    enable_protocol_detection: true

                    # 混合模式的反射超时
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

## 配置字段

| 字段 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `reflection_mode` | string | `"passthrough"` | 反射模式: `"passthrough"`、`"reflection"` 或 `"hybrid"` |
| `descriptor_cache_ttl` | int | `300` | 方法描述符缓存 TTL（秒） |
| `enable_protocol_detection` | bool | `false` | 启用 Triple 协议检测 |
| `reflection_timeout` | string | `"5s"` | 混合模式下等待反射的最大时间 |
| `enable_tls` | bool | `false` | 启用后端连接的 TLS |
| `tls_cert_file` | string | `""` | TLS 证书文件路径 |
| `tls_key_file` | string | `""` | TLS 密钥文件路径 |
| `keepalive_time` | string | `"300s"` | 后端连接的保活时间 |
| `keepalive_timeout` | string | `"5s"` | 保活超时时间 |
| `connect_timeout` | string | `"5s"` | 连接超时时间 |
| `max_concurrent_streams` | uint32 | `0`（无限制） | 最大并发流数 |

## 启用服务器反射

要使用 `reflection` 或 `hybrid` 模式，你的后端 gRPC 服务器必须启用 Server Reflection。

### Go (gRPC-Go)

```go
import (
    "google.golang.org/grpc"
    "google.golang.org/grpc/reflection"
)

func main() {
    server := grpc.NewServer()

    // 注册你的服务
    echo.RegisterEchoServiceServer(server, &echoServer{})

    // 启用服务器反射
    reflection.Register(server)

    // 启动服务器
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
            // 启用服务器反射
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
    # ... 实现 ...

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    echo_pb2_grpc.add_EchoServiceServicer_to_server(EchoService(), server)

    # 启用服务器反射
    reflection.enable_server_reflection(
        service_names=[echo.DESCRIPTOR.services_by_name['EchoService'].full_name,
                       reflection.SERVICE_NAME],
        server=server
    )

    server.add_insecure_port('[::]:50051')
    server.start()
    server.wait_for_termination()
```

## 模式对比

| 特性 | 透传模式 | 反射模式 | 混合模式 |
|------|---------|---------|---------|
| **性能** | 最佳 | 良好 | 更好 |
| **消息检查** | 否 | 是 | 是（可用时） |
| **需要反射** | 否 | 是 | 可选 |
| **回退支持** | N/A | 否 | 是 |

## 描述符缓存

反射模式使用基于 TTL 的缓存来存储从后端服务器获取的方法描述符。

**推荐的 TTL 值:**
- 开发环境: `60`（1分钟）
- 测试环境: `300`（5分钟）
- 生产环境: `1800`（30分钟）

## Triple 协议检测

Pixiu 支持 **Dubbo Triple 协议**，这是 Apache Dubbo 社区开发的 gRPC 兼容协议。

**启用协议检测:**
```yaml
grpc_filters:
  - name: dgp.filter.grpc.proxy
    config:
      enable_protocol_detection: true
```

## 故障排除

### 问题: 反射模式返回 "service not found"

**原因**: 后端服务器未启用 Server Reflection。

**解决方案**: 在服务器上启用反射：
```go
reflection.Register(grpcServer)
```

### 问题: 混合模式回退到透传模式

**原因**: 反射超时或反射服务不可用。

**解决方案**:
1. 检查后端是否启用了反射
2. 增加 `reflection_timeout` 值
3. 检查网络连接

## 相关资源

- [Issue #821](https://github.com/apache/dubbo-go-pixiu/issues/821) - 原始功能请求
- [PR #849](https://github.com/apache/dubbo-go-pixiu/pull/849) - 实现详情
- [示例代码](https://github.com/apache/dubbo-go-pixiu-samples/tree/master/grpc/reflection) - 完整的示例代码
- [gRPC Server Reflection Protocol](https://github.com/grpc/grpc/blob/master/doc/server-reflection.md) - 官方规范
