# Event Notify

Before calling, after calling, when an exception occurs,will trigger `oninvoke`, `onreturn`, `onthrow` events.You can configure which method to notify when an event occurs.

## Service Interface

```java
interface IDemoService {
    public Person get(int id);
}
```

## Service provider implement the service.

```java
class NormalDemoService implements IDemoService {
    public Person get(int id) {
        return new Person(id, "charles`son", 4);
    }
}
```

## Service provider configure the service which it provided.

```xml
<dubbo:application name="rpc-callback-demo" />
<dubbo:registry address="http://10.20.160.198/wiki/display/dubbo/10.20.153.186" />
<bean id="demoService" class="com.alibaba.dubbo.callback.implicit.NormalDemoService" />
<dubbo:service interface="com.alibaba.dubbo.callback.implicit.IDemoService" ref="demoService" version="1.0.0" group="cn"/>
```

##  Declare the Callback interface at service consumer-side.

```java
interface Notify {
    public void onreturn(Person msg, Integer id);
    public void onthrow(Throwable ex, Integer id);
}
```

## Implement the Callback at service consumer-side.

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

## Configure the Callback at service consumer-side.

```xml
<bean id ="demoCallback" class = "com.alibaba.dubbo.callback.implicit.NofifyImpl" />
<dubbo:reference id="demoService" interface="com.alibaba.dubbo.callback.implicit.IDemoService" version="1.0.0" group="cn" >
      <dubbo:method name="get" async="true" onreturn = "demoCallback.onreturn" onthrow="demoCallback.onthrow" />
</dubbo:reference>
```
`callback` and` async` functions are orthogonally decomposed. `async = true` means that the result is returned immediately.` onreturn` means that a callback is required.

There are several situations with the tow attributes[^2].

* Asynchronous callback mode:`async=true onreturn="xxx"`  
* Synchronous callback mode:`async=false onreturn="xxx"`  
* Asynchronous no callback:`async=true`  
* Synchronous no callback:`async=true`  

## Testing code

```java
IDemoService demoService = (IDemoService) context.getBean("demoService");
NofifyImpl notify = (NofifyImpl) context.getBean("demoCallback");
int requestId = 2;
Person ret = demoService.get(requestId);
Assert.assertEquals(null, ret);
//for Test:Just used to illustrate the normal callback callback, the specific business decisions.
for (int i = 0; i < 10; i++) {
    if (!notify.ret.containsKey(requestId)) {
        Thread.sleep(200);
    } else {
        break;
    }
}
Assert.assertEquals(requestId, notify.ret.get(requestId).getId());
```

**NOTE**`2.0.7+` version,`async=false` is default.
