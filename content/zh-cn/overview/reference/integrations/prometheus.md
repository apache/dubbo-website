---
type: docs
title: "Prometheus"
linkTitle: "Prometheus"
description: "配置 Prometheus 与 Dubbo 一起工作"
weight: 2
---
## 安装

### Linux
下载项目至本地到切换指定项目
```bash
wget https://github.com/prometheus/prometheus/releases/download/v2.42.0/prometheus-2.42.0.linux-amd64.tar.gz && tar zxvf prometheus-2.42.0.linux-amd64.tar.gz && mv prometheus-2.42.0.linux-amd64 prometheus && cd prometheus
```

后台运行
```bash
nohup ./prometheus > /dev/null 2>&1 &
```

访问页面
`http://localhost:9090`
![Prometheus](/imgs/v3/reference/integrations/prometheus.jpg)


### Kubernetes
下载项目至本地到切换指定项目
```bash
git clone https://github.com/apache/dubbo-admin.git && cd dubbo-admin/kubernetes/prometheus
```

创建项目
```bash
kubectl create -f .
```

访问页面
`http://localhost:9090`
![Prometheus](/imgs/v3/reference/integrations/prometheus.jpg)


