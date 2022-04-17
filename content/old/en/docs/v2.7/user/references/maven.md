---
type: docs
title: "Maven Plugin Reference"
linkTitle: "Maven"
weight: 12
description: "Maven plugin reference in dubbo"
---

## Start a simple registry server

Start a simple registry server listening on port 9099:

{{% alert title="Info" color="primary" %}}
Default port is 9090 if the port is not specified
{{% /alert %}}

```bash
mvn dubbo:registry -Dport=9099 
```

## Generate a service provider demo application

Generate a service provider with the specified interface and version:

```bash
mvn dubbo:create -Dapplication=xxx -Dpackage=com.alibaba.xxx -Dservice=XxxService,YyyService -Dversion=1.0.0 
```
