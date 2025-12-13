---
aliases:
    - /zh/docs3-v2/dubbo-go-pixiu/user/samples/prometheus/
    - /zh-cn/docs3-v2/dubbo-go-pixiu/user/samples/prometheus/
    - /zh-cn/overview/reference/pixiu/other/user/samples/prometheus/
    - /zh-cn/overview/mannual/dubbo-go-pixiu/user/samples/prometheus/
description: 启动 PrometheusPushGateway
linkTitle: 启动 PrometheusPushGateway
title: 启动 PrometheusPushGateway
type: docs
weight: 20
---

# Metric Filter Quick Start

## 启动 PrometheusPushGateway [Docker 环境]：

##### 使用 Docker 安装并启动：

直接获取官方镜像的最新版本 prom/pushgateway:latest 启动命令如下：

```shell
$ docker pull prom/pushgateway
```

```shell
$ docker run -d -p 9091:9091 prom/pushgateway
```

使用 ./pushgateway 命令启动服务。此时，通过浏览器访问 http://<ip>:9091 可以访问 UI 页面， 但默认 Metrics 上没有数据显示，这是因为我们还没有向 PushGateway 推送任何数据。
然而，PushGateway 服务本身带有一些指标，可以通过访问 http://<ip>:9091/metrics 地址获取。您可以看到它包含一些与 go 和 process 相关的监控指标。

##### 检查配置是否成功：

PushGateway 提供标准 API 接口，并允许用户添加数据。默认 URL 地址是：
http://<ip>:9091/metrics/job/<JOBNAME>{/<LABEL_NAME>/<LABEL_VALUE>}，
其中 <JOBNAME> 是必填项，它是 job 标签的值。它后面可以跟随任意数量的标签对。
通常，我们会添加一个实例 /<INSTANCE_NAME> 实例名称标签，以方便区分每个指标。
接下来，您可以向 PushGateway 推送一个简单的指标数据进行测试。

```shell
$ echo "test_metric 123456" | curl --data-binary @- http://<ip>:9091/metrics/job/test_job
```

执行完成后，刷新 PushGateway UI 页面以验证您是否可以看到刚刚添加的 test_metric 指标数据。
也可以通过以下方式进行测试：


```shell
$ cat <<EOF | curl --data-binary @- http://<ip>:9091/metrics/job/test_job/instance/test_instance
# TYPE test_metrics counter
test_metrics{label="app1",name="demo"} 100.00
# TYPE another_test_metrics gauge
# HELP another_test_metrics Just an example.
another_test_metrics 123.45
EOF
```

## Start Pixiu:

官方参考示例位于 `https://github.com/dubbo-go-pixiu/samples`

将以下配置文件添加到 `samples/http/simple/pixiu/conf.yaml`

```yaml
static_resources:
  listeners:
    - name: "net/http"
      protocol_type: "HTTP"
      address:
        socket_address:
          address: "0.0.0.0"
          port: 8888
      filter_chains:
        filters:
          - name: dgp.filter.httpconnectionmanager
            config:
              route_config:
                routes:
                  - match:
                      prefix: /user
                    route:
                      cluster: user
                      cluster_not_found_response_code: 505
              http_filters:
                - name: dgp.filter.http.httpproxy
                  config:
                    maxIdleConns: 100
                    maxIdleConnsPerHost: 100
                    MaxConnsPerHost: 100
                - name: dgp.filter.http.prometheusmetric
                  config:
                    metric_collect_rules:
                      metric_path: "/metrics"
                      push_gateway_url: "http://127.0.0.1:9091"
                      counter_push: true
                      push_interval_threshold: 10
                      push_job_name: "pixiu"
      config:
        idle_timeout: 5s
        read_timeout: 5s
        write_timeout: 5s
  clusters:
    - name: "user"
      lb_policy: "lb"
      endpoints:
        - id: 1
          socket_address:
            address: 127.0.0.1
            port: 1314
      health_checks:
        - protocol: "tcp"
          timeout: 1s
          interval: 2s
          healthy_threshold: 4
          unhealthy_threshold: 4
  shutdown_config:
    timeout: "60s"
    step_timeout: "10s"
    reject_policy: "immediacy"
```

然后执行以下命令。

```shell
go run cmd/pixiu/*.go gateway start -c samples/http/simplep/pixiu/conf.yaml
```

然后您也可以在 PushGateway UI 页面上查询收集到的指标数据。