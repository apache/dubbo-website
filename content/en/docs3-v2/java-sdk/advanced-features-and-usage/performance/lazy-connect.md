---
type: docs
title: "Delayed Connection"
linkTitle: "Delayed connection"
weight: 30
description: "Configure delayed connection in Dubbo"
---
## Feature description

## scenes to be used
Delayed connections are used to reduce the number of long connections. When a call is initiated, create a persistent connection.

## How to use
```xml
<dubbo:protocol name="dubbo" lazy="true" />
```

> This configuration is only valid for the dubbo protocol that uses long connections.