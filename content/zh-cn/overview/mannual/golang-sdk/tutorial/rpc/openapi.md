---
description: "使用 Dubbo-go 内置的 OpenAPI 支持自动生成和暴露 OpenAPI 3.0 文档，通过 Swagger UI 和 ReDoc 进行 API 可视化管理。"
linkTitle: OpenAPI 文档
title: OpenAPI 文档生成与管理
type: docs
weight: 5
---

Dubbo-go 提供了内置的 OpenAPI 支持，可以自动为 Triple 协议服务生成符合 OpenAPI 3.0 规范的 API 文档，并通过 Swagger UI 和 ReDoc 提供 可视化的 API 浏览与调试界面。

## 功能概览

- **自动文档生成**：基于服务接口定义（protobuf IDL 或非 IDL 模式），自动生成 OpenAPI 3.0.1 规范的 API 文档
- **Swagger UI**：内置 Swagger UI 界面，支持在线浏览和调试 API
- **ReDoc**：内置 ReDoc 界面，提供美观的 API 文档展示
- **多格式输出**：支持 JSON 和 YAML 两种格式输出
- **分组管理**：支持按 OpenAPI Group 对服务进行分组，方便管理多个版本的 API 文档
- **静态文档生成**：通过 `protoc-gen-triple-openapi` 插件，在编译期从 `.proto` 文件生成静态 OpenAPI 文档

## 快速开始

### 1. 启用 OpenAPI

在创建 Server 时，通过 Triple 协议选项启用 OpenAPI：

```go
package main

import (
    "dubbo.apache.org/dubbo-go/v3/protocol"
    triple "dubbo.apache.org/dubbo-go/v3/protocol/triple"
    "dubbo.apache.org/dubbo-go/v3/server"
)

func main() {
    srv, err := server.NewServer(
        server.WithServerProtocol(
            protocol.WithTriple(
                triple.WithOpenAPI(
                    triple.OpenAPIEnable(),
                ),
            ),
            protocol.WithPort(20000),
        ),
    )
    if err != nil {
        panic(err)
    }
    // 注册服务...
    srv.Serve()
}
```

启动服务后，即可通过以下地址访问 OpenAPI 文档：

| 端点 | 说明 |
|------|------|
| `http://localhost:20000/dubbo/openapi/swagger-ui/` | Swagger UI 界面 |
| `http://localhost:20000/dubbo/openapi/redoc/` | ReDoc 界面 |
| `http://localhost:20000/dubbo/openapi/openapi.json` | OpenAPI JSON 格式文档 |
| `http://localhost:20000/dubbo/openapi/openapi.yaml` | OpenAPI YAML 格式文档 |
| `http://localhost:20000/dubbo/openapi/api-docs/{group}.json` | 指定分组的 JSON 文档 |

### 2. 自定义配置

你可以自定义 OpenAPI 文档的各种属性：

```go
srv, err := server.NewServer(
    server.WithServerProtocol(
        protocol.WithTriple(
            triple.WithOpenAPI(
                triple.OpenAPIEnable(),
                triple.OpenAPIInfoTitle("我的 API 服务"),
                triple.OpenAPIInfoDescription("这是一个带有 OpenAPI 文档的服务"),
                triple.OpenAPIInfoVersion("1.0.0"),
                triple.OpenAPIPath("/custom/openapi"),
            ),
        ),
        protocol.WithPort(20000),
    ),
)
```

#### 配置项说明

| 配置项 | 方法 | 默认值 | 说明 |
|--------|------|--------|------|
| 启用 OpenAPI | `OpenAPIEnable()` | `false` | 开启 OpenAPI 功能 |
| 文档标题 | `OpenAPIInfoTitle(title)` | `Dubbo-go OpenAPI` | API 文档的标题 |
| 文档描述 | `OpenAPIInfoDescription(desc)` | `Dubbo-go OpenAPI` | API 文档的描述信息 |
| 文档版本 | `OpenAPIInfoVersion(ver)` | `1.0.0` | API 文档的版本号 |
| 基础路径 | `OpenAPIPath(path)` | `/dubbo/openapi` | OpenAPI 端点的 URL 前缀 |
| 消费媒体类型 | `OpenAPIDefaultConsumesMediaTypes(types...)` | `["application/json"]` | 请求体的默认 Content-Type |
| 生产媒体类型 | `OpenAPIDefaultProducesMediaTypes(types...)` | `["application/json"]` | 响应体的默认 Content-Type |
| HTTP 状态码 | `OpenAPIDefaultHttpStatusCodes(codes...)` | `["200","400","500"]` | 每个操作默认生成的响应状态码 |

## 分组管理

当你需要在同一个应用中暴露多个版本的 API 文档时，可以使用 OpenAPI 分组功能。通过 `server.WithOpenAPIGroup()` 选项，可以将不同的服务注册到不同的分组中：

```go
// 将服务注册到默认分组
demo.RegisterGreetServiceHandler(srv, &DemoTripleServerV1{},
    server.WithVersion("1.0.0"),
)

// 将服务注册到 "demo-v2" 分组
demo.RegisterGreetServiceHandler(srv, &DemoTripleServerV2{},
    server.WithOpenAPIGroup("demo-v2"),
    server.WithVersion("2.0.0"),
)
```

访问分组文档：

- 默认分组：`http://localhost:20000/dubbo/openapi/api-docs/default.json`
- 指定分组：`http://localhost:20000/dubbo/openapi/api-docs/demo-v2.json`

在 Swagger UI 中，分组会以下拉列表的形式展示，方便切换查看不同分组的 API 文档。

## 非 IDL 模式支持

除了基于 protobuf IDL 的服务，OpenAPI 也支持非 IDL 模式的服务。框架会通过 Go 反射机制自动解析结构体字段和 `json` tag 来生成对应的 Schema 定义：

```go
type UserService struct{}

type UserRequest struct {
    Id int32 `json:"id"`
}

type UserResponse struct {
    Id   int32  `json:"id"`
    Name string `json:"name"`
    Age  int32  `json:"age"`
}

func (u *UserService) GetUser(ctx context.Context, req *UserRequest) (*UserResponse, error) {
    return &UserResponse{
        Id:   req.Id,
        Name: "Alice",
        Age:  30,
    }, nil
}

func (u *UserService) Reference() string {
    return "com.example.UserService"
}
```

注册服务后，OpenAPI 会自动为 `UserRequest` 和 `UserResponse` 生成 JSON Schema，包括字段名称（来自 `json` tag）和类型映射。

### Go 类型与 OpenAPI Schema 映射

| Go 类型 | OpenAPI Schema 类型 |
|---------|---------------------|
| `string` | `string` |
| `bool` | `boolean` |
| `int`, `int32` | `integer` (format: int32) |
| `int64` | `integer` (format: int64) |
| `float32` | `number` (format: float) |
| `float64` | `number` (format: double) |
| `[]T` | `array` (items: T 的 schema) |
| `map[string]T` | `object` (additionalProperties: T 的 schema) |
| `time.Time` | `string` (format: date-time) |
| `struct` | `object` (properties: 各字段的 schema) |

## 静态文档生成（protoc-gen-triple-openapi）

除了运行时自动生成的在线文档，Dubbo-go 还提供了 `protoc-gen-triple-openapi` 工具，可以在编译期从 `.proto` 文件直接生成静态的 OpenAPI 文档文件（JSON/YAML），方便集成到 CI/CD 流程或第三方 API 管理平台。

### 安装

```shell
go install github.com/apache/dubbo-go/tools/protoc-gen-triple-openapi
```

### 使用

假设有一个 `greet.proto` 文件：

```protobuf
syntax = "proto3";

package greet;

option go_package = "github.com/apache/dubbo-go-samples/rpc/triple/openapi/proto/greet;greet";

message GreetRequest {
  string name = 1;
}

message GreetResponse {
  string greeting = 1;
}

service GreetService {
  rpc Greet(GreetRequest) returns (GreetResponse) {}
}
```

执行以下命令生成 OpenAPI 文档：

```shell
protoc --triple-openapi_out=. greet.proto
```

该命令会在当前目录下生成 `greet.triple.openapi.yaml` 文件，内容如下：

```yaml
openapi: 3.0.1
info:
  title: Dubbo-go OpenAPI
  description: dubbo-go generate OpenAPI docs.
  version: v1
servers:
  - url: http://0.0.0.0:20000
    description: Dubbo-go Default Server
paths:
  /greet.GreetService/Greet:
    post:
      tags:
        - greet.GreetService
      operationId: Greet
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/greet.GreetRequest'
        required: true
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/greet.GreetResponse'
        "400":
          description: Bad Request
        "500":
          description: Internal Server Error
components:
  schemas:
    greet.GreetRequest:
      type: object
      properties:
        name:
          type: string
    greet.GreetResponse:
      type: object
      properties:
        greeting:
          type: string
```

## 自定义 Swagger UI / ReDoc

你可以通过 `OpenAPISettings` 自定义 Swagger UI 和 ReDoc 的 CDN 地址以及其他 UI 配置：

```go
triple.WithOpenAPI(
    triple.OpenAPIEnable(),
    triple.OpenAPISettings(map[string]string{
        "swagger-ui.cdn": "https://your-custom-cdn.com/swagger-ui-dist@5.18.2",
        "redoc.cdn":      "https://your-custom-cdn.com/redoc/latest/bundles",
        "swagger-ui.settings.filter": "true",
    }),
)
```

支持的 Settings 键值：

| 键 | 说明 | 默认值 |
|----|------|--------|
| `swagger-ui.cdn` | Swagger UI 的 CDN 地址 | `https://unpkg.com/swagger-ui-dist@5.18.2` |
| `redoc.cdn` | ReDoc 的 CDN 地址 | `https://cdn.redoc.ly/redoc/latest/bundles` |
| `swagger-ui.settings.*` | Swagger UI 的额外配置项（会注入到 SwaggerUIBundle 配置中） | 无 |

## 完整示例

以下是一个包含多种特性的完整示例：

```go
package main

import (
    "context"

    _ "dubbo.apache.org/dubbo-go/v3/imports"
    "dubbo.apache.org/dubbo-go/v3/protocol"
    triple "dubbo.apache.org/dubbo-go/v3/protocol/triple"
    "dubbo.apache.org/dubbo-go/v3/server"
)

type GreetTripleServer struct{}

func (srv *GreetTripleServer) Greet(ctx context.Context, req *greet.GreetRequest) (*greet.GreetResponse, error) {
    return &greet.GreetResponse{Greeting: "Hello, " + req.Name}, nil
}

func main() {
    srv, err := server.NewServer(
        server.WithServerProtocol(
            protocol.WithTriple(
                triple.WithOpenAPI(
                    triple.OpenAPIEnable(),
                    triple.OpenAPIInfoTitle("OpenAPI 示例服务"),
                    triple.OpenAPIInfoDescription("一个带有 OpenAPI 文档的示例服务"),
                    triple.OpenAPIInfoVersion("1.0.0"),
                ),
            ),
            protocol.WithPort(20000),
        ),
    )
    if err != nil {
        panic(err)
    }

    if err := greet.RegisterGreetServiceHandler(srv, &GreetTripleServer{}); err != nil {
        panic(err)
    }

    if err := srv.Serve(); err != nil {
        panic(err)
    }
}
```

启动后访问 `http://localhost:20000/dubbo/openapi/swagger-ui/` 即可查看 Swagger UI 文档界面。

## 架构说明

Dubbo-go OpenAPI 的核心架构由以下组件构成：

- **OpenAPIIntegration**：OpenAPI 集成入口，负责初始化并协调各个组件
- **DefaultService**：核心服务，管理服务的注册、OpenAPI 文档的生成和缓存
- **DefinitionResolver**：根据服务信息解析生成 OpenAPI 文档定义
- **SchemaResolver**：通过 Go 反射将 Go 类型映射为 OpenAPI Schema
- **RequestHandler**：处理 OpenAPI 文档的 HTTP 请求（JSON/YAML 格式输出）
- **SwaggerUIHandler**：处理 Swagger UI 页面请求
- **RedocHandler**：处理 ReDoc 页面请求
- **Encoder**：将 OpenAPI 文档编码为 JSON 或 YAML 格式

当服务注册到 Server 时，OpenAPI 模块会收集服务的接口名称、方法信息、请求/响应类型等元数据。在收到文档请求时，通过 DefinitionResolver 和 SchemaResolver 动态生成符合 OpenAPI 3.0 规范的文档。
