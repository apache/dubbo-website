---
type: docs
title: "RPC call context"
linkTitle: "RPC call context"
weight: 6
description: "Store the environment information required in the current calling process through the context"
---
## Feature description
The context stores the environment information needed in the current calling process. All configuration information will be converted to URL parameters, see the **corresponding URL parameters** column in [schema configuration reference manual](../../../reference-manual/config/properties/).

RpcContext is a temporary state recorder for ThreadLocal. When RPC requests are received or RPC requests are initiated, the state of RpcContext will change. For example: A tunes B, B then tunes C, then on machine B, before B tunes C, RpcContext records the information of A's tune to B, after B tunes C, RpcContext records the information of B's tune to C.

## scenes to be used
Global link tracking and hiding parameters.

## How to use

### Service consumer
```java
// remote call
xxxService. xxx();
// Whether this end is a consumer end, here will return true
boolean isConsumerSide = RpcContext.getServiceContext().isConsumerSide();
// Get the provider IP address of the last call
String serverIP = RpcContext.getServiceContext().getRemoteHost();
// Get the current service configuration information, all configuration information will be converted into URL parameters
String application = RpcContext.getServiceContext().getUrl().getParameter("application");
// Note: Every time an RPC call is initiated, the context state will change
yyyService.yyy();
```

### Service Provider
```java
public class XxxServiceImpl implements XxxService {
 
    public void xxx() {
        // Whether this end is the provider end, here will return true
        boolean isProviderSide = RpcContext.getServiceContext().isProviderSide();
        // Get the IP address of the caller
        String clientIP = RpcContext.getServiceContext().getRemoteHost();
        // Get the current service configuration information, all configuration information will be converted into URL parameters
        String application = RpcContext.getServiceContext().getUrl().getParameter("application");
        // Note: Every time an RPC call is initiated, the context state will change
        yyyService.yyy();
        // At this point, the local end becomes the consumer end, and false will be returned here
        boolean isProviderSide = RpcContext.getServiceContext().isProviderSide();
    }
}
```