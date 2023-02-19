---
type: docs
title: "Rmi agreement"
linkTitle: "Rmi Agreement"
weight: 8
---

## Feature description
The RMI protocol is implemented using the JDK standard `java.rmi.*`, using blocking short connections and JDK standard serialization.

* Number of connections: multiple connections
* Connection method: short connection
* Transport protocol: TCP
* Transmission method: synchronous transmission
* Serialization: Java standard binary serialization
* Scope of application: Incoming and outgoing parameter packets are mixed in size, the number of consumers and providers is similar, and files can be transferred.
* Applicable scenarios: regular remote service method calls, interoperability with native RMI services

#### Constraints

* Parameters and return values need to implement `Serializable` interface
* The timeout in dubbo configuration is invalid for RMI, you need to use the java startup parameter setting: `-Dsun.rmi.transport.tcp.responseTimeout=3000`, see the following RMI configuration


## scenes to be used

It is a set of Java APIs that supports the development of distributed applications, and realizes the method calling of programs between different operating systems.

## How to use

### Import dependencies

Starting from Dubbo 3, the RMI protocol is no longer embedded in Dubbo, and an independent [module](/zh-cn/download/spi-extensions/#dubbo-rpc) needs to be introduced separately.
```xml
<dependency>
    <groupId>org.apache.dubbo.extensions</groupId>
    <artifactId>dubbo-rpc-rmi</artifactId>
    <version>1.0.0</version>
</dependency>
```

```sh
java -Dsun.rmi.transport.tcp.responseTimeout=3000
```
For more RMI optimization parameters, please see [JDK Documentation](https://docs.oracle.com/javase/6/docs/technotes/guides/rmi/sunrmiproperties.html)

### Interface Description
If the service interface inherits the `java.rmi.Remote` interface, it can interoperate with native RMI, namely:

* The provider uses Dubbo's RMI protocol to expose the service, and the consumer directly uses the standard RMI interface to call,
* Or the provider uses standard RMI to expose the service, and the consumer uses Dubbo's RMI protocol to call.

If the service interface does not extend the `java.rmi.Remote` interface:

* By default, Dubbo will automatically generate a `com.xxx.XxxService$Remote` interface, inherit the `java.rmi.Remote` interface, and expose the service through this interface,
* But if `<dubbo:protocol name="rmi" codec="spring" />` is set, the `$Remote` interface will not be generated, and the service will be exposed using Spring’s `RmiInvocationHandler` interface, which is compatible with Spring.

**Define the RMI protocol**

```xml
<dubbo:protocol name="rmi" port="1099" />
```

**SET DEFAULT PROTOCOL**

```xml
<dubbo:provider protocol="rmi" />
```

**Set the protocol of a service**

```xml
<dubbo:service interface="..." protocol="rmi" />
```

**Multiple ports**

```xml
<dubbo:protocol id="rmi1" name="rmi" port="1099" />
<dubbo:protocol id="rmi2" name="rmi" port="2099" />

<dubbo:service interface="..." protocol="rmi1" />
```

**Spring Compatibility**

```xml
<dubbo:protocol name="rmi" codec="spring" />
```


> - **If you are using RMI to provide services for external access,** there should be no risk of attack in the company's intranet environment.

> - **At the same time, if the application relies on the old common-collections package,** dubbo will not depend on this package. Please check whether your application has used it.

> - ** There is a deserialization security risk. ** Please check the application: Please upgrade commons-collections3 to [3.2.2](https://commons.apache.org/proper/commons-collections/release_3_2_2.html); Please upgrade commons-collections4 to [4.1](https://commons.apache.org/proper/commons-collections/release_4_1.html). The new version of commons-collections solves this problem.
