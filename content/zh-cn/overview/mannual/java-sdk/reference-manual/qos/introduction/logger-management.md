---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/qos/logger-management/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/qos/logger-management/
description: 在 Dubbo 中运行时动态切换使用的日志框架
linkTitle: 日志框架运行时管理
title: 日志框架运行时管理
type: docs
weight: 5
---





{{% alert title="注意" color="primary" %}}

自 `3.0.10` 开始，dubbo-qos 运行时管控支持查询日志配置以及动态修改使用的日志框架和日志级别。

通过 dubbo-qos 修改的日志配置不进行持久化存储，在应用重启后将会失效。
{{% /alert %}}

### 查询日志配置

命令：`loggerInfo`

示例：
```bash
> telnet 127.0.0.1 22222
> loggerInfo
```

输出：
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

### 修改日志级别

命令：`switchLogLevel {level}`

level: `ALL`, `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`, `OFF`

示例：
```bash
> telnet 127.0.0.1 22222
> switchLogLevel WARN
```

输出：
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

### 修改日志输出框架

命令：`switchLogger {loggerAdapterName}`

loggerAdapterName: `slf4j`, `jcl`, `log4j`, `jdk`, `log4j2`

示例：
```bash
> telnet 127.0.0.1 22222
> switchLogger slf4j
```

输出：
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
