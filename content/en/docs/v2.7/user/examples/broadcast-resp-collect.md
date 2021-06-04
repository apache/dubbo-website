---
type: docs
title: "Collect Broadcast Responses"
linkTitle: "Collect Broadcast Responses"
weight: 3
description: "Dubbo broadcast2 broadcast mode collects port responses from all providers"
---

Applicable scenario: for any Dubbo consumer, broadcast calls multiple service providers. The consumer is able to collect responses from all of the providers. 

## Demo

- consumer demo

@Reference imports providers. Within the brackets, letting cluster = "broadcast2" represents doing one broadcast call that collects providers' responses. 

Broadcast calls all service providers one by one. Regardless of whether errors are reported on the providers' side, broadcast always returns success and stores 
providers' responses in RpcContext. 

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

- execution outcome

All providers succeed:

```
>curl http://localhost:8081/health
>{broadcast.results=[{"ip":"10.220.47.253","port":20880,"data":"i am provider1"},{"ip":"10.220.47.253","port":20881,"data":"i am provider2"}]}|success%  
```

Let one of the providers divide by zero:

```
>curl http://localhost:8081/health
>{broadcast.results=[{"ip":"10.220.47.253","port":20880,"data":"i am provider1"},{"ip":"10.220.47.253","port":20881,"exceptionMsg":"/ by zero"}]}|success%     
```
