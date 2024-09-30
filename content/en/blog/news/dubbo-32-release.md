---
title: "Advancing Cloud Native - Dubbo 3.2 Official Release"
linkTitle: "Advancing Cloud Native - Dubbo 3.2 Official Release"
date: 2023-04-15
tags: ["News"]
description: >
  We are very pleased to announce that Dubbo 3.2 is officially released! This version brings many new features and improvements, marking an important attempt by Dubbo in the face of cloud-native transformation.
---

## Background Introduction

Apache Dubbo is an RPC service development framework designed to solve service governance and communication issues in microservice architectures, with official SDK implementations in Java, Golang, and other languages. Microservices developed with Dubbo possess inherent capabilities for remote address discovery and communication, leveraging Dubbo's rich service governance features to fulfill service governance needs such as service discovery, load balancing, and traffic management. Dubbo is designed to be highly extensible, allowing users to easily implement various custom logic for traffic interception and location selection.

## Rest Protocol Support

### 1. Why Rest?

With the proliferation of mobile internet, more applications require integration with diverse systems. These systems may use different communication protocols, necessitating flexibility in application protocol adaptation. The Rest protocol is a very flexible protocol that communicates via HTTP, enabling integration with almost any system.

In the past, RPC frameworks typically used binary protocols for communication, which were efficient but not flexible enough. In contrast, the Rest protocol facilitates easier integration with other systems, making it more compatible with modern web and mobile applications.

In addition to flexibility, the Rest protocol is also readable and easy to use. Developers can test and debug services with universal HTTP tools (such as cURL or Postman) without requiring specific tools. Furthermore, standard HTTP methods (such as GET, POST, PUT, and DELETE) make it easier for developers to understand and use services.

### 2. How To?

In previous versions of Dubbo, Rest protocol support was provided but had the following issues:

- Only supported JAX-RS annotation domain, which is more complex compared to the more widely adopted Spring Web annotations.
  
- Required reliance on numerous external components, such as Resteasy, Tomcat, Jetty, etc., to function properly, significantly increasing usage costs.

Thus, in Dubbo 3.2, we introduced support for Spring Web annotations and native Rest protocol support without the need for any external components.

The most intuitive difference is that if you upgrade to Dubbo 3.2, services published through Spring Web can also be directly published via Dubbo. All you need to do is change the @Controller annotation to @DubboService.

Additionally, users who previously utilized Spring Boot or Spring Cloud for service division can smoothly migrate to Dubbo based on this feature, gaining Dubbo's powerful capabilities at a minimal cost.

### 3. What's next?

Dubbo will continue to improve. In addition to existing features, we will introduce the following new features to better meet demands:

1. Native support for HTTP/2 and HTTP/3 protocols. This means you can more conveniently use Dubbo to communicate with other systems without worrying about protocol compatibility issues.

2. Inspired by Spring Web annotations, Dubbo natively provides Web annotation support, allowing users to obtain the same experience as using Spring Web without relying on it.

3. Support for releasing existing services over the Rest protocol with zero modifications. This feature allows you to manage your services more flexibly without altering existing services.

## Observability System

In a microservice architecture, business systems consist of increasingly numerous services calling each other, leading to challenges in quickly locating and resolving faults. To address this, we need more tools and technologies to ensure the reliability of the entire system. One solution is to utilize logging and analysis for better tracking of application performance, identifying potential problems, and resolving them in a timely manner. Additionally, visual monitoring tools can help us understand the overall system status better, making it easier to predict and solve problems. Finally, we can employ automated testing to ensure the quality of each service and the stability and reliability of the entire system, better meeting customer needs.

A complete observability system should encompass the following functionalities:

- Metrics monitoring to collect and analyze various metrics data, including system performance and resource consumption. Through metrics monitoring, users can promptly learn about the system's operation status and address anomalies as needed.

- Tracing for distributed tracking of the invocation chains between services, helping users identify and locate potential performance issues and bottlenecks. Distributed tracing allows users to gain in-depth insights into the system's operational processes to identify possible issues and optimize them effectively.

- Logging for managing various events and operations occurring within the system, including error logs, access logs, transaction logs, etc. Through log management, users can understand system operation, fault information, etc., helping them quickly locate and address issues.

In summary, these three functionalities not only help users quickly pinpoint faults, improving system reliability and stability but also provide in-depth insights into system operation and performance, offering comprehensive monitoring and assurance.

In Dubbo 3.2, we primarily enhanced Metrics and Tracing aspects.

### 1. Metrics

On the Metrics front, we significantly increased the metrics endpoints using Micrometer, including but not limited to QPS, RT, total calls, successful counts, failure counts, and failure reason statistics for core service metrics. To better monitor service operational status, Dubbo also provides monitoring of core component statuses, such as thread pool counts and service health statuses. Furthermore, Dubbo supports standard Prometheus Pull and Push modes and offers several official native Grafana panels for production-level Metrics 24/7 monitoring.

![img](/imgs/blog/32-release/Untitled.png)

![Untitled](/imgs/blog/32-release/Untitled%201.png)

For all users, simply upgrading to Dubbo 3.2 and adding the dubbo-spring-boot-observability-starter dependency will provide Metrics capabilities. After the application starts, relevant metrics will be exposed under the Dubbo QoS metrics command, and can be accessed locally via `http://127.0.0.1:22222/metrics`. Additionally, for users utilizing Spring Actuator, Dubbo will also expose this data by default.

### 2. Tracing

In terms of Tracing, we also realized request runtime tracing based on Micrometer. We implemented this functionality via the Filter interceptor natively. We support exporting tracing data to mainstream implementations like Zipkin, Skywalking, Jaeger, etc. This enables analysis and visual display of end-to-end tracing data.

![Untitled](/imgs/blog/32-release/Untitled%202.png)

### 3. Logging

Furthermore, regarding Logging, Dubbo introduced an error code mechanism starting from version 3.1, achieving complete coverage of WARN and ERROR level logs. In abnormal scenarios, it supports fast indexing to official documentation for solutions.

## Native Image Support

In the aspect of Native Image, Dubbo will officially support Native Images based on GraalVM starting from version 3.2. Since Dubbo 3.0, there has been some exploration into Native Image support; however, usability and support levels were not ideal. From version 3.2 onwards, Dubbo will simplify user access to Native Image. This can be divided into three main areas:

1. Plugin configuration upgrade: The previous `native-image-maven-plugin` is replaced with `dubbo-maven-plugin + native-maven-plugin`, distinguishing GraalVM's native image configurations from Dubbo's requirements, simplifying the native image configurations users need to focus on.

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

Changed to:

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

1. In older versions, users needed to manually generate and complete unique Adaptive code for Dubbo; in the new version, users won't need to worry about those details.
2. In older versions, configuration files generated under `META-INF.native-image` by the Dubbo framework were directly created in users' project directories, while in the 3.2 new version, they will be compiled into the target directory, not affecting the user's project structure. Besides, the Dubbo framework will no longer adopt a manual completion method for native image, but instead use automated detection and generation of required configuration files, simplifying the developer experience. This can also reduce the size of the final compiled binary package and improve compilation speed.

In addition to usability improvements, Dubbo in version 3.2 will support API, annotation, and XML configuration methods under the native image scenario, and will be compatible with native configurations in Spring Boot 3.

## Others

### JDK 17 & Spring Boot 3 Native Support

JDK 17 is the latest LTS version of Java after JDK 11, featuring many new functionalities and improvements, such as Sealed classes, garbage collector enhancements, etc.

Since JDK 16 began restricting reflection on Java internal classes, Dubbo's serialization and dynamic proxy have been affected. In Dubbo 3.2, we resolved these compatibility issues at the underlying level through optimizations using Fastjson2 and Javassist. Currently, Dubbo can run perfectly on JDK 17, and all unit tests as well as most integration tests have passed on the JDK 17 platform.

In preparation for the upcoming JDK 21 LTS, Dubbo is actively adapting. We will add support for JDK 21 and Dubbo coroutines (Project Loom) in version 3.3.

### RPC Performance Improvements

In version 3.2, we optimized RPC invocation performance, with the following optimizations:

- Eliminated synchronized lock contention and blocking code (`triple`)
1. In version 3.1, creating an HTTP/2 Stream Channel involved synchronously blocking user threads to wait for Stream Channel creation completion. In 3.2, we made stream channel creation `asynchronous` and ensured requests were initiated only after they were created, reducing unnecessary `waiting` by user threads.
2. In version 3.1, user threads experienced synchronized lock contention with Netty's I/O threads. The I/O thread checked socket availability on every write request, and user threads utilized socket availability checks, too. However, the JDK's socket availability check implementation used `synchronized` to ensure concurrency safety, which we eliminated in user-thread checks to reduce overhead.

- Reduced request-response latency caused by synchronous blocking calls (`dubbo`, `triple`)

In version 3.1, when using SYNC mode for RPC invocation, we employed a blocking queue to wait for the response from the remote service. Upon the response's return, it would be added to the queue, waking the blocked user threads. In 3.2, we replaced blocking queues with concurrent queues, significantly reducing threads entering into blocking states by leveraging CAS mechanism, increasing CPU utilization, and reducing response processing latency.

- Reduced the number of thread switches (`triple`)

In version 3.1, SYNC mode RPC calls used a consumer thread pool for processing responses, which would wake the user thread after completion. However, analysis revealed that a consumer thread pool isn't necessary in SYNC mode. The overhead of an extra layer of consumer thread handling not only wasted server resources but also degraded performance. Therefore, we removed the consumer thread pool in version 3.2, reorganizing interaction from `NettyEventLoop → ConsumerThread → UserThread` to `NettyEventLoop → UserThread`, minimizing resource wastage and improving performance.

- Optimized I/O performance (`dubbo`, `triple`)

In version 3.1, we utilized the Netty framework for network communication, but each message sent to the counterpart triggered a direct flush, increasing system call frequencies and diminishing communication performance. In version 3.2, we optimized this by submitting messages to a write queue and, at suitable moments, writing multiple messages at once, enhancing I/O utilization and vastly improving RPC communication performance.

- Enabled message serialization on user threads (`dubbo`, `triple`)

In version 3.1, message deserialization in RPC communication was executed serially within a single I/O thread, failing to harness multi-core CPU advantages. Consequently, version 3.2 supports executing deserialization tasks on user threads to distribute pressure among I/O threads across multiple CPU cores, thereby improving RPC performance in scenarios involving `large messages`.

The performance improvements in version 3.2 compared to 3.1 are as follows:

For the Triple protocol: In smaller message scenarios like createUser, existUser, and getUser, the enhancement rate is approximately `40-45%`, with post-improvement performance roughly matching gRPC's performance in the same context. For larger message scenarios like listUser, there’s an improvement of about `17%`, which is `11%` lower compared to gRPC in the same context.

For the Dubbo protocol: In smaller message scenarios such as createUser and getUser, the improvement rate reaches around `180%`. In extremely small message scenarios like existUser (with just a boolean value), there's an enhancement of approximately `24%`, while in larger message scenarios (listUser), the performance increased maximally to `1000%`!

![Untitled](/imgs/blog/32-release/Untitled%203.png)

![Untitled](/imgs/blog/32-release/Untitled%204.png)

## How to Upgrade to Dubbo 3.2

### Pom Upgrade

The latest Dubbo Maven coordinates are:

```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo</artifactId>
    <version>3.2.0</version>
</dependency>
```

### Compatibility

For the vast majority of users, upgrading to Dubbo 3.2.0 is completely smooth, requiring only version modifications of the dependency packages.

1. Enhanced serialization verification logic (**Important**)

   As mentioned earlier, in Dubbo 3.2.0, serialization whitelist strong validation will be enabled by default to enhance Dubbo's security and prevent remote command execution issues. The existing mechanism automatically trusts some classes through package name recursion, but for users using generics or those who may have incomplete scans, we recommend upgrading to Dubbo 3.1.9 or adding the `-Ddubbo.application.serialize-check-status=WARN` configuration. After monitoring for a period (using logs, QoS commands), if no security alerts are triggered, you may configure the strong validation mode.

   For configuring custom whitelists, please refer to the official website’s documentation under `Documentation / SDK Manual / Java SDK / Advanced Features and Usage / Enhancing Security / Class Check Mechanism`.

2. Default serialization modification

   Starting from version 3.2.0, the default serialization method switches from `hessian2` to `fastjson2`. For applications upgrading to 3.2.0, Dubbo will try to utilize `fastjson2` for serialization automatically. Please note, if either the client or server has not yet upgraded to 3.2.0, `hessian2` serialization will be used to ensure compatibility.

3. Default disabling of empty push protection

   The objective of empty push protection is to retain the last batch of provider information when the registry encounters issues and actively pushes empty addresses to ensure service availability. However, in most cases, even when the registry fails, empty addresses are not pushed; special circumstances are required. Enabling this protection could significantly impact Dubbo's fallback logic and heartbeat logic, causing inconvenience to developers using Dubbo.

   If you require empty push protection for high availability in production environments, you may configure `dubbo.application.enable-empty-protection` to `true`. However, please be aware that enabling empty push protection may cause issues when rolling back server applications from only interface-level service discovery in versions `2.6.x`, `2.7.x` to the original version after upgrading to `3.x`, potentially leading to service invocation failures.

## Conclusion

Dubbo 3.2 is a highly significant version that brings many new features and enhancements, making Dubbo more powerful and user-friendly. We express our sincere gratitude to the community for their support and contributions, and we hope everyone can experience Dubbo 3.2 soon, enjoying the conveniences and advantages it offers.

