---
title: "A Brief Discussion on RPC"
linkTitle: "A Brief Discussion on RPC"
tags: ["Java"]
date: 2019-01-07
description: >
    RPC - Remote Procedure Call, it is a protocol that allows requesting services from a remote computer program via a network without needing to understand the underlying network technology.
---

In recent years, with the rise of microservices, it has gradually become a mainstream method for large distributed system architectures in many companies. The RPC discussed today plays a crucial role in this process. As companies evolve their projects into microservices, it's observed that RPC is being used implicitly or explicitly in daily development. Some newcomers who just started with RPC may feel confused, while seasoned developers may have extensive experience but lack a deep understanding of its principles, leading to some misuses during development.

## What is RPC?

RPC (Remote Procedure Call) is a protocol for requesting services from remote computer programs via a network. In other words, when one application deployed on server A wants to call a method provided by an application on server B, since they are not in the same memory space, it cannot be called directly; the invocation must be expressed through the network.

RPC assumes the existence of certain transport protocols, such as TCP or UDP, for carrying information between programs. In the OSI networking model, RPC spans the transport layer and application layer, making it easier to develop applications, including network-distributed multiprograms. There are many excellent open-source RPC frameworks in the industry, such as Spring Cloud, Dubbo, and Thrift.

## Origin of RPC

The concept of RPC was proposed by **Bruce Jay Nelson** in the 1980s. The motivations for developing RPC can be traced back to a few points mentioned in Nelson's paper "Implementing Remote Procedure Calls":
* Simplicity: The semantics of RPC are clear and simple, making distributed computing easier.
* Efficiency: Procedure calling appears simple and efficient.
* Universality: In single-machine computing, procedures often serve as the most important communication mechanism between different algorithm parts.

In simpler terms, since programmers are generally familiar with local procedure calls, making RPC function similarly to local calls makes it easier to adopt and use. Nelson's paper, published 30 years ago, was indeed visionary; the RPC frameworks we use today are essentially built around this goal.

## RPC Structure

Nelson's paper identifies five components necessary to implement RPC:
1. User
2. User-stub
3. RPCRuntime
4. Server-stub
5. Server

![RPC Structure](/imgs/blog/rpc/rpc-structure-1.png)

Here, the user represents the client side. When the user wants to initiate a remote call, it is actually making a local call to the user-stub. The user-stub is responsible for encoding the called interface, method, and parameters according to an agreed protocol and transmitting them to the remote instance through the local RPCRuntime instance. Upon receipt of the request, the remote RPCRuntime instance hands it over to the server-stub for decoding before invoking a local call, and the result is returned to the user.

The above demonstrates a coarse-grained conceptual structure of RPC implementation, and we will further detail the components as shown in the diagram below.

![RPC Structure Breakdown](/imgs/blog/rpc/rpc-structure-2.png)

The RPC service provider uses RpcServer to export remote interface methods, while the client side uses RpcClient to import remote interface methods. The client calls remote interface methods as if they were local, with the RPC framework providing the proxy implementation of the interface. The actual call will be delegated to RpcProxy. The proxy encapsulates call information and forwards the call to RpcInvoker for execution. On the client side, the RpcInvoker maintains the channel with the service provider through the RpcConnector, using RpcProtocol for protocol encoding and sending encoded messages through the channel.

The RPC server's receiver, RpcAcceptor, accepts client call requests and uses RpcProtocol for protocol decoding. The decoded call information is passed to RpcProcessor to control the call process and delegate the call to RpcInvoker for actual execution, returning the result. Below are the detailed responsibilities of each component:

```
1. RpcServer  

   Responsible for exporting remote interfaces  

2. RpcClient  

   Responsible for importing the proxy implementation of remote interfaces  

3. RpcProxy  

   Proxy implementation of remote interfaces  

4. RpcInvoker  

   Client-side implementation: responsible for encoding call information and sending it to the service side and waiting for the result.  

   Service-side implementation: responsible for implementing the server interface and returning results.  

5. RpcProtocol  

   Responsible for protocol encoding/decoding  

6. RpcConnector  

   Responsible for maintaining the connection channel between the client and server and sending data to the service side  

7. RpcAcceptor  

   Responsible for receiving client requests and returning results  

8. RpcProcessor  

   Responsible for controlling the call process on the server side, including managing call thread pools, timeout settings, etc.  

9. RpcChannel  

   Data transmission channel 
```

## Working Principle of RPC

RPC design consists of Client, Client stub, Network, Server stub, and Server. The Client is used to call the service, while the Client stub serializes the calling method and parameters (since objects must be converted to bytes for network transmission). The Network transmits this information to the Server stub, which deserializes it. The Server provides the service and executes the method ultimately called.

![Working Principle of RPC](/imgs/blog/rpc/rpc-work-principle.png)

1. The Client calls the remote service as if it were calling a local service; 

2. The Client stub serializes the method and parameters upon receipt; 

3. The client sends the message to the server through sockets; 

4. The Server stub receives the message and decodes it (deserializes the message object); 

5. The Server stub calls the local service based on the decoded results; 

6. The local service executes (locally, for the server) and returns the results to the Server stub; 

7. The Server stub packages the return results into a message (serializes the result message object); 

8. The server sends the message back to the client through sockets; 

9. The Client stub receives the result message and decodes it (deserializes the result message object); 

10. The client gets the final result.

RPC calls can be categorized into two types:

1. Synchronous calls: The client waits for the call to complete and return results.

2. Asynchronous calls: The client does not wait for the execution result upon calling but can still obtain it through callbacks, etc. If the client doesn't care about the return result, it becomes a one-way asynchronous call, where no result is returned.

The distinction between asynchronous and synchronous lies in whether to wait for the server's execution to complete and return results.

## What Can RPC Do?

The main goal of RPC is to ease the construction of distributed computing (applications) while providing robust remote calling capabilities without losing the semantic simplicity of local calls. To achieve this goal, the RPC framework needs to offer a transparent calling mechanism, so users do not have to explicitly distinguish between local and remote calls. The previously mentioned implementation structure is based on a stub structure. Let's detail the stub structure's implementation further.

* It supports distributed, modern microservices.
* Flexible deployment.
* Decouples services.
* Strong extensibility.

The purpose of RPC is to allow you to call remote methods as if they were local, making the invocation transparent, so you may not even know where the method is deployed. By using RPC, services can be decoupled, which is the true intent behind using RPC.

## Conclusion

This article introduced some basic principles of RPC, and I believe you've gained a certain understanding of it by now. Implementing RPC is not particularly difficult; the challenge lies in creating a high-performance and reliable RPC framework. For instance, since it is distributed, a service may have multiple instances. How do you obtain the addresses of these instances during calls? You will need a service registry, such as Zookeeper in Dubbo. During calls, you retrieve the list of service instances from Zookeeper and choose one to call. Which instance to call? This brings in the need for load balancing, and you need to consider how to implement complex balancing; Dubbo offers several load balancing strategies. So, please stay tuned for my other two articles, **The Relationship Between RPC and Serviceization** and **A Brief Discussion on Service Registration Center, Configuration Center, and Service Discovery**, which will undoubtedly provide a deeper understanding of RPC design and implementation.

