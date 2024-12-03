---
aliases:
  - /zh-cn/overview/mannual/golang-sdk/tutorial/develop/features/custom-logger/
description: logger
title: 配置和管理框架日志
linkTitle: 框架日志
type: docs
weight: 1
---

本示例演示如何配置 dubbo-go 框架日志组件，将框架运行态日志保存到指定的位置。可在此查看  <a href="https://github.com/apache/dubbo-go-samples/tree/main/logger/level" target="_blank">完整示例源码地址</a>。

{{% alert title="注意" color="info" %}}
这里配置的只是 dubbo-go 框架自身的日志组件行为，即框架内部使用的日志，不影响业务日志框架的使用！
{{% /alert %}}

## 1. 日志配置
如下所示，可以通过 `log.WithZap()`、`log.WithLevel("warn")` 设置 dubbo 框架日志行为：

```go
ins, err := dubbo.NewInstance(
	dubbo.WithLogger(
		log.WithLevel("warn"),
		log.WithZap(),
	),
)
```

## 2. 应用共享日志组件
注意，这里配置的只是 dubbo-go 框架自身的日志组件行为（即框架内部使用的日志），不影响业务日志框架的使用！

**通过以下方式，业务应用也可以选择复用这个日志组件：**

```go
import app_logger "github.com/dubbogo/gost/log/logger"

app_logger.Info("hello")
```

日志 Interface

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

{{% alert title="注意" color="info" %}}
日志API不可以在Init 阶段使用，否则可能会发生意料之外的问题。
{{% /alert %}}

## 2. 完全自定义日志
当前 dubbo-go 框架支持 zap、logrus 两个日志框架，如果您想让 dubbo 框架内核使用其他日志框架打印日志，推荐以标准扩展形式增加支持，具体可参考核心库中内置的 [源码实现](https://github.com/apache/dubbo-go/tree/main/logger)。

## 3. 访问日志

可以通过以下方式配置开启访问日志：

```go
srv, err := server.NewServer(
	server.WithAccesslog("true"),
	// server.WithAccesslog("default"),
	// server.WithAccesslog("/your/path/to/store/the/log/logfile"),
)
```

对于 `true` 和 `default` 而言，访问日志会使用 Dubbo 中的 logger 组件打印出来。如果指定了具体的日志文件路径，则直接写入到该文件。
