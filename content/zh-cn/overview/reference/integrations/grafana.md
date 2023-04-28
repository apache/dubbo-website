---
aliases:
    - /zh/overview/reference/integrations/grafana/
description: 配置 Grafana 与 Dubbo 一起工作
linkTitle: Grafana
title: Grafana
type: docs
weight: 2
---

Grafana 是一种开源的监控解决方案，可用于为 Dubbo 配置可视化仪表板，您可以使用 Grafana 来监控 Dubbo 集群的运行状况。

## 配置可视化控制面板

以下是 Dubbo 社区提供的默认指标面板，您配置好数据源并直接导入使用即可。如果默认面板不能满足要求，您还可以自定义 Grafana 面板。

* [**Apache Dubbo Observability Dashboard：**](https://grafana.com/grafana/dashboards/18469)
* [**JVM (Micrometer) Dashboard：**](https://grafana.com/grafana/dashboards/4701)

您可以通过以下几种方式快速的导入 Grafana 监控面板。

### 方式一：Kubernetes 安装

你可以使用 Dubbo 社区提供的示例配置快速安装 Grafana，安装后的 Grafana 提供了社区默认指标面板视图。

```bash
kubectl create -f https://raw.githubusercontent.com/apache/dubbo-admin/refactor-with-go/deploy/kubernetes/grafana.yaml
```

你可能需要端口映射获得访问地址 `$ kubectl port-forward service/grafana 3000:3000`，打开浏览器访问页面 `http://localhost:3000`。

> 获取登录信息
> ```bash
> kubectl get secrets grafana -o jsonpath="{.data.admin-user}" | base64 --decode ; echo && kubectl get secrets grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo
> ```

### 方式二：向已经安装好的集群导入 dashboard

如果你已经有安装好的 Grafana 服务了，则还可以通过 [Grafana 控制台的导入菜单](https://grafana.com/docs/grafana/v8.4/dashboards/export-import/#importing-a-dashboard) 导入 dashboard。根据 Grafana 的要求，导入 dashboard 的过程中需要同时指定 Prometheus 数据源地址。

你也可以选择使用以下脚本快速导入。

```sh
$ # Address of Grafana
$ GRAFANA_HOST="http://localhost:3000"
$ # Login credentials, if authentication is used
$ GRAFANA_CRED="USER:PASSWORD"
$ # The name of the Prometheus data source to use
$ GRAFANA_DATASOURCE="Prometheus"
$ # The version of Dubbo to deploy
$ VERSION=3.2.0
$ # Import all Dubbo dashboards
$ for DASHBOARD in 18469 4701; do
$     #REVISION="$(curl -s https://grafana.com/api/dashboards/${DASHBOARD}/revisions -s | jq ".items[] | select(.description | contains(\"${VERSION}\")) | .revision")"
$     REVISION=1
$     curl -s https://grafana.com/api/dashboards/${DASHBOARD}/revisions/${REVISION}/download > /tmp/dashboard.json
$     echo "Importing $(cat /tmp/dashboard.json | jq -r '.title') (revision ${REVISION}, id ${DASHBOARD})..."
$     curl -s -k -u "$GRAFANA_CRED" -XPOST \
$         -H "Accept: application/json" \
$         -H "Content-Type: application/json" \
$         -d "{\"dashboard\":$(cat /tmp/dashboard.json),\"overwrite\":true, \
$             \"inputs\":[{\"name\":\"DS_PROMETHEUS\",\"type\":\"datasource\", \
$             \"pluginId\":\"prometheus\",\"value\":\"$GRAFANA_DATASOURCE\"}]}" \
$         $GRAFANA_HOST/api/dashboards/import
$     echo -e "\nDone\n"
$ done
```

### 方式三：自定义
Grafana 可以通过其他方法进行安装和配置，可以参阅有关安装方法的文档了解如何制作和导入 Dubbo 检测面板
* [Grafana provisioning 官方文档](https://grafana.com/docs/grafana/latest/administration/provisioning/#dashboards)
* [为 `stable/grafana` Helm chart 导入面板](https://github.com/helm/charts/tree/master/stable/grafana#import-dashboards)
