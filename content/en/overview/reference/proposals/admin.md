---
aliases:
    - /en/overview/reference/proposals/admin/
author: Jun Liu
date: 2023-02-28T00:00:00Z
description: |
    This article describes the overall architectural design and abstraction of Dubbo Admin as a control plane.
linkTitle: Admin Architecture Design
title: Overall Architecture Design of Dubbo Admin Control Plane
type: docs
weight: 3
working_in_progress: true
---


## 1 Overall Architecture of Dubbo
![DubboAdmin Architecture Diagram.png](/imgs/v3/reference/admin/architecture.png)

The architecture is divided into: **Service Governance Abstract Control Plane** and **Dubbo Data Plane**.

- **Service Governance Control Plane.** The control plane includes components such as the registry, traffic management strategies, Admin console, Istio, OpenSergo, etc.
- **Dubbo Data Plane.** The data plane represents all Dubbo processes in cluster deployment, which exchange data via RPC protocol and interact with governance strategies from the control plane.

**Further explanation:** https://cn.dubbo.apache.org/zh-cn/overview/what/overview/

## Overall Positioning and Explanation of Dubbo Admin

**Dubbo Admin is a unified definition and abstraction of the microservice governance system, providing uniform development and operation differences for microservice clusters deployed under different deployment architectures and infrastructure environments through custom core components and a series of supporting tools.**

## 2 User-Oriented Development Steps
### Step 1: Install Dubbo Stack/Admin
> The core idea is to eliminate architectural differences by incorporating the installation and configuration of governance components into a prerequisite step in the Dubbo system through a unified entry point.

```shell
dubboctl install dubbo-stack
```

For installation, see: [Dubbo Admin Installation Guide](../../setup/install/)

### Step 2: Service Framework Development

- [Java](https://cn.dubbo.apache.org/zh-cn/overview/quickstart/java/)
- [Go](https://cn.dubbo.apache.org/zh-cn/overview/quickstart/go/)
- [Node.js](https://github.com/apache/dubbo-js)
- [Rust](https://cn.dubbo.apache.org/zh-cn/overview/quickstart/rust/)

## 3 Control Plane Solutions
![Dubbo Architecture Draft.jpeg](/imgs/v3/reference/admin/architecture-draft.png)
### 3.1 Identify Core Capabilities of the Dubbo Microservice Governance System

- Service Discovery
- Configuration Management
- Traffic Governance Rules
- Security Infrastructure
- Visualization Console

### 3.2 Unified Access Method for Service Governance Layer

![address-discovery.png](/imgs/v3/reference/admin/address-discovery.png)

**For any microservice deployment model, the Dubbo data plane uniformly targets **`**dubbo://hopst:ip**`** for programming the abstract service governance control plane.**

Specific workflow:

1. The data plane interacts with the admin component through configuration, and the admin returns the addresses of the actual registry, configuration center, and other components under the current deployment architecture, such as `nacos://host:port`.
2. After receiving the new component addresses, the data plane component directly establishes communication with Nacos, relying on Nacos to complete service discovery and other functions.

### 3.3 How to Realize These Core Capabilities in Different Scenarios?
#### Scenario 1: Traditional Microservice System (VM & Kubernetes)

- One-click installation of control plane governance system (Admin & Nacos)
- Traditional Nacos service discovery and governance model
- The control plane can pull up more components as needed, such as Prometheus, etc.

![traditional.png](/imgs/v3/reference/admin/traditional.png)

#### Scenario 2: Kubernetes Service

1. **Istio Mode**

![kubernetes-service.png](/imgs/v3/reference/admin/kubernetes-service.png)

2. **Other Peer Modes Nacos/OpenSergo**
#### Scenario 3: Migration or Multi-cluster
Clusters in isolated sub-network space

- 1
- 2


![multi-cluster-ingress.png](/imgs/v3/reference/admin/multi-cluster-ingress.png)

Clusters in the same network space

![multi-cluster.png](/imgs/v3/reference/admin/multi-cluster.png)

### 3.4 Admin Control Plane

![admin-core-components.png](/imgs/v3/reference/admin/admin-core-components.png)

### 3.5 Other Supporting Infrastructures and Tools

#### User Console

Interactive address: [https://qedzyx.axshare.com/#id=2pqh0k&p=admin__&g=1](https://qedzyx.axshare.com/#id=2pqh0k&p=admin__&g=1)

![console-ui.png](/imgs/v3/reference/admin/console-ui.png)

#### Dubboctl & Helm

