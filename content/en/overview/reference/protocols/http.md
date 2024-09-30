---
description: "HTTP Json Protocol Specification"
linkTitle: HTTP Protocol Specification
title: HTTP Protocol Specification
type: docs
weight: 3
working_in_progress: true
---

{{% alert title="Note" color="warning" %}}
Starting from Dubbo version 3.3, the Rest protocol has been moved to the Extensions library, with the Triple protocol providing more comprehensive support for Rest. For details, refer to the [Triple Rest User Manual](../../../mannual/java-sdk/reference-manual/protocol/tripe-rest-manual/). If you wish to continue using the original Rest protocol, you can import the corresponding [dubbo-spi-extensions](https://github.com/apache/dubbo-spi-extensions/tree/master/dubbo-rpc-extensions/dubbo-rpc-rest) library dependency.
{{% /alert %}}

## What is Dubbo Http
A protocol implemented through the Dubbo protocol extension, based on the coding style of Spring Web and Resteasy, enabling inter-service calls via the HTTP protocol.

## Why Choose Dubbo Http
- Enables interoperability between microservices and Dubbo.
- Multi-protocol service publishing allows for smooth migration of service protocols.
- The universality of HTTP addresses cross-language interoperability.
- The latest version of HTTP does not require additional components, making it lighter.
- Resteasy and Spring Web coding styles allow for quicker onboarding.

## Protocol Specification
- Request

Compared to the native HTTP protocol, the Dubbo Http request adds two headers, version and group, to determine the service's uniqueness. If the provider does not declare the group and version, these headers do not need to be passed during the HTTP request; otherwise, they must be passed. When using the Dubbo Http's RestClient, these headers will be passed by default via attachment with the prefix rest-service-. Therefore, other HTTP clients need to pass rest-service-version and rest-service-group headers.

````
POST /test/path  HTTP/1.1
Host: localhost:8080
Content-type: application/json
Accept: text/html
rest-service-version: 1.0.0
rest-service-group: dubbo

{"name":"dubbo","age":10,"address":"hangzhou"}
````

- Response
````
HTTP/1.1 200
Content-Type: text/html
Content-Length: 4
Date: Fri, 28 Apr 2023 14:16:42 GMT

"success"
````
- Supported content-types
  - application/json
  - application/x-www-form-urlencoded
  - text/plain
  - text/xml

Currently, the above media types are supported, and further extensions will be made.

## Quick Start
For detailed dependencies and Spring configurations, refer to the Dubbo project's dubbo-demo-xml module: https://github.com/apache/dubbo/tree/3.2/dubbo-demo/dubbo-demo-xml

- Spring Web Coding
When using Dubbo Http with Spring Web coding, class annotations must include @RequestMapping or @Controller to determine the user's coding style, which decides which SpringMvcServiceRestMetadataResolver annotation parser should be used for meta-annotation parsing. On the provider side, users are allowed to use implementation classes as Dubbo Services, unlike the previous requirement that the service must be an interface.

API
````java
@RequestMapping("/spring/demo/service")
public interface SpringRestDemoService {
    @RequestMapping(method = RequestMethod.GET, value = "/hello")
    Integer hello(@RequestParam("a") Integer a, @RequestParam("b") Integer b);

    @RequestMapping(method = RequestMethod.GET, value = "/error")
    String error();

    @RequestMapping(method = RequestMethod.POST, value = "/say")
    String sayHello(@RequestBody String name);

    @RequestMapping(method = RequestMethod.POST, value = "/testFormBody", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    Long testFormBody(@RequestBody Long number);

    @RequestMapping(method = RequestMethod.POST, value = "/testJavaBeanBody", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    User testJavaBeanBody(@RequestBody User user);

    @RequestMapping(method = RequestMethod.GET, value = "/primitive")
    int primitiveInt(@RequestParam("a") int a, @RequestParam("b") int b);

    @RequestMapping(method = RequestMethod.GET, value = "/primitiveLong")
    long primitiveLong(@RequestParam("a") long a, @RequestParam("b") Long b);

    @RequestMapping(method = RequestMethod.GET, value = "/primitiveByte")
    long primitiveByte(@RequestParam("a") byte a, @RequestParam("b") Long b);

    @RequestMapping(method = RequestMethod.POST, value = "/primitiveShort")
    long primitiveShort(@RequestParam("a") short a, @RequestParam("b") Long b, @RequestBody int c);

    @RequestMapping(method = RequestMethod.GET, value = "/testMapParam")
    String testMapParam(@RequestParam Map<String, String> params);

    @RequestMapping(method = RequestMethod.GET, value = "/testMapHeader")
    String testMapHeader(@RequestHeader Map<String, String> headers);

    @RequestMapping(method = RequestMethod.POST, value = "/testMapForm", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    List<String> testMapForm(MultiValueMap<String, String> params);

    @RequestMapping(method = RequestMethod.GET, value = "/headerInt")
    int headerInt(@RequestHeader("header") int header);
}
````

Provider
````java
@DubboService(interfaceClass = SpringRestDemoService.class ,protocol = "rest")
public class SpringRestDemoServiceImpl implements SpringRestDemoService {
    @Override
    public String sayHello(String name) {
        return "Hello, " + name;
    }

    @Override
    public Long testFormBody(Long number) {
        return number;
    }

    @Override
    public User testJavaBeanBody(User user) {
        return user;
    }

    @Override
    public int primitiveInt(int a, int b) {
        return a + b;
    }

    @Override
    public long primitiveLong(long a, Long b) {
        return a + b;
    }

    @Override
    public long primitiveByte(byte a, Long b) {
        return a + b;
    }

    @Override
    public long primitiveShort(short a, Long b, int c) {
        return a + b;
    }

    @Override
    public String testMapParam(Map<String, String> params) {
        return params.get("param");
    }

    @Override
    public String testMapHeader(Map<String, String> headers) {
        return headers.get("header");
    }

    @Override
    public List<String> testMapForm(MultiValueMap<String, String> params) {
        return params.get("form");
    }

    @Override
    public int headerInt(int header) {
        return header;
    }

    @Override
    public Integer hello(Integer a, Integer b) {
        return a + b;
    }

    @Override
    public String error() {
        throw new RuntimeException("test error");
    }
}
````

Consumer
````java
@Component
public class SpringRestDemoServiceConsumer {
    @DubboReference(interfaceClass = SpringRestDemoService.class )
    SpringRestDemoService springRestDemoService;

    public void invoke(){
        String hello = springRestDemoService.sayHello("hello");
        assertEquals("Hello, hello", hello);
        Integer result = springRestDemoService.primitiveInt(1, 2);
        Long resultLong = springRestDemoService.primitiveLong(1, 2l);
        long resultByte = springRestDemoService.primitiveByte((byte) 1, 2l);
        long resultShort = springRestDemoService.primitiveShort((short) 1, 2l, 1);

        assertEquals(result, 3);
        assertEquals(resultShort, 3l);
        assertEquals(resultLong, 3l);
        assertEquals(resultByte, 3l);

        assertEquals(Long.valueOf(1l), springRestDemoService.testFormBody(1l));

        MultiValueMap<String, String> forms = new LinkedMultiValueMap<>();
        forms.put("form", Arrays.asList("F1"));

        assertEquals(Arrays.asList("F1"), springRestDemoService.testMapForm(forms));
        assertEquals(User.getInstance(), springRestDemoService.testJavaBeanBody(User.getInstance()));
    }

    private  void assertEquals(Object returnStr, Object exception) {
        boolean equal = returnStr != null && returnStr.equals(exception);

        if (equal) {
            return;
        } else {
            throw new RuntimeException();
        }
    }
}
````

- JaxRs Coding
When using JaxRs annotations, it's required that the service class must have the @Path annotation to determine the use of JAXRSServiceRestMetadataResolver for annotation parsing.

API
````java
@Path("/jaxrs/demo/service")
public interface JaxRsRestDemoService {
    @GET
    @Path("/hello")
    Integer hello(@QueryParam("a") Integer a, @QueryParam("b") Integer b);

    @GET
    @Path("/error")
    String error();

    @POST
    @Path("/say")
    String sayHello(String name);

    @POST
    @Path("/testFormBody")
    Long testFormBody(@FormParam("number") Long number);

    @POST
    @Path("/testJavaBeanBody")
    @Consumes({MediaType.APPLICATION_JSON})
    User testJavaBeanBody(User user);

    @GET
    @Path("/primitive")
    int primitiveInt(@QueryParam("a") int a, @QueryParam("b") int b);

    @GET
    @Path("/primitiveLong")
    long primitiveLong(@QueryParam("a") long a, @QueryParam("b") Long b);

    @GET
    @Path("/primitiveByte")
    long primitiveByte(@QueryParam("a") byte a, @QueryParam("b") Long b);

    @POST
    @Path("/primitiveShort")
    long primitiveShort(@QueryParam("a") short a, @QueryParam("b") Long b, int c);

    @GET
    @Path("testMapParam")
    @Produces({MediaType.TEXT_PLAIN})
    @Consumes({MediaType.TEXT_PLAIN})
    String testMapParam(@QueryParam("test") Map<String, String> params);

    @GET
    @Path("testMapHeader")
    @Produces({MediaType.TEXT_PLAIN})
    @Consumes({MediaType.TEXT_PLAIN})
    String testMapHeader(@HeaderParam("test") Map<String, String> headers);

    @POST
    @Path("testMapForm")
    @Produces({MediaType.APPLICATION_JSON})
    @Consumes({MediaType.APPLICATION_FORM_URLENCODED})
    List<String> testMapForm(MultivaluedMap<String, String> params);

    @POST
    @Path("/header")
    @Consumes({MediaType.TEXT_PLAIN})
    String header(@HeaderParam("header") String header);

    @POST
    @Path("/headerInt")
    @Consumes({MediaType.TEXT_PLAIN})
    int headerInt(@HeaderParam("header") int header);
}
````

Provider
````java
@DubboService(interfaceClass =JaxRsRestDemoService.class ,protocol = "rest",version = "1.0.0",group = "test")
public class JaxRsRestDemoServiceImpl implements JaxRsRestDemoService {
    @Override
    public String sayHello(String name) {
        return "Hello, " + name;
    }

    @Override
    public Long testFormBody(Long number) {
        return number;
    }

    @Override
    public User testJavaBeanBody(User user) {
        return user;
    }

    @Override
    public int primitiveInt(int a, int b) {
        return a + b;
    }

    @Override
    public long primitiveLong(long a, Long b) {
        return a + b;
    }

    @Override
    public long primitiveByte(byte a, Long b) {
        return a + b;
    }

    @Override
    public long primitiveShort(short a, Long b, int c) {
        return a + b;
    }

    @Override
    public String testMapParam(Map<String, String> params) {
        return params.get("param");
    }

    @Override
    public String testMapHeader(Map<String, String> headers) {
        return headers.get("header");
    }

    @Override
    public List<String> testMapForm(MultivaluedMap<String, String> params) {
        return params.get("form");
    }

    @Override
    public String header(String header) {
        return header;
    }

    @Override
    public int headerInt(int header) {
        return header;
    }

    @Override
    public Integer hello(Integer a, Integer b) {
        return a + b;
    }

    @Override
    public String error() {
        throw new RuntimeException("test error");
    }
}
````

Consumer
````java
@Component
public class JaxRsRestDemoService {
  @DubboReference(interfaceClass = JaxRsRestDemoService.class)
  JaxRsRestDemoService jaxRsRestDemoService;

  public void jaxRsRestDemoServiceTest(ClassPathXmlApplicationContext context) {
    JaxRsRestDemoService jaxRsRestDemoService = context.getBean("jaxRsRestDemoService", JaxRsRestDemoService.class);
    String hello = jaxRsRestDemoService.sayHello("hello");
    assertEquals("Hello, hello", hello);
    Integer result = jaxRsRestDemoService.primitiveInt(1, 2);
    Long resultLong = jaxRsRestDemoService.primitiveLong(1, 2l);
    long resultByte = jaxRsRestDemoService.primitiveByte((byte) 1, 2l);
    long resultShort = jaxRsRestDemoService.primitiveShort((short) 1, 2l, 1);

    assertEquals(result, 3);
    assertEquals(resultShort, 3l);
    assertEquals(resultLong, 3l);
    assertEquals(resultByte, 3l);

    assertEquals(Long.valueOf(1l), jaxRsRestDemoService.testFormBody(1l));

    MultivaluedMapImpl<String, String> forms = new MultivaluedMapImpl<>();
    forms.put("form", Arrays.asList("F1"));

    assertEquals(Arrays.asList("F1"), jaxRsRestDemoService.testMapForm(forms));
    assertEquals(User.getInstance(), jaxRsRestDemoService.testJavaBeanBody(User.getInstance()));
  }
}
````
  
## Use Cases

As the Dubbo Http consumer implements the RestClient in three forms: httpclient, okhttp, URLConnection (jdk built-in), okhttp is the default option. When using Dubbo Http to call other HTTP services, the required dependencies to include are:

````xml
         <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo-rpc-rest</artifactId>
            <version>${dubbo-rpc-rest_version}</version>
         </dependency>

         <dependency>
            <groupId>com.squareup.okhttp3</groupId>
            <artifactId>mockwebserver</artifactId>
            <version>${okhttp_version}</version>
         </dependency>
         or
         <dependency>
            <groupId>org.apache.httpcomponents</groupId>
            <artifactId>httpclient</artifactId>
            <version>${httpclient_version}</version>
         </dependency>
````

- Microservices invoking Dubbo Http

````java

/**
 *  URL rest://localhost:8888/services
 *   rest:           protocol
 *   localhost:8888: server address
 *   services:       context path
 */
@DubboReference(interfaceClass = HttpService.class ,url = "rest://localhost:8888/services",version = "1.0.0",group = "test")
    HttpService httpService;

    public void invokeHttpService() {
        String http = httpService.http("Others Java Architecture Invoke Dubbo Rest");
        System.out.println(http);
    }
````

- Cross-language invocation

  python
  ````
  import requests
   url = 'http://localhost:8888/services/curl'
   headers = {
   'rest-service-group': 'test',
   'rest-service-version': '1.0.0'
   }
  response = requests.get(url, headers=headers)
  ````

  go
  ````
    import (
    "fmt"
    "net/http"
     )
  
    func main() {
    url := "http://localhost:8888/services/curl"
    req, err := http.NewRequest("GET", url, nil)
    if err != nil {
    fmt.Println("Error creating request:", err)
    return
    }
  
    req.Header.Set("rest-service-group", "test")
    req.Header.Set("rest-service-version", "1.0.0")
    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        fmt.Println("Error sending request:", err)
        return
    }
  
    defer resp.Body.Close()
````

- Multi-protocol publishing
  - Testing code requests using HTTP for the Dubbo protocol
  - Service protocol migration

````java
@DubboService(interfaceClass = HttpService.class, protocol = "rest,dubbo", version = "1.0.0", group = "test")
public class HttpServiceImpl implements HttpService {
    @Override
    public String http(String invokeType) {
        return "Rest http request test success! by invokeType: " + invokeType;
    }
}
````

 - HTTP client component invoking Dubbo Http (service API can be excluded)

````java
public class HttpClientInvoke {
    private final String versionHeader = RestHeaderEnum.VERSION.getHeader();
    private final String groupHeader = RestHeaderEnum.GROUP.getHeader();
    /**
     * contextPath services
     */
    private final String url = "http://localhost:8888/services/http";

    public void httpServiceHttpClientInvoke() throws IOException {
        CloseableHttpClient httpClient = createHttpClient();
        HttpRequestBase httpUriRequest = new HttpGet(url);
        httpUriRequest.addHeader(versionHeader, "1.0.0");
        httpUriRequest.addHeader(RestConstant.ACCEPT, "text/plain");
        httpUriRequest.addHeader(groupHeader, "test");
        httpUriRequest.addHeader("type", "Http Client Invoke Dubbo Rest Service");
        CloseableHttpResponse response = httpClient.execute(httpUriRequest);

        RestResult restResult = parseResponse(response);

        System.out.println(new String(restResult.getBody()));
    }

    private RestResult parseResponse(CloseableHttpResponse response) {
        return new RestResult() {
            @Override
            public String getContentType() {
                return response.getFirstHeader("Content-Type").getValue();
            }

            @Override
            public byte[] getBody() throws IOException {
                if (response.getEntity() == null) {
                    return new byte[0];
                }
                return IOUtils.toByteArray(response.getEntity().getContent());
            }

            @Override
            public Map<String, List<String>> headers() {
                return Arrays.stream(response.getAllHeaders()).collect(Collectors.toMap(Header::getName, h -> Collections.singletonList(h.getValue())));
            }

            @Override
            public byte[] getErrorResponse() throws IOException {
                return getBody();
            }

            @Override
            public int getResponseCode() {
                return response.getStatusLine().getStatusCode();
            }

            @Override
            public String getMessage() throws IOException {
                return appendErrorMessage(response.getStatusLine().getReasonPhrase(),
                    new String(getErrorResponse()));
            }
        };
    }

    private CloseableHttpClient createHttpClient() {
        PoolingHttpClientConnectionManager connectionManager = new PoolingHttpClientConnectionManager();
        return HttpClients.custom().setConnectionManager(connectionManager).build();
    }
}
````

## Comparison of HTTP Implementations between 3.2 and 3.0

Due to the removal of the original Resteasy implementation in Dubbo Java 3.2, there will be changes in support for Resteasy's built-in Response, extend, and ExceptionMapper. ExceptionMapper has been transformed into org.apache.dubbo.rpc.protocol.rest.exception.mapper.ExceptionHandler, and Response will undergo adaptations later.

|  Version   |   JaxRs|  j2ee | Web container (tomcat/jetty)| Spring Web| HTTP client (okhttp/httpclient/jdk URLConnection) |
|  ----  | ----   |---    |---                    |---       |---|
| 3.0 | Depends on Resteasy Client and Server | Follows j2ee specifications| Relies on common web containers| No dependence| No dependence|
| 3.2  | No dependence (only requires JaxRs annotation package) | Not followed| HTTP server implemented with Netty| Only depends on Spring Web annotations| Internal implementation of RestClient relies on HTTP client (default is okhttp)|

