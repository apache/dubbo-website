---
aliases:
- /en/overview/reference/integrations/skywalking/
description: "How to install and configure Nacos, covering local, docker, kubernetes, and other environments."
linkTitle: Nacos
title: Nacos
type: docs
weight: 5
---

This document explains how to install and configure Nacos, covering local, docker, and kubernetes environments. The following is just a quick example installation guide; for setting up a production-ready cluster, please refer to the official Nacos documentation.

## Local Download

Nacos depends on the <a href="https://sdkman.io/" target="_blank">Java environment</a> to run, currently supporting environments such as Linux, MacOS, and Windows.

You can <a href="https://github.com/alibaba/nacos/releases" target="_blank">download the latest stable version of Nacos</a> and extract the binary package:

```shell
unzip nacos-server-$version.zip
cd nacos/bin
#tar -xvf nacos-server-$version.tar.gz
```

#### Startup Command
```shell
# Linux/Unix/Mac
sh startup.sh -m standalone

# Ubuntu
bash startup.sh -m standalone

# Windows
startup.cmd -m standalone
```

#### Verify Nacos Started Normally

Access the console via the browser at the following link: http://127.0.0.1:8848/nacos/

## Docker
To start Nacos using Docker, please ensure you have properly <a href="https://docs.docker.com/engine/install/" target="_blank">installed Docker</a> on your local machine.

```shell
docker run --name nacos-quick -e MODE=standalone -p 8849:8848 -d nacos/nacos-server:2.3.1
```

## Kubernetes

Please refer to <a href="https://github.com/nacos-group/nacos-k8s/blob/master/operator/README-CN.md" target="_blank">nacos-operator</a> for details on deploying Nacos to a Kubernetes cluster.

