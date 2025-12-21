---
description: Quickly try Dubbo features
linkTitle: Getting started
title: Quickstart
type: docs
weight: 1
---
> The service mesh is currently in an early experimental stage. Standard features will be gradually completed and supported.

Dubbo Service Mesh is a proxyless mesh model developed in 2025. This mode introduces no extra proxy forwarding overhead, making it suitable for all performance-sensitive applications and for any deployment environment.

- Each deployed application injects a Dubbo Agent that only provides XDS and SDS services, enabling direct inter-service communication through the native gRPC xDS client.
- All injected agents are based on Kubernetes Gateway API to implement communication between services and external systems.

## Download Dubbo

Go to the Dubbo release page and download the installer for your OS, or automatically download the latest version (Linux or macOS):

```bash
curl -L https://dubbo.apache.org/downloadDubbo | sh -
```

Change to the Dubbo package directory:

```bash
cd dubbo-x.xx.x
```

## Install Dubbo

Install Dubbo with the default profile:

```bash
dubboctl install -y
```

Label the namespace to tell Dubbo to automatically inject the Dubbo Agent when deploying applications:

```bash
kubectl label namespace default dubbo-injection=enabled
```

{{< blocks/section color="white" height="auto">}}
<div class="td-content list-page">
    <div class="lead"></div>
    <header class="article-meta"></header>

    <div style="width:100%; text-align:center;">
        <a
            class="btn btn-lg btn-primary"
            href='{{< relref "./setup/install" >}}'
            style="min-width:200px; color: white; display: inline-block; margin: 0 auto; transform: translateX(-40px);"
        >
            Get started with Proxyless mode
        </a>
    </div>
</div>
{{< /blocks/section >}}

