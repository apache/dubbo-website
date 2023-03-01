---
aliases:
    - /zh/overview/reference/setup/install/
description: Dubbo 控制面是微服务治理的核心依赖，本文档描述了如何快速安装 Dubbo Admin 控制面、控制台以及服务发现、监控等组件。
linkTitle: 安装 Dubbo
title: 安装 Dubbo Admin 及服务治理组件
toc_hide: true
type: docs
weight: 50
---


## Dubboctl 安装
### Download
下载 Dubbo Admin 发行版本
```shell
curl -L https://dubbo.apache.org/installer.sh | VERSION=0.1.0 sh -
# Admin 要组织好发行版本
```

将 dubboctl 放入可执行路径
```shell
ln -s dubbo-admin-0.1.0/bin/dubboctl /usr/local/bin/dubboctl
```
### Install
安装过程会依次：

1. 安装 Admin 自定义的一些资源
2. 拉起 Admin、Nacos、Zookeeper 等不同的组件服务
```shell
dubboctl install # 使用默认 manifests 安装

# or

dubboctl manifests| kubectl apply -f -
```

```shell
dubboctl install --set profile=minimal # 指定不同的 profile，即安装组件的组合
```

```shell
dubboctl install --set admin.nacos.enabled=true, admin.nacos.namespace=test
# 指定不同的覆盖参数
```

检查安装效果
```shell
kubectl get pod -n dubbo-system
```

### 打开 Admin 控制台
```shell
kubectl port-forward svc/dubbo-admin -n dubbo-system 38080:38080
```

打开浏览器，访问： `http://127.0.0.1:38080/`
## Helm 安装
### 前置条件

- [Install the Helm client](https://helm.sh/docs/intro/install/), version 3.6 or above.
- Kubernetes 集群
- 配置 helm repository
```shell
$ helm repo add dubbo https://dubbo.apache.org/charts
$ helm repo update
```
### 安装步骤
#### 安装方式一
```shell
helm install dubbo-admin dubbo/dubbo-stack -n dubbo-system

helm install dubbo-admin-nacos dubbo/dubbo-stack -n dubbo-system

helm install dubbo-admin-zookeeper dubbo/dubbo-stack -n dubbo-system
```

```shell
helm install dubbo-admin-grafana dubbo/dubbo-stack -n dubbo-system

helm install dubbo-admin-prometheus dubbo/dubbo-stack -n dubbo-system
```
#### 安装方式二
```shell
helm install dubbo-admin-all dubbo/dubbo-stack -n dubbo-system
```

> 引发的问题。需要明确哪些组件是保证生产可用的，哪些是仅作展示的，比如 nacos/zookeeper/admin 保障生产可用，prometheus/grafana 是仅作展示
> 如果基于以上结论，则大部分情况下，dubbo-admin-all 是不推荐保生产安装的；更推荐使用类似 dubbo-admin-nacos 生产保障包，然后自己用 prometheus 社区的生产安装包


检查安装状态
```shell
helm ls -n dubbo-system

kubectl get deployments -n dubbo-system --output wide
```

## VM 安装
### Download
下载 Dubbo Admin 发行版本
```shell
curl -L https://dubbo.apache.org/installer.sh | VERSION=0.1.0 sh -
# Admin 要组织好发行版本
```

将 dubboctl 放入可执行路径
```shell
ln -s dubbo-admin-0.1.0/bin/dubbo-admin /usr/local/bin/dubbo-admin
```
### Run
```shell
dubbo-admin run -f override-configuration.yml
```
### Configuration
配置用于控制 dubbo-admin 的行为


```yaml
# Environment type. Available values are: "kubernetes" or "universal"
environment: universal # ENV: DUBBO_ENVIRONMENT
# Mode in which Dubbo CP is running. Available values are: "standalone", "global", "zone"
mode: standalone # ENV: DUBBO_MODE

# Resource Store configuration
store:
  # Type of Store used in the Control Plane. Available values are: "kubernetes", "postgres" or "memory"
  type: memory # ENV: DUBBO_STORE_TYPE

  # Kubernetes Store configuration (used when store.type=kubernetes)
  kubernetes:
    # Namespace where Control Plane is installed to.
    systemNamespace: dubbo-system # ENV: DUBBO_STORE_KUBERNETES_SYSTEM_NAMESPACE

  # Postgres Store configuration (used when store.type=postgres)
  mysql:
    # Host of the Postgres DB
    host: 127.0.0.1 # ENV: DUBBO_STORE_POSTGRES_HOST
    # Port of the Postgres DB
    port: 15432 # ENV: DUBBO_STORE_POSTGRES_PORT
    # User of the Postgres DB
    user: dubbo # ENV: DUBBO_STORE_POSTGRES_USER
    # Password of the Postgres DB
    password: dubbo # ENV: DUBBO_STORE_POSTGRES_PASSWORD
    # Database name of the Postgres DB
    dbName: dubbo # ENV: DUBBO_STORE_POSTGRES_DB_NAME
    # Connection Timeout to the DB in seconds
    connectionTimeout: 5 # ENV: DUBBO_STORE_POSTGRES_CONNECTION_TIMEOUT
    # Maximum number of open connections to the database
    # `0` value means number of open connections is unlimited
    maxOpenConnections: 50 # ENV: DUBBO_STORE_POSTGRES_MAX_OPEN_CONNECTIONS
    # Maximum number of connections in the idle connection pool
    # <0 value means no idle connections and 0 means default max idle connections
    maxIdleConnections: 50  # ENV: DUBBO_STORE_POSTGRES_MAX_IDLE_CONNECTIONS
    # TLS settings
    tls:
      # Mode of TLS connection. Available values are: "disable", "verifyNone", "verifyCa", "verifyFull"
      mode: disable # ENV: DUBBO_STORE_POSTGRES_TLS_MODE
      # Path to TLS Certificate of the client. Used in verifyCa and verifyFull modes
      certPath: # ENV: DUBBO_STORE_POSTGRES_TLS_CERT_PATH
      # Path to TLS Key of the client. Used in verifyCa and verifyFull modes
      keyPath: # ENV: DUBBO_STORE_POSTGRES_TLS_KEY_PATH
      # Path to the root certificate. Used in verifyCa and verifyFull modes.
      caPath: # ENV: DUBBO_STORE_POSTGRES_TLS_ROOT_CERT_PATH
    # MinReconnectInterval controls the duration to wait before trying to
    # re-establish the database connection after connection loss. After each
    # consecutive failure this interval is doubled, until MaxReconnectInterval
    # is reached. Successfully completing the connection establishment procedure
    # resets the interval back to MinReconnectInterval.
    minReconnectInterval: "10s" # ENV: DUBBO_STORE_POSTGRES_MIN_RECONNECT_INTERVAL
    # MaxReconnectInterval controls the maximum possible duration to wait before trying
    # to re-establish the database connection after connection loss.
    maxReconnectInterval: "60s" # ENV: DUBBO_STORE_POSTGRES_MAX_RECONNECT_INTERVAL
server:
	port: 38080
registry:
  address: xxx
metadata-center:
  address: xxx
config-center:
	address: xxx
external-services:
  prometheus:
      # Prometheus service name is "metrics" and is in the "telemetry" namespace
		  # http://prometheus.<dubbo_namespace_name>:9090
      url: "http://metrics.telemetry:9090/"
  tracing:
    # Enabled by default. Kiali will anyway fallback to disabled if
    # Jaeger is unreachable.
    enabled: true
    # Jaeger service name is "tracing" and is in the "telemetry" namespace.
    # Make sure the URL you provide corresponds to the non-GRPC enabled endpoint
    # if you set "use_grpc" to false.
    in_cluster_url: 'http://tracing.telemetry:16685/jaeger'
    use_grpc: true
    # Public facing URL of Jaeger
    url: 'http://my-jaeger-host/jaeger'
	grafana:
      enabled: true
      # Grafana service name is "grafana" and is in the "telemetry" namespace.
      in_cluster_url: 'http://grafana.telemetry:3000/'
      # Public facing URL of Grafana
      url: 'http://my-ingress-host/grafana'

# 更多配置
```
### 打开 Admin 控制台

打开浏览器，访问： `http://127.0.0.1:38080/`