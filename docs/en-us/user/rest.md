Part 1
Part 2
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

Here, we can add these three types of objects, Filter, Interceptor and DynamicFuture, to the `extension` attributes, separated by commas. (DynamicFuture is another interface that allows us to enable Filter and Interceptor more dynamically. Please feel free to google.)

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
<dubbo:protocol name="rest" port="8888" extension="com.alibaba.dubbo.rpc.protocol.rest.support.LoggingFilter"/>
```

**Then turn on at least INFO level log output for com.alibaba.dubbo.rpc.protocol.rest.support in the logging configuration**,for example,in log4j.xml:

```xml
<logger name="com.alibaba.dubbo.rpc.protocol.rest.support">
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

### JAX-RS restrictions in Dubbo

The REST development in Dubbo is fully compatible with standard JAX-RS, but the features it supports are currently a subset of full JAX-RS, in part because it is limited to the specific architecture of Dubbo and Spring. The limitations of JAX-RS used in Dubbo include but are not limited to:

1. Service implementation can only be singleton, and it can not support per-request scope and per-lookup scope
2. It is not supported to inject into ServletConfig, ServletContext, HttpServletRequest, HttpServletResponse, etc. with the @Context annotation for the instance field of the service, but it can support the injection of service method parameters. However, for certain REST server implementations (see the previous section), injection of service method parameters is not supported.


Part 4