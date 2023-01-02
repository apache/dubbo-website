---
type: docs
title: "Logging framework runtime management"
linkTitle: "Logging framework runtime management"
weight: 5
description: "Dynamically switch the log framework used when running in Dubbo"
---

## Logging framework runtime management

Starting from `3.0.10`, dubbo-qos runtime control supports querying log configuration and dynamically modifying the used log framework and log level.

Note: The log configuration modified by dubbo-qos is not stored persistently and will become invalid after the application is restarted.

### 1. Query log configuration

Command: `loggerInfo`

Example:
```bash
> telnet 127.0.0.1 22222
> loggerInfo
```

output:
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

Example:
```bash
> telnet 127.0.0.1 22222
> switchLogLevel WARN
```

output:
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

Example:
```bash
> telnet 127.0.0.1 22222
> switchLogger slf4j
```

output:
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