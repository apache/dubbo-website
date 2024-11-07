---
aliases:
    - /zh/overview/quickstart/nodejs/
    - /zh-cn/overview/quickstart/nodejs/
description: 使用 Python 开发后端微服务
linkTitle: 快速开始
title: 快速开始
type: docs
weight: 1
---

在开始之前，请确保您已经安装了 **`python 3.11+`**. Then, install Dubbo-Python in your project using the following steps:

```shell
git clone https://github.com/apache/dubbo-python.git
cd dubbo-python && pip install .
```

Get started with Dubbo-Python in just 5 minutes by following our [Quick Start Guide](https://github.com/apache/dubbo-python/tree/main/samples).

It's as simple as the following code snippet. With just a few lines of code, you can launch a fully functional point-to-point RPC service :

1. Build and start the Server

   ```python
   import dubbo
   from dubbo.configs import ServiceConfig
   from dubbo.proxy.handlers import RpcServiceHandler, RpcMethodHandler


   def handle_unary(request):
       s = request.decode("utf-8")
       print(f"Received request: {s}")
       return (s + " world").encode("utf-8")


   if __name__ == "__main__":
       # build a method handler
       method_handler = RpcMethodHandler.unary(handle_unary)
       # build a service handler
       service_handler = RpcServiceHandler(
           service_name="org.apache.dubbo.samples.HelloWorld",
           method_handlers={"unary": method_handler},
       )

       service_config = ServiceConfig(service_handler)

       # start the server
       server = dubbo.Server(service_config).start()

       input("Press Enter to stop the server...\n")
   ```

2. Build and start the Client

   ```python
   import dubbo
   from dubbo.configs import ReferenceConfig


   class UnaryServiceStub:

       def __init__(self, client: dubbo.Client):
           self.unary = client.unary(method_name="unary")

       def unary(self, request):
           return self.unary(request)


   if __name__ == "__main__":
       reference_config = ReferenceConfig.from_url(
           "tri://127.0.0.1:50051/org.apache.dubbo.samples.HelloWorld"
       )
       dubbo_client = dubbo.Client(reference_config)

       unary_service_stub = UnaryServiceStub(dubbo_client)

       result = unary_service_stub.unary("hello".encode("utf-8"))
       print(result.decode("utf-8"))
   ```
