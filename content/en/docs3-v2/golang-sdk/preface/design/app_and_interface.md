---
type: docs
title: Dubbo's application and interface
keywords: basic concepts
description: Dubbo's application and interface
---

## Dubbogo service level

Dubbogo has two service levels: App Level and Interface Level, which are closely related to the **framework configuration** structure.

As shown in the figure below, you can see that the components at the application level are marked in light red, and the components at the interface level are marked in light blue:

![img](/imgs/docs3-v2/golang-sdk/concept/more/app_and_interface/dubbogo-concept.png)

## 1. Application level components

Features of application-level components: shared by all interface-level components of the current application.

The main components at the application level are as follows:

- Application information module

  Contains information related to application dimensions, including application name, version number, data reporting method, etc.

- Consumer module

  The Consumer module is responsible for client-related information, including one or more Reference structures, as well as timeouts, consumer filters, and other related information.

-Provider module

The Provider module is responsible for server-related information, including one or more service (Service) structures, server-side filters (provider filters) and other related information.

- Registry module

  The registration center module is responsible for defining a series of registration centers to be used, such as middleware such as ZK, Nacos, etcd supported by the framework. The registration module at the application level is only responsible for the declaration, which is referenced by the components at the interface level, and the user-defined registry ID (registryID) is used as an index when citing.

- Protocol module

  Protocol modules only exist on the server side.

  The protocol module cares about the exposed information of the service, such as protocol name, service listening IP, port number and other information. The protocol module belongs to the application level and is only responsible for declaration, and is referenced by the interface-level components with the user-defined protocol ID (protocolID) as the index.

- Metadata Center Module

  The metadata center is similar to the registration center module, which is responsible for declaring the metadata center that the framework needs to use, so that the metadata can be successfully reported.

- Configuration center module
- Routing module
- log module
- Monitoring module

## 2. Interface level components

- Service module

  The service module is used for any exposed service, declares the information required for interface exposure, including interface name, protocol, serialization method, etc., and is responsible for the exposure of a single service interface.

- Reference module

  The drinking module is used by the client of the remote service that needs to be called. It declares the information required to request the interface, including interface name, protocol, serialization method, etc., is responsible for the abstraction of specific protocols, and participates in the generation of the client.

## 3. Description

The exposed services are at the interface level. A user-defined Provider Struct/a user-defined Consumer Struct corresponds to a Service/Reference module. An application can have both a Consumer module and a Provider module at the same time, so multiple Service/Reference modules can exist at the same time. .
