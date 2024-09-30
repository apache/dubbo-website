---
aliases:
    - /en/overview/what/advantages/governance/
description: Service Governance
linkTitle: Service Governance
title: Service Governance
type: docs
weight: 3
---




## Traffic Control

Beyond address discovery and load balancing mechanisms, Dubbo's rich traffic control rules can manage the flow direction and API calls between services. Based on these rules, you can dynamically adjust service behaviors such as timeout periods, retry counts, and rate limiting parameters during runtime. By controlling traffic distribution, you can achieve A/B testing, canary releases, multi-version traffic allocation by ratio, conditional routing, black and white lists, etc., thereby improving system stability.

#### What problems can Dubbo traffic control solve?
Scenario 1: Setting up multiple independent logical test environments.

Scenario 2: Setting up a completely isolated online gray environment for deploying new version services.

![gray1](/imgs/v3/tasks/gray/gray1.png)

Scenario 3: Canary release

![weight1.png](/imgs/v3/tasks/weight/weight1.png)

Scenario 4: Same region priority. When applications are deployed in multiple different data centers/regions, prioritize calling service providers in the same data center/region to avoid network latency caused by cross-region calls, thereby reducing response time.

![region1](/imgs/v3/tasks/region/region1.png)

In addition to the typical scenarios mentioned above, we can also achieve richer traffic control in microservice scenarios based on Dubbo's supported traffic control rules, such as:

* Dynamic adjustment of timeout periods
* Service retries
* Access logs
* Same region priority
* Gray environment isolation
* Parameter routing
* Traffic splitting by weight ratio
* Canary release
* Service degradation
* Temporary blacklisting of instances
* Specified machine traffic redirection

You can learn more about the details of the above practical scenarios in [Traffic Management Tasks](../../../tasks/traffic-management/). For the underlying rule definitions and working principles, please refer to [Dubbo Traffic Control Rule Design and Definition](../../../core-features/traffic/).

## Microservice Ecosystem
Around Dubbo, we have built a comprehensive microservice governance ecosystem. For most service governance needs, you can enable them with just a few lines of configuration. For components not yet adapted by the official team or internal user systems, you can also easily adapt them through Dubbo's extension mechanism.

![governance](/imgs/v3/what/governance.png)

## Visual Console
Dubbo Admin is a visual web interactive console provided by Dubbo. Based on Admin, you can monitor cluster traffic, service deployment status, and troubleshoot issues in real-time.

## Security System
Dubbo supports HTTP, HTTP/2, and TCP data transmission channels based on TLS, and provides authentication and authorization strategies, allowing developers to achieve finer-grained resource access control.

## Service Mesh
Services developed based on Dubbo can transparently integrate into service mesh systems like Istio. Dubbo supports traffic interception based on Envoy and also supports a more lightweight Proxyless Mesh deployment mode.
