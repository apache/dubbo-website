---
type: docs
title: "REST support"
linkTitle: "REST support"
weight: 19
description: "Develop RESTful application in Dubbo" 
---

{{% pageinfo %}}
Original author: Li Shen
Document copyright: [Apache 2.0license Signature - No interpretation](HTTP://www.apache.org/licenses/LICENSE-2.0)

Working in progress ...
{{% /pageinfo %}}

> This article is lengthy since REST involves many aspects. Besides, it refers to the document style of Spring and so on. Not only limited to usage of the framework but also strives to present the design concept of the framework and the architectural idea of an excellent application.
> For people who only want to get a glimpse of Dubbo and REST, all they need is to browse through the `Overview` to `Introduction to Standard Java REST API: JAX-RS`.

## CONTENT

* Overview
* Advantages of REST
* Application Scenarios
* Quick Start
* Introduction to Standard Java REST API: JAX-RS
* Details of REST Service Provider
    * Implementation of HTTP POST/GET
    * Should Annotation be Placed in the Interface or Implementation
    * Support for Multiple Data Formats (JSON, XML, etc.)
    * Support for Chinese Characters
    * Additional Requirements for XML Format
    * Custom Serialization
    * Configure the Implementation of REST Server
    * Access Context Data
    * Configure the Port Number and Context Path	
    * Configure Number of Threads and IO Threads	
    * Configure Persistent Connection	
    * Configure Maximum Number of HTTP Connections
    * Configure Timeout and HTTP Connections Per Consumer	
    * Gzip Data Compression	
    * Replace Part of Spring XML Configuration With Annotation	
    * Add Custom Filter, Interceptor, etc.
    * Add Custom Exception Handler	
    * Configure HTTP Log Output
    * Verification of Input Parameters
    * Should REST Services be Published Transparently	
    * Get Headers In Dubbo Rest Provider	
* Details of REST Service Consumer	
    * Scenario 1: Non-Dubbo Consumer Calls Dubbo REST Service	
    * Scenario 2: Dubbo Consumer Calls Dubbo REST Service	
    * Scenario 3: Dubbo Consumer Calls Non-Dubbo REST Service	
    * Custom Header By Dubbo Consumer while Calling REST Service
* JAX-RS Restrictions in Dubbo	
* REST FAQ
    * Can Dubbo REST Services be Integrated With Dubbo Registration Center and Monitoring Center?
    * How to Implement Load Balancing and Failover in Dubbo REST?
    * Can Overloaded Methods in JAX-RS Map to Single URL?
    * Can a Method in JAX-RS Receive Multiple Parameters Via POST? 
* Possible shortcomings of Current Dubbo System (Related to REST)	
    * Invasiveness of Rpc Context	
    * Limitations of Protocol Configuration	
    * XML Naming Does Not Conform to the Convention of Spring	
* REST Best Practices	
* Performance Benchmark	
    * Test Environment	
    * Test Script	
    * Test Result
* Extended Discussion
    * Comparison of REST, Thrift, Protobuf, etc.	
    * Comparison Between REST and Traditional Web Services	
    * Comparison Between JAX-RS and Spring MVC	
* Future

## Overview

Dubbo supports a variety of remote calling methods, such as Dubbo RPC (Binary Serialization + TCP), HTTP Invoker (Binary Serialization + HTTP, at least there is no support for Text Serialization in the open source version), Hessian (Binary Serialization + HTTP), Web Services (Text Serialization + HTTP), etc., but lacks support for trending RESTful Remote Calls (Text Serialization + HTTP).

Therefore, based on the standard Java REST API: JAX-RS 2.0 (Abbreviation of Java API for RESTful Web Services), we provide a mostly transparent REST Call support for Dubbo. Since it is fully compatible with the Standard Java API, all REST services developed for Dubbo may normally work without Dubbo or any specific underlying REST implementation.

It is particularly worth noting that we do not need to strictly adhere to the original definition and architectural style of REST. Even the famous Twitter REST API will make modest adjustments according to the situations, rather than mechanically follow the original REST style.

> Note: We call this feature RESTful Remoting (abstracted remote process or call) rather than a RESTful RPC (specific remote "procedure" call) because REST and RPC can be thought of two different styles. In Dubbo's REST implementation, there are two aspects, one is to provide or consume regular REST services, the other is to make REST a protocol implementation in the Dubbo RPC system, and RESTful Remoting covers both aspects.

## Advantages of REST

The following is quoted from Wikipedia:

* REST can use cache to improve response speed more efficiently.
* The stateless nature of the communication allows a set of servers to handle different requests in series, resulting in the increment of server scalability.
* Browser can be used as a client to simplify software requirements.
* REST software dependency is smaller than other mechanisms superimposed on HTTP.
* REST does not require additional resource discovery mechanism.
* REST's long-term compatibility is better in software technology evolution.

Here I also want to add a particular advantage of REST: REST bases on simple text format messages and universal HTTP. Therefore, it has a broad applicability and is supported by almost all languages and platforms, together with a lower threshold in using and learning.

## Application scenarios

Because of the advantages of REST in applicability, supporting REST in Dubbo can bring (significant) benefits to most of current mainstream remoting call scenarios:
 
1. Significantly simplify (cross-language) calls between heterogeneous systems within the enterprise. This is mainly for the following scene: Dubbo acts as a service provider, and systems that are written by other languages (including some java systems that do not base on Dubbo) works as service consumers. The two systems communicate through HTTP and text messages. REST has its unique advantages even comparing to binary cross-language RPC frameworks such as Thrift and ProtoBuf. (See discussion below)

2. Significantly simplify the development of the external Open API (Open Platform). You can use Dubbo to develop a specific Open API application, or you can directly publish the internal Dubbo service as a "transparent" REST API (Of course, it's better for Dubbo itself to provide more features transparently, for example, permission control, frequency control, billing and so on).

3. Significantly simplify the development of mobile (tablet) apps or desktop clients. Similar to point 2, you can use Dubbo to develop a specialized server for the applications, or transparently expose the internal Dubbo service. Of course in some projects, mobile or desktop applications can directly access the Open API described in point 2.

4. Significantly simplify the development of AJAX applications on the browser. Similar to point 2, you can use Dubbo to develop a specialized server for AJAX, or transparently expose the internal Dubbo service directly to JavaScript in the browser. Of course, many AJAX applications work better with web frameworks, so direct access to the Dubbo service may not be an exquisite architecture in many web projects.

5. Provide a text-based, easy-to-read remote call method for Dubbo systems within the enterprise (that is, both the service provider and the consumer are Dubbo-based systems).

6. Simplify the call from the Dubbo system to other heterogeneous systems. You can use a simple way like Dubbo to "transparently" call REST services provided by Non-Dubbo systems (regardless of whether the service provider is inside or outside the enterprise)

It should be pointed out that I think that 1~3 are the most valuable application scenarios for Dubbo's REST call. And the main purpose why we add REST calls for Dubbo is to provide a service-oriented provider. In other words, to develop REST services for Non-Dubbo (heterogeneous) consumers.

To sum up, all application scenarios are shown below:
![rest.jpg](/imgs/user/rest.jpg)

Borrowing the most famous slogan of Java in the past, by adding REST calls to Dubbo, you can implement the "Write once, access everywhere" service, which can theoretically be accessed all over the world, thus truly achieving an idealized Service-oriented Architecture (SOA).

Of course, traditional Web Services (WSDL/SOAP) can meet the requirements (even those that require enterprise-level features) of the above scenarios (except for scenario 4). But due to the complexity and other issues, they are less and less used.

## Quick Start

Developing a RESTful service in Dubbo is relatively straightforward. Let's take a simple user registration service for example.

The function to be implemented by this service is to provide the following URL (Note: This URL is not entirely RESTful, but more straightforward and more practical):

```
http://localhost:8080/users/register
```

Any client can POST a JSON string containing the user's information to the above URL to complete the user registration.

First, implement the interface of the service:

```java
public class UserService {    
   void registerUser(User user);
}
```

Then, implement the service:

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
The above implementation code for the service is very simple, but since the REST service is to be published to a specific HTTP URL so they can be accessed by clients written by any language or even a browser, there are a few additional JAX-RS standard annotations to be added for the relevant configuration:

@Path("users"): Specify that the relative path for `UserService` is `/users`, standing for http://localhost:8080/users

@Path("register"): Specify that the relative path for `registerUser()` is `/register`. Combining the previous @Path specified for `UserService`, the URL to call `UserService.register()` is HTTP://localhost:8080/users/register

@POST: Specify that `registerUser()` should be accessed with HTTP POST method

@Consumes({MediaType.APPLICATION_JSON}): Specify that `registerUser()` receives data in JSON format. The REST framework will automatically deserialize JSON data into a User object.

Finally, add this service to the spring configuration file and finish all service development work:

 ```xml
<!-- Exposure service on port 8080 with rest protocol -->
<Dubbo:protocol name="rest" port="8080"/>
 
<!-- Declare the service interface that needs to be exposed -->
<Dubbo:service interface="xxx.UserService" ref="userService"/>
 
<!-- Implement the service like the local bean -->
<bean id="userService" class="xxx.UserServiceImpl" />
``` 

## Introduction to Standard Java REST API: JAX-RS

JAX-RS is a standard Java REST API that has been widely supported and applied in the industry. There are many well-known open source implementations, including Oracle's Jersey, RedHat's RestEasy, Apache's CXF and Wink, restlet, etc. In addition, all commercial JavaEE application servers that support the JavaEE 6.0 specifications or above support JAX-RS. Therefore, JAX-RS is a very mature solution, and it does not have any so-called vendor lock-in problems.

JAX-RS has a wealth of information on the web, such as the following introductory tutorial:

* Oracle official tutorial: https://www.oracle.com/technical-resources/articles/java/jax-rs.html
* Article on IBM developerWorks China: http://www.ibm.com/developerworks/cn/java/j-lo-jaxrs/

For more information, please feel free to Google or Baidu. As far as learning JAX-RS is concerned, it is generally enough to master the usage of various annotations.

> Note: Dubbo is based on the JAX-RS 2.0, and sometimes you need to pay attention to the version of the reference material or REST implementation.

## REST Service Provider Details

In this section, we will expand the `UserService` in the "Quick Start" to further demonstrate the development points of the REST service provider in Dubbo.

### Implementation of HTTP POST/GET 

Although it's recommended to use the four standard methods (POST, DELETE, PUT and GET) in the HTTP protocol to implement common CRUD in REST services, but in practice, we generally use POST to implement create and update, and use GET to implement delete and read (DELETE and PUT will even be blocked by some firewalls).

The implementation of POST has already been briefly demonstrated. Here, we will add a function to get the registered user data to `UserService`, in order to demonstrate the implementation of GET.

This function is to enable the client to obtain user data of different IDs by accessing different URLs as follows:

```
http://localhost:8080/users/1001
http://localhost:8080/users/1002
http://localhost:8080/users/1003
```

Of course, you can use other forms of URLs to access user data of different IDs, for example:

```
http://localhost:8080/users/load?id=1001
```

JAX-RS itself can support all of these forms. However, the first form of including query parameters in the URL path (http://localhost:8080/users/1001) is more in line with the general habit of REST, so it is recommended to use. Below we will add a `getUser()` method to the `UserService` to implement this form of URL access:

```java
@GET
@Path("{id : \\d+}")
@Produces({MediaType.APPLICATION_JSON})
public User getUser(@PathParam("id") Long id) {
    // ...
}
```

@GET: Specify that the method shoule be accessed with HTTP GET method

@Path("{id : \d+}"): According to the above functional requirements, the URL to access `getUser()` should be "http://localhost:8080/users/ + any number", and this number should passed to `getUser()` method as parameter passed to the getUser() method. In the annotation here, the {id: xxx} in @Path specifies that the relative path contains the id parameter, and its value will be automatically passed to the method parameter `id` annotated with @PathParam("id"). `\d+` following `{id:` is a regular expression specifies that the id parameter must be a number.

@Produces({MediaType.APPLICATION_JSON}): Specify that `getUser()` outputs data in JSON format. The REST framework automatically serializes the User object into JSON data.

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

### GZIP data compresssion

Dubbo RESTful Remoting supports the use of Gzip to compress request and response data to reduce network transmission time and bandwidth consumption, but this will also increase CPU overhead.

TODO more contents to add.

### Replacing part of the spring XML configuration with annotation 

Above discussions are based on the XML configuration of Dubbo in spring.
However, dubbo/spring itself supports the use of annotation for configuration, so we can also follow the steps in the Dubbo document and add the relevant annotation to the REST service implementation, replacing some XML configurations, such as:

```java
@Service(protocol = "rest")
@Path("users")
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;
       
    @POST
    @Path("register")
    @Consumes({MediaType.APPLICATION_JSON})
    public void registerUser(User user) {
        // save the user
        userRepository.save(user);
    }	
}
```

Annotation-based configuration is more concise and precise, and often easier to maintain (modern IDE can support such things as class name refactoring in XML, and therefore the maintenance of XML is good for specific use cases here). XML is less intrusive to code, especially for dynamically modifying configurations, especially when you want to modify the timeout for connection of a single service configuration, the maximum number of connections per client, cluster policy, weights, and so on. In addition, for complex applications or modules, XML provides a central point to cover all the components and configurations. It is at a glance, and generally more convenient for long term maintenance of the project.

Of course, there's no right or wrong of different choices of configuration method. Sometimes it's just personal preference.

### Adding a custom Filter, Interceptor, etc

Dubbo RESTful Remoting also supports JAX-RS standard Filter and Interceptor to facilitate customized interception of REST request and response processes. 

Here, Filter is mainly used to access and set parameters, URIs for HTTP request and response, and so on, for example, setting the cache header for HTTP response:

```java
public class CacheControlFilter implements ContainerResponseFilter {

    public void filter(ContainerRequestContext req, ContainerResponseContext res) {
        if (req.getMethod().equals("GET")) {
            res.getHeaders().add("Cache-Control", "someValue");
        }
    }
}
```

Interceptor is mainly used to access and modify the input and output byte streams, for example, manually adding GZIP compression:

```java
public class GZIPWriterInterceptor implements WriterInterceptor {
 
    @Override
    public void aroundWriteTo(WriterInterceptorContext context)
                    throws IOException, WebApplicationException {
        OutputStream outputStream = context.getOutputStream();
        context.setOutputStream(new GZIPOutputStream(outputStream));
        context.proceed();
    }
}
```

In standard JAX-RS applications, we generally add @Provider annotations to Filter and Interceptor, and JAX-RS runtime will automatically discover and enable them. In Dubbo, we register Filter and Interceptor by adding an XML configuration:

```xml
<dubbo:protocol name="rest" port="8888" extension="xxx.TraceInterceptor, xxx.TraceFilter"/>
```

Here, we can add these three types of objects, Filter, Interceptor and DynamicFeature, to the `extension` attributes, separated by commas. (DynamicFeature is another interface that allows us to enable Filter and Interceptor more dynamically. Please feel free to google.)

Of course, Dubbo itself also supports Filter, but the Filter and Interceptor we discuss here are more like the bottom of the protocol implementation. Compared to Dubbo's filter, you can do a lower level of customization here.

> Note: The XML attribute here is called extension, not interceptor or filter. That is because we will add more extension types in addition to Interceptor and Filter in the future.

If the REST consumer is also a Dubbo system (see discussion below), you can also configure the Interceptor and Filter for the consumer in a similar way. 

However, it should be noted that the consumer-side Filter and the provider-side Filter in JAX-RS are two different interfaces. For example, in the previous example, the server is the ContainerResponseFilter interface, and the consumer side corresponds to the ClientResponseFilter:

```java
public class LoggingFilter implements ClientResponseFilter {
 
    public void filter(ClientRequestContext reqCtx, ClientResponseContext resCtx) throws IOException {
        System.out.println("status: " + resCtx.getStatus());
	    System.out.println("date: " + resCtx.getDate());
	    System.out.println("last-modified: " + resCtx.getLastModified());
	    System.out.println("location: " + resCtx.getLocation());
	    System.out.println("headers:");
	    for (Entry<String, List<String>> header : resCtx.getHeaders().entrySet()) {
     	    System.out.print("\t" + header.getKey() + " :");
	        for (String value : header.getValue()) {
	            System.out.print(value + ", ");
	        }
	        System.out.print("\n");
	    }
	    System.out.println("media-type: " + resCtx.getMediaType().getType());
    } 
}
```

### Adding custom Exception handler

Dubbo RESTful Remoting also supports JAX-RS standard ExceptionMapper, which can be used to customize the HTTP response after a particular exception occurs.

```java
public class CustomExceptionMapper implements ExceptionMapper<NotFoundException> {

    public Response toResponse(NotFoundException e) {     
        return Response.status(Response.Status.NOT_FOUND).entity("Oops! the requested resource is not found!").type("text/plain").build();
    }
}
```

Similar to Interceptor and Filter, it can be enabled by adding it to an XML configuration file:

```xml
<dubbo:protocol name="rest" port="8888" extension="xxx.CustomExceptiionMapper"/>
```

### Configuring HTTP log output

Dubbo RESTful Remoting supports outputting the header and body in all HTTP requests/responses.

 Add the following REST filter to the XML configuration:

```xml
<dubbo:protocol name="rest" port="8888" extension="org.apache.dubbo.rpc.protocol.rest.support.LoggingFilter"/>
```

**Then turn on at least INFO level log output for org.apache.dubbo.rpc.protocol.rest.support in the logging configuration**,for example,in log4j.xml:

```xml
<logger name="org.apache.dubbo.rpc.protocol.rest.support">
    <level value="INFO"/>
    <appender-ref ref="CONSOLE"/>
</logger>
```

Of course, you can also turn on INFO level log output directly in the ROOT logger:

```xml
<root>
	<level value="INFO" />
	<appender-ref ref="CONSOLE"/>
</root>
```

 Then there will be something like the following output in the log:

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
The contents of request body is: 
{"id":1,"name":"dang"}
```

After the HTTP log output is turned on, in addition to the performance overhead of the normal log output, additional overhead is generated in, for example, HTTP request parsing, because an additional memory buffer needs to be allocated to prepare the data for the log output.

### Inputing parameter validation

Dubbo RESTful Remoting supports the use of the Java standard bean validation annotation(JSR 303) for input validation http://beanvalidation.org/.

 In order to be consistent with other Dubbo remote invocation protocols, the annotations that are checked for rest must be placed on the interface of the service, for example:

```java
public interface UserService {
   
    User getUser(@Min(value=1L, message="User ID must be greater than 1") Long id);
}
```

Of course, in many other bean validation scenarios, annotations are placed on implementation classes rather than interfaces. At least one advantage of placing an annotation on an interface is that the Dubbo client can share information about the interface. The input validation can be done locally even without RPC.

Then turn on the validation in the XML configuration in the same way as Dubbo:

```xml
<dubbo:service interface=xxx.UserService" ref="userService" protocol="rest" validation="true"/>
```

In many other RPC protocols of Dubbo, if the input validation error occurs, the `RpcException` is directly thrown to the client, but in the rest, since the client is often non-Dubbo or even non-Java system, it is inconvenient to directly throw a Java exception.  Therefore, at present we will return the validation error in XML format:

```xml
<violationReport>
    <constraintViolations>
        <path>getUserArgument0</path>
        <message>User ID must be greater than 1</message>
        <value>0</value>
    </constraintViolations>
</violationReport>
```

The return values of other data formats will also be supported later. As for how to internationalize the verification error message, refer directly to the relevant documentation of the bean validation.

 If you think that the default validation error return format does not meet your requirements, you can add custom ExceptionMapper to custom error return format freely as described in the previous section. It should be noted that this ExceptionMapper must use the generic declaration to capture the RpcException of Dubbo in order to successfully override the default exception handling strategy of Dubbo rest. In order to simplify the operation, the easiest way to do this is to directly inherit the RpcExceptionMapper of Dubbo rest and override the method that handles the validation exception:

```java
public class MyValidationExceptionMapper extends RpcExceptionMapper {

    protected Response handleConstraintViolationException(ConstraintViolationException cve) {
        ViolationReport report = new ViolationReport();
        for (ConstraintViolation cv : cve.getConstraintViolations()) {
            report.addConstraintViolation(new RestConstraintViolation(
                    cv.getPropertyPath().toString(),
                    cv.getMessage(),
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

### Whether to transparently publish REST service

Dubbo RESTful Remoting differs from some other RPCs in Dubbo in that you need to add JAX-RS annotations (and JAXB, Jackson's annotation) to your service code. If you think these annotations "pollute" your service code to a certain extent,you can consider writing additional Facade and DTO classes, adding annotations to that, and Facade forwards the calls to the real service implementation class. Of course, adding annotations directly to the service code basically has no negative effects, and this is itself a standard usage in Java EE. In addition, JAX-RS and JAXB annotations belong to the Java standard. Compared with spring, Dubbo, etc., which we often use, annotations have no problem with vendor lock-in, so there is usually no need to introduce additional objects.

In addition,when you want to use the @Context annotation mentioned above, injecting HttpServletRequest through method parameters (such as `public User getUser(@PathParam("id") Long id, @Context HttpServletRequest request)`), the method signature of service is changed and HttpServletRequest is a REST-specific parameter, you should introduce additional Facade classes if your service supports multiple RPC mechanisms.

Of course, your service code may already act as a Facade and DTO before adding RESTful Remoting (as to why some scenarios require these roles, and if you are interested, you can refer to [Micro-SOA: Service Design Principles and Practices] Http://www.infoq.com/cn/articles/micro-soa-1). In this case, after adding REST, if you add additional REST-related Facade and DTO, it is equivalent to wrapping the original code again, which forms the following call chain:

`RestFacade/RestDTO -> Facade/DTO -> Service`

This kind of system is cumbersome, and the workload of data conversion is not small, so it should be avoided if possible.

### Get Headers In Dubbo Rest Provider	

Dubbo take out and split headers by RpcContextFilter and put them into attachments of RpcContext, so provider can get headers from RpcContext attachments like:

```
    String header-value1 = RpcContext.getContext().getAttachment(header-key1)
    String header-value2 = RpcContext.getContext().getAttachment(header-key2)
```

### Consumer of RESTful Remoting

Here we use three scenarios:

1. The non-Dubbo consumer calls Dubbo REST service (non-Dubbo --> Dubbo)
2. The Dubbo consumer calls Dubbo REST service (Dubbo --> Dubbo)
3. The consumer of Dubbo calls the non-Dubbo REST service (Dubbo --> non-Dubbo)

### Scenario 1: Non-Dubbo consumer calls Dubbo REST Service

The client of this scenario has nothing to do with Dubbo itself, and it can be directly selected in the appropriate language and framework.

If it is still a Java client (but not using Dubbo), consider using the standard JAX-RS Client API or a specific REST-implemented Client API to invoke the REST service. The following is the registerUser() that uses the JAX-RS Client API to access the above UserService:

```java
User user = new User();
user.setName("Larry");

Client client = ClientBuilder.newClient();
WebTarget target = client.target("http://localhost:8080/services/users/register.json");
Response response = target.request().post(Entity.entity(user, MediaType.APPLICATION_JSON_TYPE));

try {
    if (response.getStatus() != 200) {
        throw new RuntimeException("Failed with HTTP error code : " + response.getStatus());
    }
    System.out.println("The generated id is " + response.readEntity(RegistrationResult.class).getId());
} finally {
    response.close();
    client.close(); //Do not close the client every time in real development, such as HTTP long connection is held by the client
}
```

The User and RegistrationResult classes in the code snippet above are written by the consumer itself, and the JAX-RS Client API automatically serializes/deserializes them.

Of course, in Java, you can also use the familiar technologies such as HttpClient, FastJson, XStream, etc. to implement the REST client, which will not be detailed here.

### Scenario 2: Dubbo consumer calls Dubbo RESTful Remoting

In this scenario,  same as  other Dubbo remote calling methods, the Java service interface is shared directly between the service provider and the service consumer, and the Spring XML configuration is added (of course, the Spring/Dubbo annotation configuration can also be used),the remote REST service can be called transparently:

```xml
<dubbo:reference id="userService" interface="xxx.UserService"/>
```

As mentioned earlier, in this scenario, JAX-RS annotations must be added to the service interface, so that the corresponding REST configuration information can be shared on the consumer side of Dubbo and remotely called accordingly:

```java
@Path("users")
public interface UserService {
    
    @GET
    @Path("{id : \\d+}")
    @Produces({MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML})
    User getUser(@PathParam("id") Long id);
}
```

If a variety of data formats are configured in the annotation of the service interface, since both ends are Dubbo systems, a lot of details of REST are blocked, so there is no possibility to select a data format using the aforementioned URL suffix. Currently in this case, the top ranked data format will be used directly.

Therefore, we recommend that you put the most appropriate data format in front of defining an annotation. For example, we put JSON in front of XML because JSON's transmission performance is better than XML.

### Scenario 3: The consumer of Dubbo calls a non-Dubbo RESTful Remoting

In this scenario, the REST service can be called directly using the Java method described in Scenario 1. But in fact, you can also use the way described in Scenario 2, that is, calling the REST service more transparently, even if this service is not provided by Dubbo.

If the scenario 2 is used, since the REST service is not provided by Dubbo, there is generally no shared Java service interface mentioned above, so we need to write the Java interface and the corresponding parameter class according to the external REST service. Add JAX-RS, JAXB, Jackson and other annotations, Dubbo's REST underlying implementation will automatically generate request messages, automatically parse response messages, etc., so as  to transparently make remote calls. Or this way can also be understood as, we try to use JAX-RS to copy the implementation of the external REST service provider, and then put the written service interface to the client to use directly, Dubbo REST underlying implementation can call other REST services as it calls Dubbo's REST service .

For example, we want to call the following external service.

```
http://api.foo.com/services/users/1001
http://api.foo.com/services/users/1002
```

Get user data of different IDs, the return format is JSON

```java
{
    "id": 1001,
    "name": "Larry"
}
```

We can write service interfaces and parameter classes based on this information:

```java
@Path("users")
public interface UserService {
    
    @GET
    @Path("{id : \\d+}")
    @Produces({MediaType.APPLICATION_JSON})
    User getUser(@PathParam("id") Long id);
}
```

```java
public class User implements Serializable {

    private Long id;

    private String name;

    // …
}
```

For the configuration in Spring, because the REST service is not provided by Dubbo, you can not use the Dubbo registry to directly configure the url address of the external REST service (such as multiple addresses separated by commas):

```xml
<dubbo:reference id="userService" interface="xxx.UserService" url="rest://api.foo.com/services/"/>
```

> Note: The protocol here must use rest:// instead of http://. If the external REST service has a context path, it must also be added to the url (unless you have a context path in the @Path annotation for each service interface), such as /services/ above. At the same time, the services here must be followed by /, in order to make Dubbo work properly.
>
> In addition, you can still configure the maximum number of connections and timeouts that the client can start:

```xml
<dubbo:reference id="userService" interface="xxx.UserService" url="rest://api.foo.com/services/" timeout="2000" connections="10"/>
```

### Custom Header By Dubbo Consumer while Calls REST Service

When Dubbo calls rest, it uses the method of converting the attachments of RpcContext to header. 

Therefore, you can set headers in the following ways:

```
    RpcContext.getContext().setAttachment("header-key1", "header-value1");
    RpcContext.getContext().setAttachment("header-key2", "header-value2");
```

Then the headers will be looks like following:

```
    header-key1 = header-value1
    header-key2 = header-value2
```

### JAX-RS restrictions in Dubbo

The REST development in Dubbo is fully compatible with standard JAX-RS, but the features it supports are currently a subset of full JAX-RS, in part because it is limited to the specific architecture of Dubbo and Spring. The limitations of JAX-RS used in Dubbo include but are not limited to:

1. Service implementation can only be singleton, and it can not support per-request scope and per-lookup scope
2. It is not supported to inject into ServletConfig, ServletContext, HttpServletRequest, HttpServletResponse, etc. with the @Context annotation for the instance field of the service, but it can support the injection of service method parameters. However, for certain REST server implementations (see the previous section), injection of service method parameters is not supported.

## REST FAQ

------

### Can Dubbo REST services be integrated with Dubbo Registry and Monitor?

Yes, and it will integrate automatically. That is, all the REST services you develop in Dubbo are automatically registered to the Registry and Monitor, by which you can managed your services.
However, many of the service governance operations in the Registry can only be fully functional when the REST consumer is based on Dubbo. If the consumer side is non-Dubbo, it is naturally not managed by the Registry, so that many of the operations will not work for the consumer.



### How to implement load balancing and failover in Dubbo REST?

If the consumer side of Dubbo REST is based on Dubbo, then Dubbo REST is basically the same as other Dubbo remote call protocols: Dubbo framework transparently performs load balancing, failover, etc. on the consumer side.
If the consumer side of Dubbo REST is non-Dubbo or even non-Java, it is better to configure the soft load balancing mechanism on the service provider. Currently, you can consider LVS, HAProxy, Nginx, and so on to achieve load balancing for HTTP requests.


### Can overloaded method in JAX-RS maps to the same URL address?

http://stackoverflow.com/questions/17196766/can-resteasy-choose-method-based-on-query-params

### Can a POST method in JAX-RS receive multiple parameters?

http://stackoverflow.com/questions/5553218/jax-rs-post-multiple-objects


## The shortcomings of Dubbo's current system (related to REST)
---

I think there are obviously a lot of deficiencies in Dubbo's current system. Here are a few REST-related issues that affect users (not including internal implementation issues) for reference and comments, which can help prepare for the refactoring later.


### Invasiveness of RpcContext

We have already mentioned the intrusiveness of RpcContext(See above). Because it uses a singleton to access context information, which is completely inconsistent with the general style of spring applications as well as not conducive to application extension and unit testing. In the future, we may inject an interface with dependency injection, and then use it to access the context information in ThreadLocal.

### limitations of Protocol configuration

Dubbo supports multiple remote call methods, but all call methods are configured with <Dubbo:protocol/>,  for example:
```xml
<Dubbo:protocol name="Dubbo" port="9090" server="netty" client="netty" codec="Dubbo" serialization="hessian2"
    charset="UTF-8" threadpool="fixed" threads="100" queues="0" iothreads="9" buffer="8192" accepts="1000" payload="8388608"/>
```
Dubbo supports multiple remote call methods, but all call methods are configured with <Dubbo:protocol/>,  for example:
In fact, many of the above properties are uniquely held by the Dubbo RPC remote call method and many other remote call methods in Dubbo do not support server, client, codec, iothreads, accepts, payload, etc. (of course, some are not supported because of limited conditions, some have no need to be supported at all). This adds a lot of confusions to users when they use Dubbo, and they actually do not know that some attributes (such as performance tuning) will not work after adding them.


On the other hand, various remote call methods often have a large number of unique configuration requirements, especially as we gradually add much richer and more advanced functions to each kind of remote call method, which cause the expands in <protocol/> attributes inevitably (for example, we have added keepalive and extension two attributes in REST at the moment) and then lead to bloated <protocol/> and user confusion.

Of course, there is a way to expand <protocol/> in Dubbo by using <Dubbo:parameter/>, but this method is obviously very limited, the usage is complicated and the schema verification is lacking.
So that the best method is to set your own protocol elements for each remote call, such as <protocol-Dubbo/>, <protocol-rest/>, etc. Each element specifies its own attributes using XML Schema. (Of course, it is best to use common attributes between a variety of remote call methods)
In this way, a freer way can be used when doing the extension configuration mentioned above, so that it can be much clearer and more extensible (the following is just an example, of course there may be a better way):

```xml
<Dubbo:protocol-rest port="8080">
    <Dubbo:extension>someInterceptor</Dubbo:extension>
    <Dubbo:extension>someFilter</Dubbo:extension>
    <Dubbo:extension>someDynamicFeature</Dubbo:extension>
    <Dubbo:extension>someEntityProvider</Dubbo:extension>
</Dubbo:protocol-rest>
```

### XML naming does not conform to the spring specification

A lot of naming in XML configuration of Dubbo dose not conform to the spring specification, such as:
```xml
<Dubbo:protocol name="Dubbo" port="9090" server="netty" client="netty"

codec="Dubbo" serialization="hessian2"
    charset="UTF-8" threadpool="fixed" threads="100" queues="0" iothreads="9" buffer="8192" accepts="1000" payload="8388608"/>
```
The above threadpool should be changed to thread-pool, iothreads should be changed to io-threads, and words should be separated by "-". While this may seem like a minor issue, it also involves readability, especially scalability, because sometimes we will inevitably use more words to describe XML elements and attributes.

In fact, Dubbo itself also recommended to follow the naming convention of spring to XML.


## Best practices of REST
---
TODO



## Performance benchmark
---

### Test Environment

Roughly as follows:

 - 4-core Intel(R) Xeon(R) CPU E5-2603 0 @ 1.80GHz
 - 8G memory
 - The network between servers passes through a 100 Mbps switch
 - CentOS 5
 - JDK 7
 - Tomcat 7
 - JVM parameter -server -Xms1g -Xmx1g -XX:PermSize=64M -XX:+UseConcMarkSweepGC


### Test Script

Similar to Dubbo's own benchmarks:
10 concurrent clients send requests continuously:
• Pass in nested complex objects (single data is small), do nothing and return
• Pass in a 50K string, do nothing and return (TODO: the result is not listed yet)
Excute a five-minute performance test. (Reference to Dubbo's own test considerations: "Mainly consider the serialization and performance of network IO, so that the server side does not have any business logic. Take 10 to run simultaneously because of the consideration that the bottleneck can be hit first when the high CPU usage rate is reached by HTTP protocol under the high concurrency situation.")




### Test Result
The following results are mainly from the comparison between to the two remote call methods, REST and Dubbo RPC which are configured differently, for example:

 - “REST: Jetty + XML + GZIP” means: Test REST, use jetty server and XML data format, and enable GZIP compression.
 - “Dubbo: hessian2” means: test Dubbo RPC and use hessian2 serialization.

The results for complex objects are as follows (the smaller Response Time and the larger TPS, the better results):

|Remote Call Mode |Average Response Time |Average TPS（Num of transactions per second）|
| ------ | ------ | ------ |
|REST: Jetty + JSON | 7.806	| 1280|
|REST: Jetty + JSON + GZIP	| TODO|	TODO|
|REST: Jetty + XML |	TODO|	TODO|
|REST: Jetty + XML + GZIP|	TODO|	TODO|
|REST: Tomcat + JSON|	2.082|	4796|
|REST: Netty + JSON|	2.182|	4576|
|Dubbo: FST|	1.211|	8244|
|Dubbo: kyro|	1.182|	8444|
|Dubbo: Dubbo serialization|	1.43|	6982|
|Dubbo: hessian2|	1.49|	6701|
|Dubbo: fastjson|	1.572|	6352



Just a brief summary of the current results:

 - Dubbo RPC (especially when based on efficient java serialization methods such as kryo and fst) has a significant advantage response time and throughput over REST. Dubbo RPC is preferred in the intranet Dubbo systems.
 - When choosinf REST implementation, tomcat7 and netty are optimal (of course, the current versions of jetty and netty are lower) currently only considering performance. Tjws and sun http server performed extremely poorly in performance tests, with an average response time of more than 200ms and an average tps of only about 50 (to avoid affecting the picture effect, the results are not listed above).
 - Performance of JSON data format is better than XML in REST (data is not listed above).
 - Enabling GZIP in REST has little to do with complex objects with small data volume in the intranet, but performance has declined (data is not listed above).


## Performance Optimization Recommendations

If you deploy Dubbo REST to an external Tomcat and configure server="servlet", that is, enable external tomcat as the underlying implementation of rest server, it is best to add the following configuration to tomcat:
```xml
<Connector port="8080"

protocol="org.apache.coyote.http11.Http11NioProtocol"
               connectionTimeout="20000"
               redirectPort="8443"
               minSpareThreads="20"
               enableLookups="false"
               maxThreads="100"
               maxKeepAliveRequests="-1"
               keepAliveTimeout="60000"/>
```

Especially the configuration maxKeepAliveRequests="-1" ,which is mainly to ensure that tomcat always enables http long connection, in order to improve the performance of REST call. Note, however, that if the REST consumer side is not continuously call REST services, it is not always best to enable long connections all time. In addition, the way to always enable long connections is generally not suitable for ordinary webapps, but more suitable for such rpc-like scenarios. So that in order to get high performance, Dubbo REST applications and ordinary web applications are best not to be mixed deployment, but should use a separate instance in tomcat.


##Extended discussion
---

### Comparison among Rest, Thrift, Protobuf and so on

TODO

### Comparison between REST and traditional Webservers

TODO


### Comparison of JAX-RS Between Spring MVC

A preliminary view from http://www.infoq.com/cn/news/2014/10/Dubbox-open-source?utm_source=infoq&utm_medium=popular_links_homepage#theCommentsSection
> Thank you, in fact, for jax-rs and Spring MVC, I do not have a deep look at the rest support of Spring MVC. I would like to give you some preliminary ideas. Please correct me:

> Spring MVC also supports configuration using annotation, which actually looks very similar to jax-rs.

> Personally, I think Spring MVC is better suited to restful services of web applications, such as being invoked by AJAX, or possibly outputting HTML or something like page jump processes in applications. Spring MVC can handle both normal web page requests and rest requests at the same time. But in general, the restful service is implemented in the presentation layer or the web layer.

> But Jax-rs is more suitable for pure service-oriented applications, that is, the middle-tier services in traditional Java EE, for example, it can publish traditional EJB as restful services. In a Spring application, the bean that acts as a service in the Spring is directly published as a restful service. In general, the restful service is at the business layer, application layer, or facade layer. And MVC hierarchies and concepts are often of little value in such (back-end) applications.

> Of course, some implementations of jax-rs, such as jersey, also try to include MVC to better accommodate the web applications described above, but not as well as Spring MVC.

> In Dubbo applications, I think a lot of people prefer to publish a local Spring service bean (or manager) as a remote service directly and transparently, so that it is more straightforward to use JAX-RS here, and there is no need to introduce the MVC concept. Of course, we do not discuss whether transparent publishing of remote services is a best practice or whether to add facade things here first.

> Of course, I know that many people use Spring MVC restful to call Dubbo (spring) service to publish restful services under the situation that Dubbo does not support rest now. It’s a good method also in my opinion, but if you do not modify Spring MVC and integrate it deeply with Dubbo, restful services cannot enjoy many advanced services such as registering to the Dubbo Registry, monitoring the number of calls, TPS, response time through the Dubbo Monitor, controlling the size of the thread pool and the maximum number of connections through the unified configuration of Dubbo, and controlling the service flow, authority and frequency through Dubbo unified mode like other remote call protocol such as webservices, Dubbo rpc, hessian and so on in Dubbo system. In addition, Spring MVC only works in server side and Spring restTemplate are usually used on consumer side. If restTemplate is not integrated with Dubbo, the service can be downgraded by Dubbo client automatically or manually. If the server and consumer are all Dubbo system, you cannot use unified routing and other functions in Dubbo if the Spring rest is not deeply integrated into Dubbo through interaction of Spring and rest.

> Of course, I personally think that these things are not necessarily to be one or the other. I heard that Rod Johnson, the founder of spring usually says ‘the customer is always right,’ In fact, it is better to support both ways at the same time rather than discuss which way is better, so that originally I wrote in the document that we plan to support Spring rest annotation, but the feasibility is unknown.

##Future
---
Functions may be supported later:

 - Rest annotation for Spring MVC
 - Safety System
 - OAuth
 - Asynchronous calls
 - Gzip
 - Payload maxsize
