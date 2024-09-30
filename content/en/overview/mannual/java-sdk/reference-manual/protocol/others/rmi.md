---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/protocol/rmi/
    - /en/docs3-v2/java-sdk/reference-manual/protocol/rmi/
    - /en/overview/what/ecosystem/protocol/rmi/
    - /en/overview/mannual/java-sdk/reference-manual/protocol/rmi/
description: Rmi Protocol
linkTitle: Rmi Protocol
title: Rmi Protocol
type: docs
weight: 8
---






## Feature Description
The RMI protocol uses the JDK standard `java.rmi.*` implementation, employing a blocking short connection and JDK standard serialization.

* Number of connections: Multiple connections
* Connection type: Short connection
* Transport protocol: TCP
* Transport method: Synchronous transmission
* Serialization: Java standard binary serialization
* Applicable scope: Mixed sizes of incoming and outgoing parameter data packets, with a number of consumers and providers roughly the same, can transfer files.
* Applicable scenarios: Routine remote service method calls, interoperable with native RMI services.

#### Constraints

* Parameters and return values must implement the `Serializable` interface.
* The timeout configured in Dubbo is ineffective for RMI and must be set using Java startup parameters: `-Dsun.rmi.transport.tcp.responseTimeout=3000`, refer to the RMI configuration below.


## Usage Scenarios

It is a set of APIs in Java that support the development of distributed applications, achieving method calls between programs on different operating systems.

## Usage Method

### Import Dependencies

Since Dubbo 3, the RMI protocol is no longer embedded in Dubbo and needs to be imported as a separate [module](/en/download/spi-extensions/#dubbo-rpc).
```xml
<dependency>
    <groupId>org.apache.dubbo.extensions</groupId>
    <artifactId>dubbo-rpc-rmi</artifactId>
    <version>3.3.0</version>
</dependency>
```

```sh
java -Dsun.rmi.transport.tcp.responseTimeout=3000
```
> For more RMI optimization parameters, please refer to the [JDK Documentation](https://docs.oracle.com/javase/6/docs/technotes/guides/rmi/sunrmiproperties.html)

### Interface Description
If the service interface extends the `java.rmi.Remote` interface, it can interoperate with native RMI, that is:

* The provider exposes services using Dubbo's RMI protocol, while the consumer directly calls using the standard RMI interface,
* or the provider exposes services using the standard RMI, while the consumer calls using Dubbo's RMI protocol.

If the service interface does not extend the `java.rmi.Remote` interface:

* By default, Dubbo will automatically generate an interface `com.xxx.XxxService$Remote`, extending the `java.rmi.Remote` interface, and expose services via this interface,
* However, if `<dubbo:protocol name="rmi" codec="spring" />` is set, the `$Remote` interface will not be generated, and the Spring `RmiInvocationHandler` interface will be used to expose services, maintaining Spring compatibility.

**Define RMI Protocol**

```xml
<dubbo:protocol name="rmi" port="1099" />
```

**Set Default Protocol**

```xml
<dubbo:provider protocol="rmi" />
```

**Set Protocol for Specific Service**

```xml
<dubbo:service interface="..." protocol="rmi" />
```

**Multiple Ports**

```xml
<dubbo:protocol id="rmi1" name="rmi" port="1099" />
<dubbo:protocol id="rmi2" name="rmi" port="2099" />

<dubbo:service interface="..." protocol="rmi1" />
```

**Spring Compatibility**

```xml
<dubbo:protocol name="rmi" codec="spring" />
```

{{% alert title="Note" color="primary" %}}
- **If providing services via RMI for external access,** there should be no attack risks in the company's intranet environment.

- **If the application relies on the old common-collections package,** Dubbo will not depend on this package; please check if your application uses it.

- **There are deserialization security risks.** Please check the application: upgrade commons-collections3 to [3.2.2](https://commons.apache.org/proper/commons-collections/release_3_2_2.html); upgrade commons-collections4 to [4.1](https://commons.apache.org/proper/commons-collections/release_4_1.html). The new versions of commons-collections resolve this issue.
{{% /alert %}}

