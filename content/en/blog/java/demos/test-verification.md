---
title: "Dubbo Testing Validation"
linkTitle: "Dubbo Testing Validation"
tags: ["Java"]
date: 2019-12-02
description: >
    Validation tests for features under development or calling services from a specific machine
---

In addition to the usual online usage scenarios, we also need some specific usage methods in our daily use, such as validating features under development or calling services from a specific machine. This article introduces the usage methods in these scenarios.

### Subscribe Only  
To facilitate development testing, an all-service available registry is often shared in offline environments. If a service provider under development registers, it may affect the proper functioning of consumers.

The service provider's development team can subscribe only to the service (as the developed service may depend on other services), without registering the service under development, testing the developing service through a direct connection.     
![subscribe-only](/imgs/blog/subscribe-only.jpg)
Disable registration configuration

    <dubbo:registry address="10.20.153.10:9090" register="false" />
or

    <dubbo:registry address="10.20.153.10:9090?register=false" />

### Specify IP for Calling  
In development and testing environments, we often need to bypass the registry and test specific service providers. This may require point-to-point connections, where point-to-point connections ignore the provider list from the registry and configure point-to-point for service interfaces, without affecting other interfaces from retrieving lists from the registry.  
![subscribe-only](/imgs/blog/dubbo-directly.jpg)

You can specify IP calling through the following configurations:   

* XML configuration: If point-to-point is required in the online demand, you can configure the URL pointing to the provider in `<dubbo:reference>`, which will bypass the registry, with multiple addresses separated by semicolons, as follows:
    `<dubbo:reference id="xxxService" interface="com.alibaba.xxx.XxxService" url="dubbo://localhost:20890" />`   
* Specify using -D parameter: Add -D parameter to JVM startup parameters to map service address, e.g., `java -Dcom.alibaba.xxx.XxxService=dubbo://localhost:20890`  
* File mapping: If there are many services, file mapping can be used; specify the mapping file path using -Ddubbo.resolve.file. This configuration takes precedence over the one in `<dubbo:reference>`, like:
`java -Ddubbo.resolve.file=xxx.properties`  
Then add the configuration in the mapping file xxx.properties, where the key is the service name and the value is the service provider URL: `com.alibaba.xxx.XxxService=dubbo://localhost:20890`  

### Echo Testing
#### Usage  
Echo testing is used to check the availability of services. It executes according to the normal request process, allowing testing of the whole call flow and can be used for monitoring.

All services automatically implement the EchoService interface. You just need to force any service reference to be cast to EchoService to use it.

Spring Configuration:

    <dubbo:reference id="memberService" interface="com.xxx.MemberService" />
Code:

```
// Remote service reference
MemberService memberService = ctx.getBean("memberService"); 
 
EchoService echoService = (EchoService) memberService; // Force cast to EchoService

// Echo test availability
String status = echoService.$echo("OK"); 
 
assert(status.equals("OK"));
```  
#### Implementation Principle  
When we implemented the registration of services, we did not configure the EchoService interface. Why can it be used directly? It turns out that Dubbo generates the proxy by already implementing the `EchoService interface`    

```java
  @Override
    public <T> T getProxy(Invoker<T> invoker) throws RpcException {
        Class<?>[] interfaces = null;
        String config = invoker.getUrl().getParameter("interfaces");
        if (config != null && config.length() > 0) {
            String[] types = Constants.COMMA_SPLIT_PATTERN.split(config);
            if (types != null && types.length > 0) {
                interfaces = new Class<?>[types.length + 2];
                interfaces[0] = invoker.getInterface();
                interfaces[1] = EchoService.class;
                for (int i = 0; i < types.length; i++) {
                    interfaces[i + 1] = ReflectUtils.forName(types[i]);
                }
            }
        }
        if (interfaces == null) {
            interfaces = new Class<?>[]{invoker.getInterface(), EchoService.class};
        }
        return getProxy(invoker, interfaces);
    }
```  
In this way, any bean can be converted into an instance of EchoService, but the method `$echo` is not implemented. Here, Dubbo uses the filter mechanism to handle it:  

```java
public class EchoFilter implements Filter {

    @Override
    public Result invoke(Invoker<?> invoker, Invocation inv) throws RpcException {
        if (inv.getMethodName().equals(Constants.$ECHO) && inv.getArguments() != null && inv.getArguments().length == 1)
            return new RpcResult(inv.getArguments()[0]);
        return invoker.invoke(inv);
    }

}
```
When passing through the EchoFilter.invoke method, if the call is `$echo`, it will interrupt the current call process and directly return the argument of `$echo`; otherwise, it will continue to execute the filter chain. Through dynamic proxy and the EchoFilter mechanism, the entire echo testing process is transparent to the user, requiring no additional configuration; it can be called directly.

