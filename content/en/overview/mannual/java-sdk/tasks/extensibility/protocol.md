---
aliases:
    - /en/overview/tasks/extensibility/protocol/
    - /en/overview/tasks/extensibility/protocol/
description: This article explains how to provide a custom RPC protocol implementation by extending the `org.apache.dubbo.rpc.Protocol` SPI.
linkTitle: Protocol
no_list: true
title: Protocol
type: docs
weight: 2
---

In the [Communication Protocol](/en/overview/mannual/java-sdk/tasks/protocols/) chapter, we learned about several core RPC protocols built into Dubbo: `dubbo`, `rest`, and `tri`, and how to use them. This article explains how to provide a custom RPC protocol implementation by extending the `org.apache.dubbo.rpc.Protocol` SPI.

There are two ways to create a private protocol: the first is to wrap the existing protocol and add specific business logic. The second is to completely customize a protocol. The former is simpler to implement and is widely used in `dubbo`, such as `ProtocolFilterWrapper`, `QosProtocolWrapper`, and `ProtocolListenerWrapper`. The latter is relatively complex but offers maximum flexibility; for instance, the built-in protocols `dubbo` and `triple` in the Dubbo framework fall under this implementation style.

For the complete source code of this example, refer to [dubbo-samples-extensibility](https://github.com/apache/dubbo-samples/blob/master/10-task/dubbo-samples-extensibility/). In addition to this example, many Protocol implementations in the core Dubbo repository apache/dubbo and the extension library [apache/dubbo-spi-extensions](https://github.com/apache/dubbo-spi-extensions/tree/master/dubbo-protocol-extensions/) can also serve as extension references: 

```properties
# Common protocols supported by Dubbo
dubbo=org.apache.dubbo.rpc.protocol.dubbo.DubboProtocol
tri=org.apache.dubbo.rpc.protocol.tri.TripleProtocol
```

## Task Details

Implement a custom protocol `edubbo` based on the existing `dubbo` protocol.

## Implementation

The `edubbo` protocol is implemented by wrapping the `dubbo` protocol.

#### Code Structure

##### Common

```properties
src
 |-main
    |-java
        |-org
            |-apache
                |-dubbo
                    |-samples
                        |-extensibility
                            |-protocol
                                |-common
                                    |-EnhancedProtocol.java (Implements Protocol interface)
```

##### Provider
```properties
src
 |-main
    |-java
        |-org
            |-apache
                |-dubbo
                    |-samples
                        |-extensibility
                            |-protocol
                                |-provider
                                    |-ExtensibilityProtocolProviderApplication.java
                                    |-ExtensibilityProtocolServiceImpl.java
    |-resources
        |-META-INF
            |-application.properties (Dubbo Provider configuration file)
            |-dubbo
                |-org.apache.dubbo.rpc.Protocol (Plain text file)
```

##### Consumer
```properties
src
 |-main
    |-java
        |-org
            |-apache
                |-dubbo
                    |-samples
                        |-extensibility
                            |-protocol
                                |-consumer
                                    |-ExtensibilityProtocolConsumerApplication.java
                                    |-ExtensibilityProtocolConsumerTask.java
    |-resources
        |-META-INF
            |-application.properties (Dubbo Consumer configuration file)
            |-dubbo
                |-org.apache.dubbo.rpc.Protocol (Plain text file)
```

#### Code Details
```java
package org.apache.dubbo.samples.extensibility.protocol.common;

import org.apache.dubbo.common.URL;
import org.apache.dubbo.rpc.Protocol;
import org.apache.dubbo.rpc.Invoker;
import org.apache.dubbo.rpc.Exporter;
import org.apache.dubbo.rpc.ProtocolServer;
import org.apache.dubbo.rpc.RpcException;
import org.apache.dubbo.rpc.model.FrameworkModel;
import org.apache.dubbo.rpc.protocol.dubbo.DubboProtocol;

import java.util.List;

public class EnhancedProtocol implements Protocol {

    public EnhancedProtocol(FrameworkModel frameworkModel) {
        this.protocol = new DubboProtocol(frameworkModel);
    }

    private final Protocol protocol;

    @Override
    public int getDefaultPort() {
        return this.protocol.getDefaultPort();
    }

    @Override
    public <T> Exporter<T> export(Invoker<T> invoker) throws RpcException {
        // do something
        return this.protocol.export(invoker);
    }

    @Override
    public <T> Invoker<T> refer(Class<T> type, URL url) throws RpcException {
        // do something
        return this.protocol.refer(type, url);
    }

    @Override
    public void destroy() {
        this.protocol.destroy();
    }

    @Override
    public List<ProtocolServer> getServers() {
        return protocol.getServers();
    }
}
```

#### SPI Configuration

##### Provider

Add the following configuration in the `resources/META-INF/dubbo/org.apache.dubbo.rpc.Protocol` file:
```properties
edubbo=org.apache.dubbo.samples.extensibility.protocol.common.EnhancedProtocol
```

##### Consumer

Add the following configuration in the `resources/META-INF/dubbo/org.apache.dubbo.rpc.Protocol` file:
```properties
edubbo=org.apache.dubbo.samples.extensibility.protocol.common.EnhancedProtocol
```

#### Configuration File

##### Provider

Add the following configuration in the `resources/application.properties` file:
```properties
# Custom protocol
dubbo.provider.protocol=edubbo
```

##### Consumer

Add the following configuration in the `resources/application.properties` file:
```properties
# Custom protocol
dubbo.consumer.protocol=edubbo
```

## Run Results
Run the task using **local IDE**, the results are as follows:

#### Registered Protocol

![dubbo-samples-extensibility-protocol-output2.jpg](/imgs/v3/tasks/extensibility/dubbo-samples-extensibility-protocol-output2.jpg)

#### Output Result

![dubbo-samples-extensibility-protocol-output1.png](/imgs/v3/tasks/extensibility/dubbo-samples-extensibility-protocol-output1.png)

