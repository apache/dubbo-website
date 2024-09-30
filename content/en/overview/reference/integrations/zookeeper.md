---
aliases:
- /en/overview/reference/integrations/skywalking/
description: "How to install and configure Zookeeper, covering local, docker, kubernetes, and other environments."
linkTitle: Zookeeper
title: Zookeeper
type: docs
weight: 6
---

This article explains how to install and configure Zookeeper, covering local, docker, kubernetes, and other environments. The following is just a quick example installation guide; for setting up a production-ready cluster, please refer to the Zookeeper official documentation.

## Local Download

#### Download Zookeeper
Please go to the Apache Zookeeper <a href="https://zookeeper.apache.org/releases.html" target="_blank">download page</a> to download the latest version of the Zookeeper release package.

Unpack the downloaded Zookeeper package:

```shell
tar -zxvf apache-zookeeper-3.8.3.tar.gz
cd apache-zookeeper-3.8.3
```

#### Start Zookeeper

Before starting Zookeeper, you need to create the file `conf/zoo.cfg` in the root directory:

```
tickTime=2000
clientPort=2181
admin.enableServer=false
```

Here are detailed explanations of some parameters:
* tickTime: The basic time setting used by Zookeeper, tickTime is the heartbeat detection interval, 2*tickTime is the maximum session timeout (in milliseconds).
* clientPort: The listening port, clients can connect to the Zookeeper server through this port.
* admin.enableServer: The maintenance port, default is 8080, recommended to turn off to prevent conflicts with Spring web applications.

Next, you can start Zookeeper in standalone mode:

```shell
bin/zkServer.sh start
```

#### Test Connection to ZooKeeper

Run the following command to connect to the just started Zookeeper server:

```shell
$ bin/zkCli.sh -server 127.0.0.1:2181
```

Once connected successfully, you will see the following output:

```shell
Connecting to localhost:2181
...
Welcome to ZooKeeper!
JLine support is enabled
[zkshell: 0]
```

Execute the following command to view the root node contents:

```shell
[zkshell: 8] ls /
[zookeeper]
```

## Docker

To start Zookeeper using Docker, please ensure you have correctly <a href="https://docs.docker.com/engine/install/" target="_blank">installed Docker</a> on your local machine.

Run the following command to start the Zookeeper server:

```shell
docker run --name some-zookeeper -p 2181:2181 -e JVMFLAGS="-Dzookeeper.admin.enableServer=false" --restart always -d zookeeper:3.8.3
```

If you want to specify the `/conf` configuration file, you can mount the local file to the Docker container:
```shell
$ docker run --name some-zookeeper --restart always -e JVMFLAGS="-Dzookeeper.admin.enableServer=false" -d -v $(pwd)/zoo.cfg:/conf/zoo.cfg
```

## Kubernetes

You can quickly install Zookeeper to a Kubernetes cluster using the example configuration provided by the Dubbo community.

```shell
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-kubernetes/master/deploy/kubernetes/zookeeper.yaml
```

