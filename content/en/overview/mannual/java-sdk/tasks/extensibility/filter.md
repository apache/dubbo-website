---
aliases:
    - /zh/overview/tasks/extensibility/filter/
    - /zh-cn/overview/tasks/extensibility/filter/
description: 在本文中，我们来了解如何扩展自定义的过滤器实现：一个可以对返回的结果进行统一的处理、验证等统一 Filter 处理器，减少对开发人员的打扰。
linkTitle: Filter
no_list: true
title: Filter
type: docs
weight: 2
---

在 [RPC框架 - Filter请求拦截](../../framework/filter/) 一节中，我们了解了 Filter 的工作机制，以及 Dubbo 框架提供的一些内置 Filter 实现。在本文中，我们来了解如何扩展自定义的过滤器实现：一个可以对返回的结果进行统一的处理、验证等统一 Filter 处理器，减少对开发人员的打扰。

本示例的完整源码请参见 [dubbo-samples-extensibility](https://github.com/apache/dubbo-samples/blob/master/10-task/dubbo-samples-extensibility/)。除了本示例之外，Dubbo 核心仓库 apache/dubbo 以及扩展库 [apache/dubbo-spi-extensions](https://github.com/apache/dubbo-spi-extensions/tree/master/dubbo-filter-extensions/) 中的众多 Filter 实现，都可以作为扩展参考实现。

## 任务详情

对所有调用Provider服务的请求在返回的结果的后面统一添加`'s customized AppendedFilter`。

## 实现方式

在Provider中自定义一个Filter，在Filter中修改返回结果。

#### 代码结构
```properties
src
 |-main
    |-java
        |-org
            |-apache
                |-dubbo
                    |-samples
                        |-extensibility
                            |-filter
                                |-provider
                                    |-AppendedFilter.java (实现Filter接口)
    |-resources
        |-META-INF
            |-application.properties (Dubbo Provider配置文件)
            |-dubbo
                |-org.apache.dubbo.rpc.Filter (纯文本文件)
```
#### 代码详情
```java
package org.apache.dubbo.samples.extensibility.filter.provider;

import org.apache.dubbo.rpc.Filter;
import org.apache.dubbo.rpc.Result;
import org.apache.dubbo.rpc.Invoker;
import org.apache.dubbo.rpc.Invocation;
import org.apache.dubbo.rpc.RpcException;
import org.apache.dubbo.rpc.AsyncRpcResult;

public class AppendedFilter implements Filter {

    @Override
    public Result invoke(Invoker<?> invoker, Invocation invocation) throws RpcException {
        Result result= invoker.invoke(invocation);
        // Obtain the returned value
        Result appResponse = ((AsyncRpcResult) result).getAppResponse();
        // Appended value
        appResponse.setValue(appResponse.getValue()+"'s customized AppendedFilter");
        return result;
    }
}
```

#### SPI配置
在`resources/META-INF/dubbo/org.apache.dubbo.rpc.Filter`文件中添加如下配置：
```properties
appended=org.apache.dubbo.samples.extensibility.filter.provider.AppendedFilter
```

#### 配置文件
在`resources/application.properties`文件中添加如下配置，激活刚才的自定义 Filter 实现：
```properties
# Apply AppendedFilter
dubbo.provider.filter=appended
```

{{% alert title="注意" color="warning" %}}
除了通过配置激活 Filter 实现之外，还可以通过为实现类增加 @Activate 注解，以在满足某些条件时自动激活 Filter 实现，如：
```java
@Activate(group="provider")
public class AppendedFilter implements Filter {}
```
这个 Filter 实现将在 Provider 提供者端自动被激活。
{{% /alert %}}

## 运行结果
以**使用本地IDE**的方式来运行任务，结果如下：

![dubbo-samples-extensibility-filter-output.jpg](/imgs/v3/tasks/extensibility/dubbo-samples-extensibility-filter-output.jpg)
