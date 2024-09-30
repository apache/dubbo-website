---
aliases:
  - /en/docs3-v2/rust-sdk/router-module/
  - /en/docs3-v2/rust-sdk/router-module/
description: "Service Routing"
linkTitle: Service Routing
title: Service Routing Rules
type: docs
weight: 2
---

## Conditional Routing
The usage pattern is similar to the [Conditional Routing Documentation](/en/overview/core-features/traffic/condition-rule/), but the configuration format is slightly different. Below is an example of conditional routing rules.

Based on the following example rule, all calls to the `greet` method of the `org.apache.dubbo.sample.tri.Greeter` service will be forwarded to a subset of addresses marked with `port=8888`. 

```yaml
configVersion: v1.0
scope: "service"
force: false
enabled: true
key: "org.apache.dubbo.sample.tri.Greeter"
conditions:
  - method=greet => port=8888
```
Note:<br>
The Dubbo Rust currently does not distinguish at the **application level**, and cannot differentiate the origin of the service.<br>
Therefore, for tag routing and conditional routing, only one application-level configuration can be specified.<br>
For application-level configuration, the default key is set to application, and this configuration will affect all services.<br>
For example:
```yaml
configVersion: v1.0
scope: "application"
force: false
enabled: true
key: application
conditions:
  - ip=127.0.0.1 => port=8000~8888
```

#### Match/Filter Conditions

**Parameter Support**

* Service call context, such as: service_name, method, etc.
* URL fields, such as: location, ip, port, etc.
* Field information stored in URL params.

**Condition Support**

* Equal sign = indicates "match", e.g.: method = getComment
* Not equal != indicates "no match", e.g.: method != getComment

**Value Support**

* Multiple values separated by comma, e.g.: ip != 10.20.153.10,10.20.153.11
* Asterisk * at the end indicates a wildcard, e.g.: ip != 10.20.*
* Integer value range, e.g.: port = 80~8080


## Tag Routing
The usage pattern is similar to the [Tag Routing Documentation](/en/overview/core-features/traffic/tag-rule/), but the configuration format is slightly different. Below is an example of tag routing rules.
```yaml
configVersion: v1.0
force: false
enabled: true
key: application
tags:
  - name: local
    match:
      - key: ip
        value: 127.0.0.1
```
In this configuration, all service providers/consumers with ip=127.0.0.1 will be tagged with local.

## Dynamic Configuration
### Overview of Dynamic Configuration
Dynamic configuration uses Nacos as the configuration center. It needs to be configured in the project's application.yaml file; if not configured, local routing configuration will be used.
### Usage:
```yaml
nacos:
    addr: "127.0.0.1:8848"
    namespace: "namespace-name"
    app: "app-name"
    enable_auth: 
      auth_username: username
      auth_password: password
```
app: the app where routing configurations are placed in Nacos.
namespace: the namespace where configuration information is located in Nacos.
addr: the Nacos service address.
enable_auth: optional configuration; if Nacos's authentication feature is enabled, this must be specified. auth_username corresponds to the account, auth_password to the key.


#### Configuring Conditional Routing

When creating conditional routing configurations in Nacos,
app and namespace are the information input during Nacos configuration;
group: fixed as condition;
name: must match the service name;


#### Configuring Tag Routing
When creating tag routing configurations in Nacos,

app: the app filled in during Nacos configuration;
namespace: the namespace filled in during Nacos configuration;
group: fixed as tag;
name: fixed as application;

#### Notes
Dubbo Rust does not currently differentiate at the **application** level and cannot identify the source of a service; 
therefore, application-level configurations will apply to all services by default.
Thus, for tag routing and conditional routing, only one application-level configuration can be specified with the name designated as application.

#### Example:
![nacos-example.png](/imgs/rust/router-example/nacos-example.png)
#### Corresponding Configuration Items:

*Service Level Conditional Routing Configuration:*
```yaml
configVersion: v1.0
scope: "service"
force: false
enabled: true
key: "org.apache.dubbo.sample.tri.Greeter"
conditions:
  - method=greet => ip=127.*
```
*Tag Routing Configuration:*
```yaml
configVersion: v1.0
force: true
enabled: true
key: shop-detail
tags:
  - name: local
    match:
      - key: ip
        value: 127.0.0.1
```

*Application Level Conditional Routing Configuration:*
```yaml
configVersion: v1.0
scope: "application"
force: false
enabled: true
key: application
conditions:
  - ip=127.0.0.1 => port=8000~8888
```

