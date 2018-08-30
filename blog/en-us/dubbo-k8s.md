At first sight, the service of kubernetes has its own IP, while under the original fixed mindset: Dubbo/HSF service is aggregated by the IP of the entire service cluster, that means, kubernetes and Dubbo/HSF look like something different in natural, but when carefully thinking, the difference becomes insignificant. Because the only IP under kubernetes is just a Virtural IP--VIP, behind the vip are multiple endpoints, which is the factual processing node.

Here we only discuss the situation that the Dubbo service in the cluster is accessed in the same kubernetes cluster, As for the provider outside kubernetes to access the provider in kubernetes, since it involves the problem of network address space, and it usually requires GateWay/loadbalance for mapping conversion, which there not detail discussion for this case. Besides, there are two options available for kubernetes:

1. DNS: The default kubernetes service is based on the DNS plugin (The latest version of the recommendation is coreDNS), one proposal on Dubbo is about this.  since HSF/Dubbo has always highlighted its soft-load address discovery capability, it ignores Static's strategy insteadily, my understanding is that as a service discovery mechanism, the static resolution mechanism is one of the simplest and most needed to support mechanism, you can also refer to Envoy's point of views. While at the same time, ant's SOFA has always supported this static strategy, it can provides an explanation for an engineering fragment of the SOFA project. There are two advantages to doing this. 1) When the soft load center crash is unavailable and the address list cannot be obtained, there is a mechanism to Failover to this policy to handle certain requests. 2) Under LDC/unitization, the ant's load center cluster is deployed in the equipment room/area. First, the LDC of the soft load center is guaranteed to be stable and controllable. When the unit needs the request center, the address of the VIP can come in handy.

   ![img](https://img.alicdn.com/tfs/TB1Kj1ktpkoBKNjSZFEXXbrEVXa-985-213.png)

2. API：DNS relies on the DNS plugin, which will generate additional operation, so consider directly obtaining the endpoint through the client of kubernetes. In fact, by accessing the API server interface of kubernetes, you can directly obtain the list of endpoints behind a certain servie, and can also monitor the changes in its address list. Thereby implementing the soft load discovery strategy recommended by Dubbo/HSF. Refer to the code for details:

The above two thoughts need to consider the following two points:

1. Kubernetes and Dubbo are consistent with the mapping name of service. Dubbo's service is determined by serviename, group, version to determine its uniqueness, and servicename generally has a longer package name for its service interface. Need to map the servie name of kubernetes and the service name of dubbo. Either add a property like SOFA to define it. This is a big change, but it is most reasonable. Or it is a fixed rule to reference the deployed environment variables, which can be used for quick verification.
2. Port problem:The default Pod and Pod network interoperability is solved, need to be validated.

## Demo Verification

The following is a demo deployment through kubernetes service in Alibaba Cloud's Container Registry and   EDAS. Visit Alibaba Cloud -》Container Registry.

1. Create repo and bind the github codebase. As shown below.

![img](https://img.alicdn.com/tfs/TB1m.tEtrorBKNjSZFjXXc_SpXa-1892-870.png)




2. Click Manage enter the repository details page. Click Build in images service panel,  construct the demo into image and publish it to the specified repository. As shown below.

   ![img](https://img.alicdn.com/tfs/TB1oYqvtcIrBKNjSZK9XXagoVXa-1872-888.png)



3. Switch to Enterprise Distributed Application Services (EDAS) products panel, visit Resource Management -》Clusters. Create kubernetes cluster and bind ECS. As shown below.

   ![img](https://img.alicdn.com/tfs/TB1b1p2trZnBKNjSZFKXXcGOVXa-1858-833.png)



4. Application Management - 》Create  application, type kubernetes application and specify the image in the container registry . As shown below.

   ![img](https://img.alicdn.com/tfs/TB1_YywtDCWBKNjSZFtXXaC3FXa-1737-588.png)



   ![](https://img.alicdn.com/tfs/TB18uzTtdcnBKNjSZR0XXcFqFXa-1820-861.png)



5.  After creation , then deploy applications. As shown below.

   ![](https://img.alicdn.com/tfs/TB1fEpEtrorBKNjSZFjXXc_SpXa-1846-783.png)

- The supplementary application name cannot have uppercase letters, all lowercase, otherwise there is a problem of deployment failure.

- When creating an app, after selecting the image, the next button cannot be clicked and you need to click Choose to continue.

- EDAS has two independent kubernetes services, one based on Alibaba Cloud's container service, and one set by Lark. I experience the latter.

- The development joint of Docker and IDE integration, you need to consider the relevant plug-ins for integrating IDEA.

- There is always an error in deployment, maybe there is a problem with the kubernetes service. Need further investigation.

{"kind":"Pod","namespace":"lzumwsrddf831iwarhehd14zh2-default","name":"dubbo-k8s-demo-610694273-jq238","uid":"12892e67-8bc8-11e8-b96a-00163e02c37b","apiVersion":"v1","resourceVersion":"850282769"},"reason":"FailedSync","message":"Error syncing pod","

 
