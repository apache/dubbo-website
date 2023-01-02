---
type: docs
title: "Call trigger event notification"
linkTitle: "Call trigger event notification"
weight: 8
description: "Event notification when an exception occurs before and after the call"
---
## Feature description
Before calling, after calling, and when an exception occurs, three events `oninvoke`, `onreturn`, and `onthrow` will be triggered. You can configure which method of which class to notify when an event occurs.

## Reference use case

[https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-notify](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-notify)

## scenes to be used

Before calling the service method, we can record the start time, and after the call ends, we can count the entire call cost. When an exception occurs, we can warn or print error logs, or record request logs and response logs before and after calling the service.

## How to use

### Service provider and consumer share service interface

```java
interface IDemoService {
    public Person get(int id);
}
```
### Service provider implementation

```java
class NormalDemoService implements IDemoService {
    public Person get(int id) {
        return new Person(id, "charles`son", 4);
    }
}
```

### Service provider configuration

```xml
<dubbo:application name="rpc-callback-demo" />
<dubbo:registry address="zookeeper://127.0.0.1:2181"/>
<bean id="demoService" class="org.apache.dubbo.callback.implicit.NormalDemoService" />
<dubbo:service interface="org.apache.dubbo.callback.implicit.IDemoService" ref="demoService" version="1.0.0" group="cn"/>
```
### Service consumer Callback interface

```java
interface Notify {
    public void onreturn(Person msg, Integer id);
    public void onthrow(Throwable ex, Integer id);
}
```

### Service consumer Callback implementation

```java
class NotifyImpl implements Notify {
    public Map<Integer, Person> ret = new HashMap<Integer, Person>();
    public Map<Integer, Throwable> errors = new HashMap<Integer, Throwable>();
    
    public void onreturn(Person msg, Integer id) {
        System.out.println("onreturn:" + msg);
        ret. put(id, msg);
    }
    
    public void onthrow(Throwable ex, Integer id) {
        errors. put(id, ex);
    }
}
```

### Service consumer Callback configuration

There are the following combinations of the two:

* Asynchronous callback mode: `async=true onreturn="xxx"`
* Synchronous callback mode: `async=false onreturn="xxx"`
* Asynchronous without callback: `async=true`
* Synchronous without callback: `async=false`

`callback` and `async` function are decomposed orthogonally, `async=true` indicates whether the result is returned immediately, `async=false` is the default, `onreturn` indicates whether a callback is required.
```xml
<bean id="demoCallback" class = "org.apache.dubbo.callback.implicit.NotifyImpl" />
<dubbo:reference id="demoService" interface="org.apache.dubbo.callback.implicit.IDemoService" version="1.0.0" group="cn">
      <dubbo:method name="get" async="true" onreturn = "demoCallback.onreturn" onthrow="demoCallback.onthrow" />
</dubbo:reference>
```


### Test code

```java
IDemoService demoService = (IDemoService) context. getBean("demoService");
NotifyImpl notify = (NotifyImpl) context. getBean("demoCallback");
int requestId = 2;
Person ret = demoService. get(requestId);
Assert.assertEquals(null, ret);
//for Test: It is only used to illustrate that the callback is called normally, and the specific implementation of the business is determined by itself.
for (int i = 0; i < 10; i++) {
    if (!notify.ret.containsKey(requestId)) {
        Thread. sleep(200);
    } else {
        break;
    }
}
Assert.assertEquals(requestId, notify.ret.get(requestId).getId());
```