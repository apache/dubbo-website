---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/mesh/mesh/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/mesh/mesh/
description: 描述如何对Dubbo mesh proxyless模式进行debug。
linkTitle: Debug参考文档
title: Debug参考文档
type: docs
weight: 2
---






## 前置环境准备

* docker环境
* kubernetes环境（推荐docker desktop，图形化界面，还内嵌了一个小型的Kubernetes环境，后文演示也是基于docker desktop）
* istio环境
* dubbo-samples代码，master分支即可
* dubbo 版本 >= 3.1.0
搭建 Kubernetes 环境
目前 Dubbo 仅支持在 Kubernetes 环境下的 Mesh 部署，所以在运行启动本示例前需要先搭Kubernetes 环境。(建议采用docker desktop进行搭建，直接就可以运行一个kubernetes环境)
https://docs.docker.com/desktop/install/mac-install/

## 搭建 Kubernetes 环境

目前 Dubbo 仅支持在 Kubernetes 环境下的 Mesh 部署，所以在运行启动本示例前需要先搭Kubernetes 环境。(建议采用docker desktop进行搭建，直接就可以运行一个kubernetes环境)
https://docs.docker.com/desktop/install/mac-install/

## 搭建 Istio 环境

搭建 Istio 环境参考文档：
Istio 安装文档(https://istio.io/latest/docs/setup/getting-started/)
注：安装 Istio 的时候需要开启 first-party-jwt 支持（使用 istioctl 工具安装的时候加上 --set values.global.jwtPolicy=first-party-jwt 参数），否则将导致客户端认证失败的问题。
附安装命令参考：

```java
curl -L https://istio.io/downloadIstio | sh -
cd istio-1.xx.x
export PATH=$PWD/bin:$PATH
istioctl install --set profile=demo --set values.global.jwtPolicy=first-party-jwt -y
```

## 构建dubbo和dubbo-samples环境

进入dubbo-dependencies-bom，更改grpc版本为1.41.0

```java
<grpc.version>1.41.0</grpc.version>
```

进入dubbo-samples-xds目录，新增配置:

```java
dubbo.application.metadataServiceProtocol=dubbo
```

打包dubbo代码，切换到dubbo根目录，执行以下命令进行打包:

```java
mvn clean package -DskipTests
```

切换到dubbo-samples代码，在dubbo-samples-xds的pom文件中引入刚打包好的dubbo代码。
接下来修改debug模式，以dubbo-xds-consumer为例:
更改dubbo-samples-consumer的docker file并更改调试模式为suspend=y, 更改后的docker file文件如下：

```java
FROM openjdk:8-jdk
ADD ./target/dubbo-samples-xds-consumer-1.0-SNAPSHOT.jar dubbo-samples-xds-consumer-1.0-SNAPSHOT.jar
EXPOSE 31000
CMD java -jar -agentlib:jdwp=transport=dt_socket,server=y,suspend=y,address=31000 /dubbo-samples-xds-consumer-1.0-SNAPSHOT.jar
```

随后执行以下命令进行打包：

```java
cd dubbo-samples/dubbo-samples-xds
mvn clean package -DskipTests
```

## 构建docker镜像

```java
cd ./dubbo-samples-xds-provider/
# dubbo-samples-xds/dubbo-samples-xds-provider/Dockerfile
docker build -t apache/dubbo-demo:dubbo-samples-xds-provider_0.0.1 .
cd ../dubbo-samples-xds-consumer/
# dubbo-samples-xds/dubbo-samples-xds-consumer/Dockerfile
docker build -t apache/dubbo-demo:dubbo-samples-xds-consumer_0.0.1 .
cd ../
```

## 创建K8s namespace

```java
# 初始化命名空间
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/dubbo-samples-xds/deploy/Namespace.yml

# 切换命名空间
kubens dubbo-demo
```

如果kubens切换不成功，安装下kubectl即可
## 部署容器

```java
cd ./dubbo-samples-xds-provider/src/main/resources/k8s
# dubbo-samples-xds/dubbo-samples-xds-provider/src/main/resources/k8s/Deployment.yml
# dubbo-samples-xds/dubbo-samples-xds-provider/src/main/resources/k8s/Service.yml
kubectl apply -f Deployment.yml
kubectl apply -f Service.yml
cd ../../../../../dubbo-samples-xds-consumer/src/main/resources/k8s
# dubbo-samples-xds/dubbo-samples-xds-consumer/src/main/resources/k8s/Deployment.yml
kubectl apply -f Deployment.yml
cd ../../../../../
```

成功执行上述命令后的docker desktop containers页面长这样，其中dubbo-samples一共出现数个containers，包含consumer和provider：

![docker-desktop.png](/imgs/user/docker-desktop.png)



查看k8s_server_dubbo-samples-xds-provider-XXX日志，出现如下日志：

```java
Dec 28, 2022 8:42:48 AM org.apache.dubbo.config.deploy.DefaultApplicationDeployer info
INFO:  [DUBBO] Dubbo Application[1.1](dubbo-samples-xds-provider) is ready., dubbo version: 1.0-SNAPSHOT, current host: 10.1.5.64
Dec 28, 2022 8:42:49 AM org.apache.dubbo.registry.xds.util.protocol.AbstractProtocol info
INFO:  [DUBBO] receive notification from xds server, type: type.googleapis.com/envoy.config.listener.v3.Listener, dubbo version: 1.0-SNAPSHOT, current host: 10.1.5.64
Dec 28, 2022 8:42:53 AM org.apache.dubbo.registry.xds.util.protocol.AbstractProtocol info
INFO:  [DUBBO] receive notification from xds server, type: type.googleapis.com/envoy.config.listener.v3.Listener, dubbo version: 1.0-SNAPSHOT, current host: 10.1.5.64
dubbo service started
```

![xds-provider-log.png](/imgs/user/xds-provider-log.png)

查看k8s_server_dubbo-samples-xds-consumer-XXX日志，发现其正等待debug连接：
![xds-consumer-listener.png](/imgs/user/xds-consumer-listener.png)
打开命令终端，输入命令查看可用并处于Running状态的pods: 

```java
kubectl get pods
```
![k8s-pods.png](/imgs/user/k8s-pods.png)

输入以下命令将pods的端口映射到本地：

```java
kubectl port-forward dubbo-samples-xds-consumer-64c6c6f444-kk2vr 31000:31000
```

![port-forward.png](/imgs/user/port-forward.png)

切换到idea，edit configuration，debugger mode选择attach to remote JVM，port选择上面docker file expose的端口，module classpath选择dubbo-samples-xds-consumer，并点击debug，即可成功连接
![remote-debug.png](/imgs/user/remote-debug.png)

可以看到断点已经成功进来了：
![xds-debug-success.png](/imgs/user/xds-debug-success.png)
此时查看k8s_server_dubbo-samples-xds-consumer-XXX的日志可以看到已经成功在运行：
![xds-consumer-debug-success-log.png](/imgs/user/xds-consumer-debug-success-log.png)