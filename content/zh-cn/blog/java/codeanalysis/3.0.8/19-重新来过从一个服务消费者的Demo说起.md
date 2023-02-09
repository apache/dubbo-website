---
title: "19 重新来过从一个服务消费者的Demo说起"
linkTitle: "19 重新来过从一个服务消费者的Demo说起"
date: 2022-08-19
author: 宋小生
tags: ["源码解析", "Java"]
description: >
    [Dubbo 3.0.8源码解析] 重新来过从一个服务消费者的Demo说起。
---
# 19 重新来过从一个服务消费者的Demo说起

为了更方便了解原理,我们先来编写一个Demo,从例子中来看源码实现:，前面说了提供者现在已经有服务注册上去了，那接下来我们编写一个消费者的例子来进行服务发现与服务RPC调用。

## 19.1 启动Zookeeper

为了Demo可以正常启动,需要我们先在本地启动一个Zookeeper如下图所示:
![在这里插入图片描述](/imgs/blog/source-blog/19-zk.png)


## 19.2 服务消费者
接下来给大家贴一下示例源码,这个源码来源于Dubbo源码目录的	dubbo-demo/dubbo-demo-api 目录下面的dubbo-demo-api-consumer子项目,这里我做了删减,方便看核心代码:
首先我们定义一个服务接口如下所示:

```java
import java.util.concurrent.CompletableFuture;
public interface DemoService {
    /**
     * 同步处理的服务方法
     * @param name
     * @return
     */
    String sayHello(String name);

    /**
     * 用于异步处理的服务方法
     * @param name
     * @return
     */
    default CompletableFuture<String> sayHelloAsync(String name) {
        return CompletableFuture.completedFuture(sayHello(name));
    }
}

服务实现类如下:

import org.apache.dubbo.rpc.RpcContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.concurrent.CompletableFuture;

public class DemoServiceImpl implements DemoService {
    private static final Logger logger = LoggerFactory.getLogger(DemoServiceImpl.class);

    @Override
    public String sayHello(String name) {
        logger.info("Hello " + name + ", request from consumer: " + RpcContext.getServiceContext().getRemoteAddress());
        return "Hello " + name + ", response from provider: " + RpcContext.getServiceContext().getLocalAddress();
    }

    @Override
    public CompletableFuture<String> sayHelloAsync(String name) {
        return null;
    }

}
```

## 19.3 启用服务消费者
有了服务接口之后我们来启用服务,启用服务的源码如下:
这里如果要启动消费者,主要要修改QOS端口这里我已经配置可以直接复用
```java

package link.elastic.dubbo.consumer;

import link.elastic.dubbo.entity.DemoService;
import org.apache.dubbo.common.constants.CommonConstants;
import org.apache.dubbo.config.ApplicationConfig;
import org.apache.dubbo.config.MetadataReportConfig;
import org.apache.dubbo.config.ProtocolConfig;
import org.apache.dubbo.config.ReferenceConfig;
import org.apache.dubbo.config.RegistryConfig;
import org.apache.dubbo.config.bootstrap.DubboBootstrap;
import org.apache.dubbo.rpc.service.GenericService;

public class ConsumerApplication {
    public static void main(String[] args) {
            runWithBootstrap();
    }
    private static void runWithBootstrap() {
        ReferenceConfig<DemoService> reference = new ReferenceConfig<>();
        reference.setInterface(DemoService.class);
        reference.setGeneric("true");
        reference.setProtocol("");

        DubboBootstrap bootstrap = DubboBootstrap.getInstance();
        ApplicationConfig applicationConfig = new ApplicationConfig("dubbo-demo-api-consumer");
        applicationConfig.setQosEnable(false);
        applicationConfig.setQosPort(-1);
        bootstrap.application(applicationConfig)
            .registry(new RegistryConfig("zookeeper://8.131.79.126:2181"))
            .protocol(new ProtocolConfig(CommonConstants.DUBBO, -1))
            .reference(reference)
            .start();

        DemoService demoService = bootstrap.getCache().get(reference);
        String message = demoService.sayHello("dubbo");
        System.out.println(message);

        // generic invoke
        GenericService genericService = (GenericService) demoService;
        Object genericInvokeResult = genericService.$invoke("sayHello", new String[]{String.class.getName()},
            new Object[]{"dubbo generic invoke"});
        System.out.println(genericInvokeResult);
    }
}

```

## 1.4 启用服务后写入Zookeeper的节点数据
启动服务,这个时候我们打开Zookeeper图形化客户端来看看这个服务在Zookeeper上面写入来哪些数据,如下图:
在这里插入图片描述
![在这里插入图片描述](/imgs/blog/source-blog/19-zk2.png)

写入Zookeper上的节点用于服务在分布式场景下的协调,这些节点是比较重要的。

如果了解过Dubbo的同学,应该会知道Dubbo在低版本的时候会向注册中心中写入服务接口,具体路径在上面的  **dubbo目录下**  ,然后在 **/dubbo/服务接口/** 路径下写入如下信息:
* **服务提供者**配置信息URL形式
* **服务消费者**的配置信息URL形式
* 服务**路由信息**
* **配置信息**

上面这个图就是Dubbo3的注册信息了,后面我们也会围绕细节来说明下,这里可以看下新增了:
* /dubbo/metadata **元数据信息**
* /dubbo/mapping 服务和应用的**映射信息** 
* /dubbo/config **注册中心配置** 
 * /services目录**应用信息** 

在这里可以大致了解下,在后面会有更详细的源码解析这个示例代码.通过透析代码来看透Dubbo3服务注册原理,服务提供原理。


原文地址：[19-重新来过从一个服务消费者的Demo说起](https://blog.elastic.link/2022/07/10/dubbo/19-chong-xin-lai-guo-cong-yi-ge-fu-wu-xiao-fei-zhe-de-demo-shuo-qi/)