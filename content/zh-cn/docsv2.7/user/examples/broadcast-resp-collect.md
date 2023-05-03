---
aliases:
    - /zh/docsv2.7/user/examples/broadcast-resp-collect/
description: Dubbo broadcast2 广播模式收集所有服务提供者的接口响应
linkTitle: 收集广播响应
title: 收集Dubbo广播响应
type: docs
weight: 15
---


## 背景
适用场景：对于一个dubbo消费者，广播调用多个dubbo 提供者，该消费者可以收集所有服务提供者的响应结果。

{{% alert title="提示" color="primary" %}}
支持版本：`2.7.12` 之后
{{% /alert %}}

## 示例

- consumer demo

@Reference引入服务提供者，其中，令cluster="broadcast2"，代表进行一个收集响应结果的广播调用。

广播调用所有服务提供者，逐个调用，并且可以完整的返回所有服务提供者的执行结果(正确或异常)，并将所有服务提供者的响应结果存于RpcContext。

```java
@RestController
public class TestServiceConsumer {

    @Reference(interfaceClass = DubboHealthService.class,cluster = "broadcast2")
    private DubboHealthService dubboHealthService;
    
     @GetMapping("/health")
         public String broadCast(){
             try{
                 dubboHealthService.health();
             }catch (Exception e){
                 Map<String, String> m = RpcContext.getServerContext().getAttachments();
                 return m.toString()+"|"+"fail";
             }
             Map<String, String> m = RpcContext.getServerContext().getAttachments();
             return m.toString()+"|"+"success";
         }
}
```

- provider demo

```java
@Service
public class DubboHealthServiceImpl implements DubboHealthService {

    @Override
    public String health() {
//        int i = 1/0;
        return "i am provider2";
    }
}
```

- 执行结果

所有provider全部成功：

```
>curl http://localhost:8081/health
>{broadcast.results=[{"ip":"10.220.47.253","port":20880,"data":"i am provider1"},{"ip":"10.220.47.253","port":20881,"data":"i am provider2"}]}|success%  
```

令其中一个provider执行除以零：

```
>curl http://localhost:8081/health
>{broadcast.results=[{"ip":"10.220.47.253","port":20880,"data":"i am provider1"},{"ip":"10.220.47.253","port":20881,"exceptionMsg":"/ by zero"}]}|success%     
```