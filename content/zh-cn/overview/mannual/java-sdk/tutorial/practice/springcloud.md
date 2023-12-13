---
aliases:
    - /zh/overview/tasks/protocols/springcloud/
description: ""
linkTitle: 调用Spring Cloud服务
title: 使用 Dubbo 作为消费端调用 Spring Cloud 服务
type: docs
weight: 3
---
> 本示例仅支持 Dubbo 3.3.0 及以上版本！

本示例使用 Nacos 作为注册中心，演示如何实现 Dubbo 与 Spring Cloud 体系的自动地址发现与服务调用。在注册中心方面，你也可以选用 Zookeeper、Consul 等两种体系都支持的注册中心。

![dubbo-springcloud](/imgs/v3/tasks/protocol/springcloud/http-usecase-1.png)

借助 Dubbo3 内置的 rest 编程范式支持，可以做到基本不改动任何代码的情况下实现 Dubbo 与 Spring Cloud 体系的互相调用。
* 关于这一部分的使用场景及理论阐述请参见这里的[博客文章](https://dubbo.apache.org/zh-cn/blog/2023/01/05/dubbo-%E8%BF%9E%E6%8E%A5%E5%BC%82%E6%9E%84%E5%BE%AE%E6%9C%8D%E5%8A%A1%E4%BD%93%E7%B3%BB-%E5%A4%9A%E5%8D%8F%E8%AE%AE%E5%A4%9A%E6%B3%A8%E5%86%8C%E4%B8%AD%E5%BF%83/)。
* 关于 Dubbo rest 的更多配置方式请参见[rest 使用参考手册](/zh-cn/overview/mannual/java-sdk/reference-manual/protocol/rest/)

## Dubbo 调用 Spring Cloud
设想你已经有一套 Spring Cloud 的微服务体系，现在我们将引入 Dubbo 框架，让 Dubbo 应用能够正常的调用到 Spring Cloud 发布的服务。本示例的相关源码在[samples/dubbo-call-sc](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-springcloud/dubbo-call-sc)。

### 启动 Spring Cloud Server
示例中 Spring Cloud 应用的结构如下

![spring-cloud-server](/imgs/v3/tasks/protocol/springcloud/springcloud-server.png)

应用配置文件如下：
```yaml
server:
  port: 8099
spring:
  application:
    name: spring-cloud-provider-for-dubbo
  cloud:
    nacos:
      serverAddr: 127.0.0.1:8848 #注册中心
```

以下是一个非常简单的 Controller 定义

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

启动 `SpringCloudApplication`，通过 `http://localhost:8099/users/list` 可以测试应用启动成功。

### 使用 Dubbo Client 调用服务
Dubbo client 也是一个标准的 Dubbo 应用，项目基本结构如下：

![dubbo-consumer](/imgs/v3/tasks/protocol/springcloud/dubbo-consumer.png)

其中，一个比较关键的是如下接口定义，正常情况下，以下接口可以直接从原有的 Spring Cloud client 应用中原样拷贝过来即可，无需做任何修改。
> 如果之前没有基于 OpenFeign 的 Spring Cloud 消费端应用，那么就需要自行定义一个接口，使用 Spring MVC 标准注解即可。

```java
@FeignClient(name = "spring-cloud-provider-for-dubbo")
public interface UserServiceFeign {
    @RequestMapping(value="/users/list", method = RequestMethod.GET, produces = "application/json")
    List<User> users();
}
```

通过 `DubboReference` 注解将 UserServiceFeign 注册为 Dubbo 服务

```java
@DubboReference
private UserServiceFeign userService;
```

接下来，我们就可以对服务发起调用了

```java
List<User> users = userService.users();
```

通过 `DubboConsumerApplication` 启动 Dubbo 应用，验证可以成功调用到 Spring Cloud 服务。

## Spring Cloud 调用 Dubbo
在接下来的示例中，我们将展示如何将 Dubbo server 发布的服务开放给 Spring Cloud client 调用。示例的相关源码在[samples/sc-call-dubbo](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-springcloud/sc-call-dubbo)

### 启动 Dubbo Server
Dubbo server 应用的代码结构非常简单，是一个典型的 Dubbo 应用。

![dubbo-server](/imgs/v3/tasks/protocol/springcloud/dubbo-server.png)

相比于普通的 Dubbo 服务定义，我们要在接口上加上如下标准 Spring MVC 注解：

```java
@RestController
@RequestMapping("/users")
public interface UserService {
    @GetMapping(value = "/list")
    List<User> getUsers();
}
```

除了以上注解之外，其他服务发布等流程都一致，使用 `DubboService` 注解发布服务即可：

```java
@DubboService
public class UserServiceImpl implements UserService {
    @Override
    public List<User> getUsers() {
        return Collections.singletonList(new User(1L, "Dubbo provider!"));
    }
}
```

在服务配置上，特别注意我们需要将服务的协议配置为 rest `protocol: rest`，地址发现模式使用 `register-mode: instance`：

```yaml
dubbo:
  registry:
    address: nacos://127.0.0.1:8848
    register-mode: instance
  protocol:
    name: rest
    port: 8090
```

启动 Dubbo 应用，此时访问以下地址可以验证服务运行正常：`http://localhost:8090/users/list`

### 使用 Spring Cloud 调用 Dubbo
使用 OpenFeign 开发一个标准的 Spring Cloud 应用，即可调用以上发布的 Dubbo 服务，项目代码结构如下：

![springcloud-consumer](/imgs/v3/tasks/protocol/springcloud/springcloud-consumer.png)

其中，我们定义了一个 OpenFeign 接口，用于调用上面发布的 Dubbo rest 服务。
```java
@FeignClient(name = "dubbo-provider-for-spring-cloud")
public interface UserServiceFeign {
    @RequestMapping(value = "/users/list", method = RequestMethod.GET)
    List<User> getUsers();
}
```

定义以下 controller 作为 OpenFeign 和 RestTemplate 测试入口。

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

可以分别访问以下地址进行验证：
* OpenFeign 方式：`http://localhost:8099/dubbo/rest/test1`、 
* RestTemplage 方式：`http://localhost:8099/dubbo/rest/test1`

### 为 Dubbo Server 发布更多的服务
我们可以利用 Dubbo 的多协议发布机制，为一些服务配置多协议发布。接下来，我们就为上面提到的 Dubbo server 服务增加 triple 协议发布，从而达到以下部署效果，让这个 Dubbo 应用同时服务 Dubbo 微服务体系和 Spring Cloud 微服务体系。



为了实现这个效果，我们只需要在配置中增加多协议配置即可：
```yaml
dubbo:
  protocols:
    - id: rest
      name: rest
      port: 8090
    - id: dubbo
      name: dubbo
      port: 50051
```

服务注解中配置为多协议发布

```java
@DubboService(protocol="rest,dubbo")
public class UserServiceImpl implements UserService {}
```

这样，我们就成功的将 UserService 服务以 dubbo 和 rest 两种协议发布了出去（多端口多协议的方式），dubbo 协议为 Dubbo 体系服务，rest 协议为 Spring Cloud 体系服务。

> **注意：**Dubbo 为多协议发布提供了单端口、多端口两种方式，这样的灵活性对于不同部署环境下的服务会有比较大的帮助。在确定您需要的多协议发布方式前，请提仔细阅读以下 [多协议配置](/zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/service/multi-protocols) 文档。

## 总结
基于 Dubbo 的 rest 编程范式、多协议发布等特性，可以帮助你轻松的实现从 Dubbo 到 Spring Cloud 或者从 Spring Cloud 到 Dubbo 的平滑迁移（无改造成本），同时也可以实现 Dubbo 与 Spring Cloud 两套体系的共存。
