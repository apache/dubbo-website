---
aliases:
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/observability/
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/observability/
description: Observability
linkTitle: Console
title: Observability
type: docs
weight: 1
---

The most direct way to manage Dubbo is through the visual interface provided by the Dubbo control plane (dubbo-control-plane). In the previous article on [Quick Start - Deploying Dubbo Applications]() we also used it to check the status after the service was started.

**`dubbo-control-plane` supports visual displays, monitoring cluster status, and real-time delivery of traffic control rules.**

## Installing the Console
To experience the effects, we first need to install dubbo-control-plane. Here are the specific steps to install dubbo-control-plane in a Linux environment:
1. Download & Extract
    ```shell
    curl -L https://dubbo.apache.org/releases/downloadDubbo.sh | sh -

    cd dubbo-$version
    export PATH=$PWD/bin:$PATH
    ```
2. Install
    ```shell
    dubbo-cp run --mode universal --config conf/dubbo.yml
    ```
    Note that the `conf/dubbo.yml` configuration needs to be adjusted according to your needs to point to the registry and other backend services you want to connect to. For specifics, please refer to the backend services dependent on the dubbo-control-plane architecture.
3. Access `http://xxx` to open the console page.
    ![Page Screenshot]()

{{% alert title="Note" color="info" %}}
* Please refer to the documentation for detailed installation steps of dubbo-control-plane, including installation methods and configuration guidance for multiple platforms.
* For Dubbo service development in Kubernetes environments (including dubbo-control-plane installation), we have a dedicated section explaining this for developers working in Kubernetes environments.
{{% /alert %}}

## Feature Introduction
The Admin console provides rich features across different levels from development, testing, to traffic governance. The functions can generally be categorized as follows:
* Service status and dependency query
* Online service testing and documentation management
* Cluster status monitoring
* Instance diagnostics
* Traffic control

### Service Status and Dependency Query
Service status queries display dubbo cluster information with interfaces as the dimension, including service provider, consumer information, and service metadata. Metadata includes service definitions, method names, and parameter lists. Admin supports the application-level discovery model provided by the latest version of dubbo3, presenting application-level & interface-level address information in a unified page interaction, and differentiating records with special tags.

#### Query by Service Name
![img](/imgs/v3/tasks/observability/admin/1-search-by-service.png)

#### Query by Application Name
![img](/imgs/v3/tasks/observability/admin/1-search-by-appname.png)

#### Query by Instance Address
![img](/imgs/v3/tasks/observability/admin/1-search-by-ip.png)

#### Service Instance Details
![img](/imgs/v3/tasks/observability/admin/1-service-detail.png)

### Online Service Testing and Documentation Management
#### Service Testing
Service testing is mainly used to simulate service consumers, verifying the usage and correctness of Dubbo services.

![img](/imgs/v3/tasks/observability/admin/2-service-test2.png)

![img](/imgs/v3/tasks/observability/admin/2-service-test.png)

#### Service Mock
Service Mock interrupts requests from Consumer to Provider without code embedding, dynamically allowing or returning user-defined Mock data. This resolves blocking issues faced by Consumer developers when the Provider they depend on is not ready in the early stages of development.
Simply follow these two steps to enjoy the convenience brought by service Mock:

First step:
Consumer applications import service Mock dependencies, adding JVM startup parameter -Denable.dubbo.admin.mock=true to enable service Mock functionality.
```xml
<dependency>
  <groupId>org.apache.dubbo.extensions</groupId>
  <artifactId>dubbo-mock-admin</artifactId>
  <version>${version}</version>
</dependency>
```

Second step: Configure the corresponding Mock data in Dubbo Admin.

![img](/imgs/v3/tasks/observability/admin/2-service-mock.png)

#### Service Documentation Management
The interface documentation provided by Admin is similar to what Swagger does for RESTful style web services. This function effectively manages Dubbo interface documentation.

![img](/imgs/v3/tasks/observability/admin/2-service-doc.png)

### Cluster Status Monitoring
#### Home Dashboard
TBD

#### Grafana
![img](/imgs/v3/tasks/observability/admin/3-grafana.png)

#### Tracing
![img](/imgs/v3/tasks/observability/admin/3-tracing-zipkin.png)

### Traffic Control
Admin provides visual management support for four types of routing rules: conditional routing rules, label routing rules, dynamic configuration rules, and script routing rules. The functionality offered easily realizes service governance needs such as black and white lists, gray environment isolation, multiple testing environments, and canary releases. Next, we take conditional routing as an example to visually create conditional routing rules.

#### Conditional Routing

Conditional routing allows for custom routing rules to meet service governance needs, such as priority by region, parameter routing, black and white lists, and read-write separation. The routing rules filter target server addresses before initiating an RPC call, and the filtered address list will serve as candidate addresses for the consumer to initiate the RPC call.

![img](/imgs/v3/tasks/observability/admin/4-traffic-management.png)

Please refer to [Traffic Management Tasks](../../traffic-management/) for more details on configuring routing rules.

