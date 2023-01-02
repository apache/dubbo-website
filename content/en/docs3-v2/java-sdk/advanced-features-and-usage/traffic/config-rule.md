---
type: docs
title: "Configuration Rules"
linkTitle: "Configuration Rules"
weight: 34
description: "Configure application-level governance rules and service-level governance rules in Dubbo"
---
## override rules
Overriding rules is a capability designed by Dubbo to dynamically adjust the behavior of RPC calls without restarting the application. Starting from version 2.7.0, dynamic configuration adjustments are supported at two granularities of **service** and **application**.

### Overview

Please view or modify override rules in the service governance console.

**Application Granularity**

```yaml
# Change the weight of all services (scope:application) provided by the application demo (key:demo) on port 20880 (side:provider) to 1000 (weight:1000).
---
configVersion: v2.7
scope: application
key: demo
enabled: true
configs:
- addresses: ["0.0.0.0:20880"]
  side: provider
  parameters:
  weight: 1000
  ...
```

**Service Granularity**

```yaml
# All consumer (side:consumer) DemoService service (key:org.apache.dubbo.samples.governance.api.DemoService) application instance (addresses:[0.0.0.0]), the timeout is changed to 6000ms
---
configVersion: v2.7
scope: service
key: org.apache.dubbo.samples.governance.api.DemoService
enabled: true
configs:
- addresses: [0.0.0.0]
  side: consumer
  parameters:
  timeout: 6000
  ...
```

## Detailed Rules

### Configuration template

```yaml
---
configVersion: v2.7
scope: application/service
key: app-name/group+service+version
enabled: true
configs:
- addresses: ["0.0.0.0"]
  providerAddresses: ["1.1.1.1:20880", "2.2.2.2:20881"]
  side: consumer
  applications/services: []
  parameters:
    timeout: 1000
    cluster: failfase
    loadbalance: random
- addresses: ["0.0.0.0:20880"]
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

in:
- `configVersion` means dubbo version
- `scope` indicates the scope of configuration, which is the granularity of application or service. **Required**.
- `key` specifies which service or application the rule body acts on. **Required**.
    - When scope=service, the key value is a combination of [{group}:]{service}[:{version}]
- When scope=application, the key value is the application name
- `enabled=true` Whether the overriding rule is valid, it can be left blank, and it is valid by default.
- `configs` defines specific coverage rule content, and n (n>=1) rule bodies can be specified. **Required**.
    - side,
    - applications
    - services
      -parameters
    - addresses
    - providerAddresses

**For most configuration scenarios, you only need to clarify the following questions to know how to write the configuration:**
1. Whether you want to modify the configuration of the entire application or a service.
    - Application: `scope: application, key: app-name` (you can also use `services` to specify certain services).
    - Service: `scope: service, key:group+service+version`.

2. Whether the modification is applied to the consumer or the provider.
    - Consumer: `side: consumer`, when acting on the consumer side (you can further use `providerAddress`, `applications` to select specific provider examples or applications).
    - Provider: `side: provider`.

3. Whether the configuration takes effect only for certain specific instances.
    - All instances: `addresses: ["0.0.0.0"]` or `addresses: ["0.0.0.0:*"]` depends on the side value.
    - Specified instances: `addersses[list of instance addresses]`.

4. Which property is to be modified.

### Example

**1. Disable provider: (Usually used to temporarily kick off a provider machine, similarly, please use routing rules to prohibit consumer access)**

   ```yaml
   ---
   configVersion: v2.7
   scope: application
   key: demo-provider
   enabled: true
   configs:
   - addresses: ["10.20.153.10:20880"]
     side: provider
     parameters:
       disabled: true
   ...
   ```

**2. Adjust the weight: (usually used for capacity evaluation, the default weight is 200)**

   ```yaml
   ---
   configVersion: v2.7
   scope: application
   key: demo-provider
   enabled: true
   configs:
   - addresses: ["10.20.153.10:20880"]
     side: provider
     parameters:
       weight: 200
   ...
   ```

**3. Adjust the load balancing strategy: (the default load balancing strategy is random)**

   ```yaml
   ---
   configVersion: v2.7
   scope: application
   key: demo-consumer
   enabled: true
   configs:
   - side: consumer
     parameters:
       loadbalance: random
   ...
   ```

**4. Service downgrade: (Usually used to temporarily shield a non-critical service that has an error)**

    ```yaml
   ---
configVersion: v2.7
scope: service
key: org.apache.dubbo.samples.governance.api.DemoService
enabled: true
configs:
- side: consumer
  parameters:
  force: return null
  ...
   ```