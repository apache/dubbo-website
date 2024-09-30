---
aliases:
    - /en/docs3-v2/golang-sdk/preface/design/architecture/
    - /en/docs3-v2/golang-sdk/preface/design/architecture/
    - /en/overview/mannual/golang-sdk/preface/design/architecture/
description: Architecture
keywords: Architecture
title: Architecture
type: docs
---






### Architecture Description

![architecture](/imgs/docs3-v2/golang-sdk/concept/more/architecture/architecture.png)

### Node Description

* `Registry` : The registry center responsible for service registration and discovery in dubbo-go
* `Consumer` : The service consumer that calls remote services
* `Provider` : The service provider that exposes services

### Process Description
* `0. register` : When the service provider starts, it will automatically register its services with the registry center
* `1. subscribe` : The service consumer will subscribe to the services it needs from the registry center upon starting
* `2. notify` : The registry center returns service registration information to the service consumer. When the subscribed service changes, the change data will be pushed to the consumer
* `3. invoke` : The service consumer selects a suitable service address based on the service addresses obtained from the registry center and initiates a request after applying the load balancing algorithm

