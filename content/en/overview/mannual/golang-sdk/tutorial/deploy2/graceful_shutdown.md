---
aliases:
    - /en/docs3-v2/golang-sdk/tutorial/governance/traffic/graceful_shutdown/
    - /en/docs3-v2/golang-sdk/tutorial/governance/traffic/graceful_shutdown/
description: This article primarily introduces the basic steps and usage instructions for graceful shutdown.
keywords: Graceful Shutdown
title: Graceful Shutdown
type: docs
---

# Graceful Shutdown

## Background

In a stable production environment, container scheduling is fully managed by k8s, and microservice governance is maintained and managed by the service framework or operations personnel. In scenarios like releasing a new version or scaling up/down, old container instances will be terminated and replaced with new ones. If this replacement process is not handled properly in high-traffic online production environments, it can lead to a large number of erroneous requests in a short time, triggering alarms and even affecting normal business operations. For larger organizations, the losses from issues during the release process can be enormous. Hence, the need for graceful shutdown has arisen. This requires the service framework to provide stable guarantees during the service offline process on top of stable service invocation and traditional service governance capabilities, thus reducing operational costs and improving application stability.

## Feature Description

In a complete RPC call process, intermediate services often act as both service providers and consumers. After receiving a request from the upstream service, the intermediate service processes the request and returns the result to the upstream service, and then calls the downstream service's interface as needed. Therefore, the graceful shutdown function needs to ensure stability on both the service provider and consumer sides, which can be broken down into the following steps:

1. Unregister from the registry, destroying the service information registered in the registry.
2. As a service provider, wait for a period to ensure that the client successfully updates service information and completes upstream task processing, then refuse to accept new requests.
3. As a service consumer, wait for a period to ensure that requests to the downstream service receive a response, then cancel the subscription to the registry.
4. Destroy references to downstream tasks and ports exposed for service provision.
5. Execute the user's custom callback operations.

By following these steps, it ensures that the dubbo-go service instance stops safely and smoothly, without impacting ongoing business.

> Note: Canceling the subscription to the registry cannot be performed in step 1, as changes to downstream service information may occur when the intermediate service sends requests to the downstream service.

## Usage Scenarios

Stop the dubbo-go instance using the ` kill pid ` command.

## Usage

The following are configurable settings that users can customize in the yaml configuration file:

- As a service provider, the dubbo-go instance needs to wait for the client to successfully update service information during the offline period. This time corresponds to the `consumer-update-wait-time` field in the configuration, defaulting to 3s.
- As a service provider, if requests from upstream tasks are not yet processed, it needs to wait for them to complete. As a service consumer, it must wait for responses to downstream requests. This time corresponds to the `step-timeout` field, defaulting to 3s.
- As a service provider, if requests from upstream tasks are already processed, it needs to wait for a window time. If no new requests are received during this time, proceed with subsequent steps. This corresponds to the `offline-request-window-timeout` field, defaulting to 0s.
- Users can customize whether to enable graceful shutdown functionality; this corresponds to the `internal-signal` field in the configuration, which is enabled by default.
- The dubbo-go instance may freeze during graceful shutdown due to exceptions. A timeout can be configured in the settings to forcibly close the instance after this time. This corresponds to the `timeout` field, defaulting to 60s.

```yaml
dubbo:
  shutdown:
    timeout:60
    step-timeout:3
    consumer-update-wait-time:3
    internal-signal:true
    offline-request-window-timeout:0
```

Additionally, if users wish to execute custom callback operations after the offline logic is completely finished, they can use the following code:

```go
extension.AddCustomShutdownCallback(func() {
	// User defined operations
})
```

## References

[【Dubbo-go Elegant Up and Down Design and Practice】](https://developer.aliyun.com/article/860775)

