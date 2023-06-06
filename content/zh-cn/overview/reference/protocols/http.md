---
description: "HTTP Json 协议规范"
linkTitle: HTTP 协议规范
title: HTTP 协议规范
type: docs
weight: 3
working_in_progress: true
---


## 什么是 Dubbo Http
基于 spring web 和 resteasy 注解编码风格，通过http协议进行服务间调用互通，dubbo protocol扩展实现的协议

## 为什么选择Dubbo Http
- dubbo http 可以实现微服务与dubbo之间的互通
- 多协议发布服务，可以实现服务协议的平滑迁移
- http的通用性，解决跨语言互通
- 最新版本的http 无需添加其他组件，更轻量
- resteasy以及spring web的编码风格，上手更快

## 协议规范
- Request

相对于原生的http协议dubbo http 请求增加version和group两个header用于确定服务的唯一,
如果provider一端没有声明group和version,http请求时就不需要传递这连个header,反之必须要传递目标
服务的group和version, 如果使用dubbo http的RestClient这两个header将会默认通过attachment传递
为区别于其他的header，attachment将会增加rest-service-前缀，因此通过其他形式的http client调用
dubbo http服务需要传递 rest-service-version 和 rest-service-group 两个header
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
- content-type支持
  - application/json
  - application/x-www-form-urlencoded
  - text/plain
  - text/xml

目前支持以上media，后面还会对type进行扩展

## 快速入门
详细的依赖以及spring配置，可以参见dubbo 项目的duubo-demo-xml模块
https://github.com/apache/dubbo/tree/3.2/dubbo-demo/dubbo-demo-xml

- spring web 编码
在使用dubbo http的spring web编码时，类注解我们要求必须出现@RequestMapping或者@Controller,以此来判断用户使用的编码风格，决定使用对应的SpringMvcServiceRestMetadataResolver
注解解析器进行元注解解析，Provider一侧我们允许用户使用实现类作为Dubbo Service(相比之前dubbo service export时service必须是接口的要求)

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

- JaxRs 编码
  JaxRs注解使用的时候我们要求service 类上必须使用@Path注解，来确定使用JAXRSServiceRestMetadataResolver
  注解解析器来解析注解元信息

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


## 使用场景

 因为dubbo http consumer一端实现http 调用的RestClient 实现有三种形式：httpclient,okhttp,URLConnection(jdk内置)
 默认请情况下采用okhttp,因此在使用dubbo http 去调用其他http服务时，需要添加引入的依赖有

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
         或
         <dependency>
            <groupId>org.apache.httpcomponents</groupId>
            <artifactId>httpclient</artifactId>
            <version>${httpclient_version}</version>
         </dependency>
````

- 微服务服务调用dubbo http

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

- 跨语言调用

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


- 多协议发布
  - dubbo 协议的代码使用http 进行数据请求测试
  - 服务协议迁移

````java
@DubboService(interfaceClass = HttpService.class, protocol = "rest,dubbo", version = "1.0.0", group = "test")
public class HttpServiceImpl implements HttpService {


    @Override
    public String http(String invokeType) {
        return "Rest http request  test success! by invokeType: " + invokeType;
    }
}
````

 - http client组件调用dubbo http(可以不引入 service api)

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

## 3.2 与 3.0 HTTP 实现对比

因为 Dubbo Java 3.2 内部移除了原本 Resteasy 的实现，因此在对 Resteasy 内置的 Response,extend,ExceptionMapper 支持上将会有所变化
ExceptionMapper 转换成了org.apache.dubbo.rpc.protocol.rest.exception.mapper.ExceptionHandler,Response后面也会做适配处理

|  版本   |   JaxRs|  j2ee | web容器（tomcat/jetty）|spring web| http client\(okhttp/httpclient/jdk URLConnnection )
|  ----  | ----   |---    |---                    |---       |---|
| 3.0 | 依赖与resteasy的client和server |遵循j2ee规范|依赖常见web容器|不依赖|不依赖
| 3.2  | 不依赖（仅需要JaxRs注解包） |不遵循|netty实现的http服务器|仅依赖spring web注解|内部实现RestClient依赖http client（默认为okhttp）
