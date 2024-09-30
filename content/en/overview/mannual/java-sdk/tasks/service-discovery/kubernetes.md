---
aliases:
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/performance/loadbalance/
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/performance/loadbalance/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/others/graceful-shutdown/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/service/consistent-hash/
description: "Demonstrates service discovery patterns based on Kubernetes Service through examples."
linkTitle: Using Kubernetes Registry
title: Service Discovery Based on Kubernetes Service
type: docs
weight: 5
---

In the previous two sections, we discussed two registration center patterns: Nacos and Zookeeper, which are more traditional registration center solutions. In a Kubernetes deployment environment, Dubbo supports a service discovery pattern based on Kubernetes Service, which works as shown in the diagram below:

<img src="/imgs/v3/manual/java/tutorial/kubernetes/kubernetes-service.png" style="max-width:650px;height:auto;" />

In this mode, service discovery aligns with the user's deployment and operation tasks. Users define standard Kubernetes Services and Deployments, deploying them to Kubernetes. The Control Plane then monitors the APISERVER resources and interacts with the SDK processes to form a complete service discovery system.

For specific practical cases of using Kubernetes as a registry, please refer to the section on [Kubernetes Service Deployment]() for more details.

