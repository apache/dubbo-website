---
title: "Echo Test"
linkTitle: "Echo Test"
tags: ["Java"]
date: 2018-06-26
description: >
    The echo test is used to detect whether the service is available.
---

The echo test is used to detect whether the service is available. The client uses EchoService to perform the echo test. The EchoService is declared as follows:

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
Requests initiated by the user through the $echo method are executed according to the normal request process, allowing testing of the entire call flow. The monitoring system can use the echo test to check service availability.

## Usage Example

All service references automatically implement the EchoService interface. Users just need to cast the service reference to EchoService to use it. The configuration and code example are as follows. Spring configuration:

```
<dubbo:reference id="demoService" interface="org.apache.dubbo.samples.echo.DemoService" />
```
Code:

```Java
// Remote service reference
DemoService demoService= ctx.getBean("demoService");
// Cast to EchoService
EchoService echoService = (EchoService) demoService;
// Echo test availability
String status = echoService.$echo("OK");
assert(status.equals("OK"));
```
## Implementation Principle

When configuring the service reference, we did not configure the EchoService interface. Why can we directly cast the service reference to EchoService? The service reference the user obtains is actually a Proxy. When Dubbo generates the Proxy, it has already added the EchoService interface to the Proxy's interface list by default, so the Proxy obtained by the user has already implemented EchoService. The code related to generating the proxy is as follows:

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
In this way, any service reference can be cast to EchoService for use. The above explains the client implementation. On the service side, the user has not implemented EchoService; how is the call from the client EchoService processed on the server? The framework uses a Filter mechanism to handle EchoService requests. The implementation code for the Filter is as follows:

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
When a request passes through the EchoFilter.invoke method, if it is determined to be a $echo call, it directly returns the request parameter; otherwise, it continues to execute the Filter chain. EchoFilter is automatically included in the Filter chain of every service provider, enabling each service provider to automatically respond to EchoService requests.

Through the above analysis, we understand how the framework uses dynamic proxy and Filter mechanisms to allow users to transparently utilize EchoService functionality.

