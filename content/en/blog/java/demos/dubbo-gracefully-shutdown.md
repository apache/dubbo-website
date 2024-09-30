---
title: "Dubbo Graceful Shutdown"
linkTitle: "Dubbo Graceful Shutdown"
tags: ["Java"]
date: 2018-08-14
description: > 
    This article introduces the principles and usage of Dubbo graceful shutdown.
---

## Background

For any online application, ensuring that clients are unaware during service update deployments is a problem that developers must solve. That is, the stage from application stop to restart must not impact normal business requests. Ideally, performing updates when there are no requests is the safest and most reliable. However, internet applications must ensure availability, making it necessary to optimize the application update process to ensure service integrity during updates.

The traditional solution is to manually divide the application update process into three steps: remove traffic, stop the application, and restart after updating. This approach is simple and effective but has many limitations: it requires gateway support to remove traffic and requires manual judgment before stopping the application to ensure in-flight requests are handled. This need for manual intervention leads to high operational complexity and is only suitable for smaller applications, making it impractical for large-scale systems.

Thus, providing some automatic mechanism at the container/framework level to remove traffic and ensure that incoming requests are handled would greatly enhance operational efficiency during application updates while ensuring business continuity.

This mechanism is called graceful shutdown, currently provided by containers/frameworks such as Tomcat/Undertow/Dubbo. Here is a more formal definition: graceful shutdown refers to a series of operations performed to ensure the application closes normally. These operations often include waiting for existing requests to complete, closing threads, shutting down connections, and releasing resources. Graceful shutdown can avoid data anomalies or losses caused by abnormal program closures, as well as application exceptions. Essentially, graceful shutdown is some additional processing code executed before the JVM is about to close.

## Applicable Scenarios

- JVM actively shutting down (`System.exit(int)`);
- JVM exiting due to resource issues (`OOM`);
- Application receiving `SIGTERM` or `SIGINT` signals.

## Configuration

### Graceful Shutdown for Services
In Dubbo, graceful shutdown is enabled by default, with a wait time of 10,000 milliseconds. The wait time can be modified by configuring `dubbo.service.shutdown.wait`.

For example, to set the wait time to 20 seconds, you can achieve this by adding the following configuration:

```shell
dubbo.service.shutdown.wait=20000
```

### Graceful Shutdown for Containers
When using container methods like `org.apache.dubbo.container.Main` to use Dubbo, graceful shutdown can also be enabled by setting `dubbo.shutdown.hook` to `true`.

### Graceful Online and Offline via QOS

The graceful shutdown based on the `ShutdownHook` method cannot ensure that all shutdown processes are executed completely, so Dubbo has introduced a multi-step shutdown method to ensure complete service integrity.

Multi-step shutdown divides the stopping application into multiple steps, ensuring that every phase of the script can be executed either through operational automation scripts or manual operations.

Before shutting down the application, first, use the QOS `offline` command to take all services offline, then wait for a period to ensure that all incoming requests are processed. Since the service is offline in the registry, the current application will not receive new requests. At this point, executing the actual shutdown (`SIGTERM` or `SIGINT`) process can ensure service integrity.

QOS can be used via telnet or HTTP, for specific methods see [Dubbo-QOS command usage instructions](/en/docsv2.7/user/references/qos/).

## Process

After the Provider receives the shutdown command,

- Unregister all services from the registry;
- Cancel monitoring of dynamic configurations from the configuration center;
- Send read-only events to all connected clients, stopping the acceptance of new requests;
- Wait for a period to process incoming requests, then close the request processing thread pool;
- Disconnect all client connections.

After the Consumer receives the shutdown command,

- Reject new incoming requests and directly return call exceptions;
- Wait for currently sent requests to complete; if the response times out, forcibly close the connection.

When running Dubbo in container mode, a series of resource release and cleanup operations can be performed before the container is prepared to exit.

For instance, when using SpringContainer, Dubbo's ShutdownHook thread executes the `stop` and `close` methods of `ApplicationContext`, ensuring the complete lifecycle of beans.

## Implementation Principles

1. When loading the class `org.apache.dubbo.config.AbstractConfig`, the `org.apache.dubbo.config.DubboShutdownHook` registers a ShutdownHook with the JVM.

   ```java
   /**
    * Register the ShutdownHook
    */
   public void register() {
       if (!registered.get() && registered.compareAndSet(false, true)) {
           Runtime.getRuntime().addShutdownHook(getDubboShutdownHook());
       }
   }
   ```

2. Each ShutdownHook is a separate thread triggered by the JVM upon exit to execute `org.apache.dubbo.config.DubboShutdownHook`.

   ```java
   /**
    * Destroy all the resources, including registries and protocols.
    */
   public void doDestroy() {
       if (!destroyed.compareAndSet(false, true)) {
           return;
       }
       // destroy all the registries
       AbstractRegistryFactory.destroyAll();
       // destroy all the protocols
       destroyProtocols();
   }
   ```

3. First, close all registries, which includes:
   - Unregister all published services from the registry;
   - Cancel subscriptions for all services depended on by the current application;
   - Disconnect from the registry.
4. Execute `destroy()` for all `Protocols`, mainly including:
   - Destroy all `Invokers` and `Exporters`;
   - Shutdown the server, sending read-only events to all connected clients;
   - Close exclusive/shared clients, disconnect, and cancel timeout and retry tasks;
   - Release all related resources.
5. After finishing, shutdown the JVM.

## Precautions

- Using `SIGKILL` to close an application will not execute graceful shutdown;
- Graceful shutdown does not guarantee that all sent/incoming requests will be waited on to complete;
- The configured graceful shutdown wait time `timeout` is not the sum of wait times for all steps but is the maximum time for each `destroy` execution. For example, if the wait time is configured to 5 seconds, then steps like closing the server and stopping clients will each wait for 5 seconds.

