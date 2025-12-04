---
description: Quickly try Dubbo features
linkTitle: Getting started
title: Quickstart
type: docs
weight: 1
---

Special thanks to [Megan Yahya's KubeCon EU 2021 talk](https://www.youtube.com/watch?v=cGJXkZ7jiDk) for inspiration and related support.

Dubbo Service Mesh is a proxyless mesh model developed in 2025. In this model, processes communicate directly and interact with the control plane via the xDS protocol.

This mode introduces no extra proxy forwarding overhead, making it suitable for latency-sensitive applications and for any deployment environment.

## Download Dubbo

1. Go to the Dubbo release page and download the installer for your OS, or automatically download the latest version (Linux or macOS):

```bash
curl -L https://dubbo.apache.org/downloadDubbo | sh -
```

2. Change to the Dubbo package directory:

```bash
cd dubbo-x.xx.x
```

## Install Dubbo

1. Install Dubbo with the default profile:

```bash
dubboctl install -y
```

2. Label the namespace to tell Dubbo to automatically inject the Dubbo Agent when deploying applications:

```bash
kubectl label namespace default dubbo-injection=enabled
```

{{< blocks/section color="white" height="auto">}}
<div class="td-content list-page">
    <div class="lead"></div>
    <header class="article-meta"></header>
    <div class="row justify-content-center">
        <div class="col-sm col-md-5 mb-4">
            <div class="h-100 text-center">
                <a class="btn btn-lg btn-primary mb-3" href='{{< relref "./setup/install" >}}' style="min-width: 200px; color: white;">
                    Get started with Proxyless mode
                </a>
            </div>
        </div>
    </div>
</div>
{{< /blocks/section >}}

