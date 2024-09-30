---
title: "Seamless Integration of gRPC and dubbo-go"
linkTitle: "Seamless Integration of gRPC and dubbo-go"
tags: ["Go"]
date: 2021-01-11
description: This article introduces how to support gRPC in dubbo-go
---

Recently, a highly anticipated feature in our dubbo-go community has been support for gRPC. After the relentless efforts of a certain expert, it has finally been achieved.

Today, I will analyze how this expert connected dubbo-go with gRPC.

## gRPC

First, let’s briefly introduce gRPC. It is an RPC framework introduced by Google. gRPC is implemented through IDL (Interface Definition Language) compiled into clients of different languages. It can be said to be a very standard implementation of RPC theory.

Thus, gRPC natively supports multiple languages. In recent years, it has almost become the standard implementation method for cross-language RPC frameworks, with many excellent RPC frameworks, such as Spring Cloud and Dubbo, supporting gRPC.

Server Side

In Go, the usage on the server side is:

![img](/imgs/blog/dubbo-go/grpc/p1.webp)

The key parts are: s := grpc.NewServer() and pb.RegisterGreeterServer(s, &server{}), with the first step being straightforward, while the second step, RegisterGreeterServer, can be a bit tricky. Why?

Because the method pb.RegisterGreeterServer(s, &server{}) is generated from user-defined protobuf.

Fortunately, the generated method essentially is:

![img](/imgs/blog/dubbo-go/grpc/p2.webp)

In other words, if we can obtain this _Greeter_serviceDesc in dubbo-go, we can register this server. Therefore, it can be seen that a critical issue to resolve in dubbo-go is how to obtain this serviceDesc.

### Client Side

The usage on the client side is:

![img](/imgs/blog/dubbo-go/grpc/p3.webp)

This part is a bit more complex: 1. Create a connection: conn, err := grpc.Dial(address) 2. Create a client: c := pb.NewGreeterClient(conn) 3. Call a method: r, err := c.SayHello(ctx, &pb.HelloRequest{Name: name})

The first issue is quite easy to solve, as we can read the address from user configuration;

The second issue is the most challenging. Just as RegisterGreeterServer was generated, NewGreeterClient is also generated.

The third issue might seem solvable with reflection at first glance, but if we look at SayHello, we can see:

![img](/imgs/blog/dubbo-go/grpc/p4.webp)

Combining with the definition of greetClient, we can easily see that our key is err := c.cc.Invoke(ctx, "/helloworld.Greeter/SayHello", in, out, opts...). In other words, we only need to establish a connection and get the method and parameters to simulate c.SayHello through a similar call.

Through a simple analysis of gRPC, we generally know how to proceed. One remaining question is how our solution can be integrated with dubbo-go.

## Design

Let’s first take a look at the overall design of dubbo-go and think about which layer we should adapt to do gRPC.

![img](/imgs/blog/dubbo-go/grpc/p5.webp)

Based on the earlier introduction of gRPC's related features, we can see that gRPC has already resolved the issues of codec and transport.

From the cluster up, it is clear that gRPC does not address this. Thus, from this diagram, we can see that to achieve this adaptation, the protocol layer is the most suitable. That is, we can extend a gRPC protocol similar to the dubbo protocol.

This gRPC protocol essentially acts as an adapter that connects the underlying gRPC implementation with our own dubbo-go.

![img](/imgs/blog/dubbo-go/grpc/p6.webp)

## Implementation

In dubbo-go, the main components related to gRPC are:

![img](/imgs/blog/dubbo-go/grpc/p7.webp)

Let’s directly see how the key points mentioned in the gRPC section are implemented.

### Server Side

![img](/imgs/blog/dubbo-go/grpc/p8.webp)

This looks quite clear. As with other protocols in dubbo-go, we first obtain the service and then get the serviceDesc to complete the service registration.

Note the red line highlighting ds, ok := service.(DubboGrpcService) in the image above.

Why do I say this part is a bit strange? It is because, theoretically, the registered service here is actually the protobuf-generated gRPC server service—obviously, simply compiling a protobuf interface will not implement the DubboGrpcService interface:

![img](/imgs/blog/dubbo-go/grpc/p9.webp)

So, how can ds, ok := service.(DubboGrpcService) execute successfully?

I will reveal the answer later.

### Client Side

dubbo-go has designed its own Client as a kind of simulation and encapsulation of the Client in gRPC:

![img](/imgs/blog/dubbo-go/grpc/p10.webp)

Notice that the definition of this Client is quite similar to the earlier definition of greetClient. Looking at the NewClient method below, it simply creates a connection conn and then utilizes conn to create a Client instance.

It’s important to note that the invoker maintained here is essentially a stub.

When the actual call is initiated:

![img](/imgs/blog/dubbo-go/grpc/p11.webp)

The key steps are highlighted in the red box. It uses reflection to retrieve the method from the invoker, which is the stub, and then calls it via reflection.

### Code Generation

Earlier, I mentioned the line ds, ok := service.(DubboGrpcService), which faces the issue of how to make the code generated by protobuf compilations implement the DubboGrpcService interface.

Some of you may have noticed that in some of the provided code, reflection operations retrieve method instances by name, as in the line method := reflect.ValueOf(impl).MethodByName("GetDubboStub") in the NewClient method. This impl refers to the service implementation, which is also compiled from protobuf. How can we make the code compiled from protobuf include this GetDubboStub method?

At this point, the answer is emerging: modify the logic of the protobuf compilation generated code!

Fortunately, protobuf allows us to extend our code generation logic through plugins.

So, we just need to register our own plugin:

![img](/imgs/blog/dubbo-go/grpc/p12.webp)

Then this plugin will embed the necessary code. For example, embedding the GetDubboStub method:

![img](/imgs/blog/dubbo-go/grpc/p13.webp)

And the DubboGrpcService interface:

![img](/imgs/blog/dubbo-go/grpc/p14.webp)

This is a task where the challenge is only in knowing how to change the generated code through the plugin; once known, it becomes quite simple—it just requires some diligence.

