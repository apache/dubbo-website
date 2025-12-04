---
description: Install using Helm
linkTitle: Helm
title: Helm
type: docs
weight: 2
---

Follow this guide to install and configure the Dubbo mesh using Helm.

## Prerequisites

```bash
helm repo add dubbo https://charts.dubbo.apache.org
helm repo update
```

## Installation steps

1. Install the Dubbo Base chart, which contains cluster-wide custom resource definitions (CRDs). These must be installed before deploying the Dubbo control plane:

```bash
helm install dubbo-base dubbo/base -n dubbo-system --create-namespace
```

2. Install the Dubbo Discovery chart, which deploys Dubbo control plane services:

```bash
helm install dubbod dubbo/dubbod -n dubbo-system --wait
```

## Uninstall

1. List all Dubbo charts installed in the `dubbo-system` namespace:

```bash
helm ls -n dubbo-system
```

2. Delete the Dubbo Base chart:

```bash
helm delete dubbo-base -n dubbo-system
```

3. Delete the Dubbo Discovery chart:

```bash
helm delete dubbod -n dubbo-system
```

4. Delete the `dubbo-system` namespace:

```bash
kubectl delete namespace dubbo-system
```

