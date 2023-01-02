---
type: docs
linkTitle: "Generalized call"
title: "Generalization call (client generalization)"
weight: 4
description: "RPC calls that do not require a server-side API"
---

## Feature description

Generalized call refers to calling the server without the API (SDK) provided by the server, and the call result can be obtained normally.

## scenes to be used

The generalization call is mainly used to implement a general remote service mock framework, which can handle all service requests by implementing the GenericService interface. For example, the following scenario:

1. Gateway service: If you want to build a gateway service, then the service gateway should be the calling end of all RPC services. However, the gateway itself should not depend on the interface API of the service provider (this will cause the code of the gateway to be modified and redeployed every time a new service is released), so support for generalization calls is required.

2. Test platform: If you want to build a platform that can test RPC calls, the user can test the corresponding RPC service by inputting information such as group name, interface, method name, etc. Then, for the same reason (that is, every time a new service is released, the code of the gateway needs to be modified and redeployed), the platform itself should not depend on the interface API of the service provider. So support for generalized calls is needed.

## How to use

The demo can be seen [sample code in the dubbo project](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-generic)

The API part uses this demo as an example to explain how to use it.

### Service definition

#### Service interface

```java
public interface HelloService {

    String sayHello(String name);

    CompletableFuture<String> sayHelloAsync(String name);

    CompletableFuture<Person> sayHelloAsyncComplex(String name);

    CompletableFuture<GenericType<Person>> sayHelloAsyncGenericComplex(String name);
}

```

#### Service implementation class

```java
public class HelloServiceImpl implements HelloService {

    @Override
    public String sayHello(String name) {
        return "sayHello: " + name;
    }

    @Override
    public CompletableFuture<String> sayHelloAsync(String name) {
        CompletableFuture<String> future = new CompletableFuture<>();
        new Thread(() -> {
            try {
                Thread. sleep(5000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            future.complete("sayHelloAsync: " + name);
        }).start();

        return future;
    }

    @Override
    public CompletableFuture<Person> sayHelloAsyncComplex(String name) {
        Person person = new Person(1, "sayHelloAsyncComplex: " + name);
        CompletableFuture<Person> future = new CompletableFuture<>();
        new Thread(() -> {
            try {
                Thread. sleep(5000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            future. complete(person);
        }).start();

        return future;
    }

    @Override
    public CompletableFuture<GenericType<Person>> sayHelloAsyncGenericComplex(String name) {
        Person person = new Person(1, "sayHelloAsyncGenericComplex: " + name);
        GenericType<Person> genericType = new GenericType<>(person);
        CompletableFuture<GenericType<Person>> future = new CompletableFuture<>();
        new Thread(() -> {
            try {
                Thread. sleep(5000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            future. complete(genericType);
        }).start();

        return future;
    }
}

```

### Using generic calls through the API

#### Service initiator

1. When setting `ServiceConfig`, use `setGeneric("true")` to enable generic calls

2. When setting `ServiceConfig`, when using setRef to specify the implementation class, you must set a `GenericService` object. instead of the real service implementation class object

3. Other settings are consistent with normal Api service startup

```java
private static String zookeeperAddress = "zookeeper://" + System.getProperty("zookeeper.address", "127.0.0.1") + ":2181";

    public static void main(String[] args) throws Exception {
        new Embedded ZooKeeper(2181, false).start();

        //Create ApplicationConfig
        ApplicationConfig applicationConfig = new ApplicationConfig();
        applicationConfig.setName("generic-impl-provider");
        //Create registry configuration
        RegistryConfig registryConfig = new RegistryConfig();
        registryConfig.setAddress(zookeeperAddress);
        
        //Create a new service implementation class, pay attention to use GenericService to receive
        GenericService helloService = new GenericImplOfHelloService();

        //Create service related configuration
        ServiceConfig<GenericService> service = new ServiceConfig<>();
        service.setApplication(applicationConfig);
        service.setRegistry(registryConfig);
        service.setInterface("org.apache.dubbo.samples.generic.call.api.HelloService");
        service.setRef(helloService);
        // Key point: set to generalization call
        // Note: it is no longer recommended to use the setGeneric function whose parameter is a Boolean value
        //should use referenceConfig.setGeneric("true") instead
        service.setGeneric("true");
        service. export();

        System.out.println("dubbo service started");
        
        new CountDownLatch(1). await();
    }
}
```

#### Generalizing the caller
step:

1. When setting `ReferenceConfig`, use `setGeneric("true")` to enable generic calls

2. After configuring `ReferenceConfig`, use `referenceConfig.get()` to get the instance of the `GenericService` class

3. Use its `$invoke` method to get the result

4. Other settings are consistent with normal Api service startup

```java
    //Define generalized call service class
    private static GenericService genericService;
    public static void main(String[] args) throws Exception {
        //Create ApplicationConfig
        ApplicationConfig applicationConfig = new ApplicationConfig();
        applicationConfig.setName("generic-call-consumer");
        //Create registry configuration
        RegistryConfig registryConfig = new RegistryConfig();
        registryConfig.setAddress("zookeeper://127.0.0.1:2181");
        //Create service reference configuration
        ReferenceConfig<GenericService> referenceConfig = new ReferenceConfig<>();
        //Set the interface
        referenceConfig.setInterface("org.apache.dubbo.samples.generic.call.api.HelloService");
        applicationConfig.setRegistry(registryConfig);
        referenceConfig.setApplication(applicationConfig);
        // Key point: set to generalization call
        // Note: it is no longer recommended to use the setGeneric function whose parameter is a Boolean value
        //should use referenceConfig.setGeneric("true") instead
        referenceConfig.setGeneric(true);
        //Set asynchronous, not necessary, it depends on the business.
        referenceConfig.setAsync(true);
        //Set the timeout
        referenceConfig.setTimeout(7000);
        
        //Get the service, because it is a generalized call, so it must be of the GenericService type
        genericService = referenceConfig. get();
        
        //Using the $invoke method of the GenericService class object can be used instead of the original method
        //The first parameter is the name of the method to call
        //The second parameter is the parameter type array of the method to be called, which is a String array, and the full class name of the parameter is stored in it.
        //The third parameter is the parameter array of the method to be called, which is an Object array, and the required parameters are stored in it.
        Object result = genericService. $invoke("sayHello", new String[]{"java. lang. String"}, new Object[]{"world"});
        //Use CountDownLatch, if you use synchronous calls, you don't need to do this.
        CountDownLatch latch = new CountDownLatch(1);
        //Get the result
        CompletableFuture<String> future = RpcContext.getContext().getCompletableFuture();
        future. whenComplete((value, t) -> {
            System.err.println("invokeSayHello(whenComplete): " + value);
            latch. countDown();
        });
        // print the result
        System.err.println("invokeSayHello(return): " + result);
        latch. await();
    }
```

### Using generic calls with Spring
There are many ways to use service exposure and service discovery in Spring, such as xml and annotations. Take xml as an example here.
step:

1. There is no need to change the producer side

2. Add the attribute of `generic=true` to the original `dubbo:reference` tag on the consumer side.

```xml
   <dubbo:reference id="helloService" generic = "true" interface="org.apache.dubbo.samples.generic.call.api.HelloService"/>
```

3. Get the Bean container, and get the `GenericService` instance through the Bean container.

4. Call the `$invoke` method to get the result

```java

    private static GenericService genericService;

    public static void main(String[] args) throws Exception {
        ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext("spring/generic-impl-consumer.xml");
        context. start();
        //The name of the bean corresponding to the service is determined by the id of the xml tag
        genericService = context. getBean("helloService");
        //Get the result
        Object result = genericService. $invoke("sayHello", new String[]{"java. lang. String"}, new Object[]{"world"});
    }
```


### Protobuf object generalization call

General generalization calls can only be used when the generated service parameters are POJOs, while GoogleProtobuf objects are abnormal POJOs generated based on Builder, which can be generalized and called through protobuf-json.

GoogleProtobuf serialization-related Demo can refer to [protobuf-demo](https://github.com/apache/dubbo-samples/tree/master/3-extensions/serialization/dubbo-samples-protobuf)

#### Generic calls to Google Protobuf objects through Spring

Configure the declaration generic = "protobuf-json" in Spring

```xml
<dubbo:reference id="barService" interface="com.foo.BarService" generic="protobuf-json" />
```

Get barService in Java code and start generalizing calls:

```java
GenericService barService = (GenericService) applicationContext. getBean("barService");
Object result = barService.$invoke("sayHello",new String[]{"org.apache.dubbo.protobuf.GooglePbBasic$CDubboGooglePBRequestType"}, new Object[]{"{\"double\":0.0,\"float \":0.0,\"bytesType\":\"Base64String\",\"int32\":0}"});
```

#### Generalized calls to Google Protobuf objects through API

```java
ReferenceConfig<GenericService> reference = new ReferenceConfig<GenericService>();
// Weakly typed interface name
reference.setInterface(GenericService.class.getName());
reference.setInterface("com.xxx.XxxService");
// Declare as Protobuf-json
reference.setGeneric(Constants.GENERIC_SERIALIZATION_PROTOBUF);

GenericService genericService = reference. get();
Map<String, Object> person = new HashMap<String, Object>();
person. put("fixed64", "0");
person. put("int64", "0");
// Referring to Google's official protobuf 3 syntax, only one POJO object is transmitted in each method of the service
// The generalized call of protobuf only allows passing a json object of type String to represent the request parameter
String requestString = new Gson().toJson(person);
// The return object is the json string of the GoolgeProtobuf response object.
Object result = genericService. $invoke("sayHello", new String[] {
    "com.xxx.XxxService.GooglePbBasic$CDubboGooglePBRequestType"},
    new Object[] {requestString});
```

#### Processing of GoogleProtobuf objects

The GoogleProtobuf object is generated by the Protocol contract. For related knowledge, please refer to [ProtocolBuffers Documentation](https://developers.google.com/protocol-buffers/?hl=zh-CN). If there is the following Protobuf contract

```proto
syntax = "proto3";
package com.xxx.XxxService.GooglePbBasic.basic;
message CDubboGooglePBRequestType {
    double double = 1;
    float float = 2;
    int32 int32 = 3;
    bool bool = 13;
    string string = 14;
    bytes bytesType = 15;
}

message CDubboGooglePBResponseType {
    string msg = 1;
}

service CDubboGooglePBService {
    rpc sayHello (CDubboGooglePBRequestType) returns (CDubboGooglePBResponseType);
}
```

Then the corresponding request is constructed according to the following method

```java
Map<String, Object> person = new HashMap<>();
person. put("double", "1.000");
person. put("float", "1.00");
person. put("int32","1");
person. put("bool","false");
//String objects need to be base64 encoded
person. put("string","someBaseString");
person. put("bytesType","150");
```

#### GoogleProtobuf service metadata analysis

Google Protobuf objects lack standard JSON formatting and the resulting service metadata information is incorrect. Please add the following dependencies that depend on metadata parsing.

```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-metadata-definition-protobuf</artifactId>
    <version>${dubbo.version}</version>
</dependency>
```

It is also relatively easy to construct generalized call objects from service metadata.


## Precautions

1. If the parameter is a basic type or Date, List, Map, etc., there is no need to convert it, just call it directly.

2. If the parameter is another POJO, use Map instead.

Such as:
```java
public class Student {
    String name;
    int age;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this. age = age;
    }
}

```

Should be converted to:

```java
Map<String, Object> student = new HashMap<String, Object>();
student. put("name", "xxx");
student. put("age", "xxx");
```

3. For other serialization formats, special configuration is required