---
title: "回声测试"
linkTitle: "回声测试"
tags: ["Java"]
date: 2018-06-26
description: >
    回声测试用于检测服务是否可用
---

回声测试用于检测服务是否可用。客户端通过 EchoService 来使用回声测试。EchoService 申明如下：

```Java
public interface EchoService {

    /**
     * echo test.
     *
     * @param message message.
     * @return message.
     */
    Object $echo(Object message);

}
```
用户通过 $echo 方法发起的请求，会按照正常请求的流程执行，能够测试整个调用是否通畅，监控系统可以使用回声测试来检测服务可用性。

## 使用范例

所有服务引用自动实现 EchoService 接口，用户只需将服务引用强制转型为 EchoService，即可使用。配置和代码范例如下所示。
Spring 配置：

```
<dubbo:reference id="demoService" interface="org.apache.dubbo.samples.echo.DemoService" />
```
代码：

```Java
// 远程服务引用
DemoService demoService= ctx.getBean("demoService");
// 强制转型为EchoService
EchoService echoService = (EchoService) demoService;
// 回声测试可用性
String status = echoService.$echo("OK");
assert(status.equals("OK"));
```
## 实现原理

我们在配置服务引用时，并没有配置 EchoService 这个接口，为什么可以直接把服务引用转型为 EchoService 呢？
用户拿到的服务引用其实是一个 Proxy，Dubbo 在生成 Proxy 的时候，已经默认将 EchoService 这个接口加入到 Proxy 的接口列表中，所以用户拿到的 Proxy 都已经实现了 EchoService。生成代理相关代码如下：

```Java
 public <T> T getProxy(Invoker<T> invoker, boolean generic) throws RpcException {
        Class<?>[] interfaces = null;
        String config = invoker.getUrl().getParameter(Constants.INTERFACES);
        if (config != null && config.length() > 0) {
            String[] types = Constants.COMMA_SPLIT_PATTERN.split(config);
            if (types != null && types.length > 0) {
                interfaces = new Class<?>[types.length + 2];
                interfaces[0] = invoker.getInterface();
                interfaces[1] = EchoService.class;
                for (int i = 0; i < types.length; i++) {
                    // TODO can we load successfully for a different classloader?.
                    interfaces[i + 2] = ReflectUtils.forName(types[i]);
                }
            }
        }
        if (interfaces == null) {
            interfaces = new Class<?>[]{invoker.getInterface(), EchoService.class};
        }

        if (!GenericService.class.isAssignableFrom(invoker.getInterface()) && generic) {
            int len = interfaces.length;
            Class<?>[] temp = interfaces;
            interfaces = new Class<?>[len + 1];
            System.arraycopy(temp, 0, interfaces, 0, len);
            interfaces[len] = com.alibaba.dubbo.rpc.service.GenericService.class;
        }

        return getProxy(invoker, interfaces);
    }
```
通过这种方式，任何服务引用都可以被转型成 EchoService 来使用。
上面解释了客户端的实现，另外一边，用户在服务端也并没有实现 EchoService，那么客户端 EchoService 发出的调用在服务端是如何处理的呢？框架使用 Filter 机制来处理 EchoService 请求。Filter 实现代码如下：

```Java
@Activate(group = Constants.PROVIDER, order = -110000)
public class EchoFilter implements Filter {

    @Override
    public Result invoke(Invoker<?> invoker, Invocation inv) throws RpcException {
        if (inv.getMethodName().equals(Constants.$ECHO) && inv.getArguments() != null && inv.getArguments().length == 1) {
            return new RpcResult(inv.getArguments()[0]);
        }
        return invoker.invoke(inv);
    }

}
```
请求经过 EchoFilter.invoke 方法时，如果判定为 $echo 调用，则直接返回请求参数，否则继续执行 Filter 链。EchoFilter 默认加入到每一个服务提供者的 Filter 链里 EchoFilter.invoke 方法时，如果判定为 $echo 调用，则直接返回请求参数，否则继续执行 Filter 链。EchoFilter 默认加入到每一个服务提供者的 Filter 链里。这样每一个服务提供者自动具备了响应 EchoService 的能力。

通过上述分析，我们了解了框架是如何通过动态代理和 Filter 机制，使得用户可以透明地使用 EchoService 功能。
