---
aliases:
  - /en/overview/mannual/golang-sdk/tutorial/develop/features/custom-logger/
description: logger
title: Configure and Manage Framework Logs
linkTitle: Framework Logs
type: docs
weight: 1
---

This example demonstrates how to configure the dubbo-go framework log component to save the framework's runtime logs to a specified location. You can view the <a href="https://github.com/apache/dubbo-go-samples/tree/main/logger/level" target="_blank">complete example source code here</a>.

{{% alert title="Note" color="info" %}}
The configuration here only affects the log component behavior of the dubbo-go framework itself, which is the internal logging used by the framework and does not affect the use of business logging frameworks!
{{% /alert %}}

## 1. Log Configuration
As shown below, you can set the dubbo framework log behavior using `log.WithZap()` and `log.WithLevel("warn")`:

```go
ins, err := dubbo.NewInstance(
	dubbo.WithLogger(
		log.WithLevel("warn"),
		log.WithZap(),
	),
)
```

## 2. Application Shared Log Component
Note that the configuration here only affects the log component behavior of the dubbo-go framework itself (i.e., the logs used internally by the framework) and does not affect the use of business logging frameworks!

**Business applications can also choose to reuse this log component in the following way:**

```go
import app_logger "github.com/dubbogo/gost/log/logger"

app_logger.Info("hello")
```

Log Interface

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

{{% alert title="Note" color="info" %}}
The logging API cannot be used during the Init phase; otherwise, unexpected issues may occur.
{{% /alert %}}

## 2. Fully Custom Logs
Currently, the dubbo-go framework supports the zap and logrus log frameworks. If you want the dubbo framework kernel to use other log frameworks for logging, it is recommended to add support in a standard extension form. For specifics, refer to the built-in [source implementation](https://github.com/apache/dubbo-go/tree/main/logger) in the core library.

## 3. Access Logs

You can configure access logging in the following way:

```go
srv, err := server.NewServer(
	server.WithAccesslog("true"),
	// server.WithAccesslog("default"),
	// server.WithAccesslog("/your/path/to/store/the/log/logfile"),
)
```

For `true` and `default`, the access log will be printed using the logger component in Dubbo. If a specific log file path is specified, it will be written directly to that file.

