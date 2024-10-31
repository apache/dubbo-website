---
aliases:
    - /zh/docs3-v2/python-sdk/custom-serialization/
    - /zh-cn/docs3-v2/python-sdk/custom-serialization/
description: Dubbo Python 自定义序列化
linkTitle: 自定义序列化
title: 自定义序列化
type: docs
weight: 2
---

在此查看完整[示例](https://github.com/apache/dubbo-python/tree/main/samples/serialization)。

Python 是一种动态语言，其灵活性使得在其他语言中设计通用的序列化层具有挑战性。因此，我们移除了框架级别的序列化层，而是提供接口，允许用户根据需求自行实现（因为用户更了解他们要传输的数据格式）。

序列化通常分为两个部分：序列化和反序列化。我们为这些函数定义了类型，自定义的序列化/反序列化函数必须遵循这些 "格式"。

对于序列化函数，我们规定：

```python
# A function that takes any number of arguments and returns data of type bytes
SerializingFunction = Callable[..., bytes]

```

对于反序列化函数，我们规定：

```python
# A function that takes an argument of type bytes and returns data of any type
DeserializingFunction = Callable[[bytes], Any]

```

下面，我将演示如何使用 `protobuf` 和 `json` 进行序列化。

## protobuf

1. 有关定义和编译 `protobuf` 文件的详细说明，请参阅 [protobuf tutorial](https://protobuf.dev/getting-started/pythontutorial/)。

2. 在Client的`unary`、`client_stream`、`server_stream` 和 `bi_stream` 方法中通过设置`request_serializer` 和 `response_deserializer` 设置对应的序列化和反序列化函数。

   ```python
   class GreeterServiceStub:
       def __init__(self, client: dubbo.Client):
           self.unary = client.unary(
               method_name="sayHello",
               request_serializer=greeter_pb2.GreeterRequest.SerializeToString,
               response_deserializer=greeter_pb2.GreeterReply.FromString,
           )
   
       def say_hello(self, request):
           return self.unary(request)
   
   if __name__ == "__main__":
       reference_config = ReferenceConfig.from_url(
           "tri://127.0.0.1:50051/org.apache.dubbo.samples.data.Greeter"
       )
       dubbo_client = dubbo.Client(reference_config)
   
       stub = GreeterServiceStub(dubbo_client)
       result = stub.say_hello(greeter_pb2.GreeterRequest(name="Dubbo-python"))
       print(f"Received reply: {result.message}")
   ```

3. 同理在Server中设置对应的序列化和反序列化函数。

   ```python
   class GreeterServiceServicer:
       def say_hello(self, request):
           print(f"Received request: {request}")
           return greeter_pb2.GreeterReply(message=f"Hello, {request.name}")
   
   def build_service_handler():
       # build a method handler
       method_handler = RpcMethodHandler.unary(
           GreeterServiceServicer().say_hello,
           method_name="sayHello",
           request_deserializer=greeter_pb2.GreeterRequest.FromString,
           response_serializer=greeter_pb2.GreeterReply.SerializeToString,
       )
       # build a service handler
       service_handler = RpcServiceHandler(
           service_name="org.apache.dubbo.samples.data.Greeter",
           method_handlers=[method_handler],
       )
       return service_handler
   
   if __name__ == "__main__":
       # build a service handler
       service_handler = build_service_handler()
       service_config = ServiceConfig(
           service_handler=service_handler, host="127.0.0.1", port=50051
       )
   
       # start the server
       server = dubbo.Server(service_config).start()
   
       input("Press Enter to stop the server...\n")
   ```

## Json

我们已经使用 `protobuf` 实现了单参数的序列化和反序列化。现在，我将演示如何编写一个支持多参数的 Json 序列化和反序列化函数，从而实现多参数方法的远程调用。

1. 安装`orjson`

   ```bash
   pip install orjson
   ```

2. 定义并设置Client的序列化和反序列化函数

   ```python
   def request_serializer(name: str, age: int) -> bytes:
       return orjson.dumps({"name": name, "age": age})
   
   def response_deserializer(data: bytes) -> str:
       json_dict = orjson.loads(data)
       return json_dict["message"]
   
   class GreeterServiceStub:
       def __init__(self, client: dubbo.Client):
           self.unary = client.unary(
               method_name="unary",
               request_serializer=request_serializer,
               response_deserializer=response_deserializer,
           )
   
       def say_hello(self, name: str, age: int):
           return self.unary(name, age)
   
   if __name__ == "__main__":
       reference_config = ReferenceConfig.from_url(
           "tri://127.0.0.1:50051/org.apache.dubbo.samples.serialization.json"
       )
       dubbo_client = dubbo.Client(reference_config)
   
       stub = GreeterServiceStub(dubbo_client)
       result = stub.say_hello("dubbo-python", 18)
       print(result)
   ```

3. 定义并设置Server的序列化和反序列化函数

   ```python
   def request_deserializer(data: bytes) -> Tuple[str, int]:
       json_dict = orjson.loads(data)
       return json_dict["name"], json_dict["age"]
   
   def response_serializer(message: str) -> bytes:
       return orjson.dumps({"message": message})
   
   class GreeterServiceServicer:
       def say_hello(self, request):
           name, age = request
           print(f"Received request: {name}, {age}")
           return f"Hello, {name}, you are {age} years old."
   
   def build_service_handler():
       # build a method handler
       method_handler = RpcMethodHandler.unary(
           GreeterServiceServicer().say_hello,
           method_name="unary",
           request_deserializer=request_deserializer,
           response_serializer=response_serializer,
       )
       # build a service handler
       service_handler = RpcServiceHandler(
           service_name="org.apache.dubbo.samples.serialization.json",
           method_handlers=[method_handler],
       )
       return service_handler
   
   if __name__ == "__main__":
       # build server config
       service_handler = build_service_handler()
       service_config = ServiceConfig(
           service_handler=service_handler, host="127.0.0.1", port=50051
       )
   
       # start the server
       server = dubbo.Server(service_config).start()
   
       input("Press Enter to stop the server...\n")
   ```
