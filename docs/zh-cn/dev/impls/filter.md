# 调用拦截扩展

## 扩展说明

服务提供方和服务消费方调用过程拦截，Dubbo 本身的大多功能均基于此扩展点实现，每次远程方法执行，该拦截都会被执行，请注意对性能的影响。

约定：

* 用户自定义 filter 默认在内置 filter 之后。
* 特殊值 `default`，表示缺省扩展点插入的位置。比如：`filter="xxx,default,yyy"`，表示 `xxx` 在缺省 filter 之前，`yyy` 在缺省 filter 之后。
* 特殊符号 `-`，表示剔除。比如：`filter="-foo1"`，剔除添加缺省扩展点 `foo1`。比如：`filter="-default"`，剔除添加所有缺省扩展点。
* provider 和 service 同时配置的 filter 时，累加所有 filter，而不是覆盖。比如：`<dubbo:provider filter="xxx,yyy"/>` 和 `<dubbo:service filter="aaa,bbb" />`，则 `xxx`,`yyy`,`aaa`,`bbb` 均会生效。如果要覆盖，需配置：`<dubbo:service filter="-xxx,-yyy,aaa,bbb" />`

## 扩展接口

`com.alibaba.dubbo.rpc.Filter`

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

* `com.alibaba.dubbo.rpc.filter.EchoFilter`
* `com.alibaba.dubbo.rpc.filter.GenericFilter`
* `com.alibaba.dubbo.rpc.filter.GenericImplFilter`
* `com.alibaba.dubbo.rpc.filter.TokenFilter`
* `com.alibaba.dubbo.rpc.filter.AccessLogFilter`
* `com.alibaba.dubbo.rpc.filter.CountFilter`
* `com.alibaba.dubbo.rpc.filter.ActiveLimitFilter`
* `com.alibaba.dubbo.rpc.filter.ClassLoaderFilter`
* `com.alibaba.dubbo.rpc.filter.ContextFilter`
* `com.alibaba.dubbo.rpc.filter.ConsumerContextFilter`
* `com.alibaba.dubbo.rpc.filter.ExceptionFilter`
* `com.alibaba.dubbo.rpc.filter.ExecuteLimitFilter`
* `com.alibaba.dubbo.rpc.filter.DeprecatedFilter`

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
                |-com.alibaba.dubbo.rpc.Filter (纯文本文件，内容为：xxx=com.xxx.XxxFilter)
```

XxxFilter.java：

```java
package com.xxx;
 
import com.alibaba.dubbo.rpc.Filter;
import com.alibaba.dubbo.rpc.Invoker;
import com.alibaba.dubbo.rpc.Invocation;
import com.alibaba.dubbo.rpc.Result;
import com.alibaba.dubbo.rpc.RpcException;
 
public class XxxFilter implements Filter {
    public Result invoke(Invoker<?> invoker, Invocation invocation) throws RpcException {
        // before filter ...
        Result result = invoker.invoke(invocation);
        // after filter ...
        return result;
    }
}
```

META-INF/dubbo/com.alibaba.dubbo.rpc.Filter：

```properties
xxx=com.xxx.XxxFilter
```