---
aliases:
    - /en/docs3-v2/java-sdk/upgrades-and-compatibility/migration-triple/
    - /en/docs3-v2/java-sdk/upgrades-and-compatibility/migration-triple/
    - /en/overview/mannual/java-sdk/upgrades-and-compatibility/migration-triple/
description: "How to smoothly upgrade from the Dubbo protocol to the Triple protocol."
linkTitle: Upgrade to Triple Protocol
title: Upgrade to Triple Protocol
type: docs
weight: 2
---

{{% alert title="Note" color="warning" %}}
* The content of this document is not mandatory for upgrading Dubbo3. You can simply upgrade the framework and continue using the Dubbo communication protocol.
* If you are a new Dubbo user, it is highly recommended to directly [use the Triple protocol](/en/overview/mannual/java-sdk/tasks/protocol/).
{{% /alert %}}

This document is suitable for users whose services are already running on the Dubbo protocol. Please first refer to the previous document [How to Upgrade from Dubbo2 to Dubbo3](../migration/) to complete the framework version upgrade, and then follow these steps for a smooth migration to the Triple protocol with minimal changes.

Here is the architecture diagram for the protocol upgrade, showing the states of different Dubbo applications during a smooth upgrade process:

<img alt="Migration from Dubbo protocol to Triple protocol" style="max-width:800px;height:auto;" src="/imgs/v3/manual/java/migration/dubbo-to-triple.png"/>

In order, the basic upgrade steps are as follows:
1. Provider side configuration for dual-protocol (Dubbo, Triple) publishing on a single port
2. Provider side configuration to set the preferred protocol to Triple (at this time, the provider's registered URL is `dubbo://host:port/DemoService?preferred-protocol=tri`)
3. Consumer upgrade, which can be done in two ways depending on the situation:
	* Upgrade the consumer to version 3.3, which will prioritize calling the Triple protocol based on `preferred-protocol=tri`
	* For consumer applications that cannot upgrade to version 3.3, configure `@DubboReference(protocol="tri")` to call the Triple protocol
4. Push all applications to upgrade to the latest Dubbo3 version so that all traffic uses the Triple protocol

{{% alert title="Note" color="warning" %}}
Please note that the functionalities mentioned above, such as single-port multi-protocol and recognition of the `preferred-protocol` option, require Dubbo 3.3.0+.
{{% /alert %}}

### Step 1: Dual-Protocol Publishing on the Provider Side
Assuming we have the following application configuration, which publishes the Dubbo protocol on port 20880:
```yaml
dubbo:
  protocol:
    name: dubbo
    port: 20880
```

We need to add two configuration items as follows:

```yaml
dubbo:
  protocol:
    name: dubbo
    port: 20880
    ext-protocol: tri
    preferred-protocol: tri
```

Where:
* `ext-protocol: tri` specifies that the Triple protocol is additionally published on the original port 20880, which is single-port dual-protocol publishing.
* `preferred-protocol: tri` will synchronize to the Consumer side with the registration center, informing the consumer to prioritize using the Triple protocol for calls.

{{% alert title="Note" color="warning" %}}
The `preferred-protocol: tri` configuration is only supported in version 3.3.0 and later, so even if the provider configures this option, it will not take effect for consumer clients before version 3.3.0, which will continue to call the Dubbo protocol.
{{% /alert %}}

### Step 2: Switching Protocols on the Consumer Side
After the provider completes the configuration in Step 1 and restarts, the consumer may be in one of the following three states depending on version and configuration:

**1. Consumer is version 3.3.0 or later**

This type of consumer will automatically recognize the `preferred-protocol: tri` tag on the provider's URL. If this tag is found, the consumer will automatically use the Triple protocol to call the service; otherwise, it will continue using the Dubbo protocol.

**2. Consumer is version 2.x or earlier than 3.3.0**

Due to the low version of the Dubbo framework being unable to recognize the `preferred-protocol: tri` parameter, these consumers are not affected by the provider's multi-protocol publishing and will continue to call the Dubbo protocol.

**3. Consumer is version 2.x or earlier than 3.3.0, but explicitly specifies the protocol to call**

Similar to the second case, but users can explicitly specify which RPC protocol to use for certain services, such as:

```java
@DubboReference(protocol="tri")
private DemoService demoService;
```

or

```xml
<dubbo:reference protocol="tri" />
```

After configuring `protocol="tri"`, the service call will use the Triple protocol. It is important to ensure that the provider has already published support for the Triple protocol before configuring `protocol="tri"`; otherwise, the call will fail.

{{% alert title="Note" color="warning" %}}
* From the above three scenarios, the protocol upgrade process is completely transparent to the consumer, which will not experience any communication barriers due to the provider's multi-protocol configuration.
* For consumers, the simplest way to switch protocols is to automatically switch via `preferred-protocol=tri`, which requires both sides to be upgraded to 3.3.0+.
{{% /alert %}}

### Step 3: Fully Converging to the Triple Protocol
Steps 1 and 2 are very straightforward and ensure a smooth process. Through single-port dual-protocol and automatic switching on the consumer side, the entire upgrade process is ensured to be smooth.

Smooth upgrading means we will go through an intermediate state where both the Dubbo and Triple protocols coexist for a certain period, meaning some service communications are done using the Dubbo protocol while others use the Triple protocol. How can we promote achieving the end goal, which is for all service calls to use the Triple protocol? We recommend using the following two methods to achieve this goal:
* Transition all Dubbo applications in the cluster to the latest 3.3.x version so that consumers can automatically switch to the Triple protocol.
* Observe whether a certain application (acting as a provider) is still handling Dubbo traffic through the metrics logging of the Dubbo framework and govern the upstream and downstream of these applications.

{{% alert title="Note" color="info" %}}
For the Dubbo framework, the coexistence of the Dubbo and Triple protocols in the cluster does not pose any technical issues. It is normal for different service calls to use different protocols; thus, the intermediate state of dual-protocol coexistence is entirely acceptable. However, sometimes for the sake of overall solution unity, we may need to achieve a final goal of a single communication protocol.
{{% /alert %}}

