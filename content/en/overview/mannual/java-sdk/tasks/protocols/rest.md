---
aliases:
  - /en/overview/tasks/protocols/
  - /en/overview/tasks/protocols/
description: "Demonstrates how to access services published via triple and dubbo protocols using standard `rest` requests."
hide: true
linkTitle: REST Protocol
title: Publishing REST-style Services
type: docs
weight: 3
---

{{% alert %}}
The "rest protocol" discussed in this article is not a true protocol implementation, but rather a way to make the triple protocol support direct access via REST-style HTTP requests.
We will demonstrate how to access Dubbo services using REST requests.
{{% /alert %}}

{{% alert title="Note" color="warning" %}}
Starting from Dubbo version 3.3, the REST protocol has been moved to the extensions library, with the triple protocol providing more comprehensive support for REST. The built-in protocol implementations now only include triple and dubbo.
<br>Therefore, when we mention REST, we are referring to the REST access support capabilities of the triple protocol. For more details, see [Triple REST User Manual](/en/overview/mannual/java-sdk/reference-manual/protocol/tripe-rest-manual/)
{{% /alert %}}

When discussing the [triple protocol example](../triple/interface/#curl), we mentioned that the triple protocol supports direct access in `application/json` format:

```shell
curl \
    --header "Content-Type: application/json" \
    --data '["Dubbo"]' \
    http://localhost:50052/org.apache.dubbo.samples.api.GreetingsService/sayHi/
```

If you find the above `http://localhost:50052/org.apache.dubbo.samples.api.GreetingsService/sayHi` format of path request not user-friendly, you can customize HTTP request paths and methods through annotations.
Currently, three annotation formats are supported: built-in, Spring Web, and JAX-RS. For the complete code of the following example, refer to [dubbo-samples-triple-rest](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-triple-rest).

### Download and Run the Example

```bash
# Get the example code
git clone --depth=1 https://github.com/apache/dubbo-samples.git
cd dubbo-samples/2-advanced/dubbo-samples-triple-rest/dubbo-samples-triple-rest-basic
# Run directly
mvn spring-boot:run
# Or package and run
mvn clean package -DskipTests
java -jar target/dubbo-samples-triple-rest-basic-1.0.0-SNAPSHOT.jar
```

Of course, you can also import the project directly with an IDE and execute `org.apache.dubbo.rest.demo.BasicRestApplication#main` to run it, and use breakpoints to debug and deepen your understanding of the principles.
<a name="DBA0D"></a>

### Example Code

```java
// Service Interface
package org.apache.dubbo.rest.demo;

import org.apache.dubbo.remoting.http12.rest.Mapping;
import org.apache.dubbo.remoting.http12.rest.Param;

public interface DemoService {
    String hello(String name);

    @Mapping(path = "/hi", method = HttpMethods.POST)
    String hello(User user, @Param(value = "c", type = ParamType.Header) int count);
}

// Service Implementation
@DubboService
public class DemoServiceImpl implements DemoService {
    @Override
    public String hello(String name) {
        return "Hello " + name;
    }

    @Override
    public String hello(User user, int count) {
        return "Hello " + user.getTitle() + ". " + user.getName() + ", " + count;
    }
}

// Model
@Data
public class User {
    private String title;
    private String name;
}
```

<a name="H68dv"></a>

### Testing the Basic Service

```bash
curl -v "http://127.0.0.1:8081/org.apache.dubbo.rest.demo.DemoService/hello?name=world"
# Output looks like
#> GET /org.apache.dubbo.rest.demo.DemoService/hello?name=world HTTP/1.1
#> Host: 127.0.0.1:8081
#> User-Agent: curl/8.7.1
#> Accept: */*
#>
#* Request completely sent off
#< HTTP/1.1 200 OK
#< content-type: application/json
#< alt-svc: h2=":8081"
#< content-length: 13
#<
#"Hello world"
```

Code Explanation: <br />You can see "Hello world" was outputted, and the double quotes indicate the default output content-type was application/json.<br />From this example, you can understand that Triple exports the service to
`/{serviceInterface}/{methodName}` path by default and supports passing parameters through the URL.
<a name="vSW6b"></a>

### Testing the Advanced Service

```bash
curl -v -H "c: 3" -d 'name=Yang' "http://127.0.0.1:8081/org.apache.dubbo.rest.demo.DemoService/hi.txt?title=Mr"
# Output looks like
#> POST /org.apache.dubbo.rest.demo.DemoService/hi.txt?title=Mr HTTP/1.1
#> Host: 127.0.0.1:8081
#> User-Agent: curl/8.7.1
#> Accept: */*
#> c: 3
#> Content-Length: 9
#> Content-Type: application/x-www-form-urlencoded
#>
#* upload completely sent off: 9 bytes
#< HTTP/1.1 200 OK
#< content-type: text/plain
#< alt-svc: h2=":8081"
#< content-length: 17
#<
#Hello Mr. Yang, 3
```

Code Explanation: <br />The output "Hello Mr. Yang, 3" shows no double quotes because the output is requested as `text/plain` by specifying the suffix txt.<br />This example illustrates how to customize paths via the Mapping annotation and customize parameter sources via the Param annotation, supporting parameters passed through the post body or URL; for detailed instructions, see: [Basic User Guide](/en/overview/mannual/java-sdk/reference-manual/protocol/tripe-rest-manual/#GdlnC)
<a name="KNfuq"></a>

### Observing Logs

You can open debug logs to understand the startup and response request process of REST.

```yaml
logging:
  level:
    "org.apache.dubbo.rpc.protocol.tri": debug
    "org.apache.dubbo.remoting": debug
```

Once enabled, you can observe the Rest mapping registration and request-response process.

```
# Register mapping
DEBUG o.a.d.r.p.t.TripleProtocol               :  [DUBBO] Register triple grpc mapping: 'org.apache.dubbo.rest.demo.DemoService' -> invoker[tri://192.168.2.216:8081/org.apache.dubbo.rest.demo.DemoService]
 INFO .r.p.t.r.m.DefaultRequestMappingRegistry :  [DUBBO] BasicRequestMappingResolver resolving rest mappings for ServiceMeta{interface=org.apache.dubbo.rest.demo.DemoService, service=DemoServiceImpl@2a8f6e6} at url [tri://192.168.2.216:8081/org.apache.dubbo.rest.demo.DemoService]
DEBUG .r.p.t.r.m.DefaultRequestMappingRegistry :  [DUBBO] Register rest mapping: '/org.apache.dubbo.rest.demo.DemoService/hi' -> mapping=RequestMapping{name='DemoServiceImpl#hello', path=PathCondition{paths=[org.apache.dubbo.rest.demo.DemoService/hi]}, methods=MethodsCondition{methods=[POST]}}, method=MethodMeta{method=org.apache.dubbo.rest.demo.DemoService.hello(User, int), service=DemoServiceImpl@2a8f6e6}
DEBUG .r.p.t.r.m.DefaultRequestMappingRegistry :  [DUBBO] Register rest mapping: '/org.apache.dubbo.rest.demo.DemoService/hello' -> mapping=RequestMapping{name='DemoServiceImpl#hello~S', path=PathCondition{paths=[org.apache.dubbo.rest.demo.DemoService/hello]}}, method=MethodMeta{method=org.apache.dubbo.rest.demo.DemoService.hello(String), service=DemoServiceImpl@2a8f6e6}
 INFO .r.p.t.r.m.DefaultRequestMappingRegistry :  [DUBBO] Registered 2 REST mappings for service [DemoServiceImpl@44627686] at url [tri://192.168.2.216:8081/org.apache.dubbo.rest.demo.DemoService] in 11ms

# Request Response
DEBUG .a.d.r.p.t.r.m.RestRequestHandlerMapping :  [DUBBO] Received http request: DefaultHttpRequest{method='POST', uri='/org.apache.dubbo.rest.demo.DemoService/hi.txt?title=Mr', contentType='application/x-www-form-urlencoded'}
DEBUG .r.p.t.r.m.DefaultRequestMappingRegistry :  [DUBBO] Matched rest mapping=RequestMapping{name='DemoServiceImpl#hello', path=PathCondition{paths=[/org.apache.dubbo.rest.demo.DemoService/hi]}, methods=MethodsCondition{methods=[POST]}}, method=MethodMeta{method=org.apache.dubbo.rest.demo.DemoService.hello(User, int), service=DemoServiceImpl@2a8f6e6}
DEBUG .a.d.r.p.t.r.m.RestRequestHandlerMapping :  [DUBBO] Content-type negotiate result: request='application/x-www-form-urlencoded', response='text/plain'
DEBUG .d.r.h.AbstractServerHttpChannelObserver :  [DUBBO] Http response body is: '"Hello Mr. Yang, 3"'
DEBUG .d.r.h.AbstractServerHttpChannelObserver :  [DUBBO] Http response headers sent: {:status=[200], content-type=[text/plain], alt-svc=[h2=":8081"], content-length=[17]}
```

## Practical Application Scenarios

Next, let's look at what real problems can be solved with triple protocol supporting REST format access.

### Spring Cloud Interoperation

First, the initial scenario is to enable interoperability between the Dubbo system and HTTP microservice systems.

Imagine you are in charge of a business line, and you have a microservice cluster developed based on Dubbo, where services communicate using the triple binary protocol. There is another important business within the company running on a microservice cluster developed based on Spring Cloud, where the services communicate using HTTP+JSON. Now you want to enable communication between these two businesses; how can services interact? The triple protocol supporting REST format access can solve this problem, allowing the Dubbo microservice cluster to communicate internally using the triple binary protocol while externally using the REST request format provided by triple.

### Gateway Traffic Access

Another very valuable scenario for supporting REST format access is that it facilitates gateway traffic access. Accessing binary-format RPC protocols has always been a challenge. Previously, Dubbo provided `generic calls` to solve this problem; gateways could implement `HTTP -> Dubbo` protocol conversion to access backend microservice clusters.

Now, with support for REST format, decentralized access can be achieved without any gateway protocol conversion. For more details, see [HTTP Gateway Traffic Access](../../gateway/).

