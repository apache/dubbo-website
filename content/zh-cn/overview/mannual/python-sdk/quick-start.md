---
aliases:
    - /zh/docs3-v2/python-sdk/quick-start/
    - /zh-cn/docs3-v2/python-sdk/quick-start/
    - /zh/overview/quickstart/python/
    - /zh-cn/overview/quickstart/python/
description: Dubbo-python 快速开始
linkTitle: 快速开始
title: 快速开始
type: docs
weight: 1
---

本指南将通过一个简单的工作示例帮助您开始使用 Python 中的 Dubbo，在此查看完整[示例](https://github.com/apache/dubbo-python/tree/main/samples/helloworld)。

## 1 前置条件

- Python 3.11 或更高版本
- 合适的`pip` 版本

## 2 安装Dubbo-python

- 直接安装

  ```sh
  pip install apache-dubbo
  ```

- 从源码安装

  ```sh
  git clone https://github.com/apache/dubbo-python.git
  cd dubbo-python && pip install .
  ```

  

## 3 构建Dubbo服务

构建Dubbo Server

```python
import dubbo
from dubbo.configs import ServiceConfig
from dubbo.proxy.handlers import RpcMethodHandler, RpcServiceHandler

class UnaryServiceServicer:
    def say_hello(self, message: bytes) -> bytes:
        print(f"Received message from client: {message}")
        return b"Hello from server"

def build_service_handler():
    # build a method handler
    method_handler = RpcMethodHandler.unary(
        method=UnaryServiceServicer().say_hello, method_name="unary"
    )
    # build a service handler
    service_handler = RpcServiceHandler(
        service_name="org.apache.dubbo.samples.HelloWorld",
        method_handlers=[method_handler],
    )
    return service_handler

if __name__ == "__main__":
    # build service config
    service_handler = build_service_handler()
    service_config = ServiceConfig(
        service_handler=service_handler, host="127.0.0.1", port=50051
    )
    # start the server
    server = dubbo.Server(service_config).start()

    input("Press Enter to stop the server...\n")
```

构建Dubbo Client

```python
import dubbo
from dubbo.configs import ReferenceConfig

class UnaryServiceStub:
    def __init__(self, client: dubbo.Client):
        self.unary = client.unary(method_name="unary")

    def say_hello(self, message: bytes) -> bytes:
        return self.unary(message)

if __name__ == "__main__":
    # Create a client
    reference_config = ReferenceConfig.from_url(
        "tri://127.0.0.1:50051/org.apache.dubbo.samples.HelloWorld"
    )
    dubbo_client = dubbo.Client(reference_config)
    unary_service_stub = UnaryServiceStub(dubbo_client)

    # Call the remote method
    result = unary_service_stub.say_hello(b"Hello from client")
    print(result)
```

## 4 运行Dubbo 服务

切换到快速开始示例目录

```bash
cd samples/helloworld
```

运行Server

```bash
python server.py
```

运行Client

```bash
python client.py
```

## 5 源码解读

### 5.1 暴露服务

首先我们需要定义和编写需要暴露的服务方法，如下所示：

```python
class UnaryServiceServicer:
    def say_hello(self, message: bytes) -> bytes:
        print(f"Received message from client: {message}")
        return b"Hello from server"
```

接下来，我们需要使用 `RpcMethodHandler` 的构建方法（`unary`、`client_stream`、`server_stream`、`bi_stream`）构建需要暴露的方法及其属性，其参数包括：

- `callable_method`：方法本身
- `method_name`：暴露的方法名，默认为自身方法名
- `request_deserializer`：请求（或称方法参数）的反序列化函数（默认不反序列化，即直接返回 `bytes`）
- `response_serializer`：响应（或称返回值）的序列化函数（如果不设置，需要确保返回值必须是 `bytes`、`bytearray` 或 `memoryview`）

如果我们的方法参数和返回值均为 `bytes`，则可以得到一个最简的 `RpcMethodHandler`，如下所示：

```python
method_handler = RpcMethodHandler.unary(
        method=UnaryServiceServicer().say_hello, method_name="unary"
    )
```

接下来，我们需要使用 `RpcServiceHandler` 构建需要暴露的服务，其参数包括：

- `service_name`：暴露的服务名
- `method_handlers`：该服务对应的方法集合 - `List[RpcMethodHandler]`

因此，我们可以得到以下 `RpcServiceHandler`：

```python
service_handler = RpcServiceHandler(
        service_name="org.apache.dubbo.samples.HelloWorld",
        method_handlers=[method_handler],
    )
```

最后，我们需要配置 `ServiceConfig`，传入之前的 `RpcServiceHandler` 以及需要暴露的地址（`host`）、端口（`port`）、所使用的协议（`protocol`）等信息。然后将其传入 `dubbo.Server`，就能成功暴露一个服务。如下所示：

```python
service_config = ServiceConfig(
        service_handler=service_handler, host="127.0.0.1", port=50051
    )
# start the server
server = dubbo.Server(service_config).start()
```

### 5.2 引用服务

要引用对应 Server 的服务，我们首先需要配置 `ReferenceConfig`，其参数如下：

- `protocol`：Server 使用的通信协议，例如 `tri`（Triple）等。
- `service`：引用的服务名。
- `host`：服务地址。
- `port`：服务端口。

此外，我们还可以通过 `ReferenceConfig.from_url` 自动解析 URL 字符串来配置 `ReferenceConfig`。之后，我们就能创建一个 `dubbo.Client` 了。

如下所示：

```python
reference_config = ReferenceConfig.from_url(
        "tri://127.0.0.1:50051/org.apache.dubbo.samples.HelloWorld"
    )
dubbo_client = dubbo.Client(reference_config)
```

接下来，我们可以使用 `dubbo.Client` 的 `unary`、`client_stream`、`server_stream` 和 `bi_stream` 方法构建并调用服务。这些方法的参数如下：

- `method_name`：引用的方法名。
- `request_serializer`：请求（或称方法参数）的序列化函数（如果不设置，需要确保返回值是 `bytes`、`bytearray` 或 `memoryview`）。
- `response_deserializer`：响应（或称返回值）的反序列化函数（默认不反序列化，即直接返回 `bytes`）。

此时，我们就能利用上述方法返回的 `RpcCallable` 对象完成服务的调用。如下所示：

```python
class UnaryServiceStub:
    def __init__(self, client: dubbo.Client):
        self.unary = client.unary(method_name="unary")

    def say_hello(self, message: bytes) -> bytes:
        return self.unary(message)
```

## 6 更多示例

{{< blocks/section color="white" height="auto">}}
<div class="td-content list-page">
    <div class="lead"></div><header class="article-meta">
    </header><div class="row">
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                     <a href='{{< relref "../../mannual/python-sdk/custom-serialization/" >}}'>自定义序列化</a>
                </h4>
                <p>Dubbo-python 自定义序列化</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                     <a href='{{< relref "../../mannual/python-sdk/streaming/" >}}'>Streaming 通信模式</a>
                </h4>
                <p>Dubbo-python 实现 Streaming 通信模型</p>
            </div>
        </div>
    </div>
</div>
<hr>
</div>

{{< /blocks/section >}}
