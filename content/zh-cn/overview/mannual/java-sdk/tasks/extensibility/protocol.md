---
aliases:
    - /zh/overview/tasks/extensibility/protocol/
    - /zh-cn/overview/tasks/extensibility/protocol/
description: 本文讲解如何通过扩展 `org.apache.dubbo.rpc.Protocol` SPI，提供自定义的 RPC 协议实现。
linkTitle: Protocol
no_list: true
title: Protocol
type: docs
weight: 2
---

在 [通信协议](/zh-cn/overview/mannual/java-sdk/tasks/protocols/) 一章中，我们了解了 Dubbo 内置的几个核心 RPC 协议 `dubbo`、`rest`、和`tri` 以及它们的使用方式。本文讲解如何通过扩展 `org.apache.dubbo.rpc.Protocol` SPI，提供自定义的 RPC 协议实现。

自定义一套私有协议有两种方式，第一种是对原有的协议进行包装，添加一些特定的业务逻辑。另外一种是完全自定义一套协议。前者实现简单，在`dubbo`中也是有广泛的使用，比如：`ProtocolFilterWrapper`, `QosProtocolWrapper`, `ProtocolListenerWrapper`等。后者实现相对复杂，但却具有最大的灵活性，比如 Dubbo 框架内置的协议 `dubbo`、`triple` 协议都可以算作这种实现方式。

本示例的完整源码请参见 [dubbo-samples-extensibility](https://github.com/apache/dubbo-samples/blob/master/10-task/dubbo-samples-extensibility/)。除了本示例之外，Dubbo 核心仓库 apache/dubbo 以及扩展库 [apache/dubbo-spi-extensions](https://github.com/apache/dubbo-spi-extensions/tree/master/dubbo-protocol-extensions/) 中的众多 Protocol 实现，都可以作为扩展参考实现：

```properties
# Dubbo对外支持的常用协议
dubbo=org.apache.dubbo.rpc.protocol.dubbo.DubboProtocol
tri=org.apache.dubbo.rpc.protocol.tri.TripleProtocol
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
