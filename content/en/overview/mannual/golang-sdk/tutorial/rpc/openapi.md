---
description: "Use Dubbo-go's built-in OpenAPI support to automatically generate and expose OpenAPI 3.0 documentation, with Swagger UI and ReDoc for visual API management."
linkTitle: OpenAPI Documentation
title: OpenAPI Documentation Generation & Management
type: docs
weight: 5
---

Dubbo-go provides built-in OpenAPI support that automatically generates OpenAPI 3.0-compliant API documentation for Triple protocol services, with Swagger UI and ReDoc for visual API browsing and debugging.

## Feature Overview

- **Automatic Documentation Generation**: Automatically generates OpenAPI 3.0.1 API documentation based on service interface definitions (protobuf IDL or non-IDL mode)
- **Swagger UI**: Built-in Swagger UI interface for online API browsing and debugging
- **ReDoc**: Built-in ReDoc interface for clean API documentation presentation
- **Multiple Output Formats**: Supports both JSON and YAML output formats
- **Group Management**: Supports organizing services into OpenAPI Groups for managing multiple API versions
- **Static Documentation Generation**: Generate static OpenAPI documentation files at compile time from `.proto` files using the `protoc-gen-triple-openapi` plugin

## Quick Start

### 1. Enable OpenAPI

Enable OpenAPI through the Triple protocol options when creating a Server:

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
    // Register services...
    srv.Serve()
}
```

Once the service is started, you can access the OpenAPI documentation at the following endpoints:

| Endpoint | Description |
|----------|-------------|
| `http://localhost:20000/dubbo/openapi/swagger-ui/` | Swagger UI interface |
| `http://localhost:20000/dubbo/openapi/redoc/` | ReDoc interface |
| `http://localhost:20000/dubbo/openapi/openapi.json` | OpenAPI JSON format documentation |
| `http://localhost:20000/dubbo/openapi/openapi.yaml` | OpenAPI YAML format documentation |
| `http://localhost:20000/dubbo/openapi/api-docs/{group}.json` | JSON documentation for a specific group |

### 2. Custom Configuration

You can customize various properties of the OpenAPI documentation:

```go
srv, err := server.NewServer(
    server.WithServerProtocol(
        protocol.WithTriple(
            triple.WithOpenAPI(
                triple.OpenAPIEnable(),
                triple.OpenAPIInfoTitle("My API Service"),
                triple.OpenAPIInfoDescription("A service with OpenAPI documentation"),
                triple.OpenAPIInfoVersion("1.0.0"),
                triple.OpenAPIPath("/custom/openapi"),
            ),
        ),
        protocol.WithPort(20000),
    ),
)
```

#### Configuration Options

| Option | Method | Default | Description |
|--------|--------|---------|-------------|
| Enable OpenAPI | `OpenAPIEnable()` | `false` | Enable the OpenAPI feature |
| Document Title | `OpenAPIInfoTitle(title)` | `Dubbo-go OpenAPI` | Title of the API documentation |
| Document Description | `OpenAPIInfoDescription(desc)` | `Dubbo-go OpenAPI` | Description of the API documentation |
| Document Version | `OpenAPIInfoVersion(ver)` | `1.0.0` | Version of the API documentation |
| Base Path | `OpenAPIPath(path)` | `/dubbo/openapi` | URL prefix for OpenAPI endpoints |
| Consumes Media Types | `OpenAPIDefaultConsumesMediaTypes(types...)` | `["application/json"]` | Default Content-Type for request bodies |
| Produces Media Types | `OpenAPIDefaultProducesMediaTypes(types...)` | `["application/json"]` | Default Content-Type for response bodies |
| HTTP Status Codes | `OpenAPIDefaultHttpStatusCodes(codes...)` | `["200","400","500"]` | Default response status codes for each operation |

## Group Management

When you need to expose multiple versions of API documentation within the same application, you can use the OpenAPI group feature. With the `server.WithOpenAPIGroup()` option, you can register different services into different groups:

```go
// Register service to the default group
demo.RegisterGreetServiceHandler(srv, &DemoTripleServerV1{},
    server.WithVersion("1.0.0"),
)

// Register service to the "demo-v2" group
demo.RegisterGreetServiceHandler(srv, &DemoTripleServerV2{},
    server.WithOpenAPIGroup("demo-v2"),
    server.WithVersion("2.0.0"),
)
```

Access group documentation:

- Default group: `http://localhost:20000/dubbo/openapi/api-docs/default.json`
- Specific group: `http://localhost:20000/dubbo/openapi/api-docs/demo-v2.json`

In Swagger UI, groups are displayed as a dropdown list, making it easy to switch between different API documentation groups.

## Non-IDL Mode Support

In addition to protobuf IDL-based services, OpenAPI also supports non-IDL mode services. The framework automatically resolves struct fields and `json` tags via Go reflection to generate corresponding Schema definitions:

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

After registering the service, OpenAPI automatically generates JSON Schemas for `UserRequest` and `UserResponse`, including field names (from `json` tags) and type mappings.

### Go Type to OpenAPI Schema Mapping

| Go Type | OpenAPI Schema Type |
|---------|---------------------|
| `string` | `string` |
| `bool` | `boolean` |
| `int`, `int32` | `integer` (format: int32) |
| `int64` | `integer` (format: int64) |
| `float32` | `number` (format: float) |
| `float64` | `number` (format: double) |
| `[]T` | `array` (items: schema of T) |
| `map[string]T` | `object` (additionalProperties: schema of T) |
| `time.Time` | `string` (format: date-time) |
| `struct` | `object` (properties: schema of each field) |

## Static Documentation Generation (protoc-gen-triple-openapi)

In addition to runtime-generated online documentation, Dubbo-go provides the `protoc-gen-triple-openapi` tool for generating static OpenAPI documentation files (JSON/YAML) at compile time from `.proto` files. This is useful for integration into CI/CD pipelines or third-party API management platforms.

### Installation

```shell
go install github.com/apache/dubbo-go/tools/protoc-gen-triple-openapi
```

### Usage

Given a `greet.proto` file:

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

Run the following command to generate OpenAPI documentation:

```shell
protoc --triple-openapi_out=. greet.proto
```

This will generate a `greet.triple.openapi.yaml` file in the current directory with the following content:

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

## Customizing Swagger UI / ReDoc

You can customize the CDN URLs and UI settings for Swagger UI and ReDoc through `OpenAPISettings`:

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

Supported settings keys:

| Key | Description | Default |
|-----|-------------|---------|
| `swagger-ui.cdn` | CDN URL for Swagger UI | `https://unpkg.com/swagger-ui-dist@5.18.2` |
| `redoc.cdn` | CDN URL for ReDoc | `https://cdn.redoc.ly/redoc/latest/bundles` |
| `swagger-ui.settings.*` | Additional Swagger UI configuration options (injected into SwaggerUIBundle config) | None |

## Complete Example

Here is a complete example demonstrating various features:

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
                    triple.OpenAPIInfoTitle("OpenAPI Example Service"),
                    triple.OpenAPIInfoDescription("An example service with OpenAPI documentation"),
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

After starting, visit `http://localhost:20000/dubbo/openapi/swagger-ui/` to view the Swagger UI documentation.

For the complete example source code, see [dubbo-go-samples OpenAPI example](https://github.com/apache/dubbo-go-samples/tree/main/rpc/triple/openapi).

## Architecture

The core architecture of Dubbo-go OpenAPI consists of the following components:

- **OpenAPIIntegration**: The entry point for OpenAPI integration, responsible for initializing and coordinating all components
- **DefaultService**: The core service that manages service registration, OpenAPI document generation, and caching
- **DefinitionResolver**: Resolves and generates OpenAPI document definitions based on service information
- **SchemaResolver**: Maps Go types to OpenAPI Schemas via Go reflection
- **RequestHandler**: Handles HTTP requests for OpenAPI documents (JSON/YAML format output)
- **SwaggerUIHandler**: Handles Swagger UI page requests
- **RedocHandler**: Handles ReDoc page requests
- **Encoder**: Encodes OpenAPI documents into JSON or YAML format

When a service is registered to the Server, the OpenAPI module collects metadata such as the service's interface name, method information, and request/response types. Upon receiving a documentation request, the DefinitionResolver and SchemaResolver dynamically generate documentation that conforms to the OpenAPI 3.0 specification.
