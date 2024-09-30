---
description: 快速部署Dubbo应用
linkTitle: 部署Dubbo应用
title: 快速部署Dubbo应用
type: docs
weight: 3
---

在上一篇文章中，我们学习了如何开发基于 Spring Boot 的 Dubbo 应用。接下来，我们将学习部署这个 Dubbo 应用。

本文将以 Kubernetes 集群作为基础环境来讲解 Dubbo 应用的部署，部署架构如下图所示：

<img alt="Dubbo+Kubernetes+Nacos 部署架构图" src="/imgs/v3/quickstart/nacos-kubernetes-deployment.png" style="max-width:700px;">

{{% alert title="注意" color="info" %}}
在实际使用中可能会选择不同的部署环境与架构，如使用服务网格(Service Mesh)、虚拟机等多种部署模式，请参考 [部署文档](../../tasks/deploy/) 了解更多详细内容。
{{% /alert %}}

## 部署应用
我们为您提前准备好了示例项目的镜像与部署文件，您可以使用如下命令将示例快速部署到 Kubernetes 集群（请确保在示例源码根目录执行如下命令）：

```shell
kubectl apply -f ./Kubernetes-manifests.yaml
```

以上命令将自动部署如下资源：
* dubbo-system 命名空间
	* Nacos Deployment
	* Nacos Service
* dubbo-quickstart 命名空间
	* Quickstart Deployment
	* Quickstart Service

运行以下命令，确认资源已经部署成功：

```sh
kubectl get services -n dubbo-system
```

```sh
kubectl get services -n dubbo-quickstart
```

## 访问应用
部署成功后，可以通过以下方式检查应用状态。

{{< tabpane text=true >}}
{{< tab header="请根据情况选择：" disabled=true />}}
{{% tab header="本地 Kubernetes 集群" lang="en" %}}
<br/>

执行以下命令进行本地端口映射：

```shell
kubectl port-forward <pod-name> 50051:50051 -n dubbo-quickstart
```

通过 curl 访问服务：

```shell
curl \
	--header "Content-Type: application/json" \
	--data '["Dubbo"]' \
	http://localhost:50051/org.apache.dubbo.samples.quickstart.dubbo.api.DemoService/sayHello/
```

{{% /tab %}}

{{% tab header="阿里云 ACK 集群" lang="zh-cn" %}}
<br/>

对于云上托管的 Kubernetes 集群，您同样可以使用 port-forward 的方式进行本地访问。除此之外，您也可以通过配置负载均衡（Load Balancer）开放公网访问方式，如下图所示：

<img alt="阿里云托管部署架构图" src="/imgs/v3/quickstart/nacos-kubernetes-deployment.png" style="max-width:500px;">

{{% /tab %}}
{{< /tabpane >}}

## 附录

如果你有修改示例源码并需要重新打包 docker 镜像，请在示例根目录运行如下命令，随后将镜像推送到远端镜像仓库并修改 `kubernetes-manifests.yaml` 中的镜像地址后重新部署。

```shell
docker build -f ./Dockerfile --build-arg APP_FILE=quickstart-service-0.0.1-SNAPSHOT.jar -t demo:latest .
```

本示例 Kubernetes 部署资源文件也可在 Github 访问：[https://raw.githubusercontent.com/apache/dubbo-samples/master/11-quickstart/Kubernetes-manifests.yaml](https://raw.githubusercontent.com/apache/dubbo-samples/master/11-quickstart/Kubernetes-manifests.yaml)。

```yaml
# Namespace
apiVersion: v1
kind: Namespace
metadata:
  name: dubbo-quickstart
---
apiVersion: v1
kind: Namespace
metadata:
  name: dubbo-system
---

# Nacos
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nacos
  namespace: dubbo-system
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nacos
  template:
    metadata:
      labels:
        app: nacos
    spec:
      containers:
        - name: consumer
          image: nacos-registry.cn-hangzhou.cr.aliyuncs.com/nacos/nacos-server:v2.1.2
          imagePullPolicy: Always
          resources:
            requests:
              memory: "2Gi"
              cpu: "500m"
          ports:
            - containerPort: 8848
              name: client
            - containerPort: 9848
              name: client-rpc
          env:
            - name: NACOS_SERVER_PORT
              value: "8848"
            - name: NACOS_APPLICATION_PORT
              value: "8848"
            - name: PREFER_HOST_MODE
              value: "hostname"
            - name: MODE
              value: "standalone"
            - name: NACOS_AUTH_ENABLE
              value: "true"
---
apiVersion: v1
kind: Service
metadata:
  name: nacos
  namespace: dubbo-system
spec:
  type: ClusterIP
  sessionAffinity: None
  selector:
    app: nacos
  ports:
    - port: 8848
      name: server
      targetPort: 8848
    - port: 9848
      name: client-rpc
      targetPort: 9848
---

apiVersion: apps/v1
kind: Deployment
metadata:
  name: quickstart
  namespace: dubbo-quickstart
spec:
  replicas: 1
  selector:
    matchLabels:
      app: quickstart
  template:
    metadata:
      labels:
        app: quickstart
    spec:
      containers:
        - name: quickstart
          image: sca-registry.cn-hangzhou.cr.aliyuncs.com/dubbo/dubbo-quickstart:1.0
          imagePullPolicy: Always
          ports:
            - name: dubbo
              containerPort: 50051
              protocol: TCP
            - name: dubbo-qos
              containerPort: 22222
              protocol: TCP
          env:
            - name: JAVA_TOOL_OPTIONS
              value: "-Dnacos.address=nacos.dubbo-system.svc"
---

apiVersion: v1
kind: Service
metadata:
  name: quickstart
  namespace: dubbo-quickstart
spec:
  selector:
    app: quickstart
  ports:
    - name: tcp
      port: 50051
      targetPort: 50051
    - name: http
      port: 22222
      targetPort: 22222
---
```



