---
type: docs
title: "日志框架适配及运行时管理"
linkTitle: "日志框架适配及运行时管理"
weight: 4
description: "在 Dubbo 中适配日志框架并支持运行时动态切换使用的日志框架"
---

## 日志框架适配

自 `2.2.1` 开始，dubbo 开始内置 log4j、slf4j、jcl、jdk 这些日志框架的适配[1]，也可以通过以下方式显式配置日志输出策略：

0. 命令行

    ```sh
      java -Ddubbo.application.logger=log4j
    ```

0. 在 `dubbo.properties` 中指定

    ```
      dubbo.application.logger=log4j
    ```

0. 在 `dubbo.xml` 中配置

    ```xml
      <dubbo:application logger="log4j" />
    ```

[1]: 自定义扩展可以参考 [日志适配扩展](../../../reference-manual/spi/description/logger-adapter)

## 日志框架运行时管理

自 `3.0.10` 开始，dubbo-qos 运行时管控支持查询日志配置以及动态修改使用的日志框架和日志级别。

注：通过 dubbo-qos 修改的日志配置不进行持久化存储，在应用重启后将会失效。

### 1. 查询日志配置

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

### 2. 修改日志级别

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

### 3. 修改日志输出框架

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
