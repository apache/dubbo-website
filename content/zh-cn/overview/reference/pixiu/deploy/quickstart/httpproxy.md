---
aliases:
- /zh/docs3-v2/dubbo-go-pixiu/deploy/quickstart/httpproxy/
- /zh-cn/docs3-v2/dubbo-go-pixiu/deploy/quickstart/httpproxy/
- /zh-cn/overview/reference/pixiu/deploy/quickstart/httpproxy/
- /zh-cn/overview/mannual/dubbo-go-pixiu/deploy/quickstart/httpproxy/
description: 关于如何使用 HTTP 代理说明
linkTitle: HTTP 代理
title: HTTP 代理
type: docs
weight: 2
---
本示例演示了如何使用 Pixiu Gateway 作为 HTTP 代理网关，接收外部的 HTTP 请求并转发到后端的 Dubbo-go RPC 服务。示例基于 `dubbo-go-samples/helloworld` 中的 RPC 服务。

## 先决条件
- 安装 [Pixiu Gateway](../getting-started.md)

## 部署后端 RPC 服务

### 1. 创建命名空间和服务

首先创建命名空间和后端 RPC 服务：
```yaml
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Namespace
metadata:
  name: helloworld
---
apiVersion: v1
kind: Service
metadata:
  name: dubbo-go-server
  namespace: helloworld
  labels:
    app: dubbo-go-server
spec:
  type: ClusterIP
  ports:
    - name: triple
      protocol: TCP
      port: 20000
      targetPort: 20000
  selector:
    app: dubbo-go-server
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dubbo-go-server
  namespace: helloworld
  labels:
    app: dubbo-go-server
spec:
  replicas: 1
  selector:
    matchLabels:
      app: dubbo-go-server
  template:
    metadata:
      labels:
        app: dubbo-go-server
    spec:
      containers:
        - name: server
          image: mfordjody/dubbo-go-server:debug
          imagePullPolicy: Always
          ports:
            - name: triple
              containerPort: 20000
              protocol: TCP
          env:
            - name: DUBBO_GO_CONFIG_PATH
              value: "/app/conf/dubbogo.yml"
          resources:
            limits:
              cpu: 500m
              memory: 512Mi
            requests:
              cpu: 100m
              memory: 128Mi
          livenessProbe:
            tcpSocket:
              port: 20000
            initialDelaySeconds: 30
            periodSeconds: 30
            timeoutSeconds: 5
            failureThreshold: 3
          readinessProbe:
            tcpSocket:
              port: 20000
            initialDelaySeconds: 10
            periodSeconds: 10
            timeoutSeconds: 3
            failureThreshold: 3
EOF
```

应用配置：
```bash
kubectl apply -f helloworld-deployment.yaml
```

### 2. 验证

检查服务是否正常运行：
```bash
kubectl get pods -n helloworld
kubectl get svc -n helloworld
```

## 配置 HTTP 代理

### 1. HTTPRoute

使用 HTTPRoute 定义路由规则，将 HTTP 请求路由到后端服务：
```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: helloworld-http-route
  namespace: default
spec:
  parentRefs:
    - name: pixiu-listeners
      namespace: pixiu-gateway-system
      sectionName: http
  rules:
    - matches:
        - path:
            type: PathPrefix
            value: /greet.GreetService
      backendRefs:
        - name: dubbo-go-server
          namespace: helloworld
          port: 20000
          weight: 100
```

### 2. PixiuClusterPolicy

配置后端集群策略，定义后端服务的连接信息：
```yaml
apiVersion: pixiu.apache.org/v1alpha1
kind: PixiuClusterPolicy
metadata:
  name: helloworld-cluster
  namespace: pixiu-gateway-system
spec:
  targetRef:
    group: gateway.networking.k8s.io
    kind: Gateway
    name: pixiu-listeners
  clusterRef:
    - name: helloworld-dubbo-go-server
      type: static
      loadBalancerPolicy: "lb"
      endpoints:
        - address: dubbo-go-server.helloworld.svc.cluster.local
          port: 20000
```

### 3. PixiuFilterPolicy

配置 HTTP 过滤器策略，使用 `httpproxy` 过滤器进行代理转发：
```yaml
apiVersion: pixiu.apache.org/v1alpha1
kind: PixiuFilterPolicy
metadata:
  name: helloworld-http-filter
  namespace: pixiu-gateway-system
spec:
  targetRef:
    group: gateway.networking.k8s.io
    kind: Gateway
    name: pixiu-listeners
  listenersRef:
    - name: http
      filterChains:
        type: dgp.filter.httpconnectionmanager
      config:
        routeConfig:
          routes:
            - match:
                prefix: "/greet.GreetService"
                methods: []
              route:
                cluster: "helloworld-dubbo-go-server"
                cluster_not_found_response_code: 505
            - match:
                path: "/greet.GreetService/Greet"
                methods: []
              route:
                cluster: "helloworld-dubbo-go-server"
                cluster_not_found_response_code: 505
        httpFilters:
          - name: dgp.filter.http.httpproxy
            config:
              timeoutConfig:
                connectTimeout: 5s
                requestTimeout: 5s
```

### 4. 应用配置

以上三个配置合并到 `helloworld-http.yaml`
```bash
kubectl apply -f helloworld-http.yaml
```

### 5. 验证

检查所有资源的状态：
```bash
kubectl get httproute -n default

kubectl get pixiuclusterpolicy -n pixiu-gateway-system

kubectl get pixiufilterpolicy -n pixiu-gateway-system

kubectl get gateway -n pixiu-gateway-system
```

## 测试

### 1. 获取网关地址

```bash
kubectl get svc -npixiu-gateway-system
NAME                               TYPE           CLUSTER-IP      EXTERNAL-IP   PORT(S)             AGE
service/pg-controller              ClusterIP      10.98.137.160   <none>        8080/TCP,8081/TCP   58s
service/pixiu-listeners-b6c63d63   LoadBalancer   10.100.42.144   <pending>     80:31257/TCP        24s
```

### 2. 发送 HTTP 请求

使用 curl 发送 HTTP 请求到 RPC 服务：
```bash
NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}')
curl -v --header "Content-Type: application/json" --data '{"name": "Hello World"}' http://$NODE_IP:31257/greet.GreetService/Greet
```

预期响应：
```json
{"greeting": "Hello World"}
```
