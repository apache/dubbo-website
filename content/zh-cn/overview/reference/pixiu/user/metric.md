# Metric

## Enable

您可以在 config.yaml 中启用Metric如下所示。
在您的 prometheus 配置文件中配置 pixiu 的 ip 和下面的 prometheus_port
将允许 prometheus 抓取 pixiu 生成的Metric。

```yaml
metric:
  enable: true
  prometheus_port: 2222
```
