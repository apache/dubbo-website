---
aliases:
    - /en/overview/tasks/extensibility/router/
    - /en/overview/tasks/extensibility/router/
description: This article explains how to implement a custom routing strategy by extending the Router, which can achieve specific routing methods based on the characteristics of business scenarios.
linkTitle: Router
no_list: true
title: Router
type: docs
weight: 4
---

By customizing the router, specific routing methods can be implemented based on the characteristics of business scenarios. Please refer to the source code for the router extension implementation in the example at [dubbo-samples-extensibility](https://github.com/apache/dubbo-samples/blob/master/10-task/dubbo-samples-extensibility/) .

## Before You Begin

## Task Details

Use the first provided service Provider for all requests. If this Provider goes offline, choose a new Provider.

## Implementation Method

In the Consumer, customize a Router that saves the Provider used in the first call. If there are subsequent requests and the Provider list includes the Provider used in the first call, continue to use that Provider; otherwise, select a new Provider.

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
                                        |-StickFirstStateRouter.java (Implements the StateRouter interface)
                                        |-StickFirstStateRouterFactory.java (Implements the StateRouterFactory interface)
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
# Configure custom routing
dubbo.consumer.router=stickfirst
```

## Execution Result
Running the task using **local IDE**, the result is as follows:

![dubbo-samples-extensibility-router-output.png](/imgs/v3/tasks/extensibility/dubbo-samples-extensibility-router-output.png)

