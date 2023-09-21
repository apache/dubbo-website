---
description:
linkTitle: 快速体验 Dubbo 开发与部署
title: 快速开发和部署一个 Dubbo 应用
type: docs
weight: 1
---

接下来，我们将跟随文档完成：
1. 创建一个 Dubbo 应用
2. 将应用打包为 Docker 镜像
3. 将镜像部署到 Kubernetes 集群

## 前置条件
{{% alert title="注意" color="warning" %}}
我们会将应用部署到 Kubernetes，因此请确保您有一个本地环境可访问的 Kuberentes 集群。
{{% /alert %}}

Dubbo 提供了相应的工具和解决方案来简化整个微服务开发、打包与部署过程，所以开始前我们需要先安装 `dubboctl` 工具。

```sh
curl -L https://dubbo.apache.org/downloadKube.sh | sh -
```

```shell
cd dubbo-kube-$version
```

```sh
export PATH=$PWD/bin:$PATH
```
## 快速创建 Dubbo 应用
在任意目录，运行以下命令即可生成一个基本的 Dubbo 应用。

{{< tabpane >}}
{{< tab header="请选择开发语言：" disabled=true />}}
{{< tab header="Java" lang="shell" >}}
dubboctl create -l java dubbo-hello
cd dubbo-hello
{{< /tab >}}
{{< tab header="Go" lang="shell" >}}
dubboctl create -l go dubbo-hello
cd dubbo-hello
{{< /tab >}}
{{< tab header="Web" lang="shell" >}}
dubboctl create -l web dubbo-hello
cd dubbo-hello
{{< /tab >}}
{{< tab header="Node.js" lang="shell" >}}
dubboctl create -l nodejs dubbo-hello
cd dubbo-hello
{{< /tab >}}
{{< tab header="Rust" lang="shell" >}}
dubboctl create -l rust dubbo-hello
cd dubbo-hello
{{< /tab >}}
{{< /tabpane >}}

<br/>
以 `java` 为例，项目目录结构如下：

```Java
```

## 初始化微服务集群
dubboctl 可以帮助我们快速的初始化微服务集群中需要的注册中心、监控系统、服务治理中心等组件，只需要运行以下命令：

```sh
dubboctl manifest install --profile=demo
```

> 作为示例用途，以上命令会一键安装 Zookeeper、Console、Prometheus、Grafana、Zipkin、Ingress 等组件，关于 `--profile=demo` 更多解释及可选值请参见文档说明。

运行以下命令检查集群初始化准备就绪

```sh
kubectl get services -n dubbo-system
```

## 部署应用
{{% alert title="注意" color="warning" %}}
为了快速体验应用部署过程，我们将跳过本地源码构建的过程，直接是使用官方预先构建好的 Docker 镜像进行部署。如果您想了解如何从源码构建镜像，请参考下一篇 [定制开发微服务应用](../customize)。
{{% /alert %}}

在刚刚创建的示例项目根目录，运行以下命令生成 Kubernetes 资源清单，其中，`--image` 指定了官方预先准备好的示例镜像（镜像与刚刚生成的示例应用源码完全相同）。

```sh
dubboctl deploy --image=docker.io/apache/dubbo-java-quickstart:latest
# 如果使用 go 语言项目模板，则请使用 dubbo-go-quickstart:latest，其他语言类推
```

命令执行成功后，可以在当前目录看到生成的 `kube.yaml` 文件，其中包括 deployment、service 等 kubernetes 资源定义。

接下来，将应用部署到 Kubernetes 环境。

```shell
kubectl apply -f ./kube.yaml
```

检查部署状态
```shell
kubectl get services
```

## 访问应用
部署成功后，可以通过以下方式检查应用状态。

{{< tabpane text=true >}}
{{< tab header="请根据情况选择：" disabled=true />}}
{{% tab header="本地集群" lang="en" %}}
1. 如果使用的本地 Kubernetes 集群，请使用以下方式访问应用验证部署状态，执行以下命令：

    ```shell
    dubboctl dashboard admin
    ```

2. 以上命令会自动打开 admin 控制台，如果在您的环境下没有打开，请使用浏览器访问以下地址：

    http://localhost:38080/admin

3. 通过 triple 协议，可以继续测试 Dubbo 服务，执行以下命令进行端口映射：

    ```shell
    kubectl port-forward <pod-name> 50051:50051
    ```

4. 通过 curl 访问服务：

    ```shell
    curl \
        --header "Content-Type: application/json" \
        --data '["Dubbo"]' \
        http://localhost:50051/com.example.demo.dubbo.api.DemoService/sayHello/
    ```

{{% /tab %}}

{{% tab header="阿里云ACK" lang="zh-cn" %}}
对于云上托管的哦 Kubernetes 集群，可以使用以下方式验证，这里以阿里云 ACK 集群为例：

ACK ingerss-controller 的访问方式......

{{% /tab %}}
{{< /tabpane >}}

## 更多内容
{{< blocks/section color="white" height="auto">}}
<div class="td-content list-page">
    <div class="lead"></div><header class="article-meta">
    </header><div class="row">
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                     <a href='{{< relref "./customize" >}}'>部署示例应用到 Kubernetes 集群</a>
                </h4>
                <p>演示如何将当前应用打包为 Docker 镜像，并部署到 Kubernetes 集群。</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                     <a href='{{< relref "./customize" >}}'>示例源码解读</a>
                </h4>
                <p>关于示例应用的源码讲解，学习如何定制 Dubbo Spring Boot 应用。</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                     <a href='{{< relref "./customize" >}}'>使用 dubboctl 创建多语言应用</a>
                </h4>
                <p>如何使用 dubboctl 快速创建 go、node.js、web、rust 等多语言应用。</p>
            </div>
        </div>
    </div>
</div>
<hr>
</div>

{{< /blocks/section >}}
