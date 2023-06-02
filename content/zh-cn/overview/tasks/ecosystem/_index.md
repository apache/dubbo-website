---
aliases:
    - /zh/overview/tasks/ecosystem/
description: 围绕 Dubbo 生态的限流降级、全链路追踪、分布式一致性等解决方案
linkTitle: 微服务生态
no_list: true
title: 微服务生态
type: docs
weight: 4
---

{{< blocks/section color="white" height="auto">}}
<div class="td-content list-page">
    <div class="lead"></div><header class="article-meta">
    </header><div class="row">
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                     <a href='{{< relref "./transaction/" >}}'>事务管理</a>
                </h4>
                <p>本示例演示如何通过 Seata 实现分布式 Dubbo 服务的事务管理，保证数据一致性。</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
         <div class="h-100 card shadow">
             <div class="card-body">
                 <h4 class="card-title">
                    <a href='{{< relref "./gateway/" >}}'>网关接入</a>
                 </h4>
                 <p>通过网关 http 到 dubbo 协议转换，实现前端流量接入后端 dubbo 服务。</p>
             </div>
         </div>
     </div>
    <div class="col-sm col-md-6 mb-4">
         <div class="h-100 card shadow">
             <div class="card-body">
                 <h4 class="card-title">
                 <a target="_blank" href='{{< relref "../../mannual/java-sdk/reference-manual/registry/" >}}'>服务发现</a>
                 </h4>
                 <p>Dubbo 官方支持的常见注册中心扩展实现及其使用方式。</p>
             </div>
         </div>
     </div>
    <div class="col-sm col-md-6 mb-4">
         <div class="h-100 card shadow">
             <div class="card-body">
                 <h4 class="card-title">
                 <a target="_blank" href='{{< relref "../../mannual/java-sdk/reference-manual/config-center/" >}}'>配置中心</a>
                 </h4>
                 <p>Dubbo 官方支持的常见配置中心扩展实现及其使用方式。</p>
             </div>
         </div>
     </div>
    <div class="col-sm col-md-6 mb-4">
         <div class="h-100 card shadow">
             <div class="card-body">
                 <h4 class="card-title">
                 <a target="_blank" href='{{< relref "../../mannual/java-sdk/reference-manual/metadata-center/" >}}'>元数据中心</a>
                 </h4>
                 <p>Dubbo 官方支持的常见元数据中心扩展实现及其使用方式。</p>
             </div>
         </div>
     </div>
</div>
<hr>
</div>

{{< /blocks/section >}}
