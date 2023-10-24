---
aliases:
    - /en/overview/tasks/extensibility/router/
description: Custom Routing Strategy
linkTitle: Router
no_list: true
title: Router
type: docs
weight: 4
---

By creating custom routers, you can implement specific routing methods based on the characteristics of your business scenario.

## Prerequisites

Choose one of the two deployment and running methods
### Based on Kubernetes
* Install [Kubernetes](https://kubernetes.io/docs/tasks/tools/) environment
* Modify the configuration file in [Provider](https://github.com/apache/dubbo-samples/blob/master/10-task/dubbo-samples-extensibility/dubbo-samples-extensibility-router-provider/src/main/resources/application.properties) to enable the address of nacos deployed in Kubernetes
    ```properties
    # (The configuration remains the same as in the original documentation)
    ```
* Modify the configuration file in [Consumer](https://github.com/apache/dubbo-samples/blob/master/10-task/dubbo-samples-extensibility/dubbo-samples-extensibility-filter-consumer/src/main/resources/application.properties) to enable the address of nacos deployed in Kubernetes
    ```properties
    # (The configuration remains the same as in the original documentation)
    ```
* Deploy [Extensibility Router Task](https://github.com/apache/dubbo-samples/blob/master/10-task/dubbo-samples-extensibility/deploy/All.yml)

### Using Local IDE
* Deploy [Nacos](https://nacos.io/en-us/) version 2.2.0
* Modify the configuration file in [Provider](https://github.com/apache/dubbo-samples/blob/master/10-task/dubbo-samples-extensibility/dubbo-samples-extensibility-filter-provider/src/main/resources/application.properties) to enable the local nacos address
    ```properties
    # (The configuration remains the same as in the original documentation)
    ```
* Modify the configuration file in [Consumer](https://github.com/apache/dubbo-samples/blob/master/10-task/dubbo-samples-extensibility/dubbo-samples-extensibility-filter-consumer/src/main/resources/application.properties) to enable the local nacos address
    ```properties
    # (The configuration remains the same as in the original documentation)
    ```

## Task Details

The task is to stick to the first Provider that starts providing the service. If that Provider goes offline, choose a new Provider.

## Implementation Method

Create a custom router in the Consumer. In this router, save the Provider that was used for the first invocation. For subsequent invocations, if the list of Providers includes the one used during the first invocation, continue to use it; otherwise, choose a new Provider.

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
                            |-router
                                |-consumer
                                    |-router
                                        |-StickFirstStateRouter.java (Implement StateRouter interface)
                                        |-StickFirstStateRouterFactory.java (Implement StateRouterFactory interface)
    |-resources
        |-META-INF
            |-application.properties (Dubbo Consumer configuration file)
            |-dubbo
                |-org.apache.dubbo.rpc.cluster.router.state.StateRouterFactory (Plain text file)
```
#### Code Details

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

#### SPI Configuration
Add the following configuration to the `resources/META-INF/dubbo/org.apache.dubbo.rpc.cluster.router.state.StateRouterFactory` file:
```properties
stickfirst=org.apache.dubbo.samples.extensibility.router.consumer.router.StickFirstStateRouterFactory
```

#### Configuration File
Add the following configuration to the `resources/application.properties` file:
```properties
# Configure custom router
dubbo.consumer.router=stickfirst
```

## Execution Results

Run the task using the **Using Local IDE** method, and the results are as follows:

![dubbo-samples-extensibility-router-output.png](/imgs/v3/tasks/extensibility/dubbo-samples-extensibility-router-output.png)

To summarize, Dubbo's extensibility allows you to create custom routers, providing a way to customize the routing logic based on your business requirements. This tutorial demonstrates how to create a "Stick to the First Provider" routing strategy, which can be useful for optimizing network traffic and reducing latency.