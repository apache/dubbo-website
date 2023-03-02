---
aliases:
    - /zh/docs3-v2/golang-sdk/tutorial/governance/service-mesh/pixiu/pixiu-nacos-triple/
    - /zh-cn/docs3-v2/golang-sdk/tutorial/governance/service-mesh/pixiu/pixiu-nacos-triple/
description: 使用 Pixiu 暴露 Dubbo-go 服务
title: 使用 Pixiu 暴露 Dubbo-go 服务
type: docs
weight: 9
---






Dubbo-go-pixiu 网关支持调用 GO/Java 的 Dubbo 集群。在 Dubbo-go 3.0 的场景下，我们可以通过 Pixiu 网关，在集群外以 HTTP 协议请求 pixiu 网关，在网关层进行协议转换，进一步调用集群内的Dubbo-go 服务。

![img](/imgs/docs3-v2/golang-sdk/samples/pixiu-nacos-triple/triple-pixiu.png)

用户调用 Dubbo-go 服务的 path 为http://$(app_name)/$(service_name)/$(method) 

例如一个proto文件内有如下定义：

```protobuf
package org.apache.dubbo.quickstart.samples;

service UserProvider {
  rpc SayHello (HelloRequest) returns (User) {}
}

message HelloRequest {
  string name = 1;
}
```

并在dubbo-go 服务启动时在dubbogo.yml 内配置应用名为my-dubbogo-app: 

```yaml
dubbo:
	application:
  	name: my-dubbogo-app
```

pixiu 网关即可解析 path 为 http://my-dubbogo-app/org.apache.dubbo.quickstart.samples.UserProvider/SayHello 的路由，并转发至对应服务。来自外部HTTP 请求的 body 为 json 序列化的请求参数，例如 {"name":"test"}。

我们目前推荐使用 Nacos 作为注册中心。

用户可以在自己的集群里部署我们的demo，集群最好拥有暴露 lb 类型 service 的能力，从而可以在公网访问至集群内的服务，您也可以直接集群内进行请求。针对您的集群，执行：

```bash
$ kubectl apply -f https://raw.githubusercontent.com/dubbogo/triple-pixiu-demo/master/deploy/pixiu-triple-demo.yml
```

会在 dubbogo-triple-nacos 命名空间下创建如下资源，包含三个 triple-server，一个pixiu网关，一个 nacos server。并通过 Servcie 将服务暴露至公网。

```plain
namespace/dubbogo-triple-nacos created
service/dubbo-go-nacos created
deployment.apps/dubbogo-nacos-deployment created
deployment.apps/pixiu created
deployment.apps/server created
service/pixiu created
```

获取 pixiu 公网 ip 并进行调用

```plain
$ kubectl get svc -n dubbogo-triple-nacos
NAME             TYPE           CLUSTER-IP        EXTERNAL-IP     PORT(S)          AGE
dubbo-go-nacos   ClusterIP      192.168.123.204   <none>          8848/TCP         32s
pixiu            LoadBalancer   192.168.156.175   30.XXX.XXX.XX   8881:30173/TCP   32s
```

通过curl 调用 demo 服务，并获得响应结果。

```bash
$ curl -X POST -d '{"name":"laurence"}' http://30.XXX.XXX.XX:8881/dubbogoDemoServer/org.apache.dubbo.laurence.samples.UserProvider/SayHello
{"name":"Hello laurence","id":"12345","age":21}
```