---
type: docs
title: Dubbo-go 数据上报
keywords: Dubbo-go 数据上报
linkTitle: Metrics 数据上报
description: 提示用户dubbo使用的数据上报方式
---

{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh/docs3-v2/golang-sdk/samples/metrics/)。
{{% /pageinfo %}}

# Dubbo-go 3.0 数据上报

参考Samples： [dubbo-go-samples/metrics](https://github.com/apache/dubbo-go-samples/tree/master/metrics)

## 1. 数据上报配置

在不指定 metrics: 字段的时候，默认开启拉模式 prometheus 数据上报，端口默认为9090，监听path默认为/metrics。可参考如下服务端配置例子来定制化。

```yaml
dubbo:
  application:
    version: 3.0.0-rc3 # 版本号
  metrics:
    enable: true # default is true
    path: /custom-metrics-path # default is /metrics
    port: 9091 # default is 9090
    namespace: dubbo # default is dubbo 作为数据上报 metrics 的前缀
  registries:
    myzk:
      protocol: zookeeper
      address: localhost:2181
  protocols:
    triple:
      name: tri
      port: 20000
  provider:
    services:
      GreeterProvider:
        group: dubbo-go  # 所属 group，需要与客户端一致
        interface: com.apache.dubbo.HelloService  # 接口名
```

## 2. 默认数据上报指标

本地启动上述服务端后，可于 localhost:9091/custom-metrics-path 收集到默认数据指标，包含gc、goroutine数目，内存占用情况等。

```yaml
# HELP go_gc_duration_seconds A summary of the pause duration of garbage collection cycles.
# TYPE go_gc_duration_seconds summary
go_gc_duration_seconds{quantile="0"} 3.0916e-05
go_gc_duration_seconds{quantile="0.25"} 3.0916e-05
go_gc_duration_seconds{quantile="0.5"} 3.1167e-05
go_gc_duration_seconds{quantile="0.75"} 0.000164084
go_gc_duration_seconds{quantile="1"} 0.000164084
go_gc_duration_seconds_sum 0.000226167
go_gc_duration_seconds_count 3
# HELP go_goroutines Number of goroutines that currently exist.
# TYPE go_goroutines gauge
go_goroutines 25
# HELP go_info Information about the Go environment.
# TYPE go_info gauge
go_info{version="go1.17.2"} 1
# HELP go_memstats_alloc_bytes Number of bytes allocated and still in use.
# TYPE go_memstats_alloc_bytes gauge
go_memstats_alloc_bytes 6.195808e+06
# HELP go_memstats_alloc_bytes_total Total number of bytes allocated, even if freed.
# TYPE go_memstats_alloc_bytes_total counter
go_memstats_alloc_bytes_total 9.482768e+06
# HELP go_memstats_buck_hash_sys_bytes Number of bytes used by the profiling bucket hash table.
# TYPE go_memstats_buck_hash_sys_bytes gauge
go_memstats_buck_hash_sys_bytes 1.449179e+06
# HELP go_memstats_frees_total Total number of frees.
# TYPE go_memstats_frees_total counter
go_memstats_frees_total 29419
# HELP go_memstats_gc_cpu_fraction The fraction of this program's available CPU time used by the GC since the program started.
# TYPE go_memstats_gc_cpu_fraction gauge
go_memstats_gc_cpu_fraction 0.022937924367975027
# HELP go_memstats_gc_sys_bytes Number of bytes used for garbage collection system metadata.
# TYPE go_memstats_gc_sys_bytes gauge
go_memstats_gc_sys_bytes 5.235864e+06
# HELP go_memstats_heap_alloc_bytes Number of heap bytes allocated and still in use.
# TYPE go_memstats_heap_alloc_bytes gauge
go_memstats_heap_alloc_bytes 6.195808e+06
# HELP go_memstats_heap_idle_bytes Number of heap bytes waiting to be used.
# TYPE go_memstats_heap_idle_bytes gauge
go_memstats_heap_idle_bytes 3.792896e+06
# HELP go_memstats_heap_inuse_bytes Number of heap bytes that are in use.
# TYPE go_memstats_heap_inuse_bytes gauge
go_memstats_heap_inuse_bytes 8.036352e+06
# HELP go_memstats_heap_objects Number of allocated objects.
# TYPE go_memstats_heap_objects gauge
go_memstats_heap_objects 16489
# HELP go_memstats_heap_released_bytes Number of heap bytes released to OS.
# TYPE go_memstats_heap_released_bytes gauge
go_memstats_heap_released_bytes 3.416064e+06
# HELP go_memstats_heap_sys_bytes Number of heap bytes obtained from system.
# TYPE go_memstats_heap_sys_bytes gauge
go_memstats_heap_sys_bytes 1.1829248e+07
# HELP go_memstats_last_gc_time_seconds Number of seconds since 1970 of last garbage collection.
# TYPE go_memstats_last_gc_time_seconds gauge
go_memstats_last_gc_time_seconds 1.635778234064745e+09
# HELP go_memstats_lookups_total Total number of pointer lookups.
# TYPE go_memstats_lookups_total counter
go_memstats_lookups_total 0
# HELP go_memstats_mallocs_total Total number of mallocs.
# TYPE go_memstats_mallocs_total counter
go_memstats_mallocs_total 45908
# HELP go_memstats_mcache_inuse_bytes Number of bytes in use by mcache structures.
# TYPE go_memstats_mcache_inuse_bytes gauge
go_memstats_mcache_inuse_bytes 9600
# HELP go_memstats_mcache_sys_bytes Number of bytes used for mcache structures obtained from system.
# TYPE go_memstats_mcache_sys_bytes gauge
go_memstats_mcache_sys_bytes 16384
# HELP go_memstats_mspan_inuse_bytes Number of bytes in use by mspan structures.
# TYPE go_memstats_mspan_inuse_bytes gauge
go_memstats_mspan_inuse_bytes 116144
# HELP go_memstats_mspan_sys_bytes Number of bytes used for mspan structures obtained from system.
# TYPE go_memstats_mspan_sys_bytes gauge
go_memstats_mspan_sys_bytes 131072
# HELP go_memstats_next_gc_bytes Number of heap bytes when next garbage collection will take place.
# TYPE go_memstats_next_gc_bytes gauge
go_memstats_next_gc_bytes 7.935184e+06
# HELP go_memstats_other_sys_bytes Number of bytes used for other system allocations.
# TYPE go_memstats_other_sys_bytes gauge
go_memstats_other_sys_bytes 1.426069e+06
# HELP go_memstats_stack_inuse_bytes Number of bytes in use by the stack allocator.
# TYPE go_memstats_stack_inuse_bytes gauge
go_memstats_stack_inuse_bytes 753664
# HELP go_memstats_stack_sys_bytes Number of bytes obtained from system for stack allocator.
# TYPE go_memstats_stack_sys_bytes gauge
go_memstats_stack_sys_bytes 753664
# HELP go_memstats_sys_bytes Number of bytes obtained from system.
# TYPE go_memstats_sys_bytes gauge
go_memstats_sys_bytes 2.084148e+07
# HELP go_threads Number of OS threads created.
# TYPE go_threads gauge
go_threads 12
```

## 3. 调用指标 RT

启动例子中的客户端，经过几次调用后，会发现增加了对应的数据指标，以默认namespace dubbo 为前缀。

```yaml
# HELP dubbo_provider_service_rt 
# TYPE dubbo_provider_service_rt gauge
dubbo_provider_service_rt{group="dubbo-go",method="SayHello",service="com.apache.dubbo.HelloService",timeout="",version="3.0.0-rc3"} 127542
```

可看到对应接口名、方法名的请求rt时间。该部分调用指标待后续完善。

## 4. 手动数据上报

可在业务代码中调用API进行手动数据上报。支持Counter、Summary、Gauge 类型，并支持多个标签。上报后即可收集。

```go
import "dubbo.apache.org/dubbo-go/v3/metrics/prometheus"

for {
		// metrics refresh per second
		time.Sleep(time.Second)
		prometheus.IncSummary("test_summary", rand.Float64())
		prometheus.IncSummaryWithLabel("test_summary_with_label", rand.Float64(), map[string]string{
			"summarylabel1": "value1", // label and value for this summary
			"summarylabel2": "value2",
		})

		prometheus.IncCounter("test_counter")
		prometheus.IncCounterWithLabel("test_counter_with_label", map[string]string{
			"counterlabel1": "value1", // label and value for this counter
			"counterlabel2": "value2",
		})

		prometheus.SetGauge("test_gauge", rand.Float64())
		prometheus.SetGaugeWithLabel("test_gauge_with_label", rand.Float64(), map[string]string{
			"gaugelabel1": "value1",
			"gaugelabel2": "value2",
		})
	}
```

运行一段时间后，可以收集到如下用户定义指标

```yaml
# HELP dubbo_test_counter 
# TYPE dubbo_test_counter counter
dubbo_test_counter 463
# HELP dubbo_test_counter_with_label 
# TYPE dubbo_test_counter_with_label counter
dubbo_test_counter_with_label{counterlabel1="value1",counterlabel2="value2"} 463
# HELP dubbo_test_gauge 
# TYPE dubbo_test_gauge gauge
dubbo_test_gauge 0.7402836247772934
# HELP dubbo_test_gauge_with_label 
# TYPE dubbo_test_gauge_with_label gauge
dubbo_test_gauge_with_label{gaugelabel1="value1",gaugelabel2="value2"} 0.8360973807546456
# HELP dubbo_test_summary 
# TYPE dubbo_test_summary summary
dubbo_test_summary_sum 228.1800106582441
dubbo_test_summary_count 463
# HELP dubbo_test_summary_with_label 
# TYPE dubbo_test_summary_with_label summary
dubbo_test_summary_with_label{summarylabel1="value1",summarylabel2="value2",quantile="0.5"} 0.5174757569778469
dubbo_test_summary_with_label{summarylabel1="value1",summarylabel2="value2",quantile="0.75"} 0.734268575017709
dubbo_test_summary_with_label{summarylabel1="value1",summarylabel2="value2",quantile="0.9"} 0.9059918694279894
dubbo_test_summary_with_label{summarylabel1="value1",summarylabel2="value2",quantile="0.98"} 0.9761803018478838
dubbo_test_summary_with_label{summarylabel1="value1",summarylabel2="value2",quantile="0.99"} 0.9820270046489341
dubbo_test_summary_with_label{summarylabel1="value1",summarylabel2="value2",quantile="0.999"} 0.9986025122460248
dubbo_test_summary_with_label_sum{summarylabel1="value1",summarylabel2="value2"} 233.609026131067
dubbo_test_summary_with_label_count{summarylabel1="value1",summarylabel2="value2"} 463
```



下一章: [【泛化调用】](./generic.html)
