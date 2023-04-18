---
aliases:
    - /zh/overview/tasks/extensibility/router/
description: 自定义路由策略
linkTitle: Router
no_list: true
title: Router
type: docs
weight: 4
---



通过自定义路由，可以根据业务场景的特点来实现特定的路由方式。

## 开始之前

有两种部署运行方式，二选一
### 基于Kubernetes
* 安装[Kubernetes](https://kubernetes.io/docs/tasks/tools/)环境
* 修改[Provider](https://github.com/apache/dubbo-samples/blob/master/10-task/dubbo-samples-extensibility/dubbo-samples-extensibility-router-provider/src/main/resources/application.properties)中的配置文件，启用Kubernetes中部署的nacos的地址
    ```properties
    # Specify the application name of Dubbo
    dubbo.application.name=extensibility-router-provider

    # Enable token verification for each invocation
    dubbo.provider.token=true

    # Specify the registry address
    # dubbo.registry.address=nacos://localhost:8848?username=nacos&password=nacos
    # 启用Kubernetes中部署的nacos的地址
    dubbo.registry.address=nacos://${nacos.address:localhost}:8848?username=nacos&password=nacos
    # Specify the port of Dubbo protocol
    dubbo.protocol.port=20881
    ```
* 修改[Consumer](https://github.com/apache/dubbo-samples/blob/master/10-task/dubbo-samples-extensibility/dubbo-samples-extensibility-filter-consumer/src/main/resources/application.properties)中的配置文件，启用Kubernetes中部署的nacos的地址
    ```properties
    # Specify the application name of Dubbo
    dubbo.application.name=extensibility-filter-consumer

    # Enable token verification for each invocation
    dubbo.provider.token=true

    # Specify the registry address
    #dubbo.registry.address=nacos://localhost:8848?username=nacos&password=nacos
    # 启用Kubernetes中部署的nacos的地址
    dubbo.registry.address=nacos://${nacos.address:localhost}:8848?username=nacos&password=nacos
    # 配置自定义路由
    dubbo.consumer.router=stickfirst
    ```
* 部署[Extensibility Router Task](https://github.com/apache/dubbo-samples/blob/master/10-task/dubbo-samples-extensibility/deploy/All.yml)

### 使用本地IDE
* 部署[Nacos](https://nacos.io/zh-cn/docs/quick-start.html)2.2.0版本
* 修改[Provider](https://github.com/apache/dubbo-samples/blob/master/10-task/dubbo-samples-extensibility/dubbo-samples-extensibility-filter-provider/src/main/resources/application.properties)中的配置文件，启用本地nacos的地址
    ```properties
    # Specify the application name of Dubbo
    dubbo.application.name=extensibility-router-provider

    # Enable token verification for each invocation
    dubbo.provider.token=true

    # Specify the registry address
    # 启用本地nacos的地址
    dubbo.registry.address=nacos://localhost:8848?username=nacos&password=nacos
    # dubbo.registry.address=nacos://${nacos.address:localhost}:8848?username=nacos&password=nacos

    # Specify the port of Dubbo protocol
    dubbo.protocol.port=20881
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
    #dubbo.registry.address=nacos://${nacos.address:localhost}:8848?username=nacos&password=nacos

    # 配置自定义路由
    dubbo.consumer.router=stickfirst
    ```

## 任务详情

对所有的请求都使用第一提供服务的Provider，如果该Provider下线，则从新选择一个新的Provider。

## 实现方式

在Consumer中自定义一个Router，在Router中将第一次调用的Provider保存下来，如果后续有请求调用且Provider列表中包含第一次调用时使用的Provider，则继续使用第一次调用时使用的Provider，否则重新选去一个Provider。

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
                            |-router
                                |-consumer
                                    |-router
                                        |-StickFirstStateRouter.java (实现StateRouter接口)
                                        |-StickFirstStateRouterFactory.java (实现StateRouterFactory接口)
    |-resources
        |-META-INF
            |-application.properties (Dubbo Consumer配置文件)
            |-dubbo
                |-org.apache.dubbo.rpc.cluster.router.state.StateRouterFactory (纯文本文件)
```
#### 代码详情

+ StickFirstStateRouter
```java
package org.apache.dubbo.samples.extensibility.router.consumer.router;

import org.apache.dubbo.common.URL;
import org.apache.dubbo.common.config.configcenter.ConfigChangeType;
import org.apache.dubbo.common.config.configcenter.ConfigChangedEvent;
import org.apache.dubbo.common.config.configcenter.ConfigurationListener;
import org.apache.dubbo.common.logger.ErrorTypeAwareLogger;
import org.apache.dubbo.common.logger.LoggerFactory;
import org.apache.dubbo.common.utils.CollectionUtils;
import org.apache.dubbo.common.utils.Holder;
import org.apache.dubbo.rpc.Invocation;
import org.apache.dubbo.rpc.Invoker;
import org.apache.dubbo.rpc.RpcException;
import org.apache.dubbo.rpc.cluster.router.RouterSnapshotNode;
import org.apache.dubbo.rpc.cluster.router.state.AbstractStateRouter;
import org.apache.dubbo.rpc.cluster.router.state.BitList;

public class StickFirstStateRouter<T> extends AbstractStateRouter<T> implements ConfigurationListener {
    public StickFirstStateRouter(URL url) {
        super(url);
    }

    public static final String NAME = "STICK_FIRST_ROUTER";
    private static final ErrorTypeAwareLogger logger = LoggerFactory.getErrorTypeAwareLogger(StickFirstStateRouter.class);
    private volatile BitList<Invoker<T>> firstInvokers;

    @Override
    protected BitList<Invoker<T>> doRoute(BitList<Invoker<T>> invokers, URL url, Invocation invocation, boolean needToPrintMessage, Holder<RouterSnapshotNode<T>> routerSnapshotNodeHolder, Holder<String> messageHolder) throws RpcException {
        if (CollectionUtils.isEmpty(invokers)) {
            if (needToPrintMessage) {
                messageHolder.set("Directly Return. Reason: Invokers from previous router is empty.");
            }
            return invokers;
        }
        BitList<Invoker<T>> copy = invokers.clone();
        if (CollectionUtils.isEmpty(copy)) {
            this.firstInvokers = new BitList<>(BitList.emptyList());
            this.firstInvokers.add(copy.get(0));
        } else {
            this.firstInvokers = copy.and(invokers);
            if(CollectionUtils.isEmpty(this.firstInvokers)){
                this.firstInvokers.add(copy.get(0));
            }
        }
        return this.firstInvokers;
    }

    @Override
    public void process(ConfigChangedEvent event) {
        if (logger.isDebugEnabled()) {
            logger.debug("Notification of tag rule, change type is: " + event.getChangeType() + ", raw rule is:\n " +
                    event.getContent());
        }
        // Reset
        if (event.getChangeType().equals(ConfigChangeType.DELETED)) {
            this.firstInvokers = null;
        }
    }

    @Override
    public void stop() {
        super.stop();
        this.firstInvokers = null;
    }
}
```

+ StickFirstStateRouterFactory
```java
package org.apache.dubbo.samples.extensibility.router.consumer.router;

import org.apache.dubbo.common.URL;
import org.apache.dubbo.rpc.cluster.router.state.StateRouter;
import org.apache.dubbo.rpc.cluster.router.state.StateRouterFactory;

public class StickFirstStateRouterFactory implements StateRouterFactory {
    @Override
    public <T> StateRouter<T> getRouter(Class<T> interfaceClass, URL url) {
        return new StickFirstStateRouter<>(url);
    }
}
```

#### SPI配置
在`resources/META-INF/dubbo/org.apache.dubbo.rpc.cluster.router.state.StateRouterFactory`文件中添加如下配置：
```properties
stickfirst=org.apache.dubbo.samples.extensibility.router.consumer.router.StickFirstStateRouterFactory
```

#### 配置文件
在`resources/application.properties`文件中添加如下配置：
```properties
# 配置自定义路由
dubbo.consumer.router=stickfirst
```

## 运行结果
以**使用本地IDE**的方式来运行任务，结果如下：

![dubbo-samples-extensibility-router-output.png](/imgs/v3/tasks/extensibility/dubbo-samples-extensibility-router-output.png)
