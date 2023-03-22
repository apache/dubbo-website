---
date: 2023-03-22
title: "全国首个政企采购云平台：政采云的混合云跨网方案实践"
linkTitle: "政采云"
tags: ["用户案例"]
weight: 10
---


对云岛业务结构的公司来说，云平台属于公司内部、完全可控的局域网，而岛端则是有自己安全网络策略的独立内部网络。需要云岛通信时，会基于需求，按客户要求走流程开通一些端口，这个过程需要一定的成本且不完全可控。业务上，如果这种跨网需求增多，则会逐渐变成痛点。如果可以搭建一个透明的跨网传输网络，配合良好的顶层设计，就可以在业务支撑、安全管控和运维成本中寻求较好的平衡。

本文将介绍政采云基于 Dubbo 的跨网方案落地过程中面临的技术挑战、社区合作以及更深层次抽象的一些思考。在政采云这种政企业务场景中的数据跨网，与业界公有云、自建私有云的公司相比，既有共性又有自己的特点，希望能为大家提供新的思路或者启发。

## 前言

稳定、高效、可靠的基础设施是互联网企业应对业务高峰流量的底层基石。作为政采云的基础技术平台，基础平台部一直致力于通过业内前沿技术的落地，保障公司内部所有业务在线生产系统所依赖的基础技术平台能稳定、安全、低成本、可持续地运行与发展。

由于公司对 Dubbo 框架的重度使用，**跨网数据传输系统**一般基于 Dubbo 特性开发，在政采云内部就有多个版本的实现。

早在几年前，政采云就上线了基于 Dubbo Filter 转发的方案，它解决了岛到云的单向数据传输，安全认证等问题。另外，业务部门也有按照自己的需求，推出网状点对点的方案，实现了一定程度的透明传输。

结合前两年的探索实践以及业界相关领域技术的成熟度，2022年下半年，我们对各跨岛方案，进行了整合升级，也就是现在的**高速公路**方案，保障跨岛标准化同时，解决了之前方案实践过程中面临的很多业务痛点，包括：

- **单向传输**：因为架构原因，如需双向需要对等重新部署一套，成本较大。

- **白名单开通成本高**：点对点的网状架构，需要两两开通白名单，因为政企网络特殊性，开通流程复杂且慢。

- **平台维护成本高**：业务各自一套数据传输平台，重复建设且运维成本高。

- **公共功能的缺失**：核心功能，业务可以按需开发，但是数据审计、链路追踪、可观测性等公共特性，往往没有足够投入。


## 1. 跨网数据传输系统演进

### 1.1 历史架构

![img](/imgs/v3/users/zcy-1.png)

​																		

自左向右、自下而上进行模块介绍：

- **业务Web**：业务 Web 作为数据发送方，调本地	集群 Provider 时，携带跨岛信息过去（Dubbo 上下文）。

- **岛业务Center**：本地虚拟Provider，通过Filter拦截跨岛请求，通过http传送到云平台 Dubbo 网关，返回数据后反序列化返回岛业务 web。

- **Dubbo网关**：接收 Http 请求，通过泛化调用云端 Provider，处理数据后返回业务 Center。

- **云业务Center**：普通 Dubbo Provider。


### 1.2 高速公路架构

![img](/imgs/v3/users/zcy-2.png)

​																		 

**1.2.1 隧道机制**

隧道技术是一种通过使用**互联网络**的**基础设施**在网络之间传递数据的方式。使用隧道传递的**数据**(或负载)可以是不同协议的数据帧或包。

高速公路架构中，使用了隧道这个概念。两端（业务层）是 Dubbo 私有协议，跨网传输过程中，则使用了 http 协议，http 协议可以更好的被中间设备、网关识别转发。这个机制的最大便利在于对业务的低侵入性。对于业务集群的应用完全不需要修改。
![img](/imgs/v3/users/zcy-3.png)


除了路由标记，出口/入口 Dubbo 协议字节流没有任何业务外信息，所以可以路由任何 Dubbo 请求。

![img](/imgs/v3/users/zcy-4.png)



**1.2.2 主要节点**

**客户端 Sdk**：不改变用户使用 Dubbo 的方式，多种形式提供Dubbo的路由。

**Dubbo 出口网关：**代理 Dubbo 流量出口。

**Dubbo 入口网关：**代理 Dubbo 流量入口。

**统一网关：**基于 Apisix，代理跨网间所有流量，可以扩展鉴权、审计、限流等特性



## 2. 挑战与应对之策

如前言中所述，已有的几个方案设计上存在了一些问题，落地后也限制了使用了场景。在架构上，我们提出了高速公路方案，选择了全双工的对等网络传输框架。角色上，云平台定位一个特殊的岛端应用，遵循P2P实施原则。而对用户而言，高速公路是一个通往岛端的隧道，遵循对用户透明原则。我们可以先来看下在搭建平台的过程中面临的一些挑战以及解法。

### 2.1 技术挑战

结合当下跨网数据传输系统面临的处境，并对业界 Dubbo 跨网方案做过一番调研后，在平台搭建上确定了如下三期目标：

- **一期目标**：网络能力建设，简单来说是搭建基于 Dubbo 的传输通道，上层功能先维持不变。
- **二期目标**：业务上，找业务先行试点，基于反馈，小步快跑，快速迭代；技术上，寻求 Dubbo 社区协作，增强对Dubbo相关技术风险的把控，同时抽离通用特性，反馈社区。
- **三期目标**：抽象出更通用的网络框架，从而使语言层，传输协议层、及中间件层独立扩展，一键切换。

在上述三期目标基本落地后，高速公路系统不仅可以跑起来，同时拥有非常强大的扩展性，更好的承接业务需求及共建。在这过程中，我们需要解决不少技术问题。

**2.1.1 客户端路由**

如前面历史方案所述，其场景被限制为岛到云的单向数据传输，特点如下：

- **客户端无路由能力**：Consumer 端只能指定是否路由到云平台，而不能指定其他岛端。

- **基于filter的扩展**：Dubbo的 Filter 并不是为路由设计的，在此基础上较难扩展。

- **需要本地Provider角色**：Consumer 端发出的请求，必须由一个注册在 Zookeeper 下的 Provider 兜住，然后 Filter 根据上下文决定是否转发，这就限制了业务方必须部署一个本地 Provider 应用（哪怕是空应用），才能做到跨网访问。


我们要解决的问题之一，就是打破单向传输瓶颈，客户端可以更自由的路由到目标云/岛。我们设计了以下几种路由方式：

- **注解方式**：使用@DubboReference提供的通用 parameters 参数，设置路由目标，可以达到方法粒度的路由。

  ```java
  @DubboReference(check = false, parameters = {"ENV_SHANGHAI", "ALL"}) //all表示所有方法，可以单独指定
  private DemoService demoService;
  ```

- **配置中心指定**：把以上parameters = {"ENV_SHANGHAI", "ALL"} 信息，在配置中心配置，达到同样的效果，这种方式对代码完全无侵入。

- **线程指定**：这种方式最灵活。

  ```java
  AddressZoneSpecify.setAddress(Enviroment.SHANGHAI);
  demoService.play();
  ```

无论哪种路由方式，基于“用户透明“的原则，都不改变用户使用 dubbo 的方式。



**2.1.2 Dubbo请求地址切换**

客户端路由最小限度地侵入业务代码，达到了透明调用远程服务的目标。但是，用户仍旧需要部署一套虚拟 Provider 应用，接收请求后按规则进行路由。

为了避免部署多余的应用，我们需要有一定的机制，直接把dubbo流量切换到远程。

![img](/imgs/v3/users/zcy-5.png)

​																		

解决了切换问题后，本地的 APP2 不再需要，甚至zk也可以移除。当然，如果业务同时有本地和远程的调用需要，也可以继续存在。

![img](/imgs/v3/users/zcy-6.png)

​																		

原先，我们准备通过Dubbo的Route自定义扩展，去实现动态切换地址的能力。查阅资料后，发现Dubbo已经提供了类似能力。

https://cn.dubbo.apache.org/zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/service/specify-ip/

该特性放在Dubbo的子工程dubbo-spi-extensions中，同样以Route扩展形式实现。

但在实际使用过程中，我们遇到如下问题：

- **不支持 Dubbo2**：使用 Dubbo2 时，直接以异常的形式提醒暂不支持。
- **NPE异常：** 某些场景下调用出现了NPE异常。
- **丢失部分信息：** Router下构建新 Invocation 时，丢失了 version、group等信息。
- **重试异常：** 远程 Provider 如果发生了异常，客户端在重试的时候，选择了本地集群 Provider 调用，造成错误.

作为一个尝鲜新特性，我们理解功能存在不稳定的情况。但这个功能作为我们跨网方案的技术要点，又必须解决。所以，我们通过PR的形式，把相应补丁提交到Dubbo社区。这个过程中，我们联系到了Dubbo PMC 远云大佬，一起讨论和完善PR，直到解决所有已知问题。



**2.1.3 出口网关的实现**

在上图中，通过切换地址，我们似乎可以直接访问远程应用，并且架构非常简单。但是遗憾的是，存在几个难以解决的问题：

- **网关组件的限制**：在云岛/岛岛间，存在一系列网关组件，来提供转发、负载均衡的功能，比如SLB、NGINX、WAF。这些组件并不能识别私有的 Dubbo 流量并转发
- **ip白名单开通成本高：** 类似 P2P 方案，需要点对点开通 IP 白名单，成本巨大。
- **升级维护复杂：** 客户端通过集成 SDK 的形式转发，后续如需要劫持流量进行扩展，需要同时对每个接入应用进行升级。

![img](/imgs/v3/users/zcy-7.png)


​																	

针对以上问题，我们的设计中，需要加入 Dubbo 网关的角色，来实现以下目标。

①  **两端ip收敛**

- 显著减少网关长连接数量
- 弱化服务注册发现流程（每个环境只有一个 Dubbo 网关，直接配置即可互相发现）
- 简化鉴权、认证流程。一条链路可以使用白名单，一群则只能配置较复杂的鉴权

②  **两端功能收敛**

- 客户端的 SDK 专注路由功能，基本不用升级
- 扩展功能放在 Dubbo-Proxy，统一升级，业务端无感知

Dubbo-Proxy 作为业务网关，可以减轻对业务端的侵入，起到类似分布式运行时（Dapr）作用。但是，在引入之前，需要解决一些现实的技术问题。其中，最重要的问题是如何接收陌生的 Dubbo 流量，然后进行转发。做了一些相关调研后，有两个方案可用：

-  **通用Provider**：直接在 Dubbo-Proxy 注册一个普通的通用 Service，客户端的 SDK 利用 Filter，劫持流量，直接调用通用 Service 后处理数据返回。

-  **注册虚拟节点：**该方案来源于远云。客户端在本地zk订阅远程节点时，通知 Proxy，Proxy 获取订阅的信息后（预先订阅所有 zk 变更），主动注册相应虚拟 Service（对 zk 来说，注册一个节点的参数只是字符串）到zk上。这样，可以把客户端的远程流量“骗”到 Proxy ，Proxy 再使用服务端泛化，接收请求并转发。

以上两种方案，都可以实现出口网关。但是，在设计上，角色间需要多次交互，才能达到目的。那么，是否有更简洁的方式，直接支持这种接收和转发呢？

首先，我们对 Dubbo 源码进行了调研，看 Provider 接收到陌生流量（无相应Service）后会如何处理，是否有扩展点可以拦截。发现在 Byte 流解析阶段，Dubbo 即对 Service 进行了检查，不存在直接抛异常返回。

![img](/imgs/v3/users/zcy-8.png)
​																	

在 Provider 处理的生命周期中，Decode 出于非常早期的阶段，几乎没有什么扩展点可以拦截处理。因为快速失败的理念，早期的检测确实可以避免后面无谓的代码执行消耗。但是，对比 Spring ，Dubbo 在扩展性上是有不足的，即对于一个通用的异常，却没有相应的扩展机制。

我们决定在 decode 的基础上，加上对这个异常的扩展。主要思路是，在 decode 被调用处，catch 住这块异常，通过 SPI 的形式，获取扩展实现，可以定制异常信息，也可以控制 decode 流程重试。这块修改难度并不大，私有版本上顺利通过测试，同时提交 PR 到社区。这个过程中，远云大佬帮忙发现了一个并发安全的 bug，并给了不少减少风险的建议。

```java
//解码结束后，无论是否异常，都将进入这个方法
    void handleRequest(final ExchangeChannel channel, Request req) throws RemotingException {
        if (req.error != null) {
            // Give ExceptionProcessors a chance to retry request handle or custom exception information.
            String exPs = System.getProperty(EXCEPTION_PROCESSOR_KEY);
            if (StringUtils.isNotBlank(exPs)) {
                ExtensionLoader<ExceptionProcessor> extensionLoader = channel.getUrl().getOrDefaultFrameworkModel().getExtensionLoader(ExceptionProcessor.class);
                ExceptionProcessor expProcessor = extensionLoader.getOrDefaultExtension(exPs);
                boolean handleError = expProcessor.shouldHandleError(error);
                if (handleError) {
                    //获取异常扩展，执行wrapAndHandleException操作，需要重试的场景可以抛出retry异常
                    msg = Optional.ofNullable(expProcessor.wrapAndHandleException(channel, req)).orElse(msg);
                }
            }
        }

        res.setErrorMessage("Fail to decode request due to: " + msg);
        res.setStatus(Response.BAD_REQUEST);

        channel.send(res);
    }


    //handleRequest过程中的retry控制
    public void received(Channel channel, Object message) throws RemotingException {
        //解码
        decode(message);
        try {
            handler.handleRequest(channel, message);
        } catch (RetryHandleException e) {
            if (message instanceof Request) {
                ErrorData errorData = (ErrorData) ((Request) message).getData();
                //有定制，进行重试
                retry(errorData.getData());
            } else {
                // Retry only once, and only Request will throw an RetryHandleException
                throw new RemotingException(channel, "Unknown error encountered when retry handle: " + e.getMessage());
            }
            handler.received(channel, message);
        }
    }
```

关于ExceptionProcessor扩展，我们在官方扩展包Dubbo-Spi-Extensions中，提供了一个默认实现，允许控制重试解码，并自定义异常处理。



**2.1.4 中心网关**

最新架构，已经非常接近最终实现了，但是缺了一个中心网关角色。引入这个网关(基于 Apisix )的原因：

- 白名单问题：虽然 Dubbo 网关收敛了终端 IP，但是要实现岛岛互通，还是得两两互开白名单。引入中心网关（云平台）后，每个岛单独和云平台互开即可。白名单开通复杂度从O(n*n) 变为O(n)。
- 统一网关的好处：作为公司级网关，可以统一对所有应用进行限流、鉴权、审计、可观测性等功能拓展。

## 3. 更多思考

无论公司内外，能选择的跨网方案非常多，我们会去选择一个能解决痛点的，而不是完美的方案。落地方案一般比较保守，但是对于架构的思考，一定是需要更超前的。

**http协议导致的性能损失**

前面说到，在 Dubbo 网关和中心网关间，我们使用了 Http 协议。对比 Dubbo 等精简协议，Http 协议显然更臃肿。但是，也许这是现阶段最合适的方案。除了避免私有协议在网络设备中的“艰难前行”，Http 协议开发成本更低，相应落地风险也更小。一些新技术，也许是我们后续发展的方向。比如 Higress，支持 Triple 协议（基于 Http2）交换信息，在获得更高性能的同时，也解决了设备识别问题。但是选择 Higress，需要面对学习认知成本、新开源 BUG 多等问题，同时它可能更适合内部网络（即使跨公网也能搭建 VPN），而不是我们各私有岛端（客户自定义安全策略）的网络互通。

**扩展性不足**

高速公路是一个基于 Dubbo 的跨网方案，在协议与框架层，与 Dubbo 的绑定比较深，但是它应该能做的更多。也许很快，会接入 Http、Mq 等应用协议的流量，或者 Python、Go 等语言的客户端，甚至是 Mysql 的数据互通。这个时候，要么对架构大改，要么各种兼容，这都不是我们想看到的。参考网络分层协议，我们也粗略地做了一个分层抽象规划。

![img](/imgs/v3/users/zcy-9.png)
​																	

- 物理层打通：主要解决网络异构问题，即约定不同安全策略的子域如何通信。
- 通讯协议层加速：前面讲到的应用层协议，需要做到允许独立扩展及切换。
- 语言层编译加速：业务网关可能更适合使用 Golang，然后 Java 节点是否可以用 Native 优化性能？
- 框架层功能升级：比如当前对 Dubbo 的定制开发，使用的 Apisix 中心网关是否可以扩展 dubbo 转 dubbo?
- 任务编排：业务的跨网调度，不一定是A->B->C->D，会不会是A、B同时完成后才能->C->D?
- 更上层的控制面/治理面/运维面




## 4. 未来规划

随着高速公路方案在政采云的逐渐落地，我们未来会从稳定性、功能增强、新技术探索三个方面去做深、做广：

（1）**稳定性**：基础服务的稳定性是一切的基石，而这往往是不少研发同学容易忽视的一点，研发同学需“在晴天时修屋顶”。

- **系统自身的健壮性**：资源池化隔离、QoS 保障能力建设。
- **节点实例的稳定性**：加固发现能力，持续完善异常检测工具（除了常规的健康检测，会从观测指标的不同纬度综合决策），自动进行异常实例的替换；加强数据运营，提升反馈能力。

（2）**功能增强**

- **协议增强**：当前只能对 Dubbo 流量转发，计划增加对 Http/Grpc等协议等支持，从而支持更多的场景（已有业务提此类需求）。
- **安全性增强**：在中心网关 Apisix 开发鉴权、审计等插件，更好的控制跨网的调用与被调。
- **易用性增强**：开发自动工单系统，对需要配置的事项，由业务测提工单，相应人员审核后自动配置，解放劳动力同时减少出错概率。

（3）**新技术探索**

​    网关场景，通常有个两个比较明显的特点：

- 并发量高： 多个应用复用同一个网关

- 行为轻量： 一般只有转发、权限校验等轻量操作

基于这两个特点，语言层性能开销在总性能开销中的占比，往往会业务应用更大，这个时候， Golang 等语言会比 Java更有优势。当前也在对 Dubbo-Go 调研，未来替换基于 Java 版 Dubbo 的网关应用。

另外，Higress 方案看起来不错，必定会有许多值得我们学习的东西。