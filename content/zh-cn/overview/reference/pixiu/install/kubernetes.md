---
description: 使用 Kubernetes YAML 安装
linkTitle: Kubernetes
title: Kubernetes
type: docs
weight: 2
---
本章节介绍如何在 Kubernetes 集群中安装 Pixiu Gateway。需要注意的是，手动安装方式在配置灵活性方面不如 Helm 安装方式。如果需要对 Pixiu Gateway 的安装过程进行更精细的控制，建议使用 Helm 方式进行部署。

## 先决条件



## 使用 YAML 安装

```
kubectl apply --server-side -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.3.0/standard-install.yaml
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-go-pixiu/develop/controllers/config/crd/bases
```

### Pixiu Gateway
```
https://raw.githubusercontent.com/apache/dubbo-go-pixiu/develop/controllers/samples/controller.yaml
```

### Pixiu Proxy
```
https://raw.githubusercontent.com/apache/dubbo-go-pixiu/develop/controllers/samples/pixiugateway.yaml
```

```
NAME                                        READY   STATUS    RESTARTS   AGE
pg-controller-5999ccd96c-fcrvw              1/1     Running   0          28s
pixiu-listeners-b6c63d63-68848d4d48-4pt6w   1/1     Running   0          16s
```

### 测试
```bash
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-go-pixiu/develop/controllers/samples/backend.yaml
```

```bash
export GATEWAY_HOST=$(kubectl get gateway/pixiu-listeners -n pixiu-gateway-system -o jsonpath='{.status.addresses[0].value}')
curl --verbose --header "Host: www.example.com" http://$GATEWAY_HOST/get
```

