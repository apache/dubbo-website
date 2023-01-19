---
type: docs
title: "Service Management Commands"
linkTitle: "Service Management Command"
weight: 3
description: "Service Management Command"
---


## ls command

List consumers and providers

```
dubbo>ls
As Provider side:
+------------------------------------------------- -----------------------+---------------------+
| Provider Service Name | PUB |
+------------------------------------------------- -----------------------+---------------------+
|DubboInternal - UserRead/org.apache.dubbo.metadata.MetadataService:1.0.0| |
+------------------------------------------------- -----------------------+---------------------+
| com.dubbo.dubbointegration.UserReadService |nacos-A(Y)/nacos-I(Y)|
+------------------------------------------------- -----------------------+---------------------+
As Consumer side:
+-----------------------------------------+------- ----------+
| Consumer Service Name | NUM |
+-----------------------------------------+------- ----------+
|com.dubbo.dubbointegration.BackendService|nacos-AF(I-2,A-2)|
+-----------------------------------------+------- ----------+

```

List the services provided and consumed by dubbo, as well as the number of service addresses consumed.

Note:
- Services prefixed with `DubboInternal` are built-in services of Dubbo, and are not registered with the registry by default.
- The first part of `nacos-A(Y)` in the service publishing status is the corresponding registry name, and the second part is the registration mode (`A` stands for application-level address registration, `I` stands for interface-level address registration), The third part represents whether the corresponding mode has been registered
- The first part of `nacos-AF(I-2,A-2)` in the service subscription status is the corresponding registration center name, and the second part is the subscription mode (`AF` stands for dual subscription mode, `FA` stands for only Application-level subscription, `FI` stands for interface-level subscription only), the first half of the third part represents the source of the address mode (`A` stands for application-level address, `I` stands for interface-level address), and the second half represents the corresponding number of addresses

## online

### online commands

Online online service command

When using the delayed release function (by setting org.apache.dubbo.config.AbstractServiceConfig#register to false), when you need to go online later, you can use the Online command
```
//Online all services
dubbo>online
OK

//According to the rules, launch some services
dubbo>online com.*
OK
```

## log off


### offline command

Offline service command

Due to failure and other reasons, it is necessary to temporarily go offline to maintain the site, and you can use the Offline offline command.

```
//Offline all services
dubbo>offline
OK

//According to the rules, some services are offline
dubbo>offline com.*
OK
```