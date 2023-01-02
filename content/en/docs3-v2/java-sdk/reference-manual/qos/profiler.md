---
type: docs
title: "Performance Sampling Command"
linkTitle: "Performance Sampling Command"
weight: 7
description: "Performance Sampling Command"
---

The performance sampling function can detect the time consumption of various parts of the Dubbo processing link. When a timeout occurs, `( usageTime / timeout > profilerWarnPercent * 100 )` records the time consumption of calls through logs.

This function is divided into `simple profiler` and `detail profiler` two modes, where `simple profiler` mode is enabled by default, and `detail profiler` mode is disabled by default.
Compared with the `simple profiler` mode, the `detail profiler` collects more time-consuming processing of each filter, specific time-consuming protocols, etc.
In the `simple profiler` mode, if you find that there is a long time-consuming situation inside the Dubbo framework, you can enable the `detail profiler` mode to better troubleshoot the problem.

Reference link: [Request time-consuming sampling](../../../advanced-features-and-usage/performance/profiler/)

## enableSimpleProfiler command

Enable `simple profiler` mode, enabled by default

```
dubbo>enableSimpleProfiler
OK

dubbo>
```

## disableSimpleProfiler command

Turn off the `simple profiler` mode, and the `detail profiler` will not be enabled after it is turned off

```
dubbo>disableSimpleProfiler
OK

dubbo>
```

## enableDetailProfiler command

Enable the `detail profiler` mode, which is disabled by default, you need to enable the `simple profiler` mode to actually enable it

```
dubbo>enableDetailProfiler
OK. This will cause performance degradation, please be careful!

dubbo>
```

## disableDetailProfiler command

Turn off `detail profiler` mode, it will not affect `simple profiler`

```
dubbo>disableDetailProfiler
OK

dubbo>
```

## setProfilerWarnPercent command

Set the warning percentage for the timeout

Command: `setProfilerWarnPercent {profilerWarnPercent}`

profilerWarnPercent: The warning percentage of the timeout period, the value range is 0.0 ~ 1.0, and the default value is 0.75

```
dubbo>setProfilerWarnPercent 0.75
OK

dubbo>
```