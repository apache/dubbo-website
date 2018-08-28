# Developing RESTful Remoting in Dubbo

**Original author: Li Shen**

**Document copyright: [Apache 2.0license Signature - No interpretation](HTTP://www.apache.org/licenses/LICENSE-2.0)**

Working in progress ...

> This article is lengthy since REST involves many aspects. Besides, it refers to the document style of Spring and so on. Not only limited to usage of the framework but also strives to present the design concept of the framework and the architectural idea of an excellent application.

> For people who only want to get a glimpse of Dubbo and REST, all they need is to browse through the `Overview` to `Introduction to Standard Java REST API: JAX-RS`.

TODO: Generate a clickable directory

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
* Details of REST Service Consumer	
    * Scenario 1: Non-Dubbo Consumer Calls Dubbo REST Service	
    * Scenario 2: Dubbo Consumer Calls Dubbo REST Service	
    * Scenario 3: Dubbo Consumer Calls Non-Dubbo REST Service	
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
![no image found](images/rest.jpg)

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

* Oracle official tutorial: http://docs.oracle.com/javaee/7/tutorial/doc/jaxrs.htm
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

Part 2
Part 3
Part 4
