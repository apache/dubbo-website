---
aliases:
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/performance/loadbalance/
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/performance/loadbalance/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/others/graceful-shutdown/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/service/consistent-hash/
description: "How Dubbo service discovery works, basic usage methods, and configuration details, covering delayed registration, graceful shutdown, startup checks, network recovery, and empty push protection."
linkTitle: Service Discovery
title: "How Service Discovery Works: Basic Usage and Configuration Details"
type: docs
weight: 1
---
Dubbo supports an automatic instance discovery mechanism based on a registry center, where Dubbo providers register instance addresses to the registry center, and Dubbo consumers automatically obtain the latest instance changes by subscribing to changes in the registry center, ensuring that traffic is always forwarded to the correct nodes. Dubbo currently supports various registry centers such as Nacos, Zookeeper, and Kubernetes Service.

## Registry Center
The following are some mainstream registry center implementations for Dubbo service discovery. For more extended implementations and working principles, please refer to [Registry Center Reference Manual](/en/overview/mannual/java-sdk/reference-manual/registry/overview/).

| Registry Center | Configuration Value | Service Discovery Model | Supports Authentication | spring-boot-starter |
| --- | --- | --- | --- | --- |
| Nacos | nacos | Application-level, Interface-level | Yes | dubbo-nacos-spring-boot-starter |
| Zookeeper | zookeeper | Application-level, Interface-level | Yes | - dubbo-zookeeper-spring-boot-starter <br/> - dubbo-zookeeper-curator5-spring-boot-starter |
| Kubernetes Service | Refer to the standalone usage documentation | Application-level | Yes | None |

## Delayed Registration
If your service requires warm-up time, such as initializing cache or waiting for resources to be ready, you can use the `delay` parameter for delayed registration. In a Spring application, `delay = n(n > 0)` means that the delay time starts from when the Spring context is initialized.

```java
@DubboService(delay = 5000)
public class DemoServiceImpl implements DemoService {
}
```

With the above configuration, the application will delay exposing this service for 5 seconds (registering the service to the registry center 5 seconds after application startup). Alternatively, you can configure a global default value to allow all services to register after a 5-second delay:

```yaml
dubbo:
  provider:
    delay: 5000
```

{{% alert title="Manual Registration" color="warning" %}}
By configuring `delay = -1`, you can prevent the framework from automatically publishing the service to the registry center until the user manually completes the publication through commands like [online](/en/overview/mannual/java-sdk/reference-manual/qos/qos-list/). This feature can be used with deployment systems to achieve graceful service online management, giving users better control over timing. The specific configuration is as follows:

```yaml
dubbo:
  provider:
    delay: -1
  application:
    manual-register: true
```
{{% /alert %}}

## Graceful Online and Offline
By controlling the timing of service instance publication to and removal from the registry center, each instance can handle all ongoing requests smoothly, preventing traffic loss during deployment. The recommended sequence for online and offline operations is as follows:

### Graceful Online
1. Configure instance address delayed (or manual) registration, for details refer to the previous section on delayed registration configuration.
2. Upon receiving new registered address instances, the consumer side will warm up the new instance by allocating a small portion of traffic to it at a certain ratio, gradually increasing the ratio until it is on par with other instances.

    The calculation for warming up mainly involves two factors: the instance startup time `timestamp` and the total duration of warm-up `warmup`, which can be set via the `warmup` parameter. The calculation formula is similar:

    <img style="max-width:150px;height:auto;" src="/imgs/v3/tasks/registry/formula.png"/>

### Graceful Offline
The recommended steps for graceful offline are as follows:
1. Before attempting to stop the Dubbo process, call [offline](/en/overview/mannual/java-sdk/reference-manual/qos/qos-list/) to remove the instance address from the registry center (it is suggested to wait a few extra seconds after the operation to ensure the registry center's address offline event takes effect).
2. Try to stop the Dubbo process using `kill pid`. The framework will sequentially check the following:
	* 2.1 The framework sends a readonly event to all consumers (by traversing the channels it holds), and the consumers receiving the event will stop sending new requests to that instance. This action is enabled by default.
	* 2.2 The framework will wait for some time to ensure that all ongoing requests are processed, with the default being `10000` milliseconds, adjustable through `-Ddubbo.service.shutdown.wait=20000`.
3. After the above steps are completed, the Dubbo process will automatically stop.

{{% alert title="Note" color="info" %}}
In some scenarios, you may need to control the timing of address registration and removal in code. This can be achieved by calling the following code:

```java

```

```java

```
{{% /alert %}}

## Multiple Registries
Dubbo supports configuring multiple registry centers within the same application. A single service or a group of services can be registered to multiple registry centers simultaneously, and a single service or a group of services can subscribe to addresses from multiple centers at the same time. For subscribers, it can also specify how to call addresses from multiple registry centers (prioritizing one registry center or other strategies).

To specify one or more global default registry centers, all services will default to register to or subscribe to the configured registry centers:
```yaml
dubbo
 registries
  beijingRegistry
   register-mode: instance # New users are advised to use this; old users should remove this configuration if they wish to continue using the old service discovery model
   address: zookeeper://localhost:2181
  shanghaiRegistry
   register-mode: instance # New users are advised to use this; old users should remove this configuration if they wish to continue using the old service discovery model
   address: zookeeper://localhost:2182
```

To specify that a certain service registers to multiple registry centers:

```java
@DubboService(registry = {"beijingRegistry"})
public class DemoServiceImpl implements DemoService {}
```

To specify that a certain service subscribes to addresses from multiple registry centers:

```java
@DubboReference(registry = {"beijingRegistry"})
private DemoService demoService
```

For more configuration and usage scenarios regarding multiple registries, please refer to [【Reference Manual - Registry Center - Multiple Registries】](/en/overview/mannual/java-sdk/reference-manual/registry/multiple-registry/)

## Application-level vs Interface-level
While Dubbo 3 is compatible with Dubbo 2's `interface-level service discovery`, it defines a new `application-level service discovery` model. For their meanings and working principles, please refer to [Application-level Service Discovery](/en/overview/mannual/java-sdk/reference-manual/registry/service-discovery-application-vs-interface/). Dubbo 3 has the capability to automatically negotiate the service discovery model, allowing old Dubbo 2 users to seamlessly upgrade to Dubbo 3.

{{% alert title="Note" color="warning" %}}
If you are a new user of Dubbo, it is strongly recommended to add the following configuration item to clearly instruct the framework to use application-level service discovery:
```yml
dubbo:
  registry:
    address: "nacos://127.0.0.1:8848"
    register-mode: instance # New users should set this value to enable application-level service discovery; optional values are interface, instance, all
```

Old users are advised to refer to the [Application-Level Service Discovery Migration Guide](/en/overview/mannual/java-sdk/reference-manual/upgrades-and-compatibility/migration-service-discovery/) for a smooth migration.
{{% /alert %}}

## Register Only
If there are two mirrored environments and two registry centers, with a service deployed only on one registry center and not yet deployed on the other, while other applications in both registry centers require this service, the service provider can register the service only to the other registry center without subscribing to the service from the other registry center. This mechanism is typically used in scenarios where the provider is relatively static and unlikely to change, or in scenarios where providers and consumers are mutually independent.

```yaml
dubbo:
  registry:
    subscribe: false
```

## Subscribe Only

To facilitate development and testing, it is common to share a single registry center available for all services in a local environment. In this case, if a service provider being developed registers, it may affect the consumers' normal operation. You can allow the service provider to only subscribe to services (since the developed service may depend on others) without registering the service being developed, by directly connecting to the tested service.

![/user-guide/images/subscribe-only.jpg](/imgs/user/subscribe-only.jpg)

```yaml
dubbo:
  registry:
    register: false
```

## Permission Control
Control permissions through token verification at the registry center to determine whether to issue tokens to consumers, which can prevent consumers from bypassing the registry center to access providers. Additionally, the authorization method can be flexibly changed through the registry center without modifying or upgrading the providers.

![/user-guide/images/dubbo-token.jpg](/imgs/user/dubbo-token.jpg)

Add the following configuration:
```yaml
dubbo:
  provider:
    token: true #UUID
```
or
```yaml
dubbo:
  provider:
    token: 123456
```

## Specify Register Address
When the service provider starts, the Dubbo framework will automatically scan the available network device addresses on the local machine and register one of the valid IP addresses to the registry center. The scanning follows these principles or order:

1. If not connected, return 127.0.0.1
2. In Alibaba Cloud servers, return private addresses, e.g., 172.18.46.234
3. During local testing, return public addresses, e.g., 30.5.10.11

In cases with multiple network devices, Dubbo will randomly choose one. If the registered IP address does not meet expectations, you can specify the address in the following ways.

* Use -D parameters to specify which network card address the framework should read, e.g., `-Ddubbo.network.interface.preferred=eth0`.
* Use system environment variables to specify the IP to report to the registry center, e.g., `DUBBO_IP_TO_REGISTRY=30.5.10.11`

Finally, you can also specify the TCP listening address in the protocol configuration, as the listening address will be defaulted for sending to the registry center
```yaml
dubbo:
  protocol:
    name: dubbo
    port: 20880
    host: 30.5.10.11 # It can also be a domain name, e.g., dubbo.apache.org
```

{{% alert title="Note" color="primary" %}}
The Dubbo framework will default to listening at `0.0.0.0:20880`. If a host is specified, the framework will instead listen at `30.5.10.11:20880`.
{{% /alert %}}

## Startup Checks

### Consumer Address List Check
By default, Dubbo checks during startup whether the dependent services are available. If they are not available (where the address list is empty), it will throw an exception, preventing the application from initializing to identify problems early during the online procedure. The default is `check="true"`.

You can disable the check with `check="false"`. For instance, during testing, some services may not be relevant, or circular dependencies may require one party to start first. Note that if `check="false"` and there are no available addresses at startup, there will always be a normal RPC reference returned, but initiating a call will result in a "No available addresses" exception. The RPC application will become available again when the service address list is restored.

**1. Usage Scenarios**
- Unidirectional Dependency: with dependencies (recommended to keep default settings) and without dependencies (can set `check=false`)
- Mutual Dependency: i.e., circular dependencies (not recommended to set `check=false`)
- Delayed loading handling

> Check is only for startup checking; if there are corresponding dependencies during runtime, an error will still be thrown.

**2. Configuration Method**
```java
@DubboReference(check = false)
private DemoService demoService;
```

```yaml
dubbo:
  consumer:
    check: false
```
### Registry Center Connectivity Check
In addition to checking the consumer-side address list, Dubbo also supports connectivity checks with the registry center. By default, if the provider or consumer cannot connect to the registry center during the startup phase, the process startup will fail.

You can disable the registry center's startup check so that even if the registry center connection fails, the process will continue to start normally. The framework will log all failed registration and subscription actions, and after the registry center connection is restored, it will attempt to re-register and subscribe until all failed events succeed.

```yaml
dubbo:
  registry:
    check: false
```

## Registry Center Cache

When a service attempts to subscribe to addresses at the registry center, the registry center should synchronously return the current available address list. If it fails to read the available address list due to network issues, the framework will query the locally cached registry center addresses and return them (if you do not want to use cached addresses, you can set `check=true` to fail fast and throw an exception). Failed subscription actions will be placed in a retry queue, regularly retrying until successful to ensure that the latest address list can be read promptly after fault recovery.

The default storage path for the registry center cache file is: `${HOME}/.dubbo/dubbo-registry-{application-name}-{address}.cache`, which will be refreshed periodically at certain intervals.

If local file caching is not required, you can disable it using the following configuration:
```yml
dubbo:
  registry:
    file-cache: false
```

## Network Recovery

### Registry Center Network Recovery

When the link between the Dubbo process and the registry center is interrupted, the Dubbo framework will automatically attempt to recover and ensure that after the link is restored, all registered or subscribed services are restored to normal.

### Consumer Side Address Network Recovery

The Dubbo consumer process can automatically track the availability of provider instances through TCP links. When an instance is detected as unavailable, the consumer side will automatically move the unavailable instance to the unavailable address pool to ensure that normal service calls are not affected. Dubbo will automatically detect the blacklisted unavailable address pool, and when the TCP link is restored, automatically remove it from the unavailable address pool.

## Empty Push Protection
Empty push protection is for the consumer side. When empty push protection is enabled, the consumer process will ignore empty address events pushed from the registry center (it will continue to retain the current list of addresses in memory). This is to prevent clearing the registry center's address list in some abnormal scenarios, leading to service call failures.

Empty push protection is disabled by default and can be enabled as follows:
```yaml
dubbo:
  registry:
    enableEmptyProtection: true
```

## Directly Connect to Provider
If your project has service discovery enabled but you want to call a specific IP during testing, you can bypass the service discovery mechanism by setting the target IP address to [direct connection mode](/en/overview/mannual/java-sdk/tasks/framework/more/explicit-target/).

## Problem Diagnosis
Unlike RPC direct connectivity calls from client to server, enabling service discovery often encounters various strange call failure issues. Here are some common problems and troubleshooting methods.

1. **Consumer cannot find available address (No Provider available)**, detailed [specific reasons and troubleshooting steps](/en/overview/mannual/java-sdk/tasks/troubleshoot/no-provider/) are provided here.
2. **Forgot to configure registry center**, starting from 3.3.0, an application can start normally without configuring the registry center address, but any services in the application will not register to the registry center or subscribe to the address list from the registry center.
3. **Cannot connect to the registry center**, if `check=false` is configured, although the process starts successfully, service registration and subscription may not have succeeded.
4. **Consumer reports an error on startup due to no valid address**, you can skip the available address list check by configuring ReferenceConfig; the annotation example is `@DubboReference(check=false)`.

