---
type: docs
title: "Service Discovery"
linkTitle: "Service Discovery"
weight: 10
description: ""
feature:
  title: Service Discovery
  description: >
     Service Discovery with customized design for large-scale cluster with millions of instances and rich builtin registry adaptations such as Nacos and Zookeeper and even more by supporting customized extensions.
---

Dubbo provides a Client-Based service discovery mechanism, relying on third-party registry components to coordinate the service discovery process. It supports popular registries like Nacos, Consul, and Zookeeper.

Below is a basic workflow diagram for Dubbo's service discovery mechanism:

![service-discovery](/imgs/v3/feature/service-discovery/arc.png)

Service discovery involves three roles: providers, consumers, and the registry. In this setup, Dubbo provider instances register their URL addresses with the registry, which aggregates this data. Dubbo consumers read the address list from the registry and subscribe to changes. Whenever the address list changes, the registry notifies all subscribed consumer instances.

## Service Discovery for Million-Scale Clusters
Unlike many other microservices frameworks, **Dubbo 3's service discovery is born out of Alibaba's large-scale e-commerce microservices cluster. Therefore, it significantly outperforms most mainstream open-source products in terms of performance, scalability, and ease of use.** It is the best choice for enterprises to build scalable microservices clusters for the future.

![service-discovery](/imgs/v3/feature/service-discovery/arc2.png)

* First, Dubbo's registry aggregates instance data at the application granularity level, allowing consumers to subscribe precisely according to their needs, thereby avoiding the performance bottleneck caused by full subscriptions in most open-source frameworks like Istio and Spring Cloud.
* Second, Dubbo SDK has heavily optimized the consumer-side address list processing, adding asynchronous notifications, caching, bitmap, and various parsing optimizations to avoid resource fluctuations commonly seen during address updates.
* Finally, in terms of feature richness and ease of use, besides synchronizing basic endpoint information like IP and port to consumers, Dubbo also synchronizes the metadata information of the server's RPC/HTTP services and their configurations to the consumer side, allowing for finer-grained collaboration between consumers and providers.

### Efficient Address Push Implementation

From the registry's perspective, it aggregates the instance addresses of the entire cluster based on the application name (`dubbo.application.name`). Each service-providing instance registers its own application name, instance IP:port address information (usually also containing a small amount of instance metadata, such as the machine's region, environment, etc.) with the registry.

> Dubbo2's registry aggregates instance addresses at the service granularity, which is finer than application granularity and thus means more data transfer. This has led to some performance issues in large-scale clusters.
> For the inconsistency between the data models of Dubbo2 and Dubbo3, Dubbo3 provides a [smooth migration solution](/zh-cn/overview/mannual/java-sdk/upgrades-and-compatibility/service-discovery/migration-service-discovery/) that makes the model change transparent to users.

![service-discovery](/imgs/v3/feature/service-discovery/registry-data.png)

<br/>
Each consumer service instance subscribes to the instance address list from the registry. Unlike some products that load all registry data (application + instance address) into local processes, Dubbo implements precise, on-demand address subscription. For example, if a consumer application depends on app1 and app2, it will only subscribe to the address list updates of app1 and app2, significantly reducing the burden of redundant data pushing and parsing.

<p> </p>
<br/>

![service-discovery](/imgs/v3/feature/service-discovery/subscription2.png)

### Rich Metadata Configuration
In addition to interacting with the registry, Dubbo 3's complete address discovery process also has an additional metadata path, known as the Metadata Service. Instance addresses and metadata together form the effective address list on the consumer side.

![service-discovery](/imgs/v3/feature/service-discovery/metadata.png)

The complete workflow is shown above. First, the consumer receives the address (IP:port) information from the registry, then establishes a connection with the provider and reads the metadata configuration information from the Metadata Service. These two pieces of information together form the effective, service-oriented address list for Dubbo's consumer side. Both of these steps occur before the actual RPC service invocation takes place.

> For the definition of MetadataService and a complete analysis of the service discovery process, please refer to [Detailed Application-Level Service Discovery]({{< relref "../../../blog/proposals/service-discovery/" >}}).

> For data synchronization in microservices' service discovery models, REST has defined a very interesting maturity model. Interested readers can refer to the link here https://www.martinfowler.com/articles/richardsonMaturityModel.html. According to the article's 4-level maturity definition, Dubbo's current model based on interface granularity corresponds to the highest L4 level.

## Configuration Methods
Dubbo service discovery extends support for multiple registry components, such as Nacos, Zookeeper, Consul, Redis, Kubernetes, etc. It can be switched through configuration and also supports authentication and namespace isolation configurations. For specific configuration methods, please refer to the SDK documentation:

* [Java](/en/docs3-v2/java-sdk/reference-manual/registry)
* [Golang](/en/docs3-v2/golang-sdk/tutorial/develop/registry)
* [Rust](/en/docs3-v2/rust-sdk/)

Dubbo also supports scenarios of multiple registries within a single application, such as dual registration, dual subscription, etc. This is very useful for implementing data exchange between different clusters and cluster migration. We will add `Best Practices` examples to future documentation to illustrate this part.

## Custom Extensions
Registry adaptation supports custom extension implementation. For details, please refer to [Dubbo Extensibility](/en/overview/core-features/extensibility/).