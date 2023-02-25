---
type: docs
title: "HTTP protocol"
linkTitle: "HTTP protocol"
weight: 6
---


## Feature description
HTTP form-based remote invocation protocol, implemented by Spring's HttpInvoker, supported by versions above `2.3.0`.

* Number of connections: multiple connections
* Connection method: short connection
* Transmission protocol: HTTP
* Transmission method: synchronous transmission
* Serialization: form serialization
* Scope of application: The size of incoming and outgoing parameter data packets is mixed, the number of providers is more than that of consumers, it can be viewed with a browser, and parameters can be passed in by form or URL, and file transfer is not supported for now.
* Applicable scenarios: services that need to be used by both application and browser JS.

#### Constraints
* Parameters and return values must conform to the Bean specification

## scenes to be used

HTTP short connection, standardized and easy-to-read protocol, easy to connect to external systems, suitable for upper-level business modules.

## How to use

Starting from Dubbo 3, the Http protocol is no longer embedded in Dubbo, and an independent [module](/zh-cn/download/spi-extensions/#dubbo-rpc) needs to be introduced separately.
```xml
<dependency>
    <groupId>org.apache.dubbo.extensions</groupId>
    <artifactId>dubbo-rpc-http</artifactId>
    <version>1.0.0</version>
</dependency>
```

### Configuration protocol
```xml
<dubbo:protocol name="http" port="8080" />
```

### Configure Jetty Server (default)
```xml
<dubbo:protocol ... server="jetty" />
```

### Configure Servlet Bridge Server (recommended)
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
> * The protocol port `<dubbo:protocol port="8080" />` must be the same as the port of the servlet container,
> * The context path of the protocol `<dubbo:protocol contextpath="foo" />` must be the same as the context path of the servlet application.
