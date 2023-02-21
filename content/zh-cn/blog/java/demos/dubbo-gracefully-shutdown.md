---
title: "Dubbo 优雅停机"
linkTitle: "Dubbo 优雅停机"
tags: ["Java"]
date: 2018-08-14
description: > 
    本文介绍了Dubbo优雅停机的原理和使用方式
---

## 背景

对于任何一个线上应用，如何在服务更新部署过程中保证客户端无感知是开发者必须要解决的问题，即从应用停止到重启恢复服务这个阶段不能影响正常的业务请求。理想条件下，在没有请求的时候再进行更新是最安全可靠的，然而互联网应用必须要保证可用性，因此在技术层面上优化应用更新流程来保证服务在更新时无损是必要的。

传统的解决方式是通过将应用更新流程划分为手工摘流量、停应用、更新重启三个步骤，由人工操作实现客户端无对更新感知。这种方式简单而有效，但是限制较多：不仅需要使用借助网关的支持来摘流量，还需要在停应用前人工判断来保证在途请求已经处理完毕。这种需要人工介入的方式运维复杂度较高，只能适用规模较小的应用，无法在大规模系统上使用。

因此，如果在容器/框架级别提供某种自动化机制，来自动进行摘流量并确保处理完以到达的请求，不仅能保证业务不受更新影响，还可以极大地提升更新应用时的运维效率。

这个机制也就是优雅停机，目前Tomcat/Undertow/Dubbo等容器/框架都有提供相关实现。下面给出正式一些的定义：优雅停机是指在停止应用时，执行的一系列保证应用正常关闭的操作。这些操作往往包括等待已有请求执行完成、关闭线程、关闭连接和释放资源等，优雅停机可以避免非正常关闭程序可能造成数据异常或丢失，应用异常等问题。优雅停机本质上是JVM即将关闭前执行的一些额外的处理代码。

## 适用场景

- JVM主动关闭(`System.exit(int)`；
- JVM由于资源问题退出(`OOM`)；
- 应用程序接受到`SIGTERM`或`SIGINT`信号。

## 配置方式
### 服务的优雅停机
在Dubbo中，优雅停机是默认开启的，停机等待时间为10000毫秒。可以通过配置`dubbo.service.shutdown.wait`来修改等待时间。

例如将等待时间设置为20秒可通过增加以下配置实现：

```shell
dubbo.service.shutdown.wait=20000
```

### 容器的优雅停机
当使用`org.apache.dubbo.container.Main`这种容器方式来使用 Dubbo 时，也可以通过配置`dubbo.shutdown.hook`为`true`来开启优雅停机。

### 通过QOS优雅上下线

基于`ShutdownHook`方式的优雅停机无法确保所有关闭流程一定执行完，所以 Dubbo 推出了多段关闭的方式来保证服务完全无损。

多段关闭即将停止应用分为多个步骤，通过运维自动化脚本或手工操作的方式来保证脚本每一阶段都能执行完毕。

在关闭应用前，首先通过 QOS 的`offline`指令下线所有服务，然后等待一定时间确保已经到达请求全部处理完毕，由于服务已经在注册中心下线，当前应用不会有新的请求。这时再执行真正的关闭(`SIGTERM` 或` SIGINT`)流程，就能保证服务无损。

QOS可通过 telnet 或 HTTP 方式使用，具体方式请见[Dubbo-QOS命令使用说明](/zh-cn/docsv2.7/user/references/qos/)。

## 流程

Provider在接收到停机指令后

- 从注册中心上注销所有服务；
- 从配置中心取消监听动态配置；
- 向所有连接的客户端发送只读事件，停止接收新请求；
- 等待一段时间以处理已到达的请求，然后关闭请求处理线程池；
- 断开所有客户端连接。

Consumer在接收到停机指令后

- 拒绝新到请求，直接返回调用异常；
- 等待当前已发送请求执行完毕，如果响应超时则强制关闭连接。

当使用容器方式运行 Dubbo 时，在容器准备退出前，可进行一系列的资源释放和清理工。

例如使用 SpringContainer时，Dubbo 的ShutdownHook线程会执行`ApplicationContext`的`stop`和`close`方法，保证 Bean的生命周期完整。

## 实现原理

1. 在加载类`org.apache.dubbo.config.AbstractConfig`时，通过`org.apache.dubbo.config.DubboShutdownHook`向JVM注册 ShutdownHook。

   ```java
   /**
    * Register the ShutdownHook
    */
   public void register() {
       if (!registered.get() && registered.compareAndSet(false, true)) {
           Runtime.getRuntime().addShutdownHook(getDubboShutdownHook());
       }
   }
   ```

2. 每个ShutdownHook都是一个单独的线程，由JVM在退出时触发执行`org.apache.dubbo.config.DubboShutdownHook`。

   ```java
   /**
    * Destroy all the resources, including registries and protocols.
    */
   public void doDestroy() {
       if (!destroyed.compareAndSet(false, true)) {
           return;
       }
       // destroy all the registries
       AbstractRegistryFactory.destroyAll();
       // destroy all the protocols
       destroyProtocols();
   }
   ```

3. 首先关闭所有注册中心，这一步包括：
   - 从注册中心注销所有已经发布的服务；
   - 取消订阅当前应用所有依赖的服务；
   - 断开与注册中心的连接。
4. 执行所有`Protocol`的`destroy()`，主要包括：
   - 销毁所有`Invoker`和`Exporter`；
   - 关闭Server，向所有已连接Client发送当前Server只读事件；
   - 关闭独享/共享Client，断开连接，取消超时和重试任务；
   - 释放所有相关资源。
5. 执行完毕，关闭JVM。

## 注意事项

- 使用`SIGKILL`关闭应用不会执行优雅停机；
- 优雅停机不保证会等待所有已发送/到达请求结束；
- 配置的优雅停机等待时间`timeout`不是所有步骤等待时间的总和，而是每一个`destroy`执行的最大时间。例如配置等待时间为5秒，则关闭Server、关闭Client等步骤会分别等待5秒。
