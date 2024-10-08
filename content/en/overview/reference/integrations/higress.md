---
aliases:
- /en/overview/reference/integrations/skywalking/
description: "How to install and configure Higress, covering local, docker, kubernetes, and other environments."
linkTitle: Higress
title: Higress
type: docs
weight: 6
---

This document explains how to install and configure Higress, covering local, docker, kubernetes, and other environments. Below is a quick sample installation guide; for setting up a production-ready cluster, please refer to the official Higress documentation.

## docker
To start Higress using docker, please ensure you have correctly <a href="https://docs.docker.com/engine/install/" target="_blank">installed docker</a> on your local machine.

Use the following command to install Higress:

```shell
curl -fsSL https://higress.io/standalone/get-higress.sh | bash -s -- -a -c nacos://192.168.0.1:8848 --nacos-username=nacos --nacos-password=nacos
```

Please replace `192.168.0.1` with the IP of the Nacos server (if Nacos is deployed locally, do not use loopback addresses such as `localhost` or `127.0.0.1`). Adjust the values of --nacos-username and --nacos-password as needed; if Nacos service does not have authentication enabled, these two parameters can be removed.

{{% alert title="Note" color="info" %}}
* If you haven't installed nacos, please [refer to the documentation for installation](../nacos/) .
* If you are using Zookeeper for service discovery, please modify the corresponding cluster address to the zookeeper cluster address.
{{% /alert %}}

Enter `http://127.0.0.1:8080` in your browser to access the Higress console.

## kubernetes

Install Higress with the following command:

```shell
helm repo add higress.io https://higress.io/helm-charts
helm install higress -n higress-system higress.io/higress --create-namespace --render-subchart-notes --set global.local=true --set higress-console.o11y.enabled=false
```

Use the following port forwarding command to open ports for local access:

```shell
kubectl port-forward service/higress-gateway -n higress-system 80:80 443:443 8080:8080
```

Enter `http://127.0.0.1:8080` in your browser to access the Higress console.

