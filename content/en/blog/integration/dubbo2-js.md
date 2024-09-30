---
title: "From Cross-Language Calls to dubbo2.js"
linkTitle: "From Cross-Language Calls to dubbo2.js"
date: 2018-08-14
tags: ["Node.js"]
description: >
    This article introduces how to perform cross-language Dubbo calls using dubbo2.js.
---

> [dubbo2.js](https://github.com/dubbo/dubbo2.js) is a Node.js Dubbo client contributed by [Qianmi](https://www.qianmi.com/) to the Dubbo community. It provides support for the native Dubbo protocol in Node.js, making RPC calls between Node.js and Java, two heterogeneous languages, convenient and efficient.

## Cross-Language Calls in Microservices

Microservice architecture has become the trend in today’s internet architecture, and discussions about microservices occupy most of the various technical conferences. The most widely used service governance framework in China is undoubtedly Dubbo, an open-source project from Alibaba. Qianmi has also chosen Dubbo as its microservice governance framework. On the other hand, like most internet companies, Qianmi has a diverse range of development languages, with most backend services supported by Java, while each business line has the freedom to choose its own development language, leading to issues of calling Node.js, Python, and Go in a multi-language environment. Cross-language invocation is a broad and challenging topic, and several solutions frequently mentioned in the industry are as follows:

- Spring Cloud: Spring Cloud provides a complete set of components for microservices development, primarily aimed at Java developers. Since it uses RESTful-style HTTP protocols, it inherently possesses cross-language capabilities, and heterogeneous languages only need to provide HTTP clients for cross-language invocation.
- Service Mesh: The so-called next-generation microservices framework, Service Mesh, focuses on handling inter-service communication through the SideCar concept, which evolves over time but fundamentally serves to ensure reliable request delivery.
- Motan: [Motan](https://github.com/weibocom/motan) is an open-source cross-language service governance framework from Sina Weibo. In its early versions, it only supported Motan-Java, but with version evolution, it now includes cross-language features such as Motan-Go, Motan-PHP, and Motan-Openresty. Similar to the SideCar in Service Mesh, Motan leverages Motan-Go as an agent to handle protocol forwarding, relying on a custom protocol: Motan2 for cross-language invocation.

What do we talk about when we discuss cross-language invocation? Through the above common and mature solutions, we can conclude that the approaches to address cross-language invocation are primarily two-fold:

- Finding a universal protocol
- Using agents to adapt protocols

For a new team facing technical decisions, I believe the above solutions can be considered, taking into account the compatibility issues with legacy systems.

- Cost of migrating old systems

This is also a critical factor in selecting solutions. Our first attempt focuses on the RPC protocol.

## Universal Protocol Cross-Language Support

### The Beautiful Era of SpringMVC

![springmvc](/imgs/blog/springmvc.png)

Before achieving true cross-language calls, most solutions trying to implement "cross-language" used HTTP protocols for a layer of conversion, with the most common being the use of SpringMVC's controller/restController to indirectly call the Dubbo provider. The advantages and disadvantages of this approach are evident:

- The advantage is its simplicity; it is the most straightforward solution.
- The disadvantage is that it lengthens the call chain, adding an HTTP communication layer on top of TCP communication; it also results in a poor development experience since additional code for the controller layer needs to be written to expose RPC interfaces.

### Support for Universal Protocols

In fact, most service governance frameworks support various protocols. Besides the default Dubbo protocol, the Dubbo framework includes the [REST](https://dangdangdotcom.github.io/dubbox/rest.html) protocol extended by Dangdang and the [JSON-RPC](https://github.com/apache/dubbo-rpc-jsonrpc) protocol extended by Qianmi. Both are universal cross-language protocols.

The REST protocol satisfies the JAX-RS 2.0 standards, introducing annotations like @Path, @POST, and @GET. Those accustomed to writing traditional RPC interfaces may find the REST-style RPC interfaces less familiar. This can affect the development experience and also creates incompatibility with other protocols, making coexistence and migration of legacy interfaces challenging. If there are no legacy systems, the REST protocol is undoubtedly the easiest implementation for cross-language solutions, as most languages support REST.

Similar to the REST protocol, JSON-RPC is also implemented through text serialization and HTTP protocols. Dubbox has made attempts with RESTful interfaces, but the REST architecture differs from the original RPC architecture of Dubbo. The REST architecture requires defining resources and utilizing basic HTTP operations GET, POST, PUT, and DELETE. We believe RESTful is more suitable for calls between internet systems, while RPC is better for calls within a system. Using JSON-RPC protocol allows for the coexistence of legacy interfaces, preserving development habits while gaining cross-language capability.

In early practice, Qianmi opted for JSON-RPC as the cross-language protocol implementation for Dubbo and open-sourced Python client [dubbo-client-py](https://github.com/dubbo/dubbo-client-py) and Node client [dubbo-node-client](https://github.com/QianmiOpen/dubbo-node-client), enabling users of Python and Node.js to directly call the RPC services provided by dubbo-provider-java. Most cross-calls among Java services within the system still rely on the Dubbo protocol. Considering the adaptation of new and old protocols, we configured dual protocols without impacting the existing services.

```xml
<dubbo:protocol name="dubbo" port="20880" />
<dubbo:protocol name="jsonrpc" port="8080" />
```

The Dubbo protocol mainly supports inter-calls between Java services, adapting to old interfaces; the JSON-RPC protocol primarily supports calls from heterogeneous languages.

### Custom Protocol Cross-Language Support

The so-called protocol in microservice frameworks can be understood simply as the message format and serialization scheme. Service governance frameworks generally provide a variety of protocol configurations for users to choose from. Besides the two universal protocols mentioned above, there are also some customized protocols like the default Dubbo protocol from the Dubbo framework and the cross-language protocol provided by the Motan framework: Motan2.

#### Cross-Language Support of Motan2 Protocol

![motan2](/imgs/blog/motan-protocol.png)

Motan2 protocol was designed to meet cross-language needs manifested in two aspects—MetaData and Motan-Go. In the initial Motan protocol, the protocol message consisted only of Header and Body, which required deserialization of data like path, param, and group stored in the Body, unfriendly to heterogeneous languages, so the composition of the protocol was modified in Motan2; Weibo open-sourced [motan-go](https://github.com/weibocom/motan-go/), [motan-php](https://github.com/weibocom/motan-php), and [motan-openresty](https://github.com/weibocom/motan-openresty) and used Motan-Go as an agent to act as a translator, applying a simple serialization scheme to serialize the Body of the protocol message (simple serialization is a weaker serialization scheme).

![agent](/imgs/blog/motan-agent.png)

A careful comparison shows that this is not much different from the dual protocol configuration; the only difference is the implicit existence of the agent, coexisting with the main service. The obvious distinction lies in the fact that in the agent scheme, heterogeneous languages do not interact directly.

#### Cross-Language Support of Dubbo Protocol

The Dubbo protocol was initially designed only for conventional RPC calling scenarios and was not specifically designed for cross-language use. However, cross-language support is not merely a binary choice of support or not support, but is categorized by ease of implementation.

Yes, making cross-language calls using the Dubbo protocol may not be easy, but it is feasible. Qianmi achieved this with the frontend services developed in Node.js becoming the main battlefield for heterogeneous languages, ultimately bringing to life dubbo2.js, bridging Node.js with the native Dubbo protocol. As the core of this article's second part, we will highlight the tasks accomplished using dubbo2.js.

##### Dubbo Protocol Message Format

![dubbo协议](/imgs/blog/dubbo-protocol.png)

Detailed explanation of the Dubbo protocol message header:

- magic: similar to the magic number in Java bytecode files, used to determine if it's a Dubbo protocol packet. The magic number is the constant 0xdabb.
- flag: indicator bits, a total of 8 address bits. The low four bits indicate the type of serialization tool used for the message body data (default Hessian). In the high four bits, the first bit set to 1 indicates a request, the second bit set to 1 indicates bi-directional transfer (i.e., there is a response), and the third bit set to 1 indicates a heartbeat ping event.
- status: a status bit used to set request-response statuses; Dubbo defines several response types. For specifics, see `com.alibaba.dubbo.remoting.exchange.Response`.
- invoke id: message ID, of type long. A unique identifier for each request (used to match requests and responses in asynchronous communication).
- body length: length of the message body, of type int, indicating how many bytes the Body Content has.
- body content: abstract serialized storage of request parameters and response parameters.

Ultimately, protocol messages are transformed into bytes for TCP transmission. Any language that supports network modules and provides Socket-like encapsulation can achieve communication. So, where does the cross-language difficulty lie? In calling Java from other languages, the main challenges are:

1. How heterogeneous languages represent data types in Java, particularly dynamic languages, which may not have strict data types.
2. How serialization schemes can achieve cross-language compatibility.

## dubbo2.js Solution

From the analysis above, we have identified two main challenges. The key to solving these problems with dubbo2.js relies on two libraries: [js-to-java](https://github.com/node-modules/js-to-java) and [hessian.js](https://github.com/node-modules/hessian.js). js-to-java enables Node.js to express Java objects, while hessian.js provides serialization capability. By utilizing Node.js sockets to replicate the message format of the Dubbo protocol, Node.js is able to call Java-Dubbo-Provider.

## Getting Started with dubbo2.js

To provide an intuitive experience for readers interested in dubbo2.js, this section presents a quick-start example, showcasing how easy it is to call Dubbo services using dubbo2.js.

### 1. Create a dubbo-java-provider

The backend Dubbo service is provided using Java, serving most business scenarios. First, define the service interface:

```java
public interface DemoProvider {
    String sayHello(String name);
    String echo() ;
    void test();
    UserResponse getUserInfo(UserRequest request);
}
```

Next, implement the service:

```java
public class DemoProviderImpl implements DemoProvider {
    public String sayHello(String name) {
        System.out.println("[" + new SimpleDateFormat("HH:mm:ss").format(new Date()) + "] Hello " + name + ", request from consumer: " + RpcContext.getContext().getRemoteAddress());
        return "Hello " + name + ", response form provider: " + RpcContext.getContext().getLocalAddress();
    }
    @Override
    public String echo()  {
        System.out.println("receive....");
        return "pang";
    }
    @Override
    public void test() {
        System.out.println("test");
    }
    @Override
    public UserResponse getUserInfo(UserRequest request) {
        System.out.println(request);
        UserResponse response = new UserResponse();
        response.setStatus("ok");
        Map<String, String> map = new HashMap<String, String>();
        map.put("id", "1");
        map.put("name", "test");
        response.setInfo(map);
        return response;
    }
}
```

Expose the service:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:dubbo="http://code.alibabatech.com/schema/dubbo"
       xmlns="http://www.springframework.org/schema/beans"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-2.5.xsd
   http://code.alibabatech.com/schema/dubbo http://code.alibabatech.com/schema/dubbo/dubbo.xsd">

    <!-- Provider application information, used for dependency calculation -->
    <dubbo:application name="demo-provider"/>

    <dubbo:registry protocol="zookeeper" address="localhost:2181"/>

    <!-- Expose the service on port 20880 using the dubbo protocol -->
    <dubbo:protocol name="dubbo" port="20880"/>

    <!-- Implement the service like a local bean -->
    <bean id="demoProvider" class="com.alibaba.dubbo.demo.provider.DemoProviderImpl"/>

    <!-- Declare the service interface that needs to be exposed -->
    <dubbo:service interface="com.alibaba.dubbo.demo.DemoProvider" ref="demoProvider" version="1.0.0"/>

</beans>
```

We have completed all configurations on the server-side, and we can start the main class to register a Dubbo service locally.

```java
public class Provider {
    public static void main(String[] args) throws Exception {
        ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext(new String[]{"META-INF/spring/dubbo-demo-provider.xml"});
        context.start();
        System.in.read();
    }
}
```

### 2. Implement the Node.js Dubbo Client 

Install dubbo2.js:

```sh
npm install dubbo2.js --save
```

Configure dubboConfig.ts:

```typescript
import { Dubbo, java, TDubboCallResult } from 'dubbo2.js'

const dubbo = new Dubbo({
  application: {name: 'demo-provider'},
  register: 'localhost:2181',
  dubboVersion: '2.0.0',
  interfaces: [
    'com.alibaba.dubbo.demo.DemoProvider',
  ],
});

interface IDemoService {
  sayHello(name: string): TDubboCallResult<string>;
}

export const demoService = dubbo.proxyService<IDemoService>({
  dubboInterface: 'com.alibaba.dubbo.demo.DemoProvider',
  version: '1.0.0',
  methods: {
    sayHello(name: string) {
      return [java.String(name)];
    },

    echo() {},

    test() {},

    getUserInfo() {
      return [
        java.combine('com.alibaba.dubbo.demo.UserRequest', {
          id: 1,
          name: 'nodejs',
          email: 'node@qianmi.com',
        }),
      ];
    },
  },
});
```

> Using TypeScript can provide a better development experience.

Write the calling class main.ts:

```typescript
import {demoService} from './dubboConfig'

demoService.sayHello('kirito').then(({res,err})=>{
    console.log(res)
});
```

### 3. Execute the Call 

Start the Node.js client in Debug mode:

```sh
DEBUG=dubbo* ts-node main.ts
```

Check the results:

```sh
Hello kirito, response form provider: 172.19.6.151:20880
```

Congratulations!

## Features of dubbo2.js

- Supports Zookeeper registration center
- Supports native Dubbo protocol
- Supports direct service connection
- Full-link tracing
- Automatic generation of Dubbo interfaces

## More Details

The example code in this article is provided here: <https://github.com/dubbo/dubbo2.js>. If you are not very familiar with the Dubbo protocol and want to understand how it works, the project provides a sub-module—java-socket-consumer, which implements a procedure-oriented approach to send Dubbo protocol messages with native sockets, completing the entire process of method invocation and response reception. 
