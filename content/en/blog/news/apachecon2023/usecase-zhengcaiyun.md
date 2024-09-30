---
title: "Zhengcaiyun's Hybrid Cloud Data Cross-Network Practice Based on Dubbo"
linkTitle: "Zhengcaiyun's Hybrid Cloud Data Cross-Network Practice Based on Dubbo"
tags: ["apachecon2023", "case study", "Zhengcaiyun"]
date: 2023-10-07
authors: ["Wang Xiaobin"]
description: Zhengcaiyun's Hybrid Cloud Data Cross-Network Practice Based on Dubbo
---

Abstract: This article is organized from the sharing of Wang Xiaobin, a senior development engineer at Zhengcaiyun. The content is mainly divided into four parts:

* 1. Project Background
* 2. Why is it called the Highway
* 3. Road Construction Practice
* 4. Future Planning

## 1. Project Background

![dubbo enterprise practice - Zhengcaiyun](/imgs/blog/2023/8/apachecon-scripts/zhengcaiyun/img.png)

We have a cloud island business called Zhengcaiyun, which is a shopping website for the government, similar to Taobao. Government procurement conducts corporate purchases and government procurement business on Zhengcaiyun.

The "cloud" in cloud island refers to our cloud platform, a self-deployed shopping website corresponding to a microservice framework. The "island" refers to local networks in places like Anhui or Shanxi where we would deploy this framework, calling it an "island". Our cloud is mainly used by Zhejiang Province and related regional divisions.

There is a data transmission issue between our cloud and island. For example, if I receive a government announcement that's national, I may record it on the management platform of the cloud and then push it out, creating cross-network data between the cloud and the island.

1. Cloud Island Network

![dubbo enterprise practice - Zhengcaiyun](/imgs/blog/2023/8/apachecon-scripts/zhengcaiyun/img_1.png)

For our cloud platform, the local area network is completely controllable within our company. For instance, opening a port is straightforward. The import side may be a local or private network; for instance, we previously worked on a project with Zhejiang Merchants Bank, which is a fully isolated island. They define their own security policies and port openings, reflecting the business structure of our cloud island.

2. Hybrid Cloud Island Network

![dubbo enterprise practice - Zhengcaiyun](/imgs/blog/2023/8/apachecon-scripts/zhengcaiyun/img_2.png)

The above graphic is a general data link diagram. Below the cloud platform are branches and subsidiaries correspondingly linked to a set of business systems. The government cloud refers to the provincial (Anhui Province) or municipal (Wuxi City) segmented areas, resulting in isolated government clouds. Private deployments involve typical hybrid cloud network architecture such as banks, state-owned enterprises, military, and government enterprises.

3. Characteristics of Hybrid Cloud Island Network

![dubbo enterprise practice - Zhengcaiyun](/imgs/blog/2023/8/apachecon-scripts/zhengcaiyun/img_3.png)

Our hybrid cloud network architecture features:

- Consistency of the platform. The code deployed on public clouds, cloud platforms, government clouds, and private clouds is identical. Deploying one set of code in various locations translates into multiple platforms.
- Network connection and capability reuse. We depend on some third-party services, such as SMS, but private clouds have stringent network controls complicating the process of connecting with third parties. Here, we intend to reuse the capabilities of our cloud platform, leading to data exchange.
- Cross-domain access migration.
- Unified platform management. For instance, if we need to issue an announcement, we hope to manage it on one platform instead of separate ones for Zhejiang and Anhui, which would increase maintenance costs.

4. Pain Points in Government and Enterprise Networks

![dubbo enterprise practice - Zhengcaiyun](/imgs/blog/2023/8/apachecon-scripts/zhengcaiyun/img_4.png)

Many companies interact with the government, and government-enterprise networks have the following characteristics:

Complex networks. For example, bank networks are intricate due to their security requirements and numerous processes that require regular follow-ups, leading to new issues after evaluations.

High security requirements. For example, when opening ports, data transmission needs to comply with specific serialization protocols; otherwise, these requests get rejected, leading to timeouts or generic exceptions, creating unknown risks.

Business-driven operations. Deployment occurs only after business requirements arise, leading to repetitive investments of time and manpower, especially for private deployments.

5. Existing Solutions

![dubbo enterprise practice - Zhengcaiyun](/imgs/blog/2023/8/apachecon-scripts/zhengcaiyun/img_5.png)

Based on the aforementioned pain points, we devised two solutions.

The first solution is a unidirectional plan based on Dubbo Filter. This approach is fairly historic with two characteristics.

The first characteristic is unidirectional transmission. It moves from the "island" to the "cloud" in one direction, and this is based on Dubbo Filter since our company’s internal microservices are all called through Dubbo, making it a strong dependency for cross-network data solutions.

The second characteristic is that the locally deployed business provider as a filter creates an operational burden. When the import side needs to sync data to the cloud side, data is transmitted from the island's business web to the cloud's business provider. Hence, I must also deploy a business provider on the import side. The need for this deployment arises from the requirement to intercept requests and forward them to the Dubbo gateway deployed on the cloud platform.

However, this creates a burden. If the import side already has data storage, this could be manageable as the provider exists. But if some business processes are solely for cross-network use without local storage, then the business provider becomes redundant.

![dubbo enterprise practice - Zhengcaiyun](/imgs/blog/2023/8/apachecon-scripts/zhengcaiyun/img_6.png)

The second solution is a mesh point-to-point approach. Because there's a need for network interconnectivity between islands, ports are specifically opened between this point and the destination point. Once opened, calls can be made, typically through Dubbo.

This solution has a clear flaw; there are numerous lines which increase the complexity of establishing connections between points and may hinder future scaling.

![dubbo enterprise practice - Zhengcaiyun](/imgs/blog/2023/8/apachecon-scripts/zhengcaiyun/img_7.png)

The aforementioned solutions encounter issues including unidirectional transmission, high whitelist opening costs, high platform maintenance costs, and the absence of shared functionalities.

Based on the above issues, we created a new plan called the Highway.

## 2. Why is it called the Highway

![dubbo enterprise practice - Zhengcaiyun](/imgs/blog/2023/8/apachecon-scripts/zhengcaiyun/img_8.png)

Why it is called the Highway? Primarily because the desired effect is:

Built once, reusable. For example, the highway from Beijing to Shanghai only needs to be wide enough; one road suffices. You can reuse this for travel from Shanghai to Beijing or Hangzhou to Beijing, without needing to build another.

Tunnel mechanism. Highways don't only traverse plains; they may run near rivers, seas, or mountains. If we construct a tunnel under the highway, it's seamless for drivers. Our goal aligns with this; if the government-enterprise network seems intricate to you, we aim to shield that complexity, so you won't have to perceive it.

Considering transmission performance. If each business department builds its own transmission path, the performance only needs to sustain their own operations, as it is not necessarily shared. However, if establishing a reusable path, transmission performance must be prioritized.

## 3. Road Construction Practice

![dubbo enterprise practice - Zhengcaiyun](/imgs/blog/2023/8/apachecon-scripts/zhengcaiyun/img_9.png)

Next, we will detail the challenges encountered during highway construction as well as specific practices. We faced the following issues when integrating with clients:

The first issue is a strong dependence on Dubbo.

The second issue is transparent transmission without altering how Dubbo is used. In other words, I should not need to write annotations to replace Dubbo or API calls to Dubbo. Writing such interactions could be alienating for newcomers who may not grasp or adapt to them and might not realize potential pitfalls. Therefore, using the original Dubbo might facilitate a better experience for users.

The third issue is flexible integration supporting multiple forms. Although we must support Dubbo due to our strong reliance, we also need to endorse other forms, like HTTP. However, flexibility must be considered prior to integration.

![dubbo enterprise practice - Zhengcaiyun](/imgs/blog/2023/8/apachecon-scripts/zhengcaiyun/img_10.png)

Now, let's introduce Dubbo integration methods. The objective means of integrating Dubbo includes three methods:

First, an annotation method. Using @DubboReference provides optional common parameters to set routing targets, achieving method-level routing. Routing information is written in the intermediate parameters, which are common parameters provided by Dubbo.

If it's standard, and I write this information, Dubbo does not process anything as it holds no significance. However, because you introduced the highway SDK, when you write this, we will parse it, intercepting Dubbo requests and leveraging parameters for routing. This form does not change the usage of Dubbo.

Second, specifying in the configuration center. If we utilize the Apollo configuration center, it can entirely replace the integration method; parameters can also be configured in the configuration center as long as the SDK supports it. This method actually has fully intrusive code, presenting no differences before and after cross-network implementation. Yet, it turns out our business doesn’t favor this method because Apollo is unpopular and it lacks clarity. If a newcomer views this code, they might assume they’re calling a local interface.

Third, thread specification. When you specify routing information in a thread and call again, this call will follow your routing. If called again, it defaults to local. However, because this is thread-based, Dubbo extensions will clean up the thread info after the call is complete. So, be mindful, as multiple calls demand writing multiple specifications. If you want to avoid multiple writings, utilize the previous method, as long as you're in the current context, it will always route to Shanghai.

![dubbo enterprise practice - Zhengcaiyun](/imgs/blog/2023/8/apachecon-scripts/zhengcaiyun/img_11.png)

Now, let’s discuss the highway architecture; the previous point-to-point method has complex whitelist openings. Our highway architecture is a novel construction, thus simplifying the complexity of opening whitelists.

As illustrated, for instance, the leftmost node is Shanghai, and the uppermost is Anhui. If I wish to move from Anhui to Shanghai, the central gateway needs to open a whitelist. Once opened, this link can be used directly. There are a total of six lines, hence the complexity has been reduced.

![dubbo enterprise practice - Zhengcaiyun](/imgs/blog/2023/8/apachecon-scripts/zhengcaiyun/img_12.png)

Above is the core architecture diagram of the highway.

For example, when the Shanxi cluster’s APP1 interacts with APP2, and I want to connect to Shanghai’s APP2, if no action is taken, it defaults to call Shanxi cluster APP2. If during this APP call some routing information is added, the SDK in Shanxi cluster APP1 will direct its traffic to the Dubbo gateway in Shanxi cluster.

Subsequently, the Dubbo gateway will traverse through the unified gateway via the HTTP protocol, then to the Shanghai cluster’s Dubbo gateway via the same protocol. Routing information will be gathered here, including the service called, methods, version numbers, parameters, etc. This information will then be used to invoke APP1 of the Shanghai cluster in a generalized manner, ultimately returning and completing this cross-network call.

So why is the Dubbo Proxy role necessary? Why not redirect directly from APP1 to the unified gateway? Wouldn't omitting one step be better? There are three reasons involved:

Although this diagram depicts only one APP1, numerous calls occur within the Shanxi cluster. If hundreds of applications connect directly to the unified gateway, it needs to establish many long connections, with limited resources available for the unified gateway.

For security concerns, each call may need to traverse the whitelist to ensure safety. Therefore, with Dubbo Proxy, IP aggregation can occur. The island doesn't need to interact with Dubbo Proxy as they exist within the same environment, negating security considerations. Once a request passes to the gateway from Dubbo Proxy, it follows only one link between the gateway and unified gateway; thus, IPs are aggregated.

Moreover, there's a functional consolidation aspect. During future upgrades, if SDK updates are necessary, each application must upgrade, which can be labor-intensive. Hence, we aim to store upgrade functionalities within a single application, ensuring it remains unnoticed by the business functions, with no need for SDK updates as the SDK needs only to handle routing, minimizing updates.

Consequently, for businesses, this liberates them. I perceive this as a functional benefit. This model is termed a distributed runtime, which is currently trending. We can interpret this as Dapper, moving burdensome operations to a shared service while keeping the business SDK very streamlined.

Additionally, why use the HTTP protocol? It's not necessarily the most efficient protocol. The Dubbo2 protocol inside Dubbo is actually quite impressive, consisting mostly of data aside from some ambiguities. Consequently, we could consider upgrading HTTP later to enhance performance.

Currently, the adoption of HTTP protocol is due to its standardized nature. Throughout various devices, even though we've illustrated only one link, HTTP protocol encounters no hindrances. If using Dubbo protocol, numerous connections would need to be established.

![dubbo enterprise practice - Zhengcaiyun](/imgs/blog/2023/8/apachecon-scripts/zhengcaiyun/img_13.png)

To realize this architecture, Dubbo itself cannot be applied directly since it does not provide cross-network capabilities; thus, we need to address the challenges encountered at the Dubbo level.

In the facet of dynamic IP switching, Dubbo supports this feature; however, as it’s relatively new, some issues may arise. Its support is partial; for instance, earlier versions like Dubbo2 did not, while Dubbo3 does. Moreover, bugs may occur.

In terms of 404 extensions, with HTTP, requesting a non-existent interface returns a 404 error to the frontend. When directing the traffic from APP1 to Dubbo Proxy, the Dubbo Proxy acts as a Dubbo-based application that incorporates a Dubbo jar, functioning as a minimal application. When this traffic reaches the Dubbo gateway, it fails to recognize it and must forward it; thus, we need to integrate this extension.

![dubbo enterprise practice - Zhengcaiyun](/imgs/blog/2023/8/apachecon-scripts/zhengcaiyun/img_14.png)

Next, we'll discuss the tunnel mechanism. The tunnel mechanism aims to mask network complexities and intermediates protocol conversion, offering users a unified, transparent calling method.

The HTTP protocol’s body carries an original body. After inversion, the packaging extracts it and utilizes generalization for calls. In such cases, tunnels can match these disparities.

![dubbo enterprise practice - Zhengcaiyun](/imgs/blog/2023/8/apachecon-scripts/zhengcaiyun/img_15.png)

Moreover, the tunnel mechanism offers higher support for the Dubbo protocol. For instance, when APP1 and local APP3 ultimately call APP2, the observed binary streams are identical. This is accomplished by merely wrapping the processes and ultimately unpacking them. Other than a bit of routing information, everything remains consistent.

The advantage of this method is that it supports almost all Dubbo features. Yet, there are exceptions, such as token or network-derived mechanisms.

## 4. Future Planning

![dubbo enterprise practice - Zhengcaiyun](/imgs/blog/2023/8/apachecon-scripts/zhengcaiyun/img_16.png)

Leveraging online network architecture layers, we have planned for the highway as follows:

The first layer, physical network connectivity. This is somewhat peripheral as I interpret it as port openings, summarizing experiences or methodologies for expedited processes.

The second layer, acceleration of communication protocol. The HTTP protocol forwarding in between can be accelerated. For instance, the Triple protocol, based on HTTP2, enhances recognition of network devices and resolves issues. Thus, we may consider researching optimizations at the communication protocol layer.

The third layer, language layer compilation acceleration. Discussions on GraalVM had been held previously, and some genuine tests were undertaken; although not fully implemented, compilation acceleration is achievable. Especially at the gateway level, characterized by substantial traffic, yet each connection is minimal, creating high-performance demands on the language itself. Implementing this with Go would provide significant acceleration.

The fourth layer, functional upgrades at the framework level. We also accomplished many initiatives at the middleware layer.

The fifth layer: General task scheduling and orchestration. Calls will typically pass through many nodes, e.g., from a to b to c to d to e; as operations grow more complex, additional routing may be necessary, e.g., from a to c while combining c and d before proceeding to d, with future adjustments planned.

The sixth layer: Custom task scheduling and orchestration.

The seventh layer: Monitoring & Alerts & Observability.

The eighth layer: Standards & Procedures & Security.

![dubbo enterprise practice - Zhengcaiyun](/imgs/blog/2023/8/apachecon-scripts/zhengcaiyun/img_17.png)

In conclusion.

Why undertake this project? Existing solutions were relatively numerous, yet costly. We need a unified approach that accounts for broader public testing to promote this initiative. We have successfully integrated numerous applications, making it a standard solution for cross-network data among legal personnel.

The effects we aim to achieve have already been detailed in the project architecture and future plans.

Emphasizing our open-source and community collaboration, the previous solutions were designed for internal company use, involving deep customizations of Dubbo. Typically, we prefer private versions for development; however, we intended to open-source from the outset, so we communicated with the Dubbo community to discuss implementing this at the open-source level. The community can assist in reviewing these features and ensuring safety controls. Additionally, we can share our developments with the community, especially pulling public elements back for communal benefit.

