---
type: docs
title: "Brief"
linkTitle: "Brief"
weight: 12
---

[Pod Lifecycle](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/) is closely related to micro-service scheduling. Through the implementation of official Kubernetes probes, the life cycle of Dubbo and even the entire application can be aligned with the Pod Lifecycle.
Using Dubbo's SPI mechanism, a variety of "probes" are implemented internally. Based on the HTTP service of the Dubbo QOS operation and maintenance module, the container probe can obtain the status of the corresponding probe in the application. In addition, the implementation mechanism of SPI is also conducive to users to expand their own internal "probes", so that the entire application life cycle can be more effectively controlled.


## Usage


Example （For details, please refer to the configuration file of the Kubernetes Registry in dubbo-samples）
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


At present, the three probes have corresponding interfaces. The `path` section is the command in Dubbo QOS. Please modify the `port` section according to the QOS configuration ( default port is 22222 ). For other     parameters, please refer to the [official documentation](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/).


Note: In order to enable the Kubernetes cluster to access the probe correctlly, you need to enable allow remote access for Dubbo QOS. This operation may bring security risks. Please carefully evaluate and then open it.


## Implementation details


The SPI interfaces corresponding to the three probes in Kubernetes are as follows：

- livenessProbe: `org.apache.dubbo.qos.probe.LivenessProbe`
- readinessProbe: `org.apache.dubbo.qos.probe.ReadinessProbe`
- startupProbe: `org.apache.dubbo.qos.probe.StartupProbe`



The QOS command will automatically obtain all SPI implementations of the current application. When all of the SPI implementations of the corresponding interfaces are in ready mode, and the command will returns success.


#### Liveness
For livenessProbe, because the Dubbo framework itself cannot obtain the liveness status of the application, there is no default implementation of this interface and it will always return success by default. Developers can expand this SPI interface according to the SPI definition and judge whether it is alive at the application level.


#### Readiness
For readinessProbe, Dubbo currently provides two detection dimensions by default. One is to judge whether the Dubbo service itself is started or stopped, and the other is to determine whether all services have registered interfaces. If all services have been offline from the registry ( you can offline them through Dubbo QOS ) will return to not ready state.


#### Startup
For startupProbe, Dubbo currently provides one detection dimension by default, which is to return to the ready state after all startup processes (interface exposure, registry writing, etc.) are completed.

