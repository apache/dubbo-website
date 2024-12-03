---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/protocol/webservice/
    - /en/docs3-v2/java-sdk/reference-manual/protocol/webservice/
    - /en/overview/mannual/java-sdk/reference-manual/protocol/webservice/
description: Webservice Protocol
linkTitle: Webservice Protocol
title: Webservice Protocol
type: docs
weight: 11
---

## Feature Description
WebService-based remote call protocol, implemented based on [Apache CXF](http://cxf.apache.org) `frontend-simple` and `transports-http`. Supported in versions `2.3.0` and above.

CXF is an Apache open-source RPC framework formed by the merger of Xfire and Celtix.
* Number of connections: Multiple connections
* Connection method: Short connections
* Transport protocol: HTTP
* Transport method: Synchronous transmission
* Serialization: SOAP text serialization
* Applicable scenarios: System integration, cross-language calls

It can interoperate with native WebService services, meaning:

* The provider exposes the service via Dubbo's WebService protocol, and the consumer directly calls using the standard WebService interface,
* Or the provider uses standard WebService to expose services, and the consumer calls using Dubbo's WebService protocol.
#### Constraints
* Parameters and return values must implement the `Serializable` interface
* Parameters should preferably use basic types and POJOs

## Usage Scenarios
Publishing a service (internally/externally), regardless of client type or performance, it is recommended to use webservice. If the server has determined to use webservice, the client has no choice and must use webservice.
## Usage Method
### Dependencies

Starting from Dubbo 3, the Webservice protocol is no longer embedded in Dubbo and needs to be imported as a separate [module](/en/download/spi-extensions/#dubbo-rpc).
```xml
<dependency>
    <groupId>org.apache.dubbo.extensions</groupId>
    <artifactId>dubbo-rpc-webservice</artifactId>
    <version>3.3.0</version>
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

### Configure Protocol
```xml
<dubbo:protocol name="webservice" port="8080" server="jetty" />
```

### Configure Default Protocol
```xml
<dubbo:provider protocol="webservice" />
```

### Configure Service Protocol
```xml
<dubbo:service protocol="webservice" />
```

### Multiple Ports
```xml
<dubbo:protocol id="webservice1" name="webservice" port="8080" />
<dubbo:protocol id="webservice2" name="webservice" port="8081" />
```

### Direct Connection
```xml
<dubbo:reference id="helloService" interface="HelloWorld" url="webservice://10.20.153.10:8080/com.foo.HelloWorld" />
```

### WSDL
```
http://10.20.153.10:8080/com.foo.HelloWorld?wsdl
```

### Jetty Server (Default)

```xml
<dubbo:protocol ... server="jetty" />
```

### Servlet Bridge Server (Recommended)
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
{{% alert title="Note" color="primary" %}}
 If using servlet to dispatch requests:
 
 The protocol port `<dubbo:protocol port="8080" />` must match the port of the servlet container.
 
 The protocol context path `<dubbo:protocol contextpath="foo" />` must match the context path of the servlet application.
{{% /alert %}}

