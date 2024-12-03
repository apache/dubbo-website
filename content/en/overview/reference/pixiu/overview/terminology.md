---
aliases:
    - /en/docs3-v2/dubbo-go-pixiu/overview/terminology/
    - /en/docs3-v2/dubbo-go-pixiu/overview/terminology/
    - /en/overview/reference/pixiu/overview/terminology/
    - /en/overview/mannual/dubbo-go-pixiu/overview/terminology/
description: Pixiu Terminology
linkTitle: Pixiu Terminology
title: Pixiu Terminology
type: docs
weight: 2
---







![img](/imgs/pixiu/overview/terminology.png)

### Listener

Listener represents the ability to listen on a network port and can be configured with the protocol type, address, and port. It currently supports TCP, HTTP, HTTP2, and TRIPLE protocols.

### Network Filter

NetworkFilter interfaces directly with Listener and represents the handling of basic network requests, including raw protocol parsing and routing parsing.

### Http Filter & Dubbo Filter

Http Filter and Dubbo Filter can be viewed as secondary filters, providing common functions such as protocol conversion, traffic limiting, and authentication.

### Route

Route represents the routing rules for requests.

### Cluster

Cluster represents a cluster of the same service, while Endpoint represents a single service instance within the service cluster.

### Adapter

Adapter represents the capability of Pixiu to obtain metadata from external sources. It can dynamically acquire routing and cluster information based on the service metadata in the service. Currently, Pixiu supports two types of adapters, which retrieve information from Dubbo clusters and Spring Cloud clusters.

