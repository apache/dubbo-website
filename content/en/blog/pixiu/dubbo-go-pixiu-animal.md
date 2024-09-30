---
title: The Cross-Language Invocation Beast of Dubbo: dubbo-go-pixiu
keywords: Introduction to Pixiu
description: The dubbo-go-pixiu project is based on dubbo-go and currently supports the HTTP request invocation at the interface protocol layer.
author: Feng Zhenyu, Yu Yu
tags: ["Go", "Pixiu", "Gateway"]
date: 2021-08-25
---

## What is Pixiu

Before answering what Pixiu is, let's briefly explain what Dubbo is. Dubbo is an open-source high-performance RPC framework with rich service governance capabilities and excellent extensibility. Dubbo has further extended into Dubbo-go【1】, providing users with a Dubbo solution in Golang, bridging the gap between two languages, and bringing Dubbo closer to cloud-native environments.

As a Golang service, Dubbo-go enables mutual invocation between Dubbo and Golang services. However, in daily use cases, users often have the need to expose Dubbo services in a RESTful style while also considering internal Dubbo calls. To address this scenario, Pixiu【2】 (formerly known as dubbo-go-proxy), which serves as the Dubbo API gateway, was born. The name Pixiu was chosen because the similar product Zuul in Java is represented by a Western monster, while Pixiu, as a domestic product, uses the Chinese mythical creature Pixiu as its project name. This also expresses the Dubbo community's determination to expand a whole cloud-native ecosystem.

Currently, the best-developed multilingual ecosystem of Dubbo is Java, followed by Golang, while other languages are less promising. The dubbo-go-pixiu project is based on dubbo-go, currently supporting the 7-layer HTTP request invocation, and plans to support gRPC request invocations in the upcoming 0.5 version, serving as a new Dubbo multilingual solution.

## Why Use Pixiu
Pixiu is a cloud-native, high-performance, and extensible microservices API gateway based on Dubbogo. As a gateway product, Pixiu helps users easily create, publish, maintain, monitor, and protect APIs of any scale, handling thousands of concurrent API calls, including traffic management, CORS support, authorization and access control, limiting, monitoring, and API version management. Additionally, as a derivative product of Dubbo, Pixiu can assist Dubbo users in protocol conversion, enabling inter-system and inter-protocol service interoperability.

The overall design of Pixiu adheres to the following principles:

- High performance: high throughput and millisecond-level latency.
- Extensible: Through go-plugin, users can extend Pixiu's functionality based on their needs.
- Easy to use: Users can go live with minimal configuration.

## Features and Core Functions of Pixiu

- Support for RESTful API and Dubbo API

Non-RESTful APIs and Dubbo protocol services often require modifications to be exposed in a RESTful API style. Pixiu provides protocol conversion features; developers can configure their HTTP APIs or Dubbo APIs to be exposed in a RESTful API style through Pixiu. Version 0.2.1 has supported HTTP to Dubbo protocol conversion based on generic calls and the proxying of HTTP protocols. Future versions will add support for gRPC and HTTP2 protocols.

- User-oriented configuration methods

Traditional gateway configurations are often cumbersome and complex. Pixiu, aiming to be an easy-to-use gateway product, has three configuration layers: global Gateway layer configuration, API resource layer configuration, and HTTP verbs method layer configuration. This multiple-layer configuration allows for deep customization while supporting unified default configurations; it also supports local configuration files and can use a unified configuration server. Furthermore, it provides a console module that supports hot configuration updates. The corresponding console interface for Pixiu is also under concurrent development.

- Integration of common features

Common features such as retry, circuit breaking, traffic control, and access control no longer need to be repeatedly implemented on each backend service. Using Pixiu, developers can control globally through filter configurations or set specific rules based on API configurations. This allows developers to focus on business logic and services rather than spending time maintaining infrastructure.

- Extensible

Different usage scenarios have their unique requirements. To meet the customization needs of different users, Pixiu employs a plugin model. Developers can embed their specific business logic as filters within the Pixiu gateway by writing Go plugins.

![img](/imgs/blog/1/01/01/dubbo-go-pixiu/fd38da297d095e4c3af1c89b18804ef1.webp)

Figure 1: Core feature list of Pixiu

## Architectural Design of Pixiu

![img](/imgs/blog/1/01/01/dubbo-go-pixiu/2b2fd6ea1cc0375392919d9e0c181f2b.webp)

Figure 2: Pixiu Architecture

Pixiu, consisting of four main modules: Listener, Router, Filters, and Clients;

- Dubbo Cluster: The cluster where the Dubbo services are located, containing one or more Dubbo Services.
- Other Cluster: The cluster where services outside of Dubbo are located, currently supporting HTTP services, with future plans to expand support to gRPC and other services.
- Registry Center: The registry center maintains invocation address information for each business service.
- Metadata Center: The metadata center maintains configuration information for each business service and stores Pixiu’s own configuration information.

As an API gateway derived from Dubbo, Pixiu is built using Golang, primarily because: 1. Features like Golang's G-M-P, net poller make it very suitable for building IO-intensive applications; 2. Using Golang allows direct integration of some components from dubbo-go, simplifying development.

The overall Pixiu can be roughly divided into four main modules: Listener, Router, Filters, and Client.

### 1. Listener

In Pixiu, the Listener represents the accessible methods to Pixiu. By configuring specific protocol types, addresses, ports, and other properties, the Gateway is exposed. Currently, only HTTP protocol is supported, with gRPC planned for the future.

``` 
listeners: 

  - name: "net/http" 

    address: 

      socket_address: 

        protocol_type: "HTTP" 

        address: "0.0.0.0" 

        port: 8888 

    config: 

      idle_timeout: 5s 

      read_timeout: 5s 

      write_timeout: 5s
```

### 2. Router

Router is Pixiu's routing component. Based on the configuration file, Pixiu stores the exposed URLs in memory in a tree structure. When requests reach the router component, it finds the corresponding backend services and their API configurations based on the URL and HTTP method, encapsulating the information within the request to provide sufficient content for subsequent filters and client calls.

Currently, Router provides the following functionalities:

- Supports one-to-one forwarding routing configurations or wildcard routing configurations.
- Supports forwarding HTTP requests to backend HTTP services.
- Supports transforming HTTP requests into dubbo generic invocation requests.

### 3. Filters

Filters are the main component that implements additional functionalities and extensibility in Pixiu. Its implementation is similar to the filters in Dubbo-go, generating a call chain based on the specified filters in the configuration to execute the logic in each filter before invoking the backend services, achieving functionalities such as throttling, logging, etc.

If users require custom filters, they can implement them by writing Go plugins. In the configuration, filters can be loaded from .so files and specified in the API config regarding the plugin group and plugin name to use.

```
pluginFilePath: "" 
pluginsGroup: 
  - groupName: "group1" 
    plugins: 
      - name: "rate limit" 
        version: "0.0.1" 
        priority: 1000 
        externalLookupName: "ExternalPluginRateLimit" 
      - name: "access" 
        version: "0.0.1" 
        priority: 1000 
        externalLookupName: "ExternalPluginAccess" 
  - groupName: "group2" 
    plugins: 
      - name: "blacklist" 
        version: "0.0.1" 
        priority: 1000 
        externalLookupName: "ExternalPluginBlackList"
```

### 4. Client

Client is responsible for invoking specific services. Currently, Pixiu supports HTTP and Dubbo backend services. The community will gradually add other clients like gRPC to meet different protocols.

The implementation of the HTTP client is relatively simple, generating requests and invoking them using the Golang official package net/http based on the backend service information retrieved from the Router.

The implementation of the Dubbo client is slightly more complex compared to the HTTP client. Its foundation is the generic invocation of Dubbo services. The generic invocation technology is a very basic feature provided by Dubbo that only requires the method name, parameter types, and return value types to initiate a service call. The client can discover services through the registry center or connect directly to the service provider for dynamic invocation.

As shown in the code below, Pixiu generates the Dubbo Generic Client (Generic Invocation Client) for the next step of invocation by dynamically configuring referenceConfig and then calling GetRPCService.

```
referenceConfig := dg.NewReferenceConfig(irequest.Interface, context.TODO())
  referenceConfig.InterfaceName = irequest.Interface
  referenceConfig.Cluster = constant.DEFAULT_CLUSTER
  var registers []string
  for k := range dgCfg.Registries {
    registers = append(registers, k)
  }
  referenceConfig.Registry = strings.Join(registers, ",")

  if len(irequest.DubboBackendConfig.Protocol) == 0 {
    referenceConfig.Protocol = dubbo.DUBBO
  } else {
    referenceConfig.Protocol = irequest.DubboBackendConfig.Protocol
  }

  referenceConfig.Version = irequest.DubboBackendConfig.Version
  referenceConfig.Group = irequest.Group
  referenceConfig.Generic = true
  if len(irequest.DubboBackendConfig.Retries) == 0 {
    referenceConfig.Retries = "3"
  } else {
    referenceConfig.Retries = irequest.DubboBackendConfig.Retries
  }
  dc.lock.Lock()
  defer dc.lock.Unlock()
  referenceConfig.GenericLoad(key)
  clientService := referenceConfig.GetRPCService().(*dg.GenericService)
```

In fact, in the client for generic invocation, the key step to execute the generic call is the generic_filter in Dubbo-go (as shown in the code snippet below). When calling Invoke on the generic_filter, it is agreed that the first parameter of the invocation is the method name, the second is the parameter types list, and the third is the parameter values list. The generic_filter converts the list of parameter values from the user request into a unified format map (struct2MapAll in the code), transforming the serialization and deserialization operations of classes (structs in Golang) into map operations. This allows for the completion of Dubbo service generic invocation without a POJO description through hardcoded injection of the hessian library.

```
func (ef *GenericFilter) Invoke(ctx context.Context, invoker protocol.Invoker, invocation protocol.Invocation) protocol.Result {
  if invocation.MethodName() == constant.GENERIC && len(invocation.Arguments()) == 3 {
    oldArguments := invocation.Arguments()
    if oldParams, ok := oldArguments[2].([]interface{}); ok {
      newParams := make([]hessian.Object, 0, len(oldParams))
      for i := range oldParams {
        newParams = append(newParams, hessian.Object(struct2MapAll(oldParams[i])))
      }
      newArguments := []interface{}{
        oldArguments[0],
        oldArguments[1],
        newParams,
      }
      newInvocation := invocation2.NewRPCInvocation(invocation.MethodName(), newArguments, invocation.Attachments())
      newInvocation.SetReply(invocation.Reply())
      return invoker.Invoke(ctx, newInvocation)
    }
  }
  return invoker.Invoke(ctx, invocation)
}
```

## Summary

From the introduction of the four modules and the registry center, it is not difficult to see that once a request is received by Pixiu through the listener, it is passed to the router. The router finds the destination backend service along with the relevant API configurations from the original request according to the interface's configuration and delivers it to the filter component. The filter component sequentially executes based on the original request, API configurations, and other information until the request reaches the client, invoking the backend service.

### The Future of Pixiu

![img](/imgs/blog/1/01/01/dubbo-go-pixiu/e57050f224f658b96cd6bd917050b259.webp)
Figure 3: Pixiu Iteration Milestones

Pixel's derivative projects will also be on our future plans, primarily aimed at providing better usability. For example, due to the lack of native annotations in Golang, Dubbo-go needs to generate service metadata through configuration files written into the registry. Relevant colleagues from the Kaike company have developed a tool for scanning code https://github.com/jack15083/dubbo-go-proxy-tool, which adds corresponding comments before each RPC service method, thus generating metadata through annotative scanning before service startup. Pixiu also plans to enable services to generate API configurations and register with Pixiu using annotations with the help of https://github.com/MarcGrol/golangAnnotations in future versions.

Currently, Pixiu is positioned as a seven-layer protocol gateway, initially defined as a Dubbo service gateway. As a product for the cloud era, Pixiu's development direction certainly aims at cloud-native. The current version is 0.2.1, which has already implemented basic Dubbo/HTTP service proxying and part of the gateway's common functions. Work is ongoing on the 0.4 version and subsequent versions to support gRPC and Spring Cloud service calls, and MQ service support will also be provided later. In addition, the community will continue to optimize configuration methods, reduce user usage difficulties, and enhance official filters, allowing Pixiu to realize more common gateway functionalities at the official level.

![img](/imgs/blog/1/01/01/dubbo-go-pixiu/0c1afe00699eb3e5cc022e48966ef5a6.webp)

In the coming year, the community plans to support xDS API, evolving Pixiu into a sidecar for the Dubbo mesh. The ultimate goal is to evolve into a Proxy Service Mesh form within the current Dubbo mesh architecture. Based on this architecture, scripting language programs such as JavaScript, Python, PHP, Ruby, and Perl are likely to gain performance boosts in addition to enjoying the existing technical dividends of the Dubbo mesh.

The ultimate aim of Pixiu in the Dubbo Mesh is to gradually unify east-west and north-south data plane traffic within Pixiu while enabling it to possess Application Runtime capabilities, thus serving as a key solution for Dubbo's multilingual ecosystem.

Relevant links:

【1】Dubbo-go：https://github.com/apache/dubbo-go

【2】Pixiu：https://github.com/apache/dubbo-go-pixiu

Feng Zhenyu, Apache Dubbo Committer, currently manages the IT department team of a consumer goods company in Hong Kong. After casually looking at an article introducing dubbogo in the summer of 2020, he joined the dubbogo community and is currently leading the development of Pixiu version 0.4.0.

