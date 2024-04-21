---
aliases:
    - /en/overview/tasks/extensibility/protocol/
description: Custom Protocols
linkTitle: Protocol
no_list: true
title: Protocol
type: docs
weight: 2
---

Dubbo has implemented a lot of built-in functionalities through protocol extensions and also supports many commonly used protocols. You can see all custom protocols in the `org.apache.dubbo.rpc.Protocol` file. For example, in Dubbo 3, we have:

```properties
# Built-in functionalities implemented by Dubbo through protocol extension
filter=org.apache.dubbo.rpc.cluster.filter.ProtocolFilterWrapper
qos=org.apache.dubbo.qos.protocol.QosProtocolWrapper
registry=org.apache.dubbo.registry.integration.InterfaceCompatibleRegistryProtocol
service-discovery-registry=org.apache.dubbo.registry.integration.RegistryProtocol
listener=org.apache.dubbo.rpc.protocol.ProtocolListenerWrapper
mock=org.apache.dubbo.rpc.support.MockProtocol
serializationwrapper=org.apache.dubbo.rpc.protocol.ProtocolSerializationWrapper
securitywrapper=org.apache.dubbo.rpc.protocol.ProtocolSecurityWrapper

# Commonly used protocols supported by Dubbo
dubbo=org.apache.dubbo.rpc.protocol.dubbo.DubboProtocol
injvm=org.apache.dubbo.rpc.protocol.injvm.InjvmProtocol
rest=org.apache.dubbo.rpc.protocol.rest.RestProtocol
grpc=org.apache.dubbo.rpc.protocol.grpc.GrpcProtocol
tri=org.apache.dubbo.rpc.protocol.tri.TripleProtocol
```

As you can see, Dubbo has implemented a series of functionalities like filtering, monitoring, service discovery, listeners, mock, serialization, and security through protocol extensions. It also supports `dubbo`, `injvm`, `rest`, `grpc`, and `tri` protocols for external use.

There are two ways to customize a private protocol. The first is to wrap an existing protocol and add some specific business logic. The other is to fully customize a new protocol. The former is simpler and has extensive usage in Dubbo, like `ProtocolFilterWrapper`, `QosProtocolWrapper`, `ProtocolListenerWrapper`, etc. The latter is more complex, but Dubbo has implemented most of the commonly used protocols which are well-tested in production environments.

This article will demonstrate how to implement a custom protocol based on an existing protocol.

## Prerequisites

Two deployment and running methods, choose one
### Based on Kubernetes
* Install [Kubernetes](https://kubernetes.io/docs/tasks/tools/) environment
* Modify the configuration file in [Provider](https://github.com/apache/dubbo-samples/blob/master/10-task/dubbo-samples-extensibility/dubbo-samples-extensibility-protocol-provider/src/main/resources/application.properties) to enable the address of nacos deployed in Kubernetes
    ```properties
    # Specify the application name of Dubbo
    dubbo.application.name=extensibility-protocol-provider

    # Enable token verification for each invocation
    dubbo.provider.token=true

    # Specify the registry address
    # dubbo.registry.address=nacos://localhost:8848?username=nacos&password=nacos
    dubbo.registry.address=nacos://${nacos.address:localhost}:8848?username=nacos&password=nacos

    # Custom protocol edubbo
    dubbo.provider.protocol=edubbo
    ```

* Modify the configuration file in [Consumer](https://github.com/apache/dubbo-samples/blob/master/10-task/dubbo-samples-extensibility/dubbo-samples-extensibility-protocol-consumer/src/main/resources/application.properties) to enable the address of nacos deployed in Kubernetes
    ```properties
    # Specify the application name of Dubbo
    dubbo.application.name=extensibility-protocol-consumer

    # Enable token verification for each invocation
    dubbo.provider.token=true

    # Specify the registry address
    # dubbo.registry.address=nacos://localhost:8848?username=nacos&password=nacos
    dubbo.registry.address=nacos://${nacos.address:localhost}:8848?username=nacos&password=nacos

    # Custom protocol edubbo
    dubbo.consumer.protocol=edubbo
    ```
* Deploy `[Extensibility Protocol Task](https://github.com/apache/dubbo-samples/blob/master/10-task/dubbo-samples-extensibility/deploy/All.yml)`

### Using Local IDE
* Deploy [Nacos](https://nacos.io/en-us/) version 2.2.0
* Modify the configuration file in [Provider](https://github.com/apache/dubbo-samples/blob/master/10-task/dubbo-samples-extensibility/dubbo-samples-extensibility-protocol-provider/src/main/resources/application.properties) to enable the local nacos address
    ```properties
    # Specify the application name of Dubbo
    dubbo.application.name=extensibility-protocol-provider

    # Enable token verification for each invocation
    dubbo.provider.token=true

    # Specify the registry address
    # Enable local nacos address
    dubbo.registry.address=nacos://localhost:8848?username=nacos&password=nacos

    # Custom protocol edubbo
    dubbo.provider.protocol=edubbo
    ```
* Modify the configuration file in [Consumer](https://github.com/apache/dubbo-samples/blob/master/10-task/dubbo-samples-extensibility/dubbo-samples-extensibility-protocol-consumer/src/main/resources/application.properties) to enable the local nacos address
    ```properties
    # Specify the application name of Dubbo
    dubbo.application.name=extensibility-protocol-consumer

    # Enable token verification for each invocation
    dubbo.provider.token=true

    # Specify the registry address
    # Enable local nacos address
    dubbo.registry.address=nacos://localhost:8848?username=nacos&password=nacos

    # Custom protocol edubbo
    dubbo.consumer.protocol=edubbo
    ```

## Task Details

Implement a custom protocol `edubbo` based on the existing `dubbo` protocol.

## Implementation Method

Wrap the existing `dubbo` protocol to implement the `edubbo` protocol.

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
                                    |-EnhancedProtocol.java (Implement Protocol interface)
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
                |-org.apache.dubbo.rpc.Protocol (

Plain text file)
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

Add the following configuration to the `resources/META-INF/dubbo/org.apache.dubbo.rpc.Protocol` file:
```properties
edubbo=org.apache.dubbo.samples.extensibility.protocol.common.EnhancedProtocol
```

##### Consumer

Add the following configuration to the `resources/META-INF/dubbo/org.apache.dubbo.rpc.Protocol` file:
```properties
edubbo=org.apache.dubbo.samples.extensibility.protocol.common.EnhancedProtocol
```

#### Configuration File

##### Provider

Add the following configuration to the `resources/application.properties` file:
```properties
# Custom protocol
dubbo.provider.protocol=edubbo
```

##### Consumer

Add the following configuration to the `resources/application.properties` file:
```properties
# Custom protocol
dubbo.consumer.protocol=edubbo
```

## Execution Results

Run the task using the **Using Local IDE** method, and the results are as follows:

#### Register Protocol

![dubbo-samples-extensibility-protocol-output2.jpg](/imgs/v3/tasks/extensibility/dubbo-samples-extensibility-protocol-output2.jpg)

#### Output Result

![dubbo-samples-extensibility-protocol-output1.png](/imgs/v3/tasks/extensibility/dubbo-samples-extensibility-protocol-output1.png)

In summary, Dubbo provides a powerful and flexible protocol extension mechanism. This tutorial demonstrates how to create a custom protocol `edubbo` based on the existing `dubbo` protocol, which allows users to add custom logic without changing the underlying architecture.