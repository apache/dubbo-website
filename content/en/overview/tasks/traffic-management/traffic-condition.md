---
type: docs
title: "Traffic Isolation"
linkTitle: "Traffic Isolation"
weight: 5
description: "Dynamic traffic isolation in Dubbo-Admin"
---

Dubbo provides the service management capability of dynamic traffic isolation, which can dynamically isolate traffic without restarting the application.

Dubbo can implement traffic isolation through XML configuration, annotation configuration, and dynamic configuration. Here we mainly introduce the dynamic configuration method. For other configuration methods, please refer to the old document [Configuration](/zh-cn/docsv2.7/user/configuration/)

## before the start

Please make sure to run Dubbo-Admin successfully

## Background Information

If multiple versions of an application run simultaneously online and are deployed in different environments, such as daily environments and special environments, you can use label routing to isolate the traffic of different versions in different environments, and the order traffic of flash sales or orders from different channels Routing to special environments, routing normal traffic to everyday environments. Even if the special environment is abnormal, the traffic that should have entered the special environment will not enter the daily environment, and will not affect the use of the daily environment.


## Steps

### Label Routing

1. Log in to the Dubbo-Admin console
2. In the left navigation pane, select Service Governance > Label Routing.
3. Click the Create button, and in the Create New Tag Rule pane, fill in the rule content, and then click Save.

#### Detailed Rules

##### Configuration template

```yaml
---
   force: false
   runtime: true
   enabled: true
   key: governance-tagrouter-provider
   tags:
     - name: tag1
       addresses: ["127.0.0.1:20880"]
     - name: tag2
       addresses: ["127.0.0.1:20881"]
  ...
```

**For the traffic isolation scenario, you only need to clarify the following issues to know how to write the configuration:**

1. To modify the configuration of the provider application to which the service belongs.
   - Application: `scope: application, key: app-name` (you can also use `services` to specify certain services).
2. When the routing result is empty, whether to force return.
   - force=false: When the routing result is empty, downgrade the provider whose tag is empty.
   - force=true: When the routing result is empty, an exception will be returned directly.
3. Priority of routing rules
   - priority=1: The priority of routing rules, used for sorting, the higher the priority, the higher the execution, it can be left blank, the default is 0.
4. Whether the configuration takes effect only for certain specific instances.
   - All instances: `addresses: ["0.0.0.0"]` or `addresses: ["0.0.0.0:*"]` depends on the side value.
   - Specified instances: `addersses[list of instance addresses]`.
5. The tag name to modify.

## Result validation
Select the application related to the traffic isolation configuration to trigger the call verification.