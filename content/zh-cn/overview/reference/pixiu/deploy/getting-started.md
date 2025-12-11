---
linkTitle: 快速入门
title: 快速入门
type: docs
weight: 1
---
快速开始使用 Pixiu Gateway 应用网关。

### 0. 安装 Gateway API 和 Pixiu Gateway CRD

```
kubectl apply --server-side -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.3.0/standard-install.yaml
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-go-pixiu/develop/controllers/config/crd/bases
```

###  1. 切换目标目录
```
cd controllers/samples
```

### 2. Pixiu Gateway
```
https://raw.githubusercontent.com/apache/dubbo-go-pixiu/develop/controllers/samples/controller.yaml

```

### 3. Pixiu Proxy
```
https://raw.githubusercontent.com/apache/dubbo-go-pixiu/develop/controllers/samples/pixiugateway.yaml
```

```
NAME                                        READY   STATUS    RESTARTS   AGE
pg-controller-5999ccd96c-fcrvw              1/1     Running   0          28s
pixiu-listeners-b6c63d63-68848d4d48-4pt6w   1/1     Running   0          16s
```

### 4. 测试
```bash
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-go-pixiu/develop/controllers/samples/backend.yaml
```

```bash
export GATEWAY_HOST=$(kubectl get gateway/pixiu-listeners -n pixiu-gateway-system -o jsonpath='{.status.addresses[0].value}')
curl --verbose --header "Host: www.example.com" http://$GATEWAY_HOST/get
```

