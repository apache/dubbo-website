---
aliases:
    - /zh/overview/tasks/deploy/deploy-on-k8s-docker/
description: 部署 Dubbo 应用到 Kubernetes + Docker 示例
linkTitle: 部署到 Kubernetes + Docker
title: 部署 Dubbo 应用到 Kubernetes + Docker 环境
type: docs
weight: 3
---


## 总体目标

- [Kubernetes](https://kubernetes.io/docs/setup/production-environment/tools/)
- Zookeeper
- Dubbo-admin + Zookeeper
- Producer + Zookeeper 与 Consumer + Zookeeper

## 基本流程与工作原理

![img](/imgs/v3/tasks/deploy/dubbo-k8s-docker.jpg)

## 详细步骤

创建命名空间
```
kubectl create ns dubbo-demo
```

### zookeeper

获取图表
```
helm repo add bitnami https://charts.bitnami.com/bitnami
```
安装 zookeeper
```
helm install zookeeper bitnami/zookeeper --set persistence.enabled=false -n dubbo-demo
```

查看 zookeeper
```
kubectl get pods -n dubbo-demo
```

### dubbo-admin

克隆项目到本地
```
git clone https://github.com/apache/dubbo-admin.git && cd /dubbo-admin/deploy/k8s
```

创建服务
```
kubectl apply -f ./ -n dubbo-demo
```

启动服务
```
kubectl --namespace dubbo-demo port-forward service/dubbo-admin 38080:38080
```

登录页面
![img](/imgs/v3/tasks/deploy/dubbo-admin-login.jpg)

服务查询
![img](/imgs/v3/tasks/deploy/dubbo-admin-page.jpg)

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

配置
```
### dubbo-samples-spring-boot-provider/src/main/resources/application.yml
dubbo:
  application:
    name: dubbo-springboot-demo-provider
  protocol:
    name: dubbo
    port: -1
  registry:
    id: zk-registry
    address: zookeeper://zookeeper:2181
  config-center:
    address: zookeeper://zookeeper:2181
  metadata-report:
    address: zookeeper://zookeeper:2181
```

配置
```
### dubbo-samples-spring-boot-consumer/src/main/resources/application.yml
dubbo:
  application:
    name: dubbo-springboot-demo-consumer
  protocol:
    name: dubbo
    port: -1
  registry:
    id: zk-registry
    address: zookeeper://zookeeper:2181
  config-center:
    address: zookeeper://zookeeper:2181
  metadata-report:
    address: zookeeper://zookeeper:2181
```

切换到服务示例
```
cd && cd dubbo-samples/1-basic/dubbo-samples-spring-boot
```

打包编译
```
mvn clean package
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

导入服务
```
cat <<EOF > provider.yaml
apiVersion: v1
kind: Pod
metadata:
  name: dubbo-springboot-provider
  namespace: dubbo-demo
spec:
  containers:
  - name: provider
    image: dubbo-springboot-provider:alpine
EOF
```

创建服务
```
kubectl create -f provider.yaml
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

编译服务
```
docker build --no-cache -t dubbo-springboot-consumer:alpine .
```

导入服务
```
cat <<EOF > consumer.yaml
apiVersion: v1
kind: Pod
metadata:
  name: dubbo-springboot-consumer
  namespace: dubbo-demo
spec:
  containers:
  - name: consumer
    image: dubbo-springboot-consumer:alpine
EOF
```

创建服务
```
kubectl create -f consumer.yaml
```

查看服务
![img](/imgs/v3/tasks/deploy/consumer-provider.jpg)
