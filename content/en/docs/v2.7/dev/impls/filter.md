---
type: docs
title: "Filter Extension"
linkTitle: "Filter"
weight: 2
---


## Summary

Extension for intercepting the invocation for both service provider and consumer, furthermore, most of functions in dubbo are implemented base on the same mechanism. Since every time when remote method is invoked, the filter extensions will be executed too, the corresponding penalty should be considered before more filters are added.

Contract:

* User defined filters are executed after built-in filters by default.
* Special value `default` is introduced to represent the default extension location. For example: for `filter="xxx,default,yyy"`, `xxx` is before default filter, and `yyy` is after the default filter.
* Special value `-` means delete. For example: `filter="-foo1"` excludes `foo1` extension. For example, `filter="-default"` exclues all default filters.
* When provider and service have filter configured at the same moment, all filters are accumulated together instead of override, for example: for `<dubbo:provider filter="xxx,yyy"/>` and `<dubbo:service filter="aaa,bbb" />`，`xxx`, `yyy`, `aaa`, `bbb` are all count as filters. In order to change to override, use: `<dubbo:service filter="-xxx,-yyy,aaa,bbb" />` 

## Extension Interface

`org.apache.dubbo.rpc.Filter`

## Extension Configuration

```xml
<!-- filter for consumer -->
<dubbo:reference filter="xxx,yyy" />
<!-- default filter configuration for the consumer, will intercept for all references -->
<dubbo:consumer filter="xxx,yyy"/>
<!-- filter for provider -->
<dubbo:service filter="xxx,yyy" />
<!-- default filter configuration for the provider, will intercept for all services -->
<dubbo:provider filter="xxx,yyy"/>
```

## Existing Extension

* `org.apache.dubbo.rpc.filter.EchoFilter`
* `org.apache.dubbo.rpc.filter.GenericFilter`
* `org.apache.dubbo.rpc.filter.GenericImplFilter`
* `org.apache.dubbo.rpc.filter.TokenFilter`
* `org.apache.dubbo.rpc.filter.AccessLogFilter`
* `org.apache.dubbo.rpc.filter.CountFilter`
* `org.apache.dubbo.rpc.filter.ActiveLimitFilter`
* `org.apache.dubbo.rpc.filter.ClassLoaderFilter`
* `org.apache.dubbo.rpc.filter.ContextFilter`
* `org.apache.dubbo.rpc.filter.ConsumerContextFilter`
* `org.apache.dubbo.rpc.filter.ExceptionFilter`
* `org.apache.dubbo.rpc.filter.ExecuteLimitFilter`
* `org.apache.dubbo.rpc.filter.DeprecatedFilter`

## Extension Guide

Directory layout:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxFilter.java (Filter implementation)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.rpc.Filter (plain text file with the content: xxx=com.xxx.XxxFilter)
```

XxxFilter.java：

```java
package com.xxx;
 
import org.apache.dubbo.rpc.Filter;
import org.apache.dubbo.rpc.Invoker;
import org.apache.dubbo.rpc.Invocation;
import org.apache.dubbo.rpc.Result;
import org.apache.dubbo.rpc.RpcException;
 
public class XxxFilter implements Filter {
    public Result invoke(Invoker<?> invoker, Invocation invocation) throws RpcException {
        // before filter ...
        Result result = invoker.invoke(invocation);
        // after filter ...
        return result;
    }
}
```

META-INF/dubbo/org.apache.dubbo.rpc.Filter：

```properties
xxx=com.xxx.XxxFilter
```