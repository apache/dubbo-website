# webservice://

WebService-based remote calling protocol，base on [Apache CXF](http://cxf.apache.org)  `frontend-simple` and  `transports-http` implements。

Interoperable with native WebService services：
  
* Providers expose services using Dubbo's WebService protocol, which consumers invoke directly using the standard WebService interface,
* Or the provider exposes the service using the standard WebService, which consumers invoke using the Dubbo WebService protocol.

## dependency

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

## Features

* Number of connections: multiple connections
* Connection: short connection
* Transmission protocol: HTTP
* Transmission: synchronous transmission
* Serialization: SOAP text serialization
* Applicable scenarios: System integration, cross-language calls


## Constraint
  
* Parameters and return class should implement `Serializable` interface
* Parameters should try to use the basic types and POJO

## Configuration
  
configure webservice protocol：

```xml
<dubbo:protocol name="webservice" port="8080" server="jetty" />
```

configure provider level default protocol:

```xml
<dubbo:provider protocol="webservice" />
```

configure service level default protocol:

```xml
<dubbo:service protocol="webservice" />
```

configure multiple port：

```xml
<dubbo:protocol id="webservice1" name="webservice" port="8080" />
<dubbo:protocol id="webservice2" name="webservice" port="8081" />
```

configure direct connect mode：

```xml
<dubbo:reference id="helloService" interface="HelloWorld" url="webservice://10.20.153.10:8080/com.foo.HelloWorld" />
```

WSDL：

```
http://10.20.153.10:8080/com.foo.HelloWorld?wsdl
```

Jetty Server (Default)：

```xml
<dubbo:protocol ... server="jetty" />
```
 
Servlet Bridge Server (recommend)：  

```xml
<dubbo:protocol ... server="servlet" />
```

configure DispatcherServlet：
 
```xml
<servlet>
         <servlet-name>dubbo</servlet-name>
         <servlet-class>com.alibaba.dubbo.remoting.http.servlet.DispatcherServlet</servlet-class>
         <load-on-startup>1</load-on-startup>
</servlet>
<servlet-mapping>
         <servlet-name>dubbo</servlet-name>
         <url-pattern>/*</url-pattern>
</servlet-mapping>
```

Note that if you use servlets to dispatch requests:

* the port of protocol `<dubbo:protocol port="8080" />` must same as  servlet container's.
* the context path of protocol `<dubbo:protocol contextpath="foo" />` must same as servlet application's.





