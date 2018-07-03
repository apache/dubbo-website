# http://

Dubbo http protocol is base on HTTP form and Spring's HttpInvoker


## Features

* Number of connections: multiple connections
* Connection: short connection
* Transmission protocol: HTTP
* Transmission: synchronous transmission
* Serialization: form serialization
* Scope of application: Available browser view, the form or URL can be passed parameters, Temporary files are not supported.
* Applicable scenarios: Services that need to be available to both application and browser

## Constraint
* Parameters and return values must be consistent with Bean specifications

## Configuration

configure http protocol：

```xml
<dubbo:protocol name="http" port="8080" />
```

configure Jetty Server (default)：

```xml
<dubbo:protocol ... server="jetty" />
```

configure Servlet Bridge Server (recommend)：

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


