---
aliases:
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/service/events-notify/
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/service/events-notify/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/service/events-notify/
description: Event notifications when exceptions occur before and after calling
linkTitle: Event Notifications Triggered by Calls
title: Event Notifications Triggered by Calls
type: docs
weight: 8
---

## Feature Description
The events `oninvoke`, `onreturn`, and `onthrow` will be triggered before a call, after a call, and when an exception occurs, respectively. You can configure which class and method to notify when these events happen.

## Use Cases

Before calling the service method, we can log the start time, after the call, calculate the total time consumed, and in case of exceptions, we can trigger alerts or print error logs, or log request and response logs before and after the service call.

> Reference Case
[dubbo-samples-notify](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-notify)

## Usage

### Shared Service Interface Between Provider and Consumer

```java
interface IDemoService {
    public Person get(int id);
}
```
### Service Provider Implementation

```java
class NormalDemoService implements IDemoService {
    public Person get(int id) {
        return new Person(id, "charles`son", 4);
    }
}
```

### Service Provider Configuration

```xml
<dubbo:application name="rpc-callback-demo" />
<dubbo:registry address="zookeeper://127.0.0.1:2181"/>
<bean id="demoService" class="org.apache.dubbo.callback.implicit.NormalDemoService" />
<dubbo:service interface="org.apache.dubbo.callback.implicit.IDemoService" ref="demoService" version="1.0.0" group="cn"/>
```
### Service Consumer Callback Interface

```java
interface Notify {
    public void onreturn(Person msg, Integer id);
    public void onthrow(Throwable ex, Integer id);
}
```

### Service Consumer Callback Implementation

```java
class NotifyImpl implements Notify {
    public Map<Integer, Person>    ret    = new HashMap<Integer, Person>();
    public Map<Integer, Throwable> errors = new HashMap<Integer, Throwable>();
    
    public void onreturn(Person msg, Integer id) {
        System.out.println("onreturn:" + msg);
        ret.put(id, msg);
    }
    
    public void onthrow(Throwable ex, Integer id) {
        errors.put(id, ex);
    }
}
```

### Service Consumer Callback Configuration

The following combinations exist:

* Asynchronous Callback Mode: `async=true onreturn="xxx"`
* Synchronous Callback Mode: `async=false onreturn="xxx"`
* Asynchronous No Callback: `async=true`
* Synchronous No Callback: `async=false`

`callback` and `async` functionalities are orthogonally decomposed, where `async=true` indicates whether the result returns immediately, and `async=false` is default, while `onreturn` indicates whether a callback is needed.

```xml
<bean id ="demoCallback" class = "org.apache.dubbo.callback.implicit.NotifyImpl" />
<dubbo:reference id="demoService" interface="org.apache.dubbo.callback.implicit.IDemoService" version="1.0.0" group="cn" >
      <dubbo:method name="get" async="true" onreturn = "demoCallback.onreturn" onthrow="demoCallback.onthrow" />
</dubbo:reference>
```
 

### Test Code

```java
IDemoService demoService = (IDemoService) context.getBean("demoService");
NotifyImpl notify = (NotifyImpl) context.getBean("demoCallback");
int requestId = 2;
Person ret = demoService.get(requestId);
Assert.assertEquals(null, ret);
//for Test：used to indicate that callback is called normally, the specific implementation is left to the business.
for (int i = 0; i < 10; i++) {
    if (!notify.ret.containsKey(requestId)) {
        Thread.sleep(200);
    } else {
        break;
    }
}
Assert.assertEquals(requestId, notify.ret.get(requestId).getId());
```

