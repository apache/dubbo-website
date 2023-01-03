---
type: docs
title: "Graceful shutdown"
linkTitle: "Graceful shutdown"
weight: 2
description: "Let the Dubbo service complete graceful shutdown"
---

## Feature description

Graceful shutdown means that the service instance can be stopped safely and smoothly without affecting the ongoing business.
A Dubbo service may be both a service provider and a service consumer. When the service is stopped:
1. Consumers will no longer request stopped service instances
2. The request being processed by the service instance can be processed normally

## scenes to be used

1. Stop the service with `kill PID`
2. Stop the service through `/shutdown` of SpringBoot Actuator

Dubbo 3.0 and above supports different types of Java applications, including SpringBoot applications, Spring applications, and non-Spring applications.

## How to use

Set the graceful shutdown timeout, the default timeout is 10 seconds, if it times out, it will be forced to shut down.
This parameter can be configured in the dubbo.properties file, for example: 30 seconds.
```properties
# Stop service waiting time, unit: milliseconds
dubbo.service.shutdown.wait=30000
```

## Precautions

1. Dubbo uses JDK's ShutdownHook to complete graceful shutdown, so if the user uses `kill -9 PID` and other forced shutdown commands, it will not execute graceful shutdown, and will only execute when `kill PID` is passed.

2. Verify that Dubbo's ShutdownHook is executed. You can find the keyword in the log file: `Run shutdown hook now.`

3. If Spring is used, please upgrade to version 4.2 and above, it is recommended to use version 5 or above

4. If SpringBoot is used, Dubbo's ShutdownHook will be executed before SpringBoot's ShutdownHook,
   If you use SpringBoot 2.3 and above, it is recommended to use it with SpringBoot's graceful shutdown, and configure it in the configuration file application.yml:
```yml
server:
  shutdown: graceful
```

5. If the ShutdownHook does not take effect, you can call it yourself according to the specific scenario:
```java
ApplicationModel.defaultModel().destroy();
```