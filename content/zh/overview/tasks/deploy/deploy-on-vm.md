---
type: docs
title: "部署 Dubbo 应用到虚拟机环境"
linkTitle: "部署到虚拟机"
weight: 1
description: ""
---

## 总体目标
- 虚拟机环境
- 部署 Zookeeper
- 部署 Dubbo-admin + Zookeeper
- 部署 Provider + Zookeeper 与 Consumer + Zookeeper

## 基本流程与工作原理

![](/imgs/v3/tasks/deploy/linux.jpg)

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
mkdir data && cd data && echo 1 > myid
```

切换至 zookeeper 配置文件
```
cd .. && cp conf/zoo_sample.cfg conf/zoo.cfg && vim conf/zoo.cfg
```

配置
```
# zoo.cfg
tickTime=2000
initLimit=10
syncLimit=5
dataDir=/usr/local/zookeeper/data
clientPort=2181
admin.serverPort=2182
```

启动 zookeeper
```
./bin/zkServer.sh start
```

克隆项目到本地
```
git clone https://github.com/apache/dubbo-samples.git && cd dubbo-samples/1-basic/dubbo-samples-spring-boot
```

打包编译
```
mvn clean package
```

```
[INFO] ------------------------------------------------------------------------
[INFO] Reactor Summary:
[INFO]
[INFO] Dubbo Samples Spring Boot 1.0-SNAPSHOT ............. SUCCESS [  0.178 s]
[INFO] dubbo-samples-spring-boot-interface ................ SUCCESS [  2.169 s]
[INFO] dubbo-samples-spring-boot-provider ................. SUCCESS [12:37 min]
[INFO] dubbo-samples-spring-boot-consumer 1.0-SNAPSHOT .... SUCCESS [  0.219 s]
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time: 12:54 min
[INFO] Finished at: 2023-01-16T01:17:09-05:00
[INFO] ------------------------------------------------------------------------
```

### dubbo-admin

克隆项目到本地
```
# 默认配置
git clone https://github.com/apache/dubbo-admin.git && cd dubbo-admin
# 修改配置
git clone https://github.com/apache/dubbo-admin.git && cd dubbo-admin && vim dubbo-admin-server/src/main/resources/application.properties
```

配置
```
# dubbo-admin-server/src/main/resources/application.properties
server.port=38080
dubbo.protocol.port=30880
dubbo.application.qos-port=32222

admin.registry.address=zookeeper://127.0.0.1:2181
admin.config-center=zookeeper://127.0.0.1:2181
admin.metadata-report.address=zookeeper://127.0.0.1:2181

admin.root.user.name=root
admin.root.user.password=root
```
打包编译
```
mvn clean package -Dmaven.test.skip=true
```

切换至目标服务
```
cd dubbo-admin/dubbo-admin-server/target
```

后台运行
```
nohup java -jar dubbo-admin-server-0.5.0-SNAPSHOT.jar > /dev/null 2>&1 &
```

进入服务
```
http://<IP>:38080
```

登录页面
![](/imgs/v3/tasks/deploy/dubbo-admin-login.jpg)

服务查询
![](/imgs/v3/tasks/deploy/dubbo-admin-page.jpg)

### dubbo

克隆项目到本地
```
git clone https://github.com/apache/dubbo-samples.git && cd dubbo-samples/1-basic/dubbo-samples-spring-boot
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

#### Provider

切换至目标服务
```
cd dubbo-samples-spring-boot-provider/target
```

后台运行
```
nohup java -jar dubbo-samples-spring-boot-provider-1.0-SNAPSHOT.jar > /dev/null 2>&1 &
```

#### Consumer

切换至目标服务
```
cd dubbo-samples-spring-boot-consumer/target
```

后台运行
```
nohup java -jar dubbo-samples-spring-boot-consumer-1.0-SNAPSHOT.jar > /dev/null 2>&1 &
```

查看服务
![](/imgs/v3/tasks/deploy/consumer-provider.jpg)


