---
type: docs
title: "通过API方式指定IP调用"
linkTitle: "指定IP调用"
weight: 3
description: "提供Api的方式指定IP进行Dubbo调用"
---

适用场景：主要用于接口测试，用户可以通过Api方式指定ip和port对指定服务器上的provider进行调用。

该方式相较于参数配置，更加的动态。

## 用法示例

- consumer demo

```java
// 需要依赖的class
import org.apache.dubbo.rpc.RpcContext;
import org.apache.dubbo.rpc.cluster.router.address.Address;
    
@RestController
public class TestServiceConsumer {
    @Reference(check = false,interfaceClass = TestService.class)
    private TestService testService;

    @GetMapping("/invokeByIp")
    public String invokeByIp(){
        try {
            // 根据provider的ip,port创建Address实例
            Address address = new Address("10.220.39.167", 20880);
            RpcContext.getContext().setObjectAttachment("address", address);
            Integer sum = testService.sum(1, 1);
            return String.valueOf(sum);
        }catch (Throwable ex){
            return ex.getMessage();
        }
    }
}
```

- 执行

```
curl http://localhost:8081/invokeByIp
```