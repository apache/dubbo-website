> ![warning](../sources/images/check.gif)在调用之前，调用之后，出现异常时，会触发oninvoke, onreturn, onthrow三个事件，可以配置当事件发生时，通知哪个类的哪个方法。

> ![warning](../sources/images/warning-3.gif)支持版本：2.0.7之后

##### (1) 服务提供者与消费者共享服务接口

**IDemoService.java**

```java
interface IDemoService {
    public Person get(int id);
}
```

##### (2) 服务提供者实现

**DemoServiceImpl.java**

```java

class NormalDemoService implements IDemoService {
    public Person get(int id) {
        return new Person(id, "charles`son", 4);
    }
}
```

##### (3) 服务提供者配置

**provider.xml**

```xml
<dubbo:application name="rpc-callback-demo" />
<dubbo:registry address="http://10.20.160.198/wiki/display/dubbo/10.20.153.186" />
<bean id="demoService" class="com.alibaba.dubbo.callback.implicit.NormalDemoService" />
<dubbo:service interface="com.alibaba.dubbo.callback.implicit.IDemoService" ref="demoService" version="1.0.0" group="cn"/>
```

##### (4) 服务消费者Callback接口及实现

**Notify.java**

```java
interface Notify {
    public void onreturn(Person msg, Integer id);
    public void onthrow(Throwable ex, Integer id);
}
```

**NotifyImpl.java**

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

##### (5) 服务消费者Callback接口及实现

**consumer.xml**

```xml
<bean id ="demoCallback" class = "com.alibaba.dubbo.callback.implicit.NofifyImpl" />
<dubbo:reference id="demoService" interface="com.alibaba.dubbo.callback.implicit.IDemoService" version="1.0.0" group="cn" >
      <dubbo:method name="get" async="true" onreturn = "demoCallback.onreturn" onthrow="demoCallback.onthrow" />
</dubbo:reference>
```

> ![warning](../sources/images/check.gif)callback与async功能正交分解：

> * async=true，表示结果是否马上返回.  
> * onreturn 表示是否需要回调.  

> 组合情况：(async=false 默认)
> * 异步回调模式：async=true onreturn="xxx"  
> * 同步回调模式：async=false onreturn="xxx"  
> * 异步无回调 ：async=true  
> * 同步无回调 ：async=false  

##### (6) TEST CASE

**Test.java**

```java
IDemoService demoService = (IDemoService) context.getBean("demoService");
NofifyImpl notify = (NofifyImpl) context.getBean("demoCallback");
int requestId = 2;
Person ret = demoService.get(requestId);
Assert.assertEquals(null, ret);
//for Test：只是用来说明callback正常被调用，业务具体实现自行决定.
for (int i = 0; i < 10; i++) {
    if (!notify.ret.containsKey(requestId)) {
        Thread.sleep(200);
    } else {
        break;
    }
}
Assert.assertEquals(requestId, notify.ret.get(requestId).getId());
```
