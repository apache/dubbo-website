---
title: "Local Stubs and Local Mocks"
linkTitle: "Local Stubs and Local Mocks"
tags: ["Java"]
date: 2019-10-22
description: This article introduces the usage of local stubs and local mocks in Dubbo.
---


## Basic Concepts

A typical RPC calling client relies solely on interface programming for remote calls. Before making a remote call, users often need to pre-process, such as parameter verification. After obtaining the return result, users may need to cache the results or construct fallback data in case of failure, rather than simply throwing exceptions.

At this point, users can write code similar to the following to handle these scenarios:

```java
try {
    preProcess();
    return service.invoke(...);
} catch (Throwable e) {
    return mockValue;
} finally {
    postProcess();
}
```


Similarly, users can use advanced techniques like Aspect-Oriented Programming *AOP* to address the above requirements. Using *Spring AOP*, configurations similar to the following can be completed. Using *AOP* techniques facilitates a cleaner business logic by avoiding unrelated error handling code as seen in the above code.

```xml
<bean id="demo-service-stub" class="org.apache.dubbo.demo.DemoServiceStub"/>
<bean id="demo-service-mock" class="org.apache.dubbo.demo.DemoServiceMock"/>
<aop:config>
    <aop:aspect id="stub" ref="demo-service-stub">
        <aop:pointcut id="stubPointcut" expression="execution(* org.apache.dubbo.samples.DemoService+.*(..))"/>
        <aop:before method="preProcess" pointcut-ref="stubPointcut"/>
        <aop:after-returning method="postProcess" pointcut-ref="stubPointcut"/>
    </aop:aspect>
    <aop:aspect id="mock" ref="demo-service-mock">
        <aop:pointcut id="mockPointcut" expression="execution(* org.apache.dubbo.samples.DemoService+.*(..))"/>
        <aop:after-throwing method="mock" pointcut-ref="mockPointcut"/>
    </aop:aspect>
</aop:config>
```


To further facilitate Dubbo development, the framework introduces the concepts of local stubs *Stub* and local mocks *Mock*. The principle of convention over configuration simplifies configurations further, making usage more convenient, achieving *AOP* effects without relying on an external *AOP* framework.
  
The working mechanism of local stubs is similar to the **around** advice in *AOP*, while the method of local mocks corresponds to the **after-throwing** advice in *AOP*, meaning local mocks are only executed when a remote call results in an *exception*. The workflow of local stubs and mocks is illustrated below:

![dubbo-mock-stub-flow](/imgs/blog/dubbo-mock-stub-flow.png)


1. The service consumer initiates a call
2. If a local stub exists on the consumer side, it will execute the local stub first
3. The local stub holds the *Proxy* object of the remote service. When it executes, it first runs its own logic (*before*), then initiates the remote call through the *Proxy*, and finally runs its logic again before the return (*after-returning*)
4. If the remote service's *Proxy* object throws an *exception* during execution, the consumer's local mock logic (*after-throwing*) will be executed, returning fallback data to achieve service degradation.


## Developing a Local Stub

Local stubs are provided by users and deployed on the consumer side. A complete example can be found here [^stub-samples].

```java
public class DemoServiceStub implements DemoService { // #1
    private static Logger logger = LoggerFactory.getLogger(DemoServiceStub.class);

    private final DemoService demoService;

    public DemoServiceStub(DemoService demoService) { // #2
        this.demoService = demoService;
    }

    @Override
    public String sayHello(String name) { // #3
        logger.info("before execute remote service, parameter: " + name); // #4
        try {
            String result = demoService.sayHello(name); // #5
            logger.info("after execute remote service, result: " + result); // #6
            return result;
        } catch (Exception e) {
            logger.warn("fail to execute service", e); // #7
            return null;
        }
    }
}
```

To work with the framework, the implementation of the local stub needs to follow some conventions established by the framework:

1. Local stubs are implementations of the service interface.
2. The implementation of the local stub must provide a copy constructor to allow the framework to inject the remote call's *Proxy* object.
3. Similarly, the local stub must implement all methods from the service interface. In this example, the *sayHello* method needs to be implemented.
4. Before making the actual remote call, the user can perform some operations locally. In this example, it logs the incoming parameter.
5. The real remote call is initiated through the *Proxy* object provided by the framework.
6. After the remote call ends, local code execution can also be added. In this example, it logs the return value of the remote call.
7. If an error occurs, some error recovery actions can also be performed. In this case, the exception is logged. Of course, if a local mock is provided, the logic in *catch* can be omitted.

Steps 4, 6, and 7 collectively build a concept equivalent to AOP concepts, corresponding to **before**, **after-returning**, and **after-throwing** respectively.

*DemoServiceStub* runs on the client side. To use the local stub, the property *stub* needs to be configured in *stub-consumer.xml*. This can simply be done by specifying *stub="true"* to tell the Dubbo framework to use the local stub. At this point, the package name of the local stub must match that of the service interface, and the class name must append **Stub** to the service interface's class name. For instance, when the service interface name is *org.apache.dubbo.samples.stub.api.DemoService*, the full class name of the local stub should be *org.apache.dubbo.samples.stub.api.DemoServiceStub*.

```xml
<dubbo:reference id="demoService" check="false" interface="org.apache.dubbo.samples.stub.api.DemoService" stub="true"/>
```

If you do not want to use the default naming rule, you can directly specify the full class name of the local stub through the *stub* property.

```xml
<dubbo:reference id="demoService" check="false" interface="org.apache.dubbo.samples.stub.api.DemoService" stub="org.apache.dubbo.samples.stub.impl.DemoStub"/>
```

After starting the service side *StubProvider*, run the client *StubConsumer*, and you can verify the local stub's operational results by observing the client's logs.

```bash
[09/04/19 11:52:21:021 CST] main  INFO api.DemoServiceStub: before execute remote service, parameter: dubbo
[09/04/19 11:52:21:021 CST] main  INFO api.DemoServiceStub: after execute remote service, result: greeting dubbo
[09/04/19 11:52:21:021 CST] main  INFO stub.StubConsumer: result: greeting dubbo
```


## Developing a Local Mock

Local mocks are typically used for service degradation in case of errors during remote calls. A complete example can be found here [^mock-samples].

Here we simulate a timeout by making the service provider's code sleep, thereby executing the local mock to handle fault tolerance.

```java
public class DemoServiceImpl implements DemoService {
    public String sayHello(String name) {
        try {
            Thread.sleep(5000); // #1
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        return "hello " + name; // #2
    }
}
```

1. The default timeout in Dubbo is *1000 ms*; sleeping for *5000ms* triggers a timeout exception.
2. Due to the timeout, this result will not be returned to the client, replaced instead with *org.apache.dubbo.remoting.TimeoutException*.

On the client side, provide a local mock implementation. When a remote call fails, the response returned to the caller is not "hello name" from the server side, but "mock name" instead.

```java
public class DemoServiceMock implements DemoService {
    private static Logger logger = LoggerFactory.getLogger(DemoServiceMock.class);

    public String sayHello(String name) {
        logger.warn("about to execute mock: " + DemoServiceMock.class.getSimpleName());
        return "mock " + name;
    }
}
```

Similarly, to use the local mock, the property *mock* needs to be configured in *mock-consumer.xml*. This is simply done by specifying *mock="true"* to tell the Dubbo framework to use the local mock. At this time, the package name of the local mock must match that of the service interface, and the class name must append **Mock** to the service interface's class name. For a service interface named *org.apache.dubbo.samples.stub.api.DemoService*, the full class name of the local mock should be *org.apache.dubbo.samples.stub.api.DemoServiceMock*.

```xml
    <dubbo:reference id="demoService" check="false" interface="org.apache.dubbo.samples.mock.api.DemoService"
                     mock="true"/>
```

If you'd rather not use the default naming convention, you can directly specify the full class name of the local mock via the *mock* property.

```xml
<dubbo:reference id="demoService" check="false" interface="org.apache.dubbo.samples.mock.api.DemoService" mock="org.apache.dubbo.samples.mock.impl.DemoMock"/>
```

By providing a local mock class, you can exert maximum control over the fault tolerance logic after an error occurs. Sometimes, there's no need for such flexible mechanisms in business, just a request to return a default value. In such cases, implementing a complete local mock becomes overly complicated. Alternatively, when an error occurs online, and the application hasn't packaged the local mock, service degradation needs to be implemented through push rules. The Dubbo framework provides quick solutions for both scenarios, aiding users in rapid service degradation configuration.

After starting the service-side *MockProvider*, execute *MockConsumer* to view the results:

```bash
Caused by: org.apache.dubbo.remoting.TimeoutException: Waiting server-side response timeout by scan timer. start time: 2019-04-09 14:20:48.061, end time: 2019-04-09 14:20:49.077, client elapsed: 0 ms, server elapsed: 1015 ms, timeout: 1000 ms, request: Request [id=2, version=2.0.2, twoway=true, event=false, broken=false, data=RpcInvocation [methodName=sayHello, parameterTypes=[class java.lang.String], arguments=[world], attachments={path=org.apache.dubbo.samples.mock.api.DemoService, interface=org.apache.dubbo.samples.mock.api.DemoService, version=0.0.0}]], channel: /30.5.125.99:56433 -> /30.5.125.99:20880
	at org.apache.dubbo.remoting.exchange.support.DefaultFuture.returnFromResponse(DefaultFuture.java:295)
	at org.apache.dubbo.remoting.exchange.support.DefaultFuture.get(DefaultFuture.java:191)
	at org.apache.dubbo.remoting.exchange.support.DefaultFuture.get(DefaultFuture.java:164)
	at org.apache.dubbo.rpc.protocol.dubbo.DubboInvoker.doInvoke(DubboInvoker.java:108)
	at org.apache.dubbo.rpc.protocol.AbstractInvoker.invoke(AbstractInvoker.java:157)
	at org.apache.dubbo.monitor.support.MonitorFilter.invoke(MonitorFilter.java:88)
	at org.apache.dubbo.rpc.protocol.ProtocolFilterWrapper$1.invoke(ProtocolFilterWrapper.java:73)
	at org.apache.dubbo.rpc.protocol.dubbo.filter.FutureFilter.invoke(FutureFilter.java:49)
	at org.apache.dubbo.rpc.protocol.ProtocolFilterWrapper$1.invoke(ProtocolFilterWrapper.java:73)
	at org.apache.dubbo.rpc.filter.ConsumerContextFilter.invoke(ConsumerContextFilter.java:54)
	at org.apache.dubbo.rpc.protocol.ProtocolFilterWrapper$1.invoke(ProtocolFilterWrapper.java:73)
	at org.apache.dubbo.rpc.listener.ListenerInvokerWrapper.invoke(ListenerInvokerWrapper.java:78)
	at org.apache.dubbo.rpc.protocol.InvokerWrapper.invoke(InvokerWrapper.java:56)
	at org.apache.dubbo.rpc.cluster.support.FailoverClusterInvoker.doInvoke(FailoverClusterInvoker.java:80)
	... 5 more
[09/04/19 02:20:49:049 CST] main  WARN api.DemoServiceMock: about to execute mock: DemoServiceMock
[09/04/19 02:20:49:049 CST] main  INFO mock.MockConsumer: result: mock world
```


The following example illustrates the use of push rules for quick configuration; for more usages, please refer to the official Dubbo user manual [^mock]. By pushing the specified service configuration to the configuration center, dynamic service degradation can be achieved.

```yaml
--- # 1
configVersion: v2.7
scope: service
  key: org.apache.dubbo.samples.mock.api.DemoService #2
  enabled: true
  configs:
    - addresses: [0.0.0.0]
      side: consumer #3
      parameters:
        mock: return configured-mock-value #4
      ...
```

1. Using *Zookeeper* as an example, the path for the rule is /dubbo/config/org.apache.dubbo.samples.mock.api.DemoService/configurators
2. This rule applies to the *org.apache.dubbo.samples.mock.api.DemoService* service
3. This rule applies on the client-side
4. When an error occurs, the service call returns the default value *configured-mock-value*


After starting the server-side *MockProvider*, execute the example [^mock-samples] with *Configurator* to complete the service degradation rule configuration, then run *MockConsumer* to see the results:

```bash
[09/04/19 02:19:01:001 CST] main  INFO integration.AbstractConfiguratorListener:  [DUBBO] Notification of overriding rule, change type is: MODIFIED, raw config content is:
 ---
configVersion: v2.7
scope: service
key: org.apache.dubbo.samples.mock.api.DemoService
enabled: true
configs:
- addresses: [0.0.0.0]
  side: consumer
  parameters:
    mock: return configured-mock-value
...
, dubbo version: 2.7.1, current host: 30.5.125.99

...

Caused by: org.apache.dubbo.remoting.TimeoutException: Waiting server-side response timeout. start time: 2019-04-09 14:19:03.737, end time: 2019-04-09 14:19:04.741, client elapsed: 1 ms, server elapsed: 1002 ms, timeout: 1000 ms, request: Request [id=2, version=2.0.2, twoway=true, event=false, broken=false, data=RpcInvocation [methodName=sayHello, parameterTypes=[class java.lang.String], arguments=[world], attachments={path=org.apache.dubbo.samples.mock.api.DemoService, interface=org.apache.dubbo.samples.mock.api.DemoService, version=0.0.0}]], channel: /30.5.125.99:56412 -> /30.5.125.99:20880
	at org.apache.dubbo.remoting.exchange.support.DefaultFuture.get(DefaultFuture.java:188)
	at org.apache.dubbo.remoting.exchange.support.DefaultFuture.get(DefaultFuture.java:164)
	at org.apache.dubbo.rpc.protocol.dubbo.DubboInvoker.doInvoke(DubboInvoker.java:108)
	at org.apache.dubbo.rpc.protocol.AbstractInvoker.invoke(AbstractInvoker.java:157)
	at org.apache.dubbo.monitor.support.MonitorFilter.invoke(MonitorFilter.java:88)
	at org.apache.dubbo.rpc.protocol.ProtocolFilterWrapper$1.invoke(ProtocolFilterWrapper.java:73)
	at org.apache.dubbo.rpc.protocol.dubbo.filter.FutureFilter.invoke(FutureFilterWrapper.java:49)
	at org.apache.dubbo.rpc.protocol.ProtocolFilterWrapper$1.invoke(ProtocolFilterWrapper.java:73)
	at org.apache.dubbo.rpc.filter.ConsumerContextFilter.invoke(ConsumerContextFilter.java:54)
	at org.apache.dubbo.rpc.protocol.ProtocolFilterWrapper$1.invoke(ProtocolFilterWrapper.java:73)
	at org.apache.dubbo.rpc.listener.ListenerInvokerWrapper.invoke(ListenerInvokerWrapper.java:78)
	at org.apache.dubbo.rpc.protocol.InvokerWrapper.invoke(InvokerWrapper.java:56)
	at org.apache.dubbo.rpc.cluster.support.FailoverClusterInvoker.doInvoke(FailoverClusterInvoker.java:80)
	... 5 more
[09/04/19 02:19:04:004 CST] main  INFO mock.MockConsumer: result: configured-mock-value
```


## Summary

This article introduces the concepts and usage of local stubs and local mocks in Dubbo. Essentially, local stubs and local mocks are equivalent to the concepts found in aspect-oriented programming. The same goals can be achieved through *AOP* programming provided by frameworks such as Spring. Readers can intuitively feel the convenience and speed offered by the framework through examples of developing a local stub and local mock. Furthermore, for many simple scenarios and dynamic configuration push scenarios, the framework provides ways to achieve this through configuration without coding, enhancing the efficiency of framework users.

[^stub-samples]: https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-stub
[^mock-samples]:  https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-mock
[^mock]: https://cn.dubbo.apache.org/zh-cn/docsv2.7/user/examples/local-mock/

