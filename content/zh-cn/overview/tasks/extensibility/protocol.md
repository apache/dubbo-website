---
aliases:
    - /zh/overview/tasks/extensibility/protocol/
description: 自定义协议
linkTitle: Protocol
no_list: true
title: Protocol
type: docs
weight: 2
---

Dubbo 通过协议扩展实现了很多内置的功能，同时也支持很多常用的协议。所有的自定义协议在`org.apache.dubbo.rpc.Protocol`文件中可以看到，以Dubbo 3为例，具体如下：

```properties
# Dubbo通过协议扩展实现的内置功能
filter=org.apache.dubbo.rpc.cluster.filter.ProtocolFilterWrapper
qos=org.apache.dubbo.qos.protocol.QosProtocolWrapper
registry=org.apache.dubbo.registry.integration.InterfaceCompatibleRegistryProtocol
service-discovery-registry=org.apache.dubbo.registry.integration.RegistryProtocol
listener=org.apache.dubbo.rpc.protocol.ProtocolListenerWrapper
mock=org.apache.dubbo.rpc.support.MockProtocol
serializationwrapper=org.apache.dubbo.rpc.protocol.ProtocolSerializationWrapper
securitywrapper=org.apache.dubbo.rpc.protocol.ProtocolSecurityWrapper

# Dubbo对外支持的常用协议
dubbo=org.apache.dubbo.rpc.protocol.dubbo.DubboProtocol
injvm=org.apache.dubbo.rpc.protocol.injvm.InjvmProtocol
rest=org.apache.dubbo.rpc.protocol.rest.RestProtocol
grpc=org.apache.dubbo.rpc.protocol.grpc.GrpcProtocol
tri=org.apache.dubbo.rpc.protocol.tri.TripleProtocol
```

我们可以看到，在Dubbo中通过协议扩展的能力实现了过滤、监控数据采集、服务发现、监听器、mock、序列化、安全等一系列能力，同时对外提供了`dubbo`，`injvm`，`rest`，`grpc`和`tri`协议。

自定义一套私有协议有两种方式，第一种是对原有的协议进行包装，添加一些特定的业务逻辑。另外一种是完全自定义一套协议。前者实现简单，在`dubbo`中也是有广泛的使用，比如：`ProtocolFilterWrapper`, `QosProtocolWrapper`, `ProtocolListenerWrapper`等。后者实现复杂，一般常见的协议`dubbo`都实现了，并且通过了大量生产实践的验证。

本文会通过示例演示如何通过现有协议实现一套自定义协议。

## 开始之前

有两种部署运行方式，二选一
### 基于Kubernetes
* 安装[Kubernetes](https://kubernetes.io/docs/tasks/tools/)环境
* 修改[Provider](https://github.com/apache/dubbo-samples/blob/master/10-task/dubbo-samples-extensibility/dubbo-samples-extensibility-protocol-provider/src/main/resources/application.properties)中的配置文件，启用Kubernetes中部署的nacos的地址
    ```properties
    # Specify the application name of Dubbo
    dubbo.application.name=extensibility-protocol-provider

    # Enable token verification for each invocation
    dubbo.provider.token=true

    # Specify the registry address
    # dubbo.registry.address=nacos://localhost:8848?username=nacos&password=nacos
    dubbo.registry.address=nacos://${nacos.address:localhost}:8848?username=nacos&password=nacos

    # 自定义协议edubbo
    dubbo.provider.protocol=edubbo
    ```
* 修改[Consumer](https://github.com/apache/dubbo-samples/blob/master/10-task/dubbo-samples-extensibility/dubbo-samples-extensibility-protocol-consumer/src/main/resources/application.properties)中的配置文件，启用Kubernetes中部署的nacos的地址
    ```properties
    # Specify the application name of Dubbo
    dubbo.application.name=extensibility-protocol-consumer

    # Enable token verification for each invocation
    dubbo.provider.token=true

    # Specify the registry address
    # dubbo.registry.address=nacos://localhost:8848?username=nacos&password=nacos
    dubbo.registry.address=nacos://${nacos.address:localhost}:8848?username=nacos&password=nacos

    # 自定义协议edubbo
    dubbo.consumer.protocol=edubbo
    ```
* 部署`[Extensibility Protocol Task](https://github.com/apache/dubbo-samples/blob/master/10-task/dubbo-samples-extensibility/deploy/All.yml)`

### 使用本地IDE
* 部署[Nacos](https://nacos.io/zh-cn/docs/quick-start.html)2.2.0版本
* 修改[Provider](https://github.com/apache/dubbo-samples/blob/master/10-task/dubbo-samples-extensibility/dubbo-samples-extensibility-protocol-provider/src/main/resources/application.properties)中的配置文件，启用本地nacos的地址
    ```properties
    # Specify the application name of Dubbo
    dubbo.application.name=extensibility-protocol-provider

    # Enable token verification for each invocation
    dubbo.provider.token=true

    # Specify the registry address
    # 启用本地nacos的地址
    dubbo.registry.address=nacos://localhost:8848?username=nacos&password=nacos
    # dubbo.registry.address=nacos://${nacos.address:localhost}:8848?username=nacos&password=nacos

    # 自定义协议edubbo
    dubbo.provider.protocol=edubbo
    ```
* 修改[Consumer](https://github.com/apache/dubbo-samples/blob/master/10-task/dubbo-samples-extensibility/dubbo-samples-extensibility-protocol-consumer/src/main/resources/application.properties)中的配置文件，启用本地nacos的地址
    ```properties
    # Specify the application name of Dubbo
    dubbo.application.name=extensibility-protocol-consumer

    # Enable token verification for each invocation
    dubbo.provider.token=true

    # Specify the registry address
    # 启用本地nacos的地址
    dubbo.registry.address=nacos://localhost:8848?username=nacos&password=nacos
    # dubbo.registry.address=nacos://${nacos.address:localhost}:8848?username=nacos&password=nacos

    # 自定义协议edubbo
    dubbo.consumer.protocol=edubbo
    ```

## 任务详情

基于现有的`dubbo`协议来实现自定义协议`edubbo`。

## 实现方式

通过对`dubbo`协议进行包装来实现`edubbo`协议。

#### 代码结构

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
                                    |-EnhancedProtocol.java (实现Protocol接口)
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
            |-application.properties (Dubbo Provider配置文件)
            |-dubbo
                |-org.apache.dubbo.rpc.Protocol (纯文本文件)
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
            |-application.properties (Dubbo Consumer配置文件)
            |-dubbo
                |-org.apache.dubbo.rpc.Protocol (纯文本文件)
```

#### 代码详情
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

#### SPI配置

##### Provider

在`resources/META-INF/dubbo/org.apache.dubbo.rpc.Protocol`文件中添加如下配置：
```properties
edubbo=org.apache.dubbo.samples.extensibility.protocol.common.EnhancedProtocol
```

##### Consumer

在`resources/META-INF/dubbo/org.apache.dubbo.rpc.Protocol`文件中添加如下配置：
```properties
edubbo=org.apache.dubbo.samples.extensibility.protocol.common.EnhancedProtocol
```

#### 配置文件

##### Provider

在`resources/application.properties`文件中添加如下配置：
```properties
# 自定义协议
dubbo.provider.protocol=edubbo
```

##### Consumer

在`resources/application.properties`文件中添加如下配置：
```properties
# 自定义协议
dubbo.consumer.protocol=edubbo
```

## 运行结果
以**使用本地IDE**的方式来运行任务，结果如下：

#### 注册协议

![dubbo-samples-extensibility-protocol-output2.jpg](/imgs/v3/tasks/extensibility/dubbo-samples-extensibility-protocol-output2.jpg)

#### 输出结果

![dubbo-samples-extensibility-protocol-output1.png](/imgs/v3/tasks/extensibility/dubbo-samples-extensibility-protocol-output1.png)
