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

* ✅ **Pull 模式（推荐）**
* ✅ **Push 模式（基于 Prometheus Pushgateway）**

示例源码：

> [https://github.com/apache/dubbo-go-samples/tree/main/metrics](https://github.com/apache/dubbo-go-samples/tree/main/metrics)

---

# 一、监控架构说明

## 1️⃣ Pull 模式（推荐生产模式）

```
Dubbo-Go 应用  --->  Prometheus  --->  Grafana
        (暴露 /metrics 或 /prometheus 接口)
```

Prometheus 主动抓取 Dubbo-Go 应用指标。

---

## 2️⃣ Push 模式（适用于短生命周期任务）

```
Dubbo-Go 应用  --->  Pushgateway  --->  Prometheus  --->  Grafana
```

应用主动推送指标到 Pushgateway，Prometheus 再拉取。

⚠️ 注意：

Pushgateway 适用于 **短生命周期任务（如 batch / cron job）**，不推荐用于长期运行的服务。

---

# 二、示例组件说明

| 组件          | 端口   | 说明                   |
| ----------- | ---- | -------------------- |
| Grafana     | 3000 | 指标可视化                |
| Prometheus  | 9090 | 指标存储与查询              |
| Pushgateway | 9091 | 接收应用推送指标             |
| go-server   | —    | Dubbo-Go Provider 示例 |
| go-client   | —    | Dubbo-Go Consumer 示例 |

---

# 三、运行方式

---

# 🚀 四、快速开始（推荐方式）

## 步骤 1：启动监控服务栈

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

---

## 步骤 2：配置环境变量

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

---

## 步骤 3：启动 Dubbo-Go 服务端

```bash
go run ./go-server/cmd/main.go
```

---

## 步骤 4：启动 Dubbo-Go 客户端

### 默认 Push 模式

```bash
go run ./go-client/cmd/main.go
```

### 使用 Pull 模式

```bash
go run ./go-client/cmd/main.go --push=false
go run ./go-server/cmd/main.go --push=false
```

---

## 步骤 5：验证指标

### Push 模式

访问：

```
http://localhost:9091/metrics
```

### Pull 模式

访问：

```
http://localhost:<应用端口>/prometheus
```

---

# 五、Grafana 配置

---

## 1️⃣ 添加 Prometheus 数据源

1. 打开 [http://localhost:3000](http://localhost:3000)
2. 默认账号：admin / admin
3. 进入：

```
Home → Connections → Data sources
```

4. 选择 Prometheus
5. 填写：

```
http://host.docker.internal:9090
```

6. 点击 Save & Test

---

## 2️⃣ 导入 Dubbo 监控大盘

1. 进入：

```
Home → Dashboards → New → Import
```

2. 导入：

* 上传 `grafana.json`
* 或粘贴 JSON 内容

3. 选择 Prometheus 数据源
4. 点击 Import

---

## 3️⃣ 查看效果

你将看到：

* QPS
* 成功率
* 请求延迟 P99
* Consumer / Provider 调用统计
* 错误率

---

# 六、Pushgateway 僵尸指标问题

## 问题说明

Pushgateway 默认：

> 不会自动删除旧指标

任务停止后：

* 指标仍然保留
* 会导致数据污染

---

## 方案一：应用侧自动清理（已实现）

机制：

* 注册 `job_pushed_at_seconds`
* 定期更新时间戳
* 优雅退出时自动 DELETE

---

## 方案二：运维清理器（推荐生产使用）

工具路径：

```
tools/pgw-cleaner
```

用于：

* 自动扫描过期指标
* 定期清理僵尸 job

---

# 七、常见问题

---

## Grafana 显示 No Data

请检查：

* Prometheus 数据源是否测试成功
* Prometheus → Status → Targets 是否为 UP
* 查询：

```
dubbo_consumer_requests_succeed_total
```

是否有数据

---

## host.docker.internal 无法访问

请改为实际 IP 地址：

* 修改 prometheus_pull.yml
* 修改 Grafana 数据源 URL

---

# 八、Kubernetes 部署

推荐使用：

> kube-prometheus
> [https://github.com/prometheus-operator/kube-prometheus](https://github.com/prometheus-operator/kube-prometheus)

---

## 1️⃣ 添加 PodMonitor

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

---

## 2️⃣ 部署应用

```bash
kubectl apply -f Deployment.yaml
```

---

## 3️⃣ 验证

访问：

```
http://<prometheus-nodeport>/targets
```

确认 Pod 状态为：

```
UP
```

---

# 九、生产建议

| 场景      | 推荐模式              |
| ------- | ----------------- |
| 长期运行服务  | Pull              |
| 短生命周期任务 | Push              |
| K8s 环境  | Pull + PodMonitor |
| 需要清理能力  | 配合 pgw-cleaner    |

---

# 十、总结

Dubbo-Go 当前支持：

* Pull 模式（标准 Prometheus 模式）
* Push 模式（Pushgateway）
* Docker 快速部署
* Kubernetes PodMonitor
* Grafana 大盘
* 僵尸指标自动治理

通过以上配置，可以实现完整的 Dubbo-Go 可观测性体系。
