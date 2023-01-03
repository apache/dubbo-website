---
type: docs
title: "Microservice Governance"
linkTitle: "Microservice Governance"
description: "Demonstrate how to solve Dubbo microservice governance problems, such as transactions, full link tracking, current limiting and degradation, etc."
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
                      <a href='{{< relref "./transaction/" >}}'>Transaction Management</a>
                 </h4>
                 <p>This example demonstrates how to implement transaction management of distributed Dubbo services through Seata to ensure data consistency. </p>
             </div>
         </div>
     </div>
     <div class="col-sm col-md-6 mb-4 mb-md-0">
         <div class="h-100 card shadow">
             <div class="card-body">
                 <h4 class="card-title">
                      <a href='{{< relref "./rate-limit/" >}}'>rate limit downgrade</a>
                 </h4>
                 <p>Use Sentinel to protect your application from stability issues caused by sudden traffic overload of individual services. </p>
             </div>
         </div>
     </div>
     <div class="col-sm col-md-6 mb-4 mb-md-0">
          <div class="h-100 card shadow">
              <div class="card-body">
                  <h4 class="card-title">
                  <p>http gateway access (document construction)</p>
                  </h4>
                  <p>By converting the gateway http to dubbo protocol, the front-end traffic can be connected to the back-end dubbo service. </p>
              </div>
          </div>
      </div>
     <div class="col-sm col-md-6 mb-4 mb-md-0">
          <div class="h-100 card shadow">
              <div class="card-body">
                  <h4 class="card-title">
                  <p>Spring Cloud system interoperability (document construction)</p>
                  </h4>
                  <p>Demonstrates how to communicate with Spring Cloud's rest protocol through the Dubbo3 application-level service discovery mechanism. </p>
              </div>
          </div>
      </div>
</div>
<hr>
</div>

{{< /blocks/section >}}