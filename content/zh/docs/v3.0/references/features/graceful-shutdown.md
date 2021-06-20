---
type: docs
title: "优雅停机"
linkTitle: "优雅停机"
weight: 36
description: "让 Dubbo 服务完成优雅停机"
---

Dubbo 是通过 JDK 的 ShutdownHook 来完成优雅停机的，所以如果用户使用 `kill -9 PID` 等强制关闭指令，是不会执行优雅停机的，只有通过 `kill PID` 时，才会执行。

## 原理

服务提供方

* 停止时，先标记为不接收新请求，新请求过来时直接报错，让客户端重试其它机器。
* 然后，检测线程池中的线程是否正在运行，如果有，等待所有线程执行完成，除非超时，则强制关闭。

服务消费方

* 停止时，不再发起新的调用请求，所有新的调用在客户端即报错。
* 然后，检测有没有请求的响应还没有返回，等待响应返回，除非超时，则强制关闭。

## 设置方式

设置优雅停机超时时间，缺省超时时间是 10 秒，如果超时则强制关闭。

```properties
# dubbo.properties
dubbo.service.shutdown.wait=15000
```

如果 ShutdownHook 不能生效，可以自行调用：

```java
DubboShutdownHook.destroyAll();
```

{{% alert title="建议" color="primary" %}}
使用 tomcat 等容器部署的场景，建议通过扩展 ContextListener 等自行调用以下代码实现优雅停机
{{% /alert %}}

