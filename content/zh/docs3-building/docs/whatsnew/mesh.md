---
type: docs
title: "Dubbo Mesh"
linkTitle: "Dubbo Mesh"
weight: 4
---
通过以下示例快速查看使用&部署示例
* [Dubbo Sidecar Mesh](../../tasks/dubbo-mesh-sidecar)
* [Dubbo Proxyless Mesh](../../tasks/dubbo-mesh-sidecar)

## Service Mesh
在云原生背景下，如果我们将 Service Mesh 理解为底层基础设施，则在 Mesh 架构中，以往耦合在业务进程中的微服务治理部分能力正被 Mesh 接管，传统微服务框架更注重 RPC 协议与编程模型。以下是时下流行的 Mesh 产品 Istio 的架构图：

![istio](/imgs/v3/mesh/istio.jpg)

在 Mesh 架构下
* 统一的控制面提供证书管理、可观测性、流量治理等能力
* Sidecar 让 SDK 更轻量、侵入性更小，更好的实现透明升级、流量拦截等

## Dubbo Mesh
Dubbo Mesh 从设计理念上更强调控制面的统一管控、标准化与治理能力，而在数据面给出了更多的选择，包括 Sidecar Mesh 与 Proxyless Mesh 等部署模式。
多种部署模型给企业提供了更多选择，通过混合部署的模型，在实现服务治理控制面的共享的同时，可以更好的应对不同场景的部署要求，适应复杂的基础设施环境并从总体上提升架构的可用性。

![dubbo-sidecar](/imgs/v3/mesh/mix-mesh.png)

### Sidecar Mesh
如下图所示，Dubbo 可以与 Sidecar 部署在同一个 Pod 或容器中，通过在外围部署一个独立的控制平面，实现对流量和治理的统一管控。控制面与 SIcecar 之间通过图中虚线所示的 xDS 协议进行配置分发，而 Dubbo 进程间的通信不再是直连模式，转而通过 Sidecar 代理，Sidecar 拦截所有进出流量，并完成路由寻址等服务治理任务。

![dubbo-sidecar](/imgs/v3/mesh/dubbo-sidecar.png)

Sidecar 模式的 Mesh 架构有很多优势，如平滑升级、多语言、业务侵入小等，但也带来了一些额外的问题，比如：
* Sidecar 通信带来了额外的性能损耗，这在复杂拓扑的网络调用中将变得尤其明显。
* Sidecar 的存在让应用的声明周期管理变得更加复杂。
* 部署环境受限，并不是所有的环境都能满足 Sidecar 部署与请求拦截要求。

### Proxyless Mesh

针对上述问题，Dubbo 社区自很早之前就做了 Dubbo 直接对接到控制面的设想与思考，并在国内开源社区率先提出了 Proxyless Mesh 的概念，Proxyless 概念最开始是谷歌提出来的。
Proxyless 模式使得微服务又回到了 2.x 时代的部署架构，如下图所示，和我们上面看的 Dubbo 经典服务治理模式非常相似，所以说这个模式并不新鲜， Dubbo 从最开始就是这么样的设计模式。但相比于 Mesh 架构，Dubbo2 并没有强调控制面的统一管控，而这点恰好是 Service Mesh 所强调的，强调对流量、可观测性、证书等的标准化管控与治理，也是 Mesh 理念先进的地方。

![dubbo-proxyless](/imgs/v3/mesh/dubbo-proxyless.png)

通过不同语言版本的 Dubbo3 SDK 直接实现 xDS 协议解析，实现 Dubbo 与 Control Plane 的直接通信，进而实现控制面对流量管控、服务治理、可观测性、安全等的统一管控，规避 Sidecar 模式带来的性能损耗与部署架构复杂性。

在 Dubbo3 Proxyless 架构模式下，Dubbo 进程将直接与控制面通信，Dubbo 进程之间也继续保持直连通信模式，我们可以看出 Proxyless 架构的优势：
* 没有额外的 Proxy 中转损耗，因此更适用于性能敏感应用
* 更有利于遗留系统的平滑迁移
* 架构简单，容易运维部署
* 适用于几乎所有的部署环境

### 高级用法
Dubbo SDK 提供了非常灵活的配置来控制服务治理行为，如接口粒度的服务地址发现能力、接口粒度的配置同步等，这些能力让应用的开发和部署更加灵活。而在通用的 Mesh 部署方案或产品下一些高级功能可能受限，从总体上影响了易用性与灵活性，为此 Dubbo 计划提供了一些变种的部署方案或控制面定制产品，以满足深度用户的一些高级需求。









