
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
<p class="my-3">
Apache Dubbo 诞生于阿里巴巴微服务实践之中，在开源之后深受企业用户喜爱并迅速成为国内开源服务框架选型的事实标准产品，用户范围涵盖互联网、金融保险、科技公司、制造业、零售物流等领域的几乎所有头部用户。
</p>

{{< cardpane >}}
  {{< card header="阿里巴巴的 Dubbo3 落地实践" >}}
阿里巴巴电商核心系统已成功升级到 Dubbo3 版本，用于取代上一代 HSF2 服务框架，2022 年起双 11 核心链路都将跑在 Dubbo3 之上。<br/><br/>
<a href='{{< relref "alibaba" >}}'>了解更多</a>
  {{< /card >}}
  {{< card header="平安健康" >}}
  平安健康已完成全站 2.x 版本到 Dubbo3 的迁移，升级过程中与社区开发者进行了深度合作，中间也总结了一些升级经验，非常具有参考价值。<br/><br/>
  <a href='{{< relref "pingan" >}}'>了解更多</a>
  {{< /card >}}
  {{< card header="工商银行 Dubbo3 应用级服务发现实践" >}}
  工商银行为什么要选型 Dubbo3 应用级服务发现架构那？2.x 版本架构在超大规模集群实战上遇到了那些性能和容量瓶颈？<br/><br/>
  <a href='{{< relref "icbc" >}}'>了解更多</a>
  {{< /card >}}
{{< /cardpane >}}

{{< cardpane >}}
  {{< card header="饿了么全站成功升级 Dubbo3" >}}
  饿了么当前有接近 2000 应用、10 万实例跑在 Dubbo3 之上，通过应用级服务发现与 Triple 协议解决了跨单元的互联互通问题。<br/><br/>
  <a href='{{< relref "eleme" >}}'>了解更多</a>
  {{< /card >}}
  {{< card header="阿里云服务治理平台 MSE" >}}
  阿里云基于 Dubbo 构建了微服务引擎产品 - MSE。MSE 支持 Zookeeper、Nacos 等官方扩展，同时在 Dubbo 上构建了丰富的服务治理能力。<br/><br/>
  <a href='https://www.aliyun.com/product/aliware/mse?spm=dubbo-website.topbar.0.0.0' target='_blank'>了解更多</a>
    {{< /card >}}
  {{< card header="中伦网络" >}}
  中伦网络在 2022 年完成了服务框架从 Dubbo2 到 Dubbo3 的全站升级，深度使用了应用级服务发现、Kubernetes 原生服务部署、服务治理等核心能力。来自中仑网络的技术负责人来彬彬对整个 Dubbo3 的选型、升级过程及收益等做了深入总结。<br/><br/>
  <a href='{{< relref "zhonglunwangluo" >}}'>了解更多</a>
  {{< /card >}}
{{< /cardpane >}}

{{< cardpane >}}
  {{< card header="小米的 Dubbo3 实践" >}}
  小米对 Dubbo 多语言版本 Java、Golang 都有着广泛的使用。<br/><br/>
  <a href='{{< relref "xiaomi" >}}'>了解更多</a>
  {{< /card >}}
  {{< card header="店小蜜" >}}
  阿里云-达摩院-云小蜜对话机器人产品基于深度机器学习技术、自然语言理解技术和对话管理技术，为企业提供多引擎、多渠道、多模态的对话机器人服务。通过全链路升级至开源 Dubbo3.0，云原生网关默认支持 Dubbo3.0，实现透明转发，网关转发 RT 小于 1ms，利用 Dubbo3.0 支持 HTTP2 特性，云原生网关之间采用 mTLS 保障安全。<br/><br/>
  <a href='{{< relref "dianxiaomi" >}}'>了解更多</a>
  {{< /card >}}
  {{< card header="瓜子" >}}
  瓜子二手车的 Dubbo 实践经验分享<br/><br/>
  <a href='{{< relref "guazi" >}}'>了解更多</a>
  {{< /card >}}
{{< /cardpane >}}
</div>
</div>
</div>
