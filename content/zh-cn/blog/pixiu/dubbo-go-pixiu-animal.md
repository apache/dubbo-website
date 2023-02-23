---
title: Dubbo 跨语言调用神兽：dubbo-go-pixiu
keywords: Pixiu 介绍
description: dubbo-go-pixiu 项目是一个基于 dubbo-go 发展起来的项目，目前接口协议层支持的是七层的 HTTP 请求调用
author: 冯振宇,于雨
tags: ["Go", "Pixiu", "网关"]
date: 2021-08-25
---

## Pixiu 是什么


在回答 Pixiu 是什么之前，我们简单解释一下 Dubbo 是什么。Dubbo 是一个开源的高性能 RPC 框架，有着丰富的服务治理能力以及优秀的扩展能力。Dubbo 更扩展出 Dubbo-go【1】，为用户提供了 Golang 的 Dubbo 解决方案，打通了两种语言之间的隔阂，使 Dubbo 更加贴近云原生。



Dubbo-go 作为 Golang 服务，实现与 Dubbo 服务之间的相互调用。然而，在日常使用场景中，用户往往有把 Dubbo 服务以 RESTful 风格向外暴露的需求同时也要兼顾内部 Dubbo 调用。为了解决这种场景，作为 Dubbo  API 网关的 Pixiu【2】 (中文: 貔貅， 曾用名 dubbo-go-proxy) 便应运而生。之所以采用 Pixiu 这个名称，是因为 Java 同类产品 Zuul 的意象是一个西方怪兽，Pixiu 作为一个国产产品，就用了我们中国的一个类似的神兽貔貅作为项目名称。也同时表达了 Dubbo 社区希望扩展出一整套云原生生态链的决心。



目前 Dubbo 多语言生态，发展最好的自然是 Java，其次是 Golang，其他语言都差强人意。dubbo-go-pixiu 项目是一个基于 dubbo-go 发展起来的项目，目前接口协议层支持的是七层的 HTTP 请求调用，计划在未来的 0.5 版本中支持 gRPC 请求调用，其另外一个使命是作为一种新的 dubbo 多语言解决方案。

## 为什么使用 Pixiu
Pixiu 是基于 Dubbogo 的云原生、高性能、可扩展的微服务 API 网关。作为一款网关产品，Pixiu 帮助用户轻松创建、发布、维护、监控和保护任意规模的 API ，接受和处理成千上万个并发 API 调用，包括流量管理、 CORS 支持、授权和访问控制、限制、监控，以及 API 版本管理。除此以外，作为 Dubbo 的衍生产品，Pixiu 可以帮助 Dubbo 用户进行协议转换，实现跨系统、跨协议的服务能力互通。



Pixiu 的整体设计遵守以下原则：

- High performance: 高吞吐量以及毫秒级的延时。
- 可扩展: 通过 go-plugin，用户可以根据自己的需求延展 Pixiu 的功能。
- 简单可用: 用户通过少量配置，即可上线。

## Pixiu 的特性及核心功能


- 为 RESTful API 和 Dubbo API 提供支持



非 RESTful 风格的 API 和 Dubbo 协议的服务往往需要修改才可以以 RESTful API 风格对外开放。Pixiu 提供协议转换功能，通过 Pixiu，开发者可以将自己的 HTTP API 或 Dubbo API 通过配置，以 RESTful API 风格对外开放。v0.2.1 版本已支持基于泛化调用的 HTTP 至 Dubbo 的协议转换以及 HTTP 协议的转发。在后续的版本，社区将会增加对 gRPC 和 http2 协议的支持。



- 面向用户的配置方式



一般的网关的配置往往繁琐且复杂。Pixiu，目标作为一款易用的网关产品，在设计上拥有三层配置层级，Gateway 层全局配置， API resource 层配置以及 HTTP verbs 方法层配置。通过三个不同层级的配置，既可以实现深度的定制，亦支持统一的默认配置；同时，支持本地的配置文件，亦可使用统一配置服务器。另外，还提供控制台模块，通过控制台模块，支持配置的热更新。Pixiu 配套配套的控制台界面也在同步开发中。



- 通用功能的集成



重试、熔断、流量控制、访问控制等通用功能不再需要在每个后端服务上重复实现。使用 Pixiu，通过配置 filter ，开发者可以进行全局的控制，亦可以根据 API 配置各自的规则。因此开发者可以专注于业务逻辑和服务，而不是将时间用在维护基础设施上。

- 可扩展

不同的使用场景有着各自独特的需求。为满足不同用户的定制化需求，Pixiu 使用了插件模式。开发者可以通过编写 go plugin，将自身特有的业务逻辑以 filter 形式内嵌至 Pixiu 网关中，实现诸如企业登录鉴权等功能。

![img](/imgs/blog/1/01/01/dubbo-go-pixiu/fd38da297d095e4c3af1c89b18804ef1.webp)

图 1: Pixiu 核心功能列表


## Pixiu 的架构设计


![img](/imgs/blog/1/01/01/dubbo-go-pixiu/2b2fd6ea1cc0375392919d9e0c181f2b.webp)

图 2: Pixiu 架构


貔貅: 即 dubbo-go-pixiu，由四个主要模块：Listener、Router、Filters 和 Clients 组成；

- Dubbo Cluster: Dubbo 服务所在集群，包含一个或多个 Dubbo Services；
- Other Cluster: Dubbo 以外的服务所在集群，现支持 HTTP 服务，未来将拓展支持 gRPC 等其他服务；
- Registry Center: 注册中心，维护每个业务服务的调用地址信息；
- Metadata Center: 元数据中心，维护每个业务服务的配置信息以及存储 Pixiu 本身的配置信息。


作为 Dubbo 所衍生的 API 网关，Pixiu 使用 Golang 搭建，主要因为: 1. Golang 的 G-M-P，net poller 等特性使 Golang 非常适合构建 IO 密集型应用；2. 使用 Golang 可以直接引入 Dubbo-go 中的一些组建，简化开发。


整个 Pixiu 大致可以拆分为四个主要模块：Listener、Router、Filters 和 Client。


### 1、Listener

在 Pixiu 中，Listener 代表外部可以访问 Pixiu 的方式。通过配置指定协议类型，地址，端口等属性，暴露 Gateway。现阶段暂支持 HTTP 协议，未来将会加入 gRPC。

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

### 2、Router


Router 是 Pixiu 的路由组件。根据配置文件，Pixiu 将对外暴露的 URLs 以树的形势存储于内存中，当请求到了 router 组件时，即会根据 URL 及 HTTP 方法查找到对应的后端服务及其 API 配置，并将信息封装于请求中，为后续 filter，及 client 的调用提供足够的内容。


现阶段，Router 提供以下功能:


- 支持请求一对一转发路由配置或 wildcard 路由配置。
- 支持 HTTP 请求的转发到后端 HTTP 服务。
- 支持 HTTP 请求转化为 dubbo 泛化调用请求。


### 3、Filters


Filter 是 Pixiu 实现额外功能及其扩展性的主要组件。其实现类似于 Dubbo-go 中的 filter，根据配置中 filter 的指定，生成调用链，从而在调用后端服务前，将各 filter 中的逻辑运行一遍，实现节流，日志等功能。


用户如果需要客制化的 filter，可通过编写 go-plugin 实现。在配置中，可通过类似如下配置，加载 .so 文件，并在 API config 中指定使用的 plugin group，plugin name 实现。

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


### 4、Client


Client 负责调用具体服务。现阶段，Pixiu 支持 HTTP 与 Dubbo 的后端服务。社区将逐渐增加 gRPC 等其他 Client 以满足不同的协议。

HTTP client 的实现相对简单，根据 Router 中获取的后端服务信息，通过 Golang 官方包 net/http 生成请求并调用。

Dubbo client 的实现对比 HTTP client 会稍微复杂，其基础为 Dubbo 服务的泛化调用。泛化调用技术是 Dubbo 提供的一个很基础的功能只需要知道调用的方法名、参数类型和返回值类型，即可发起服务调用。客户端对服务端的泛化调用既可以通过注册中心发现服务，也可以直连服务端，实现对服务的动态调用。

如下面代码所示，Pixiu 通过动态配置 referenceConfig，然后通过 GetRPCService 生成 Dubbo 的 Generic Client（泛化调用客户端）进行下一步的调用。

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


实际上，在泛化调用的客户端中，实际执行泛化调用的关键步骤是 Dubbo-go 中的 generic_filter (如下代码片段)。在调用 generic_filter 的 Invoke 时，约定 invocation 参数列表第一个为方法名，第二个为参数类型列表，第三个为参数值列表。generic_filter 将用户请求的参数值列表转化为统一格式的 map（代码中的 struct2MapAll ），将类（ golang 中为 struct ）的正反序列化操作变成 map 的正反序列化操作。这使得无需 POJO 描述通过硬编码注入 hessain 库，从而完成 Dubbo 服务的泛化调用。


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

## 总结


通过上面的四个模块以及注册中心的简单介绍不难发现，当请求通过 listener 被 Pixiu 接收后，请求被传入 router 中。router 根据接口的配置，从原请求中找到目标后端服务连同相关 API 配置下发到 filter 组件。filter 组件根据原请求、 API 配置等信息顺序执行，最终请求到达 client， 通过 client 调用后端服务。

### Pixiu 的未来

![img](/imgs/blog/1/01/01/dubbo-go-pixiu/e57050f224f658b96cd6bd917050b259.webp)
图 3: Pixiu 迭代里程碑



Pixiu 作为网关产品外，其衍生项目也会在我们的未来计划中，主要目的是提供更好的可用性。例如，由于 Golang 语言缺乏原生的注解， 因此 Dubbo-go 需要通过配置文件方式生成服务的元数据写入注册中心。开课啦教育公司相关同学写了一个扫描代码的工具 https://github.com/jack15083/dubbo-go-proxy-tool，在每个 RPC 服务方法前加上对应的注释，从而在服务启动前通过扫描注释生成元数据。Pixiu 也计划在未来的版本上通过提供 package，允许服务通过注释借助 https://github.com/MarcGrol/golangAnnotations 生成 API 配置并注册到 Pixiu 上。



Pixiu 目前的定位是一个七层协议网关，其最初版本是被定义成一个 Dubbo 的服务网关。作为云时代的产品，Pixiu 的发展方向必然是面向云原生的。现在的版本为 0.2.1, 已经实现基本的 Dubbo/Http 服务代理和部分的网关通用功能。目前正在开发中的 0.4 及其后续版本支持 gRPC 和 Spring Cloud 服务调用， 后续还将提供 MQ 服务支持。另外，社区将继续优化配置方式，降低用户的使用难度，继续优化官方的 filter，使 Pixiu 可以在官方层面实现更多的网关通用功能。


![img](/imgs/blog/1/01/01/dubbo-go-pixiu/0c1afe00699eb3e5cc022e48966ef5a6.webp)

在未来的一年内，社区计划支持 xDS API，将 Pixiu 演化为 Dubbo mesh 的 sidecar。其最终目的就是：在现有的 dubbo mesh 形态中演化出 Proxy Service Mesh 形态。基于这个形态，Js、Python、PHP、Ruby 和 Perl 等脚本语言程序除了收获 dubbo mesh 原有的技术红利之外，大概率还能收获性能上的提升。



Pixiu 在 Dubbo Mesh 中的终极目的是：把东西向和南北向数据面流量逐步统一 Pixiu 中的同时，让它逐步具备 Application Runtime 的能力，作为 Dubbo 多语言生态的关键解决方案。


相关链接：

【1】Dubbo-go：https://github.com/apache/dubbo-go

【2】Pixiu：https://github.com/apache/dubbo-go-pixiu


冯振宇，Apache Dubbo Committer，目前负责管理香港一家消费品公司的 IT 部门整个团队。2020 年夏天 偶然看到了介绍 dubbogo 的文章后加入了 dubbogo 社区，目前在主导 Pixiu 0.4.0 版本的开发。
