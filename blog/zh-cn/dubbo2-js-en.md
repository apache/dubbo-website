### Customized Protocols for Cross-language Support

The so-called protocol of the microservice framework can be simply interpreted as: message format and serialization scheme. Generally, the service governance framework would provide numbers of protocol configuration items for users to choose from. In addition to the above two common protocols,there exists some other customized protocols like the dubbo protocol, the default protocol for the dubbo framework, and Motan2, a cross-language protocol provided by the motan framework.

#### Motan2 for cross-language support



![图片 1.png | center | 747x473](https://cdn.nlark.com/lark/0/2018/png/128723/1534165564097-aaddeb4a-c982-4d56-835e-b324745c3f3c.png "")



In the original Motan protocol, the protocol message consisted only of the Header and the Body, making deserialization indispensable for acquiring data stored in the Body, like path, param and group, which is terribly unfriendly for cross-language support. Therefore, the content of the protocol was modifiedin Motan2, Weibo released the open-source projects, [motan-go](https://github.com/weibocom/motan-go/), [motan-php](https://github.com/weibocom/motan-php) and [motan-openresty](https://github.com/weibocom/motan-openresty). It used motan-go as an interpreter and the Simple serialization scheme to serialize the Body of protocol message. (Simple is a comparably weaker serialization scheme)



![image.png | left | 747x300](https://cdn.nlark.com/lark/0/2018/png/128723/1534161514042-6189386b-720e-40d1-9be4-621af5090da8.png "")


After observation we find out that there is no big difference between the configuration of Motan2 and the dual protocol. It’s just that the agent here is implicit, and it co-exists with the main service. The most obvious difference is that different languages do not interact directly in agent scheme.

#### Dubbo for cross-language support

Instead of cross-language support, the dubbo protocol was originally designed only for common rpc requests. However, it’s not always the case that we can only choose to support it or not. We can always choose to offer different levels of support. It may be hard to offer cross-language support based on the dubbo protocol, but not impossible. Actually, Qianmi website succeeded. It conquered the front-end cross-language business field built by nodejs with dubbo2.js. It builds the bridge between Nodejs and the native dubbo protocol. Next, we will focus on what we can do with dubbo2.js.

##### Dubbo protocol message format:


![image.png | left | 747x214](https://cdn.nlark.com/lark/0/2018/png/128723/1534165611470-e3eda448-7e5c-4ad4-9401-f55086f5ee2e.png "")


Details in dubbo protocol header message:

* Magic: similar to magic number in Java bytes code files, which is used to determine whether it is a data pack of dubbo protocol. The magic number is the constant, 0xdabb.
* Flag: contains 8 bits. The lower four bits are used to indicate the type of serialization tool used for message body data (default hessian). Among the upper four bits, the 1 at first bit indicates request, the 1 at second bit indicates dual transfer, 1 at third bits indicates the heartbeat.
* Status: used toset response status. Dubbo defines some types for response. Details can be found in <span data-type="color" style="color:rgb(36, 41, 46)"><span data-type="background" style="background-color:rgba(27, 31, 35, 0.05)">com.alibaba.dubbo.remoting.exchange.Response</span></span>
* Invoke id: Message id,Type long, Unique indentifier for each request (Due to asynchronous communication, it is used to match the request to the corresponding returned response)
* Body length: message body length, type int,record bytes of body content.
* Body content: request param, where serializedresponse parameters are stored. 

<span data-type="color" style="color:#212121">Protocol messages will eventually become bytes and be transmitted using TCP. Any language that supports network modules and has a socket will be able to be communicatedwith. Then, why cross-language support is difficult? There are two main obstaclesin calling service in Java using other languages:</span>

1. <span data-type="color" style="color:#24292E">How </span><span data-type="color" style="color:#212121">can different languages ​​represent data types in java, especially dynamiclanguages with possible non-strict data types</span>?
2. <span data-type="color" style="color:#24292E">How to serialize string across language?</span>

## How does dubbo2.js solve problems?

---


<span data-type="color" style="color:rgb(33, 33, 33)"><span data-type="background" style="background-color:rgb(255, 255, 255)">We have analyzed two obstacles above. The key to dubbo2.js in solving these two problems depends on two class libraries: </span></span>[js-to-java](https://github.com/node-modules/js-to-java)，[hessian.js](https://github.com/node-modules/hessian.js)<span data-type="color" style="color:rgb(33, 33, 33)"><span data-type="background" style="background-color:rgb(255, 255, 255)">. js-to-java, which makes nodejs have the ability to express Java objects. Hessian.js provides serialization capabilities. With the help of nodejs socket,  and a duplicate set of dubbo protocol message format, we can finally achieve nodejs call to java-dubbo-provider.</span></span>


## <span data-type="color" style="color:#24292E">Quick Start</span>

---

<span data-type="color" style="color:rgb(33, 33, 33)"><span data-type="background" style="background-color:rgb(255, 255, 255)">To give an intuitive feeling to readers interested in dubbo2.js, this section presents a quick start example that shows how easy it is to call dubbo service using dubbo2.js.</span></span>

### <span data-type="color" style="color:#24292E">1. Initiate dubbo-java-provider</span>
<span data-type="color" style="color:#24292E">Java provides the backend dubbo service. Firstly, let’s define the service interface:</span>
```java
public interface DemoProvider {
    String sayHello(String name);
    String echo() ;
    void test();
    UserResponse getUserInfo(UserRequest request);
}
```

<span data-type="color" style="color:#24292E">Then we implement the interface: </span>
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

After that,<span data-type="color" style="color:#24292E"> we expose the dubbo service with xml files:</span>

```java
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:dubbo="http://code.alibabatech.com/schema/dubbo"
       xmlns="http://www.springframework.org/schema/beans"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-2.5.xsd
   http://code.alibabatech.com/schema/dubbo http://code.alibabatech.com/schema/dubbo/dubbo.xsd">

    <!-- dubbo provider info, used to compute dependency -->
    <dubbo:application name="demo-provider"/>

    <dubbo:registry protocol="zookeeper" address="localhost:2181"/>

    <!-- dubbo protocol, used to expose service at port 20880 -->
    <dubbo:protocol name="dubbo" port="20880"/>

    <!-- realize a service as a local bean -->
    <bean id="demoProvider" class="com.alibaba.dubbo.demo.provider.DemoProviderImpl"/>

    <!-- claim for service interfaces to expose -->
    <dubbo:service interface="com.alibaba.dubbo.demo.DemoProvider" ref="demoProvider" version="1.0.0"/>

</beans>
```

After we implemented all the configurations on server side, initiate an object initiater to register a dubbo service locally:

```java
public class Provider {
    public static void main(String[] args) throws Exception {
        ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext(new String[]{"META-INF/spring/dubbo-demo-provider.xml"});
        context.start();
        System.in.read();
    }
}
```

### 2. Implement dubbo client-side for nodejs
<span data-type="color" style="color:#24292E">Install dubbo2.js using npm:</span>
```java
npm install dubbo2.js --save
```

<span data-type="color" style="color:rgb(36, 41, 46)"><span data-type="background" style="background-color:rgb(255, 255, 255)">Configure dubboConfig.ts:</span></span>
```java
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

> Using typescript brings better coding experience.
Implement caller class main.ts：

```java
import {demoService} from './dubboConfig'

demoService.sayHello('kirito').then(({res,err})=>{
    console.log(res)
});
```

### 3. Call main.ts:
Run nodejs client in Debug mode:
```java
DEBUG=dubbo* ts-node main.ts
```

Checkout running results:
```java
Hello kirito, response form provider: 172.19.6.151:20880
```

<span data-type="color" style="color:rgb(36, 41, 46)"><span data-type="background" style="background-color:rgb(255, 255, 255)">Congratulations！</span></span>

## <span data-type="color" style="color:#24292E">Features</span>

---

* <span data-type="color" style="color:#24292E">Support zookeeper as register center</span>
* Support TCP Dubbo Native protocol
* Support directly Dubbo connection
* Support link tracing
* <span data-type="color" style="color:#24292E">Generate dubbo interface Automatically</span>

## More details

---

<span data-type="color" style="color:rgb(33, 33, 33)"><span data-type="background" style="background-color:rgb(255, 255, 255)">The sample code in this article is available here, </span></span>[https://github.com/lexburner/Dubbojs-Learning](https://github.com/lexburner/Dubbojs-Learning).
<span data-type="color" style="color:rgb(33, 33, 33)"><span data-type="background" style="background-color:rgb(255, 255, 255)">If you don&#x27;t know much about the dubbo protocol and want to understand how it works, the project provides a sub-moudle: java-socket-consumer, which is implemented in a process-oriented approach, realizing a process of sending dubbo protocal message with native socket and making function calls, and then get response.</span></span>


