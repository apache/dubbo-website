---
type: docs
title: "Service Governance And Configuration Management"
linkTitle: "Governance"
weight: 4
---

## Service governance
the basic function of service governance is changing the runtime behaviour and routing logic, to do weight configuration and current limiting: 

### application level service governance
In Dubbo 2.6 or earlier version, all service governance rule are in service scope, if you need to make application scope rule, you need to set the same rule for all services under an application, modify and delete need the same operation, this is very unfriendly. In Dubbo 2.7, application scope service governance is supported, condition route(including black white list) and dynamic configuration(including weight, load balance) all support application scope config.

![condition](/imgs/blog/admin/conditionRoute.jpg)   

picture above is condition route configuration, can create and search by both application name and service name.

### tag route  
tag route is a new feature in Dubbo2.7, in application scope, to set different tag on different server, the screenshot is shown as below: 

![tag](/imgs/blog/admin/route.jpg)

the client can use `setAttachment` to specify different tag, is the above case, `setAttachment(tag1)`, the client will choose from the three servers in the picture above. In this way, you can implement features such as traffic isolation and gray release. 

### condition route
condition route is a traditional function in Dubbo, now you can create it in either service scope or application scope. Condition route is in `yaml` format, you can read [here](../../../user/examples/routing-rule/) to find more.

### black white list
black white list is a part of condition route and store with condition route together, you can set black list or white list, in either service scope or application scope:

![blackList](/imgs/admin/blackList.jpg) 

### dynamic configuration
dynamic configuration has the same level with routing rule, it can change the RPC behaviour dynamically without restart service. It supports application scope since Dubbo 2,7, in Dubbo format, the screen shot shows in below:

![config](/imgs/admin/config.jpg)

to read more, please refer [here](../../../user/examples/config-rule/)

### weight adjust  
weigth adjuest is part of dynamic configuration, change the weight of server side to do traffic control dynamically: 

![weight](/imgs/admin/weight.jpg)

### load balancing
load balancing is also poart of dynamic configuration, to specify the route strategy in client side. now we have three strategies: random, least active and round robin, to read more, please refer [here](../../../user/examples/loadbalance)

## configuration management
configuration management is also a new feaature for Dubbo 2.7. In Dubbo 2.7, we can specify configurations in global scope and application scope(including services in application), you can view, modify and create new configurations in Dubbo Admin.
* global configuration: 

![config](/imgs/blog/admin/config.jpg)  

you can set registry center, metadata center, timeout for provider and consumer in global configurations. If the implementation of registry center and metadata center is zookeeper, you can also check the location of configuration file. 
* application and service scope configuration: 

![appConfig](/imgs/blog/admin/appConfig.jpg)  

application configuration can also set service configuration in this application. you need to specify consumer and provider in service scope: `dubbo.reference.{serviceName}`stands for configuration as consumer side，`dubbo.provider.{servcieName}`stands for configuration as provider side. the address of registry address and metadata center address can only be configured in global configuration, which is also the recommendation way in Dubbo 2.7
* priority service configuration > application configuration > global configuration
