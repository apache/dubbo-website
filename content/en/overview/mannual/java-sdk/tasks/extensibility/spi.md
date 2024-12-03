---
description: "Description of the SPI plugin extension mechanism of Dubbo, explaining the basic steps to customize SPI extensions."
linkTitle: How to customize extensions
title: "Basic Steps to Customize SPI Extensions"
type: docs
weight: 1
---

Taking the `RPC Protocol Plugin` as an example, this section demonstrates how to use the SPI plugin provided by Dubbo to provide a custom RPC protocol implementation. If you want to understand how the SPI mechanism works and the list of built-in SPI extension points in the framework, please refer to the [Reference Manual - SPI Extension](/en/overview/mannual/java-sdk/reference-manual/spi/overview).

## 1. Provide SPI Plugin Implementation Class
Provide a Java class that implements the `org.apache.dubbo.rpc.Protocol` interface.

```java
package com.spi.demo;
import org.apache.dubbo.rpc.Protocol;

@Activate
public class CustomizedProtocol implements Protocol {
	// ...
}
```

## 2. Configure Implementation Class in the Specified File

Add a `org.apache.dubbo.rpc.Protocol` file in the application's `resources/META-INF/services/` directory, and include the following configuration in the file:

```properties
customized=com.spi.demo.CustomizedProtocol
```

{{% alert title="Configuration Notes" color="info" %}}
* The file name must be the full package path defined by the SPI plugin, depending on the SPI definition you want to extend, such as `resources/META-INF/services/org.apache.dubbo.rpc.Protocol` in this example.
* The content of the file must be in the `key=value` format, where `key` can be defined arbitrarily, but it is recommended to add a specific prefix to avoid name collisions with Dubbo's built-in implementations; `value` must be the full path name of the implementation class.
{{% /alert %}}

## 3. Enable Custom Protocol Implementation Through Configuration

Modify the protocol configuration in the application to tell the Dubbo framework to use the custom protocol:

```yaml
# For Spring Boot, you can modify application.yml or application.properties
dubbo
  protocol
    name: customized
```

or

```java
ProtocolConfig protocol = new ProtocolConfig();
protocol.setName("cutomized");
```

## 4. More Examples

If you want to see more complete examples, please refer to other examples in this directory:
* [Custom Protocol Extension](../protocol)
* [Custom Filter Extension](../filter)
* [Custom Registry Extension](../registry)
* [Custom Router Extension](../router)

