---
aliases:
    - /en/docs3-v2/dubbo-go-pixiu/overview/what-is-pixiu/
    - /en/docs3-v2/dubbo-go-pixiu/overview/what-is-pixiu/
    - /en/overview/reference/pixiu/overview/what-is-pixiu/
    - /en/overview/mannual/dubbo-go-pixiu/overview/what-is-pixiu/
description: Pixiu is an open-source API gateway for the Dubbo ecosystem and a language solution for accessing the Dubbo cluster. As an API gateway, it can receive external network requests, convert them into Dubbo and other protocol requests, and forward them to the backend cluster.
linkTitle: What is Pixiu
title: What is Pixiu
type: docs
weight: 1
---






### Pixiu Overview


Pixiu is an open-source API gateway for the Dubbo ecosystem and a language solution for accessing the Dubbo cluster. As an API gateway, Pixiu can receive external network requests, convert them into Dubbo and other protocol requests, and forward them to the backend cluster. As a Sidecar, Pixiu aims to replace proxy services registered to the Dubbo cluster, providing a faster solution for multi-language services to connect to the Dubbo cluster.


![image](/imgs/pixiu/overview/pixiu-overview.png)




### API Gateway

As a gateway product, Pixiu helps users easily create, publish, maintain, monitor, and protect APIs of any scale, handling thousands of concurrent API calls. This includes traffic management, CORS support, authorization and access control, limits, monitoring, and API version management. Additionally, as a derived product of Dubbo, Pixiu can help Dubbo users with protocol conversion for cross-system and cross-protocol service interoperability.
The overall design of Pixiu adheres to the following principles:
- High performance: High throughput and millisecond-level latency.
- Scalable: Users can extend Pixiu's functionality via go-plugin according to their needs.
- Easy to use: Users can go live with minimal configuration.

### Sidecar Mode

Currently, the main way to access the Dubbo cluster is to integrate with the corresponding language's SDK, as shown on the left side of the diagram. However, Dubbo's multi-language support is insufficient; only the Java and Go versions are mature, while the JS and Python versions are catching up. Moreover, there are general issues with using SDKs, such as high code coupling, difficulty in version upgrades, and challenges in service discovery, routing, and load balancing.

Thus, the concept of a service mesh or sidecar was proposed in 2016. By placing service discovery, routing, and load balancing logic in the sidecar, services can interact with it using lightweight SDKs. 

![img](/imgs/pixiu/overview/pixiu-sidecar.png)

For multi-language solutions accessing Dubbo, Pixiu is recommended as a Sidecar deployed alongside services. Pixiu provides service discovery, traffic governance, routing capability, protocol conversion, and communication capabilities. As shown on the left side of the diagram, services using the sidecar can form clusters with services natively using the Dubbo framework, allowing for seamless interactions.
Another option is for Pixiu to serve solely as a proxy, registering services to the Dubbo cluster, as illustrated on the right side of the diagram. This solution is simpler for deployment and operation, suitable for small to medium-sized clusters.

