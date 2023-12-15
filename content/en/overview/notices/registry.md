---
title: "Registration Center Security"
linkTitle: "Registration Center Security"
weight: 3
description: "Use the registration center more safely in Dubbo"
type: docs
---

Dubbo supports the extension of the registration center. In theory, users can enable any registration center based on this extension mechanism. This brings great flexibility, but at the same time, users must be aware of the hidden security risks.

The official version of Dubbo 2.7 provides the following registration centers:
* Zookeeper
* Redis
* Nacos
* Etcd
* Consul
* ...

Starting from Dubbo 3.0, only the following registration centers are supported by default:
* Zookeeper
* Nacos

For the registration center, Dubbo can only fully trust the data pushed by it. Therefore, if there is a security vulnerability in the registration center, the Dubbo service may be maliciously registered or data may be maliciously pushed, resulting in the service being attacked.
Therefore, in order to ensure the security of the registration center, Dubbo officially recommends that you:
* Enable the authentication mechanism of the registration center, such as Zookeeper's ACL mechanism, Nacos' username and password mechanism, etc.
* Avoid exposing the registration center to the public network environment, and try to deploy the registration center in a trusted intranet environment
