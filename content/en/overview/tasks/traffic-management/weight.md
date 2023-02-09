---
type: docs
title: "Adjust traffic distribution by weight"
linkTitle: "Adjust traffic distribution by weight"
weight: 5
description: "Adjust traffic distribution by weight in Dubbo-Admin"
---



Dubbo provides the service governance capability of adjusting traffic distribution by weight, and can dynamically adjust traffic distribution by weight without restarting the application.

Dubbo can adjust traffic distribution by weight through XML configuration, annotation configuration, and dynamic configuration. Here we mainly introduce the dynamic configuration method. For other configuration methods, please refer to the old document [Configuration](/zh-cn/docsv2.7/user/configuration/)

## before the start

Please make sure to run Dubbo-Admin successfully


## Background Information

In the case of different machine performance, the load of different machines needs to be evaluated systematically, and some machines need to be downgraded. By adjusting the traffic ratio of the machine by weight, the performance of the machine can be reasonably evaluated.
Certain services will face traffic shocks. In order to ensure the availability of core services, some services need to be downgraded. Adjust traffic distribution by weight to avoid faults caused by traffic impact.


## Steps

### Weight Adjustment

1. Log in to the Dubbo-Admin console
2. In the left navigation bar, select Service Governance > Weight Adjustment.
3. Click the Create button, and in the New Weight Rule panel, fill in the rule content, and then click Save.


#### Detailed Rules


**For the scenario of dynamically adjusting traffic distribution through weight, you only need to clarify the following issues to know how to write the configuration:**

1. Whether you want to modify the configuration of the entire application or a service.
   - Application: `scope: application, key: app-name` (you can also use `services` to specify certain services).
   - Service: `scope: service, key:group+service+version`.
2. Whether the address list configuration takes effect only for some specific instances.
   - All instances: `addresses: ["0.0.0.0"]` or `addresses: ["0.0.0.0:*"]` depends on the side value.
   - Specified instances: `addersses[list of instance addresses]`.
3. The weight to modify.

## Result validation
Select the application related to the weight configuration to trigger the call verification.