---
aliases:
    - /zh/overview/what/ecosystem/serialization/fastjson/
    - /zh-cn/overview/what/ecosystem/serialization/fastjson/
description: "本文介绍基于 Java 接口模式开发 triple 服务时，底层的序列化机制实现。"
linkTitle: Protobuf Wrapper
title: 基于 Java 接口模式开发 triple 服务时，底层的序列化机制实现
type: docs
weight: 2
---

## 1 介绍

Dubbo 实现的 triple 协议易用性更好（不绑定 Protobuf），开发者可以继续使用 Java 接口 直接定义服务。对于期望平滑升级、没有多语言业务或者不熟悉 Protobuf 的用户而言，Java 接口方式是最简单的使用 triple 的方式。

以下介绍这种协议模式下的底层序列化细节：框架会用一个内置的 protobuf 对象将 request 和 response 进行包装（wrapper），**也就是对象会被序列化两次，第一次是使用如 `serialization=hessian` 指定的方式进行序列化，第二次是用 protobuf wrapper 对第一步中序列化后的 byte[] 进行包装后传输**。


## 2 使用方式

**在使用 [Java 接口方式开发 triple 通信服务](/zh-cn/overview/mannual/java-sdk/tasks/protocols/triple/idl/) 的时候，dubbo server 将自动启用 protobuf、protobuf-json 序列化模式支持。**

### 2.1 添加依赖

使用 triple 协议，必须先添加如下依赖：

```xml
<dependencies>
	<dependency>
		<groupId>com.google.protobuf</groupId>
		<artifactId>protobuf-java</artifactId>
		<version>3.19.6</version>
	</dependency>
	<!-- 提供 protobuf-json 格式请求支持 -->>
	<dependency>
		<groupId>com.google.protobuf</groupId>
		<artifactId>protobuf-java-util</artifactId>
		<version>3.19.6</version>
	</dependency>
</dependencies>
```

### 2.2 配置启用
只要是基于 [Java 接口方式模式使用 triple 协议](/zh-cn/overview/mannual/java-sdk/tasks/protocols/triple/idl/) ，就会使用 protobuf wrapper 序列化，只要定义 Java 接口并启用 triple 协议即可：

通过 Java 接口定义 Dubbo 服务：
```java
public interface GreetingsService {
    String sayHi(String name);
}
```


配置使用 triple 协议（如果要设置底层使用的序列化协议，需要继续设置 serialization，如 hessian、msgpack 等）：

```yaml
# application.yml (Spring Boot)
dubbo:
 protocol:
   name: tri
   serialization: hessian
```
或
```properties
# dubbo.properties
dubbo.protocol.name=tri
dubbo.protocol.serialization=hessian
```

或
```xml
<dubbo:protocol name="tri" serialization="hessian"/>

