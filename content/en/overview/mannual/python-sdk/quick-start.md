---
aliases:
    - /en/docs3-v2/python-sdk/quick-start/
    - /en/overview/quickstart/python/
description: Dubbo-python Quick Start
linkTitle: Quick Start
title: Quick Start
type: docs
weight: 1
---

This guide will help you get started with Dubbo in Python with a simple working example. See the full [example here](https://github.com/apache/dubbo-python/tree/main/samples/helloworld).

## 1. Prerequisites

- Python 3.11 or higher
- Compatible `pip` version

## 2. Install Dubbo-Python

- Install Directly

   ```sh
   pip install apache-dubbo
   ```
- Install from source

   ```sh
   git clone https://github.com/apache/dubbo-python.git
   cd dubbo-python && pip install .
   ```

## 3. Build a Dubbo Service

### Building the Dubbo Server

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

### Building the Dubbo Client

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

## 4. Run the Dubbo Service

Navigate to the Quick Start example directory:

```bash
cd samples/helloworld
```

Run the Server:

```bash
python server.py
```

Run the Client:

```bash
python client.py
```

## 5. Code Walkthrough

### 5.1 Exposing the Service

First, define the service methods you want to expose, as shown below:

```python
class UnaryServiceServicer:
    def say_hello(self, message: bytes) -> bytes:
        print(f"Received message from client: {message}")
        return b"Hello from server"
```

Next, we use the `RpcMethodHandler` constructor methods (`unary`, `client_stream`, `server_stream`, `bi_stream`) to build the method and define its properties. Key parameters include:

- `callable_method`: The method itself.
- `method_name`: The exposed method name, defaulting to the method’s own name.
- `request_deserializer`: The deserialization function for requests (or method parameters). By default, it returns raw `bytes`.
- `response_serializer`: The serialization function for responses (or return values). If not set, the return value must be in `bytes`, `bytearray`, or `memoryview`.

If the method’s parameters and return values are in `bytes`, we can get a minimal `RpcMethodHandler` as follows:

```python
method_handler = RpcMethodHandler.unary(
        method=UnaryServiceServicer().say_hello, method_name="unary"
    )
```

Next, we use `RpcServiceHandler` to build the service, with parameters including:

- `service_name`: The name of the exposed service.
- `method_handlers`: The set of methods for the service, as a `List[RpcMethodHandler]`.

This results in the following `RpcServiceHandler`:

```python
service_handler = RpcServiceHandler(
        service_name="org.apache.dubbo.samples.HelloWorld",
        method_handlers=[method_handler],
    )
```

Finally, we configure `ServiceConfig`, passing in the `RpcServiceHandler` as well as the `host` (address), `port`, `protocol`, and other details for the service. Passing this to `dubbo.Server` exposes the service, as shown below:

```python
service_config = ServiceConfig(
        service_handler=service_handler, host="127.0.0.1", port=50051
    )
# start the server
server = dubbo.Server(service_config).start()
```

### 5.2 Referencing the Service

To reference the service on the Server, we first configure `ReferenceConfig` with the following parameters:

- `protocol`: The protocol used by the Server, such as `tri` (Triple).
- `service`: The name of the referenced service.
- `host`: The service address.
- `port`: The service port.

Additionally, we can use `ReferenceConfig.from_url` to configure `ReferenceConfig` by parsing a URL string automatically. Once configured, we can create a `dubbo.Client`.

Example:

```python
reference_config = ReferenceConfig.from_url(
        "tri://127.0.0.1:50051/org.apache.dubbo.samples.HelloWorld"
    )
dubbo_client = dubbo.Client(reference_config)
```

Then, we can use the `unary`, `client_stream`, `server_stream`, and `bi_stream` methods of `dubbo.Client` to construct and call the service. Parameters for these methods are:

- `method_name`: The name of the referenced method.
- `request_serializer`: The serialization function for the request (or method parameters). If not set, ensure that the return value is `bytes`, `bytearray`, or `memoryview`.
- `response_deserializer`: The deserialization function for the response (or return value). By default, it returns raw `bytes`.

This lets us use the `RpcCallable` object returned by these methods to make the service call. Example:

```python
class UnaryServiceStub:
    def __init__(self, client: dubbo.Client):
        self.unary = client.unary(method_name="unary")

    def say_hello(self, message: bytes) -> bytes:
        return self.unary(message)
```

## 6 More examples

{{< blocks/section color="white" height="auto">}}
<div class="td-content list-page">
    <div class="lead"></div><header class="article-meta">
    </header><div class="row">
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                     <a href='{{< relref "../../mannual/python-sdk/custom-serialization/" >}}'>Custom Serialization</a>
                </h4>
                <p>Dubbo-python Custom Serialization</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                     <a href='{{< relref "../../mannual/python-sdk/streaming/" >}}'>Streaming Communication Mode</a>
                </h4>
                <p>Implementing a Streaming Communication Model with Dubbo-Python</p>
            </div>
        </div>
    </div>
</div>
<hr>
</div>

{{< /blocks/section >}}
