---
aliases:
    - /en/overview/tasks/extensibility/filter/
    - /en/overview/tasks/extensibility/filter/
description: "In this article, we will learn how to extend custom filter implementations: a unified Filter processor that can handle and validate returned results, reducing disruptions to developers."
linkTitle: Filter
no_list: true
title: Filter
type: docs
weight: 2
---

In the section [RPC Framework - Filter Request Interception](../../framework/filter/), we learned about the working mechanism of Filters and some built-in Filter implementations provided by the Dubbo framework. In this article, we will learn how to extend custom filter implementations: a unified Filter processor that can handle and validate returned results, reducing disruptions to developers.

The complete source code for this example can be found at [dubbo-samples-extensibility](https://github.com/apache/dubbo-samples/blob/master/10-task/dubbo-samples-extensibility/). In addition to this example, many Filter implementations in the Dubbo core repository apache/dubbo and the extension library [apache/dubbo-spi-extensions](https://github.com/apache/dubbo-spi-extensions/tree/master/dubbo-filter-extensions/) can serve as reference implementations.

## Task Details

Uniformly append `'s customized AppendedFilter` to the returned results of all requests calling Provider services.

## Implementation Method

Customize a Filter in the Provider to modify the return results.

#### Code Structure
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
                                    |-AppendedFilter.java (Implements Filter interface)
    |-resources
        |-META-INF
            |-application.properties (Dubbo Provider configuration file)
            |-dubbo
                |-org.apache.dubbo.rpc.Filter (Plain text file)
```
#### Code Details
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

#### SPI Configuration
Add the following configuration to the `resources/META-INF/dubbo/org.apache.dubbo.rpc.Filter` file:
```properties
appended=org.apache.dubbo.samples.extensibility.filter.provider.AppendedFilter
```

#### Configuration File
Add the following configuration to the `resources/application.properties` file to activate the custom Filter implementation:
```properties
# Apply AppendedFilter
dubbo.provider.filter=appended
```

{{% alert title="Note" color="warning" %}}
In addition to activating the Filter implementation via configuration, you can also add the @Activate annotation to the implementation class to automatically activate it under certain conditions, such as:
```java
@Activate(group="provider")
public class AppendedFilter implements Filter {}
```
This Filter implementation will be automatically activated on the Provider side.
{{% /alert %}}

## Running Results
Running the task **using a local IDE**, the result is as follows:

![dubbo-samples-extensibility-filter-output.jpg](/imgs/v3/tasks/extensibility/dubbo-samples-extensibility-filter-output.jpg)

