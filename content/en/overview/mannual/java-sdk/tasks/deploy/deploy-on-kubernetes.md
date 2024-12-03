---
aliases:
    - /en/overview/tasks/deploy/deploy-on-vm/
    - /en/overview/tasks/deploy/deploy-on-vm/
description: "Deploy Dubbo applications to Kubernetes environments, using Nacos or Zookeeper as the registry."
linkTitle: Kubernetes
title: Deploying Dubbo Applications to Kubernetes Environments
type: docs
weight: 2

---
This model is not much different from traditional non-Kubernetes deployments. As shown in the picture below, Nacos or Zookeeper is still used as the registry, but Kubernetes is used as the underlying platform for application lifecycle scheduling.

<img src="/imgs/v3/manual/java/tutorial/kubernetes/kubernetes.png" style="max-width:650px;height:auto;" />

## Install Nacos
In Kubernetes mode, we recommend using `dubboctl` to quickly install components like Nacos, dubbo-control-plane, prometheus, etc.:

```yaml
$ dubboctl install --profile=demo
```

{{% alert title="Tip" color="primary" %}}
1. Please refer to dubboctl for more details.
2. You can also check out the official Nacos installation plan for Kubernetes clusters.
{{% /alert %}}

## Deploy Application
We still take the project in [Quick Start]() as an example to demonstrate the specific steps for packaging and deploying the application.

First, clone the sample project locally:
```shell
$ git clone -b main --depth 1 https://github.com/apache/dubbo-samples
````

Switch to the example directory:
```shell
$ cd dubbo-samples/11-quickstart
```

### Package Image
```shell
$ dubboctl build
# Specifically push to docker repository
```

### Deploy

```shell
$ dubboctl deploy
```

Here are the generated complete Kubernetes manifests:

```yaml

```

Run the following command to deploy the application to the Kubernetes cluster:
```shell
$ kubectl apply -f xxx.yml
```

### Check Deployment Status
If you have previously installed dubbo-control-plane using `dubboctl`, you can check the service deployment status as follows:

```shell
$ kubectl port-forward
```

Access `http://xxx` to view the service deployment details.

### Graceful Online/Offline
As shown in the architecture diagram above, we still use Nacos as the registry. Therefore, similar to traditional Linux deployment models, the timing of publishing instances to the registry and removing instances from the registry is key to achieving graceful online/offline:
1. Online phase, control when instances register to the registry using the [delayed publishing]() mechanism, and ensure traffic is gradually directed to new nodes by enabling [consumer-side warming]().
2. Offline phase, configure `prestop` to ensure instance registration information is removed from the registry first, before proceeding to the process destruction phase.

Example configuration for gracefully offline removing instances:

```yaml
preStop:
	exec:
	  command: ["/bin/sh","-c","curl /offline; sleep 10"]
```

{{% alert title="Tip" color="primary" %}}
In this model, since the publishing and unpublishing of Dubbo services are strongly tied to the registry, they do not correlate much with liveness and readiness in Kubernetes. In the next document, we will discuss how to configure liveness and readiness in Kubernetes Service deployment mode.
{{% /alert %}}

