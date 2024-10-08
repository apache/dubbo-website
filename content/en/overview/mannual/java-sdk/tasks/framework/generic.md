---
aliases:
    - /en/overview/tasks/develop/generic/
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/service/generic-reference/
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/service/generic-service/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/service/generic/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/service/generic-service/
    - /en/overview/mannel/java-sdk/advanced-features-and-usage/service/generic-reference/
    - /en/overview/mannual/java-sdk/tasks/framework/more/generic/
description: Generic call for invoking the service when the caller does not have the API (SDK) provided by the service provider.
linkTitle: Generic Call
title: Generic Call
type: docs
weight: 9
---

 {{% alert title="Note" color="warning" %}}
 Generic calls are suitable for older versions of the Dubbo communication protocol. If you are using the triple protocol from version 3.3 and onwards, please use the HTTP application/json capabilities provided by the triple protocol to directly initiate service calls. Relevant examples can be found in [Gateway Access Instructions](/en/overview/mannual/java-sdk/tasks/gateway/triple/).
 {{% /alert %}}

A generic call (client generic call) refers to invoking the service when the caller does not have the service provider's API (SDK) and can still obtain the call result. The caller can invoke the corresponding interface through a generic call by knowing the fully qualified class name and method name of the service interface.

## Usage Scenarios

Generic calls can initiate requests to all services through a universal GenericService interface. Typical use cases include:

1. Gateway Service: When building a gateway service, the service gateway acts as the caller for all RPC services without relying on the service provider's API. Therefore, it requires support for generic calls.

2. Testing Platform: When creating a platform to test RPC calls, users can input group names, interfaces, method names, etc., to test the corresponding RPC services. Similar to the gateway, it should not depend on the service provider's API, hence requiring support for generic calls.

## Usage Method

Please refer to the complete source code of this example at [dubbo-samples-generic-call](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-generic/dubbo-samples-generic-call/).

The example includes the following Dubbo service definitions and implementations.

Service interface definition:

```java
public interface HelloService {
    String sayHello(String name);
    CompletableFuture<String> sayHelloAsync(String name);
    CompletableFuture<Person> sayHelloAsyncComplex(String name);
    CompletableFuture<GenericType<Person>> sayHelloAsyncGenericComplex(String name);
}
```

Service implementation and publishing:

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

### API Invocation Method

For the above Dubbo service, we can initiate calls directly through the generic call API.

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

1. When setting `ReferenceConfig`, use `setGeneric("true")` to enable generic calls.
2. After configuring `ReferenceConfig`, use `referenceConfig.get()` to get the instance of the `GenericService` class.
3. Use its `$invoke` method to get the result.
4. Other settings are consistent with normal service call configuration.

### Spring Invocation Method
In Spring, there are various ways to expose services and discover services, such as XML and annotations. Here, XML is used as an example.

1. No changes are needed on the producer side.

2. The existing `dubbo:reference` tag on the consumer side should have the `generic=true` attribute added.

``` xml
   <dubbo:reference id="helloService" generic = "true" interface="org.apache.dubbo.samples.generic.call.api.HelloService"/>
```

3. Obtain the Bean container and retrieve the `GenericService` instance via the Bean container.

4. Call the `$invoke` method to get the result.

``` java

    private static GenericService genericService;

    public static void main(String[] args) throws Exception {
        ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext("spring/generic-impl-consumer.xml");
        context.start();
        // The name of the service corresponding bean is determined by the id of the xml tag.
        genericService = context.getBean("helloService");
        // Obtain the result.
        Object result = genericService.$invoke("sayHello", new String[]{"java.lang.String"}, new Object[]{"world"});
    }
```

