---
type: docs
title: "Delayed Exposure"
linkTitle: "Delayed Exposure"
weight: 27
description: "Delayed exposure of Dubbo services"
---

If your service needs warm-up time, such as initializing the cache, waiting for related resources to be in place, etc., you can use delay for delayed exposure. In Dubbo version 2.6.5, we made minor adjustments to the service delay exposure logic, and postponed the countdown action for services that require delay exposure (delay > 0) until Spring initialization is complete. You will not feel this change while using Dubbo, so please feel free to use it.

## Versions before Dubbo 2.6.5

Delay until Spring initialization completes before exposing services[^1]

```xml
<dubbo:service delay="-1" />
```

Expose service with 5 second delay

```xml
<dubbo:service delay="5000" />
```

## Dubbo 2.6.5 and later versions

All services will be exposed after Spring initialization is complete. If you do not need to delay exposing services, you do not need to configure delay.

Expose service with 5 second delay

```xml
<dubbo:service delay="5000" />
```

## Spring 2.x initialization deadlock problem

### Triggering conditions

When Spring resolves to `<dubbo:service />`, the service has been exposed, and Spring is still initializing other beans. If a request comes in at this time, and there is a usage of calling `applicationContext.getBean()` in the implementation class of the service.

1. The applicationContext.getBean() call of the requesting thread first synchronizes the singletonObjects to determine whether the Bean exists, and initializes the synchronization beanDefinitionMap if it does not exist, and then synchronizes the singletonObjects again to write the Bean instance cache.

   ![deadlock](/imgs/user/lock-get-bean.jpg)

2. The Spring initialization thread, because it does not need to judge the existence of the bean, directly synchronizes the beanDefinitionMap to initialize, and synchronizes singletonObjects to write the bean instance cache.

   ![/user-guide/images/lock-init-context.jpg](/imgs/user/lock-init-context.jpg)

   This causes the getBean thread to lock singletonObjects first, then beanDefinitionMap, and singletonObjects again.
   The Spring initialization thread first locks beanDefinitionMap and then singletonObjects. The reverse lock leads to thread deadlock, unable to provide services, and unable to start.

### Workaround

1. It is strongly recommended not to call applicationContext.getBean() in the service implementation class, and all use Spring beans by IoC injection.
2. If you really want to call getBean(), you can load the Dubbo configuration at the end of Spring.
3. If you don’t want to depend on the configuration order, you can use `<dubbo:provider delay=”-1” />` to make Dubbo expose the service after the Spring container is initialized.
4. If you use getBean() extensively, it is equivalent to degenerating Spring into a factory mode, and you can isolate Dubbo's services into a separate Spring container.

[^1]: Trigger exposure based on Spring's ContextRefreshedEvent event