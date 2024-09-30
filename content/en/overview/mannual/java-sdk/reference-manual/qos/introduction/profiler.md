---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/qos/profiler/
    - /en/docs3-v2/java-sdk/reference-manual/qos/profiler/
    - /en/overview/mannual/java-sdk/reference-manual/qos/profiler/
description: Performance Sampling Command
linkTitle: Performance Sampling Command
title: Performance Sampling Command
type: docs
weight: 7
---




The performance sampling feature can detect the time consumption at various points in the Dubbo processing chain. When a timeout occurs `( usageTime / timeout > profilerWarnPercent * 100 )`, the call duration is logged.

This feature is divided into two modes: `simple profiler` and `detail profiler`. The `simple profiler` mode is enabled by default, while the `detail profiler` mode is disabled by default. The `detail profiler` collects additional information such as processing time for each filter and specific time consumption on protocols, compared to the `simple profiler`. If long processing times are found within the Dubbo framework while in `simple profiler`, the `detail profiler` can be enabled for better issue diagnosis.

> [Request Time Sampling](../../../advanced-features-and-usage/performance/profiler/)

### enableSimpleProfiler Command

Enable `simple profiler` mode, enabled by default

```
dubbo>enableSimpleProfiler
OK

dubbo>
```

### disableSimpleProfiler Command

Disable `simple profiler` mode, which will also disable `detail profiler`

```
dubbo>disableSimpleProfiler
OK

dubbo>
```

### enableDetailProfiler Command

Enable `detail profiler` mode, disabled by default. It will only be truly enabled when `simple profiler` is on

```
dubbo>enableDetailProfiler
OK. This will cause performance degradation, please be careful!

dubbo>
```

### disableDetailProfiler Command

Disable `detail profiler` mode, which does not affect `simple profiler`

```
dubbo>disableDetailProfiler
OK

dubbo>
```

### setProfilerWarnPercent Command

Set the warning percentage for timeout

Command: `setProfilerWarnPercent {profilerWarnPercent}`

profilerWarnPercent: The warning percentage for timeout, range 0.0 ~ 1.0, default is 0.75

```
dubbo>setProfilerWarnPercent 0.75
OK

dubbo>
```

