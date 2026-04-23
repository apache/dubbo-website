---
aliases:
    - /zh/docs3-v2/golang-sdk/tutorial/governance/monitor/rpc_metrics/
    - /zh-cn/docs3-v2/golang-sdk/tutorial/governance/monitor/rpc_metrics/
description: "Dubbo-Go 指标监控：支持 Prometheus Pull 模式与 Pushgateway Push 模式，并接入 Grafana 可视化"
title: 指标监控 (Metrics)
type: docs
weight: 2
---


# Dubbo-Go 指标监控

Dubbo-Go 支持采集运行态 Metrics 指标，并接入 **Prometheus + Grafana** 实现微服务可观测性。

当前示例支持两种监控模式：

* **Pull 模式**：Prometheus 主动抓取 Dubbo-Go 应用暴露的指标，适合长期运行的服务。
* **Push 模式**：Dubbo-Go 应用主动将指标推送到 Pushgateway，仅建议用于短生命周期任务。

示例源码：

> [https://github.com/apache/dubbo-go-samples/tree/main/metrics](https://github.com/apache/dubbo-go-samples/tree/main/metrics)

## 1. 监控架构说明

### 1.1 Pull 模式（推荐生产模式）

```
Dubbo-Go 应用  --->  Prometheus  --->  Grafana
        (暴露 /metrics 或 /prometheus 接口)
```

Prometheus 主动抓取 Dubbo-Go 应用指标。

### 1.2 Push 模式（适用于短生命周期任务）

```
Dubbo-Go 应用  --->  Pushgateway  --->  Prometheus  --->  Grafana
```

应用主动推送指标到 Pushgateway，Prometheus 再拉取。

Pushgateway 适用于 **短生命周期任务（如 batch / cron job）**，不推荐用于长期运行的服务。

## 2. 示例组件说明

| 组件          | 端口   | 说明                   |
| ----------- | ---- | -------------------- |
| Grafana     | 3000 | 指标可视化                |
| Prometheus  | 9090 | 指标存储与查询              |
| Pushgateway | 9091 | 接收应用推送指标             |
| go-server 指标端口 | 本示例中为 9099 | Pull 模式下 Provider 指标暴露端口 |
| go-client 指标端口 | 本示例中为 9097 | Pull 模式下 Consumer 指标暴露端口 |

如果不使用本示例，而是直接使用 Dubbo-Go 默认配置，则默认指标端点为 `http://localhost:9090/metrics`。当前 sample 将指标路径改成了 `/prometheus`。

## 3. 快速开始

### 3.1 启动监控服务栈

进入目录：

```bash
cd metrics/prometheus_grafana
```

启动监控组件：

```bash
docker-compose up -d
```

访问地址：

* Grafana: [http://localhost:3000](http://localhost:3000)
* Prometheus: [http://localhost:9090](http://localhost:9090)
* Pushgateway: [http://localhost:9091](http://localhost:9091)

### 3.2 配置环境变量

客户端与服务端使用相同环境变量：

```bash
export ZK_ADDRESS="127.0.0.1:2181"

# Push 模式必需
export PUSHGATEWAY_URL="127.0.0.1:9091"
export JOB_NAME="dubbo-service"

# 可选
export PUSHGATEWAY_USER="username"
export PUSHGATEWAY_PASS="1234"
```

### 3.3 启动 Dubbo-Go 服务端

```bash
go run ./go-server/cmd/main.go
```

### 3.4 启动 Dubbo-Go 客户端

#### 默认 Push 模式

```bash
go run ./go-client/cmd/main.go
```

#### 使用 Pull 模式

```bash
go run ./go-client/cmd/main.go --push=false
go run ./go-server/cmd/main.go --push=false
```

### 3.5 验证指标

#### Push 模式

访问：

```
http://localhost:9091/metrics
```

#### Pull 模式

`<应用端口>` 指的是 Dubbo-Go 应用自身暴露 Prometheus 指标的 HTTP 端口，不是 Prometheus 或 Pushgateway 的端口。

在当前 sample 中：

* Provider：`http://localhost:9099/prometheus`
* Consumer：`http://localhost:9097/prometheus`

这两个端口定义在 [`metrics/prometheus_grafana/prometheus_pull.yml`](https://github.com/apache/dubbo-go-samples/blob/main/metrics/prometheus_grafana/prometheus_pull.yml) 中。

如果你使用的是自己的 Dubbo-Go 应用，请将端口替换成应用实际配置的指标端口。

## 4. Grafana 配置

### 4.1 添加 Prometheus 数据源

1. 打开 [http://localhost:3000](http://localhost:3000)
2. 默认账号：admin / admin
3. 进入：

```
Home → Connections → Data sources
```

4. 点击 **Add new data source**
5. 选择 Prometheus
6. 填写：

```
http://host.docker.internal:9090
```

> 说明：`host.docker.internal` 用于让 Docker 容器访问宿主机网络。如果该地址不可用，请替换为宿主机实际 IP。

7. 点击 Save & Test

### 4.2 导入 Dubbo 监控大盘

1. 进入：

```
Home → Dashboards → New → Import
```

2. 使用以下任一方式导入：

* 直接上传 sample 目录中的 [`grafana.json`](https://github.com/apache/dubbo-go-samples/blob/main/metrics/prometheus_grafana/grafana.json)
* 输入 Grafana dashboard ID `19294`（`Dubbo Observability`）后点击 **Load**
* 或从 [Grafana Labs](https://grafana.com/grafana/dashboards/19294-dubbo-observability/) 下载 JSON 文件再上传

3. sample 仓库已经直接提供 `metrics/prometheus_grafana/grafana.json`，因此优先上传这个文件即可。

4. 选择 Prometheus 数据源
5. 点击 Import

### 4.3 查看效果

你将看到：

* QPS
* 成功率
* 请求延迟 P99
* Consumer / Provider 调用统计
* 错误率

## 5. Pushgateway 僵尸指标问题

### 5.1 问题说明

Pushgateway 默认：

> 不会自动删除旧指标

任务停止后：

* 指标仍然保留
* 会导致数据污染

### 5.2 方案一：应用侧自动清理（已实现）

机制：

* 注册 `job_pushed_at_seconds`
* 定期更新时间戳
* 优雅退出时自动 DELETE

### 5.3 方案二：运维清理器（推荐生产使用）

工具仓库位置：

> [apache/dubbo-go-samples/tree/main/tools/pgw-cleaner](https://github.com/apache/dubbo-go-samples/tree/main/tools/pgw-cleaner)

详细说明：

* [README_CN.md](https://github.com/apache/dubbo-go-samples/blob/main/tools/pgw-cleaner/README_CN.md)

该工具位于 `apache/dubbo-go-samples` 仓库中，不在 `apache/dubbo-go` 主仓库内。

用于：

* 自动扫描过期指标
* 定期清理僵尸 job

## 6. 常见问题

### 6.1 Grafana 显示 No Data

请检查：

* Prometheus 数据源是否测试成功
* Prometheus → Status → Targets 是否为 UP
* 查询：

```
dubbo_consumer_requests_succeed_total
```

是否有数据

### 6.2 host.docker.internal 无法访问

请改为实际 IP 地址：

* 修改 `metrics/prometheus_grafana/prometheus_pull.yml`
* 修改 Grafana 数据源 URL

## 7. Kubernetes 部署

推荐使用：

> kube-prometheus
> [https://github.com/prometheus-operator/kube-prometheus](https://github.com/prometheus-operator/kube-prometheus)

### 7.1 添加 PodMonitor

创建：

```
dubboPodMonitor.yaml
```

内容：

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PodMonitor
metadata:
  name: dubbo-pod-monitor
  namespace: monitoring
spec:
  namespaceSelector:
    matchNames:
      - dubbo-system
  selector:
    matchLabels:
      app-type: dubbo
  podMetricsEndpoints:
    - port: metrics
      path: /prometheus
```

### 7.2 可选：集群启用 RBAC 时补充权限配置

如果集群开启了 RBAC，建议为 Prometheus 增加对 `dubbo-system` 命名空间内 Pod 的读取权限：

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: dubbo-system
  name: pod-reader
rules:
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: pod-reader-binding
  namespace: dubbo-system
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: pod-reader
subjects:
  - kind: ServiceAccount
    name: prometheus-k8s
    namespace: monitoring
```

如果你的 Prometheus 安装使用的 ServiceAccount 不是 `prometheus-k8s`，请按实际名称修改 `subjects`。

### 7.3 部署应用

```bash
kubectl apply -f Deployment.yaml
```

### 7.4 验证

访问：

```
http://<prometheus-nodeport>/targets
```

确认 Pod 状态为：

```
UP
```

## 8. 生产建议

| 场景      | 推荐模式              |
| ------- | ----------------- |
| 长期运行服务  | Pull              |
| 短生命周期任务 | Push              |
| K8s 环境  | Pull + PodMonitor |
| 需要清理能力  | 配合 pgw-cleaner    |

## 9. 总结

Dubbo-Go 当前支持：

* Pull 模式（标准 Prometheus 模式）
* Push 模式（Pushgateway）
* Docker 快速部署
* Kubernetes PodMonitor
* Grafana 大盘
* 僵尸指标自动治理

通过以上配置，可以实现完整的 Dubbo-Go 可观测性体系。
