---
aliases:
    - /en/overview/reference/integrations/grafana/
description: Configuring Grafana to Work with Dubbo
linkTitle: Grafana
title: Grafana
type: docs
weight: 2
---

Grafana is an open-source monitoring solution that can be used to configure visual dashboards for Dubbo, allowing you to monitor the health of your Dubbo cluster.

## Configuring Visual Dashboards

Here are the default metrics dashboards provided by the Dubbo community. You can quickly use them after configuring the data source and importing directly. If the default dashboards do not meet your requirements, you can customize your Grafana dashboards.

* [**Apache Dubbo Observability Dashboard:**](https://grafana.com/grafana/dashboards/18469)
* [**JVM (Micrometer) Dashboard:**](https://grafana.com/grafana/dashboards/4701)

You can quickly import Grafana monitoring dashboards in the following ways.

### Method 1: Kubernetes Installation

You can quickly install Grafana using the sample configuration provided by the Dubbo community, which comes with the default community metrics dashboards.

```bash
kubectl create -f https://raw.githubusercontent.com/apache/dubbo-kubernetes/master/deploy/kubernetes/grafana.yaml
```

You may need to port-forward to access it: `$ kubectl port-forward service/grafana 3000:3000`, then open the browser and visit `http://localhost:3000`.

> Retrieve login information
> ```bash
> kubectl get secrets grafana -o jsonpath="{.data.admin-user}" | base64 --decode ; echo && kubectl get secrets grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo
> ```

### Method 2: Importing Dashboard into an Already Installed Cluster

If you already have Grafana installed, you can import the dashboard via the [import menu in the Grafana console](https://grafana.com/docs/grafana/v8.4/dashboards/export-import/#importing-a-dashboard). The Prometheus data source address must also be specified during the import process.

You can also use the following script for quick importing.

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

### Method 3: Customization
Grafana can be installed and configured through other methods; refer to the documentation on installation methods to learn how to create and import Dubbo monitoring dashboards.
* [Grafana provisioning official documentation](https://grafana.com/docs/grafana/latest/administration/provisioning/#dashboards)
* [Importing dashboards for `stable/grafana` Helm chart](https://github.com/helm/charts/tree/master/stable/grafana#import-dashboards)

