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

Dubbo-Go 可以采集 RPC、元数据、注册中心、配置中心等运行态指标，并通过 Prometheus 与 Grafana 构建可观测性看板。本文以 <a href="https://github.com/apache/dubbo-go-samples/tree/main/observability/prometheus_grafana" target="_blank">dubbo-go-samples/observability/prometheus_grafana</a> 为例，说明 Pull 与 Pushgateway 两种运行方式。

> 说明：部分旧文档或任务描述可能仍写作 `metrics/prometheus_grafana`，当前 sample 仓库中的实际目录是 `observability/prometheus_grafana`。

## 1. 工作模式

### 1.1 Pull 模式

```text
Dubbo-Go 应用暴露 /prometheus 或 /metrics
        |
        v
Prometheus 定时拉取
        |
        v
Grafana 查询 Prometheus 并展示大盘
```

Pull 模式是 Prometheus 的标准模式，适合长期运行的 Dubbo-Go Provider 与 Consumer。当前 sample 中：

| 应用 | 指标地址 |
| --- | --- |
| go-server | `http://localhost:9099/prometheus` |
| go-client | `http://localhost:9097/prometheus` |

Dubbo-Go 默认指标地址是 `http://localhost:9090/metrics`。sample 通过 `metrics.WithPort(9099)`、`metrics.WithPort(9097)` 和 `metrics.WithPath("/prometheus")` 改成了上面的端口与路径。

### 1.2 Pushgateway 模式

```text
Dubbo-Go 应用推送指标
        |
        v
Pushgateway 暂存指标
        |
        v
Prometheus 拉取 Pushgateway
        |
        v
Grafana 查询 Prometheus 并展示大盘
```

Pushgateway 更适合 batch、cron job 等短生命周期任务。长期运行的服务优先使用 Pull 模式；如果必须使用 Pushgateway，请配合清理机制，避免停止后的旧指标继续留在 Pushgateway 中。

## 2. 准备示例

克隆 samples 仓库并进入示例目录：

```bash
git clone --depth 1 https://github.com/apache/dubbo-go-samples.git
cd dubbo-go-samples/observability/prometheus_grafana
```

该目录包含：

| 文件或目录 | 说明 |
| --- | --- |
| `docker-compose.yml` | 启动 ZooKeeper、Prometheus、Pushgateway、Grafana |
| `prometheus_pull.yml` | Pull 模式的 Prometheus 配置 |
| `prometheus_push.yml` | Pushgateway 模式的 Prometheus 配置 |
| `go-server/cmd/main.go` | Provider 示例，RPC 端口 `20000`，指标端口 `9099` |
| `go-client/cmd/main.go` | Consumer 示例，持续调用 Provider，指标端口 `9097` |
| `grafana.json` | Dubbo Grafana dashboard JSON |

启动 Docker 组件：

```bash
docker compose up -d
```

如果你的环境还在使用 Docker Compose v1，可以执行：

```bash
docker-compose up -d
```

启动后可访问：

| 组件 | 地址 |
| --- | --- |
| Grafana | `http://localhost:3000` |
| Prometheus | `http://localhost:9090` |
| Pushgateway | `http://localhost:9091` |
| ZooKeeper | `127.0.0.1:2181` |

## 3. Pull 模式运行流程

`docker-compose.yml` 默认挂载 `prometheus_pull.yml`，因此直接启动 Docker 组件后即可按 Pull 模式验证。

1. 设置注册中心地址：

```bash
export ZK_ADDRESS="127.0.0.1:2181"
```

Windows PowerShell 使用：

```powershell
$env:ZK_ADDRESS="127.0.0.1:2181"
```

2. 启动 Provider：

```bash
go run ./go-server/cmd/main.go --push=false
```

3. 新开终端，进入同一目录后启动 Consumer：

```bash
cd dubbo-go-samples/observability/prometheus_grafana
export ZK_ADDRESS="127.0.0.1:2181"
go run ./go-client/cmd/main.go --push=false
```

4. 访问应用暴露的指标端点：

```bash
curl http://localhost:9099/prometheus
curl http://localhost:9097/prometheus
```

输出中可以看到 `dubbo_provider_`、`dubbo_consumer_`、`dubbo_application_` 等指标。例如：

```text
dubbo_provider_requests_total
dubbo_consumer_requests_succeed_total
```

5. 打开 `http://localhost:9090/targets`，确认 `dubbo-provider` 与 `dubbo-consumer` 两个 target 为 `UP`。

## 4. Pushgateway 模式运行流程

Pushgateway 模式需要让 Prometheus 拉取 Pushgateway，而不是直接拉取 Dubbo-Go 应用。

1. 将 `docker-compose.yml` 中 Prometheus 的配置文件挂载从 Pull 配置改为 Push 配置：

```yaml
volumes:
  - ./prometheus_push.yml:/etc/prometheus/prometheus.yml
```

2. 重新启动监控组件：

```bash
docker compose down
docker compose up -d
```

3. 设置环境变量：

```bash
export ZK_ADDRESS="127.0.0.1:2181"
export PUSHGATEWAY_URL="127.0.0.1:9091"
export JOB_NAME="dubbo-service"

# 如果 Pushgateway 开启了 Basic Auth，再设置以下变量
export PUSHGATEWAY_USER="username"
export PUSHGATEWAY_PASS="1234"
```

4. 启动 Provider 与 Consumer：

```bash
go run ./go-server/cmd/main.go
```

新开终端：

```bash
cd dubbo-go-samples/observability/prometheus_grafana
export ZK_ADDRESS="127.0.0.1:2181"
export PUSHGATEWAY_URL="127.0.0.1:9091"
export JOB_NAME="dubbo-service"
go run ./go-client/cmd/main.go
```

5. 访问 Pushgateway 指标：

```bash
curl http://localhost:9091/metrics
```

6. 打开 `http://localhost:9090/targets`，确认 `pushgateway` target 为 `UP`。

示例应用注册了 `job_pushed_at_seconds`，并在优雅退出时调用 Pushgateway DELETE API 清理自身 job。直接强制结束进程时可能来不及清理，生产环境建议配合 <a href="https://github.com/apache/dubbo-go-samples/tree/main/tools/pgw-cleaner" target="_blank">pgw-cleaner</a> 定期清理过期指标。

## 5. Prometheus 配置说明

### 5.1 Pull 配置

`prometheus_pull.yml` 直接抓取 Provider 与 Consumer 暴露的 `/prometheus`：

```yaml
global:
  evaluation_interval: 15s
  scrape_interval: 15s
scrape_configs:
  - job_name: dubbo-provider
    scrape_interval: 15s
    scrape_timeout: 5s
    metrics_path: /prometheus
    static_configs:
      - targets: ['host.docker.internal:9099']
  - job_name: dubbo-consumer
    scrape_interval: 15s
    scrape_timeout: 5s
    metrics_path: /prometheus
    static_configs:
      - targets: ['host.docker.internal:9097']
```

`host.docker.internal` 表示 Prometheus 容器访问宿主机上的 Dubbo-Go 进程。如果 Prometheus 与应用都运行在同一个 Docker 网络内，可改成容器名；如果是在 Linux 环境且该域名不可用，请改成宿主机实际 IP，或在 compose 中增加 `host-gateway` 映射。

### 5.2 Pushgateway 配置

`prometheus_push.yml` 只抓取 Pushgateway：

```yaml
global:
  evaluation_interval: 15s
  scrape_interval: 15s
scrape_configs:
  - job_name: 'pushgateway'
    static_configs:
      - targets: ['host.docker.internal:9091']
    honor_labels: true
```

`honor_labels: true` 会保留应用推送到 Pushgateway 的 `job`、`instance` 等标签，便于 Grafana dashboard 按服务维度展示。

## 6. Grafana dashboard 导入

1. 打开 `http://localhost:3000`，默认账号密码为 `admin` / `admin`。
2. 进入 `Home -> Connections -> Data sources`，点击 `Add new data source`。
3. 选择 `Prometheus`，数据源地址填写 `http://host.docker.internal:9090`。如果 Grafana 无法访问该地址，请改成宿主机实际 IP 或 Prometheus 容器可访问的地址。
4. 点击 `Save & test`，确认数据源可用。
5. 进入 `Home -> Dashboards -> New -> Import`。
6. 上传 sample 目录中的 `grafana.json`，或复制文件内容到导入框。也可以使用 Grafana dashboard ID `19294` 导入 `Dubbo Observability`。
7. 选择刚才创建的 Prometheus 数据源，点击 `Import`。

Consumer 启动后会持续调用 Provider，dashboard 中的 QPS、成功率、P99 延迟、Consumer/Provider 请求量和错误率会持续刷新。

## 7. 常见问题

### 7.1 端口冲突

如果 `3000`、`9090`、`9091` 或 `2181` 已被占用，请修改 `docker-compose.yml` 的端口映射；如果 `9099` 或 `9097` 被占用，请修改 `go-server/cmd/main.go` 或 `go-client/cmd/main.go` 中的 `metrics.WithPort(...)`，并同步修改 `prometheus_pull.yml` 的 target。

### 7.2 Prometheus Targets 显示 DOWN

先在宿主机执行：

```bash
curl http://localhost:9099/prometheus
curl http://localhost:9097/prometheus
curl http://localhost:9091/metrics
```

如果宿主机可以访问而 Prometheus 容器访问失败，通常是 Docker 网络地址问题。把 `host.docker.internal` 改为宿主机实际 IP，或在 Linux Docker Compose 中为 Prometheus 增加：

```yaml
extra_hosts:
  - "host.docker.internal:host-gateway"
```

### 7.3 Grafana 显示 No Data

确认 Prometheus 数据源 `Save & test` 成功；在 `http://localhost:9090/targets` 确认 target 为 `UP`；在 Prometheus 查询 `dubbo_consumer_requests_succeed_total` 或 `dubbo_provider_requests_total`。如果查询为空，请确认 client 正在持续调用 server，并等待一个 scrape interval。

### 7.4 Pushgateway 中有旧 job

Pushgateway 默认不会自动删除旧指标。优雅退出 sample 进程可以触发清理逻辑；生产环境建议部署 `pgw-cleaner` 或通过 Pushgateway DELETE API 清理过期 job。

### 7.5 `/metrics` 和 `/prometheus` 应该访问哪个

Dubbo-Go 默认路径是 `/metrics`，默认端口是 `9090`；当前 sample 显式配置了 `/prometheus`，server 使用 `9099`，client 使用 `9097`。请以你的应用中 `metrics.WithPort(...)` 与 `metrics.WithPath(...)` 的实际配置为准。

## 8. 生产建议

| 场景 | 推荐方式 |
| --- | --- |
| 长期运行的 Provider/Consumer | Pull 模式 |
| 短生命周期任务 | Pushgateway 模式 |
| Kubernetes 环境 | Pull 模式 + PodMonitor |
| 使用 Pushgateway | 配合清理器或 DELETE API |

如果部署在 Kubernetes 中，可使用 Prometheus Operator 的 PodMonitor 抓取应用暴露的指标端口，并将 `path` 设置为应用实际配置的 `/prometheus` 或 `/metrics`。
