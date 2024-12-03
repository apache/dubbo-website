---
title: "Best Practices for Microservices: Zero Refactoring to Achieve Interoperability Between Spring Cloud and Apache Dubbo"
linkTitle: "Best Practices for Microservices: Zero Refactoring to Achieve Interoperability Between Spring Cloud and Apache Dubbo"
tags: ["spring-cloud"]
authors: ["Cairong Sun"]
date: 2023-10-07
description: "This article demonstrates how to achieve interoperability between the Apache Dubbo system and the Spring Cloud system with minimal cost, enabling hybrid deployment and migration of different microservice systems, helping you solve practical architectural and business issues."
---

**This article uses real projects and code as examples, demonstrating step by step how to achieve interoperability between the Apache Dubbo system and the Spring Cloud system with minimal cost, enabling hybrid deployment and migration of different microservice systems, helping you solve practical architectural and business issues.**
## Background and Goals
If you are facing the following business scenarios during microservice development, this article can help you:

- You already have a microservice application built on Dubbo, and now you need to publish some services through REST HTTP without changing the code, just adding some configurations and annotations for the pre-written Dubbo services.
- You have a microservice system based on Spring Cloud and later built a set of microservices on Dubbo. You want both systems to coexist, requiring mutual access to services published by each other.
- Due to historical reasons, you are planning to migrate from one microservice system to another, ensuring a smooth transition in the process.

![image.png](/imgs/blog/2023/9/springcloud/img.png)

For these scenarios, we can leverage Dubbo 3's built-in REST programming paradigm support, allowing Dubbo to act as both a consumer calling HTTP interface services and a provider publishing REST-style HTTP services, all while minimally modifying any code.

- For more on design and theory in this area, see the [blog post](https://dubbo.apache.org/zh-cn/blog/2023/01/05/dubbo-%E8%BF%9E%E6%8E%A5%E5%BC%82%E6%9E%84%E5%BE%AE%E6%9C%8D%E5%8A%A1%E4%BD%93%E7%B3%BB-%E5%A4%9A%E5%8D%8F%E8%AE%AE%E5%A4%9A%E6%B3%A8%E5%86%8C%E4%B8%AD%E5%BF%83/)。
- For more configuration methods of Dubbo REST, see [REST Usage Reference Manual](/en/overview/mannual/java-sdk/reference-manual/protocol/rest/)  
## Example 1: Dubbo Calls Spring Cloud  
With an existing Spring Cloud microservice system, this demonstrates how to use Dubbo to call Spring Cloud services (including automatic address discovery and protocol transport). In terms of service registry, this example uses Nacos as the registry center, also applicable to other service registries like Zookeeper and Consul.

![dubbo-call-spring-cloud](/imgs/blog/2023/9/springcloud/img_1.png)

Assuming you already have a Spring Cloud microservice system, we will introduce the Dubbo framework to enable Dubbo applications to call services published by Spring Cloud. The complete source code for this example can be found at [samples/dubbo-call-sc](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-springcloud/dubbo-call-sc).

### Start Spring Cloud Server

The structure of the Spring Cloud application in this example is as follows:

![springcloud-server.png](/imgs/blog/2023/9/springcloud/img_2.png)

The application configuration file is as follows:
```yaml
server:
  port: 8099
spring:
  application:
    name: spring-cloud-provider-for-dubbo
  cloud:
    nacos:
      serverAddr: 127.0.0.1:8848 #Registry Center
```

Below is a very simple Controller definition, publishing an HTTP endpoint at `/users/list/`
```java
@RestController
@RequestMapping("/users")
public class UserController {
    @GetMapping("/list")
    public List<User> getUser() {
        return Collections.singletonList(new User(1L, "spring cloud server"));
    }
}
```

Start `SpringCloudApplication`, and by accessing `http://localhost:8099/users/list` via cURL or a browser, you can test the application startup successfully.  
### Use Dubbo Client to Call the Service
The Dubbo client is also a standard Dubbo application, with a basic project structure as follows:

![dubbo-consumer.png](/imgs/blog/2023/9/springcloud/img_3.png)

A critical part of this is the following interface definition (normally, this interface can be copied directly from the original Spring Cloud client application without modification).
> If you do not have a Spring Cloud consumer application based on OpenFeign previously, you need to define an interface instead, which can use standard Spring MVC annotations rather than OpenFeign annotations.

```java
@FeignClient(name = "spring-cloud-provider-for-dubbo")
public interface UserServiceFeign {
    @RequestMapping(value="/users/list", method = RequestMethod.GET, produces = "application/json")
    List<User> users();
}
```

Register the UserServiceFeign interface as a Dubbo service using the `DubboReference` annotation
```java
@DubboReference
private UserServiceFeign userService;
```

Next, we can call the service in the standard Dubbo way
```java
List<User> users = userService.users();
```

Start the Dubbo application via `DubboConsumerApplication` to verify that you can successfully call the Spring Cloud service.  
## Example 2: Spring Cloud Calls Dubbo  
In the next example, we will show how to expose services published by the Dubbo server for calls by Spring Cloud clients.

![spring-cloud-call-dubbo](/imgs/blog/2023/9/springcloud/img_4.png)

The relevant source code for this example is at [samples/sc-call-dubbo](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-springcloud/sc-call-dubbo)  
### Start Dubbo Server  
The code structure of the Dubbo server application is very simple, a typical Dubbo application.

![dubbo-server.png](/imgs/blog/2023/9/springcloud/img_5.png)

Compared to ordinary Dubbo service definitions, we need to add the following standard Spring MVC annotations to the interface:

```java
@RestController
@RequestMapping("/users")
public interface UserService {
    @GetMapping(value = "/list")
    List<User> getUsers();
}
```

Besides the above annotations, other service publishing processes remain the same; simply use the `DubboService` annotation to publish the service:

```java
@DubboService
public class UserServiceImpl implements UserService {
    @Override
    public List<User> getUsers() {
        return Collections.singletonList(new User(1L, "Dubbo provider!"));
    }
}
```

For service configuration, be particularly careful to set the service's protocol to REST `protocol: rest` and the discovery mode to `register-mode: instance`:

```yaml
dubbo:
  registry:
    address: nacos://127.0.0.1:8848
    register-mode: instance
  protocol:
    name: rest
    port: 8090
```

Launch the Dubbo application, and access the following address to check if the service is operating normally: `http://localhost:8090/users/list`  

### Use Spring Cloud to Call Dubbo  
Use OpenFeign to develop a standard Spring Cloud application that can call the published Dubbo service. The project code structure is as follows:

![springcloud-consumer.png](/imgs/blog/2023/9/springcloud/img_6.png)

Here, we define an OpenFeign interface to call the above-published Dubbo REST service.
```java
@FeignClient(name = "dubbo-provider-for-spring-cloud")
public interface UserServiceFeign {
    @RequestMapping(value = "/users/list", method = RequestMethod.GET)
    List<User> getUsers();
}
```

Define the following controller as the testing entry for OpenFeign and RestTemplate.
```java
public class UserController {

    private final RestTemplate restTemplate;
    private final UserServiceFeign userServiceFeign;

    public UserController(RestTemplate restTemplate,
                          UserServiceFeign userServiceFeign) {
        this.restTemplate = restTemplate;
        this.userServiceFeign = userServiceFeign;
    }

    @RequestMapping("/rest/test1")
    public String doRestAliveUsingEurekaAndRibbon() {
        String url = "http://dubbo-provider-for-spring-cloud/users/list";
        System.out.println("url: " + url);
        return restTemplate.getForObject(url, String.class);
    }

    @RequestMapping("/rest/test2")
    public List<User> doRestAliveUsingFeign() {
        return userServiceFeign.getUsers();
    }
}
```

According to the above controller definition, we can access the following addresses for verification:

- OpenFeign Method: `http://localhost:8099/dubbo/rest/test1`,
- RestTemplate Method: `http://localhost:8099/dubbo/rest/test1`  

### Publish More Services for Dubbo Server  
We can use Dubbo's multi-protocol publishing mechanism to configure multiple protocol publications for some services. Next, we will add Dubbo TCP protocol publication to the previously mentioned Dubbo server service to achieve the following deployment effect, allowing this Dubbo application to serve both Dubbo microservice systems and Spring Cloud microservice systems.

![dubbo-multiple-protocols.png](/imgs/blog/2023/9/springcloud/img_7.png)

To achieve this effect, we only need to add multi-protocol configuration in the configuration:
```yaml
dubbo:
  protocols:
    rest:
      name: rest
      port: 8090
    dubbo:
      name: dubbo
      port: 20880
```

At the same time, configure the service annotation for multi-protocol publication
```java
@DubboService(protocol="rest,dubbo")
public class UserServiceImpl implements UserService {}
```

Thus, we have successfully published the UserService service using both Dubbo and REST protocols (multi-port and multi-protocol means), where the Dubbo protocol serves the Dubbo system, and the REST protocol serves the Spring Cloud system.

> **Note:** Dubbo provides single-port and multi-port publishing for multiple protocols, which offers great flexibility for services in different deployment environments. Please read the [Multi-Protocol Configuration](/en/overview/mannual/java-sdk/advanced-features-and-usage/service/multi-protocols) documentation carefully before determining the required multi-protocol publishing method.  

## Conclusion  
Based on the REST programming paradigm and multi-protocol publishing features of Dubbo, you can easily achieve smooth migration from Dubbo to Spring Cloud or from Spring Cloud to Dubbo (with no refactoring cost), while also allowing co-existence of the Dubbo and Spring Cloud systems.  
