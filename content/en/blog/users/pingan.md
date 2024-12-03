---
date: 2023-01-15
title: "The Migration Journey of Ping An Health to Dubbo3"
linkTitle: "Ping An Health"
tags: ["User Case"]
weight: 5
---
# 1 Background

Our company has used Dubbo as a microservice framework since 2015. When the community launched Dubbo3, we immediately followed suit and conducted in-depth research. We found that the application/instance-level service registration and discovery model of Dubbo3 could alleviate some pressure faced by our current registration center, addressing stability and security issues. At the same time, Dubbo3 has upgraded service governance, aligning with cloud-native architecture, and is backward compatible with Dubbo2, which lowers the cost and risk of upgrading.

The upgrade project has made significant progress and is still ongoing. Through this article, we deeply summarize the internal Dubbo3 upgrade process and its benefits.

# 2 Introduction to Core Features of Dubbo3

The documentation and materials about Dubbo3 in the community are becoming increasingly comprehensive. Below are some contents we referenced from the community.

## 2.1 Next-Generation Cloud-Native Service Framework

![pingan](/imgs/v3/users/pingan-2.png)

Dubbo3 is regarded by the community as the next-generation cloud-native service framework. The core features provided by Dubbo3 mainly include four parts.

- **New Service Discovery Model**. Application-level service discovery designed for cloud-native adaptation to infrastructure and heterogeneous systems; significantly enhances performance and cluster scalability.
- **Next-Generation RPC Protocol: Triple**. A Triple protocol based on HTTP/2, compatible with gRPC; strong gateway penetration, multi-language friendly, supports Reactive Stream.
- **Unified Traffic Governance Model**. Cloud-native traffic governance, uniform governance rules for SDK, Mesh, VM, Container, etc.; can support richer traffic governance scenarios.
- **Service Mesh**. The latest version 3.1.0 supports Sidecar Mesh and Proxyless Mesh, providing more architectural options and reducing migration and implementation costs.

![pingan](/imgs/v3/users/pingan-3.png)

First, there’s the improvement in performance and resource utilization. Community data shows that upgrading to Dubbo3 can potentially reduce single machine memory usage by 50%. The larger the cluster scale, the more pronounced these effects will be. Dubbo3 architecture supports horizontal scaling of clusters at the million-instance level, significantly improving application service governance efficiency and throughput.

Second, Dubbo3 makes upgrading the business architecture easier and more reasonable, especially the RPC protocol. In version 2.x, the communication between web, mobile end, and backend had to go through a gateway proxy, completing protocol conversion and type mapping. Dubbo3's Triple protocol simplifies and naturalizes these processes; it also satisfies more usage scenarios through a streaming communication model.

Lastly, thanks to Dubbo3's comprehensive cloud-native solution, the mesh architecture of Dubbo3 helps businesses shield underlying cloud-native infrastructure details, allowing more focus on business, which is the fundamental advantage of mesh.

## 2.2 Core Principles of Application-Level Service Discovery

![pingan](/imgs/v3/users/pingan-4.png)

Starting from the classic operational principle diagram of Dubbo, since its design inception, Dubbo has built-in capabilities for service address discovery. The provider registers its address with the registration center, and the consumer subscribes to real-time updates from the registration center. Upon receiving the address list, the consumer initiates RPC calls to the provider based on specific load balancing strategies. In this process:

- Each provider registers its accessible address with the registration center using a specific key.
- The registration center aggregates provider instance addresses through this key.
- Consumers subscribe using the same key from the registration center to timely receive the aggregated address list.

![pingan](/imgs/v3/users/pingan-5.png)

Next, let’s look at the detailed format of the URL address registered by the provider to the registration center, which divides the URL address data into several parts:

- First, the accessible address of the instance, mainly containing the IP and port, which the consumer will use to generate a TCP network link as the transmission carrier for subsequent RPC data.
- Second, RPC metadata, which is used to define and describe an RPC request, indicating that this address data is related to a specific RPC service, including its version number, group, and method-related information.
- The next part is RPC configuration data, some of which control the behavior of RPC calls, while some synchronize the state of the provider process instance, such as timeout, data encoding serialization methods, etc.
- The last part is custom metadata, differing from the predefined configuration of the above framework, providing users with greater flexibility, allowing them to extend and add custom metadata to enrich instance status.

Combining the above analysis of the Dubbo2 interface-level address model with the basic principle diagram of Dubbo, we can derive a few conclusions:

- First, the key for address discovery aggregation is the service at the RPC level.
- Second, the data synchronized by the registration center contains not only addresses but also metadata and configurations.

Thanks to conclusions 1 and 2, Dubbo has achieved service governance capabilities at the application, RPC service, and method level.

This is the real reason why Dubbo2 has always been stronger than many service frameworks in usability, functional service governance, and scalability.

In the face of such a scale of addresses, the community seriously considered two questions under the Dubbo3 architecture:

- How to reorganize URL address data while retaining usability and functionality to avoid redundancy, allowing Dubbo3 to support large-scale cluster expansion?
- How to bridge the address discovery layer with other microservice systems such as Kubernetes and Spring Cloud?

![pingan](/imgs/v3/users/pingan-6.png)

Ultimately, the community came up with a refined solution. The basic idea of Dubbo3's application-level service discovery scheme is that the aggregation element on the address discovery link, the previously mentioned Key, has shifted from service-oriented to application-oriented. This is the reason behind its name—application-level service discovery, operating at the same granularity as Kubernetes and Spring Cloud service registration discovery, enabling smooth interconnection; additionally, significantly streamlining the content of data synchronized from the registration center to retain only the core IP and port address data. Following the above adjustments, application-level service discovery maintains ease of use of the interface-level address model while reducing the size and total number of address data.

Metadata, configuration data, and custom data are synchronized through the metadata center or MetadataService, which generates a single metadata revision. If the metadata revision is the same, it is deemed that the metadata and other information are the same, thereby reducing the access frequency to the metadata center or MetadataService.

# 3 Preliminary Research

After understanding the core functions of Dubbo3 and the operational principles of application-level service discovery, we began the preliminary work phase.

## 3.1 Performance Testing

From community data, Dubbo3 excels in many aspects, but we needed to validate it ourselves. Therefore, we tested the performance of the current customized version of Dubbo2 and Dubbo3, focusing primarily on synchronous calls. For asynchronous scenarios, we only conducted testing on Dubbo3. **The following testing data and conclusions are for reference only**. The results indicate that Dubbo3 has indeed made significant optimizations; with similar CPU usage, Dubbo3's TPS outperforms Dubbo2, and when TPS is equal, Dubbo3's CPU usage is lower than that of Dubbo2. Specifically, when comparing the interface level of Dubbo2 with the instance level of Dubbo3, Dubbo3’s CPU usage was approximately 20% lower than that of the customized Dubbo2.

Test environment:

| Type | Version | Machine Configuration |
| --- | --- | --- |
| Provider | dubbo 3.0.4 | 4C8G |
| Consumer | dubbo 3.0.4 | 4C8G |
| Provider | dubbo 2.5.3.22 (Customized based on 2.5.3) | 4C8G |
| Consumer | dubbo 2.5.3.222 (Customized based on 2.5.3) | 4C8G |

Test scenario:

Using the Dubbo protocol, the interface has no other logic; it directly returns the input to the consumer, with an interface data packet size of 500B, and each scenario lasts for 30 minutes.

Test data (for reference only):

![pingan](/imgs/v3/users/pingan-7.png)

## 3.2 Pre-upgrade Research

After obtaining the performance data for Dubbo2 and Dubbo3 from the stress tests, we started planning to pilot Dubbo3 in the company. At this point, we needed to consider the compatibility and migration restructuring between Dubbo3 and Dubbo2, the upgrade goals, and what capabilities Dubbo3 provides to support the upgrade and migration.

### 3.2.1 Compatibility and Migration Restructuring Issues

Given the scale of the company's systems, upgrading from Dubbo2 to Dubbo3 is not a straightforward process, especially since our version of Dubbo2 has undergone numerous optimizations and extensions on top of the original open-source version. These include areas such as OPS service governance, monitoring data metrics, service registration and discovery, RPC gray routing, link analysis, serialization, and providing underlying support for other frameworks. Simultaneously, the Dubbo3 community is actively enhancing, and we hope to continue enjoying the technical benefits of the community. In this context, three issues must be considered:

1. The need to solve compatibility issues between the company's version of Dubbo2 and Dubbo3.
2. The migration and restructuring of existing functionalities.
3. Avoiding modifications to the source code of Dubbo3 to maintain alignment with the community version.

Thanks to Dubbo's excellent extensibility, we can elegantly inherit the company's version of Dubbo2 through the SPI and IoC modules on the basis of Dubbo3 without altering Dubbo3’s source code. We only need to develop an extension package for Dubbo3 to follow the API upgrades of Dubbo3. This upgrade change cost is relatively low compared to reaping benefits from the community.

### 3.2.2 Upgrade Goals

Having determined the solution to historical burdens, we also need to think about the upgrade objectives. First, we confirm that ultimately, we will adopt instance-level service registration and discovery. Currently, the registration center we are using is Zookeeper, while the registration center more recommended by the Dubbo community is Nacos. We also encountered several issues during the validation phase on Zookeeper that did not occur on Nacos, prompting us to consider whether we would ultimately migrate the registration center to Nacos.

Additionally, we hope the entire migration process will be smooth and controllable. Our overall方案 also considers risk management as a core point, aiming for failure degradation and real-time controllability.

Thus, we summarize the upgrade objectives as follows:

1) Smoothly upgrade from Dubbo2 to Dubbo3.

2) Effectively migrate from interface-level service registration and discovery to application-level service registration and discovery.

3) Prepare for the eventual migration of the registration center.

4) Ensure monitoring and observability during the migration process.

5) Enable gray and real-time control during the migration process.

6) Unify the common configuration specifications of Dubbo3 to adapt to the original export and refer methods of Dubbo2.

### 3.2.3 Support Capabilities of Dubbo3 for Migration

The previous sections introduced our goals, but how to integrate Dubbo3’s native design concepts into the real situation? Here are our relevant reflections and validations.

First, Dubbo3 supports managing providers and consumers in different modes of service registration and discovery through parameters on the registryUrl. Key parameters include: registry-type, registry-protocol-type, and register-mode.

Secondly, Dubbo3 can support multiple registration centers. Different registration centers are controlled by the aforementioned registryUrl parameters for their service registration and discovery modes. Additionally, ProviderConfig and ConsumerConfig classes can manage the registration centers used on the provider and consumer sides, respectively. On the consumer side, if multiple registration centers are in use, a ZoneAwareCluster created with ZoneAwareClusterInvoker is used for load balancing by default. As the class name suggests, this ClusterInvoker offers area-aware capabilities. Upon reviewing the source code, we found that it also provides a preferred feature; by adding preferred=true to the corresponding registryUrl, the ClusterInvoker created with that registryUrl will be prioritized.

In scenarios where migration is occurring from interface-level to instance-level within the same registration center, Dubbo3’s MigrationInvoker also provides the relevant support. MigrationInvoker can control instance-level RPC traffic based on the MigrationRule and listen for changes in the specified application’s MigrationRule using the MigrationRuleListener.

RPC monitoring in Dubbo has traditionally been provided by MonitorFilter and DubboMonitor, which collect and report RPC monitoring data. The collected data includes the IP and port of the consumer, the IP and port of the provider, application name, DubboService, Method, and statistics such as success count, failure count, input byte count, output byte count, duration, and concurrency.

These capabilities can meet basic migration tasks. However, from our current status concerning the need for a smooth migration, the observability of migration traffic, and gray and controllable procedures, there still seems to be some distance. Yet while sorting out Dubbo3’s capabilities, we found relatively simple extension solutions. Thus, a general outline of the overall migration方案 is established.

# 4 Design of Upgrade & Migration

The design of the focuses on "smooth and controllable." Based on the new architecture of Dubbo3, the current migration方案 schematic is being validated as follows:

![pingan](/imgs/v3/users/pingan-8.png)

From the diagram above, during the entire upgrade and migration process, there will be multiple versions of Dubbo within the application domain. Dubbo3 is compatible with the community’s version of Dubbo2, while our internally customized version of Dubbo2 is deeply based on the Dubbo2.5.3 open-source version, with extensions made in areas including OPS service governance, monitoring data metrics, service registration and discovery, RPC gray routing, and serialization. Our strategy involves using Dubbo3 as a base and employing the SPI mechanism for compatibility with the customized version of Dubbo2.

In addition to the application, three logical domains are delineated based on the architecture of Dubbo3: registration domain, configuration control domain, and monitoring domain. The registration domain mainly serves service registration and discovery; for example, when the provider exposes DubboService, it reports service information and metadata to the registration center and metadata center. The consumer discovers services through the registration and metadata centers. The configuration control domain primarily manages application configuration and migration traffic control. Dubbo3’s configuration center supports the maintenance of its own ability configurations, meaning that traffic rule configurations are maintained by the configuration center. Dubbo3 provides many methods for dynamic configuration that can be used directly. The monitoring domain, in addition to monitoring original RPC traffic, further details monitoring of migration traffic, allowing intuitive visualization of migration traffic conditions during the process. In case of problems, timely alerts can notify relevant personnel for intervention.

The entire upgrade process is divided into three phases:

First phase: Upgrade from Dubbo2 to the interface level of Dubbo3 to validate functionality, compatibility, performance, and stability.

Second phase: Dual registration at the interface and application levels, managing RPC traffic through MigrationRule and RegistryMigrationRule.

Third phase: Fully switch to application-level, removing MigrationRule and RegistryMigrationRule.

## 4.1 Extending Dubbo3 Compatibility with Customized Versions of Dubbo2

Considering the iteration of the Dubbo3 community version, we ultimately decided to maintain the plugin for compatibility with the customized version of Dubbo2 in the form of an SDK. The main functions of the compatibility extensions are as follows:

1. RPC Forward and Reverse Proxy

Extend the Filter interface implementation on both the consumer and provider sides to manage the send and receive capabilities of forward and reverse proxy data. The customized version of Dubbo2 modified the RpcResult on the serialization layer, so compatibility must also be supported on this level by enhancing the Codec2 SPI using Wrapper mode in conjunction with other extension classes.

2. RPC Gray Routing

Extend the Router, Cluster, and ConfiguratorFactory SPIs of Dubbo, integrating with the internal Eunomia gray control platform to implement RPC gray routing while replacing and maintaining compatibility with the original gray routing functionality modified in the source code of the customized version of Dubbo2.

3. Monitoring Data Metrics

Extend Protocol, MonitorFilter, Monitor, etc., SPIs to interface with the internal monitoring center while maintaining consistency with the monitoring logic of the customized version of Dubbo2.

4. OPS Support for Instance-Level

On the OPS side, we aim to add instance-level service governance in addition to maintaining compatibility with the original interface-level service governance.

5. Compatibility with Other Middleware

In addition to maintaining compatibility with Dubbo itself, some internally developed middleware dependencies or connections related to Dubbo also need upgrades and modifications.

## 4.2 Migration Extension

In addition to the original capabilities of Dubbo3, we also need to extend to provide smooth migration capabilities. Our proposed design方案 is as follows:

1. Support for Gradual and Controllable Migration of Registration Centers

In Dubbo3, when the consumer side application employs multiple registration centers, it will default to balancing load through ZoneAwareCluster created ZoneAwareClusterInvoker. Drawing on this implementation, we can expand a Cluster implementation and a ClusterInvoker implementation to replace ZoneAwareCluster, where migration traffic management, gray control, and degradation capabilities can be realized in the extended ClusterInvoker.

2. Global Configuration Management for Migration Rules from Interface-Level to Instance-Level

MigrationRules are listened to by the MigrationRuleListener via DynamicConfiguration for specified application migration rules. If a system has hundreds or thousands of microservice applications, managing them this way could lead to higher maintenance costs. We implemented a global-level management capability for MigrationRules based on this approach.

3. Observability and Alerting for Migration Traffic

RPC traffic monitoring has been implemented by MonitorFilter and DubboMonitor, yet MonitorFilter cannot recognize which registration center the current RPC request's Invoker object uses for service discovery, nor can it determine if the service discovery mode of that Invoker object is interface-level or instance-level. To address this, we introduced a ClusterFilter interface and Filter interface on the consumer side to implement this recognition logic.

4. Migration Component Switches

Finally, we need to consider the issue of retiring migration components. Even if we need to take them offline, it is not feasible or practical to re-adjust business projects and remove all dependencies on migration components, hence the need for switch controls.

## 4.3 Unified Configuration Management

During the upgrade and migration process, we may need to adjust configuration parameters for the registration center and migration rules at any time. To reduce the risk of errors and the workload for changes during business project upgrades, these public configurations need to be unified for management and maintenance. Dubbo3's configuration center can effectively handle this task.

Ultimately, we also extended a configuration loading component to centrally manage the switches of migration components and connection parameters for the configuration center, such as connection addresses and timeouts. With this component, new applications do not need to worry about public configurations for Dubbo3 and migration, while existing applications can reduce the workload of adjusting these public configurations.

## 4.4 Risk Prevention Plans

As Dubbo provides underlying support capabilities for microservices, we always prioritize stability. Any unexpected issues during the upgrade may lead to online problems; thus, our entire方案 is designed with a focus on failure and risk management. Beyond implementing proactive degradation within the extended migration components, we also consider some extreme scenarios while providing risk prevention plans for these situations. Various unexpected events may occur in the online environment, necessitating pre-thought on risk and establishing comprehensive response handling plans to ensure rapid system recovery.

## 4.5 Summary

Dubbo2 is an excellent microservice framework, and its SPI and Extension mechanisms allow users to easily extend functions as needed. Dubbo3, built on this foundation, introduces numerous new SPIs. We spent significant time designing the migration方案, but the actual development time for the migration components was relatively short.

The overall architectural upgrade of Dubbo3 has resolved past pressures on service registration. Performance optimizations have also been made, and with the upgrade, Dubbo3 is more adaptable to current cloud-native architectures. The Dubbo 3.1.x version supports both sidecar and proxyless mesh solutions. The community is also preparing to open-source a Java agent approach to proxyless, decoupling the microservice framework from the data plane, thus lowering maintenance and upgrade costs for the microservice framework.

# 5 Community Collaboration

Currently, this project is still under continuous upgrading, and we maintain close contact with the community. During this period, we have encountered many problems, all of which have been patiently resolved by community developers. Users looking to upgrade to Dubbo3 can register on the community's GitHub User Issue ([https://github.com/apache/dubbo/issues/9436](https://github.com/apache/dubbo/issues/9436)), and those interested in participating in the community can follow the official Dubbo public account (search for Apache Dubbo) to learn more about the developments in the Dubbo community.

