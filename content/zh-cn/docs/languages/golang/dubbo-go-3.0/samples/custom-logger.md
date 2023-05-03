---
aliases:
    - /zh/docs/languages/golang/dubbo-go-3.0/samples/custom-logger/
description: Dubbo-go 3.0 自定义日志
keywords: Dubbo-go 3.0 自定义日志
linkTitle: 日志
title: Dubbo-go 3.0 自定义日志
type: docs
---



{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh-cn/overview/mannual/golang-sdk/tutorial/develop/features/custom-logger/)。
{{% /pageinfo %}}

# Dubbo-go 3.0 自定义日志组件

参考samples [dubbo-go-samples/logger](https://github.com/apache/dubbo-go-samples/tree/master/logger)

## 1. 日志配置

Dubbo-go 3.0 默认采用 zap 日志库，在配置文件中不添加 logger 配置，日志将会打印到控制默认级别为debug。您也可在配置文件中配置日志级别、, 可参照如下方式来配置zap-config和lumberjack-config，从而定制化日志输出。

```yaml
dubbo:
  logger:
    zap-config:
      level: debug # 日志级别
      development: false
      disableCaller: false
      disableStacktrace: false
      encoding: "console"
      # zap encoder 配置
      encoderConfig:
        messageKey: "message"
        levelKey: "level"
        timeKey: "time"
        nameKey: "logger"
        callerKey: "caller"
        stacktraceKey: "stacktrace"
        lineEnding: ""
        levelEncoder: "capitalColor"
        timeEncoder: "iso8601"
        durationEncoder: "seconds"
        callerEncoder: "short"
        nameEncoder: ""
      outputPaths:
        - "stderr"
      errorOutputPaths:
        - "stderr"
    lumberjack-config:
       # 写日志的文件名称
      filename: "logs.log"
      # 每个日志文件长度的最大大小，单位是 MiB。默认 100MiB
      maxSize: 1
      # 日志保留的最大天数(只保留最近多少天的日志)
      maxAge: 3
      # 只保留最近多少个日志文件，用于控制程序总日志的大小
      maxBackups: 5
      # 是否使用本地时间，默认使用 UTC 时间
      localTime: true
      # 是否压缩日志文件，压缩方法 gzip
      compress: false
```

## 2. 日志API 和 自定义日志

日志Interface

```go
type Logger interface {
	Info(args ...interface{})
	Warn(args ...interface{})
	Error(args ...interface{})
	Debug(args ...interface{})
	Fatal(args ...interface{})

	Infof(fmt string, args ...interface{})
	Warnf(fmt string, args ...interface{})
	Errorf(fmt string, args ...interface{})
	Debugf(fmt string, args ...interface{})
	Fatalf(fmt string, args ...interface{})
}
```

日志API

```go
import "dubbo.apache.org/dubbo-go/v3/common/logger"


logger.SetLoggerLevel(warn) // 在 main 函数中设置日志级别
logger.SetLogger(myLogger)  // 在 main 函数中设置自定义logger
```

- 日志API不可以在Init 阶段使用，否则可能会发生意料之外的问题。
