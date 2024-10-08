---
aliases:
    - /en/docs3-v2/golang-sdk/preface/design/app_and_interface/
    - /en/docs3-v2/golang-sdk/preface/design/app_and_interface/
    - /en/overview/mannual/golang-sdk/preface/design/app_and_interface/
description: The Application and Interface of Dubbo
keywords: Basic Concepts
title: The Application and Interface of Dubbo
type: docs
---






## Dubbogo Service Levels

Dubbogo service levels consist of two levels: Application Level and Interface Level, which are closely related to the **framework configuration** structure.

As shown in the diagram below, the components at the application level are marked in light red, while those at the interface level are marked in light blue:

![img](/imgs/docs3-v2/golang-sdk/concept/more/app_and_interface/dubbogo-concept.png)

## 1. Application Level Components

Characteristics of application level components: shared by all interface level components of the current application.

The main components at the application level are as follows:

- Application Information Module

  Contains information related to the application dimension, including application name, version number, data reporting method, etc.

- Consumer Module

  The Consumer module is responsible for client-related information, including one or more Reference structures, as well as timeout, client filters, and other related information.

- Provider Module

  The Provider module is responsible for server-related information, including one or more Service structures, server filters, and other related information.

- Registry Module

  The registry module is responsible for defining a series of registries to be used, such as ZK, Nacos, ETCD, etc. The application-level registry module only declares, referenced by interface-level components, using a user-defined registry ID as an index.

- Protocol Module

  The protocol module only exists on the server.

  It concerns service exposure information, such as protocol name, service listening IP, port number, etc. It belongs to the application level, only declaring and referenced by interface-level components, using a user-defined protocol ID as an index.

- Metadata Center Module

  Similar to the registry module, it is responsible for declaring the metadata center needed by the framework to successfully report metadata.

- Configuration Center Module
- Routing Module
- Logging Module
- Monitoring Module

## 2. Interface Level Components

- Service Module

  Used for any exposed service, declaring the information required for interface exposure, including interface name, protocol, serialization method, etc., responsible for exposing a single service interface.

- Reference Module

  Used for clients that need to call remote services, declaring the information required for requesting interfaces, including interface name, protocol, serialization method, etc., and abstracting specific protocols involved in client generation.

## 3. Explanation

Exposed services are at the interface level. A user-defined Provider Struct / a user-defined Consumer Struct corresponds to a Service / Reference module. An application can have both Consumer and Provider modules simultaneously, allowing multiple Service / Reference modules to exist at the same time.

