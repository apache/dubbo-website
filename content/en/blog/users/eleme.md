---
title: "Ele.me Successfully Upgrades to Dubbo3"
linkTitle: "Ele.me"
date: 2023-01-15
tags: ["User Cases"]
weight: 3
---
### Upgrade Goals
![elem-arc](/imgs/user/eleme/elem-arc.png)

Here is the basic deployment architecture diagram of Ele.me.

Before the upgrade, Ele.me's microservice framework used HSF2, and inter-unit RPC calls were routed through a proxy. During this time, the number of machines and traffic supported by the proxy increased rapidly. Notably, after subscribing to all address data, the resource consumption and stability of the proxy faced severe challenges.

By upgrading the entire site to Dubbo3, the business line aims to achieve two goals:
* Switch the address model to application-level service discovery, greatly reducing the resource consumption pressure on centralized nodes and consumer nodes.
* Replace the proxy model with a globally shared registration center under the application-level service discovery architecture, achieving direct communication between inter-unit nodes.

### Upgrade Process
![eleme-upgrade1](/imgs/user/eleme/elem-upgrade1.png)

Whether for Dubbo2 or HSF2, we have ensured comprehensive API compatibility, allowing for almost zero transformation upgrades to Dubbo3. Each application can upgrade independently and transparently, without concerning the upgrade status of upstream or downstream applications. After upgrading to Dubbo3, the address discovery model and the default behavior of the protocol remain compatible with version 2.0, allowing users to switch Dubbo3 behavior on-demand for any application at any time.
As shown in the figure on the right, we simulated a mid-state of the Dubbo3 upgrade process for the Ele.me cluster, where the gray markers indicate the old version HSF2 applications, and the orange and green markers indicate applications that have already upgraded to Dubbo3. The applications represented in orange and their invocation chains indicate upgrades to Dubbo3 and switching to application-level address model. This upgrade process primarily illustrates the compatibility and independence of the Dubbo3 framework.

Next, we'll analyze the detailed process of the orange-marked nodes migrating to Dubbo3 application-level discovery.

![elem-upgrade-provider](/imgs/user/eleme/elem-upgrade-provider.png)

First, looking at the provider side, after upgrading to Dubbo3, service providers will by default maintain a dual registration behavior, registering both interface-level addresses and application-level addresses to the registration center. This maintains compatibility and prepares for future consumer-side migration. The dual registration switch can be controlled via -Ddubbo.application.register-mode=al/interface/interface. We recommend keeping the default dual registration behavior to reduce subsequent migration costs.

Some may worry about the storage pressure on the registration center caused by dual registration; however, this is not an issue under the application-level service discovery model, as we have significantly streamlined the registration addresses. According to our actual calculations, each additional application-level service discovery URL registered will only increase overhead by 0.1% to 1%.

![elem-upgrade-consumer](/imgs/user/eleme/elem-upgrade-consumer.png)

Similar to the provider side, the consumer side must also undergo a dual subscription process for smooth migration, which we will not elaborate on further. The consumer's dual subscription behavior can also be dynamically adjusted through rules or switches to control the migration of a certain service or application to the application-level address model. Additionally, Dubbo3 has a built-in automatic decision mechanism that will automatically complete the switch when application-level addresses are available, and this behavior is default.

Here is the selection process during consumer-side dual subscription:

![elem-upgrade-consumer1](/imgs/user/eleme/elem-upgrade-consumer1.png)

### Upgrade Effects

![elem-result](/imgs/user/eleme/elem-result.png)

Ele.me successfully upgraded to Dubbo3 and the application-level service discovery model, achieving the goal of eliminating the proxy architecture. In the data link of service discovery we care about:
* Data registration and subscription transmission reduced by 90%
* Overall resource consumption of the registration center’s data storage decreased by 90%
* Permanent memory consumption of the consumer framework itself decreased by 50%
The overall stability and performance of the cluster have significantly improved, also preparing for future capacity expansion.

