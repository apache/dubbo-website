---
type: docs
title: "Application-level Service Discovery Address Migration Rules Description"
linkTitle: "Application-level service discovery address migration rules"
weight: 42
description: "This article specifies the rule body information used in the address migration process. Users can customize their own migration rules according to their needs."
---

## State Model


Before Dubbo 3, the address registration model was registered to the registry at the interface-level granularity, while the new application-level registration model of Dubbo 3 is registered to the registry at the application-level granularity. The implementation of the registry is almost different, which leads to the inability to merge the invokers obtained from the interface-level registration model with the invokers obtained from the application-level registration model. In order to help users migrate from the interface level to the application level, Dubbo 3 has designed the Migration mechanism, which realizes the switching of the address model in the actual call based on the switching of the three states.


![//imgs/v3/migration/migration-1.png](/imgs/v3/migration/migration-1.png)

Currently there are three states, FORCE_INTERFACE (mandatory interface level), APPLICATION_FIRST (application level priority), FORCE_APPLICATION (mandatory application level).


FORCE_INTERFACE: Only enable the registry logic for interface-level service discovery in compatibility mode, and 100% of the call traffic follows the original process
APPLICATION_FIRST: Enable interface-level and application-level dual subscriptions, and dynamically determine the calling traffic direction according to the threshold and grayscale traffic ratio at runtime
FORCE_APPLICATION: Only enable the registration center logic of application-level service discovery in the new mode, and 100% of the call traffic goes to the address of the application-level subscription


## Description of rule body


The rules are configured in yaml format, and the specific configuration is as follows:
```yaml
key: consumer application name (required)
step: state name (required)
threshold: decision threshold (default 1.0)
proportion: grayscale ratio (default 100)
delay: delay decision time (default 0)
force: force switching (default false)
interfaces: interface granularity configuration (optional)
  - serviceKey: interface name (interface + : + version number) (required)
    threshold: decision threshold
    proportion: grayscale ratio
    delay: delay decision time
    force: force switch
    step: state name (required)
  - serviceKey: interface name (interface + : + version number)
    step: state name
applications: application granular configuration (optional)
  - serviceKey: application name (consumed upstream application name) (required)
    threshold: decision threshold
    proportion: grayscale ratio
    delay: delay decision time
    force: force switch
    step: state name (required)
```


- key: consumer application name
- step: state name (FORCE_INTERFACE, APPLICATION_FIRST, FORCE_APPLICATION)
- threshold: decision threshold (floating point number, refer to the following for specific meaning)
- proportion: grayscale ratio (0 to 100, determines the proportion of calling times)
- delay: Delay decision time (delay decision time, the actual waiting time is 1~2 times the delay time, depending on the time of the first notification from the registration center, for the current Dubbo registration center to achieve secondary configuration items keep 0)
- force: Forced switching (for FORCE_INTERFACE, FORCE_APPLICATION whether to switch directly without considering the decision, which may cause no address call failure)
- interfaces: interface granularity configuration



The reference configuration example is as follows:
```yaml
key: demo-consumer
step: APPLICATION_FIRST
threshold: 1.0
proportion: 60
delay: 0
force: false
interfaces:
  - serviceKey: DemoService: 1.0.0
    threshold: 0.5
    proportion: 30
    delay: 0
    force: true
    step: APPLICATION_FIRST
  - serviceKey: GreetingService: 1.0.0
    step: FORCE_APPLICATION
```


## Description of configuration method
### 1. Configuration center configuration file delivery (recommended)


- Key: consumer application name + ".migration"
- Group: DUBBO_SERVICEDISCOVERY_MIGRATION


Refer to the previous section for the content of configuration items


When the program starts, it will pull this configuration as the highest priority startup item. When the configuration item is a startup item, no checking operation will be performed, and the final state will be reached directly according to the status information.
When a new configuration item is received during the running of the program, the migration operation will be performed, and the configuration information will be checked during the process. If the check fails, it will be rolled back to the pre-migration state. Migration is performed at the interface granularity, that is, if an application has 10 interfaces, 8 of which migrate successfully and 2 fail, then in the final state, the 8 successfully migrated interfaces will execute the new behavior, and the 2 failed interfaces will still be old state. If it is necessary to re-trigger the migration, it can be achieved by re-delivering the rules.


Note: If the program is rolled back due to check failure during migration, since the program does not have the behavior of writing back configuration items, if the program is restarted at this time, the program will directly initialize according to the new behavior without checking.


### 2. Start parameter configuration


- Configuration item name: dubbo.application.service-discovery.migration
- Range of allowed values: FORCE_INTERFACE, APPLICATION_FIRST, FORCE_APPLICATION



This configuration item can be passed in through environment variables or the configuration center, and has a lower priority than the configuration file at startup, that is, when the configuration file in the configuration center does not exist, this configuration item is read as the startup status.


### 3. Local file configuration



| Configuration item name | Default value | Description |
| --- | --- | --- |
| dubbo.migration.file | dubbo-migration.yaml | Local configuration file path |
| dubbo.application.migration.delay | 60000 | Configuration file delay effective time (milliseconds) |

The format in the configuration file is consistent with the rules mentioned above


The local file configuration method is essentially a delayed configuration notification method. The local file will not affect the default startup method. When the delay time is reached, a notification with the same content as the local file will be triggered. The delay time here is not related to the delay field in the rule body.
The local file configuration method can ensure that the startup is initialized with the default behavior. When the delay is reached, the migration operation is triggered and the corresponding check is performed to avoid starting in the final state at startup.


## Decision statement
### 1. Threshold detection


The threshold mechanism is designed to check the number of addresses before traffic switching. If the number of available addresses at the application level is compared with the number of available addresses at the interface level, the check fails if the threshold is not reached.


The core code is as follows:
```java
if (((float) newAddressSize / (float) oldAddressSize) >= threshold) {
    return true;
}
return false;
```


At the same time, MigrationAddressComparator is also an SPI extension point, users can expand it by themselves, and the results of all checks are intersected.


### 2. Gray scale


The gray scale function only takes effect in the application-level priority state. This feature allows users to determine the proportion of calls to the address of the new mode application-level registry. The prerequisite for the gray scale to take effect is to meet the threshold detection. In the application-level priority state, if the threshold detection passes, `currentAvailableInvoker` will be switched to the invoker corresponding to the application-level address; if the detection fails, `currentAvailableInvoker` will still be the original interface-level address The invoker.


The flow chart is as follows:
detection stage
![//imgs/v3/migration/migration-2.png](/imgs/v3/migration/migration-2.png)
call phase
![//imgs/v3/migration/migration-3.png](/imgs/v3/migration/migration-3.png)


The core code is as follows:
```java
// currentAvailableInvoker is based on MigrationAddressComparator's result
if (currentAvailableInvoker != null) {
    if (step == APPLICATION_FIRST) {
        // call ratio calculation based on random value
        if (ThreadLocalRandom. current(). nextDouble(100) > promotion) {
            return invoker.invoke(invocation);
        }
    }
    return currentAvailableInvoker.invoke(invocation);
}

```


## Description of switching process


The process of address migration involves the switching of three states. In order to ensure smooth migration, there are 6 switching paths that need to be supported, which can be summarized as switching from mandatory interface level, mandatory application level to application level priority; application level priority to mandatory interface level, Mandatory application-level switching; there are also mandatory interface-level and mandatory application-level switching.
The switching process for the same interface is always synchronous. If a new rule is received before the previous rule has been processed, it will wait.


### 1. Switch to application-level priority


Switching from mandatory interface level, mandatory application level to application level priority is essentially a process of switching from a single subscription to a dual subscription, retaining the original subscription and creating another subscription. In this switching mode, the delay configuration configured in the rule body will not take effect, that is, the threshold detection will be performed immediately after the subscription is created, and a decision will be made to select a certain group of subscriptions for the actual priority call. Since the application-level priority mode supports dynamic threshold detection at runtime, the threshold will be recalculated and switched after all addresses are notified for the scenario where some registry centers fail to start and obtain all addresses.
Dynamic switching in the application-level priority mode is implemented based on the address listener of the service directory (Directory).
![//imgs/v3/migration/migration-4.png](/imgs/v3/migration/migration-4.png)


### 2. Application-level priority switch to mandatory


The process of switching from application-level priority to mandatory interface level and mandatory application level is to check the address of the double subscription. If it is satisfied, the other subscription will be destroyed. If it is not satisfied, the original application-level priority status will be rolled back.
If the user wants the switching process to switch directly without checking, it can be realized by configuring the force parameter.
![//imgs/v3/migration/migration-5.png](/imgs/v3/migration/migration-5.png)
### 3. Mandatory interface level and mandatory application level switch between each other


To switch between the mandatory interface level and the mandatory application level, a new subscription needs to be temporarily created to determine whether the new subscription (that is, the number of addresses of the new subscription is used to subtract the number of addresses of the old subscription when calculating the threshold) is up to the standard. Failure to meet the standard will destroy the new subscription and roll back to the previous state.
![//imgs/v3/migration/migration-6.png](/imgs/v3/migration/migration-6.png)