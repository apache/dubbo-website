---
aliases:
    - /en/overview/reference/proposals/registry-config-meta/
description: This article introduces the design of a three-center architecture
linkTitle: Registry & Configuration & Metadata Center
title: Registry Center, Configuration Center, and Metadata Center
type: docs
weight: 2
---


## Three Center Logical Architecture
> This section focuses on describing the traditional deployment architecture of Dubbo. The deployment architecture in a cloud-native context may vary, mainly in that the infrastructure (Kubernetes, Service Mesh, etc.) takes on more responsibilities.
> Centralized components such as registry centers, metadata centers, and configuration centers have their duties integrated, making operation and maintenance simpler. However, emphasizing these centralized components helps us better understand how Dubbo works.

As a microservice framework, Dubbo SDK is deployed across distributed clusters along with microservice components. To achieve collaboration between various microservice components in a distributed environment, Dubbo defines several centralized components, including:
* Registry Center. Coordinates address registration and discovery between Consumer and Provider.
* Configuration Center.
    * Stores global configurations during the Dubbo startup phase to ensure cross-environment sharing and global consistency.
    * Responsible for storing and pushing service governance rules (routing rules, dynamic configurations, etc.).
* Metadata Center.
    * Receives service interface metadata reported by Providers and provides operation and maintenance capabilities for consoles like Admin (e.g., service testing, interface documentation).
    * Acts as a supplement to the service discovery mechanism, providing synchronization capabilities for additional interface/method-level configuration information, equivalent to extra extensions of the registry center.

![threecenters](/imgs/v3/concepts/threecenters.png)

The above figure fully describes the interaction process between Dubbo microservice components and each center.

The three centers mentioned above are not necessary for running Dubbo; users can decide to enable only one or more of them based on their business needs to simplify deployment. Generally, all users will start Dubbo service development with an independent registry center, while the configuration and metadata centers will be gradually introduced as needed during the evolution of microservices.

### Registry Center

The registry center plays a very important role, shouldering the responsibilities of service registration and service discovery. Currently, Dubbo supports two granularities of service discovery and registration: interface-level and application-level, and the registry center can be deployed as needed:

- In the traditional usage of the Dubbo SDK, if only direct connection mode RPC services are provided, it is not necessary to deploy a registry center.
- Whether at the interface or application level, if the Dubbo SDK needs to handle service registration and discovery, a registry center can be deployed to integrate the corresponding registry.
- In Dubbo + Mesh scenarios, as the service registration capabilities of Dubbo weaken, the registry center is no longer mandatory, and its responsibilities begin to be replaced by the control plane. If the Dubbo + Mesh deployment method is adopted, neither the ThinSDK's mesh method nor the Proxyless mesh method requires an independent registry center.

The registry center does not depend on the configuration center and the metadata center, as shown in the diagram below:

![centers-registry](/imgs/v3/concepts/centers-registry.png)

This diagram shows that the configuration center and metadata center are not deployed, meaning that Dubbo will default the instance of the registry center to also serve as the configuration center and metadata center. This is the default behavior of Dubbo. If the functionalities of the configuration center or metadata center are indeed not needed, they can be disabled in the configuration. In the registry center's configuration, the two settings 'use-as-config-center' and 'use-as-metadata-center' can be set to false.

### Metadata Center

The metadata center started to be supported from version 2.7.x. As application-level service registration and discovery are implemented in Dubbo, the metadata center becomes increasingly important. The following scenarios may require the deployment of a metadata center:

1. For an application service originally built with an old version of Dubbo, migrating to Dubbo 3 requires a metadata center to maintain the mapping relationship between RPC services and applications (i.e., the mapping between interfaces and applications). If application-level service discovery and registration are adopted, the registry will use an "application - instance list" structure for organizing data, rather than the previous "interface - instance list" structure, making it impossible to obtain the corresponding relationship between interfaces and applications during the migration process. To accommodate this scenario, Dubbo will store the mapping relationship between interfaces and applications in the metadata center during the Provider startup.
2. To allow the registry center to focus more on address discovery and push capabilities, reducing its burden, the metadata center bears all service metadata and extensive interface/method-level configuration information. Regardless of whether service discovery and registration are at the interface granularity or application granularity, the metadata center plays an important role.

If the above two needs exist, deploying a metadata center and integrating it through Dubbo's configuration is feasible.

The metadata center does not depend on the registry center and configuration center, allowing users to freely choose whether to integrate and deploy the metadata center, as shown in the diagram below:

![centers-metadata](/imgs/v3/concepts/centers-metadata.png)

The absence of a configuration center in this diagram means that global configuration management capabilities are not necessary. The absence of a registry center means that Dubbo's mesh solution may be employed, or there may be no need for service registration, only direct calls are received.

### Configuration Center

The configuration center differs from the other two centers in that it is unrelated to interface or application levels; it does not correspond to interfaces but only to configuration data. Even without deploying a registry center and metadata center, the configuration center can be directly integrated into Dubbo application services. In the overall deployment architecture, instances across the cluster (whether Providers or Consumers) will share configurations from the configuration center cluster, as shown in the diagram below:
![centers-config](/imgs/v3/concepts/centers-config.png)

The absence of a registry center in this diagram indicates the potential use of a Dubbo mesh solution, and service registration may not be required, only direct service calls are handled.

The absence of a metadata center in this diagram means that Consumers can obtain service metadata from the MetadataService exposed by Providers to facilitate RPC calls.

### Ensure Highly Available Deployment Architecture of the Three Centers

While the three centers are no longer mandatory for Dubbo application services, once they are integrated and deployed in a production environment, they still face availability issues. Dubbo needs to support high availability solutions for the three centers. Dubbo supports multiple registry centers, multiple metadata centers, and multiple configuration centers to meet deployment architecture models such as multi-active in the same city, two-location three centers, and cross-geography multi-active.

Dubbo SDK supports Multiple mode for all three centers.

- Multiple Registry Centers: Dubbo supports multiple registry centers, meaning an interface or application can be registered to multiple registry centers, such as both a ZK cluster and a Nacos cluster. Consumers can also subscribe to related service address information from multiple registry centers for service discovery. This support for multiple registry centers ensures that if one registry center cluster becomes unavailable, it can switch to another, ensuring continuous service provision and invocation. This also meets various high-availability deployment architecture models for the registry center.
- Multiple Configuration Centers: Dubbo supports multiple configuration centers to ensure that if one configuration center cluster becomes unavailable, it can switch to another, ensuring that global configurations, routing rules, and other information can still be obtained from the configuration center. This also meets various high-availability deployment architecture models for the configuration center.
- Multiple Metadata Centers: Dubbo supports multiple metadata centers to respond to situations where a metadata center cluster becomes unavailable due to disaster recovery or similar circumstances, allowing a switch to another metadata center cluster to maintain management capabilities for service metadata.

Taking the registry center as an example, below is a schematic diagram of a multi-active deployment architecture:

![multiple-registry-deployment-architecture](/imgs/v3/concepts/multiple-registry-deployment-architecture.png)

## Physical Deployment Architecture of the Three Centers

![Same cluster, undertaking the responsibilities of the three centers](#)

## Recommended Usage in Different Scenarios
* Configure only the registry, defaulting to serve as the metadata and config-center.
* Use different clusters or even different extension implementations for the registry, metadata, and config-center, requiring independent configuration for metadata or config-center.

