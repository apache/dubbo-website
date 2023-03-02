---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/others/docker/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/others/docker/
description: 将 Dubbo 部署到 Docker 环境
linkTitle: Dubbo 部署 Docker 环境
title: Dubbo 部署 Docker 环境
type: docs
weight: 6
---





## 特性说明
一些部署场景需要动态地指定服务注册地址。例如，docker bridge网络模式需要为外部网络通信指定一个注册主机IP。Dubbo在启动阶段提供了两对系统属性，用于设置外部通信的IP和端口地址。
* DUBBO_IP_TO_REGISTRY --- 注册到注册中心的IP地址
* DUBBO_PORT_TO_REGISTRY --- 注册到注册中心的端口
* DUBBO_IP_TO_BIND --- 侦听IP地址
* DUBBO_PORT_TO_BIND --- 侦听端口

> 1. 以上四个配置是可选的。如果没有配置，Dubbo会自动获得IP和端口。请根据部署情况，灵活选择。
> 2. Dubbo支持多协议. **如果一个应用程序同时暴露了多个不同的协议服务，并且需要为每个服务分别指定IP或端口。请在上述属性前分别添加协议前缀。** 
> * HESSIAN_DUBBO_PORT_TO_BIND    hessian 协议绑定端口
> * DUBBO_DUBBO_PORT_TO_BIND      dubbo 协议绑定端口
> * HESSIAN_DUBBO_IP_TO_REGISTRY  hessian 协议注册的IP
> * DUBBO_DUBBO_IP_TO_REGISTRY      dubbo 协议注册的IP
> 3. `PORT_TO_REGISTRY`或`IP_TO_REGISTRY`不会被用作默认的`PORT_TO_BIND`或`IP_TO_BIND`，但相反的是 true。
> * 如果设置`PORT_TO_REGISTRY=20881` `IP_TO_REGISTRY=30.5.97.6`，那么 `PORT_TO_BIND` `IP_TO_BIND`不会受到影响。
> * 如果设置`PORT_TO_BIND=20881` `IP_TO_BIND=30.5.97.6`，那么 `PORT_TO_REGISTRY=20881` `IP_TO_REGISTRY=30.5.97.6` 默认情况下。

## 使用场景
提供隔离的环境，从而确保在开发和部署过程中服务不会受到彼此的影响,对于微服务的开发和部署有很大帮助。

## 使用方式
[dubbo-docker-sample](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-docker) 本地操作过程：

1. 克隆项目到本地
```sh
git clone git@github.com:dubbo/dubbo-docker-sample.git
cd dubbo-docker-sample
```
2. 包本地的maven
```sh
mvn clean install
```
3. 通过docker build建立一个镜像
```sh
docker build --no-cache -t dubbo-docker-sample .
```
4. 构建镜像
```sh
FROM openjdk:8-jdk-alpine
ADD target/dubbo-docker-sample-0.0.1-SNAPSHOT.jar app.jar
ENV JAVA_OPTS=""
ENTRYPOINT exec java $JAVA_OPTS -jar /app.jar
```
5. 从镜像中创建和运行容器
```sh
# 由于我们使用zk注册中心，我们先启动zk容器
docker run --name zkserver --restart always -d zookeeper:3.4.9
```
```sh
docker run -e DUBBO_IP_TO_REGISTRY=30.5.97.6 -e DUBBO_PORT_TO_REGISTRY=20881 -p 30.5.97.6:20881:20880 --link zkserver:zkserver -it --rm dubbo-docker-sample
```

> 假设主机IP是 30.5.97.6.
> 通过环境变量设置提供商注册的IP地址和注册中心的端口 `DUBBO_IP_TO_REGISTRY=30.5.97.6` `DUBBO_PORT_TO_REGISTRY=20881`    
> 通过以下方式实现端口映射`-p 30.5.97.6:20881:20880`, 其中20880是由dubbo自动选择的监听端口。没有监控IP的配置，所以它将监听0.0.0.0（所有IP）。
> 启动后，提供者的注册地址是30.5.97.6:20881，而容器的监听地址是：0.0.0.0:20880。  

6. 测试从另一个主机或容器中执行
```sh
telnet 30.5.97.6 20881
ls
invoke org.apache.dubbo.test.docker.DemoService.hello("world")
```