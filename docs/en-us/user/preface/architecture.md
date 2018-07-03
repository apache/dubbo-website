# Architecture

![dubbo-architucture](../sources/images/dubbo-architecture.jpg)

##### Specification of Node's Role

| Node  | Role Spec |
| ------------- | ------------- |
| `Provider`  | The provider exposes remote services |
| `Consumer`  | The consumer calls the remote services |
| `Registry`  | The registry is responsible for service discovery and configuration |
| `Monitor`  |  The monitor counts the number of service invocations and time-consuming |
| `Container`  | The container manages the services's lifetime |

##### Service relationship

0. `Container` is responsible for launching, loading, and running the service `Provider`.
1. `Provider` registers its services to `Register` at the time it starts.
2. `Consumer` subscribes the services it needs from the `Register` when it starts.
3. `Register` returns the `Provider`s list to `Consumer`, when it changes, the `Register` will push the changed data to `Consumer` through long connection. 
4. `Consumer` selects one of the `Provider`s based on soft load balancing algorithm and executes the invocation, if fails, it will choose another `Provider`.
5. Both `Consumer` and `Provider` will count the number service invocations and time-consuming in memory, and send the statistics to `Monitor` every minute.

Dubbo has the following features: Connectivity, Robustness, Scalability and Upgradeability.

## Connectivity

* `Register` is responsible for the registration and search of service addresses, like directory services, `Provider` and `Consumer` only interact with the registry during startup, and the registry does not forward requests, so it is less stressed
* 'Monitor' is responsible for counting the number of service invocations and time-consuming, the statistics will assembles in `Provider`'s and `Consumer`'s memory first and  then sent to `Monitor`
* 'Provider' registers services to 'Register' and report time-consuming statistic(not include network overhead) to 'Monitor'
* 'Consumer' gets a list of service provider addresses from `Registry`, call the provider directly according to the LB algorithm, report the time-consuming statistic to `Monitor`, which includes network overhead
* The connections between `Register`, `Provider` and `Consumer` are long connections, `Moniter` is an exception
* `Register` is aware of the existence of `Provider` through the long connection, when `Provider` gets down, `Provider` will push the event to `Consumer`
* It doesn't affect the already running instances of `Provider` and `Consumer` even all of the `Register` and `Monitor` get down, since `Consumer` got a cache of `Provider`s list
* `Register` and `Monitor` are optional, `Consumer` can connect `Provider` directly

## Robustness

* `Monitor`'s downtime doesn't affect the usage, only lose some sampling data
* When the DB server goes down, `Register` can return service `Provider`s list to `Consumer` by checking its cache, but new `Provider` cannot regiter any services
* `Register` is a peer cluster, it will automatically switch to another when any instance goes down
* Even all `Register`'s instances go down, `Provider` and `Consumer` can still conmunicate by checking their local cache
* Service `Provider`s are stateless, one instance's downtime doesn't affect the usage
* After all the `Provider`s of one service go down, `Consumer` can not use the that service, and infinitely reconnect to wait for service `Provider` to recover

## Scalability

* `Register` is a peer cluster that can dynamically increases its instances,  all clients will automatically discover the new instances.
* `Provider` is stateless, it can dynamically increases the deployment instances, and the registry will push the new service provider information to the `Consumer`.

## Upgradeablity

When the service cluster is further expanded and the IT governance structure is further upgraded, dynamic deployment is needed, and the current distributed service architecture will not bring resistance. Here is a possible future architecture:

![dubbo-architucture-futures](../sources/images/dubbo-architecture-future.jpg)

##### Specification of Node's Role

| Node  | Role Spec |
| ------------- | ------------- |
| `Deployer `  | Local proxy for automatic services deployment |
| `Repository`  | The repository is used to store application packages |
| `Scheduler`  | The scheduler automatically increases or decreases service providers based on the access pressure |
| `Admin`  | Unified management console |
| `Registry`  | the registry is responsible for service discovery and configuration |
| `Monitor`  | The monitor counts the service call times and time-consuming |
