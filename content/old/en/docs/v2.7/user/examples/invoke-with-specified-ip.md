---
type: docs
title: "Invoke provider with specified IP port"
linkTitle: "Specified IP port"
weight: 15
description: "For multiple instances registered in the provider cluster, specify Ip:Port to invoke."
---

When multiple providers are registered at the register center, dynamically specifying one of the instances’ IP through RpcContext is enabled. Port does Dubbo invoke.

{{% alert title="Notice" color="primary" %}}
support on `2.7.12` or above.
{{% /alert %}}

## Demo

- provider demo

Assume two registered providers at the register center are provided, which are 10.220.47.253:20880;10.220.47.253:20881; respectively.  

```java
// 10.220.47.253:20880
@Service(interfaceClass = TestService.class)
public class TestServiceImpl implements TestService {
    @Override
    public String sayHello(String name) {
        return "Hello "+name+" i am provider1";
    }
}
// 10.220.47.253:20881
@Service(interfaceClass = TestService.class)
public class TestServiceImpl implements TestService {
    @Override
    public String sayHello(String name) {
        return "Hello "+name+" i am provider2";
    }
}
```

- consumer demo

@DubboReference introduces provider. Setting parameters = {"router","address"} specifies routing method.

For the instance that is going to be invoked, specify its IP, construct Address object with Port and set RpcContext key as "address". Value is that object.

```java
// require dependent class
import org.apache.dubbo.rpc.RpcContext;
import org.apache.dubbo.rpc.cluster.router.address.Address;
    
@RestController
public class TestServiceConsumer {
    @DubboReference(interfaceClass = TestService.class,group = "dev",parameters = {"router","address"})
    private TestService testService;
   
    @GetMapping("/invokeByIpPortSpecified")
    public String invokeByIp(){
        try {
            // create Address instance based on provider's ip port
            Address address = new Address("10.220.47.253", 20880);
            RpcContext.getContext().setObjectAttachment("address", address);
            return testService.sayHello("Tom");
        }catch (Throwable ex){
            return ex.getMessage();
        }
    }

}
```

- execution outcome

After running the code multiple times we can see that the same "Hello Tom i am provider1" is returned. In other words, we always route to the instance where port 20880 is located. 

```
>curl http://localhost:8081/invokeByIpPortSpecified
>Hello Tom i am provider1             
```
