---
type: docs
title: "Sign Up Only"
linkTitle: "Sign up only"
weight: 41
description: "Only register but not subscribe"
---
## Feature description
If there are two mirroring environments and two registries, one service is only deployed in one of the registries, and the other registry has not yet been deployed, and other applications in the two registries need to rely on this service. At this time, the service provider can only register the service to another registration center, but not subscribe to the service from another registration center.


## scenes to be used

## How to use
### Disable subscription configuration

```xml
<dubbo:registry id="hzRegistry" address="10.20.153.10:9090" />
<dubbo:registry id="qdRegistry" address="10.20.141.150:9090" subscribe="false" />
```

**or**

```xml
<dubbo:registry id="hzRegistry" address="10.20.153.10:9090" />
<dubbo:registry id="qdRegistry" address="10.20.141.150:9090?subscribe=false" />
```