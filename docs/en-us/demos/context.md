# Context Information

All environment information of during the current call will put into the context,and all configuration information will convert the parameters of `URL` instance,Ref to the column of **URL parameters** at the [schema configuration reference book](../references/xml/introduction.md)


`RpcContext` is a temporary status recorder of `ThreadLocal`,when accept `RPC` request or send `RPC` request,The `RpcContext` will be  changed.Such as: `A` call `B` and `B` call `C`. On `B` machine,before `B` call `C`,the `RpcContext` will record the information of `A` call `B`.After `B` call `C`,the `RpcContext` record the information of `B` call `C`.

## At service consumer

```java
// remote invoke
xxxService.xxx();
// if return true,then the current side is consumer.
boolean isConsumerSide = RpcContext.getContext().isConsumerSide();
// get the provider ip address of the last invoke.
String serverIP = RpcContext.getContext().getRemoteHost();
// because all configuration information has convert the URL's  parameters,so at this place can get the application parameter value.
String application = RpcContext.getContext().getUrl().getParameter("application");
// Note:every rpc invoke,then context will be changed.
yyyService.yyy();
```

## At service provider

```java
public class XxxServiceImpl implements XxxService {

    public void xxx() {
        // if return true,then the current side is provider.
        boolean isProviderSide = RpcContext.getContext().isProviderSide();
        // get the invoker ip
        String clientIP = RpcContext.getContext().getRemoteHost();
        // because all configuration information has convert the URL's  parameters,so at this place can get the application parameter value.
        String application = RpcContext.getContext().getUrl().getParameter("application");
        // Note:every rpc invoke,then context will be changed.
        yyyService.yyy();;
    }
}
```
