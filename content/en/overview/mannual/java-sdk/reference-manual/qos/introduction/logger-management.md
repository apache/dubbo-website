---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/qos/logger-management/
    - /en/docs3-v2/java-sdk/reference-manual/qos/logger-management/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/others/logger-management/
description: Dynamically switch the logging framework used in Dubbo at runtime
linkTitle: Runtime Management of the Logging Framework
title: Runtime Management of the Logging Framework
type: docs
weight: 5
---





{{% alert title="Note" color="primary" %}}

Starting from `3.0.10`, dubbo-qos runtime control supports querying logging configurations and dynamically modifying the logging framework and log levels used.

The logging configurations modified through dubbo-qos are not persistently stored and will be ineffective after application restarts.
{{% /alert %}}

### Query Logging Configuration

Command: `loggerInfo`

Example:
```bash
> telnet 127.0.0.1 22222
> loggerInfo
```

Output:
```
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
   ___   __  __ ___   ___   ____     
  / _ \ / / / // _ ) / _ ) / __ \  
 / // // /_/ // _  |/ _  |/ /_/ /    
/____/ \____//____//____/ \____/   
dubbo>loggerInfo
Available logger adapters: [jcl, jdk, log4j, slf4j]. Current Adapter: [log4j]. Log level: INFO
```

### Change Log Level

Command: `switchLogLevel {level}`

level: `ALL`, `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`, `OFF`

Example:
```bash
> telnet 127.0.0.1 22222
> switchLogLevel WARN
```

Output:
```
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
   ___   __  __ ___   ___   ____     
  / _ \ / / / // _ ) / _ ) / __ \  
 / // // /_/ // _  |/ _  |/ /_/ /    
/____/ \____//____//____/ \____/   
dubbo>loggerInfo
Available logger adapters: [jcl, jdk, log4j, slf4j]. Current Adapter: [log4j]. Log level: INFO
dubbo>switchLogLevel WARN
OK
dubbo>loggerInfo
Available logger adapters: [jcl, jdk, log4j, slf4j]. Current Adapter: [log4j]. Log level: WARN```
```

### Change Logging Output Framework

Command: `switchLogger {loggerAdapterName}`

loggerAdapterName: `slf4j`, `jcl`, `log4j`, `jdk`, `log4j2`

Example:
```bash
> telnet 127.0.0.1 22222
> switchLogger slf4j
```

Output:
```
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
   ___   __  __ ___   ___   ____     
  / _ \ / / / // _ ) / _ ) / __ \  
 / // // /_/ // _  |/ _  |/ /_/ /    
/____/ \____//____//____/ \____/   
dubbo>loggerInfo
Available logger adapters: [jcl, slf4j, log4j, jdk]. Current Adapter: [log4j]. Log level: INFO
dubbo>switchLogger slf4j
OK
dubbo>loggerInfo
Available logger adapters: [jcl, slf4j, log4j, jdk]. Current Adapter: [slf4j]. Log level: INFO
```

