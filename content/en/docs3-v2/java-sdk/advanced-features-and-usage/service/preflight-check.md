---
type: docs
title: "Check at startup"
linkTitle: "Check at startup"
weight: 1
description: "Check that dependent services are available at startup"
---
## Feature description
By default, Dubbo will check whether the dependent service is available at startup, and will throw an exception when it is unavailable, preventing Spring initialization from completing, so that problems can be detected early when going online. The default `check="true"`.

Checking can be turned off by `check="false"`. For example, when testing, some services do not care, or there is a circular dependency, and one of them must be started first.

In addition, if your Spring container is lazy-loaded, or if you delay the reference service through API programming, please turn off check, otherwise when the service is temporarily unavailable, an exception will be thrown and a null reference will be obtained. If `check="false"`, always Yes, it will return the reference, and when the service is restored, it can be connected automatically.

## scenes to be used

- One-way dependency: with dependency (recommended default setting) and without dependency (check=false can be set)
- Interdependence: that is, circular dependency, (it is not recommended to set check=false)
- Lazy loading handling

> check is only used to check at startup, if there is no corresponding dependency at runtime, an error will still be reported.

## How to use

### via spring configuration file

Turn off startup checks for a service

```xml
<dubbo:reference interface="com.foo.BarService" check="false" />
```

Turn off startup checks for all services

```xml
<dubbo:consumer check="false" />
```

Turn off registry checks at startup

```xml
<dubbo:registry check="false" />
```

### via dubbo.properties

```properties
dubbo.reference.com.foo.BarService.check=false
dubbo.consumer.check=false
dubbo.registry.check=false
```

### via the -D parameter

```sh
java -Ddubbo.reference.com.foo.BarService.check=false
java -Ddubbo.consumer.check=false
java -Ddubbo.registry.check=false
```

## Meaning of configuration

`dubbo.reference.com.foo.BarService.check`, overrides the check value of the reference of `com.foo.BarService`, even if there is a statement in the configuration, it will be overwritten.

`dubbo.consumer.check=false` is the default value of `check` for setting reference. If there is an explicit statement in the configuration, such as: `<dubbo:reference check="true"/>`, it will not be affected influences.

`dubbo.registry.check=false`, the first two means that the subscription is successful, but whether the provider list is empty or whether an error is reported, if the registration subscription fails, it is also allowed to start, you need to use this option, and will retry periodically in the background .