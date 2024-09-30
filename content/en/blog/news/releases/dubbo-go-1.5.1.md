---
title: "Dubbo Go 1.5.1"
linkTitle: "dubbo-go 1.5.1"
date: 2021-6-12
weight: 60
description: >
    The Dubbo-go team recently released Dubbo-go v1.5.1, which is the Go implementation of the Apache Dubbo project.
---

We recently released dubbo-go v1.5.1. Although it is a sub-version of v1.5, the community has invested significant effort compared to v1.5.0 to add the following major improvements.

## 1 Application Dimension Registration Model

After the new model release, we found that each URL published by the Provider registers a ServiceInstance, impacting performance and requiring optimization.

Our optimization approach is:

Removing the code that registers the ServiceInstance in ServiceDiscoveryRegistry and registering the ServiceInstance at the end of the loadProviderConfig method in config_loader.

Specific steps:
1. Retrieve all registered Registries, filter out ServiceDiscoveryRegistry, and get all ServiceDiscoveries.
2. Create ServiceInstance.
3. Each ServiceDiscovery registers the ServiceInstance.

Ensure that the Provider exposes metadata information only after successful registration.

## 2 Support for Seata-based Transactions

Extension implemented based on Seata. By adding filters, the server can receive xid and combine with [seata-golang](https://github.com/seata-golang/seata-golang) to support distributed transactions. This allows Dubbo-go to offer users more choices and adapt to various personalized scenarios in distributed settings.

In dubbo-samples, we provided [transaction test cases](https://github.com/apache/dubbo-go-samples/tree/1.5/seata).

## 3 Multi-Registry Cluster Load Balancing

For scenarios with subscriptions from multiple registries, an additional layer of load balancing among the registry clusters is introduced:

At the Cluster Invoker level, the supported selection strategies are:

- Specified priority
- Same zone priority
- Weighted round-robin

## 4 Security of Transmission Link

This version attempts to enhance the security of the transmission link, providing a TLS-based secure link transmission mechanism for the built-in Dubbo getty Server.

To ensure flexibility in application startup, the specification of the TLS Cert is done via configuration files. Please refer to the Dubbo-go configuration reading rules and TLS examples for more details.

## 5 Enhanced Routing Functionality

This routing functionality mainly supports dynamic tag routing and application/service-level conditional routing.

### 5.1 Dynamic Tag Routing

Tag routing isolates traffic within specified groups by grouping one or more service providers together, thus achieving traffic isolation, which can serve as a foundational capability for blue-green releases and gray releases.

Tags refer to the grouping of Provider application instances, with two ways to complete instance grouping: `dynamic rule tagging` and `static rule tagging`, where dynamic rules take precedence over static rules. In case of conflict when both rules coexist, the dynamic rule prevails.

#### 5.1.1 Dynamic Rule Tagging

Tag grouping rules can be issued anytime from the [service governance console](/en/docsv2.7/user/examples/routing-rule/).

```yaml
# governance-tagrouter-provider application adds two tag groups tag1 and tag2
# tag1 includes one instance 127.0.0.1:20880
# tag2 includes one instance 127.0.0.1:20881
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

#### 5.1.2 Static Rule Tagging

Can be set in the tag field of the server configuration file.

```yaml
services:
  "UserProvider":
    registry: "hangzhouzk"
    protocol : "dubbo"
    interface : "com.ikurento.user.UserProvider"
    loadbalance: "random"
    warmup: "100"
    tag: "beijing"
    cluster: "failover"
    methods:
    - name: "GetUser"
      retries: 1
      loadbalance: "random"
```

The consumer adds tag to the attachment. 

```go
ctx := context.Background()
attachment := make(map[string]string)
attachment["dubbo.tag"] = "beijing"
ctx = context.WithValue(ctx, constant.AttachmentKey, attachment)
err := userProvider.GetUser(ctx, []interface{}{"A001"}, user)
```

The request tag's scope is for each invocation, using attachment to pass request tags, and the value stored in attachment will persist throughout a complete remote call. Thanks to this characteristic, we only need one line of code to set it for continuous tag transmission.

#### 5.1.3 Rule Explanation

##### Format

- `Key` clarifies which application the rule applies to. **Required**.
- `enabled=true` whether this routing rule is effective, optional, defaults to effective.
- `force=false` whether to enforce execution when the routing result is empty; if not enforced, routing rules with empty routing results will automatically become invalid, optional, defaults to `false`.
- `runtime=false` whether to execute routing rules on each call; if not, it will execute the rules only when the provider address list changes and cache the results, retrieving the routing results directly from the cache during the call. If parameter routing is used, it must be set to `true`; be aware that this can affect call performance, optional, defaults to `false`.
- `priority=1` determines the routing rule's priority for sorting, with a higher priority executed first, optional, defaults to `0`.
- `tags` defines the specific tag group content, allowing for the definition of any n (n>=1) tags and specifying instance lists for each tag. **Required**
- - name, tag name
- addresses, the instance list contained within the current tag

##### Degradation Convention

1. When `dubbo.tag=tag1`, providers marked with `tag=tag1` are prioritized. If no corresponding service exists for the requested tag in the cluster, the request defaults to a provider without tags; to change this default behavior to throw an exception when unable to find a matching provider for tag1, set `dubbo.force.tag=true`.
2. When `dubbo.tag` is not set, it will only match providers without tags. Even if available services exist in the cluster, mismatched tags will prevent invocation. This is different from convention 1, where tagged requests can degrade to access untagged services, but requests not carrying tags or carrying other types of tags can never access services with distinct tags.

### 5.2 Application/Service Level Conditional Routing

Multiple conditional routings and their granularities can be configured in the routing rule configuration.

Sample:

```yaml
# dubbo router yaml configure file
routerRules: 
  - scope: application
    key: BDTService
    priority: 1
    enable: false
    force: true
    conditions : ["host = 192.168.199.208 => host = 192.168.199.208 "]
  - scope: service
    key: com.ikurento.user.UserProvider
    priority: 1
    force: true
    conditions : ["host = 192.168.199.208 => host = 192.168.199.208 "]
```

#### 5.2.1 Rule Explanation

##### Meaning of Each Field

- Scope indicates the granularity of the routing rule, which determines the key's value. Required.
- - service service granularity
- application application granularity
- `Key` clarifies which service or application the rule applies to. Required.
- - When scope=service, key's value must be a combination of [{group}/]{service}[:{version}].
- When scope=application, key's value is the application name.
- `enabled=true` whether the current routing rule is effective, optional, defaults to effective.
- `force=false` whether to enforce execution when the routing result is empty; if not enforced, the routing rule with an empty result automatically becomes invalid, optional, defaults to false.
- `runtime=false` whether to execute routing rules on every call; if not, it will execute and cache results only when the provider address list changes, retrieving routing results from cache during the call. If parameter routing is utilized, it must be set to true; be cautious as this may affect call performance, optional, defaults to false.
- `priority=1` the priority of the routing rule for sorting, with higher priorities executed first, optional, defaults to 0.
- `conditions` defines the specific content of routing rules. Required.

## 6 Review and Outlook

Dubbo-go is in a stable and mature state. The new version is currently experimenting with cloud-native directions, with application service dimension registration being the first feature launched, representing a completely new registration model. This version is a key step towards cloud-native development. Additionally, it includes some previously mentioned optimizations.

The next version, v1.5.2, will focus on improvements to the communication model, alongside compatibility, usability, and quality assurance with 2.7.x.

In **service discovery**, more methods will be supported, such as: file, Consul. This will give users more options in service discovery scenarios and allow for more personalized scenarios.

Additionally, **usability and quality assurance** mainly focus on samples and automated build parts, reducing the difficulty for users to get started with Dubbo-go and improving code quality.

The next version is under active development, with specific planning and task lists[^1] already reflected on GitHub.

[^1]: https://github.com/apache/dubbo-go/projects/10 

