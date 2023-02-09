---
type: docs
title: "Dynamic adjustment of service timeout"
linkTitle: "Dynamic adjustment of service timeout"
weight: 5
description: "Dynamic adjustment of service timeout in Dubbo-Admin"
---



Dubbo provides the service governance capability of dynamically adjusting the timeout period, which can dynamically adjust the service timeout period without restarting the application.

Dubbo can dynamically adjust the timeout time through XML configuration, annotation configuration, and dynamic configuration. Here we mainly introduce the dynamic configuration method. For other configuration methods, please refer to the old document [Configuration](/zh-cn/docsv2.7/user/configuration/)

## before the start

Please make sure to run Dubbo-Admin successfully

## Background Information

Various timeout configurations are encountered in daily work. After the business logic is changed, the existing call relationship may need to be adjusted continuously with the development of the business, and the change of the response time of the corresponding service interface may not be determined until it goes online. Dubbo-Admin provides a dynamic timeout configuration capability, which can help you quickly and dynamically adjust the interface timeout time to improve service availability.



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

**For the scenario of dynamically adjusting the timeout time, you only need to clarify the following issues to know how to write the configuration:**

1. Whether you want to modify the configuration of the entire application or a service.
   - Application: `scope: application, key: app-name` (you can also use `services` to specify certain services).
   - Service: `scope: service, key:group+service+version`.
2. Whether the modification is applied to the consumer or the provider.
   - Consumer: `side: consumer`, when acting on the consumer side, you can further use `providerAddress`, `applications` to select a specific provider example or application, if you configure the consumer and provider at the same time, the consumer will override provider.
   - Provider: `side: provider`.
3. Whether the configuration takes effect only for certain specific instances.
   - All instances: `addresses: ["0.0.0.0"]` or `addresses: ["0.0.0.0:*"]` depends on the side value.
   - Specified instances: `addersses[list of instance addresses]`.
4. The timeout period to be modified.

## Result validation
Select the application related to the timeout configuration to trigger the call verification.