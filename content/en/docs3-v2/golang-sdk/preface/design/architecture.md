---
type: docs
title: Architecture
keywords: architecture
---

![architecture](/imgs/docs3-v2/golang-sdk/concept/more/architecture/architecture.png)

#### Node description

* `Registry` : The registry responsible for service registration and discovery in dubbo-go
* `Consumer` : The service consumer who invokes the remote service
* `Provider` : The service provider of the exposed service

#### Process description
* `0.register` : When the service provider starts, it will automatically register its own service to the registration center
* `1. subscribe` : The service consumer will subscribe to the registration center for the services it needs when it starts
* `2. notify`: The registration center returns the service registration information to the service consumer. When the subscribed service changes, it will push the changed data to the consumer
* `3. invoke`: The service consumer selects a suitable service address to initiate a request through the load balancing algorithm according to the service address obtained from the registration center