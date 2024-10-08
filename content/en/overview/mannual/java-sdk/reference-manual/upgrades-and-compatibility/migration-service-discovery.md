---
aliases:
    - /en/docs3-v2/java-sdk/upgrades-and-compatibility/service-discovery/service-discovery-samples/
    - /en/docs3-v2/java-sdk/upgrades-and-compatibility/service-discovery/service-discovery-samples/
    - /en/overview/mannual/java-sdk/upgrades-and-compatibility/service-discovery/
description: This article specifically explains how users can quickly enable the new application-level service discovery feature after upgrading to Dubbo 3, transitioning smoothly from interface-level service discovery to application-level service discovery.
linkTitle: Upgrade to Application-Level Service Discovery
title: Upgrade to Application-Level Service Discovery
type: docs
weight: 3
---

{{% alert title="Note" color="warning" %}}
* The contents of this document are not mandatory for upgrading to Dubbo 3. You can absolutely just upgrade the framework and use the [default behavior of the framework's service discovery](/en/overview/mannual/java-sdk/reference-manual/upgrades-and-compatibility/migration-service-discovery/).
* This document is more suitable for old Dubbo 2 users to understand the transition process and working principle of the service discovery model in the framework after upgrading to Dubbo 3. New users should directly [configure to enable application-level service discovery](/en/overview/mannual/java-sdk/tasks/service-discovery/nacos/).
{{% /alert %}}

For old Dubbo 2 users, there are two choices when upgrading to Dubbo 3, and the only consideration for the decision is performance.
1. If your cluster size is not large, and you have not encountered any performance issues such as address pushing while using Dubbo 2, you can continue using interface-level service discovery.
2. If your cluster size is larger and you have encountered issues such as spike in service discovery load while using Dubbo 2, it is recommended to migrate to the new application-level service discovery.

Based on the above decision-making conclusions, please adjust the following configuration when upgrading the Dubbo 3 framework.

## Continue Using Interface-Level Service Discovery

When upgrading to the Dubbo 3 framework, you need to adjust the application configuration as follows (this is just a configuration adjustment, provider applications must be configured, consumer applications are optional):

```xml
<dubbo:application name="xxx" register-mode="interface">
```

or

```yaml
dubbo:
 application:
   name: xxx
   register-mode: interface #indicates continuing to use the old version service discovery model, optional values are interface, instance, all
```

Alternatively, the above is a global default configuration, and can be configured separately for each registration center.

```xml
<dubbo:registry address="nacos://localhost:8848" register-mode="interface">
```

or

```yaml
dubbo:
 registry:
   address: nacos://localhost:8848
   register-mode: interface #indicates continuing to use the old version service discovery model, optional values are interface, instance, all
```

## Enable Application-Level Service Discovery (Default)
For old users, if you want to enable application-level service discovery, a smooth migration process is required. At this point, the newly upgraded Dubbo 3 application needs to perform dual registration and dual subscription (this is the default behavior of the current framework, so users do not need to modify any configuration; the following content will happen automatically. Note: Future versions may switch to single registration and single subscription at the application level) to ensure that both old and new service discovery models can be accommodated.

{{% alert title="Note" color="warning" %}}
For new users, you can directly configure `dubbo.application.register-mode=instance`, which means configuring to use only application-level service discovery from the beginning.
{{% /alert %}}

### Provider Registration Behavior
By default, the Dubbo 3 framework will register both interface-level and application-level service discovery addresses simultaneously, allowing both new and old applications in the cluster to discover this application address and initiate calls properly. As shown in the figure below:

<img alt="dubbo application-level service discovery" style="max-width:800px;height:auto;" src="/imgs/v3/migration/provider-registration.png"/>

### Consumer Subscription Behavior
By default, the Dubbo 3 framework has the capability to discover both Dubbo 2 and Dubbo 3 address lists simultaneously. By default, if there are Dubbo 3 addresses available for consumption in the cluster, it will automatically consume Dubbo 3 addresses; if there are no new addresses, it will automatically consume Dubbo 2 addresses (Dubbo 3 provides a switch to control this behavior), as illustrated in the figure below:

<img alt="dubbo application-level service discovery" style="max-width:800px;height:auto;" src="/imgs/v3/migration/consumer-subscription.png"/>

