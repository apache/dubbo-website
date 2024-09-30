---
title: "Deconstructing the Core Registration Engine Nacos of Dubbo-go"
linkTitle: "Deconstructing the Core Registration Engine Nacos of Dubbo-go"
tags: ["Go"]
date: 2021-01-14
description: >
    Reasons why dubbo-go chooses Nacos as the registration center
---

In recent years, with the gradual development and growth of the Go language community, more and more companies have begun to try using Go to build microservice systems. Several Go microservice frameworks have emerged, such as go-micro, go-kit, and Dubbo-go. Components related to microservice governance have also started to strengthen in the Go ecosystem, with Sentinel and Hystrix both releasing Go versions. The registration center, which is a core engine of microservice frameworks, is also an indispensable component. There are multiple registration centers on the market that support the Go language; how should one choose? We can compare the currently mainstream registration centers that support the Go language.

![img](/imgs/blog/dubbo-go/nacos/p1.png)

From the comparison in the table above, we can draw conclusions from the following dimensions:

- Ecosystem: All registration centers support the Go language, but Nacos, Consul, and Etcd have active communities, while ZooKeeper and Eureka have lower community activity.
- Usability: Nacos, Eureka, and Consul have ready-made management platforms, while Etcd and ZooKeeper, as KV stores, lack corresponding management platforms. Nacos supports a Chinese interface, aligning better with local user habits.
- Scenario Support: The CP model mainly targets strong consistency scenarios, such as finance, and the AP model is suitable for high availability scenarios. Nacos can meet both scenarios, while Eureka mainly ensures high availability, and Consul, ZooKeeper, and Etcd primarily cater to strong consistency scenarios. Additionally, Nacos supports data synchronization from other registration centers, facilitating user registration center migration.
- Functionality Completeness: All registration centers support health checks, with Nacos and Consul supporting various check methods to meet different application scenarios. ZooKeeper uses a keep-alive method to sense instance changes in real time. Nacos, Consul, and Eureka all support load balancing strategies, with Nacos offering more flexible strategies through Metadata selectors. Furthermore, both Nacos and Eureka support avalanche protection to prevent unhealthy instances from leading to an avalanche effect on healthy instances.

Overall, Nacos has certain advantages as a registration center. How well does it integrate with the Go microservices ecosystem? Next, we will explore how Nacos integrates with Dubbo-go.

## Introduction

Dubbo-go is currently the hottest project in the Dubbo multi-language ecosystem. Since its release in 2016, it has been five years. Recently, Dubbo-go released version v1.5, which fully supports Dubbo version 2.7.x, allowing service registration and discovery at the application dimension, aligning with mainstream registration models, marking a key step toward cloud-native. As the core engine driving service operations—the registration center—needs to adapt after switching to application-level registration models. This article will analyze how to implement service registration and discovery at the application level using Nacos as the core engine, along with practical examples. Additionally, the code in this article is based on Dubbo-go v1.5.1, Nacos-SDK-go v1.0.0, and Nacos v1.3.2. 

## Service Registration and Discovery Architecture

From the architecture, we can see that, unlike interface-level service registration and discovery, the Dubbo-go provider calls the `RegisterInstance` interface of Nacos-go-sdk to register the service instance after startup. The registered service name is the application name, not the interface name. The consumer calls the Subscribe interface to subscribe to changes in the application’s service instances and initiates service calls to those instances.

![img](/imgs/blog/dubbo-go/nacos/p2.png)

## Service Model

Figure 3 shows the application-level service discovery model of Dubbo-go, mainly with two hierarchical relationships: service and instance. The properties of a service instance mainly include instance ID, host address, service port, activation status, and metadata. Figure 4 presents Nacos's service hierarchical storage model, which includes three levels: service, cluster, and instance. In comparison, the additional cluster dimension is present, and instance attribute information can fully match. Therefore, when registering application service instances to Nacos in Dubbo-go, we only need to set the cluster to the default cluster and fill in the relevant attributes of the service and instance to complete the match on the service model. Also, Nacos allows services to be registered under different namespaces, achieving multi-tenant isolation.

![img](/imgs/blog/dubbo-go/nacos/p3.png)

![img](/imgs/blog/dubbo-go/nacos/p4.png)

## Service Instance Heartbeat Maintenance

After registering application service instance information to Nacos, the Dubbo-go provider needs to actively report heartbeats to let the Nacos server detect the instance's survival state, determining whether to remove the node from the instance list. Heartbeat maintenance is completed in Nacos-SDK-go. From the code in Figure 5, we can see that when Dubbo-go calls `RegisterInstance` to register a service instance, the SDK not only calls Nacos's Register API but also calls `AddBeatInfo` to add service instance information to local cache and periodically sends service instance information to Nacos through a background coroutine to maintain the heartbeat. When the service goes offline, it can call `DeRegisterInstance` to perform unregistration and remove the local heartbeat maintenance task, and the instance will also be removed from the Nacos instance list.

![img](/imgs/blog/dubbo-go/nacos/p5.png)

# Subscribe to Service Instance Changes

When starting, the Dubbo-go consumer calls the Subscribe interface of Nacos-SDK-go. The input parameters are shown in Figure 6, where you only need to pass the ServiceName (i.e., application name) and the `SubscribeCallback` callback function. Nacos can notify Dubbo-go through the callback function when the service instance changes. How does Nacos-SDK-go perceive changes in Nacos's service instances? There are mainly two ways:

- Nacos server actively pushes notifications. Nacos-SDK-go listens on a UDP port when started, and this port is passed as a parameter when calling the Nacos Register API. Nacos will record the IP and port, and when service instances change, Nacos sends UDP requests to all IPs and ports listening to that service to push the updated service instance information.

- Nacos-SDK-go periodically queries. The SDK periodically calls the query interface for subscribed service instances, and if changes are detected, it notifies Dubbo-go through the callback interface. This is a fallback strategy to ensure that changes can still be perceived even if the Nacos server push fails.

![img](/imgs/blog/dubbo-go/nacos/p6.png)

Additionally, Nacos-SDK-go supports push-empty protection. When the instance list pushed by Nacos is empty, it does not update the local cache and does not notify Dubbo-go of the changes, avoiding consumer calls to unavailable instances, which could cause failures. At the same time, the SDK also supports local persistent storage of service instance information, ensuring that during Nacos service failures, the consumer can still obtain available instances upon restart, providing disaster recovery effects.

# Practical Examples

## Environment Preparation

Download the dubbo-go samples code: https://github.com/apache/dubbo-go-samples/tree/master, the Hello World code for application-level service discovery based on Nacos is located in `registry/servicediscovery/nacos`.

![img](/imgs/blog/dubbo-go/nacos/p7.png)

Set up the Nacos server reference, see the official documentation: https://nacos.io/zh-cn/docs/quick-start.html, or use the public Nacos service provided by the official: http://console.nacos.io/nacos (username and password: nacos, for testing only), or buy services from Alibaba Cloud: https://help.aliyun.com/document_detail/139460.html?spm=a2c4g.11186623.6.559.d7e264b7bLpZIs

## Server Setup

Enter the directory `registry/servicediscovery/nacos/go-server/profiles`, where there are folders for `dev`, `release`, and `test`, corresponding to development, testing, and production configurations. We use the `dev` configuration to set up the development environment. In the `dev` folder, there are `log.yml` and `server.yml` files. We will modify the `server.yml` configuration.

Remote configuration uses the public Nacos service; the address can be configured with multiple addresses separated by commas. The params parameter configures the log directory for nacos-sdk.

```Yaml
remote:
  nacos:
    address: "console.nacos.io:80"
    timeout: "5s"
    params:
        logDir: "/data/nacos-sdk/log"
configCenter configuration
config_center:
  protocol: "nacos"
  address: "console.nacos.io:80"
```

Configure server environment variables

```Bash
export CONF_PROVIDER_FILE_PATH=path to server's server.yml file
export APP_LOG_CONF_FILE=path to server's log.yml file
```

Navigate to `registry/servicediscovery/nacos/go-server/app`, run the main method of `server.go`, and you can see that the application `user-info-server` has been registered successfully on the Nacos console (http://console.nacos.io/nacos/#/serviceManagement?dataId=&group=&appName=&namespace=).

![img](/imgs/blog/dubbo-go/nacos/p8.png)

## Client Setup

The configuration file for the client is located in `registry/servicediscovery/nacos/go-server/profiles`, and the changes needed are the same as for the server side, so we won't elaborate here.

Configure client environment variables

```Bash
export CONF_CONSUMER_FILE_PATH=path to client's server.yml file
export APP_LOG_CONF_FILE=path to client's log.yml file
```

Navigate to `registry/servicediscovery/nacos/go-client/app`, run the main method of `client.go`, and upon seeing the following log output, it indicates that the call to the server has been successful.

![img](/imgs/blog/dubbo-go/nacos/p9.png)

> Author: Li Zhipeng GitHub account: Lzp0412, author of Nacos-SDK-go, Apache/Dubbo-go Contributor. Currently works at Alibaba Cloud Native Application Platform, mainly involved in service discovery, CoreDNS, and ServiceMesh related work, responsible for promoting the Nacos Go microservices ecosystem construction.

