---
aliases:
    - /zh/overview/tasks/develop/generic/
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/service/generic-reference/
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/service/generic-service/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/service/generic/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/service/generic-service/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/service/generic-reference/
description: 泛化调用，用于在调用方没有服务方提供的 API（SDK）的情况下，对服务方进行调用
linkTitle: 泛化调用
title: 泛化调用
type: docs
weight: 9
---

 {{% alert title="注意" color="warning" %}}
 泛化调用适用于老版本 dubbo 通信协议，如果您使用的是 3.3 及之后版本的 triple 协议，请直接使用 triple 自带的 http application/json 能力直接发起服务调用，相关示例可参考 [网关接入说明](/zh-cn/overview/mannual/java-sdk/tasks/gateway/triple/)。
 {{% /alert %}}

泛化调用（客户端泛化调用）是指在调用方没有服务提供方 API（SDK）的情况下，对服务方进行调用，并且可以正常拿到调用结果。调用方没有接口及模型类元，知道服务的接口的全限定类名和方法名的情况下，可以通过泛化调用调用对应接口。

## 使用场景

泛化调用可通过一个通用的 GenericService 接口对所有服务发起请求。典型使用场景如下：

1. 网关服务：如果要搭建一个网关服务，那么服务网关要作为所有 RPC 服务的调用端。但是网关本身不应该依赖于服务提供方的接口 API（这样会导致每有一个新的服务发布，就需要修改网关的代码以及重新部署），所以需要泛化调用的支持。

2. 测试平台：如果要搭建一个可以测试 RPC 调用的平台，用户输入分组名、接口、方法名等信息，就可以测试对应的 RPC 服务。那么由于同样的原因（即会导致每有一个新的服务发布，就需要修改网关的代码以及重新部署），所以平台本身不应该依赖于服务提供方的接口 API。所以需要泛化调用的支持。

## 使用方式

本示例的完整源码请参考 [dubbo-samples-generic-call](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-generic/dubbo-samples-generic-call/)。

示例中有以下 Dubbo 服务定义和实现

服务接口定义：

```java
public interface HelloService {
    String sayHello(String name);
    CompletableFuture<String> sayHelloAsync(String name);
    CompletableFuture<Person> sayHelloAsyncComplex(String name);
    CompletableFuture<GenericType<Person>> sayHelloAsyncGenericComplex(String name);
}
```

服务具体实现并发布：

```java
@DubboService
public class HelloServiceImpl implements HelloService {

    @Override
    public String sayHello(String name) {
        return "sayHello: " + name;
    }

    @Override
    public CompletableFuture<String> sayHelloAsync(String name) {
        // ...
    }

    @Override
    public CompletableFuture<Person> sayHelloAsyncComplex(String name) {
         // ...
    }

    @Override
    public CompletableFuture<GenericType<Person>> sayHelloAsyncGenericComplex(String name) {
         // ...
    }
}
```

### API 调用方式

针对以上 Dubbo 服务，我们可以通过泛化调用 API 直接发起调用。

```java
private GenericService genericService;

public static void main(String[] args) throws Exception {
	ApplicationConfig applicationConfig = new ApplicationConfig();
	applicationConfig.setName("generic-call-consumer");
	RegistryConfig registryConfig = new RegistryConfig();
	registryConfig.setAddress("zookeeper://127.0.0.1:2181");

	ReferenceConfig<GenericService> referenceConfig = new ReferenceConfig<>();
	referenceConfig.setInterface("org.apache.dubbo.samples.generic.call.api.HelloService");
	applicationConfig.setRegistry(registryConfig);
	referenceConfig.setApplication(applicationConfig);
	referenceConfig.setGeneric("true");
	// do not wait for result, 'false' by default
	referenceConfig.setAsync(true);
	referenceConfig.setTimeout(7000);

	genericService = referenceConfig.get();
}

public static void invokeSayHello() throws InterruptedException {
	Object result = genericService.$invoke("sayHello", new String[]{"java.lang.String"}, new Object[]{"world"});
	CountDownLatch latch = new CountDownLatch(1);

	CompletableFuture<String> future = RpcContext.getContext().getCompletableFuture();
	future.whenComplete((value, t) -> {
		System.err.println("invokeSayHello(whenComplete): " + value);
		latch.countDown();
	});

	System.err.println("invokeSayHello(return): " + result);
	latch.await();
}
```

1. 在设置 `ReferenceConfig` 时，使用 `setGeneric("true")` 来开启泛化调用
2. 配置完 `ReferenceConfig` 后，使用 `referenceConfig.get()` 获取到 `GenericService` 类的实例
3. 使用其 `$invoke` 方法获取结果
4. 其他设置与正常服务调用配置一致即可

### Spring 调用方式
Spring 中服务暴露与服务发现有多种使用方式，如 xml，注解。这里以 xml 为例。

1. 生产者端无需改动

2. 消费者端原有的 `dubbo:reference` 标签加上 `generic=true` 的属性。

``` xml
   <dubbo:reference id="helloService" generic = "true" interface="org.apache.dubbo.samples.generic.call.api.HelloService"/>
```

3. 获取到 Bean 容器，通过 Bean 容器拿到 `GenericService` 实例。

4. 调用 `$invoke` 方法获取结果

``` java

    private static GenericService genericService;

    public static void main(String[] args) throws Exception {
        ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext("spring/generic-impl-consumer.xml");
        context.start();
        //服务对应bean的名字由xml标签的id决定
        genericService = context.getBean("helloService");
        //获得结果
        Object result = genericService.$invoke("sayHello", new String[]{"java.lang.String"}, new Object[]{"world"});
    }
```

