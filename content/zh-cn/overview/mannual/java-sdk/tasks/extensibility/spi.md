---
description: "Dubbo 的 SPI 插件扩展机制说明，讲解自定义 SPI 扩展的基本步骤。"
linkTitle: 如何自定义扩展
title: "自定义 SPI 扩展的基本步骤"
type: docs
weight: 1
---

下面以 `RPC 协议插件` 为例，说明如何利用 Dubbo 提供的 SPI 插件提供一个自定义的 RPC 协议实现。如果想了解 SPI 机制的工作原理以及框架内置的 SPI 扩展点列表，请查看 [参考手册 - SPI扩展](/zh-cn/overview/mannual/java-sdk/reference-manual/spi/overview)。

## 1. 提供 SPI 插件实现类
提供一个 Java 类实现 `org.apache.dubbo.rpc.Protocol` 接口。

```java
package com.spi.demo;
import org.apache.dubbo.rpc.Protocol;

@Activate
public class CustomizedProtocol implements Protocol {
	// ...
}
```

## 2. 在指定文件配置实现类

在应用 `resources/META-INF/services/` 目录下添加 `org.apache.dubbo.rpc.Protocol` 文件，文件中增加如下配置：

```properties
customized=com.spi.demo.CustomizedProtocol
```

{{% alert title="配置注意事项" color="info" %}}
* 文件名必须为 SPI 插件定义的 package 全路径名，具体取决于你要扩展的 SPI 定义，如示例中的 `resources/META-INF/services/org.apache.dubbo.rpc.Protocol`。
* 文件中的内容必须是 `key=value` 形式，其中 `key` 可随便定义，但建议增加特定前缀以避免与 Dubbo 内置实现重名，`value` 必须设置为扩展类实现的全路径名。
{{% /alert %}}

## 3. 通过配置启用自定义协议实现

在应用中修改协议配置，告诉 Dubbo 框架使用自定义协议：

```yaml
# 使用 Spring Boot，可修改 application.yml 或 application.properties
dubbo
  protocol
    name: customized
```

或者

```java
ProtocolConfig protocol = new ProtocolConfig();
protocol.setName("cutomized");
```

## 4. 更多示例

如果你想了解更完整示例，请查看本目录下的其他示例：
* [自定义协议扩展](../protocol)
* [自定义拦截器扩展](../filter)
* [自定义注册中心扩展](../registry)
* [自定义路由器扩展](../router)





