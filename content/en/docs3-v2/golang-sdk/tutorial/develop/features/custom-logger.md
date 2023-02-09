---
title: log
weight: 6
type: docs
---

Refer to samples [dubbo-go-samples/logger](https://github.com/apache/dubbo-go-samples/tree/master/logger)

## 1. Log configuration

dubbogo 3.0 uses the zap log library by default. If you do not add logger configuration in the configuration file, the log will be printed to the control. The default level is debug. You can also configure the log level in the configuration file. You can configure zap-config and lumberjack-config as follows to customize the log output.

```yaml
dubbo:
  logger:
    zap-config:
      level: debug # log level
      development: false
      disableCaller: false
      disableStacktrace: false
      encoding: "console"
      # zap encoder configuration
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
       # Write the log file name
      filename: "logs.log"
      # The maximum size of each log file length, in MiB. Default 100MiB
      maxSize: 1
      # The maximum number of days to keep the log (only keep the log of the last few days)
      maxAge: 3
      # Only how many recent log files are kept to control the size of the total log of the program
      maxBackups: 5
      # Whether to use local time or not, UTC time is used by default
      localTime: true
      # Whether to compress the log file, compression method gzip
      compress: false
```

## 2. Logging API and custom logging

log interface

```go
type Logger interface {
Info(args...interface{})
Warn(args ... interface{})
Error(args...interface{})
Debug(args...interface{})
Fatal(args...interface{})

Infof(fmt string, args...interface{})
Warnf(fmt string, args...interface{})
Errorf(fmt string, args...interface{})
Debugf(fmt string, args...interface{})
Fatalf(fmt string, args ... interface{})
}
```

log API

```go
import "dubbo.apache.org/dubbo-go/v3/common/logger"


logger.SetLoggerLevel(warn) // Set the log level in the main function
logger.SetLogger(myLogger) // Set a custom logger in the main function
```

- The log API cannot be used in the Init phase, otherwise unexpected problems may occur.
