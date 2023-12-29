---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/others/graceful-shutdown/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/others/graceful-shutdown/
description: ""
linkTitle: 优雅上下线
title: 最佳实践
type: docs
weight: 7
---

## 优雅下线

### Spring Boot

### Tomcat

### Servlet

### Kubernetes

## 优雅上线

###




## 特性说明

优雅停机是指服务实例能安全平稳的停止，对进行中的业务不产生影响。
一个Dubbo服务可能既作为服务提供者，又是服务消费者，当服务停止时：
1. 消费者不会再请求已停止的服务实例
2. 该服务实例正在处理的请求能正常处理完成

## 使用场景

1. 通过 `kill PID` 停止服务
2. 通过 SpringBoot Actuator 的 `/shutdown` 停止服务

> Dubbo 3.0 及以上版本支持不同类型的Java应用，包括 SpringBoot 应用、 Spring 应用、非 Spring 应用。

## 使用方式

设置优雅停机超时时间，缺省超时时间是 10 秒，如果超时则强制关闭。
该参数可在 dubbo.properties 文件里配置，例如：配置为 30 秒。
```properties
# 停止服务等待时间，单位：毫秒
dubbo.service.shutdown.wait=30000
```

{{% alert title="注意事项" color="primary" %}}

1. Dubbo 是通过 JDK 的 ShutdownHook 来完成优雅停机的，所以如果用户使用 `kill -9 PID` 等强制关闭指令，是不会执行优雅停机的，只有通过 `kill PID` 时，才会执行。

2. 验证是否执行了 Dubbo 的 ShutdownHook 可在日志文件中查找关键字：`Run shutdown hook now.`

3. 如果使用了 Spring，请升级 4.2 及以上版本，建议使用 5 以上版本

4. 如果使用了 SpringBoot，Dubbo 的 ShutdownHook 会在 SpringBoot 的 ShutdownHook 之前执行，
如果使用 SpringBoot 2.3及以上版本，建议配合 SpringBoot 的优雅停机使用，在配置文件 applicaion.yml 中配置：
```yml
server:
  shutdown: graceful
```

5. 如果 ShutdownHook 不能生效，可根据具体场景自行调用：
```java
ApplicationModel.defaultModel().destroy();
```
{{% /alert %}}





# 特性说明
Dubbo 缺省会在启动时检查依赖的服务是否可用，不可用时会抛出异常，阻止 Spring 初始化完成，以便上线时，能及早发现问题，默认  `check="true"`。

可以通过 `check="false"` 关闭检查，比如，测试时，有些服务不关心，或者出现了循环依赖，必须有一方先启动。

另外，如果你的 Spring 容器是懒加载的，或者通过 API 编程延迟引用服务，请关闭 check，否则服务临时不可用时，会抛出异常，拿到 null 引用，如果 `check="false"`，总是会返回引用，当服务恢复时，能自动连上。

## 使用场景

- 单向依赖：有依赖关系（建议默认设置）和无依赖关系（可以设置 check=false）
- 相互依赖：即循环依赖，(不建议设置 check=false)
- 延迟加载处理

> check 只用来启动时检查，运行时没有相应的依赖仍然会报错。

## 使用方式

**配置含义**

`dubbo.reference.com.foo.BarService.check`，覆盖 `com.foo.BarService`的 reference 的 check 值，就算配置中有声明，也会被覆盖。

`dubbo.consumer.check=false`，是设置 reference 的 `check` 的缺省值，如果配置中有显式的声明，如：`<dubbo:reference check="true"/>`，不会受影响。

`dubbo.registry.check=false`，前面两个都是指订阅成功，但提供者列表是否为空是否报错，如果注册订阅失败时，也允许启动，需使用此选项，将在后台定时重试。

### 通过 spring 配置文件

关闭某个服务的启动时检查

```xml
<dubbo:reference interface="com.foo.BarService" check="false" />
```

关闭所有服务的启动时检查

```xml
<dubbo:consumer check="false" />
```

关闭注册中心启动时检查

```xml
<dubbo:registry check="false" />
```

### 通过 dubbo.properties

```properties
dubbo.reference.com.foo.BarService.check=false
dubbo.consumer.check=false
dubbo.registry.check=false
```

### 通过 -D 参数

```sh
java -Ddubbo.reference.com.foo.BarService.check=false
java -Ddubbo.consumer.check=false
java -Ddubbo.registry.check=false
```
