Part 1
Part 2

### Is annotation put in interface class or implementation class?

The development of REST services based on Dubbo is mainly configured through JAX-RS annotations. In the above example, we put the annotation in the implementation class of the service. But in fact, we can completely put the annotation in the interface of the service. These two methods are completely equivalent, for example:

```java
@Path("users")
public interface UserService {
    
    @GET
    @Path("{id : \\d+}")
    @Produces({MediaType.APPLICATION_JSON})
    User getUser(@PathParam("id") Long id);
}
```

In a typical application, we recommend put the annotation in the service implementation class. Then, annotations are closer to Java implementation code and easier to develop and maintain. More importantly, we generally tend to avoid contamination of the interface, maintaining the purity and wide applicability of the interface.

However, as will be described later, if we access this service by using the consumer directly developed by Dubbo, the annotation must be put in the interface.

If the interface and the implementation class are both added annotation at the same time, the implementation configuration of the implementation class will take effect, and the annotation on the interface will be ignored.

### Support for JSON, XML and other data formats

The dubbo REST services can support the transmission of data in multiple formats to provide maximum flexibility to the client. And we add extra functions to the JSON and XML formats which is most commonly used.

For example, we want the `getUser()` method in the above example support returning JSON and XML format data separately, just need to include two formats in the annotation:

```java
@Produces({MediaType.APPLICATION_JSON, MediaType.TEXT_XML})
User getUser(@PathParam("id") Long id);
```
	
Or you can directly represent a MediaType with a string (also supports wildcards):

```java
@Produces({"application/json", "text/xml"})
User getUser(@PathParam("id") Long id);
```

If all methods support the same type of input and output data format, then we do not need to make configure on each method, just add annotation to the service class:


```java
@Path("users")
@Consumes({MediaType.APPLICATION_JSON, MediaType.TEXT_XML})
@Produces({MediaType.APPLICATION_JSON, MediaType.TEXT_XML})
public class UserServiceImpl implements UserService {
    // ...
}
```

In the case where a REST service supports multiple data formats, according to the JAX-RS standard, the MIME header (content-type and accept) in HTTP is generally used to specify which format data is currently used.

But in dubbo, we also automatically support the current common use of the industry, that is, use a URL suffix (.json and .xml) to specify the data format you want to use. For example, after adding the above annotation, directly accessing `http://localhost:8888/users/1001.json` means using the json format, and directly accessing `http://localhost:8888/users/1002.xml` means using the xml format. It's simpler and more intuitive than using HTTP Header. This way is used by the REST APIs of Twitter, Weibo, etc.

If you don't add HTTP header or suffix, the REST of dubbo will give priority to enable the top ranked data format in the above definition of annotation.

> Note: To support XML format data, you can use either `MediaType.TEXT_XML` or `MediaType.APPLICATION_XML` in annotation, but TEXT_XML is more commonly used, and if you want to use the above URL suffix to specify the data format, you can only configure it as TEXT_XML to take effect.

### Chinese character support

In order to output Chinese characters normally in dubbo REST, as with the usual Java web applications, we need to set the contentType of the HTTP response to UTF-8 encoding.

Based on the standard usage of JAX-RS, we only need to do the following annotation configuration:

```java
@Produces({"application/json; charset=UTF-8", "text/xml; charset=UTF-8"})
User getUser(@PathParam("id") Long id);
```

For the convenience of users, we add a support class directly in dubbo REST to define the above constants, which can be used directly and reduce the possibility of error.

```java
@Produces({ContentType.APPLICATION_JSON_UTF_8, ContentType.TEXT_XML_UTF_8})
User getUser(@PathParam("id") Long id);
```

### Additional requirements for XML data format

Because the implementation of JAX-RS generally use standard JAXB (Java API for XML Binding) to serialize and deserialize XML format data, we need to add a class-level JAXB annotation for each object to be transferred in XML. Otherwise serialization will report an error. For example, add follows to the User returned in `getUser()` :

```java
@XmlRootElement
public class User implements Serializable {
    // ...
}
```	

In addition, if the return value in the service method is Java primitive type (such as int, long, float, double, etc.), it is best to add a wrapper object to them, because JAXB can not directly serialize the primitive type.

For example, we want the above `registerUser()` method to return the ID number generated by the server for the user:

```java
long registerUser(User user);
```

Because the primitive type is not supported by JAXB serialization, add a wrapper object:

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

This not only solves the problem of XML serialization, but also makes the returned data conform to the specifications of XML and JSON. For example, in JSON, the returned form would be as follows:

```javascript
{"id": 1001}
```

If you do not add a wrapper, the JSON return value will be directly

```
1001 	
```

In XML, the return value after adding wrapper will be:

```xml
<registrationResult>
    <id>1002</id>
</registrationResult>
```
	
This wrapper object actually uses the so-called Data Transfer Object (DTO) mode, and DTO can also make more useful customizations for transferring data.
While in XML, after adding wrapper, the return value will be

```xml
<registrationResult>
    <id>1002</id>
</registrationResult>
```

In fact, this wrapper object uses the so-called Data Transfer Object (DTO) mode. DTO can also be used to make more useful customizations to transfer data.

### Custom Serialization

As mentioned above, the underlying implementation of REST will automatically serialize/deserialize between the service object and the JSON/XML data format.

The REST implementation in Dubbo uses JAXB for XML serialization and Jackson for JSON serialization,so you can customize the mapping by adding JAXB or Jackson's annotation to the object.

For example, customizing the object properties to map to the names of the XML elements:

```java
@XmlRootElement
@XmlAccessorType(XmlAccessType.FIELD)
public class User implements Serializable {

    @XmlElement(name="username")
    private String name;  
}
```

Customizing the object properties to map to the names of the JSON field:

```java
public class User implements Serializable {

    @JsonProperty("username")
    private String name;
}
```

For more information, please refer to the official documentation of JAXB and Jackson, or google yourself.

### Configuring REST Server implementation

Currently in dubbo, we support the implementation of five embedded rest servers. The implementation of the rest server is selected by the following XML attribute of the server:

```xml
<dubbo:protocol name="rest" server="jetty"/>
```

The above configuration uses the embedded jetty to do the rest server. At the same time, if you do not configure the server attribute, the rest protocol also uses jetty by default. jetty is a very mature java servlet container and has a good integration with dubbob (Among the five embedded servers, Only jetty and later tomcat、tjws, complete seamless integration with Dubbo monitoring system.), so, if your dubbo system is a separate process, you can use jetty by default.

```xml
<dubbo:protocol name="rest" server="tomcat"/>
```

The above configuration uses the embedded tomcat to do the rest server.On embedded tomcat, REST performance is much better than jetty (See the benchmark below). It is recommended that Tomcat is used in scenarios where high performance is required.

```xml
<dubbo:protocol name="rest" server="netty"/>
```

The above configuration uses embedded netty to do the rest server. (TODO more contents to add)

```xml
<dubbo:protocol name="rest" server="tjws"/> (tjws is now deprecated)
<dubbo:protocol name="rest" server="sunhttp"/>
```

The above configuration uses embedded tjws or Sun HTTP server to do the rest server. These two server implementations are very lightweight, it is very convenient for quick start-up in integration testing, of course, it can also be used in a production environment with low load. Note: tjws is currently deprecated because it does not work well with the servlet 3.1 API.

If your dubbo system is not a separate process,
instead of deploying to a Java application server, we recommend the following configuration:

```xml
<dubbo:protocol name="rest" server="servlet"/>
```

By setting the server as the servlet, dubbo will use the servlet container of the external application server to do the rest server. At the same time, add the following configuration to the web.xml of the dubbo system:

```xml
<web-app>
    <context-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>/WEB-INF/classes/META-INF/spring/dubbo-demo-provider.xml</param-value>
    </context-param>

    <listener>
        <listener-class>com.alibaba.dubbo.remoting.http.servlet.BootstrapListener</listener-class>
    </listener>

    <listener>
        <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
    </listener>

    <servlet>
        <servlet-name>dispatcher</servlet-name>
        <servlet-class>com.alibaba.dubbo.remoting.http.servlet.DispatcherServlet</servlet-class>
        <load-on-startup>1</load-on-startup>
    </servlet>

    <servlet-mapping>
        <servlet-name>dispatcher</servlet-name>
        <url-pattern>/*</url-pattern>
    </servlet-mapping>
</web-app>
```

In other words, you must add dubbo's BootstrapListener and DispatherServlet to web.xml to complete the integration of dubbo's REST functionality with the external servlet container.

> Note:If you are using spring's ContextLoaderListener to load spring, you must ensure that the BootstrapListener is configured before the ContextLoaderListener, otherwise the dubbo initialization will fail.

In fact, you can still stick to the embedded server in this scenario, but the servlet container of the external application server is often more powerful than the embedded server(Especially if you are deploying to a more robust and scalable WebLogic, WebSphere, etc.). In addition, it is sometimes convenient to do unified management, monitoring, and so on in the application server.

### Get Context Information

Varieties of context information are valuable when calling procedures remotely. For instance, the IP address from the Client. 

We provide two methods to get the Client's IP in dubbo.

The first one is using @Context annotation from JAX-RS:

```java
public User getUser(@PathParam("id") Long id, @Context HttpServletRequest request) {
    System.out.println("Client address is " + request.getRemoteAddr());
} 
```

After decorating a parameter of `getUser()` with Context, we can inject the current HttpServletRequest and then call the servlet api to get the IP.

> Notice: This method can only be used when the server is one of the followings: twjs, tomecat, jetty or servlet. All of them provide servlet container. In addition, standard JAX-RS also allow us to get HttpServletRequest using an instance field in service Class decorated by `@Context`. 

The second method is to use RpcContext, which is commonly seen in dubbo:

```java
public User getUser(@PathParam("id") Long id) {
    System.out.println("Client address is " + RpcContext.getContext().getRemoteAddressString());
} 
```

> Notice: Similarly, this method only works in the jetty, tomcat, servlet or tjws server. In dubbo, the usage of RpcContext is rather invasive. We are likely to refactor it in the future.

The first method is suggested when your project may run without dubbo and need the compatibility with JAX-RS. But if you want a more elegant service interface definition, the second method would be the better choice.

What's more, in the newest version of dubbo REST service, RpcContext could be used to get HttpServletRequest and HttpServletResponse, providing great flexibility for users to implement some complex functions. The following is an example: 

```java
if (RpcContext.getContext().getRequest() != null && RpcContext.getContext().getRequest() instanceof HttpServletRequest) {
    System.out.println("Client address is " + ((HttpServletRequest) RpcContext.getContext().getRequest()).getRemoteAddr());
}

if (RpcContext.getContext().getResponse() != null && RpcContext.getContext().getResponse() instanceof HttpServletResponse) {
    System.out.println("Response object from RpcContext: " + RpcContext.getContext().getResponse());
}
```

> Notice: 
In order to maintain the neutrality of the protocol, `RpcContext.getRequest()` and `RpcContext.getResponse()` only return an Object which could be null. Therefore, you have to check the type on your own.

> Notice: only when you use jetty, tomcat, servlet as the server can you get the HttpServletRequest and HttpServletResponse as expected. Because only these server 
implemented the servlet container.

To simplify the programme, you can also use generic to get a specific type of request/response:

```java
if (RpcContext.getContext().getRequest(HttpServletRequest.class) != null) {
    System.out.println("Client address is " + RpcContext.getContext().getRequest(HttpServletRequest.class).getRemoteAddr());
}

if (RpcContext.getContext().getResponse(HttpServletResponse.class) != null) {
    System.out.println("Response object from RpcContext: " + RpcContext.getContext().getResponse(HttpServletResponse.class));
}
```

If request/response does not correspond to the specific type, it would return null.

### Configure The Port Number and Context Path

The REST protocol in dubbo use 80 as the default port. But you are also allowed to modify it: 

```xml
<dubbo:protocol name="rest" port="8888"/>
```

As what have been metioned before, we can use `@Path` to configure relative URL path in single REST service. In fact, we can also set a basic relative path which is known as context path for all REST service.  

All we need to do is to add the contextpath property:

```xml
<dubbo:protocol name="rest" port="8888" contextpath="services"/>
```

Let's have a look at the previous code: 

```java
@Path("users")
public class UserServiceImpl implements UserService {
       
    @POST
    @Path("register")
    @Consumes({MediaType.APPLICATION_JSON})
    public void registerUser(User user) {
        // save the user...
    }	
}
```

Now the complete path would be:

```
http://localhost:8888/services/users/register
```

Notice: If you use external server as REST server, you should configure as followings,

```xml
<dubbo:protocol name="rest" port="8888" contextpath="services" server="servlet"/>
```

meaning that you should keep the config of port and contextpath are the same with the port and DispatcherServlet's context path (webapp path + servlet url pattern) in external server. For example, when we are configuring the application on tomcat Root path, we need to make sure the contextpath here is totally the same with the `<url-pattern/>` of DispacherServlet in web.xml:

```xml
<servlet-mapping>
     <servlet-name>dispatcher</servlet-name>
     <url-pattern>/services/*</url-pattern>
</servlet-mapping>
```

### Configure the number of threads and IO threads

We can set the number of threads of rest service:

```xml
<dubbo:protocol name="rest" threads="500"/>
```

> Notice: Currently, the setting only works when the server is netty, jetty or tomcat. If you use servlet as the server, you are using the external server as the REST server which is out of dubboes' control, so the setting would not work expectedly.

You can also set threads number of IO worker of netty server:

```xml
<dubbo:protocol name="rest" iothreads="5" threads="100"/>
```

### Configure long connections

The REST service in Dubbo is accessed by default with http long connection, if you want to switch to short connection, you can configure it as below:

```xml
<dubbo:protocol name="rest" keepalive="false"/>
```

> Notice: This configuration only works in netty and tomcat.

### Configure the maximum number of HTTP connections

Configuring the maximum number of HTTP connections can prevent REST server from 
overload as the basic self-protection mechanism.

```xml
<dubbo:protocol name="rest" accepts="500" server="tomcat/>
```

> Notice: Currently, it only works in tomcat.

### Configuring the timeout and HTTP connections for each consumer

If the consumer of the rest service is also a dubbo system, you can configure the maximum timeout for the consumer to call the rest service, and the maximum number of HTTP connections that each consumer can initiate, just like other dubbo RPC mechanisms.

```xml
<dubbo:service interface="xxx" ref="xxx" protocol="rest" timeout="2000" connections="10"/>
```

Of course, since this configuration is valid for the consumer, it can also be configured on the consumer side:

```xml
<dubbo:reference id="xxx" interface="xxx" timeout="2000" connections="10"/>
```

However, we generally recommend configuring the service provider to provide such a configuration. According to the official dubbo documentation, “Provider should configure the properties of the Consumer side as much as possible.
Let the Provider implementer think about the service features and service quality of the Provider from the beginning.”

> Note: If dubbo REST service is released to non-dubbo clients, the configuration on `<dubbo:service/>` is completely invalid because the client is not under dubbo control.

Part 3
Part 4
