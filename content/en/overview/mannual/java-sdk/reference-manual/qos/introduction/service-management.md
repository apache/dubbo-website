---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/qos/service-management/
    - /en/docs3-v2/java-sdk/reference-manual/qos/service-management/
description: Service Management Commands
linkTitle: Service Management Commands
title: Service Management Commands
type: docs
weight: 3
---




The service management feature provides a series of commands to manage Dubbo services.

## Service Management

### ls Command

List Consumers and Providers

```
dubbo>ls
As Provider side:
+------------------------------------------------------------------------+---------------------+
|                          Provider Service Name                         |         PUB         |
+------------------------------------------------------------------------+---------------------+
|DubboInternal - UserRead/org.apache.dubbo.metadata.MetadataService:1.0.0|                     |
+------------------------------------------------------------------------+---------------------+
|               com.dubbo.dubbointegration.UserReadService               |nacos-A(Y)/nacos-I(Y)|
+------------------------------------------------------------------------+---------------------+
As Consumer side:
+-----------------------------------------+-----------------+
|          Consumer Service Name          |       NUM       |
+-----------------------------------------+-----------------+
|com.dubbo.dubbointegration.BackendService|nacos-AF(I-2,A-2)|
+-----------------------------------------+-----------------+

```

This command lists the services provided and consumed by Dubbo, as well as the number of addresses for the consumed services.

{{% alert title="Note" color="primary" %}}
- Services prefixed with `DubboInternal` are built-in services of Dubbo and are not registered with the registry by default.
- The first part of the service publishing status `nacos-A(Y)` represents the corresponding registry name, the second part represents the registration model (`A` stands for application-level address registration, `I` stands for interface-level address registration), and the third part indicates whether the corresponding model is registered.
- The first part of the service subscription status `nacos-AF(I-2,A-2)` represents the corresponding registry name, the second part represents the subscription model (`AF` stands for dual subscription mode, `FA` stands for application-level subscription only, `FI` stands for interface-level subscription only), the first half of the third part represents the address mode source (`A` stands for application-level addresses, `I` stands for interface-level addresses), and the second half represents the corresponding number of addresses.
{{% /alert %}}

## Online

### online Command

Command to bring services online.

When using delayed publishing (by setting org.apache.dubbo.config.AbstractServiceConfig#register to false), to bring services online later, you can use the Online command.
```
// Bring all services online
dubbo>online
OK

// Bring some services online based on regex
dubbo>online com.*
OK
```

## Offline


### offline Command

Command to take services offline.

If services need to be temporarily taken offline due to failure or other reasons, use the Offline command.

```
// Take all services offline
dubbo>offline
OK

// Take some services offline based on regex
dubbo>offline com.*
OK
```
