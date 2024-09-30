---
aliases:
    - /en/overview/reference/integrations/prometheus/
description: Configure Prometheus to work with Dubbo
linkTitle: Prometheus
title: Prometheus
type: docs
weight: 1
---

## Installation

You can quickly install Prometheus using the example configuration provided by the Dubbo community.

```bash
kubectl create -f https://raw.githubusercontent.com/apache/dubbo-kubernetes/master/deploy/kubernetes/prometheus.yaml
```
> This installation is only suitable for testing or experience purposes. For production-grade installation, please refer to the official Prometheus installation documentation.

Execute the port mapping `kubectl -n dubbo-system port-forward svc/prometheus-server 9090:9090`, and access the page at `http://localhost:9090`, then switch to the graph view.

![Prometheus](/imgs/v3/reference/integrations/prometheus.jpg)

## Scrape Configuration

Each instance of Dubbo exposes an HTTP port for Metrics collection, and Prometheus collects statistics by scraping the HTTP interface of each instance. The specific scraping path can be adjusted via the Prometheus configuration file, which controls the port, path, TLS settings, etc., for scraping instances.

### Kubernetes Annotation Convention

In the Kubernetes deployment mode, install Prometheus using the [Helm Charts maintained by the official community](https://github.com/prometheus-community/helm-charts), and the Prometheus service can automatically identify Dubbo Pod instances with the `prometheus.io` annotation and include them in the scraping instance list.

The example provided by the Dubbo official website implements automatic discovery of the scraping target address based on the `prometheus.io` annotation. The specific annotation configuration can be found in the [Deployment resource definition](https://github.com/apache/dubbo-samples/blob/master/4-governance/dubbo-samples-metrics-spring-boot/Deployment.yml).

```yaml
annotations:
   prometheus.io/scrape: "true"
   prometheus.io/path: /management/prometheus
   prometheus.io/port: "22222"
```

In this mode, the Prometheus Metrics collection path provided by default for Dubbo instances is: `/management/prometheus`.

### Custom Configuration

For an already installed Prometheus service, you can configure the target instances for Dubbo Metrics collection using the Prometheus http_sd service discovery interface provided by Dubbo Admin. After the installation is complete, the configurations that need to be adjusted on the Prometheus side are as follows:

```yaml
- job_name: 'dubbo'
  http_sd_configs:
    - url: http://{admin-address}/api/dev/metrics/prometheus
```

