---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/service/local-call/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/service/local-call/
description: 在 Dubbo 中进行本地调用
linkTitle: 本地调用
title: 本地调用
type: docs
weight: 22
---






## 特性说明
本地调用使用了 injvm 协议，是一个伪协议，它不开启端口，不发起远程调用，只在 JVM 内直接关联，但执行 Dubbo 的 Filter 链。

## 使用场景

当我们需要调用远程服务时，远程服务并没有开发完成，使用 injvm 协议在本地实现类似服务，调用此服务时可以调用我们本地的实现服务。

## 使用方式

### 定义 injvm 协议
```xml
<dubbo:protocol name="injvm" />
```

### 设置默认协议

```xml
<dubbo:provider protocol="injvm" />
```

### 设置服务协议

```xml
<dubbo:service protocol="injvm" />
```

### 优先使用 injvm

```xml
<dubbo:consumer injvm="true" .../>
<dubbo:provider injvm="true" .../>
```

**或**

```xml
<dubbo:reference injvm="true" .../>
<dubbo:service injvm="true" .../>
```

{{% alert title="注意" color="warning" %}}
**Dubbo 从 `2.2.0` 每个服务默认都会在本地暴露，无需进行任何配置即可进行本地引用，如果不希望服务进行远程暴露，只需要在 provider 将 protocol 设置成 injvm 即可。**
{{% /alert %}}


### 自动暴露

从 `2.2.0` 开始，每个服务默认都会在本地暴露。在引用服务的时候，默认优先引用本地服务。如果希望引用远程服务可以使用一下配置强制引用远程服务。

```xml
<dubbo:reference ... scope="remote" />
```


### 动态配置调用行为

从`3.2`开始，Dubbo提供api可以让用户在使用中动态地去配置单一次调用时为本地调用或者远程调用，当没配置的时候将默认优先引用本地服务

**配置单一次调用为远程调用**

```java
RpcContext.getServiceContext().setLocalInvoke(false);
```

**配置单一次调用为本地调用**

```java
RpcContext.getServiceContext().setLocalInvoker(true);
```

