---
aliases:
    - /en/overview/reference/setup/install/
description: Dubbo Control Plane is the core dependency for microservice governance. This document describes how to quickly install the Dubbo Admin control plane, console, and components such as service discovery and monitoring.
linkTitle: Install Dubbo
title: Install Dubbo Admin and Governance Components
toc_hide: true
type: docs
weight: 50
---

## Dubboctl Installation
### Download
Download the Dubbo Admin release version
```shell
curl -L https://dubbo.apache.org/installer.sh | VERSION=0.1.0 sh -
# Admin needs to organize the release versions well
```

Put dubboctl into the executable path
```shell
ln -s dubbo-admin-0.1.0/bin/dubboctl /usr/local/bin/dubboctl
```
### Install
The installation process will sequentially:

1. Install some resources customized by Admin
2. Pull up different component services such as Admin, Nacos, Zookeeper, etc.
```shell
dubboctl install # Install using default manifests

# or

dubboctl manifests | kubectl apply -f -
```

```shell
dubboctl install --set profile=minimal # Specify a different profile, i.e., combination of installation components
```

```shell
dubboctl install --set admin.nacos.enabled=true, admin.nacos.namespace=test
# Specify different override parameters
```

Check the installation result
```shell
kubectl get pod -n dubbo-system
```

### Open the Admin Console
```shell
kubectl port-forward svc/dubbo-admin -n dubbo-system 38080:38080
```

Open your browser and visit: `http://127.0.0.1:38080/`
## Helm Installation
### Prerequisites

- [Install the Helm client](https://helm.sh/docs/intro/install/), version 3.6 or above.
- Kubernetes cluster
- Configure helm repository
```shell
$ helm repo add dubbo https://dubbo.apache.org/charts
$ helm repo update
```
### Installation Steps
#### Method One
```shell
helm install dubbo-admin dubbo/dubbo-stack -n dubbo-system

helm install dubbo-admin-nacos dubbo/dubbo-stack -n dubbo-system

helm install dubbo-admin-zookeeper dubbo/dubbo-stack -n dubbo-system
```

```shell
helm install dubbo-admin-grafana dubbo/dubbo-stack -n dubbo-system

helm install dubbo-admin-prometheus dubbo/dubbo-stack -n dubbo-system
```
#### Method Two
```shell
helm install dubbo-admin-all dubbo/dubbo-stack -n dubbo-system
```

> Issue. It needs to be clear which components are production-ready and which are for display only, such as nacos/zookeeper/admin for production readiness, prometheus/grafana for display only.
> Based on the above conclusion, in most cases, dubbo-admin-all is not recommended for production installation; more recommended is using similar dubbo-admin-nacos production-ready package and using the prometheus community production installation package yourself.


Check the installation status
```shell
helm ls -n dubbo-system

kubectl get deployments -n dubbo-system --output wide
```

## VM Installation
### Download
Download the Dubbo Admin release version
```shell
curl -L https://dubbo.apache.org/installer.sh | VERSION=0.1.0 sh -
# Admin needs to organize the release versions well
```

Put dubboctl into the executable path
```shell
ln -s dubbo-admin-0.1.0/bin/dubbo-admin /usr/local/bin/dubbo-admin
```
### Run
```shell
dubbo-admin run -f override-configuration.yml
```
### Configuration
Configure to control the behavior of dubbo-admin

