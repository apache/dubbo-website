---
aliases:
    - /zh/docs3-v2/python-sdk/streaming/
    - /zh-cn/docs3-v2/python-sdk/streaming/
description: 在 Dubbo Python 使用 Client streaming、Server streaming、Bidirectional streaming 模型的服务。
linkTitle: Streaming 通信模型
title: Streaming 通信模型
type: docs
weight: 3
---

在此查看完整[示例](https://github.com/apache/dubbo-python/tree/main/samples/stream)。

Dubbo-Python 支持流式调用，包括 `ClientStream`、`ServerStream` 和 `BidirectionalStream` 三种模式。

在流式调用中，操作可以分为写入流和读取流两部分。对于 `ClientStream`，是多次写入、单次读取；对于 `ServerStream`，是单次写入、多次读取；而 `BidirectionalStream` 支持多次写入和多次读取。

### 写入流

流式调用的写入操作分为单次写入（`ServerStream`）和多次写入（`ClientStream` 和 `BidirectionalStream`）。

### 单次写入

单次写入流的调用方式与 unary 模式类似。例如：

```python
stub.server_stream(greeter_pb2.GreeterRequest(name="hello world from dubbo-python"))

```

### 多次写入

对于多次写入流，用户可以通过迭代器或 `writeStream` 方式写入数据（两者只能选其一）。

1. **迭代器写入**：写入方式类似于 unary 模式，唯一的区别是传入的是迭代器。例如：

   ```python
   # Use an iterator to send multiple requests
   def request_generator():
       for i in ["hello", "world", "from", "dubbo-python"]:
           yield greeter_pb2.GreeterRequest(name=str(i))
   
   # Call the remote method and return a read_stream
   stream = stub.client_stream(request_generator())
   ```

2. **使用 `writeStream` 写入**：此方法不传入参数，使用空参调用，然后通过 `write` 方法逐条写入数据，写入完成后调用 `done_writing` 方法结束流。例如：

   ```python
   stream = stub.bi_stream()
   # Use the write method to send messages
   stream.write(greeter_pb2.GreeterRequest(name="jock"))
   stream.write(greeter_pb2.GreeterRequest(name="jane"))
   stream.write(greeter_pb2.GreeterRequest(name="alice"))
   stream.write(greeter_pb2.GreeterRequest(name="dave"))
   # Call done_writing to notify the server that the client has finished writing
   stream.done_writing()
   ```

### 读取流

流式调用的读取操作分为单次读取（`ClientStream`）和多次读取（`ServerStream` 和 `BidirectionalStream`）。在流式调用中，无论是哪种模式，返回的都是一个 `ReadStream`。我们可以使用 `read` 方法或迭代器读取数据，针对 `read` 方法，需要注意以下几点：

1. `read` 方法支持 `timeout` 参数，用于设置阻塞等待时间（单位：秒）。
2. `read` 方法的返回结果可能为三种：所需信息（正常情况）、`None`（等待超时）、`EOF`（读取流结束）。

### 单次读取

调用 `read` 方法一次即可读取数据，例如：

```python
result = stream.read()
print(f"Received response: {result.message}")

```

### 多次读取

可以通过多次调用 `read` 方法读取数据，但需要处理 `None` 和 `EOF` 等非期望值。因为 `ReadStream` 实现了 `__iter__` 和 `__next__` 等迭代方法，我们可以通过迭代调用进行多次读取，此方法无需处理非期望值，但不支持设置阻塞超时参数。

1. **迭代调用**（推荐）：

   ```python
   def client_stream(self, request_iterator):
       response = ""
       for request in request_iterator:
           print(f"Received request: {request.name}")
           response += f"{request.name} "
       return greeter_pb2.GreeterReply(message=response)
   
   ```

2. **多次调用 `read` 方法**：

   ```python
   # Use read method to receive messages
   # If no message arrives within the specified time, returns None
   # If the server has finished sending messages, returns EOF
   while True:
       i = stream.read(timeout=0.5)
       if i is dubbo.classes.EOF:
           break
       elif i is None:
           print("No message received")
           continue
       print(f"Received response: {i.message}")
   ```