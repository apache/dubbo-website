---
title: "精进云原生 - Dubbo 3.2 正式发布"
linkTitle: "精进云原生 - Dubbo 3.2 正式发布"
date: 2023-04-15
tags: ["新闻动态"]
description: >
  我们非常高兴地宣布，Dubbo 3.2 已经正式发布了！这个版本带来了许多新功能和改进，这也是 Dubbo 在面对云原生化的当下的一次重要的尝试。
---

## 背景介绍

Apache Dubbo 是一款 RPC 服务开发框架，用于解决微服务架构下的服务治理与通信问题，官方提供了 Java、Golang 等多语言 SDK 实现。使用 Dubbo 开发的微服务原生具备相互之间的远程地址发现与通信能力， 利用 Dubbo 提供的丰富服务治理特性，可以实现诸如服务发现、负载均衡、流量调度等服务治理诉求。Dubbo 被设计为高度可扩展，用户可以方便的实现流量拦截、选址的各种定制逻辑。

## Rest 协议支持

### 1. Why Rest？

随着移动互联网的普及，越来越多的应用程序需要与不同的系统进行集成。而这些系统可能使用不同的通信协议，这就需要应用程序能够灵活地适应各种协议。Rest 协议正是一种非常灵活的协议，它使用 HTTP 进行通信，可以与几乎任何系统进行集成。

在过去，RPC框架通常使用二进制协议进行通信，这种协议非常高效，但不够灵活。相比之下，Rest协议使用HTTP进行通信，更方便与其他系统集成，也更容易与现代化的Web和移动应用程序集成。

除了灵活性，Rest协议还具有易读性和易用性。使用Rest协议，开发人员可以使用通用的HTTP工具（例如cURL或Postman）测试和调试服务，而不需要特定的工具。此外，由于Rest协议使用标准的HTTP方法（例如GET、POST、PUT和DELETE），因此开发人员可以更容易地理解和使用服务。

### 2. How To？

在之前的 Dubbo 版本中，也提供了 Rest 协议的支持，但存在以下问题：

- 仅支持 JAX-RS 注解域，相较于采用度更高的 Spring Web 注解，复杂度更高

- 需要依赖众多外部组件，如 Resteasy、tomcat、jetty 等，才能正常工作，极大地增加了使用成本。

因此，在 Dubbo 3.2 版本中，我们引入了 Spring Web 注解域的支持以及 Rest 协议的原生支持，无需依赖任何外部组件。

最直观的区别是，如果你升级到了 Dubbo 3.2，通过 Spring Web 发布的服务也可以直接通过 Dubbo 来发布。这一切只需要将 @Controller 注解改成 @DubboService 注解即可。

此外，对于原来使用 Spring Boot 或者 Spring Cloud 作为服务拆分的用户，也可以基于本功能平滑地迁移到 Dubbo 上来，以极低的成本获得 Dubbo 强大的能力。

### 3. What's next？

接下来 Dubbo 还将继续完善。除了现有的特性，我们还将加入以下新的特性，以更好地满足需求：

1. HTTP/2、HTTP/3 协议的原生支持。这意味着，你可以更加方便地使用 Dubbo 与其他系统进行通信，无需担心协议的兼容性问题。

2. 参考 Spring Web 注解，Dubbo 原生提供 Web 注解的支持，使得用户无需依赖 Spring Web 也可以获得与使用 Spring Web 相同的体验。

3. 支持现有服务零改造以 Rest 协议发布。这个特性可以让你更加灵活地管理你的服务，而无需对现有的服务进行任何改动。你可以通过 Rest 协议来发布你的服务，这样你的服务就可以更加方便地被其他系统所使用了。

## 可观测体系

在微服务架构下，业务系统由越来越多的服务组成，服务之间互相调用，随之而来的问题是如何快速地定位故障，并及时解决。为了解决这一问题，我们需要更多的工具和技术来确保整个系统的可靠性。其中一个解决方案是使用日志记录和分析，以便可以更好地跟踪应用程序的运行情况，找到潜在的问题并及时解决。另外，使用可视化的监控工具可以帮助我们更好地理解整个系统的状态，从而更好地预测和解决问题。最后，我们还可以使用自动化测试来确保每个服务的质量，以及整个系统的稳定性和可靠性，从而更好地满足客户的需求。

一套完整的可观测体系应该包括以下功能：

- Metrics 指标监控，用于收集和分析各种指标数据，包括系统的性能、资源消耗情况等等。通过指标监控，用户可以及时了解系统的运行情况，发现异常并做出相应的处理。

- Tracing 分布式追踪，用于跟踪系统中各个服务之间的调用链路，帮助用户发现和定位潜在的性能问题、瓶颈等等。通过分布式追踪，用户可以深入了解系统的运作过程，识别出可能存在的问题并进行有效的优化和调整。

- Logging 日志管理，用于记录系统中发生的各种事件和操作，包括错误日志、访问日志、事务日志等等。通过日志管理，用户可以了解系统的运行情况、故障信息等等，帮助用户快速定位问题并进行相应的处理。

综上所述，以上三个功能不仅可以帮助用户快速定位故障，提高系统的可靠性和稳定性，还可以帮助用户深入了解系统的运行情况和性能状况，为用户提供全方位的监控和保障。

在 Dubbo 3.2 版本中，我们主要就 Metrics 和 Tracing 两个方面进行了增强。

### 1. Metrics

在 Metrics 方面，我们使用 Micrometer 大幅增加了指标的埋点，包括但不限于 QPS、RT、调用总数、成功数、失败数、失败原因统计等核心服务指标。为了更好地监测服务运行状态，Dubbo 还提供了对核心组件状态的监控，例如线程池数量、服务健康状态等。此外，Dubbo 还支持标准 Prometheus 的 Pull 和 Push 模式，并提供了若干个官方原生的 Grafana 面板，实现面向生产的 Metrics 全天候观测。

![img](/imgs/blog/32-release/Untitled.png)


![Untitled](/imgs/blog/32-release/Untitled%201.png)

对于所有的用户，只需要升级到 Dubbo 3.2 版本，并添加 dubbo-spring-boot-observability-starter 依赖即可获得 Metrics 能力。在应用启动后，将在 Dubbo QoS 的 metrics 命令下暴露相关的指标，本地可以通过 `http://127.0.0.1:22222/metrics` 获取。此外对于使用了 Spring Actuator 的用户，Dubbo 也将默认将这些数据暴露出来。

### Tracing

在 Tracing 方面，我们还基于 Micrometer 实现了请求运行时的埋点跟踪。我们通过 Filter 拦截器原生方式来实现这一功能。我们支持将跟踪数据导出到一些主流实现，例如 Zipkin、Skywalking、Jaeger 等。这样就可以实现全链路跟踪数据的分析和可视化展示。

![Untitled](/imgs/blog/32-release/Untitled%202.png)

### Logging

此外，对于 Logging 方面，Dubbo 从 3.1 版本开始引入了错误码机制，实现了 WARN、ERROR 级别日志的全覆盖。在异常场景下，支持快速索引官网解决文档。

## Native Image 原生支持

在Native Image方面，Dubbo从3.2开始将正式基于GraalVM完成对Native Image 的支持，从Dubbo3.0开始，Dubbo已经有一些Native Image支持的探索，但是易用性和支持程度都不太理想，从3.2版本开始，Dubbo将会简化用户接入Native Image的使用方式。主要可以分为三个面：

1. 编译插件配置升级：从最初的 native-image-maven-plugin 改为 dubbo-maven-plugin +native-maven-plugin，区分了Graalvm官方提供的native image配置与Dubbo所需的native image配置，简化了用户所需要关心的native image配置

```xml
<plugin>
	<groupId>org.graalvm.nativeimage</groupId>
	<artifactId>native-image-maven-plugin</artifactId>
	<version>21.0.0.2</version>
	<executions>
	    <execution>
	        <goals>
	            <goal>native-image</goal>
	        </goals>
	        <phase>package</phase>
	    </execution>
	</executions>
	<configuration>
	    <skip>false</skip>
	    <imageName>demo-native-provider</imageName>
	    <mainClass>org.apache.dubbo.demo.graalvm.provider.Application</mainClass>
	    <buildArgs>
	        --no-fallback
	        --initialize-at-build-time=org.slf4j.MDC
	        --initialize-at-build-time=org.slf4j.LoggerFactory
	        --initialize-at-build-time=org.slf4j.impl.StaticLoggerBinder
	        --initialize-at-build-time=org.apache.log4j.helpers.Loader
	        --initialize-at-build-time=org.apache.log4j.Logger
	        --initialize-at-build-time=org.apache.log4j.helpers.LogLog
	        --initialize-at-build-time=org.apache.log4j.LogManager
	        --initialize-at-build-time=org.apache.log4j.spi.LoggingEvent
	        --initialize-at-build-time=org.slf4j.impl.Log4jLoggerFactory
	        --initialize-at-build-time=org.slf4j.impl.Log4jLoggerAdapter
	        --initialize-at-build-time=org.eclipse.collections.api.factory.Sets
	        --initialize-at-run-time=io.netty.channel.epoll.Epoll
	        --initialize-at-run-time=io.netty.channel.epoll.Native
	        --initialize-at-run-time=io.netty.channel.epoll.EpollEventLoop
	        --initialize-at-run-time=io.netty.channel.epoll.EpollEventArray
	        --initialize-at-run-time=io.netty.channel.DefaultFileRegion
	        --initialize-at-run-time=io.netty.channel.kqueue.KQueueEventArray
	        --initialize-at-run-time=io.netty.channel.kqueue.KQueueEventLoop
	        --initialize-at-run-time=io.netty.channel.kqueue.Native
	        --initialize-at-run-time=io.netty.channel.unix.Errors
	        --initialize-at-run-time=io.netty.channel.unix.IovArray
	        --initialize-at-run-time=io.netty.channel.unix.Limits
	        --initialize-at-run-time=io.netty.util.internal.logging.Log4JLogger
	        --initialize-at-run-time=io.netty.channel.unix.Socket
	        --initialize-at-run-time=io.netty.channel.ChannelHandlerMask
	        --report-unsupported-elements-at-runtime
	        --allow-incomplete-classpath
	        --enable-url-protocols=http
	        -H:+ReportExceptionStackTraces
	    </buildArgs>
	</configuration>
</plugin>
```

变为：

```xml
<plugin>
	<groupId>org.graalvm.buildtools</groupId>
	<artifactId>native-maven-plugin</artifactId>
	<version>0.9.20</version>
	<configuration>
	    <classesDirectory>${project.build.outputDirectory}</classesDirectory>
	    <metadataRepository>
	        <enabled>true</enabled>
	    </metadataRepository>
	    <requiredVersion>22.3</requiredVersion>
	    <mainClass>org.apache.dubbo.demo.graalvm.provider.Application</mainClass>
	</configuration>
</plugin>
<plugin>
	<groupId>org.apache.dubbo</groupId>
	<artifactId>dubbo-maven-plugin</artifactId>
	<version>${project.version}</version>
	<configuration>
	    <mainClass>org.apache.dubbo.demo.graalvm.provider.Application</mainClass>
	</configuration>
	<executions>
	    <execution>
	        <phase>process-sources</phase>
	        <goals>
	            <goal>dubbo-process-aot</goal>
	        </goals>
	    </execution>
	</executions>
</plugin>
```

1. 旧版本中需要用户手动生成和补全Dubbo内独有的Adaptive代码，新版本用户将不需要关心这些细节。
2. 旧版本中Dubbo框架生成的META-INF.native-image下的配置文件会直接生成在用户的工程目录中，3.2新版本将会被编译到target下，不影响用户的工程结构。除此之外，Dubbo框架也将不再采用手动补全native image的方式，而且采用自动探测和生成所需的配置文件的方式，简化了Dubbo开发者的体验。这也能够降低最后编译后的二进制包的大小和提高编译速度。

除了易用性提升以外，Dubbo将在3.2版本将在native image场景下支持API、注解以及XML配置方式，并支持与SpringBoot3中的native兼容。

## 其他

### JDK 17 & Spring Boot 3 原生支持

JDK 17 是继 JDK 11 之后目前 Java 的最新 LTS 版本，包括许多新功能和改进，例如 Sealed 类、垃圾收集器的改进等等。

自从 JDK 16 开始限制 Java 内部类反射以后，Dubbo 的序列化以及动态代理都受到了一定的影响。在 Dubbo 3.2 中，我们通过 Fastjson2 以及 Javassist 的优化从底层解决了兼容性问题。目前 Dubbo 已经可以完美运行在 JDK17 之上，所有单元测试以及大多数集成测试也都在 JDK 17 平台上测试通过。

针对即将发布的 JDK 21 LTS，Dubbo 正在紧锣密鼓地进行适配。我们将在 3.3 版本中加入对 JDK 21 和 Dubbo 协程（Project Loom）的支持。

### RPC 性能大幅提升

在3.2版本中，我们对RPC调用性能做了调优，其中优化内容如下。

- 消除了同步锁竞争以及会出现阻塞的代码(`triple`)
    1. 在3.1版本中创建HTTP/2 Stream Channel时采用了同步阻塞用户线程的方式等待Stream Channel创建完成，创建完成后才开始发起远程调用。而在3.2中我们将创建HTTP/2 Stream Channel的行为`异步化`并保证创建完毕后才发起请求，以此`减少了用户线程不必要的等待`。
    2. 在3.1版本中用户线程与Netty的I/O线程出现了同步锁竞争，IO线程每次写请求都会检查Socket可用性，而用户线程中也使用了Socket可用性检查的方法，但JDK中Socket可用性检查的实现使用了 `synchronized` 来保证并发安全，为了减少这部分的耗时我们将用户线程的检查移除，消除了该部分的耗时。
- 减少了用同步阻塞调用方式的请求响应延迟(`dubbo`、`triple`)

  在3.1版本中SYNC模式下的RPC调用我们使用了阻塞队列的方式等待远程服务写回的响应，当响应写回后会添加到队列中并唤醒被阻塞的用户线程。而在3.2中我们将阻塞队列更换为并发队列，利用其CAS的机制大幅度减少线程进入阻塞的次数，提高CPU利用率并降低了响应处理延迟

- 减少了线程切换的次数(`triple`)

  在3.1版本中SYNC模式下的RPC调用在接收响应时使用了一个消费者线程池进行处理，处理完毕后才唤醒用户线程接收响应。但通过分析SYNC模式下的消费者线程池是不必要的，多了一层消费者线程池处理不仅浪费服务器资源还降低了性能，因此我们在3.2版本中将SYNC模式下消费者线程池移除，交互模型由 `NettyEventLoop → ConsumerThread → UserThread`变成了`NettyEventLoop → UserThread`，以此减少服务器资源的浪费同时提高了性能

- 优化了I/O性能(`dubbo`、`triple`)

  在3.1版本中我们利用了Netty框架实现了网络通讯，但每次往对端写消息时都直接刷写到对端导致系统调用次数极高，降低了通讯性能。为此我们在3.2版本中对该进行了优化，每次发消息时是先将消息提交到一个写队列中，并在合适的时机将多个消息一次性写出，以此提高了I/O利用率，大幅度提高RPC通讯性能。

- 支持在用户线程上序列化报文(`dubbo`、`triple`)

  在3.1版本中RPC通讯中的报文反序列化均是在单一I/O线程中串行执行的，导致无法利用多核CPU的优势。为此我们在3.2版本中支持了在用户线程上执行反序列化这类较为耗时的任务，将I/O线程的压力均分到多个CPU核心上，以此提高了`较大报文`场景下的RPC性能。


3.2对比3.1的性能提升如下：

Triple协议：较小报文场景createUser、existUser、getUser下，提升率约在`40-45%`，提升后的性能与gRPC同场景的性能基本持平。较大报文场景listUser下提升了约`17%`，相较于同场景下的gRPC还低`11%`。

Dubbo协议：较小报文场景createUser、getUser下，提升率约`180%`。极小报文existUser(仅一个boolean值)下提升率约`24%`，而较大报文listUser提升率最高，达到了`1000%`！

![Untitled](/imgs/blog/32-release/Untitled%203.png)

![Untitled](/imgs/blog/32-release/Untitled%204.png)

## 如何升级到 Dubbo 3.2

### Pom 升级

最新的 Dubbo Maven 坐标为：

```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo</artifactId>
    <version>3.2.0</version>
</dependency>
```

### 兼容性

对于绝大多数的用户，升级到 Dubbo 3.2.0 是完全平滑的，仅需要修改依赖包版本即可。

1. 序列化校验逻辑的增强（**重要**）

   如前文所述，在 Dubbo 3.2.0 版本中，Dubbo 将默认开启序列化白名单的强校验，以提升 Dubbo 的安全性，避免远程命令执行的问题。目前的机制通过包名递归机制自动信任了部分类，但对于一些使用了泛型等可能存在扫描不全的用户，我们建议您先升级到 Dubbo 3.1.9 版本或添加 `-Ddubbo.application.serialize-check-status=WARN` 配置。观察一段时间后（通过日志、QoS 命令），如果没有触发安全告警，则可以配置强校验模式。

   关于自定义白名单的配置，可以参考官网的 `文档 / SDK 手册 / Java SDK / 高级特性和用法 / 提升安全性 / 类检查机制` 一文进行配置。

2. 默认序列化的修改

   Dubbo 3.2.0 版本开始默认序列化方式从 `hessian2` 切换为 `fastjson2`，对于升级到 3.2.0 的应用，Dubbo 会自动尝试采用 `fastjson2` 进行序列化。请注意，无论是客户端还是服务端，只要有一端还没有升级到 3.2.0，都将降级为 `hessian2` 序列化，保证兼容性。

3. 默认关闭推空保护

   推空保护的目的是在注册中心出现故障并且主动推送空地址的时候，Dubbo 保留最后一批 provider 信息，以保证服务可用。但是，在大多数情况下，即使注册中心出现故障，也不会推送空地址，只有在一些特殊情况下才会出现。如果开启推空保护，则会对 Dubbo 的 Fallback 逻辑、心跳逻辑等造成较大的影响，给开发人员使用 Dubbo 带来困扰。

   如果在生产环境中需要开启推空保护以实现高可用性，可以将 `dubbo.application.enable-empty-protection` 配置为 `true`。但是请注意，已知开启推空保护会导致服务端应用从仅支持接口级服务发现的 `2.6.x`、`2.7.x` 版本升级到 `3.x` 之后回滚到原来的版本时出现异常，极端情况下可能会导致服务调用失败。


## 总结

Dubbo 3.2 是一个非常重要的版本，它带来了众多新功能和改进，使得 Dubbo 更加强大和易用。我们非常感谢社区的支持和贡献，希望大家可以尽快体验 Dubbo 3.2，享受其中带来的便利和优势。
