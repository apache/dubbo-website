---
description: 学习如何使用 Kubernetes Gateway API
linkTitle: Kubernetes Gateway API
title: Kubernetes Gateway API
type: docs
weight: 1
--- 

## 先决条件
默认情况下不会安装 Gateway API。如果 Gateway API CRD 不存在，请安装：
```bash
kubectl get crd gateways.gateway.networking.k8s.io &> /dev/null || \
  { kubectl kustomize "github.com/kubernetes-sigs/gateway-api/config/crd?ref=v1.4.0" | kubectl apply -f -; }
```

## 配置网关
```bash
kubectl create -f https://raw.githubusercontent.com/istio/istio/release-1.28/samples/httpbin/httpbin.yaml
```

```bash
kubectl create namespace dubbo-ingress
kubectl apply -f - <<EOF
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: gateway
  namespace: dubbo-ingress
spec:
  gatewayClassName: dubbo
  listeners:
  - name: default
    hostname: "*.example.com"
    port: 80
    protocol: HTTP
    allowedRoutes:
      namespaces:
        from: All
---
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: http
  namespace: default
spec:
  parentRefs:
  - name: gateway
    namespace: dubbo-ingress
  hostnames: ["httpbin.example.com"]
  rules:
  - matches:
    - path:
        type: PathPrefix
        value: /get
    backendRefs:
    - name: httpbin
      port: 8000
EOF
```

## 清理

```bash
kubectl delete -f https://raw.githubusercontent.com/istio/istio/release-1.28/samples/httpbin/httpbin.yaml
kubectl delete httproute http
kubectl delete gateways.gateway.networking.k8s.io gateway -n dubbo-ingress
kubectl delete ns dubbo-ingress
```