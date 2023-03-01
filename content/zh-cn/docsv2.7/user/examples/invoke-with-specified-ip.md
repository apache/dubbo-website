---
aliases:
    - /zh/docsv2.7/user/examples/invoke-with-specified-ip/
description: 对于Provider集群中注册的多个实例，指定Ip:Port进行调用
linkTitle: 指定IP
title: 指定Ip Port调用Provider
type: docs
weight: 15
---


## 背景
当多个Provider注册到注册中心时，可以通过在RpcContext中动态的指定其中一个实例的Ip，Port进行Dubbo调用。

{{% alert title="提示" color="primary" %}}
支持版本：`2.7.12` 之后
{{% /alert %}}

## 示例

- provider demo

假定提供2个provider注册于注册中心，分别为10.220.47.253:20880;10.220.47.253:20881;

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

@DubboReference引入provider，其中设定parameters = {"router","address"},指定address路由方式。

对于要调用的实例，指定Ip，Port构造Address对象，并设置RpcContext键为"address"，value为该对象。

```java
// 需要依赖的class
import org.apache.dubbo.rpc.RpcContext;
import org.apache.dubbo.rpc.cluster.router.address.Address;
    
@RestController
public class TestServiceConsumer {
    @DubboReference(interfaceClass = TestService.class,group = "dev",parameters = {"router","address"})
    private TestService testService;

   @GetMapping("/invokeByIpPortSpecified")
       public String invokeByIp(){
           try {
               // 根据provider的ip,port创建Address实例
               Address address = new Address("10.220.47.253", 20880);
               RpcContext.getContext().setObjectAttachment("address", address);
               return testService.sayHello("Tom");
           }catch (Throwable ex){
               return ex.getMessage();
           }
       }
}
```

- 执行结果

可以看到，多次执行，始终返回"Hello Tom i am provider1",即始终路由到20880端口所在实例。

```
>curl http://localhost:8081/invokeByIpPortSpecified
>Hello Tom i am provider1             
```