---
type: docs
title: "Kubernetes Deployment Solution"
linkTitle: "Kubernetes Deployment Solution"
description: "Demonstrate how to deploy Dubbo to Kubernetes and reuse Kubernetes Native Service."
weight: 2
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
                     <a href='{{< relref "./deploy-on-k8s/" >}}'>API-SERVER</a>
                 </h4>
                 <p>Use API-SERVER as the registration center, deploy Dubbo application to Kubernetes and reuse Kubernetes Native Service example</p>
             </div>
         </div>
     </div>
     <div class="col-sm col-md-6 mb-4 mb-md-0">
         <div class="h-100 card shadow" href="#">
             <div class="card-body">
                 <h4 class="card-title">
                     <a href='{{< relref "../mesh/" >}}'>Dubbo Mesh</a>
                 </h4>
                 <p>Through the Dubbo Control Plane, the details of service governance are shielded, while retaining the native ability to adapt to kubernetes, the decoupling of the data plane and kubernetes is realized from the architecture, and various problems caused by direct communication between the data plane and kubernetes are avoided. <br/><br/>For details, please refer to the Mesh solution section</p>
             </div>
         </div>
     </div>
</div>
<hr>
</div>

{{< /blocks/section >}}