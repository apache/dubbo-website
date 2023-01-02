---
type: docs
title: "Log Framework Adaptation and Runtime Management"
linkTitle: "Log framework adaptation and runtime management"
weight: 4
description: "Adapt to the log framework in Dubbo and support dynamic switching of the log framework used at runtime"
---
## Feature description
Adaptation of log frameworks. Since `2.2.1`, dubbo has built-in adaptation of log4j, slf4j, jcl, and jdk log frameworks.

Log framework runtime management, starting from `3.0.10`, dubbo-qos runtime management supports query log configuration and dynamically modify the used log framework and log level.

> The log configuration modified by dubbo-qos is not stored persistently, and will become invalid after the application is restarted.
## scenes to be used

## How to use
## Log framework adaptation
The logging output policy can be explicitly configured in the following ways

### 1. Command line

```sh
java -Ddubbo.application.logger=log4j
```

### 2. Specify in `dubbo.properties`

```
dubbo.application.logger=log4j
```

### 3. Configuration in `dubbo.xml`

```xml
<dubbo:application logger="log4j" />
```

For custom extensions, please refer to [Log Adapter Extension](../../../reference-manual/spi/description/logger-adapter)

## Logging framework runtime management
### 1. Query log configuration

Command: `loggerInfo`

**example**
```bash
> telnet 127.0.0.1 22222
> loggerInfo
```

**output**
```
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
   ___ __ __ ___ ___ ____
  / _ \ / / / // _ ) / _ ) / __ \
 / // // /_/ // _ |/ _ |/ /_/ /
/____/ \____//____//____/ \____/
dubbo>loggerInfo
Available logger adapters: [jcl, jdk, log4j, slf4j]. Current Adapter: [log4j]. Log level: INFO
```

### 2. Modify log level

Command: `switchLogLevel {level}`

level: `ALL`, `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`, `OFF`

**example**
```bash
> telnet 127.0.0.1 22222
> switchLogLevel WARN
```

**output**
```
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
   ___ __ __ ___ ___ ____
  / _ \ / / / // _ ) / _ ) / __ \
 / // // /_/ // _ |/ _ |/ /_/ /
/____/ \____//____//____/ \____/
dubbo>loggerInfo
Available logger adapters: [jcl, jdk, log4j, slf4j]. Current Adapter: [log4j]. Log level: INFO
dubbo>switchLogLevel WARN
OK
dubbo>loggerInfo
Available logger adapters: [jcl, jdk, log4j, slf4j]. Current Adapter: [log4j]. Log level: WARN```
```

### 3. Modify the log output framework

Command: `switchLogger {loggerAdapterName}`

loggerAdapterName: `slf4j`, `jcl`, `log4j`, `jdk`, `log4j2`

**example**
```bash
> telnet 127.0.0.1 22222
> switchLogger slf4j
```

**output**
```
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
   ___ __ __ ___ ___ ____
  / _ \ / / / // _ ) / _ ) / __ \
 / // // /_/ // _ |/ _ |/ /_/ /
/____/ \____//____//____/ \____/
dubbo>loggerInfo
Available logger adapters: [jcl, slf4j, log4j, jdk]. Current Adapter: [log4j]. Log level: INFO
dubbo>switchLogger slf4j
OK
dubbo>loggerInfo
Available logger adapters: [jcl, slf4j, log4j, jdk]. Current Adapter: [slf4j]. Log level: INFO
```