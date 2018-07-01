# rmi://

The RMI protocol uses the JDK standard `java.rmi.*` Implementation, using a block short connection and JDK standard serialization.

## Features

* Number of connections: multiple connections
* Connection: short connection
* Transmission protocol: HTTP
* Transmission: synchronous transmission
* Serialization: Java standard Object Serialization
* Scope of application:the number of providers is more than that of consumers and can transfer files.
* Applicable scenarios: Conventional remote service method calls, interoperating with native RMI services

## Constraint

* Parameters and return values must implement `Serializable` interface
* The timeout configuration for RMI  is invalid, you need to use java startup parameter settings:`-Dsun.rmi.transport.tcp.responseTimeout=3000`,see the RMI configuration below

## Configuration in dubbo.properties

```properties
dubbo.service.protocol=rmi
```

## RMI Configuration

```sh
java -Dsun.rmi.transport.tcp.responseTimeout=3000
```
more RMI options please check [JDK Document](http://download.oracle.com/docs/cd/E17409_01/javase/6/docs/technotes/guides/rmi/sunrmiproperties.html)


## Interface

If the service interface implement the `java.rmi.Remote` interface, it can interoperate with the native RMI, ie:

* Providers expose services using Dubbo's RMI protocol, consumers call directly with the standard RMI interface,
* Or the provider exposes services using standard RMI, and consumers invoke with Dubbo's RMI protocol.

If the service interface doesn't implement the `java.rmi.Remote` interface:


* Default Dubbo will automatically generate a `com.xxx.XxxService$Remote` interface and implement the` java.rmi.Remote` interface, expose the service as this interface,
* But if `<dubbo: protocol name = 'rmi' codec = 'spring' /> `is set, the`$Remote` interface will not be generated, but Spring's `RmiInvocationHandler` interface will be used to expose services.

## Configuration

configure RMI protocol：

```xml
<dubbo:protocol name="rmi" port="1099" />
```

configure provider level default protocol:

```xml
<dubbo:provider protocol="rmi" />
```

configure service level default protocol:


```xml
<dubbo:service protocol="rmi" />
```

configure multiple port：

```xml
<dubbo:protocol id="rmi1" name="rmi" port="1099" />
<dubbo:protocol id="rmi2" name="rmi" port="2099" />
 
<dubbo:service protocol="rmi1" />
```

Compatible with Spring：

```xml
<dubbo:protocol name="rmi" codec="spring" />
```

