---
aliases:
    - /en/overview/tasks/deploy/deploy-on-vm/
    - /en/overview/tasks/deploy/deploy-on-vm/
description: "Deploying Dubbo applications to a Service Mesh based on Kubernetes Service and control plane."
linkTitle: Service Mesh
title: Deploying Dubbo Applications to a Virtual Machine Environment
type: docs
weight: 3
---
This model maps Dubbo Service to the concept of <a target="_blank" href="">Kubernetes Service</a>, eliminating the need for traditional registries like Nacos, with the Kubernetes APISERVER taking on the role of the registry.

<img src="/imgs/v3/manual/java/tutorial/kubernetes/kubernetes-service.png" style="max-width:650px;height:auto;" />

## Install Control Plane
In this model, we need to install `dubbo-control-plane`
> Should it work with istio (providing xds push capability), or should dubbo-control-plane implement the xds server itself?

```yaml
dubboctl manifests install --profile=control-plane
```

## Deploy Application
### Package Image
### Define YAML
Please refer to dubbo-samples for examples.

```yaml
kind: service
```

```yaml
kind: deployment
```

### Graceful Shutdown

Configure probe
Configure pre-stop

### Observe Service Status

## Differences with Service Mesh

## Feature Description
[Pod Lifecycle](https://kubernetes.io/zh/docs/concepts/workloads/pods/pod-lifecycle/) is closely related to service scheduling. By implementing Kubernetes official probes, Dubbo3 and the entire application's lifecycle can be affected throughout the Pod's lifecycle through health checks, which can be configured using liveness probe and readiness probe.

Through Dubbo3's SPI mechanism, multiple "probes" are internally implemented based on Dubbo3 QOS operations module's HTTP services, enabling container probes to obtain corresponding probe states within the application. Moreover, the SPI implementation mechanism also facilitates users to extend internal "probes," making the entire application lifecycle more effectively governed.

**Three Probes Corresponding SPI Interfaces**

-   livenessProbe:  `org.apache.dubbo.qos.probe.LivenessProbe`
-   readinessProbe:  `org.apache.dubbo.qos.probe.ReadinessProbe`
-   startupProbe:  `org.apache.dubbo.qos.probe.StartupProbe`

The interface will automatically acquire all SPI implementations of the current application, returning success if all corresponding SPI implementations are successfully ready.

See more about Dubbo3 SPI extensions at [Dubbo SPI Extensions](/en/overview/mannual/java-sdk/reference-manual/spi/description/)

## Usage Scenarios
`liveness probe` to determine if your application is running and check if it is alive.

`readiness probe` to determine whether the container is ready to receive traffic, whether it is prepared, and whether it can start working.

`startup probe` to determine whether the application inside the container has started. If a startup probe is provided, all other probes are disabled until it succeeds. If the startup probe fails, the container will be killed, and it will follow its restart policy. If no startup probe is provided, the default state is successful.

## Usage

### Liveness Check

For livenessProbe checks, since the Dubbo3 framework cannot obtain the application’s liveness status, this interface has no default implementation and defaults to returning success. Developers can extend this SPI interface to determine liveness from the application level.

See [liveness probe](/en/overview/mannual/java-sdk/reference-manual/spi/description/liveness/) extension example.
### Readiness Check

For readinessProbe checks, Dubbo3 currently provides two dimensions for checking; one is to determine if Dubbo3 services are starting and stopping, and the other is to check if all registered interfaces exist. If all services are offline from the registry (which can be operated via QOS), it will return an unready status.

See [readiness probe](/en/overview/mannual/java-sdk/reference-manual/spi/description/readiness/) extension example.

### Startup Check

For startupProbe checks, Dubbo3 currently provides a check dimension where it returns a ready state after all startup processes (interface exposure, writing to registry, etc.) are complete.

See [startup probe](/en/overview/mannual/java-sdk/reference-manual/spi/description/startup/) extension example.

### Reference Example
```yaml
livenessProbe:
  httpGet:
    path: /live
    port: 22222
  initialDelaySeconds: 5
  periodSeconds: 5
readinessProbe:
  httpGet:
    path: /ready
    port: 22222
  initialDelaySeconds: 5
  periodSeconds: 5
startupProbe:
  httpGet:
    path: /startup
    port: 22222
  failureThreshold: 30
  periodSeconds: 10
```
> When the QOS calculates that the node detects memory pressure, Kubernetes will evict Pods in the order of BestEffort -> Burstable -> Guaranteed.

Currently, all three probes have corresponding interfaces, with paths being commands in QOS, and port information should be modified according to QOS configuration (default port is 22222). Refer to the [Kubernetes official documentation](https://kubernetes.io/zh/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/) for other parameters.

