---
type: docs
title: "Routing Rules"
linkTitle: "Routing Rules"
weight: 33
description: "Service governance through routing rules in Dubbo"
---

Routing rules play a role in filtering the address of the target server before initiating an RPC call, and the filtered address list will be used as an alternative address for the consumer to finally initiate an RPC call.

- Conditional routing. Supports configuring routing rules at the granularity of services or consumer applications.
- Label routing. Configure routing rules at the granularity of Provider applications.

In the future, we plan to continue to enhance the script routing function based on the 2.6.x version.

## Conditional Routing

You can write routing rules in the service management console [Dubbo-Admin](https://github.com/apache/dubbo-admin) at any time

### Introduction

- Application granularity

  ```yaml
  # The consumer of app1 can only consume all service instances with port 20880
  # The consumers of app2 can only consume all service instances with port 20881
  ---
  scope: application
  force: true
  runtime: true
  enabled: true
  key: governance-conditionrouter-consumer
  conditions:
    - application=app1 => address=*:20880
    - application=app2 => address=*:20881
  ...
  ```

- Service Granularity

  ```yaml
  # The sayHello method of DemoService can only consume all service instances with port 20880
  # The sayHi method of DemoService can only consume all service instances with port 20881
  ---
  scope: service
  force: true
  runtime: true
  enabled: true
  key: org.apache.dubbo.samples.governance.api.DemoService
  conditions:
    - method=sayHello => address=*:20880
    - method=sayHi => address=*:20881
  ...
  ```



### Detailed rules

#### The meaning of each field

- `scope` indicates the granularity of routing rules, and the value of scope will determine the value of key. **Required**.
  - service service granularity
  - application application granularity
- `Key` specifies which service or application the rule body acts on. **Required**.
  - When scope=service, the key value is a combination of [{group}:]{service}[:{version}]
  - When scope=application, the key value is the application name
- `enabled=true` Whether the current routing rule is valid, it can be left blank, and it is valid by default.
- `force=false` When the routing result is empty, whether to enforce it, if not enforced, the routing rule with an empty routing result will automatically fail, you can leave it blank, the default is `false`.
- Whether `runtime=false` executes the routing rules every time it is called, otherwise it only pre-executes and caches the results when the provider address list changes, and directly obtains the routing results from the cache when calling. If parameter routing is used, it must be set to `true`. It should be noted that the setting will affect the performance of the call. It can be left blank. The default is `false`.
- `priority=1` is the priority of routing rules, used for sorting, the higher the priority, the higher the execution, it can be left blank, the default is `0`.
- `conditions` defines specific routing rule content. **Required**.

#### Conditions rule body

    The `conditions` part is the main body of the rule, which consists of 1 to any number of rules. Below we describe the configuration syntax of each rule in detail:

1. **Format**

- Before `=>` is the consumer matching condition, all parameters are compared with the consumer’s URL, and when the consumer meets the matching condition, the following filtering rules will be executed for the consumer.
- After `=>`, it is the filter condition of the provider's address list. All parameters are compared with the provider's URL, and consumers only get the filtered address list in the end.
- If the matching condition is empty, it means to apply to all consumers, such as: `=> host != 10.20.153.11`
- If the filter condition is empty, access is prohibited, such as: `host = 10.20.153.10 =>`

2. **Expression**

Parameter support:

- Service call information, such as: method, argument, etc., currently does not support parameter routing
- Fields of the URL itself, such as: protocol, host, port, etc.
- and all parameters on the URL, such as: application, organization, etc.

Conditional support:

- The equal sign `=` means "match", such as: `host = 10.20.153.10`
- The inequality sign `!=` means "no match", such as: `host != 10.20.153.10`

Value support:

- Separate multiple values with comma `,`, such as: `host != 10.20.153.10,10.20.153.11`
- End with an asterisk `*`, which means wildcard, such as: `host != 10.20.*`
- Start with a dollar sign `$`, which means to quote consumer parameters, such as: `host = $host`

3. **Condition Example**

- Exclude pre-release machines:

```
=> host != 172.22.3.91
```

- whitelist:

```
register.ip != 10.20.153.10,10.20.153.11 =>
```

{{% alert title="Attention" color="warning" %}}
A service can only have one whitelist rule, otherwise the two rules will be filtered out
{{% /alert %}}

- Blacklist:

```
register.ip = 10.20.153.10,10.20.153.11 =>
```

- The service is hosted on the application, and only a part of the machine is exposed to prevent the entire cluster from hanging:

```
=> host = 172.22.3.1*,172.22.3.2*
```

- Additional machines for important applications:

```
application != kylin => host != 172.22.3.95,172.22.3.96
```

- Read and write separation:

```
method = find*,list*,get*,is* => host = 172.22.3.94,172.22.3.95,172.22.3.96
method != find*,list*,get*,is* => host = 172.22.3.97,172.22.3.98
```

- Separation of front and back:

```
application = bops => host = 172.22.3.91,172.22.3.92,172.22.3.93
application != bops => host = 172.22.3.94,172.22.3.95,172.22.3.96
```

- Isolate network segments in different computer rooms:

```
host != 172.22.3.* => host != 172.22.3.*
```

- The provider and consumer are deployed in the same cluster, and the local machine only accesses the local service:

```
=> host = $host
```



## Label Routing Rules

### Introduction

Label routing divides one or more service providers into the same group and constrains traffic to flow only in the specified group, so as to achieve the purpose of traffic isolation, which can be used as the capability basis for scenarios such as blue-green release and grayscale release.

#### Provider

Tags mainly refer to the grouping of provider-side application instances. Currently, there are two ways to complete instance grouping, namely `dynamic rule marking` and `static rule marking`, where dynamic rules have a higher priority than static rules , and when two rules exist at the same time and conflict occurs, the dynamic rule will prevail.

-Dynamic rule marking, you can issue label grouping rules in the **Service Governance Console** at any time

  ```yaml
  # The governance-tagrouter-provider application adds two tag groups tag1 and tag2
  # tag1 contains an instance 127.0.0.1:20880
  # tag2 contains an instance 127.0.0.1:20881
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



- static marking

  ```xml
  <dubbo:provider tag="tag1"/>
  ```

  or

    ```xml
    <dubbo:service tag="tag1"/>
    ```

  or

  ```properties
  java -jar xxx-provider.jar -Ddubbo.provider.tag={the tag you want, may come from OS ENV}
  ```



#### Consumer

```java
RpcContext.getContext().setAttachment(Constants.TAG_KEY,"tag1");
```

The scope of the request tag is each invocation. Use attachment to pass the request tag. Note that the value stored in the attachment will continue to be passed in a complete remote call. Thanks to this feature, we only need to call , through the setting of one line of code, the continuous transmission of tags is achieved.

> Currently only supports hardcoding to set dubboTag. Note that RpcContext is thread-bound and use the TagRouter feature elegantly. It is recommended to set dubboTag through servlet filter (in web environment) or custom SPI filter.



### Detailed rules

#### Format

- `Key` specifies which application the rule body applies to. **Required**.
- `enabled=true` Whether the current routing rule is valid, it can be left blank, and it is valid by default.
- `force=false` When the routing result is empty, whether to enforce it, if not enforced, the routing rule with an empty routing result will automatically fail, you can leave it blank, the default is `false`.
- Whether `runtime=false` executes the routing rules every time it is called, otherwise it only pre-executes and caches the results when the provider address list changes, and directly obtains the routing results from the cache when calling. If parameter routing is used, it must be set to `true`. It should be noted that the setting will affect the performance of the call. It can be left blank. The default is `false`.
- `priority=1` is the priority of routing rules, used for sorting, the higher the priority, the higher the execution, it can be left blank, the default is `0`.
- `tags` defines specific tag grouping content, can define any n (n>=1) tags and specify an instance list for each tag. **Required**.
  - name, label name
- addresses, the list of instances contained in the current label



#### Downgrading Conventions

1. When `dubbo.tag=tag1`, the provider marked with `tag=tag1` is preferred. If there is no service corresponding to the request tag in the cluster, the provider with an empty request tag will be downgraded by default; if you want to change this default behavior, that is, no provider matching tag1 will return an exception, you need to set `dubbo.force.tag= true`.

2. When `dubbo.tag` is not set, only the provider whose tag is empty will be matched. Even if there is an available service in the cluster, if the tag does not match, it cannot be called. This is different from Convention 1. Requests with tags can be downgraded to untagged services, but requests without tags/with other types of tags can never be accessed to other tabbed services.

{{% alert title="Prompt" color="primary" %}}
Custom routing reference [routing extension](/en/docs3-v2/java-sdk/reference-manual/spi/description/router/)
{{% /alert %}}