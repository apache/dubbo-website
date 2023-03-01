---
aliases:
    - /zh/overview/tasks/deploy/deploy-on-docker/
description: 部署 Dubbo 应用到 Docker 示例
linkTitle: 部署到 Docker
title: 部署 Dubbo 应用到 Docker 环境
type: docs
weight: 2
---


## 总体目标

- 部署 [Docker](https://docs.docker.com/engine/install/)
- 部署 Zookeeper
- 部署 Dubbo-admin + Zookeeper
- 部署 Producer + Zookeeper 与 Consumer + Zookeeper

## 基本流程与工作原理

![img](/imgs/v3/tasks/deploy/docker.jpg)

## 详细步骤

### zookeeper

下载项目到本地
```
wget https://dlcdn.apache.org/zookeeper/zookeeper-x.x.x/apache-zookeeper-x.x.x-bin.tar.gz
```
> apache-zookeeper-x.x.x.tar.gz 为未编译版本, 自 3.5.5 版本以后，已编译的 jar 包后缀 `-bin`，请使用 apache-zookeeper-x.x.x-bin.tar.gz

解压项目到本地
```
tar zxvf apache-zookeeper-x.x.x-bin.tar.gz -C /usr/local/ && cd /usr/local
```
移动项目修改为 zookeeper 并切换至 zookeeper
```
mv apache-zookeeper-x.x.x-bin zookeeper && cd zookeeper
```

创建目录并切换此目录导入内容
```
mkdir -p /usr/local/docker/zookeeper/data && cd /usr/local/docker/zookeeper/data && echo 1 > myid
```

拉取 zookeeper
```
docker pull zookeeper
```

运行 zookeeper
```
docker run -p 2181:2181 -p 2888:2888 -p 3888:3888 -v /usr/local/docker/zookeeper/data:/data/ --name zookeeper --restart always -d zookeeper
```

测试 zookeeper
```
docker run -it --rm --link zookeeper:zookeeper zookeeper zkCli.sh -server zookeeper
```

### dubbo-admin

下载项目到本地
```
git clone https://github.com/apache/dubbo-admin.git && cd dubbo-admin
```

配置
```
# dubbo-admin-server/src/main/resources/application.properties
server.port=38080
dubbo.protocol.port=30880
dubbo.application.qos-port=32222

admin.registry.address=zookeeper://<docker-zookeeper-ip>:2181
admin.config-center=zookeeper://<docker-zookeeper-ip>:2181
admin.metadata-report.address=zookeeper://<docker-zookeeper-ip>:2181

admin.root.user.name=root
admin.root.user.password=root
```

```
docker run -it --rm -v /the/host/path/containing/properties:/config -p 38080:38080 apache/dubbo-admin
```
> 将 /the/host/path/containing/properties 替换为宿主机上包含 application.properties 文件的实际路径（必须是一个有效目录的绝对路径）。

进入服务
```
http://<IP>:38080
```

登录页面
![img](/imgs/v3/tasks/deploy/dubbo-admin-login.jpg)

服务查询
![img](/imgs/v3/tasks/deploy/dubbo-admin-page.jpg)

### dubbo

下载项目到本地
```
git clone https://github.com/apache/dubbo-samples.git && cd dubbo-samples/1-basic/dubbo-samples-spring-boot
```

修改 Provider 的 zookeeper 地址
```
# dubbo-samples-spring-boot-provider/src/main/resources/application.yml
dubbo:
  application:
    name: dubbo-springboot-demo-provider
  protocol:
    name: dubbo
    port: -1
  registry:
    id: zk-registry
    address: zookeeper://<docker-zookeeper-ip>:2181
  config-center:
    address: zookeeper://<docker-zookeeper-ip>:2181
  metadata-report:
    address: zookeeper://<docker-zookeeper-ip>:2181
```

修改 Consumer 的 zookeeper 地址
```
# dubbo-samples-spring-boot-consumer/src/main/resources/application.yml
dubbo:
  application:
    name: dubbo-springboot-demo-consumer
  protocol:
    name: dubbo
    port: -1
  registry:
    id: zk-registry
    address: zookeeper://<docker-zookeeper-ip>:2181
  config-center:
    address: zookeeper://<docker-zookeeper-ip>:2181
  metadata-report:
    address: zookeeper://<docker-zookeeper-ip>:2181
```

切换到服务示例
```
cd && cd dubbo-samples/1-basic/dubbo-samples-spring-boot
```

打包编译
```
mvn clean package
```
```
[INFO] ------------------------------------------------------------------------
[INFO] Reactor Summary:
[INFO]
[INFO] Dubbo Samples Spring Boot 1.0-SNAPSHOT ............. SUCCESS [  8.147 s]
[INFO] dubbo-samples-spring-boot-interface ................ SUCCESS [ 51.524 s]
[INFO] dubbo-samples-spring-boot-provider ................. SUCCESS [02:27 min]
[INFO] dubbo-samples-spring-boot-consumer 1.0-SNAPSHOT .... SUCCESS [  0.284 s]
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 03:49 min
[INFO] Finished at: 2023-01-16T09:34:39-05:00
[INFO] ------------------------------------------------------------------------
```

#### Producer

切换至目标服务
```
cd dubbo-samples-spring-boot-provider/target
```

构建镜像
```
cat <<EOF > Dockerfile
FROM openjdk:8-jdk-alpine
ADD dubbo-samples-spring-boot-provider-1.0-SNAPSHOT.jar /app.jar
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/urandom", "-jar", "/app.jar"]
EOF
```

编译镜像
```
docker build --no-cache -t dubbo-springboot-provider:alpine .
```

运行服务
```
docker run --name provider -d dubbo-springboot-provider:alpine
```

#### Consumer

切换至目标服务
```
cd dubbo-samples-spring-boot-consumer/target
```

构建镜像
```
cat <<EOF > Dockerfile
FROM openjdk:8-jdk-alpine
ADD dubbo-samples-spring-boot-consumer-1.0-SNAPSHOT.jar /app.jar
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/urandom", "-jar", "/app.jar"]
EOF
```

编译镜像
```
docker build --no-cache -t dubbo-springboot-consumer:alpine .
```

运行服务
```
docker run --name consumer -d dubbo-springboot-consumer:alpine
```

查看服务
![img](/imgs/v3/tasks/deploy/consumer-provider.jpg)