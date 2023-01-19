---
type: docs
title: "Call Intercept Extension"
linkTitle: "Call Intercept Extension"
weight: 2
---

## Expansion Description

Service provider and service consumer call process interception. Most functions of Dubbo itself are implemented based on this extension point. Every time a remote method is executed, this interception will be executed. Please pay attention to the impact on performance.

agreement:

* User-defined filters are by default after built-in filters.
* The special value `default`, indicating where the default extension point is inserted. For example: `filter="xxx,default,yyy"`, means `xxx` is before the default filter, and `yyy` is after the default filter.
* The special symbol `-` means culling. For example: `filter="-foo1"`, exclude adding the default extension point `foo1`. For example: `filter="-default"`, remove all default extension points.
* When the provider and service configure filters at the same time, all filters are accumulated instead of overwritten. For example: `<dubbo:provider filter="xxx,yyy"/>` and `<dubbo:service filter="aaa,bbb" />`, then `xxx`,`yyy`,`aaa`,`bbb` will take effect. If you want to overwrite, you need to configure: `<dubbo:service filter="-xxx,-yyy,aaa,bbb" />`

## Extension ports

`org.apache.dubbo.rpc.Filter`

## Extended configuration

```xml
<!-- Consumer call process interception -->
<dubbo:reference filter="xxx,yyy" />
<!-- The default interceptor of the consumer call process, which will intercept all references -->
<dubbo:consumer filter="xxx,yyy"/>
<!-- provider call process interception -->
<dubbo:service filter="xxx,yyy" />
<!-- Provider call process default interceptor, will intercept all services -->
<dubbo:provider filter="xxx,yyy"/>
```

## Known extensions

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

## Extended example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxFilter.java (implement the Filter interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.rpc.Filter (plain text file, content: xxx=com.xxx.XxxFilter)
```

XxxFilter.java:

```java
package com.xxx;
 
import org.apache.dubbo.rpc.Filter;
import org.apache.dubbo.rpc.Invoker;
import org.apache.dubbo.rpc.Invocation;
import org.apache.dubbo.rpc.Result;
import org.apache.dubbo.rpc.RpcException;
 
public class XxxFilter implements Filter {
    public Result invoke(Invoker<?> invoker, Invocation invocation) throws RpcException {
        // before filter...
        Result result = invoker.invoke(invocation);
        // after filter...
        return result;
    }
}
```

META-INF/dubbo/org.apache.dubbo.rpc.Filter:

```properties
xxx=com.xxx.XxxFilter
```