---
title: "Dingxiaomi Upgrades to Triple Protocol"
linkTitle: "DAMO Academy Cloud Xiaomi"
tags: ["User Case"]
date: 2023-01-15
weight: 4
---

# Introduction
Alibaba Cloud - DAMO Academy - Cloud Xiaomi conversational robot product is based on deep machine learning technology, natural language understanding technology, and dialogue management technology, providing enterprises with multi-engine, multi-channel, and multi-modal conversational robot services. In 2017, Cloud Xiaomi's conversational robot started public testing on the public cloud, and continuously expanded in hybrid cloud scenarios. To ensure efficiency and stability in public and hybrid cloud releases, we adopted a major version iteration every 1-2 months after much consideration. 

After years of development, to better support business growth, architectural upgrades and refactoring are unavoidable. For stability, every public cloud release requires developers to do two things:

 	1. Review the changes in interface dependencies compared to online versions and determine the release order and proportion of applications.
 	2. Simulate the release order output from the first step to ensure a smooth upgrade for backend services without customer perception.

These actions take about 2-3 weeks each time to sort out and practice focused, but only ensure that the exposed PaaS API updates smoothly.

The console service requires the frontend, API, and backend to maintain version consistency for a seamless experience, leading to previous releases during traffic valleys to minimize publication time and avoid occasional errors in certain console modules. We considered using blue-green and gray releases to address these issues early on, but such expansion of ordinary cloud products within Alibaba was no longer allowed, resulting in no redundant machines and complete lack of traffic governance.

# Migration to Alibaba Cloud

Bearing the above issues, in September 2021, Cloud Xiaomi migrated its business to Alibaba Cloud.

## Practice of Dubbo3

"The most impressive thing at the time was this image; although I didn't know exactly what the middleware team was doing, I remembered two keywords: Trinity and Dividend. I didn't expect to actually enjoy this dividend at the end of 2021."

![image1](/imgs/v3/users/yunxiaomi-1.png)

Cloud Xiaomi uses the group's internal HSF service framework, which needs to be migrated to Alibaba Cloud, while also requiring intercommunication and mutual governance with Alibaba's internal business domain. Cloud Xiaomi's public services are deployed in the public cloud VPC, while some dependent data services are deployed internally, necessitating the RPC interoperability between internal and cloud services, a typical hybrid cloud scenario. 

In summary, their core demands include: a preference for open-source solutions for easier future business promotion; ensuring safety during network communication; and needing low-cost solutions for business upgrades and transformations.

![image2](/imgs/v3/users/yunxiaomi-2.png)

After many discussions and explorations, the solution was finalized.

- Fully upgrade to open-source Dubbo 3.0, with the cloud-native gateway supporting Dubbo 3.0 by default for transparent forwarding, with gateway forwarding RT less than 1ms.
- Utilize Dubbo 3.0's support for HTTP2 features, and ensure security between cloud-native gateways through mTLS.
- Use the multi-registration center capability supported by the cloud-native gateway to achieve cross-domain service discovery transparently for users, requiring no extra modifications on the business side.
- Upgrade the SDK on the business side to support Dubbo 3.0 and simply publish Triple services, requiring no further changes.

**After resolving interoperability and service registration and discovery issues, the focus shifted to service governance solutions.**

# Traffic Governance on Alibaba Cloud

After migrating to Alibaba Cloud, there are many traffic control solutions such as the group's full-link solution and the unitization scheme within the group.

## Design Objectives and Principles

1. Introduce a traffic isolation scheme to ensure that during the online process, both new and old service versions coexist, and traffic flows remain within the same version "cluster," solving internal interface incompatibility issues brought about by refactoring.
2. Address the smoothness issue of the console during the go-live process, avoiding problems caused by inconsistent updates among the frontend, backend, and API.
3. Applications without go-live requirements can remain exempt from the go-live process.
4. Minimize resource consumption, as product development ultimately requires consideration of cost and profit.

## Solution Selection

1. Group's full-link solution: Currently not supported on Alibaba Cloud.
2. Group's unitization scheme: Mainly addresses business scalability and disaster recovery, differing from our encountered issues.
3. Establish an independent cluster, changing clusters during version iteration: Too costly.
4. Self-built: Isolate new and old services within the same cluster to ensure a user's traffic only circulates within services of the same version.

Take RPC as an example:

* Solution one: Ensure through development that when interface upgrades are incompatible, it is mandatory to upgrade HSF versions and provide two versions of services in parallel; the downside is that if one service changes, all associated users must also change, leading to exceptionally high coordination costs. Maintaining old and new interfaces concurrently generates significant maintenance costs.
* Solution two: Tag services (machines) by version, using the RPC framework's routing rules to ensure that traffic flows primarily within the same version.

## Full-Link Gray Release Solution

While considering options 1, 2, 3, and 4 as imperfect, while researching and preparing self-built solution 5, we eventually got access to Alibaba Cloud MSE Microservices Governance Team's [“20-Minute Enterprise-Level Full-Link Gray Release Capability”](https://yuque.antfin.com/docs/share/a8df43ac-3a3b-4af4-a443-472828884a5d?#), which aligned perfectly with our self-built idea, utilizing the RPC framework's routing strategy for traffic governance, realizing productization (Microservice Engine - Microservice Governance Center). 

![image3](/imgs/v3/users/yunxiaomi-3.png)

As seen in the image above, each application is required to set up baseline (base) environments and gray (gray) environments. Apart from the traffic entrance - business gateway, the downstream business modules should deploy gray (gray) environments as needed. If a module does not change during a release, it does not need to be deployed.

### Governance Solutions for Various Middlewares

1. Mysql, ElasticSearch: Persisted or semi-persistent data, ensuring data structure compatibility upgrades by the business module itself.
2. Redis: As conversational products involve multi-turn Q&A scenarios, the Q&A context is in Redis. Incompatibility during go-live could impact end users during sessions; thus currently, Redis relies on the business module to assure data structure compatibility upgrades.
3. Configuration Center: Maintaining two complete configuration sets for baseline (base) and gray (gray) environments incurs significant workload. To avoid personnel effort in ensuring data consistency, the baseline (base) environment listens to dataId, and the gray (gray) environment listens to gray.dataId. If gray.dataId is not configured, it automatically listens to dataId; (Cloud Xiaomi established a middleware adaptation layer in 2018 to ensure both hybrid and public clouds use a set of business codes—this capability is realized in the adaptation layer).
4. RPC Services: Utilize Alibaba Cloud one agent based on Java Agent technology, using the routing rules of the Dubbo framework without needing to modify business code.

Applications only require slight configurations:

* 1) Linux environment variable
alicloud.service.tag=gray for gray identification; baseline does not require tagging.
profiler.micro.service.tag.trace.enable=true identifies traffic passing through this machine. If no tag is present, it automatically adopts the same tag as the machine and transmits it backward.
* 2) JVM parameters, indicating enabling MSE microservices traffic governance capability:
**       SERVICE_OPTS=**"$**{SERVICE_OPTS}** -Dmse.enable=true"**

### Traffic Management Scheme

The traffic distribution module determines the granularity of traffic governance and the flexibility of management.

The conversational robot product requires gray releases and blue-green releases currently implemented through the following two schemes:

1. Gray Release:
Certain applications update independently, using POP's gray traffic diversion mechanism which supports diversion to the gray environment by percentage or UID strategies.
2. Blue-Green Release:
    * 1) Deploy gray (gray) cluster and test: Testing account traffic in the gray (gray) cluster; other account traffic in the baseline (base) cluster.
    * 2) Online version update: All account traffic in the gray (gray) cluster.
    * 3) Deploy baseline (base) cluster and test: Testing account traffic in the baseline (base) cluster; other account traffic in the gray (gray) cluster.
    * 4) Redirect traffic back to the baseline (base) cluster and downsize the gray (gray) environment: All account traffic in the baseline (base) cluster.

## Full-Link Implementation Effects

The effect of the first release after going live: "The new version codes of each module are already launched, covering publishing and functional regression, taking about 2.5 hours, which is a significant improvement compared to previous releases that extended to the early hours."
MSE Microservices Governance full-link gray release solution met Cloud Xiaomi's needs for rapid iteration and cautious validation in the context of accelerating business growth, helping Cloud Xiaomi quickly realize enterprise-level full-link gray capabilities through JavaAgent technology. 

As traffic governance develops with business growth, further needs will arise—next steps will include ongoing collaboration with the microservices governance product team to expand the capabilities and use cases of this solution, for example with the gray governance capabilities of RocketMQ and SchedulerX.

## More Microservices Governance Capabilities

After using MSE service governance, we discovered additional out-of-the-box governance capabilities greatly enhancing development efficiency, including service querying, service contracts, and service testing, among others. Notably, the cloud service testing provides users with a private network Postman on the cloud, enabling us to easily call our services. We can overlook the complexity of the cloud’s network topology without concern for service protocols, and without needing to create testing tools, everything can be accomplished through the console. It supports the Dubbo 3.0 framework and the mainstream Triple protocol of Dubbo 3.0.

![image4](/imgs/v3/users/yunxiaomi-4.png)

# Conclusion

Ultimately, the Cloud Xiaomi conversational robot team successfully implemented full-link gray release functionality, resolving the long-standing publishing efficiency issue. During this process, we migrated parts of the business to Alibaba Cloud, upgraded the service framework to Dubbo 3.0, and chose MSE microservices governance capabilities, making numerous new choices and attempts. "There was originally no road in the world; as more people walked, it became a road." Through repeated exploration and practice by our engineers, we can distill many best practices for more colleagues. I believe these best practices will shine like pearls in the sea, becoming even more brilliant through practical application and the passage of time.

