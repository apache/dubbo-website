# hessian://

Hessian protocol is used for integrate Hessian services, and it use http protocol to  communicate and expose services by servlet.Dubbo use Jetty server as default servlet container.

Dubbo's Hessian protocol interoperates with native Hessian services:


* Providers use Dubbo's Hessian protocol to expose services that consumers call directly using standard Hessian interfaces
* Alternatively, the provider exposes the service using standard Hessian and the consumer calls it using Dubbo's Hessian protocol.


## Features

* Number of connections: multiple connections
* Connection: short connection
* Transmission protocol: HTTP
* Transmission: synchronous transmission
* Serialization: Hessian binary serialization
* Scope of application: Incoming and outgoing parameter packets are large, the number of providers is more than that of consumers and can transfer files.
* Applicable scenarios: page transfer, file transfer, or interoperability with native hessian services

## dependency

```xml
<dependency>
    <groupId>com.caucho</groupId>
    <artifactId>hessian</artifactId>
    <version>4.0.7</version>
</dependency>
```

## Constraint

* Parameters and return class must implement `Serializable` interface
* Parameters and return values can not be customized to implement `List`,` Map`, `Number`,` Date`, `Calendar` interface, can only be implemented with the JDK, because Hessian2 will do some special treatment, Attribute values in the class will be lost.

## Configuration

configure hessian protocol：

```xml
<dubbo:protocol name="hessian" port="8080" server="jetty" />
```

configure provider level default protocol:

```xml
<dubbo:provider protocol="hessian" />
```

configure service level default protocol:

```xml
<dubbo:service protocol="hessian" />
```

configure multiple port：

```xml
<dubbo:protocol id="hessian1" name="hessian" port="8080" />
<dubbo:protocol id="hessian2" name="hessian" port="8081" />
```

configure direct connect mode：

```xml
<dubbo:reference id="helloService" interface="HelloWorld" url="hessian://10.20.153.10:8080/helloWorld" />
```


