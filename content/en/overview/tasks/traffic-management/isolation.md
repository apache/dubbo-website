---
type: docs
title: "Temporarily kick out the problem service instance"
linkTitle: "Temporarily kick out the problem service instance"
weight: 5
description: "Temporarily kick out problematic service instances in Dubbo-Admin"
---


Dubbo provides the service management capability of temporarily removing problematic service instances, which can temporarily remove problematic service instances without restarting the application.

Dubbo can temporarily remove problem service instances through XML configuration, annotation configuration, and dynamic configuration. Here we mainly introduce the dynamic configuration method. For other configuration methods, please refer to the old document [Configuration](/zh-cn/docsv2.7/user/configuration/)


## before the start

Please make sure to run Dubbo-Admin successfully

## Background Information

When the service is running online, it is inevitable that some nodes have problems. In order not to affect the normal operation of the overall service, the service instance with the problem needs to be temporarily offline. Dubbo-Admin provides the ability to temporarily remove problematic service instances, which can help you temporarily offline problematic service instances without affecting the operation of the overall service.



## Steps

### Dynamic configuration

1. Log in to the Dubbo-Admin console
2. In the left navigation pane, select Service Governance > Dynamic Configuration.
3. Click the Create button, fill in the rule content in the create dynamic configuration panel, and click Save.



#### Detailed Rules

##### Configuration template

```yaml
---
configVersion: v2.7
scope: application/service
key: app-name/group+service+version
enabled: true
configs:
-  addresses: ["0.0.0.0"]
   providerAddresses: ["1.1.1.1:20880", "2.2.2.2:20881"]
   side: consumer
   applications/services: []
   parameters:
     timeout: 1000
     loadbalance: random
-  addresses: ["0.0.0.0:20880"]
   side: provider
   applications/services: []
   parameters:
     threadpool: fixed
     threads: 200
     iothreads: 4
     dispatcher: all
     weight: 200
...
```

**For the scenario of temporarily kicking out problematic service instances, you only need to clarify the following issues to know how to write the configuration:**

1. Whether you want to modify the configuration of the entire application or a service.
   - Application: `scope: application, key: app-name` (you can also use `services` to specify certain services).
   - Service: `scope: service, key:group+service+version`.
2. The modification is applied to the provider side.
   - Provider: `side: provider`.
3. Whether the configuration takes effect only for certain specific instances.
   - All instances: `addresses: ["0.0.0.0"]` or `addresses: ["0.0.0.0:*"]` depends on the side value.
   - Specified instances: `addersses[list of instance addresses]`.
4. The disabled parameter to be modified.

## Result validation
Select the application related to the temporary removal of the problematic service instance configuration to trigger the call verification.