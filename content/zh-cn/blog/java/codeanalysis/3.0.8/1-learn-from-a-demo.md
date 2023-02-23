---
title: "01 从一个服务提供者的Demo说起"
linkTitle: "1-从一个服务提供者的Demo说起"
date: 2022-08-01
author: 宋小生
tags: ["源码解析", "Java"]
description: Dubbo 源码解析之从一个服务提供者的Demo说起
---

# 1 从一个服务提供者的Demo说起

为了更方便了解原理,我们先来编写一个Demo,从例子中来看源码实现:

## 1.1 启动Zookeeper

为了Demo可以正常启动,需要我们先在本地启动一个Zookeeper如下图所示:
![在这里插入图片描述](/imgs/blog/source-blog/1-zookeeper.png)


## 1.2 服务提供者
接下来给大家贴一下示例源码,这个源码来源于Dubbo源码目录的	dubbo-demo/dubbo-demo-api 目录下面的dubbo-demo-api-provider子项目,这里我做了删减,方便看核心代码:
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
```


```java
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

## 1.3 启用服务
有了服务接口之后我们来启用服务,启用服务的源码如下:

```java
import org.apache.dubbo.common.constants.CommonConstants;
import org.apache.dubbo.config.ApplicationConfig;
import org.apache.dubbo.config.MetadataReportConfig;
import org.apache.dubbo.config.ProtocolConfig;
import org.apache.dubbo.config.RegistryConfig;
import org.apache.dubbo.config.ServiceConfig;
import org.apache.dubbo.config.bootstrap.DubboBootstrap;
import org.apache.dubbo.demo.DemoService;

public class Application {
    public static void main(String[] args) throws Exception {
            startWithBootstrap();
    }
    private static void startWithBootstrap() {
        ServiceConfig<DemoServiceImpl> service = new ServiceConfig<>();
        service.setInterface(DemoService.class);
        service.setRef(new DemoServiceImpl());
        DubboBootstrap bootstrap = DubboBootstrap.getInstance();
        bootstrap.application(new ApplicationConfig("dubbo-demo-api-provider"))
            .registry(new RegistryConfig("zookeeper://127.0.0.1:2181"))
            .protocol(new ProtocolConfig(CommonConstants.DUBBO, -1))
            .service(service)
            .start()
            .await();
    }
}
```

## 1.4 启用服务后写入Zookeeper的节点数据
启动服务,这个时候我们打开Zookeeper图形化客户端来看看这个服务在Zookeeper上面写入来哪些数据,如下图:
![在这里插入图片描述](/imgs/blog/source-blog/1-zookeeper-data.png)
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


原文： [<<从一个服务提供者的Demo说起>>](https://blog.elastic.link/2022/07/10/dubbo/1-cong-yi-ge-demo-shuo-qi/ )
