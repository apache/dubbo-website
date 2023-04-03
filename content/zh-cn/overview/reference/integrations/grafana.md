---
aliases:
    - /zh/overview/reference/integrations/grafana/
description: 配置 Grafana 与 Dubbo 一起工作
linkTitle: Grafana
title: Grafana
type: docs
weight: 3
---

## 安装
### Kubernetes 安装

你可以使用 Dubbo 社区提供的示例配置快速安装 Grafana，安装后的 Grafana 提供了社区默认指标面板视图。

```bash
kubectl create -f .
```

获得访问地址
```sh
$ kubectl port-forward service/grafana 3000:3000
```

访问页面 `http://localhost:3000`

![Grafana](/imgs/v3/reference/integrations/grafana.jpg)

> 获取登录信息
> ```bash
> kubectl get secrets grafana -o jsonpath="{.data.admin-user}" | base64 --decode ; echo && kubectl get secrets grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo
> ```

### VM 安装
下载项目至本地到切换指定项目

```bash
wget https://dl.grafana.com/oss/release/grafana-9.3.6-1.x86_64.rpm && yum install -y grafana-9.3.6-1.x86_64.rpm
```

启动服务
```bash
systemctl daemon-reload && systemctl enable --now grafana-server
```

访问页面 `http://localhost:3000`，默认用户名与密码为`admin`

![Grafana](/imgs/v3/reference/integrations/grafana.jpg)

## 配置数据面板

以下是 Dubbo 社区提供的默认指标面板，您配置好数据源并直接导入使用即可。如果默认面板不能满足要求，您还可以自定义 Grafana 面板。

**Apache Dubbo Observability Dashboard：**  [https://grafana.com/grafana/dashboards/18051](https://grafana.com/grafana/dashboards/18051)

**JVM (Micrometer) Dashboard：** [https://grafana.com/grafana/dashboards/4701](https://grafana.com/grafana/dashboards/4701)