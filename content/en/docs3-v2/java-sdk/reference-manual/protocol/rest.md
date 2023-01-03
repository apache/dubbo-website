---
type: docs
title: "Rest protocol"
linkTitle: "Rest protocol"
weight: 4
---

Support for REST calls based on the standard Java REST API - JAX-RS 2.0 (short for Java API for RESTful Web Services)

### Quick Start

It is relatively simple to develop a REST-style service in dubbo. Let's take a simple service for registered users as an example.

The function of this service is to provide the following URL (note: this URL is not fully in line with REST style, but it is simpler and more practical)
```
http://localhost:8080/users/register
```
And any client can POST a JSON string containing user information to the above URL to complete user registration.

First, develop the interface of the service

```java
public class UserService {
   void registerUser(User user);
}
```

Then, develop the implementation of the service

```java
@Path("users")
public class UserServiceImpl implements UserService {
       
    @POST
    @Path("register")
    @Consumes({MediaType. APPLICATION_JSON})
    public void registerUser(User user) {
        // save the user...
    }
}
```
The above implementation is very simple, but since the REST service is to be published to a specified URL for access by clients of any language or even browsers, several standard annotations of JAX-RS are added here for related configuration.

@Path("users"): Specifies that the relative path of the URL to access UserService is /users, ie http://localhost:8080/users

@Path("register"): Specifies that the relative path of the URL to access the registerUser() method is /register, combined with the path specified by the previous @Path for UserService, the full path to call UserService.register() is http://localhost :8080/users/register

@POST: Specifies to access registerUser() with the HTTP POST method

@Consumes({MediaType.APPLICATION_JSON}): Specifies that registerUser() receives data in JSON format. The REST framework will automatically deserialize the JSON data into a User object

Finally, add this service in the spring configuration file to complete all service development work

 ```xml
<!-- Expose the service on port 8080 using the rest protocol -->
<dubbo:protocol name="rest" port="8080"/>
 
<!-- Declare the service interface that needs to be exposed -->
<dubbo:service interface="xxx.UserService" ref="userService"/>
 
<!-- Implement services like local beans -->
<bean id="userService" class="xxx.UserServiceImpl" />
```

### Detailed explanation of REST service provider

Next, we expand the UserService in the "Quick Start" to further demonstrate the development points of the REST service provider in dubbo.

### Implementation of HTTP POST/GET

In the REST service, although it is recommended to use the four standard methods POST, DELETE, PUT, and GET in the HTTP protocol to implement common "addition, deletion, modification and query" respectively, in practice, we generally use POST directly to implement "addition and modification", and GET to implement Just implement "delete check" (DELETE and PUT will even be blocked by some firewalls).

The implementation of POST has been briefly demonstrated before. Here, we add a function of obtaining registered user information to UserService to demonstrate the implementation of GET.

This function is to enable the client to obtain user profiles with different IDs by accessing the following URLs

```
http://localhost:8080/users/1001
http://localhost:8080/users/1002
http://localhost:8080/users/1003
```

Of course, user profiles with different IDs can also be accessed through other forms of URLs, for example

```
http://localhost:8080/users/load?id=1001
```

JAX-RS natively supports all of these forms. But the above form of including query parameters in the URL path (http://localhost:8080/users/1001) is more in line with the general habits of REST, so it is recommended for everyone to use. Next, we will add a getUser() method to UserService to achieve this form of URL access

```java
@GET
@Path("{id : \\d+}")
@Produces({MediaType. APPLICATION_JSON})
public User getUser(@PathParam("id") Long id) {
    //...
}
```

@GET: Specifies to use the HTTP GET method to access

@Path("{id : \\d+}"): According to the functional requirements above, the URL to access getUser() should be "http://localhost:8080/users/ + any number", and this number should be made Pass the getUser() method as a parameter. In the annotation configuration here, {id: xxx} in the middle of @Path specifies that the URL relative path contains a parameter named id, and its value will be automatically passed to the method parameter modified with @PathParam("id") below id. {id: followed by \\d+ is a regular expression, specifying that the id parameter must be a number.

@Produces({MediaType.APPLICATION_JSON}): Specify getUser() to output data in JSON format. The framework will automatically serialize the User object into JSON data.

### Annotation is placed in the interface class or the implementation class

The development of REST services in Dubbo is mainly configured through JAX-RS annotations. In the above examples, we put the annotations in the service implementation class. But in fact, we can also put the annotation on the interface of the service. The two methods are completely equivalent, for example:

```java
@Path("users")
public interface UserService {
    
    @GET
    @Path("{id : \\d+}")
    @Produces({MediaType. APPLICATION_JSON})
    User getUser(@PathParam("id") Long id);
}
```

In general applications, we recommend placing the annotation in the service implementation class, so that the location of the annotation and the java implementation code are closer, making it easier to develop and maintain. In addition, more importantly, we generally tend to avoid pollution of the interface, and maintain the purity and wide applicability of the interface.

However, as mentioned later, if we want to use the consumer directly developed by dubbo to access this service, the annotation must be placed on the interface.

If annotations are added to both the interface and the implementation class, the annotation configuration of the implementation class will take effect, and the annotation on the interface will be ignored directly.

### Support for multiple data formats such as JSON and XML

The REST service developed in dubbo can support the transmission of data in multiple formats at the same time to provide clients with maximum flexibility. Among them we currently have added extra functionality especially for the most commonly used formats JSON and XML.

For example, if we want the getUser() method in the above example to support returning data in JSON and XML formats, we only need to include both formats in the annotation

```java
@Produces({MediaType. APPLICATION_JSON, MediaType. TEXT_XML})
User getUser(@PathParam("id") Long id);
```

Or you can directly use strings (wildcards are also supported) to represent MediaType

```java
@Produces({"application/json", "text/xml"})
User getUser(@PathParam("id") Long id);
```

If all methods support the same type of input and output data format, we don't need to configure each method, just add annotation to the service class

```java
@Path("users")
@Consumes({MediaType. APPLICATION_JSON, MediaType. TEXT_XML})
@Produces({MediaType. APPLICATION_JSON, MediaType. TEXT_XML})
public class UserServiceImpl implements UserService {
    //...
}

```

In the case that a REST service supports multiple data formats at the same time, according to the JAX-RS standard, the MIME header (content-type and accept) in HTTP is generally used to specify which format data is currently wanted.

But in dubbo, we also automatically support the method commonly used in the industry at present, that is, use a URL suffix (.json and .xml) to specify the desired data format. For example, after adding the above annotation, direct access to http://localhost:8888/users/1001.json means to use json format, and direct access to http://localhost:8888/users/1002.xml means to use xml format, Simpler and more intuitive than using HTTP Header. The REST APIs of Twitter, Weibo, etc. all use this method.
If you add neither HTTP header nor suffix, dubbo's REST will give priority to the data format that ranks first in the above annotation definition.

> Note: To support XML format data here, you can use MediaType.TEXT_XML or MediaType.APPLICATION_XML in annotation, but TEXT_XML is more commonly used, and if you want to use the above URL suffix method to specify the data format, you can only use Only when it is configured as TEXT_XML can it take effect.

### Chinese character support

In order to output Chinese characters normally in dubbo REST, like usual Java web applications, we need to set the contentType of the HTTP response to UTF-8 encoding.

Based on the standard usage of JAX-RS, we only need to do the following annotation configuration:

```java
@Produces({"application/json; charset=UTF-8", "text/xml; charset=UTF-8"})
User getUser(@PathParam("id") Long id);
```

For the convenience of users, we directly added a support class in dubbo REST to define the above constants, which can be used directly to reduce the possibility of errors.

```java
@Produces({ContentType. APPLICATION_JSON_UTF_8, ContentType. TEXT_XML_UTF_8})
User getUser(@PathParam("id") Long id);
```

### Additional requirements for XML data format

Since the implementation of JAX-RS generally uses the standard JAXB (Java API for XML Binding) to serialize and deserialize XML format data, we need to add a class-level JAXB annotation for each object to be transmitted in XML, Otherwise serialization will report an error. For example, add the following to the User returned in getUser()

```java
@XmlRootElement
public class User implements Serializable {
    //...
}
```

In addition, if the return values in the service method are Java primitive types (such as int, long, float, double, etc.), it is best to add a layer of wrapper objects for them, because JAXB cannot directly serialize primitive types.

For example, we want the aforementioned registerUser() method to return the ID number generated by the server for the user:

```java
long registerUser(User user);
```

Since primitive types are not supported by JAXB serialization, add a wrapper object:

```java
@XmlRootElement
public class RegistrationResult implements Serializable {
    
    private Long id;
    
    public RegistrationResult() {
    }
    
    public RegistrationResult(Long id) {
        this.id = id;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
}
```

And modify the service method:

```java
RegistrationResult registerUser(User user);
```

This not only solves the problem of XML serialization, but also makes the returned data conform to the specifications of XML and JSON. For example, in JSON, the return would be of the form

```javascript
{"id": 1001}
```

If no wrapper is added, the JSON return value will be directly

```
1001
```

In XML, the return value after adding wrapper will be:

```xml
<registrationResult>
    <id>1002</id>
</registrationResult>
```

This kind of wrapper object actually uses the so-called Data Transfer Object (DTO) pattern, and using DTO can also do more useful customizations for the transferred data.

### Custom serialization

As mentioned above, the underlying implementation of REST will automatically serialize/deserialize between service objects and JSON/XML data formats. However, in some scenarios, if you feel that this automatic conversion does not meet the requirements, you can customize it.

The REST implementation in Dubbo uses JAXB for XML serialization and Jackson for JSON serialization, so you can customize the mapping by adding JAXB or Jackson annotations to objects.

For example, custom object properties map to XML element names:

```java
@XmlRootElement
@XmlAccessorType(XmlAccessType.FIELD)
public class User implements Serializable {
    
    @XmlElement(name="username")
    private String name;
}
```

Map custom object properties to JSON field names:

```java
public class User implements Serializable {
    
    @JsonProperty("username")
    private String name;
}
```

For more information, please refer to the official documentation of JAXB and Jackson, or google yourself.

### Configure the implementation of REST Server

Currently in dubbo, we support the implementation of 5 embedded rest servers, and at the same time support the implementation of the rest server using an external application server. The rest server can be implemented through the following configuration:

```xml
<dubbo:protocol name="rest" server="jetty"/>
```

The above configuration uses the embedded jetty as the rest server. At the same time, if the server attribute is not configured, the rest protocol also uses jetty by default. jetty is a very mature java servlet container, and has been well integrated with dubbo (currently, among the five embedded servers, only jetty and tomcat and tjws described later have seamlessly integrated with dubbo monitoring system), Therefore, if your dubbo system is a separate startup process, you can directly use jetty by default.


```xml
<dubbo:protocol name="rest" server="tomcat"/>
```

The above configuration uses the embedded tomcat as the rest server. On the embedded tomcat, the performance of REST is much better than that on jetty (see the benchmark test later), it is recommended to use tomcat in the scenario that requires high performance.

```xml
<dubbo:protocol name="rest" server="netty"/>
```

The above configuration uses embedded netty as the rest server. (TODO more contents to add)

```xml
<dubbo:protocol name="rest" server="tjws"/> (tjws is now deprecated)
<dubbo:protocol name="rest" server="sunhttp"/>
```

The above configuration uses the embedded tjws or Sun HTTP server as the rest server. These two server implementations are very lightweight, very convenient for quick start-up in integration tests, and of course they can also be used in production environments with low load. Note: tjws is currently deprecated because it doesn't work well with the servlet 3.1 API.

If your dubbo system is not a separate startup process, but is deployed in a Java application server, it is recommended that you use the following configuration

```xml
<dubbo:protocol name="rest" server="servlet"/>
```

By setting the server as a servlet, dubbo will use the servlet container of the external application server as the rest server. At the same time, add the following configuration to the web.xml of the dubbo system

```xml
<web-app>
    <context-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>/WEB-INF/classes/META-INF/spring/dubbo-demo-provider.xml</param-value>
    </context-param>
    
    <listener>
        <listener-class>org.apache.dubbo.remoting.http.servlet.BootstrapListener</listener-class>
    </listener>
    
    <listener>
        <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
    </listener>
    
    <servlet>
        <servlet-name>dispatcher</servlet-name>
        <servlet-class>org.apache.dubbo.remoting.http.servlet.DispatcherServlet</servlet-class>
        <load-on-startup>1</load-on-startup>
    </servlet>
    
    <servlet-mapping>
        <servlet-name>dispatcher</servlet-name>
        <url-pattern>/*</url-pattern>
    </servlet-mapping>
</web-app>
```

That is, dubbo's BootstrapListener and DispatherServlet must be added to web.xml to complete the integration of dubbo's REST function with the external servlet container.

> Note: If you use spring's ContextLoaderListener to load spring, you must ensure that BootstrapListener is configured before ContextLoaderListener, otherwise dubbo initialization will fail.

In fact, you can still use the embedded server in this scenario, but the servlet container of the external application server is often more powerful than the embedded server (especially if you are deploying to a more robust and scalable WebLogic, WebSphere, etc.), and Sometimes it is also convenient for unified management, monitoring, etc. on the application server.

### Get context information

In the remote call, there may be many kinds of context information worth obtaining. Here, the client IP is taken as an example.

In dubbo's REST, we have two ways to get client IP.

The first way, using JAX-RS standard @Context annotation

```java
public User getUser(@PathParam("id") Long id, @Context HttpServletRequest request) {
    System.out.println("Client address is " + request.getRemoteAddr());
}
```

After modifying a method parameter of getUser() with Context, you can inject the current HttpServletRequest into it, and then directly call the servlet api to obtain the IP.

> Note: This method can only work when the server is set to tjws, tomcat, jetty or servlet, because only these server implementations provide a servlet container. In addition, the standard JAX-RS also supports using @Context to modify an instance field of the service class to obtain HttpServletRequest, but we do not support this in dubbo.

The second way, use RpcContext commonly used in dubbo

```java
public User getUser(@PathParam("id") Long id) {
    System.out.println("Client address is " + RpcContext.getContext().getRemoteAddressString());
}
```

> Note: This method can only work when setting server="jetty" or server="tomcat" or server="servlet" or server="tjws". In addition, currently dubbo's RpcContext is a relatively intrusive usage, and we are likely to refactor it in the future.

If you want to keep your project compatible with JAX-RS and run without dubbo in the future, please choose the first method. If you want a more elegant service interface definition, please choose the second way.

In addition, in the latest dubbo rest, it is also supported to obtain HttpServletRequest and HttpServletResponse through RpcContext to provide greater flexibility for users to implement some complex functions, such as accessing HTTP Header in dubbo standard filter. An example of usage is as follows

```java
if (RpcContext.getContext().getRequest() != null && RpcContext.getContext().getRequest() instanceof HttpServletRequest) {
    System.out.println("Client address is " + ((HttpServletRequest) RpcContext.getContext().getRequest()).getRemoteAddr());
}

if (RpcContext.getContext().getResponse() != null && RpcContext.getContext().getResponse() instanceof HttpServletResponse) {
    System.out.println("Response object from RpcContext: " + RpcContext.getContext().getResponse());
}
```

> Note: In order to maintain the neutrality of the protocol, RpcContext.getRequest() and RpcContext.getResponse() return only an Object class, and may be null. So, you have to do null and type checking yourself.

> Note: Only when server="jetty" or server="tomcat" or server="servlet" is set, can you get HttpServletRequest and HttpServletResponse correctly through the above method, because only these servers implement the servlet container.

In order to simplify programming, you can also use generics to directly obtain specific types of request/response:

```java
if (RpcContext. getContext(). getRequest(HttpServletRequest. class) != null) {
    System.out.println("Client address is " + RpcContext.getContext().getRequest(HttpServletRequest.class).getRemoteAddr());
}

if (RpcContext. getContext(). getResponse(HttpServletResponse. class) != null) {
    System.out.println("Response object from RpcContext: " + RpcContext.getContext().getResponse(HttpServletResponse.class));
}
```

If the request/response does not conform to the specified type, null will also be returned here.

### Configure port number and Context Path

The rest protocol in dubbo will use port 80 by default. If you want to modify the port, configure it directly:

```xml
<dubbo:protocol name="rest" port="8888"/>
```

In addition, as mentioned earlier, we can use @Path to configure the URL relative path of a single rest service. But in fact, we can also set a basic relative path that is applicable to all rest services, that is, the context path that is often said in java web applications.

Just add the following contextpath attribute:

```xml
<dubbo:protocol name="rest" port="8888" contextpath="services"/>
```

Take the previous code as an example:

```java
@Path("users")
public class UserServiceImpl implements UserService {
       
    @POST
    @Path("register")
    @Consumes({MediaType. APPLICATION_JSON})
    public void registerUser(User user) {
        // save the user...
    }
}
```

Now the full access path of registerUser()

```
http://localhost:8888/services/users/register
```

Note: If you choose an external application server as the rest server, that is, configure

```xml
<dubbo:protocol name="rest" port="8888" contextpath="services" server="servlet"/>
```

You must ensure that the port and contextpath set here are consistent with the port of the external application server and the context path of DispatcherServlet (that is, webapp path plus servlet url pattern). For example, for an application deployed as the tomcat ROOT path, the contextpath here must be exactly the same as `<url-pattern/>` of DispacherServlet in web.xml:

```xml
<servlet-mapping>
     <servlet-name>dispatcher</servlet-name>
     <url-pattern>/services/*</url-pattern>
</servlet-mapping>
```

### Configure the number of threads and IO threads

Thread pool size can be configured for rest services

```xml
<dubbo:protocol name="rest" threads="500"/>
```

> Note: The current thread pool settings only take effect when server="netty" or server="jetty" or server="tomcat". In addition, if server="servlet", since the external application server is enabled as the rest server at this time, it is not controlled by dubbo, so the thread pool setting here is also invalid.

If you choose netty server, you can also configure the number of IO worker threads of Netty

```xml
<dubbo:protocol name="rest" iothreads="5" threads="100"/>
```

### Configure long connection

The rest service in Dubbo is accessed by http long connection by default, if you want to switch to short connection, configure it directly

```xml
<dubbo:protocol name="rest" keepalive="false"/>
```

> Note: This configuration is currently only valid for server="netty" and server="tomcat".

### Configure the maximum number of HTTP connections

The maximum number of HTTP connections that the server provider can receive at the same time can be configured to prevent the REST server from being overwhelmed by too many connections, as a basic self-protection mechanism

```xml
<dubbo:protocol name="rest" accepts="500" server="tomcat/>
```

> Note: This configuration is currently only valid for server="tomcat".

### Configure the timeout period and the number of HTTP connections for each consumer

If the consumer of the rest service is also a dubbo system, you can configure the maximum timeout period for the consumer to call this rest service and the maximum number of HTTP connections each consumer can initiate like other dubbo RPC mechanisms.

```xml
<dubbo:service interface="xxx" ref="xxx" protocol="rest" timeout="2000" connections="10"/>
```

Of course, since this configuration is effective for the consumer side, it can also be configured on the consumer side

```xml
<dubbo:reference id="xxx" interface="xxx" timeout="2000" connections="10"/>
```

However, in general we recommend configuration to provide such configuration on the service provider side. According to dubbo's official documentation: "Providers should be configured with as many properties as possible on the Consumer side, so that Provider implementers can think about Provider service characteristics and service quality issues from the very beginning."

> Note: If dubbo's REST service is published to non-dubbo clients, the configuration on `<dubbo:service/>` here is completely invalid, because such clients are not controlled by dubbo.


### Replace part of Spring XML configuration with Annotation

All the above discussions are based on the xml configuration of dubbo in spring. However, dubbo/spring itself also supports the use of annotations for configuration, so we can also follow the steps in dubbo's official documentation to add related annotations to the implementation of REST services to replace some xml configurations, for example

```java
@Service(protocol = "rest")
@Path("users")
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;
       
    @POST
    @Path("register")
    @Consumes({MediaType. APPLICATION_JSON})
    public void registerUser(User user) {
        // save the user
        userRepository. save(user);
    }
}
```

The configuration of annotation is simpler and more precise, and it is usually easier to maintain (of course, modern IDEs can support such as class name refactoring in xml, so in terms of specific use cases here, xml is also very maintainable). And xml is less intrusive to the code, especially conducive to dynamic modification of configuration, especially if you want to configure connection timeout, maximum number of connections per client, cluster strategy, weight, etc. for a single service. In addition, especially for complex applications or modules, xml provides a central point to cover all components and configurations, which is more clear at a glance and generally more convenient for long-term project maintenance.

Of course, there is no absolute advantage or disadvantage in choosing which configuration method to choose, and it has nothing to do with personal preference.

### Add custom Filter, Interceptor, etc.

Dubbo's REST also supports JAX-RS standard Filter and Interceptor to facilitate customized interception of REST request and response processes.

Among them, Filter is mainly used to access and set HTTP request and response parameters, URI, etc. For example, to set the cache header of an HTTP response:

```java
public class CacheControlFilter implements ContainerResponseFilter {

    public void filter(ContainerRequestContext req, ContainerResponseContext res) {
        if (req. getMethod(). equals("GET")) {
            res.getHeaders().add("Cache-Control", "someValue");
        }
    }
}
```

Interceptor is mainly used to access and modify input and output byte streams, for example, manually add GZIP compression

```java
public class GZIPWriterInterceptor implements WriterInterceptor {
 
    @Override
    public void aroundWriteTo(WriterInterceptorContext context)
                    throws IOException, WebApplicationException {
        OutputStream outputStream = context. getOutputStream();
        context.setOutputStream(new GZIPOutputStream(outputStream));
        context. proceed();
    }
}
```

In standard JAX-RS applications, we generally add @Provider annotations for Filter and Interceptor, and then JAX-RS runtime will automatically discover and enable them. In dubbo, we register Filter and Interceptor by adding XML configuration:

```xml
<dubbo:protocol name="rest" port="8888" extension="xxx.TraceInterceptor, xxx.TraceFilter"/>
```

Here, we can add all three types of objects, Filter, Interceptor and DynamicFeature, to the `extension` attribute, and separate them with commas. (DynamicFeature is another interface, which can facilitate us to enable Filter and Interceptor more dynamically. If you are interested, please google yourself.)

Of course, dubbo itself also supports the concept of Filter, but the Filter and Interceptor we discuss here are closer to the bottom layer of the protocol implementation. Compared with Dubbo's filter, it can be customized at a lower level.

> Note: The XML attribute here is called extension, not interceptor or filter, because in addition to Interceptor and Filter, we will add more extension types in the future.

If the consumer side of REST is also a dubbo system (see the discussion below), you can also configure Interceptor and Filter for the consumer side in a similar way. But note that the consumer-side Filter and the provider-side Filter in JAX-RS are two different interfaces. For example, in the previous example, the server is the ContainerResponseFilter interface, while the consumer corresponds to the ClientResponseFilter:

```java
public class LoggingFilter implements ClientResponseFilter {
 
    public void filter(ClientRequestContext reqCtx, ClientResponseContext resCtx) throws IOException {
        System.out.println("status: " + resCtx.getStatus());
System.out.println("date: " + resCtx.getDate());
System.out.println("last-modified: " + resCtx.getLastModified());
System.out.println("location: " + resCtx.getLocation());
System.out.println("headers:");
for (Entry<String, List<String>> header : resCtx. getHeaders(). entrySet()) {
     System.out.print("\t" + header.getKey() + " :");
for (String value : header. getValue()) {
System.out.print(value + ", ");
}
System.out.print("\n");
}
System.out.println("media-type: " + resCtx.getMediaType().getType());
    }
}
```

### Add custom Exception handling

Dubbo's REST also supports JAX-RS standard ExceptionMapper, which can be used to customize the HTTP response that should be returned after a specific exception occurs.

```java
public class CustomExceptionMapper implements ExceptionMapper<NotFoundException> {

    public Response toResponse(NotFoundException e) {
        return Response.status(Response.Status.NOT_FOUND).entity("Oops! the requested resource is not found!").type("text/plain").build();
    }
}
```

Similar to Interceptor and Filter, it can be enabled by adding it to the XML configuration file

```xml
<dubbo:protocol name="rest" port="8888" extension="xxx.CustomExceptionMapper"/>
```

### Configure HTTP log output

Dubbo rest supports outputting header fields and body message bodies in all HTTP requests/responses.

Add the following built-in REST filter in the XML configuration:

```xml
<dubbo:protocol name="rest" port="8888" extension="org.apache.dubbo.rpc.protocol.rest.support.LoggingFilter"/>
```

Then configure to turn on INFO level log output for at least org.apache.dubbo.rpc.protocol.rest.support in the logging configuration, for example, configure in log4j.xml

```xml
<logger name="org.apache.dubbo.rpc.protocol.rest.support">
    <level value="INFO"/>
    <appender-ref ref="CONSOLE"/>
</logger>
```

Of course, you can also directly open INFO level log output in ROOT logger

```xml
<root>
<level value="INFO" />
<appender-ref ref="CONSOLE"/>
</root>
```

Then something similar to the following will be output in the log

```
The HTTP headers are:
accept: application/json;charset=UTF-8
accept-encoding: gzip, deflate
connection: Keep-Alive
content-length: 22
content-type: application/json
host: 192.168.1.100:8888
user-agent: Apache-HttpClient/4.2.1 (java 1.5)
```

```
The contents of request body are:
{"id":1,"name":"dang"}
```

After HTTP log output is enabled, in addition to the performance overhead of normal log output, additional overhead will be generated when parsing HTTP requests, for example, because additional memory buffers need to be established to prepare data for log output.

### Validation of input parameters

Dubbo's rest supports Java standard bean validation annotation (JSR 303) for input validation http://beanvalidation.org/

In order to be consistent with other dubbo remote call protocols, the annotation for verification in rest must be placed on the service interface, for example

```java
public interface UserService {
   
    User getUser(@Min(value=1L, message="User ID must be greater than 1") Long id);
}

```

Of course, in many other bean validation application scenarios, the annotation is placed on the implementation class instead of the interface. At least one advantage of putting the annotation on the interface is that dubbo clients can share the information of this interface, and dubbo can complete the input verification locally without even making remote calls.

Then open the validation in the XML configuration according to dubbo's standard way:

```xml
<dubbo:service interface=xxx.UserService" ref="userService" protocol="rest" validation="true"/>
```

In many other remote call protocols of dubbo, if the input verification fails, `RpcException` is directly thrown to the client, but in rest, since the client is often a non-dubbo or even non-java system, it is inconvenient to directly throw a Java exception . Therefore, currently we return validation errors as XML

```xml
<violationReport>
    <constraint Violations>
        <path>getUserArgument0</path>
        <message>User ID must be greater than 1</message>
        <value>0</value>
    </constraintViolations>
</violationReport>
```

Return values in other data formats will be supported later. As for how to internationalize the validation error message, just refer to the relevant documents of bean validation.

If you think that the default validation error return format does not meet your requirements, you can add a custom ExceptionMapper to freely customize the error return format as described in the above section. It should be noted that this ExceptionMapper must use a generic declaration to catch dubbo's RpcException, in order to successfully override the default exception handling strategy of dubbo rest. In order to simplify the operation, in fact, the easiest way here is to directly inherit the RpcExceptionMapper of dubbo rest, and override the method of handling verification exceptions

```java
public class MyValidationExceptionMapper extends RpcExceptionMapper {

    protected Response handleConstraintViolationException(ConstraintViolationException cve) {
        ViolationReport report = new ViolationReport();
        for (ConstraintViolation cv : cve. getConstraintViolations()) {
            report.addConstraintViolation(new RestConstraintViolation(
                    cv.getPropertyPath().toString(),
                    cv. getMessage(),
                    cv.getInvalidValue() == null ? "null" : cv.getInvalidValue().toString()));
        }
        // Use json output instead of xml output
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(report).type(ContentType.APPLICATION_JSON_UTF_8).build();
    }
}
```

Then add this ExceptionMapper to the XML configuration:

```xml
<dubbo:protocol name="rest" port="8888" extension="xxx.MyValidationExceptionMapper"/>
```