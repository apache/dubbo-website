---
aliases:
    - /zh/docs3-v2/golang-sdk/tutorial/governance/service-mesh/traffic_management/
    - /zh-cn/docs3-v2/golang-sdk/tutorial/governance/service-mesh/traffic_management/
description: 流量管理
title: 流量管理
type: docs
weight: 3
---






在本节中，我们将延续上一个任务[【在 Istio 环境部署 Dubbo-go 应用】](../deploy/)。

在之前的任务中，我们在集群中部署了一组 Dubbo-go Server和 Client 端应用，验证了服务发现和调用成功。在本节中，我们将创建新版本的 Server 端应用。通过配置 VirtualService 和 DestinationRule ，实现路由管理，和流量转移能力

## 1. 准备工作

- dubbo-go cli 工具和依赖工具已安装、grpc_cli (如需本地调试)。
- docker、helm、kubectl 环境已安装。（arm 机器需支持 docker buildx）
- 任务[【在 Istio 环境部署 Dubbo-go 应用】](../deploy/)已完成

## 2. 开发多版本Dubbo-go 应用。

### 2.1 使用 dubbogo-cli 创建另一个项目模板

```bash
$ dubbogo-cli newApp . 
```

### 2.2 开发和部署客户端 Dubbo-go 应用 v2：

#### 编写业务逻辑

- 修改 package/service/service.go 的实现方法，返回版本号为 v2.0.0

```go
func (s *GreeterServerImpl) SayHello(ctx context.Context, in *api.HelloRequest) (*api.User, error) {
	return &api.User{Name: "Hello " + in.Name, Id: "v2.0.0"}, nil
}
```

- 修改如下配置文件，使用xds协议作为注册中心，加载名为 GreeterServerImpl 的服务结构。

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

  修改 Makefile 如下字段，指定好需要构建的镜像地址和版本，我们把镜像 tag 改为 2.0.0。

  指定好需要通过 helm 安装的名称。

  ```
  IMAGE = xxx/dubbo-go-server
  TAG = 2.0.0
  HELM_INSTALL_NAME = dubbo-go-server
  ```

- 指定需要部署的应用和镜像：

  修改 chart/app/Chart.yaml 如下字段，指定当前应用名为 `dubbo-go-server`，我们在创建v1版本服务的时候，已经有了该应用的 service，这次部署时模板将不会创建 service。

  ```yaml
  apiVersion: v1
  name: dubbo-go-server
  description: dubbo-go-server
  ```

  修改 chart/app/values.yaml 如下字段，指定需要部署的镜像为2.0.0，以及当前开发的应用版本 dubbogoAppVersion 为 v2。

  部署的镜像需要和上述构建的镜像一致。当前应用版本用于 mesh 流量规则控制。

  ```yaml
  image:
    repository:  xxx/dubbo-go-server
    pullPolicy: Always
    tag: "2.0.0"
  
  # Dubbo-go-mesh version control labels
  version:
    labels:
      dubbogoAppVersion: v2
  ```

  至此，构建参数和发布参数都已指定好，可以进行构建和部署了。

#### 使用模板构建和部署 Dubbo-go 应用

- 构建、推送镜像

  `$ make build  `   (本地为 amd64机器) 

  或者  

  `$ make buildx-publish`     (本地为 arm64机器，依赖 docker buildx 命令)

- 发布 Dubbo-go Server  v2 至集群

  ```bash
  $ make deploy
  NAME: dubbo-go-server-v2
  LAST DEPLOYED: Thu Apr  7 12:29:28 2022
  NAMESPACE: default
  STATUS: deployed
  REVISION: 1
  TEST SUITE: None
  $ helm list
  NAME                    NAMESPACE       REVISION        UPDATED                                 STATUS          CHART                   dubbo-go-client         default         1               2022-04-07 11:49:55.517898 +0800 CST    deployed        dubbo-go-client-0.0.1   1.16.0     
  dubbo-go-server-v1      default         1               2022-04-07 11:23:18.397658 +0800 CST    deployed        dubbo-go-server-0.0.1   1.16.0     
  dubbo-go-server-v2      default         1               2022-04-07 12:29:28.497476 +0800 CST    deployed        dubbo-go-client-0.0.1   1.16.0
  ```

  可看到通过 helm 部署成功, 目前已经在集群中存在一个 Client 应用，和 Server 的两个版本。

### 2.3 验证应用

#### 查看资源部署情况

查看部署好的 deployment ，server 包含了两个版本。

```bash
$  kubectl get deployment 
NAME                 READY   UP-TO-DATE   AVAILABLE   AGE
dubbo-go-client-v1   1/1     1            1           40m
dubbo-go-server-v2   1/1     1            1           77s
dubbo-go-server-v1   1/1     1            1           67m
```

查看部署好的 service。两个版本的deployment 共用同一个 service。

```bash
$ kubectl get svc        
NAME              TYPE        CLUSTER-IP        EXTERNAL-IP   PORT(S)     AGE
dubbo-go-client   ClusterIP   192.168.8.176     <none>        20000/TCP   41m
dubbo-go-server   ClusterIP   192.168.216.253   <none>        20000/TCP   67m
```

查看 Client 应用日志，验证请求调用到了两个版本的应用上。

```bash
$ kubectl get pods  | grep client | awk '{print $1}' | xargs kubectl logs 
...
2022-04-07T05:06:40.384Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v2.0.0"
2022-04-07T05:06:41.386Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v2.0.0"
2022-04-07T05:06:42.388Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T05:06:43.389Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v2.0.0"
2022-04-07T05:06:44.390Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v2.0.0"
2022-04-07T05:06:45.392Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T05:06:46.393Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T05:06:47.394Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T05:06:48.396Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v2.0.0"
2022-04-07T05:06:49.397Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
```

至此，我们开发并且部署成功了多版本应用。

## 3. 配置请求路由

### 3.1 配置目标规则

执行以下命令以创建目标规则，该目标规则将 dubbo-go-server 细分为两个子集。v1和 v2

```bash
$ kubectl apply -f destinationrule.yaml
```

destinationrule.yaml 内容：

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: dubbo-go-server
spec:
  host: dubbo-go-server
  subsets:
    - name: v1
      labels:
        dubbogoAppVersion: v1 # 对应应用模板中 chart/app/values.yaml 中指定的版本标签
    - name: v2
      labels:
        dubbogoAppVersion: v2
```

### 3.2 应用 Virtual Service

执行以下命令以创建路由，该路由将所有流量都路由至v1 版本应用。

```bash
$ kubectl apply -f virtualservice.yaml
```

virtualservice.yaml 内容

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: dubbo-go-server
spec:
  hosts:
    - dubbo-go-server
  http:
  - route:
    - destination:
        host: dubbo-go-server
        subset: v1
```



### 3.3 验证路由生效

所有流量将流向 v1 版本应用。

```bash
$ kubectl get pods  | grep client | awk '{print $1}' | xargs kubectl logs 
...
2022-04-07T05:40:44.353Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T05:40:45.354Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T05:40:46.356Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T05:40:47.357Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T05:40:48.359Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
2022-04-07T05:40:49.361Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
```



## 4. 基于用户身份的路由

有了上述多版本应用路由的基础，我们可以通过一些策略，来进行灵活的流量管理。

### 4.1 为客户端应用增加用户身份标识

我们希望拥有 user: admin 标识的流量都可以体验 v2 新版本应用。

回到之前创建的 dubbo-go-client 项目，修改 cmd/app.go 的 main 函数，增加调用标识：`user: admin`。

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
		ctx := context.Background()
		ctx = context.WithValue(ctx, constant.AttachmentKey, map[string]string{ 
			"user":"admin", // 使用上下文 context 为调用增加标识
		})

		if rsp, err := client.SayHello(ctx, request); err != nil{
			logger.Errorf("call server error = %s", err)
		}else{
			logger.Infof("call server response = %+v", rsp)
		}
		time.Sleep(time.Second)
	}
}
```

- 构建、推送镜像，覆盖之前的提交。您也可以升级一下发布的镜像版本。

  `$ make build  `   (本地为 amd64机器) 

  或者  

  `$ make buildx-publish`     (本地为 arm64机器，依赖 docker buildx 命令)

- 删除 dubbo-go-client  应用

  ```
  $ make remove
  helm uninstall dubbo-go-client
  release "dubbo-go-client" uninstalled
  ```

- 重新发布应用。

  `$ make deploy`

  发布后，验证调用成功，由于前面进行了路由配置。所有流量都流向 v1 版本。

  ```bash
  $ kubectl get pods  | grep client | awk '{print $1}' | xargs kubectl logs 
  ...
  2022-04-07T05:40:44.353Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
  2022-04-07T05:40:45.354Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
  2022-04-07T05:40:46.356Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
  2022-04-07T05:40:47.357Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
  2022-04-07T05:40:48.359Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
  2022-04-07T05:40:49.361Z        INFO    cmd/app.go:29   call server response = name:"Hello laurence" id:"v1.0.0"
  ```

### 4.2 创建基于用户身份的路由

执行以下命令以修改/创建路由，该路由将所有请求头存在 user: admin 标识的流量都路由至 v2 版本。

```bash
$ kubectl apply -f virtualservice.yaml
```

virtualservice.yaml 内容

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: dubbo-go-server
spec:
  hosts:
    - dubbo-go-server
  http:
  - match:
    - headers:
        user:
          exact: admin
    route:
      - destination:
          host: dubbo-go-server
          subset: v2
  - route:
    - destination:
        host: dubbo-go-server
        subset: v1
```

### 4.3 验证路由生效

所有流量将流向 v2 版本应用。

```bash
$ kubectl get pods  | grep client | awk '{print $1}' | xargs kubectl logs 
...
2022-04-07T05:52:18.714Z        INFO    cmd/app.go:35   call server response = name:"Hello laurence"  id:"v2.0.0"
2022-04-07T05:52:19.716Z        INFO    cmd/app.go:35   call server response = name:"Hello laurence"  id:"v2.0.0"
2022-04-07T05:52:20.717Z        INFO    cmd/app.go:35   call server response = name:"Hello laurence"  id:"v2.0.0"
2022-04-07T05:52:21.718Z        INFO    cmd/app.go:35   call server response = name:"Hello laurence"  id:"v2.0.0"
2022-04-07T05:52:22.720Z        INFO    cmd/app.go:35   call server response = name:"Hello laurence"  id:"v2.0.0"
2022-04-07T05:52:23.722Z        INFO    cmd/app.go:35   call server response = name:"Hello laurence"  id:"v2.0.0"
2022-04-07T05:52:24.723Z        INFO    cmd/app.go:35   call server response = name:"Hello laurence"  id:"v2.0.0"
```



## 5. 基于权重的路由

### 5.1 创建基于权重的路由

延续上述任务，我们执行以下命令以修改/创建路由，该路由将流量的 10% 导入新版本应用，进行灰度测试。

```bash
$ kubectl apply -f virtualservice.yaml
```

virtualservice.yaml 内容

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: dubbo-go-server
spec:
  hosts:
    - dubbo-go-server
  http:
    - route:
      - destination:
          host: dubbo-go-server
          subset: v1
        weight: 90
      - destination:
          host: dubbo-go-server
          subset: v2
        weight: 10
```

### 5.2 验证路由生效

少数流量将流向 v2 版本。

```bash
$ kubectl get pods  | grep client | awk '{print $1}' | xargs kubectl logs 
...
2022-04-07T05:55:52.035Z        INFO    cmd/app.go:35   call server response = name:"Hello laurence"  id:"v1.0.0"
2022-04-07T05:55:53.036Z        INFO    cmd/app.go:35   call server response = name:"Hello laurence"  id:"v1.0.0"
2022-04-07T05:55:54.037Z        INFO    cmd/app.go:35   call server response = name:"Hello laurence"  id:"v1.0.0"
2022-04-07T05:55:55.039Z        INFO    cmd/app.go:35   call server response = name:"Hello laurence"  id:"v1.0.0"
2022-04-07T05:55:56.041Z        INFO    cmd/app.go:35   call server response = name:"Hello laurence"  id:"v1.0.0"
2022-04-07T05:55:57.043Z        INFO    cmd/app.go:35   call server response = name:"Hello laurence"  id:"v1.0.0"
2022-04-07T05:55:58.045Z        INFO    cmd/app.go:35   call server response = name:"Hello laurence"  id:"v1.0.0"
2022-04-07T05:55:59.047Z        INFO    cmd/app.go:35   call server response = name:"Hello laurence"  id:"v1.0.0"
2022-04-07T05:56:00.049Z        INFO    cmd/app.go:35   call server response = name:"Hello laurence"  id:"v1.0.0"
2022-04-07T05:56:01.050Z        INFO    cmd/app.go:35   call server response = name:"Hello laurence"  id:"v2.0.0"
2022-04-07T05:56:02.053Z        INFO    cmd/app.go:35   call server response = name:"Hello laurence"  id:"v1.0.0"
2022-04-07T05:56:03.055Z        INFO    cmd/app.go:35   call server response = name:"Hello laurence"  id:"v1.0.0"
```