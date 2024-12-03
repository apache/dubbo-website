---
title: "Registry Center Security"
linkTitle: "Registry Center Security"
weight: 3
type: docs
description: "Using the registry center more securely in Dubbo"
---

Dubbo supports the extension of registry centers, theoretically allowing users to enable any registry center based on this extension mechanism. This brings great flexibility but also raises awareness of potential security risks.

The following registry centers are provided in the official version of Dubbo 2.7:
* Zookeeper
* Redis
* Nacos
* Etcd
* Consul
* ……

Starting from Dubbo 3.0, only the following registry centers are supported by default:
* Zookeeper
* Nacos

For registry centers, Dubbo can only fully trust the data they push. Therefore, if there are security vulnerabilities in the registry center, it may lead to malicious registration or data being maliciously pushed, causing service attacks.
To ensure the security of the registry center, Dubbo officially recommends:
* Enabling the authentication mechanism of the registry center, such as Zookeeper's ACL mechanism, Nacos’s username and password mechanism, etc.
* Avoiding exposing the registry center to public networks and striving to deploy the registry center in a trusted internal network environment

