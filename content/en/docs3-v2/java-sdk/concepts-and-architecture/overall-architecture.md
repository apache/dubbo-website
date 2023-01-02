---
type: docs
title: "Overall Architecture"
linkTitle: "Overall Architecture"
weight: 1
---


![dubbo-architecture](/imgs/user/dubbo-architecture.jpg)

##### Node role description

| Node | Role Description |
| ------------- | ------------- |
| `Provider` | The service provider of the exposed service |
| `Consumer` | The service consumer who invokes the remote service |
| `Registry` | Registry for service registration and discovery |
| `Monitor` | A monitoring center that counts service calls and call times |
| `Container` | service running container |

##### Description of calling relationship

0. The service container is responsible for starting, loading, and running the service provider.
1. When the service provider starts, it registers the services it provides with the registration center.
2. When a service consumer starts, it subscribes to the registration center for the services it needs.
3. The registration center returns the service provider address list to the consumer. If there is a change, the registration center will push the change data to the consumer based on the long connection.
4. The service consumer, from the provider address list, selects a provider to call based on the soft load balancing algorithm, and if the call fails, select another provider to call.
5. Service consumers and providers accumulate the number of invocations and invocation time in memory, and regularly send statistical data to the monitoring center every minute.

The Dubbo architecture has the following characteristics, namely connectivity, robustness, scalability, and upgradeability to future architectures.

## Connectivity

* The registration center is responsible for the registration and search of service addresses, which is equivalent to directory services. Service providers and consumers only interact with the registration center at startup. The registration center does not forward requests, and the pressure is less
* The monitoring center is responsible for counting the number of service calls, call time, etc., and the statistics are first summarized in the memory and sent to the monitoring center server every minute, and displayed in reports
* The service provider registers the services it provides with the registration center, and reports the call time to the monitoring center, which does not include network overhead
* The service consumer obtains the address list of the service provider from the registration center, and directly calls the provider according to the load algorithm, and reports the calling time to the monitoring center, which includes network overhead
* The registration center, service provider, and service consumer are all long connections, except for the monitoring center
* The registration center perceives the existence of the service provider through a long connection, and if the service provider goes down, the registration center will immediately push the event to notify the consumer
* The registration center and monitoring center are all down, and the running providers and consumers are not affected. Consumers cache the list of providers locally
* Both registration center and monitoring center are optional, and service consumers can directly connect to service providers

## Robustness

* The downtime of the monitoring center does not affect the use, but part of the sampling data is lost
* After the database is down, the registration center can still provide service list query through the cache, but cannot register new services
* Registration center peer-to-peer cluster, when any one goes down, it will automatically switch to another
* After the registration center is completely down, the service provider and the service consumer can still communicate through the local cache
* The service provider is stateless, and if any one goes down, it will not affect the use
* After the service provider is all down, the service consumer application will be unavailable and will reconnect infinitely waiting for the service provider to recover

## Scalability

* The registration center is a peer-to-peer cluster, which can dynamically increase machine deployment instances, and all clients will automatically discover the new registration center
* The service provider is stateless and can dynamically increase machine deployment instances, and the registration center will push new service provider information to consumers

## Upgradability

When the scale of service clusters is further expanded and the IT governance structure is further upgraded, it is necessary to realize dynamic deployment and perform flow computing, and the existing distributed service architecture will not bring resistance. The following figure is a possible architecture in the future:

![dubbo-architecture-futures](/imgs/user/dubbo-architecture-future.jpg)

##### Node role description

| Node | Role Description |
| ------------- | ------------- |
| `Deployer` | A local proxy for auto-deployment services |
| `Repository` | The warehouse is used to store the service application release package |
| `Scheduler` | The scheduling center automatically increases or decreases service providers based on access pressure |
| `Admin` | Unified Admin Console |
| `Registry` | Registry for service registration and discovery |
| `Monitor` | A monitoring center that counts service calls and call times |