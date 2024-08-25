---
aliases:
  - /zh/docs3-v2/dubbo-go-pixiu/user/networkfilter/triple/
  - /zh-cn/docs3-v2/dubbo-go-pixiu/user/networkfilter/triple/
description: Triple NetWorkFilter 介绍
linkTitle: Triple NetWorkFilter 介绍
title: Triple NetWorkFilter 介绍
type: docs
weight: 10
---

Triple 协议是 Dubbo3 的主力协议，完整兼容 gRPC over HTTP/2，并在协议层面扩展了负载均衡和流量控制相关机制。

Triple NetWorkFilter 用来处理 Triple 请求，它能接收来自 Triple Listener 传递的 Triple 请求，然后将其交给自身维护的 Triple Filter 链进行处理，最后将响应返回给调用方。

在开始前，需要决定服务使用的序列化方式，如果为新服务，推荐使用 protobuf 作为默认序列化，在性能和跨语言上的效果都会更好。如果是原有服务想进行协议升级，Triple 协议也已经支持其他序列化方式，如 Hessian / JSON 等

# 使用 Triple 调用 Dubbo

## 定义Pixiu配置文件

```yaml
static_resources:
  listeners:
    - name: "dubbo-listener"
      protocol_type: "TCP"
      address:
        socket_address:
          address: "0.0.0.0"
          port: 8888
      filter_chains:
        filters:
          - name: dgp.filter.network.dubboconnectionmanager
            config:
              route_config:
                routes:
                  - match:
                      prefix: "/com.dubbogo.pixiu.TripleUserService"
                      methods:
                        - "*"
                    route:
                      cluster: "triple-server"
                      cluster_not_found_response_code: 505
              dubbo_filters:
                - name: dgp.filter.dubbo.proxy
                  config:
                    protocol: tri
    - name: "triple-listener"
      protocol_type: "TRIPLE"
      address:
        socket_address:
          address: "0.0.0.0"
          port: 9999
      filter_chains:
        filters:
          - name: dgp.filter.network.dubboconnectionmanager
            config:
              route_config:
                routes:
                  - match:
                      prefix: "com.dubbogo.pixiu.DubboUserService"
                      methods:
                        - "*"
                    route:
                      cluster: "dubbo-server"
                      cluster_not_found_response_code: 505
              dubbo_filters:
                - name: dgp.filter.dubbo.proxy
                  config:
                    protocol: dubbo
  clusters:
    - name: "triple-server"
      lb_policy: "lb"
      endpoints:
        - id: 1
          socket_address:
            address: 127.0.0.1
            port: 20001
    - name: "dubbo-server"
      lb_policy: "lb"
      endpoints:
        - id: 1
          socket_address:
            address: 127.0.0.1
            port: 20000
```

## 准备Dubbo服务

### 启动zookeeper,需要提前准备好docker和compose，如果本地有的话可以忽略

[docker-compose.yml](https://github.com/apache/dubbo-go-pixiu-samples/blob/main/dubbotripleproxy/docker/docker-compose.yml)

```shell
docker-compose -f {CURRENT_PATH}/dubbo-go-pixiu-samples/dubbotripleproxy/docker/docker-compose.yml && docker-compose up -d
```

### 启动 Dubbo Server

[Run](https://github.com/apache/dubbo-go-pixiu-samples/tree/main/dubbotripleproxy/server/dubbo/app)

```shell
export DUBBO_GO_CONFIG_PATH={CURRENT_PATH}/dubbo-go-pixiu-samples/dubbotripleproxy/server/dubbo/profiles/dev/server.yml
go run .
```

### 启动 Triple Server

[Run](https://github.com/apache/dubbo-go-pixiu-samples/tree/main/dubbotripleproxy/server/triple/app)

```shell
export DUBBO_GO_CONFIG_PATH={CURRENT_PATH}/dubbo-go-pixiu-samples/dubbotripleproxy/server/triple/profiles/dev/server.yml
go run .
```

## 启动 Pixiu

```shell
./dubbo-go-pixiu gateway start --config {CURRENT_PATH}pixiu/conf.yaml
```

## 使用代码来查询

[test](https://github.com/apache/dubbo-go-pixiu-samples/blob/main/dubbotripleproxy/test/triple2dubbo_test.go)

```go
package main

import (
	"context"
	"fmt"

	"dubbo.apache.org/dubbo-go/v3/common/constant"
	"dubbo.apache.org/dubbo-go/v3/config"
	"dubbo.apache.org/dubbo-go/v3/config/generic"
	hessian "github.com/apache/dubbo-go-hessian2"
	tpconst "github.com/dubbogo/triple/pkg/common/constant"
)

func main() {
	tripleClient := newTripleRefConf("com.dubbogo.pixiu.DubboUserService", tpconst.TRIPLE)
	resp, err := tripleClient.GetRPCService().(*generic.GenericService).Invoke(
		context.TODO(),
		"GetUserByName",
		[]string{"java.lang.String"},
		[]hessian.Object{"tc"},
	)

	if err != nil {
		panic(err)
	}
	fmt.Printf("GetUser1(userId string) res: %+v", resp)
}

func newTripleRefConf(iface, protocol string) config.ReferenceConfig {
	refConf := config.ReferenceConfig{
		InterfaceName: iface,
		Cluster:       "failover",
		RegistryIDs:   []string{"zk"},
		Protocol:      protocol,
		Generic:       "true",
		Group:         "test",
		Version:       "1.0.0",
		URL:           "tri://127.0.0.1:9999/" + iface + "?" + constant.SerializationKey + "=hessian2",
	}
	rootConfig := config.NewRootConfigBuilder().
		Build()
	if err := config.Load(config.WithRootConfig(rootConfig)); err != nil {
		panic(err)
	}
	_ = refConf.Init(rootConfig)
	refConf.GenericLoad("dubbo.io")
	return refConf
}
```

```shell
go run main.go
```