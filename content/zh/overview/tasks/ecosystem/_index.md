
---
type: docs
title: "微服务治理"
linkTitle: "微服务治理"
description: "演示如何解决 Dubbo 微服务治理问题，如事务、全链路跟踪、限流降级等。"
weight: 6
no_list: true
---

{{< blocks/section color="white" height="auto">}}
<div class="td-content list-page">
    <div class="lead"></div><header class="article-meta">
    </header><div class="row">
    <div class="col-sm col-md-6 mb-4 mb-md-0">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                     <a href='{{< relref "./transaction/" >}}'>事务管理</a>
                </h4>
                <p>本示例演示如何通过 Seata 实现分布式 Dubbo 服务的事务管理，保证数据一致性。</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4 mb-md-0">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                     <a href='{{< relref "./rate-limit/" >}}'>限流降级</a>
                </h4>
                <p>使用 Sentinel 保护您的应用，防止应用因个别服务的突发流量过载而出现稳定性问题。</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4 mb-md-0">
         <div class="h-100 card shadow">
             <div class="card-body">
                 <h4 class="card-title">
                 <p>http 网关接入（文档建设中）</p>
                 </h4>
                 <p>通过网关 http 到 dubbo 协议转换，实现前端流量接入后端 dubbo 服务。</p>
             </div>
         </div>
     </div>
    <div class="col-sm col-md-6 mb-4 mb-md-0">
         <div class="h-100 card shadow">
             <div class="card-body">
                 <h4 class="card-title">
                 <p>Spring Cloud 体系互通（文档建设中）</p>
                 </h4>
                 <p>演示如何通过 Dubbo3 应用级服务发现机制，实现和 Spring Cloud 的 rest 协议互通。</p>
             </div>
         </div>
     </div>
</div>
<hr>
</div>

{{< /blocks/section >}}