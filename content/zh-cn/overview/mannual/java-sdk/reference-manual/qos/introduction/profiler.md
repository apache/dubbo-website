---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/qos/profiler/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/qos/profiler/
description: 性能采样命令
linkTitle: 性能采样命令
title: 性能采样命令
type: docs
weight: 7
---






性能采样功能可以对 Dubbo 处理链路上的各处耗时进行检测，在出现超时的时候 `( usageTime / timeout > profilerWarnPercent * 100 )` 通过日志记录调用的耗时。

此功能分为 `simple profiler` 和 `detail profiler` 两个模式，其中 `simple profiler` 模式默认开启，`detail profiler` 模式默认关闭。
`detail profiler` 相较 `simple profiler` 模式多采集了每个 filter 的处理耗时、协议上的具体耗时等。
在 `simple profiler` 模式下如果发现 Dubbo 框架内部存在耗时长的情况，可以开启 `detail profiler` 模式，以便更好地排查问题。

> [请求耗时采样](../../../advanced-features-and-usage/performance/profiler/)

### enableSimpleProfiler 命令

开启 `simple profiler` 模式，默认开启

```
dubbo>enableSimpleProfiler
OK

dubbo>
```

### disableSimpleProfiler 命令

关闭 `simple profiler` 模式，关闭后 `detail profiler` 也将不启用

```
dubbo>disableSimpleProfiler
OK

dubbo>
```

### enableDetailProfiler 命令

开启 `detail profiler` 模式，默认关闭，需要开启 `simple profiler` 模式才会真实开启

```
dubbo>enableDetailProfiler
OK. This will cause performance degradation, please be careful!

dubbo>
```

### disableDetailProfiler 命令

关闭 `detail profiler` 模式，关闭后不影响 `simple profiler`

```
dubbo>disableDetailProfiler
OK

dubbo>
```

### setProfilerWarnPercent 命令

设置超时时间的警告百分比

命令：`setProfilerWarnPercent {profilerWarnPercent}`

profilerWarnPercent: 超时时间的警告百分比，取值范围 0.0 ~ 1.0，默认值为 0.75

```
dubbo>setProfilerWarnPercent 0.75
OK

dubbo>
```
