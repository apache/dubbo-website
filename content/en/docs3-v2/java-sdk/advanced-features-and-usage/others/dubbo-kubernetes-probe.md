---
type: docs
title: "Kubernetes Probe"
linkTitle: "Kubernetes Probe"
weight: 5
description: "Understand the extension and application scenarios of Dubbo3 and Kubernetes life cycle alignment probe"
---

## Feature description
[Pod lifecycle](https://kubernetes.io/zh/docs/concepts/workloads/pods/pod-lifecycle/) is closely related to service scheduling. Through the implementation of official Kubernetes probes, Dubbo3 and even the entire application can The life cycle of the Pod and the life cycle of the Pod. In the entire life cycle of the Pod, only the health check part of the Pod is affected. We can configure the liveness probe (survival probe) and readiness probe (readability probe) to Affects the life cycle of the container.

Through the SPI mechanism of Dubbo3, various "probes" are implemented internally, based on the HTTP service of the Dubbo3 QOS operation and maintenance module, so that the container probe can obtain the status of the corresponding probe in the application. In addition, the implementation mechanism of SPI is also conducive to users' self-expanding of internal "probes", so that the entire application life cycle can be more effectively controlled.

**SPI interfaces corresponding to the three probes**

- livenessProbe: `org.apache.dubbo.qos.probe.LivenessProbe`
- readinessProbe: `org.apache.dubbo.qos.probe.ReadinessProbe`
- startupProbe: `org.apache.dubbo.qos.probe.StartupProbe`

The interface will automatically obtain the implementation of all SPIs of the current application, and the interface will return success if the SPI implementations of the corresponding interface are successfully ready.

For an introduction to more extensions of Dubbo3 SPI, see [Dubbo SPI Extensions](/en/docs3-v2/java-sdk/reference-manual/spi/description/)

## scenes to be used
- kubelet uses `liveness probe` to determine if your application is running, to see if it is alive. Generally speaking, if your program crashes, Kubernetes will immediately know that the program has terminated, and then restart the program. The purpose of our liveness probe is to capture that the current application has not terminated or crashed. If these situations occur, restart the container in this state so that the application can still continue in the presence of bugs run down.
- The kubelet uses `readiness probe` to determine if the container is ready to receive traffic. Is it ready and ready to work now. Only when the containers in the Pod are all in the ready state, the kubelet will consider the Pod to be in the ready state, because there may be multiple containers under a Pod. If the Pod is not ready, we will remove it from the Service's Endpoints list, so that our traffic will not be routed to the Pod.

## How to use

### Survival detection

For the livenessProbe liveness detection, since the Dubbo3 framework itself cannot obtain the liveness status of the application, this interface has no default implementation and returns success by default. Developers can expand this SPI interface according to the SPI definition, and judge whether it is alive or not from the application level.

About [liveness liveness probe](../../../reference-manual/spi/description/liveness/) extension example
### Readiness check

For the readinessProbe readiness detection, Dubbo3 currently provides two detection dimensions by default. One is to judge whether the Dubbo3 service itself is started or stopped, and the other is to check whether all services have registered interfaces. If all services have been offline from the registration center (you can Operate via QOS Operations) will return Not Ready.

About the [readiness readiness probe](../../../reference-manual/spi/description/readiness/) extended example

### Start detection

For startupProbe startup detection, Dubbo3 currently provides a detection dimension by default, which is to return to the ready state after all startup processes (interface exposure, registration center writing, etc.) are completed.

About the [startup startup probe](../../../reference-manual/spi/description/startup/) extended example

### Reference example
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
> QOS When the computing node detects memory pressure, kuberentes will BestEffort -> Burstable -> Guaranteed to evict Pods in sequence.

At present, all three probes have corresponding interfaces, and the path is the command in QOS. Please modify the port information according to the QOS configuration (the default port is 22222). For other parameters, please refer to [Kubernetes official documentation](https://kubernetes.io/zh/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/).