---
aliases:
- /zh/docs3-v2/dubbo-go-pixiu/deploy/quickstart/httpproxy/
- /zh-cn/docs3-v2/dubbo-go-pixiu/deploy/quickstart/httpproxy/
- /zh-cn/overview/reference/pixiu/deploy/quickstart/httpproxy/
- /zh-cn/overview/mannual/dubbo-go-pixiu/deploy/quickstart/httpproxy/
description: 关于如何使用 HTTP Proxy 说明
linkTitle: HTTP
title: HTTP
type: docs
weight: 1
---
本示例演示了如何使用 Pixiu Gateway 作为 HTTP 代理网关，接收外部的 HTTP 请求并转发到后端的 Dubbo-go RPC 服务。示例基于 `dubbo-go-samples/helloworld` 中的 RPC 服务。

## 先决条件
- 已安装 [Pixiu Gateway](../../install/_index.md)

## 创建 RPC 服务

### 创建服务

首先创建 helloworld 服务：
```bash
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-go-pixiu-samples/main/gateway/helloworld/deployment.yaml
```

### 验证服务

检查服务是否正常运行：
```bash
kubectl get pods -n helloworld
kubectl get svc -n helloworld
```

### 创建 HTTP 代理
```bash
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-go-pixiu-samples/main/gateway/http/http.yaml
```

### 验证 HTTP 代理

检查所有资源的状态：
```bash
kubectl get httproute -n default
kubectl get pixiuclusterpolicy -n default
kubectl get pixiufilterpolicy -n default
kubectl get gateway -n default
```

## 验证

### 获取网关地址

```bash
NAME             TYPE           CLUSTER-IP      EXTERNAL-IP   PORT(S)             AGE
pixiu-3465d618   LoadBalancer   10.108.197.9    <pending>     80:32547/TCP        86m
pixiu-gateway    ClusterIP      10.105.156.54   <none>        8080/TCP,8081/TCP   86m
```

### 发送 HTTP 请求

使用 curl 发送 HTTP 请求到 RPC 服务：
```bash
NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}')
curl -v --header "Content-Type: application/json" --data '{"name": "Hello World"}' http://$NODE_IP:32547/greet.GreetService/Greet
```

预期响应：
```json
{"greeting": "Hello World"}
```
