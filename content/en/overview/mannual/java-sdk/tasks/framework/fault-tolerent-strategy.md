---
aliases:
    - /en/docsv2.7/user/examples/fault-tolerent-strategy/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/service/fault-tolerent-strategy/
description: Fault tolerance solutions provided by Dubbo when cluster calls fail
linkTitle: Cluster Fault Tolerance (Retry)
title: Cluster Fault Tolerance
type: docs
weight: 8
---

## Background
When cluster calls fail, Dubbo provides various fault tolerance solutions, with failover retry as the default.

![cluster](/imgs/user/cluster.jpg)

Node relationships:

* Here, `Invoker` is an abstraction of a callable `Service` of `Provider`, encapsulating the `Provider` address and `Service` interface information.
* `Directory` represents multiple `Invokers`, which can be viewed as `List<Invoker>`, but unlike `List`, its values may change dynamically, such as changes pushed by the registry.
* `Cluster` disguises multiple `Invokers` in `Directory` as a single `Invoker`, transparent to the upper layer, involving fault tolerance logic; if a call fails, it retries another.
* `Router` selects a subset from multiple `Invokers` based on routing rules, such as read-write separation and application isolation.
* `LoadBalance` selects a specific `Invoker` for the current call from multiple `Invokers`, involving load balancing algorithms; if a call fails, it needs to reselect.

## Cluster Fault Tolerance Modes

You can extend the cluster fault tolerance strategy. See: [Cluster Extension](../../../dev/impls/cluster)

### Failover Cluster

Automatically switches on failure, retrying other servers. Typically used for read operations, but retries introduce longer delays. The retry count can be set with `retries="2"` (excluding the first attempt).

Retry count configuration:

```xml
<dubbo:service retries="2" />
```

or

```xml
<dubbo:reference retries="2" />
```

or

```xml
<dubbo:reference>
    <dubbo:method name="findFoo" retries="2" />
</dubbo:reference>
```

{{% alert title="Tip" color="primary" %}}
This configuration is the default configuration.
{{% /alert %}}

### Failfast Cluster

Fast failure, initiating only one call, error on failure immediately. Typically used for non-idempotent write operations, such as adding records.

### Failsafe Cluster

Safe failure, directly ignoring exceptions. Typically used for writing audit logs and similar tasks.

### Failback Cluster

Automatic recovery from failure, recording failed requests and resending them at intervals. Typically used for message notification operations.

### Forking Cluster

Parallel calls to multiple servers, returning as soon as one succeeds. Typically used for read operations with high real-time requirements but requires more service resources. The maximum parallel number can be set with `forks="2"`.

### Broadcast Cluster

Broadcast calls to all providers, calling them one by one; if any one fails, it reports an error. Typically used to notify all providers to update local resources like caches or logs.

In a broadcast call, you can configure the proportion of node call failures with broadcast.fail.percent. When this proportion is reached, the BroadcastClusterInvoker will stop calling other nodes and throw an exception directly. The value of broadcast.fail.percent ranges from 0 to 100. By default, an exception is only thrown when all calls fail. The broadcast.fail.percent parameter takes effect in versions 2.7.10 and above.

Broadcast Cluster configuration for broadcast.fail.percent.

broadcast.fail.percent=20 means that an exception will be thrown when 20% of the nodes fail, with no further calls to other nodes.

```text
@reference(cluster = "broadcast", parameters = {"broadcast.fail.percent", "20"})
```

{{% alert title="Tip" color="primary" %}}
Supported since `2.1.0`
{{% /alert %}}

### Cluster Mode Configuration

Configure the cluster mode as follows on both the service provider and consumer sides.

```xml
<dubbo:service cluster="failsafe" />
```

or

```xml
<dubbo:reference cluster="failsafe" />
```

