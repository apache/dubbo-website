---
type: docs
title: "Subscription Only"
linkTitle: "Subscription Only"
weight: 6
description: "Only subscribe without registration"
---
## Feature description

In order to facilitate development and testing, a registration center that is available for all services is often shared offline. At this time, if a service provider under development registers, it may affect the normal operation of consumers.

The service provider developer can only subscribe to the service (the developed service may depend on other services), without registering the service under development, and test the service under development through direct connection.

![/user-guide/images/subscribe-only.jpg](/imgs/user/subscribe-only.jpg)
## scenes to be used
## How to use

### Disable registration configuration

```xml
<dubbo:registry address="10.20.153.10:9090" register="false" />
```
**or**

```xml
<dubbo:registry address="10.20.153.10:9090?register=false" />
```