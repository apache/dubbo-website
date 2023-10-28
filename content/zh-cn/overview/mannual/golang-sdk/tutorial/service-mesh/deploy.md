---
aliases:
    - /zh/docs3-v2/golang-sdk/tutorial/governance/service-mesh/deploy/
    - /zh-cn/docs3-v2/golang-sdk/tutorial/governance/service-mesh/deploy/
description: Istio 环境部署 Dubbo-go 应用
title: Istio 环境部署 Dubbo-go 应用
type: docs
weight: 2
---






在本章节中，我们将使用应用模板快速创建一组 Dubbo-go Server和 Client 端应用，部署在 Istio 集群中；观察、调试和验证服务发现和调用成功。

## 1. 准备工作

- dubbo-go cli 工具和依赖工具已安装、grpc_cli (如需本地调试)。
- docker、helm、kubectl 环境已安装。（arm 机器需支持 docker buildx）
- [任务【istio 环境部署】](../istio/) 已完成

## 2. 开发 server 端 Dubbo-go 应用

### 2.1 使用 dubbogo-cli 创建项目模板

```plain
$ mkdir mesh-app-server
$ cd mesh-app-server
$ dubbogo-cli newApp . 
$  tree .
.
├── Makefile
├── api
│   └── api.proto
├── build
│   └── Dockerfile
├── chart
│   ├── app
│   │   ├── Chart.yaml
│   │   ├── templates
│   │   │   ├── _helpers.tpl
│   │   │   ├── deployment.yaml
│   │   │   ├── service.yaml
│   │   │   └── serviceaccount.yaml
│   │   └── values.yaml
│   └── nacos_env
│       ├── Chart.yaml
│       ├── templates
│       │   ├── _helpers.tpl
│       │   ├── deployment.yaml
│       │   └── service.yaml
│       └── values.yaml
├── cmd
│   └── app.go
├── conf
│   └── dubbogo.yaml
├── go.mod
├── go.sum
└── pkg
    └── service
        └── service.go
```

生成项目包括几个目录：

- api：放置接口文件：proto文件和生成的pb.go文件
- build：放置构建相关文件
- chart：放置发布用 chart 仓库、基础环境chart 仓库：nacos、mesh（开发中）
- cmd：程序入口
- conf：框架配置
- pkg/service：RPC 服务实现
- Makefile：

- - 镜像、Helm 安装名称：

- - ```
    IMAGE = $(your_repo)/$(namespace)/$(image_name)
    TAG = 1.0.0
    HELM_INSTALL_NAME = dubbo-go-app 
    ```

- - 提供脚本，例如：

- - - make build # 打包镜像并推送
    - make buildx-publish # arm架构本地打包amd64镜像并推送，依赖buildx
    - make deploy  # 通过 helm 发布应用
    - make remove  # 删除已经发布的 helm 应用
    - make proto-gen # api下生成 pb.go 文件
    - ...

### 2.2 开发和部署 Dubbo-go 应用：

#### 开发应用

- 编译接口

  开发人员需要修改 proto 文件，本任务中直接使用默认接口即可。

  ```bash
  $ make proto-gen
  protoc --go_out=./api --go-triple_out=./api ./api/api.proto
  ```

- 拉取依赖

  ```bash
  $ go get dubbo.apache.org/dubbo-go/v3@3.0
  $ make tidy
  go mod tidy
  ```

- 编写业务逻辑

  修改 pkg/service/service.go 实现函数, 返回字符串中显示版本为 v1.0.0

  ```go
  func (s *GreeterServerImpl) SayHello(ctx context.Context, in *api.HelloRequest) (*api.User, error) {
  	return &api.User{Name: "Hello " + in.Name, Id: "v1.0.0"}, nil
  }
  ```

- 修改配置如下字段，从而使用xds协议作为注册中心

  conf/dubbogo.yaml

  ```yaml
  dubbo:
    registries:
      xds:
        protocol: xds
        address: istiod.istio-system.svc.cluster.local:15010
    protocols:
      triple:
        name: tri
        port: 20000
    provider:
      services:
        GreeterServerImpl:
          interface: "" # read from stub
  
  ```

  至此，应用开发完成。

#### 配置构建和部署参数

- 指定需要构建的镜像：

  修改 Makefile 如下字段，指定好需要构建的镜像地址和版本。

  指定好需要通过 helm 安装的名称。

  ```
  IMAGE = xxx/dubbo-go-server
  TAG = 1.0.0
  HELM_INSTALL_NAME = dubbo-go-server-v1
  ```

- 指定需要部署的应用和镜像：

  修改 chart/app/Chart.yaml 如下字段，指定当前应用名为 `dubbo-go-server`，部署时会创建一个名为 dubbo-go-server 的 service ，关联当前应用的所有版本。

  ```yaml
  apiVersion: v1
  name: dubbo-go-server
  description: dubbo-go-server
  ```

  修改 chart/app/values.yaml 如下字段，指定需要部署的镜像以及当前开发的应用版本 dubbogoAppVersion 为 v1。

  部署的镜像需要和上述构建的镜像一致。当前应用版本用于 mesh 流量规则控制。

  ```yaml
  image:
    repository:  xxx/dubbo-go-server
    pullPolicy: Always
    tag: "1.0.0"
  
  # Dubbo-go-mesh version control labels
  version:
    labels:
      dubbogoAppVersion: v1
  ```

  至此，构建参数和发布参数都已指定好，可以进行构建和部署了。

#### 使用模板构建和部署 Dubbo-go 应用

- 构建、推送镜像

  `$ make build  `   (本地为 amd64机器) 

  或者  

  `$ make buildx-publish`     (本地为 arm64机器，依赖 docker buildx 命令)

- 发布 Dubbo-go 应用至集群

  ```bash
  $ make deploy 
  helm install dubbo-go-server-v1 ./chart/app
  NAME: dubbo-go-server-v1
  LAST DEPLOYED: Thu Apr  7 11:19:42 2022
  NAMESPACE: default
  STATUS: deployed
  REVISION: 1
  TEST SUITE: None
  $ helm list
  NAME                    NAMESPACE       REVISION        UPDATED                                 STATUS          CHART                   APP VERSION
  dubbo-go-server-v1      default         1               2022-04-07 11:19:42.350553 +0800 CST    deployed        dubbo-go-server-0.0.1   1.16.0  
  ```

  可看到通过 helm 部署成功

  

### 2.3 验证应用

#### 查看资源部署情况

查看部署好的 deployment ，版本为 v1。

```bash
$ kubectl get deployment 
NAME                 READY   UP-TO-DATE   AVAILABLE   AGE
dubbo-go-server-v1   1/1     1            1           26s
```

查看部署好的 service。

```bash
$ kubectl get svc 
NAME              TYPE        CLUSTER-IP        EXTERNAL-IP   PORT(S)     AGE
dubbo-go-server   ClusterIP   192.168.216.253   <none>        20000/TCP   70s
```

#### （*可选）本地调试部署好的 Dubbo-go 应用

使用 kubectl port-forward Dubbo-go 应用到本地

```bash
$ kubectl port-forward svc/dubbo-go-server 20000
Forwarding from 127.0.0.1:20000 -> 20000
Forwarding from [::1]:20000 -> 20000
```

使用 grpc_cli 调试集群内的应用，参考任务[【使用 grpc_cli 调试 Dubbo-go 应用】](/zh-cn/overview/mannual/golang-sdk/tutorial/debugging/grpc_cli/)

```bash
$ grpc_cli ls localhost:20000 -l
filename: api/api.proto
package: api;
service Greeter {
  rpc SayHello(api.HelloRequest) returns (api.User) {}
  rpc SayHelloStream(stream api.HelloRequest) returns (stream api.User) {}
}
```

使用 grpc_cli 发起调用，测试接口

```bash
$ grpc_cli call localhost:20000 SayHello "name: 'laurence'"
connecting to localhost:20000
name: "Hello laurence"
id: "v1.0.0"
Received trailing metadata from server:
accept-encoding : identity,gzip
grpc-accept-encoding : identity,deflate,gzip
Rpc succeeded with OK status
```

至此，我们成功开发了一个应用，把它部署在了 istio 集群内。

## 3. 开发 Client 端 Dubbo-go 应用

### 3.1 使用 dubbogo-cli 创建另一个项目模板

```bash
$ dubbogo-cli newApp . 
```

### 3.2 开发和部署客户端 Dubbo-go 应用：

#### 编写业务逻辑

- 修改 cmd/app.go 的 main 方法，针对下游接口每秒钟发起一次调用

```go
func main() {
	client := &api.GreeterClientImpl{}
	config.SetConsumerService(client)
	if err := config.Load(); err != nil {
		panic(err)
	}
	request := &api.HelloRequest{
		Name: "laurence",
	}

	for{
		if rsp, err := client.SayHello(context.Background(), request); err != nil{
			logger.Errorf("call server error = %s", err)
		}else{
			logger.Infof("call server response = %+v", rsp)
		}
		time.Sleep(time.Second)
	}
}
```

- 修改如下配置文件，使用xds协议作为注册中心，加载名为 GreeterClientImpl 的客户端服务。

  conf/dubbogo.yaml

  ```yaml
  dubbo:
    registries:
      xds:
        protocol: xds
        address: istiod.istio-system.svc.cluster.local:15010
    consumer:
      references:
        GreeterClientImpl:
          protocol: tri
          interface: "" # read from stub
  ```

  至此，应用开发完成。

#### 配置构建和部署参数

- 指定需要构建的镜像：

  修改 Makefile 如下字段，指定好需要构建的镜像地址和版本。

  指定好需要通过 helm 安装的名称。

  ```
  IMAGE = xxx/dubbo-go-client
  TAG = 1.0.0
  HELM_INSTALL_NAME = dubbo-go-client
  ```

- 指定需要部署的应用和镜像：

  修改 chart/app/Chart.yaml 如下字段，指定当前应用名为 `dubbo-go-client`，部署时会创建一个名为 dubbo-go-client 的 service ，关联当前应用的所有版本。对于一个只有客户端的应用，可以不创建sevice，可以由开发者在模板中修改，本教程中我们默认创建。

  ```yaml
  apiVersion: v1
  name: dubbo-go-client
  description: dubbo-go-client
  ```

  修改 chart/app/values.yaml 如下字段，指定需要部署的镜像以及当前开发的应用版本 dubbogoAppVersion 为 v1。

  部署的镜像需要和上述构建的镜像一致。当前应用版本用于 mesh 流量规则控制。

  ```yaml
  image:
    repository:  xxx/dubbo-go-client
    pullPolicy: Always
    tag: "1.0.0"
  
  # Dubbo-go-mesh version control labels
  version:
    labels:
      dubbogoAppVersion: v1
  ```

  至此，构建参数和发布参数都已指定好，可以进行构建和部署了。

#### 使用模板构建和部署 Dubbo-go 应用

- 构建、推送镜像

  `$ make build  `   (本地为 amd64机器) 

  或者  

  `$ make buildx-publish`     (本地为 arm64机器，依赖 docker buildx 命令)

- 发布 Dubbo-go Client 应用至集群

  ```bash
  $ make deploy 
  helm install dubbo-go-client ./chart/app
  NAME: dubbo-go-client
  LAST DEPLOYED: Thu Apr  7 11:49:55 2022
  NAMESPACE: default
  STATUS: deployed
  REVISION: 1
  TEST SUITE: None
  $ helm list
  NAME                    NAMESPACE       REVISION        UPDATED                                 STATUS          CHART                   APP VERSION
  dubbo-go-client         default         1               2022-04-07 11:49:55.517898 +0800 CST    deployed        dubbo-go-client-0.0.1   1.16.0     
  dubbo-go-server-v1      default         1               2022-04-07 11:23:18.397658 +0800 CST    deployed        dubbo-go-server-0.0.1   1.16.0
  ```

  可看到通过 helm 部署成功, 目前已经在集群中存在 Client 和 Server 两个应用。

### 3.3 验证应用

#### 查看资源部署情况

查看部署好的 client 和 server 两个 deployment。

```bash
$ kubectl get deployment       
NAME                 READY   UP-TO-DATE   AVAILABLE   AGE
dubbo-go-client-v1   1/1     1            1           22m
dubbo-go-server-v1   1/1     1            1           49m
```

查看客户端调用日志

```bash
$ kubectl get pods  | grep client | awk '{print $1}' | xargs kubectl logs 
...
2022-04-07T04:13:55.777Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T04:13:56.778Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T04:13:57.779Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T04:13:58.781Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T04:13:59.782Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T04:14:00.784Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T04:14:01.785Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
```

验证调用成功

## 4. 小结

dubbogo-cli 提供的应用模板可以方便地支持开发者进行镜像的构建、推送、部署。

在 Istio 环境中，server 应用将自身服务信息注册在 Isito 上，由客户端监听 xds 资源，查询 istio debug 端口进行接口级别的服务发现。开发人员无需关心 service名、主机名、集群名等概念，只需要引入接口，发起调用即可。