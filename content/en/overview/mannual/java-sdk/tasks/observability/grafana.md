---
aliases:
    - /en/overview/tasks/observability/grafana/
    - /en/overview/tasks/observability/grafana/
description: ""
linkTitle: Grafana
no_list: true
title: Visualizing Cluster Metrics with Grafana
type: docs
weight: 3
---

The recommended way to visualize metrics is to use Grafana to configure the observability monitoring dashboard for Dubbo.

## Before You Begin
- An accessible Kubernetes cluster
- Properly installed and configured [Prometheus service](/en/overview/reference/integrations/prometheus/#installation)
- Installed [Grafana](/en/overview/reference/integrations/grafana/)
- Deployed [Sample Application](https://github.com/apache/dubbo-samples/tree/master/4-governance/dubbo-samples-metrics-spring-boot) and enabled metrics collection

## Confirm Component Status

### Kubernetes
Ensure Prometheus is running

```sh
$ kubectl -n dubbo-system get svc prometheus
NAME         TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)    AGE
prometheus   ClusterIP   10.0.250.230   <none>        9090/TCP   180s
```

Ensure Grafana is running

```sh
$ kubectl -n dubbo-system get svc grafana
NAME      TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)    AGE
grafana   ClusterIP   10.0.244.130   <none>        3000/TCP   180s
```

## Deploy Sample

```yaml
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/4-governance/dubbo-samples-metrics-spring-boot/Deployment.yml
```

Wait for the sample application to run, and confirm the application status with the following command:
```yaml
kubectl -n dubbo-demo get deployments
```

## View Grafana Visualization Panel

After the sample program starts, it will automatically simulate service calls; just wait a bit to see metrics visualized in Grafana.
1. If Grafana was installed via the [Dubbo Admin Panel](../../../reference/admin/architecture/), access the Admin console and find the Grafana monitoring entry in the left menu.

2. If Grafana is a standalone installation, access the Grafana console directly:

```sh
$ kubectl port-forward service/grafana 3000:3000
```

Open Grafana console in your browser: http://localhost:3000

### Service Statistics View
Supports application and instance-level statistical views. For each statistical granularity, you can further view:

1. Provider traffic view

![grafana-dashboard-1.png](/imgs/v3/advantages/grafana-dashboard-1.png)

2. Consumer traffic view

![grafana-dashboard-1.png](/imgs/v3/advantages/grafana-dashboard-1.png)

3. Registry center view

TBD

4. Configuration center view

TBD

### JVM Instance View

![grafana-dashboard-2.png](/imgs/v3/advantages/grafana-dashboard-2.png)

### About the Official Grafana Dashboard for Dubbo

Dubbo provides rich metric panels. The views mentioned above can be found in Grafana's official panel library; you can directly import the following templates and configure the data source.

**Apache Dubbo Observability Dashboard:**  [https://grafana.com/grafana/dashboards/18469](https://grafana.com/grafana/dashboards/18469)

**JVM (Micrometer) Dashboard:** [https://grafana.com/grafana/dashboards/4701](https://grafana.com/grafana/dashboards/4701)

