---
type: docs
title: "Traffic Management"
linkTitle: "Traffic Governance"
description: "Demonstrates how to use Dubbo's traffic management feature."
weight: 1
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
                     <a href='{{< relref "./timeout/" >}}'>Dynamically adjust request timeout</a>
                 </h4>
                 <p>Setting a timeout period for Dubbo requests can effectively improve system stability and prevent individual services from being blocked and occupying too many resources. <br/><br/>By dynamically adjusting the service timeout period during the running period, it can effectively deal with problems such as frequent service timeouts and service blocking caused by unreasonable timeout settings and system emergencies, and improve system stability. </p>
             </div>
         </div>
     </div>
     <div class="col-sm col-md-6 mb-4 mb-md-0">
         <div class="h-100 card shadow">
             <div class="card-body">
                 <h4 class="card-title">
                     <a href='{{< relref "./weight/" >}}'>Adjust traffic distribution by weight</a>
                 </h4>
                 <p>Adjust traffic distribution by weight</p>
             </div>
         </div>
     </div>
     <div class="col-sm col-md-6 mb-4 mb-md-0">
         <div class="h-100 card shadow">
             <div class="card-body">
                 <h4 class="card-title">
                     <a href='{{< relref "./isolation/" >}}'>Temporarily kick the service instance</a>
                 </h4>
                 <p>Temporarily kick the service instance</p>
             </div>
         </div>
     </div>
     <div class="col-sm col-md-6 mb-4 mb-md-0">
         <div class="h-100 card shadow">
             <div class="card-body">
                 <h4 class="card-title">
                     <a href='{{< relref "./traffic-gray/" >}}'>traffic grayscale</a>
                 </h4>
                 <p>According to the tags in the request context, the traffic is restricted and the grayscale release</p>
             </div>
         </div>
     </div>
     <div class="col-sm col-md-6 mb-4 mb-md-0">
         <div class="h-100 card shadow">
             <div class="card-body">
                 <h4 class="card-title">
                     <a href='{{< relref "./traffic-routing/" >}}'>Routing according to request conditions</a>
                 </h4>
                 <p>Routing according to the request initiator and method condition</p>
             </div>
         </div>
     </div>
     <div class="col-sm col-md-6 mb-4 mb-md-0" style="margin-bottom:20px">
         <div class="h-100 card shadow">
             <div class="card-body">
                 <h4 class="card-title">
                     <a href='{{< relref "./traffic-condition/" >}}'>Traffic isolation</a>
                 </h4>
                 <p>Isolate service traffic in different environments to ensure that services are not affected by each other</p>
             </div>
         </div>
     </div>
     <div class="col-sm col-md-6 mb-4 mb-md-0">
         <div class="h-100 card shadow">
             <div class="card-body">
                 <h4 class="card-title">
                     <a href='{{< relref "./zone/" >}}'>Same computer room/zone priority</a>
                 </h4>
                 <p>When an application invokes a service, it preferentially invokes the service provider in the same computer room/area. </p>
             </div>
         </div>
     </div>
</div>
<hr>
</div>

{{< /blocks/section >}}