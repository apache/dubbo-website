---
aliases:
    - /en/docs3-v2/python-sdk/streaming/
description: Implement services in Dubbo Python using client streaming, server streaming, and bidirectional streaming models.
linkTitle: Streaming Communication Model
title: Streaming Communication Model
type: docs
weight: 3
---

See the full [example here](https://github.com/apache/dubbo-python/tree/main/samples/stream)

Dubbo-Python supports streaming calls, including `ClientStream`, `ServerStream`, and `BidirectionalStream` modes.

Streaming calls can be divided into write-streams and read-streams. For `ClientStream`, it’s multiple writes with a single read; for `ServerStream`, a single write with multiple reads; and `BidirectionalStream` allows multiple writes and reads.

### Write-Stream

Write operations in streaming calls can be divided into single write (`ServerStream`) and multiple writes (`ClientStream` and `BidirectionalStream`).

#### Single Write

Single write calls are similar to unary mode. For example:

```python
stub.server_stream(greeter_pb2.GreeterRequest(name="hello world from dubbo-python"))
```

#### Multiple Writes

For multiple writes, users can write data using either an iterator or `writeStream` (only one of these options should be used).

1. **Iterator-based Write**: Writing via iterator is similar to unary mode, with the main difference being the use of an iterator for multiple writes. For example:

   ```python
   # Use an iterator to send multiple requests
   def request_generator():
       for i in ["hello", "world", "from", "dubbo-python"]:
           yield greeter_pb2.GreeterRequest(name=str(i))

   # Call the remote method and return a read_stream
   stream = stub.client_stream(request_generator())
   ```

2. **Using `writeStream`**: This method requires an empty argument, after which data is written incrementally using `write`, and `done_writing` is called to end the write-stream. For example:

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

### Read-Stream

Read operations for streaming calls can be single read (`ClientStream`) or multiple reads (`ServerStream` and `BidirectionalStream`). A `ReadStream` is returned in all cases, and data can be read using the `read` method or an iterator. When using `read`, please note:

1. The `read` method supports a `timeout` parameter (in seconds).
2. The `read` method can return one of three values: the expected data, `None` (timeout exceeded), or `EOF` (end of the read-stream).

#### Single Read

A single call to the `read` method will retrieve the data, for example:

```python
result = stream.read()
print(f"Received response: {result.message}")
```

#### Multiple Reads

Multiple reads can be done by repeatedly calling `read`, with handling for `None` and `EOF` values. Since `ReadStream` implements `__iter__` and `__next__`, an iterator-based approach can also be used, which automatically handles these values but doesn’t support a timeout.

1. **Using Iterator (Recommended)**:

   ```python
   def client_stream(self, request_iterator):
       response = ""
       for request in request_iterator:
           print(f"Received request: {request.name}")
           response += f"{request.name} "
       return greeter_pb2.GreeterReply(message=response)
   ```

2. **Multiple Calls to `read` Method**:

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


