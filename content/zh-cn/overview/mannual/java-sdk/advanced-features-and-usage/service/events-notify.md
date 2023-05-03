---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/service/events-notify/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/service/events-notify/
description: 在调用前后出现异常时的事件通知
linkTitle: 调用触发事件通知
title: 调用触发事件通知
type: docs
weight: 8
---





## 特性说明
在调用之前、调用之后、出现异常时，会触发 `oninvoke`、`onreturn`、`onthrow` 三个事件，可以配置当事件发生时，通知哪个类的哪个方法。


## 使用场景

调用服务方法前我们可以记录开始时间，调用结束后统计整个调用耗费，发生异常时我们可以告警或打印错误日志或者调用服务前后记录请求日志、响应日志等。

>参考用例
[https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-notify](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-notify)

## 使用方式

### 服务提供者与消费者共享服务接口

```java
interface IDemoService {
    public Person get(int id);
}
```
### 服务提供者实现

```java
class NormalDemoService implements IDemoService {
    public Person get(int id) {
        return new Person(id, "charles`son", 4);
    }
}
```

### 服务提供者配置

```xml
<dubbo:application name="rpc-callback-demo" />
<dubbo:registry address="zookeeper://127.0.0.1:2181"/>
<bean id="demoService" class="org.apache.dubbo.callback.implicit.NormalDemoService" />
<dubbo:service interface="org.apache.dubbo.callback.implicit.IDemoService" ref="demoService" version="1.0.0" group="cn"/>
```
### 服务消费者 Callback 接口

```java
interface Notify {
    public void onreturn(Person msg, Integer id);
    public void onthrow(Throwable ex, Integer id);
}
```

### 服务消费者 Callback 实现

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

### 服务消费者 Callback 配置

两者叠加存在以下几种组合情况：

* 异步回调模式：`async=true onreturn="xxx"`
* 同步回调模式：`async=false onreturn="xxx"`
* 异步无回调 ：`async=true`
* 同步无回调 ：`async=false`

`callback` 与 `async` 功能正交分解，`async=true` 表示结果是否马上返回，`async=false` 默认，`onreturn` 表示是否需要回调。
```xml
<bean id ="demoCallback" class = "org.apache.dubbo.callback.implicit.NotifyImpl" />
<dubbo:reference id="demoService" interface="org.apache.dubbo.callback.implicit.IDemoService" version="1.0.0" group="cn" >
      <dubbo:method name="get" async="true" onreturn = "demoCallback.onreturn" onthrow="demoCallback.onthrow" />
</dubbo:reference>
```
 

### 测试代码

```java
IDemoService demoService = (IDemoService) context.getBean("demoService");
NotifyImpl notify = (NotifyImpl) context.getBean("demoCallback");
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