
---
type: docs
title: "微服务生态"
linkTitle: "微服务生态"
description: "围绕 Dubbo 生态的限流降级、全链路追踪、分布式一致性等解决方案"
weight: 30
no_list: true
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
                     <a href='{{< relref "./rate-limit/" >}}'>限流降级</a>
                </h4>
                <p>使用 Sentinel 保护您的应用，防止应用因个别服务的突发流量过载而出现稳定性问题。</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
         <div class="h-100 card shadow">
             <div class="card-body">
                 <h4 class="card-title">
                    <a href='{{< relref "./rate-limit/" >}}'>网关接入</a>
                 </h4>
                 <p>通过网关 http 到 dubbo 协议转换，实现前端流量接入后端 dubbo 服务。</p>
             </div>
         </div>
     </div>
    <div class="col-sm col-md-6 mb-4">
         <div class="h-100 card shadow">
             <div class="card-body">
                 <h4 class="card-title">
                 <a href='{{< relref "./rate-limit/" >}}'>全链路追踪 Tracing</a>
                 </h4>
                 <p></p>
             </div>
         </div>
     </div>
    <div class="col-sm col-md-6 mb-4">
         <div class="h-100 card shadow">
             <div class="card-body">
                 <h4 class="card-title">
                 <a href='{{< relref "./rate-limit/" >}}'>异步消息</a>
                 </h4>
                 <p></p>
             </div>
         </div>
     </div>
    <div class="col-sm col-md-6 mb-4">
         <div class="h-100 card shadow">
             <div class="card-body">
                 <h4 class="card-title">
                 <a href='{{< relref "./rate-limit/" >}}'>控制台 Admin</a>
                 </h4>
                 <p></p>
             </div>
         </div>
     </div>
    <div class="col-sm col-md-6 mb-4">
         <div class="h-100 card shadow">
             <div class="card-body">
                 <h4 class="card-title">
                 <a href='{{< relref "./rate-limit/" >}}'>服务发现</a>
                 </h4>
                 <p></p>
             </div>
         </div>
     </div>
    <div class="col-sm col-md-6 mb-4">
         <div class="h-100 card shadow">
             <div class="card-body">
                 <h4 class="card-title">
                 <a href='{{< relref "./rate-limit/" >}}'>配置中心</a>
                 </h4>
                 <p></p>
             </div>
         </div>
     </div>
    <div class="col-sm col-md-6 mb-4">
         <div class="h-100 card shadow">
             <div class="card-body">
                 <h4 class="card-title">
                 <a href='{{< relref "./rate-limit/" >}}'>元数据中心</a>
                 </h4>
                 <p></p>
             </div>
         </div>
     </div>
    <div class="col-sm col-md-6 mb-4">
         <div class="h-100 card shadow">
             <div class="card-body">
                 <h4 class="card-title">
                 <a href='{{< relref "./rate-limit/" >}}'>Spring Cloud 体系互通</a>
                 </h4>
                 <p>演示如何通过 Dubbo3 应用级服务发现机制，实现和 Spring Cloud 的 rest 协议互通。</p>
             </div>
         </div>
     </div>
</div>
<hr>
</div>

{{< /blocks/section >}}