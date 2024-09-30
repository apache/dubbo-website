---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/filter/
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/filter/
description: Call Interceptor Extension
linkTitle: Call Interceptor Extension
title: Call Interceptor Extension
type: docs
weight: 2
---






## Extension Description

The interception during the call process of service providers and consumers is mainly implemented based on this extension point. This interceptor is executed each time a remote method is invoked, so be mindful of its impact on performance.

Convention:

* User-defined filters are executed after built-in filters by default.
* The special value `default` indicates the position where the default extension point is inserted. For example: `filter="xxx,default,yyy"` means `xxx` is before the default filter, and `yyy` is after it.
* The special symbol `-` indicates exclusion. For example: `filter="-foo1"` excludes the default extension point `foo1`. For instance: `filter="-default"` excludes all default extension points.
* When filters are configured for both provider and service, all filters are accumulated rather than overridden. For example: `<dubbo:provider filter="xxx,yyy"/>` and `<dubbo:service filter="aaa,bbb" />` means `xxx`, `yyy`, `aaa`, `bbb` will all be effective. To override, configure: `<dubbo:service filter="-xxx,-yyy,aaa,bbb" />`

## Extension Interface

`org.apache.dubbo.rpc.Filter`

## Extension Configuration

```xml
<!-- Consumer call process interception -->
<dubbo:reference filter="xxx,yyy" />
<!-- Default interceptor for consumer call process, which intercepts all references -->
<dubbo:consumer filter="xxx,yyy"/>
<!-- Provider call process interception -->
<dubbo:service filter="xxx,yyy" />
<!-- Default interceptor for provider call process, which intercepts all services -->
<dubbo:provider filter="xxx,yyy"/>
```

## Known Extensions

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

## Extension Example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxFilter.java (implements Filter interface)
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
        // before filter ...
        Result result = invoker.invoke(invocation);
        // after filter ...
        return result;
    }
}
```

META-INF/dubbo/org.apache.dubbo.rpc.Filter:

```properties
xxx=com.xxx.XxxFilter
```
