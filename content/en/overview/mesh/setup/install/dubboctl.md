---
description: Install using Dubboctl
linkTitle: Dubboctl
title: dubboctl
type: docs
weight: 1
---

This installation guide uses the `dubboctl` command-line tool, which provides rich customization for the Dubbo control plane and data plane adapters. You can choose any built-in Dubbo profile and further customize it for your specific needs.

The `dubboctl` command exposes the full DubboOperator API via command-line flags. These flags can be set individually or passed via YAML files that contain DubboOperator custom resources (CRs).

## Prerequisites

Before you begin, check the following prerequisites:

1. [Download the Dubbod release](../../getting-started.md)

## Install Dubbo using a profile

```bash
dubboctl install -y
```

This command installs the default profile into your Kubernetes cluster.

You can choose any built-in Dubbo profile:

```bash
dubboctl install --set profile=demo
```

You can pass the profile name from the command line to install it into the cluster.

## Generate manifests before installation

```bash
dubboctl manifest generate > $HOME/generated-manifest.yaml
```

## Uninstall

To completely uninstall Dubbo from the cluster, run:

```bash
istioctl uninstall --remove -y
```

This removes all Dubbo resources. Future versions will support specifying a manifest file.

The `dubbo-system` namespace is not removed by default. If you no longer need it, remove it with:

```bash
kubectl delete namespace dubbo-system
```

