---
aliases:
    - /zh/docs/references/spis/filter/
description: 调用拦截扩展
linkTitle: 调用拦截扩展
title: 调用拦截扩展
type: docs
weight: 2
---



{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh-cn/overview/mannual/java-sdk/reference-manual/spi/description/filter/)。
{{% /pageinfo %}}

## 扩展说明

服务提供方和服务消费方调用过程拦截，Dubbo 本身的大多功能均基于此扩展点实现，每次远程方法执行，该拦截都会被执行，请注意对性能的影响。

约定：

* 用户自定义 filter 默认在内置 filter 之后。
* 特殊值 `default`，表示缺省扩展点插入的位置。比如：`filter="xxx,default,yyy"`，表示 `xxx` 在缺省 filter 之前，`yyy` 在缺省 filter 之后。
* 特殊符号 `-`，表示剔除。比如：`filter="-foo1"`，剔除添加缺省扩展点 `foo1`。比如：`filter="-default"`，剔除添加所有缺省扩展点。
* provider 和 service 同时配置的 filter 时，累加所有 filter，而不是覆盖。比如：`<dubbo:provider filter="xxx,yyy"/>` 和 `<dubbo:service filter="aaa,bbb" />`，则 `xxx`,`yyy`,`aaa`,`bbb` 均会生效。如果要覆盖，需配置：`<dubbo:service filter="-xxx,-yyy,aaa,bbb" />`

## 扩展接口

`org.apache.dubbo.rpc.Filter`

## 扩展配置

```xml
<!-- 消费方调用过程拦截 -->
<dubbo:reference filter="xxx,yyy" />
<!-- 消费方调用过程缺省拦截器，将拦截所有reference -->
<dubbo:consumer filter="xxx,yyy"/>
<!-- 提供方调用过程拦截 -->
<dubbo:service filter="xxx,yyy" />
<!-- 提供方调用过程缺省拦截器，将拦截所有service -->
<dubbo:provider filter="xxx,yyy"/>
```

## 已知扩展

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

## 扩展示例

Maven 项目结构：

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxFilter.java (实现Filter接口)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.rpc.Filter (纯文本文件，内容为：xxx=com.xxx.XxxFilter)
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
