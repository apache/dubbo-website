---
aliases:
    - /zh/overview/tasks/extensibility/filter/
description: 自定义过滤器
linkTitle: Filter
no_list: true
title: Filter
type: docs
weight: 1
---



通过自定义过滤器，可以对返回的结果进行统一的处理、验证等，减少对开发人员的打扰。

## 开始之前

有两种部署运行方式，二选一
### 基于Kubernetes
* 安装[Kubernetes](https://kubernetes.io/docs/tasks/tools/)环境
* 修改[Provider](https://github.com/apache/dubbo-samples/blob/master/10-task/dubbo-samples-extensibility/dubbo-samples-extensibility-filter-provider/src/main/resources/application.properties)中的配置文件，启用Kubernetes中部署的nacos的地址
    ```properties
    # Specify the application name of Dubbo
    dubbo.application.name=extensibility-filter-provider

    # Enable token verification for each invocation
    dubbo.provider.token=true

    # Specify the registry address
    # dubbo.registry.address=nacos://localhost:8848?username=nacos&password=nacos
    # 启用Kubernetes中部署的nacos的地址
    dubbo.registry.address=nacos://${nacos.address:localhost}:8848?username=nacos&password=nacos

    # Specify the port of Dubbo protocol
    dubbo.protocol.port=20881

    # Apply AppendedFilter
    dubbo.provider.filter=appended
    ```
* 修改[Consumer](https://github.com/apache/dubbo-samples/blob/master/10-task/dubbo-samples-extensibility/dubbo-samples-extensibility-filter-consumer/src/main/resources/application.properties)中的配置文件，启用Kubernetes中部署的nacos的地址
    ```properties
    # Specify the application name of Dubbo
    dubbo.application.name=extensibility-filter-consumer

    # Enable token verification for each invocation
    dubbo.provider.token=true

    # Specify the registry address
    # dubbo.registry.address=nacos://localhost:8848?username=nacos&password=nacos
    # 启用Kubernetes中部署的nacos的地址
    dubbo.registry.address=nacos://${nacos.address:localhost}:8848?username=nacos&password=nacos
    ```
* 部署`[Extensibility Filter Task](https://github.com/apache/dubbo-samples/blob/master/10-task/dubbo-samples-extensibility/deploy/All.yml)`

### 使用本地IDE
* 部署[Nacos](https://nacos.io/zh-cn/docs/quick-start.html)2.2.0版本
* 修改[Provider](https://github.com/apache/dubbo-samples/blob/master/10-task/dubbo-samples-extensibility/dubbo-samples-extensibility-filter-provider/src/main/resources/application.properties)中的配置文件，启用本地nacos的地址
    ```properties
    # Specify the application name of Dubbo
    dubbo.application.name=extensibility-filter-provider

    # Enable token verification for each invocation
    dubbo.provider.token=true

    # Specify the registry address
    # 启用本地nacos的地址
    dubbo.registry.address=nacos://localhost:8848?username=nacos&password=nacos
    # dubbo.registry.address=nacos://${nacos.address:localhost}:8848?username=nacos&password=nacos

    # Specify the port of Dubbo protocol
    dubbo.protocol.port=20881

    # Apply AppendedFilter
    dubbo.provider.filter=appended
    ```
* 修改[Consumer](https://github.com/apache/dubbo-samples/blob/master/10-task/dubbo-samples-extensibility/dubbo-samples-extensibility-filter-consumer/src/main/resources/application.properties)中的配置文件，启用本地nacos的地址
    ```properties
    # Specify the application name of Dubbo
    dubbo.application.name=extensibility-filter-consumer

    # Enable token verification for each invocation
    dubbo.provider.token=true

    # Specify the registry address
    # 启用本地nacos的地址
    dubbo.registry.address=nacos://localhost:8848?username=nacos&password=nacos
    # dubbo.registry.address=nacos://${nacos.address:localhost}:8848?username=nacos&password=nacos
    ```

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
在`resources/application.properties`文件中添加如下配置：
```properties
# Apply AppendedFilter
dubbo.provider.filter=appended
```

## 运行结果
以**使用本地IDE**的方式来运行任务，结果如下：

![dubbo-samples-extensibility-filter-output.jpg](/imgs/v3/tasks/extensibility/dubbo-samples-extensibility-filter-output.jpg)
