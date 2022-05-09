
---
title: "用户案例"
weight: 3
description: Dubbo 用户案例分享，涵盖最新 3.0 版本
menu:
  main:
    weight: 20
---

{{< blocks/cover height="sm" color="primary" >}}
{{< page/header >}}
{{< /blocks/cover >}}

<div class="container l-container--padded">

<div class="row">
{{< page/toc collapsed=true placement="inline" >}}
</div>

<div class="row">
<div class="col-12 col-lg-12">

Apache Dubbo 诞生于阿里巴巴微服务实践之中，在开源之后深受企业用户喜爱并迅速成为国内开源服务框架选型的事实标准产品，用户范围涵盖互联网、金融保险、科技公司、制造业、零售物流等领域的几乎所有头部用户。


{{< cardpane >}}
  {{< card header="阿里巴巴的 Dubbo3 落地实践" >}} 
阿里巴巴多条核心业务包括淘宝、考拉、饿了么、钉钉、达摩院等业务线都已完全或部分迁移到 Dubbo3，用于取代上一代 HSF2 服务框架。  
<a href='{{< relref "alibaba.md" >}}'>了解更多</a>
  {{< /card >}}

  {{< card header="工商银行 Dubbo3 应用级服务发现实践" >}}
  工商银行为什么要选型 Dubbo3 应用级服务发现架构那？核心原因是 2.x 版本架构在超大规模集群实战上的性能和容量瓶颈。  
  <a href='{{< relref "alibaba" >}}'>了解更多</a>
  {{< /card >}}

  {{< card header="小米的 Dubbo-go 实践" >}}
  dubbo3已经和云原生做了深度适配，建议后续能够和istio等service mesh框架进行更多的衔接打通，方便dubbo用户更简单的走向mesh化之路；
  dubbo3重新设计了Triple协议和服务发现模型，为跨语言跨微服务框架的通信提供了可能，建议提供一些和go、springcloud打通的实际解决方案；
  建议在调用方和服务方调用链路上增加更多的可选可观测点  
  <a href='{{< relref "alibaba" >}}'>了解更多</a>
  {{< /card >}}
{{< /cardpane >}}

  {{< cardpane >}}
  {{< card header="阿里巴巴的 Dubbo3 落地实践" >}}
  阿里巴巴多条核心业务包括淘宝、考拉、饿了么、钉钉、达摩院等业务线都已完全或部分迁移到 Dubbo3，用于取代上一代 HSF2 服务框架。当前用到的核心功能包括：
* 下一代通信协议 Triple，实现反压、Stream、跨网关调用等
* 应用级服务发现模型，用于降低单机及注册中心资源消耗，实现百万实例集群水平扩容
* 统一的云原生服务治理规则
  {{< /card >}}
  {{< card header="工商银行 Dubbo3 应用级服务发现实践" >}}
  工商银行为什么要选型 Dubbo3 应用级服务发现架构那？核心原因是 2.x 版本架构在超大规模集群实战上的性能和容量瓶颈。
  {{< /card >}}
  {{< card header="小米的 Dubbo-go 实践" >}}
  dubbo3已经和云原生做了深度适配，建议后续能够和istio等service mesh框架进行更多的衔接打通，方便dubbo用户更简单的走向mesh化之路；
  dubbo3重新设计了Triple协议和服务发现模型，为跨语言跨微服务框架的通信提供了可能，建议提供一些和go、springcloud打通的实际解决方案；
  建议在调用方和服务方调用链路上增加更多的可选可观测点
  {{< /card >}}
  {{< /cardpane >}}


</div>
</div>
</div>