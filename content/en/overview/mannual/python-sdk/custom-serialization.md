---
aliases:
    - /en/docs3-v2/python-sdk/custom-serialization/
description: Dubbo Python Custom Serialization
linkTitle: Custom Serialization
title: Custom Serialization
type: docs
weight: 2
---

See the full [example here](https://github.com/apache/dubbo-python/tree/main/samples/serialization)

Python is a dynamic language, and its flexibility makes it challenging to design a universal serialization layer as seen in other languages. Therefore, we have removed the "serialization layer" and left it to the users to implement (since users know the formats of the data they will pass).

Serialization typically consists of two parts: serialization and deserialization. We have defined the types for these functions, and custom serialization/deserialization functions must adhere to these "formats."



First, for serialization functions, we specify:

```python
# A function that takes an argument of any type and returns data of type bytes
SerializingFunction = Callable[[Any], bytes]
```

Next, for deserialization functions, we specify:

```python
# A function that takes an argument of type bytes and returns data of any type
DeserializingFunction = Callable[[bytes], Any]
```

Below, I'll demonstrate how to use custom functions with `protobuf` and `json`.



### protobuf

1. For defining and compiling `protobuf` files, please refer to the [protobuf tutorial](https://protobuf.dev/getting-started/pythontutorial/) for detailed instructions.

2. Set `xxx_serializer` and `xxx_deserializer` in the client and server.

   client

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
           "tri://127.0.0.1:50051/org.apache.dubbo.samples.proto.Greeter"
       )
       dubbo_client = dubbo.Client(reference_config)
   
       stub = GreeterServiceStub(dubbo_client)
       result = stub.say_hello(greeter_pb2.GreeterRequest(name="hello"))
       print(result.message)
   ```

   server

   ```python
   def say_hello(request):
       print(f"Received request: {request}")
       return greeter_pb2.GreeterReply(message=f"{request.name} Dubbo!")
   
   
   if __name__ == "__main__":
       # build a method handler
       method_handler = RpcMethodHandler.unary(
           say_hello,
           request_deserializer=greeter_pb2.GreeterRequest.FromString,
           response_serializer=greeter_pb2.GreeterReply.SerializeToString,
       )
       # build a service handler
       service_handler = RpcServiceHandler(
           service_name="org.apache.dubbo.samples.proto.Greeter",
           method_handlers={"sayHello": method_handler},
       )
   
       service_config = ServiceConfig(service_handler)
   
       # start the server
       server = dubbo.Server(service_config).start()
   
       input("Press Enter to stop the server...\n")
   ```



### Json

`protobuf` does not fully illustrate how to implement custom serialization and deserialization because its built-in functions perfectly meet the requirements. Instead, I'll demonstrate how to create custom serialization and deserialization functions using `orjson`:

1. Install `orjson`:

   ```shell
   pip install orjson
   ```

2. Define serialization and deserialization functions:

   client

   ```python
   def request_serializer(data: Dict) -> bytes:
       return orjson.dumps(data)
   
   
   def response_deserializer(data: bytes) -> Dict:
       return orjson.loads(data)
   
   
   class GreeterServiceStub:
       def __init__(self, client: dubbo.Client):
           self.unary = client.unary(
               method_name="unary",
               request_serializer=request_serializer,
               response_deserializer=response_deserializer,
           )
   
       def say_hello(self, request):
           return self.unary(request)
   
   
   if __name__ == "__main__":
       reference_config = ReferenceConfig.from_url(
           "tri://127.0.0.1:50051/org.apache.dubbo.samples.serialization.json"
       )
       dubbo_client = dubbo.Client(reference_config)
   
       stub = GreeterServiceStub(dubbo_client)
       result = stub.say_hello({"name": "world"})
       print(result)
   ```

   server

   ```python
   def request_deserializer(data: bytes) -> Dict:
       return orjson.loads(data)
   
   
   def response_serializer(data: Dict) -> bytes:
       return orjson.dumps(data)
   
   
   def handle_unary(request):
       print(f"Received request: {request}")
       return {"message": f"Hello, {request['name']}"}
   
   
   if __name__ == "__main__":
       # build a method handler
       method_handler = RpcMethodHandler.unary(
           handle_unary,
           request_deserializer=request_deserializer,
           response_serializer=response_serializer,
       )
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
   
   