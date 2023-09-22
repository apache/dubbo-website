---
aliases:
    - /zh/overview/quickstart/java/brief/
description: 演示如何部署 Dubbo 微服务应用到 Kubernetes 集群
linkTitle: 部署微服务应用
title: 部署 Dubbo 微服务应用到 Kubernetes 集群
type: docs
weight: 2
---

在本示例中，我们会将 [上一步开发的 Dubbo 微服务应用](../develop) 以容器镜像模式部署到 Kubernetes 集群，并使用 dubboctl 简化整个部署过程。

## 前置条件
dubbo 提供了相应的工具和解决方案来简化整个 Kubernetes 环境的打包与部署过程，所以开始前我们需要先安装相关工具。

1. 安装 dubboctl（如尚未安装）
    ```sh
    curl -L https://dubbo.apache.org/downloadKube.sh | sh -

    cd dubbo-kube-$version
    export PATH=$PWD/bin:$PATH
    ```

2. dubboctl 安装完成之后，接下来通过以下命令初始化微服务开发环境。

    ```sh
    dubboctl manifest install --profile=demo
    ```

    作为示例用途，以上命令会一键安装 Zookeeper、Console、Prometheus、Grafana、Zipkin、Ingress 等组件，关于 `--profile=demo` 更多解释及可选值请参见文档说明。

3. 检查环境准备就绪

    ```sh
    kubectl get services -n dubbo-system
    ```

## 部署应用
接下来我们为之前创建的应用打包镜像，在应用根目录分别运行以下命令：

```shell
dubboctl build
```

`build` 命令会将源码打包为镜像，并推送到远端仓库，取决于网络情况，可能需要一定时间等待命令执行完成。

```shell
dubboctl deploy
```

`deploy` 命令会使用刚刚 `build` 打包的镜像生成 Kubernetes 资源清单。命令执行成功后，在当前目录看到生成的 `kube.yaml` 文件，其中包括 deployment、service 等 kubernetes 资源定义。


{{% alert title="注意" color="warning" %}}
本地构建可能会花费比较长时间，如您本地构建遇到问题，也可以使用以下命令跳过 `build` 过程。

```sh
dubboctl deploy --image=docker.io/apache/dubbo-java-quickstart:latest
# `--image` 指定使用官方预先准备好的示例镜像
```
{{% /alert %}}

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
{{% tab header="本地 Kubernetes 集群" lang="en" %}}
<br/>

1. 如果使用的本地 Kubernetes 集群，请使用以下方式访问应用验证部署状态：

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
<br/>

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
                     <a href='{{< relref "./deploy" >}}'>如何在虚拟机环境部署 Dubbo 应用</a>
                </h4>
                <p>如果您当前无法使用 Kubernetes，请参考如何在虚拟机环境部署 Dubbo 应用。</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                     <a href='{{< relref "../../mannual/java-sdk/quick-start/spring-boot/" >}}'>Dubbo + Istio 服务网格</a>
                </h4>
                <p>如果您计划使用服务网格，可以了解如何让 Dubbo 应用配合 Istio 控制面部署。</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                     <a href='{{< relref "../../mannual/java-sdk/quick-start/spring-boot/" >}}'>Kubernetes-native 服务发现</a>
                </h4>
                <p>。</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                     <a href='{{< relref "../../mannual/java-sdk/quick-start/spring-boot/" >}}'>原理讲解：如何配置 Dubbo 应用对齐 Kubernetes 生命周期</a>
                </h4>
                <p>。</p>
            </div>
        </div>
    </div>
</div>
<hr>
</div>

{{< /blocks/section >}}
