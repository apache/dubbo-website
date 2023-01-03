---
type: docs
title: "Direct Connection Provider"
linkTitle: "Direct Link Provider"
weight: 5
description: "Direct point-to-point connection in Dubbo"
---

{{% pageinfo %}} This document is no longer maintained. You are currently viewing a snapshot version. If you want to view the latest version of the documentation, see [Latest Version](/en/docs3-v2/java-sdk/advanced-features-and-usage/service/specify-ip/).
{{% /pageinfo %}}

In the development and testing environment, it is often necessary to bypass the registration center and only test the specified service provider. At this time, point-to-point direct connection may be required. The point-to-point direct connection method will use the service interface as the unit and ignore the provider list of the registration center. A The point-to-point interface configuration does not affect the B interface to obtain the list from the registration center.

![/user-guide/images/dubbo-directly.jpg](/imgs/user/dubbo-directly.jpg)

## Configuration via XML

If the online demand needs point-to-point, you can configure the url to point to the provider in `<dubbo:reference>`, which will bypass the registration center. Multiple addresses are separated by semicolons, and the configuration is as follows:

```xml
<dubbo:reference id="xxxService" interface="com.alibaba.xxx.XxxService" url="dubbo://localhost:20890" />
```

{{% alert title="Prompt" color="primary" %}}
`1.0.6` and above version support
{{% /alert %}}

## Specified by -D parameter

Add the -D parameter mapping service address to the JVM startup parameters, such as:

```sh
java -Dcom.alibaba.xxx.XxxService=dubbo://localhost:20890
```

{{% alert title="Prompt" color="primary" %}}
The key is the service name, and the value is the service provider url. This configuration has the highest priority and is supported by `1.0.15` and above versions
{{% /alert %}}

## By file mapping

If there are many services, you can also use file mapping, use `-Ddubbo.resolve.file` to specify the mapping file path, this configuration has a higher priority than the configuration [^3] in `<dubbo:reference>`, such as:

```sh
java -Ddubbo.resolve.file=xxx.properties
```

Then add the configuration to the mapping file `xxx.properties`, where the key is the service name and the value is the service provider URL:

```properties
com.alibaba.xxx.XxxService=dubbo://localhost:20890
```

{{% alert title="Prompt" color="primary" %}}
`1.0.15` and above versions support, `2.0` and above versions automatically load the ${user.home}/dubbo-resolve.properties file, no configuration required
{{% /alert %}}

{{% alert title="Attention" color="warning" %}}
In order to avoid complicating the online environment, do not use this feature online, it should only be used during the testing phase.
{{% /alert %}}