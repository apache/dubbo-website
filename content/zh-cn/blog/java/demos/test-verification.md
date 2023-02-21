---
title: "Dubbo测试验证"
linkTitle: "Dubbo测试验证"
tags: ["Java"]
date: 2019-12-02
description: >
    对正在开发的功能进行验证测试，或者单独调用某台机器的服务
---

除了线上常规的使用场景以外，我们在日常使用中还需要一些特定的使用方式，比如对正在开发的功能进行验证测试，比如单独调用某台机器的服务，这篇文章就来介绍一下这些场景下的使用方式。

### 只订阅  
为方便开发测试，经常会在线下共用一个所有服务可用的注册中心，这时，如果一个正在开发中的服务提供者注册，可能会影响消费者不能正常运行。

可以让服务提供者开发方，只订阅服务(开发的服务可能依赖其它服务)，而不注册正在开发的服务，通过直连测试正在开发的服务。     
![subscribe-only](/imgs/blog/subscribe-only.jpg)
禁用注册配置

    <dubbo:registry address="10.20.153.10:9090" register="false" />
或者

    <dubbo:registry address="10.20.153.10:9090?register=false" />

### 指定IP调用  
在开发及测试环境下，经常需要绕过注册中心，只测试指定服务提供者，这时候可能需要点对点直连，点对点直联方式，将以服务接口为单位，忽略注册中心的提供者列表，A 接口配置点对点，不影响 B 接口从注册中心获取列表  
![subscribe-only](/imgs/blog/dubbo-directly.jpg)

可以通过以下几种配置来指定IP调用   

* XML 配置： 如果是线上需求需要点对点，可在 <dubbo:reference> 中配置 url 指向提供者，将绕过注册中心，多个地址用分号隔开，配置如下：
    `<dubbo:reference id="xxxService" interface="com.alibaba.xxx.XxxService" url="dubbo://localhost:20890" />`   
* 通过-D参数指定： 在 JVM 启动参数中加入-D参数映射服务地址，如：`java -Dcom.alibaba.xxx.XxxService=dubbo://localhost:20890`  
* 通过文件映射: 如果服务比较多，也可以用文件映射，用 -Ddubbo.resolve.file 指定映射文件路径，此配置优先级高于 <dubbo:reference> 中的配置，如：
`java -Ddubbo.resolve.file=xxx.properties`  
然后在映射文件 xxx.properties 中加入配置，其中 key 为服务名，value 为服务提供者 URL：`com.alibaba.xxx.XxxService=dubbo://localhost:20890`  

### 回声测试
#### 使用方式
回声测试用于检测服务是否可用，回声测试按照正常请求流程执行，能够测试整个调用是否通畅，可用于监控。

所有服务自动实现 EchoService 接口，只需将任意服务引用强制转型为 EchoService，即可使用。

Spring 配置：

    <dubbo:reference id="memberService" interface="com.xxx.MemberService" />
代码：

```
// 远程服务引用
MemberService memberService = ctx.getBean("memberService"); 
 
EchoService echoService = (EchoService) memberService; // 强制转型为EchoService

// 回声测试可用性
String status = echoService.$echo("OK"); 
 
assert(status.equals("OK"));
```  
#### 实现原理  
我们在实现，注册服务的时候，并没有配置EchoService这个接口，为什么可以直接使用呢？原来是Dubbo在生成proxy的时候，已经实现了`EchoService这个接口`    

```java
  @Override
    public <T> T getProxy(Invoker<T> invoker) throws RpcException {
        Class<?>[] interfaces = null;
        String config = invoker.getUrl().getParameter("interfaces");
        if (config != null && config.length() > 0) {
            String[] types = Constants.COMMA_SPLIT_PATTERN.split(config);
            if (types != null && types.length > 0) {
                interfaces = new Class<?>[types.length + 2];
                interfaces[0] = invoker.getInterface();
                interfaces[1] = EchoService.class;
                for (int i = 0; i < types.length; i++) {
                    interfaces[i + 1] = ReflectUtils.forName(types[i]);
                }
            }
        }
        if (interfaces == null) {
            interfaces = new Class<?>[]{invoker.getInterface(), EchoService.class};
        }
        return getProxy(invoker, interfaces);
    }
```  
通过这种方式，任何bean都可以被转换成EchoService的实例，但是并没有实现`$echo`这个方法，这里，Dubbo使用filter机制做了处理：  

```java
public class EchoFilter implements Filter {

    @Override
    public Result invoke(Invoker<?> invoker, Invocation inv) throws RpcException {
        if (inv.getMethodName().equals(Constants.$ECHO) && inv.getArguments() != null && inv.getArguments().length == 1)
            return new RpcResult(inv.getArguments()[0]);
        return invoker.invoke(inv);
    }

}
```
在经过EchoFilter.invoke方法时，如果调用的是`$echo`，会中断当前的调用过程，直接返回`$echo`的入参，否则会继续执行Filter链。  
通过动态代理和EchoFilter机制，使得回声测试的整个过程对用户透明，不需要做任何额外的配置，直接调用即可。
