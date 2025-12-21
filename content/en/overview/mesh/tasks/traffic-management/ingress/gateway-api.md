---
description: Learn how to use Kubernetes Gateway API
linkTitle: Kubernetes Gateway API
title: Kubernetes Gateway API
type: docs
weight: 1
---

## Prerequisites

Gateway API is not installed by default. If Gateway API CRDs do not exist, install them:

```bash
kubectl get crd gateways.gateway.networking.k8s.io &> /dev/null || \
  { kubectl kustomize "github.com/kubernetes-sigs/gateway-api/config/crd?ref=v1.4.0" | kubectl apply -f -; }
```

## Configure gateway

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

## Cleanup

```bash
kubectl delete -f https://raw.githubusercontent.com/istio/istio/release-1.28/samples/httpbin/httpbin.yaml
kubectl delete httproute http
kubectl delete gateways.gateway.networking.k8s.io gateway -n dubbo-ingress
kubectl delete ns dubbo-ingress
```
