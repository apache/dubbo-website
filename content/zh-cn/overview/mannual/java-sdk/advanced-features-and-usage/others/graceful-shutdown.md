---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/others/graceful-shutdown/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/others/graceful-shutdown/
description: 让 Dubbo 服务完成优雅停机
linkTitle: 优雅停机
title: 优雅停机
type: docs
weight: 2
---
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
