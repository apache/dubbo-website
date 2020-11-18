---
type: docs
title: "Delay Publish"
linkTitle: "Delay Publish"
weight: 27
description: "Delay publish dubbo service"
---

If your services need time to warm up, such as: initialization cache or another reference resources has to be ready. You can use the delay feature to delay publishing services. We fine-tuned the service delay exposure logic in Dubbo 2.6.5, delaying the countdown of services that require delayed exposure until Spring initialization is complete. You won't be aware of this change while using Dubbo, so please be assured that use.


{{% alert title="Notice" color="primary" %}}
Prior to Dubbo-2.6.5
{{% /alert %}}

### Delay five second publish

```xml
<dubbo:service delay="5000" />
```

### Delay until Spring initialization is complete before exposing the service
```xml
<dubbo:service delay="-1" />
```

{{% alert title="Notice" color="primary" %}}
Dubbo-2.6.5 and later
{{% /alert %}}

All services will be exposed after Spring initialization is complete, and you don't need to configure delay if you don't need to delay exposing the service.

### Delay five second publish

```xml
<dubbo:service delay="5000" />
```

## The initialization deadlock problem of Spring 2.x

### Trigger condition

The service has already published when `Spring` parse the `<dubbo:service />` element,but the `Spring` is still initializing other beans.If there is a request coming in, and the service implementation class has a call to `applicationContext.getBean ()` usage.

1. Request thread applicationContext.getBean() call, the first synchronization `singletonObjects` determine whether the existence of the bean, the synchronization does not exist to initialize the `beanDefinitionMap`, and re-synchronize `singletonObjects` write Bean instance cache.

    ![deadlock](/imgs/user/lock-get-bean.jpg)  

2. But the `Spring` initialization thread,because need to determine the `Bean` is exist,Directly synchronize beanDefinitionMap to initialize, and synchronize singletonObjects write Bean instance cache.

    ![/user-guide/images/lock-init-context.jpg](/imgs/user/lock-init-context.jpg)  

This will cause the getBean thread to lock the singletonObjects first, then lock the beanDefinitionMap, and lock the singletonObjects again.The Spring initialization thread, the first lock beanDefinitionMap, then lock singletonObjects. Reverse lock thread deadlock, can not provide services, can not start.

### Avoid ways

1. It is highly recommended not to call applicationContext.getBean() in the service implementation class, all using Spring's beans using IoC injection.
2. If you really want to tune getBean(), you can put the configuration of Dubbo Spring final loading.
3. If you do not want to rely on the configuration order, you can use `<dubbo:provider delay ="-1"/>` to make Dubbo expose the service after the Spring container has been initialized.
4. If you use getBean() extensively, the equivalent of degenerating Spring to factory mode is to isolate Dubbo's service from a separate Spring container.

[^1]: Base on the  `ContextRefreshedEvent` event of the  Spring to trigger publish service.
