---
type: docs
title: "Same computer room/area priority"
linkTitle: "Same computer room/area priority"
weight: 5
description: "Dynamic configuration in Dubbo-Admin The priority of the same computer room/area"
---

Dubbo provides the service management capability of dynamically configuring the priority of the same computer room/region, and can dynamically configure the priority of the same computer room/region without restarting the application.

Dubbo can be configured through XML, annotation configuration, and dynamic configuration in the same computer room/area first. Here we mainly introduce the dynamic configuration method. For other configuration methods, please refer to the old document [Configuration](/zh-cn/docsv2.7/user/configuration/)

## before the start

Please make sure to run Dubbo-Admin successfully

## Background Information

When applications are deployed in multiple different computer rooms/regions, cross-region calls will occur between applications, and cross-region calls will increase the response time. Priority in the same computer room/area means that when an application invokes a service, the service provider in the same computer room/area is called first. Dubbo-Admin provides a dynamic same-computer room/region priority capability, which can help you quickly and dynamically configure the same-computer room/region priority, avoiding network delays caused by cross-regions, thereby reducing call response time.


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

**For the same computer room/area priority scenario, you only need to clarify the following questions to know how to write the configuration:**

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
Select the application related to the priority configuration of the same computer room/area to trigger the call verification.