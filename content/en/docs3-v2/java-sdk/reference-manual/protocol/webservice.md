---
type: docs
title: "Webservice protocol"
linkTitle: "Webservice protocol"
weight: 11
---


## Feature description
WebService-based remote invocation protocol, implemented based on `frontend-simple` and `transports-http` of [Apache CXF](http://cxf.apache.org). `2.3.0` and above are supported.

CXF is an open source RPC framework of Apache, which is merged from Xfire and Celtix.
* Number of connections: multiple connections
* Connection method: short connection
* Transmission protocol: HTTP
* Transmission method: synchronous transmission
* Serialization: SOAP text serialization
* Applicable scenarios: system integration, cross-language call

It can interoperate with native WebService services, namely:

* The provider uses Dubbo's WebService protocol to expose the service, and the consumer directly uses the standard WebService interface to call,
* Or the provider uses the standard WebService to expose the service, and the consumer uses Dubbo's WebService protocol to call.
#### Constraints
* Parameters and return values need to implement `Serializable` interface
* Parameters try to use basic types and POJO

## scenes to be used
To publish a service (internal/external), regardless of client type or performance, it is recommended to use webservice. The server has determined to use webservice, the client cannot choose, and must use webservice.
## How to use
### Dependencies

Starting from Dubbo 3, the Webservice protocol is no longer embedded in Dubbo, and an independent [module](/zh-cn/download/spi-extensions/#dubbo-rpc) needs to be introduced separately.
```xml
<dependency>
    <groupId>org.apache.dubbo.extensions</groupId>
    <artifactId>dubbo-rpc-webservice</artifactId>
    <version>1.0.0</version>
</dependency>
```

```xml
<dependency>
    <groupId>org.apache.cxf</groupId>
    <artifactId>cxf-rt-frontend-simple</artifactId>
    <version>2.6.1</version>
</dependency>
<dependency>
    <groupId>org.apache.cxf</groupId>
    <artifactId>cxf-rt-transports-http</artifactId>
    <version>2.6.1</version>
</dependency>
```

### Configuration protocol
```xml
<dubbo:protocol name="webservice" port="8080" server="jetty" />
```

### Configure the default protocol
```xml
<dubbo:provider protocol="webservice" />
```

### Configure service protocol
```xml
<dubbo:service protocol="webservice" />
```

### Multiport
```xml
<dubbo:protocol id="webservice1" name="webservice" port="8080" />
<dubbo:protocol id="webservice2" name="webservice" port="8081" />
```

### direct connection
```xml
<dubbo:reference id="helloService" interface="HelloWorld" url="webservice://10.20.153.10:8080/com.foo.HelloWorld" />
```

###WSDL
```
http://10.20.153.10:8080/com.foo.HelloWorld?wsdl
```

### Jetty Server (default)

```xml
<dubbo:protocol ... server="jetty" />
```

### Servlet Bridge Server (recommended)
```xml
<dubbo:protocol ... server="servlet" />
```

### Configure DispatcherServlet
```xml
<servlet>
         <servlet-name>dubbo</servlet-name>
         <servlet-class>org.apache.dubbo.remoting.http.servlet.DispatcherServlet</servlet-class>
         <load-on-startup>1</load-on-startup>
</servlet>
<servlet-mapping>
         <servlet-name>dubbo</servlet-name>
         <url-pattern>/*</url-pattern>
</servlet-mapping>
```

> If a servlet is used to dispatch the request
> * The protocol port `<dubbo:protocol port="8080" />` must be the same as the port of the servlet container.
> * The context path of the protocol `<dubbo:protocol contextpath="foo" />` must be the same as the context path of the servlet application.
