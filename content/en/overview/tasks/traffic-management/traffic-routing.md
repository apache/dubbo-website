---
type: docs
title: "Request Routing"
linkTitle: "Request Routing"
weight: 5
description: "Routing according to request conditions in Dubbo-Admin"
---

Dubbo provides the service governance capability of dynamically creating conditional routing, which can route according to the request initiator and method without restarting the application.

Dubbo can implement dynamic routing according to request conditions through XML configuration, annotation configuration, and dynamic configuration. Here we mainly introduce the dynamic configuration method. For other configuration methods, please refer to the old document [Configuration](/zh-cn/docsv2.7/user/configuration/)

## before the start

Please make sure to run Dubbo-Admin successfully

## Background Information

In business scenarios such as black and white lists, excluding pre-release machines, exposing only some machines, and isolation by environment, routing rules are required to filter the target server address before initiating an RPC call, and the filtered address is used as the candidate address for the final RPC call. Dubbo-Admin provides conditional routing capabilities, which can help you configure routing rules to meet business scenarios.

## Steps

### Conditional Routing

1. Log in to the Dubbo-Admin console
2. In the left navigation pane, select Service Governance > Conditional Routing.
3. Click the Create button, in the Create New Routing Rule panel, fill in the rule content, and then click Save.


#### Detailed Rules

##### Configuration template

```yaml
---
scope: application/service
force: true
runtime: true
enabled: true
key: app-name/group+service+version
conditions:
   - application=app1 => address=*:20880
   - method=sayHello => address=*:20880
```

**For conditional routing scenarios, you only need to clarify the following questions to know how to write the configuration:**

1. To modify the configuration of the consumer application or the configuration of a service.
   - Application: `scope: application, key: app-name` (you can also use `services` to specify certain services).
   - Service: `scope: service, key:group+service+version`.
2. When the routing result is empty, whether to force return.
   - force=false: When the routing result is empty, downgrade the provider whose tag is empty.
   - force=true: When the routing result is empty, an exception will be returned directly.
3. Priority of routing rules
   - priority=1: The priority of routing rules, used for sorting, the higher the priority, the higher the execution, it can be left blank, the default is 0.
4. Whether the configuration takes effect only for certain specific instances.
   - All instances: `addresses: ["0.0.0.0"]` or `addresses: ["0.0.0.0:*"]` depends on the side value.
   - Specified instances: `addersses[list of instance addresses]`.
5. The condition rule to modify.
   - => The previous one is the consumer matching condition. All parameters are compared with the consumer’s URL. When the consumer meets the matching condition, the subsequent filtering rules are executed for the consumer.
   - => After that, it is the filter condition of the provider's address list. All parameters are compared with the provider's URL, and consumers only get the filtered address list in the end.
   - If the matching condition is empty, it means to apply to all consumers, such as: => host != 10.20.153.11
   - If the filter condition is empty, access is prohibited, such as: host = 10.20.153.10 =>

## Result validation
Select the application related to the conditional routing configuration to trigger the call verification.