---
aliases:
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/service/explicit-target/
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/service/explicit-target/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/service/explicit-target/
description: Direct connection method in Dubbo for point-to-point communication
linkTitle: Direct Connection Provider
title: Direct Connection Provider
type: docs
weight: 5
---


In development and testing environments, it is often necessary to bypass the registry and only test specific service providers. In this case, point-to-point direct connection may be required. The point-to-point direct connection method will ignore the provider list from the registry on a service interface basis. Configuring point-to-point for interface A will not affect interface B from obtaining the list from the registry.

![/user-guide/images/dubbo-directly.jpg](/imgs/user/dubbo-directly.jpg)

If point-to-point communication is needed in a production environment, you can configure the `reference` node to point to the provider URL, bypassing the registry. Multiple addresses can be separated by semicolons, configured as follows:

## Annotation Configuration Method

```java
@DubboReference(url="tri://localhost:50051")
private XxxService xxxService
```

## XML Configuration Method

```xml
<dubbo:reference id="xxxService" interface="com.alibaba.xxx.XxxService" url="dubbo://localhost:20890" />
```

## More Configuration Methods
{{% alert title="Note" color="warning" %}}
Please note that the following configuration methods are retained for compatibility with older versions of Dubbo2 and may have issues in some Dubbo3 versions. Please try to use the recommended configuration methods mentioned earlier in the document.
{{% /alert %}}

### Specify via -D Parameter

Add the -D parameter to the JVM startup parameters to map the service address, such as:

```sh
java -Dcom.alibaba.xxx.XxxService=dubbo://localhost:20890
```

{{% alert title="Tip" color="primary" %}}
The key is the service name, and the value is the service provider URL. This configuration has the highest priority and is supported in version `1.0.15` and above.
{{% /alert %}}

### File Mapping

If there are many services, you can also use file mapping by specifying the mapping file path with `-Ddubbo.resolve.file`, which has a higher priority than the configuration in `<dubbo:reference>` [^3], such as:

```sh
java -Ddubbo.resolve.file=xxx.properties
```

Then add the configuration in the mapping file `xxx.properties`, where the key is the service name, and the value is the service provider URL:

```properties
com.alibaba.xxx.XxxService=dubbo://localhost:20890
```

{{% alert title="Tip" color="primary" %}}
Supported in version `1.0.15` and above. Version `2.0` and higher automatically loads the ${user.home}/dubbo-resolve.properties file without needing configuration.
{{% /alert %}}

{{% alert title="Note" color="warning" %}}
To avoid complicating the production environment, do not use this feature in production; it should only be used during testing.
{{% /alert %}}

