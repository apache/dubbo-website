---
title: Metrics data reporting
weight: 7
type: docs
---

Reference Samples: [dubbo-go-samples/metrics](https://github.com/apache/dubbo-go-samples/tree/master/metrics)

## 1. Data reporting configuration

When the metrics: field is not specified, the pull mode prometheus data reporting is enabled by default, the default port is 9090, and the monitoring path defaults to /metrics. You can customize it by referring to the server configuration example below.

```yaml
dubbo:
  application:
    version: 3.0.0-rc3 # version number
  metrics:
    enable: true # default is true
    path: /custom-metrics-path # default is /metrics
    port: 9091 # default is 9090
    namespace: dubbo # default is dubbo as the prefix for data reporting metrics
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
        group: dubbo-go # belongs to the group, need to be consistent with the client
        interface: com.apache.dubbo.HelloService # interface name
```

## 2. Default data reporting indicators

After starting the above server locally, you can collect default data metrics at localhost:9091/custom-metrics-path, including gc, goroutine number, memory usage, etc.

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

## 3. Call indicator RT

Start the client in the example. After several calls, you will find that the corresponding data indicators have been added, prefixed with the default namespace dubbo.

```yaml
# HELP dubbo_provider_service_rt
# TYPE dubbo_provider_service_rt gauge
dubbo_provider_service_rt{group="dubbo-go", method="SayHello", service="com.apache.dubbo.HelloService", timeout="", version="3.0.0-rc3"} 127542
```

You can see the request rt time corresponding to the interface name and method name. This part of the calling indicators is to be improved later.

## 4. Manual data reporting

The API can be called in the business code for manual data reporting. Supports Counter, Summary, Gauge types, and supports multiple labels. It can be collected after reporting.

```go
import "dubbo.apache.org/dubbo-go/v3/metrics/prometheus"

for {
// metrics refresh per second
time. Sleep(time. Second)
prometheus.IncSummary("test_summary", rand.Float64())
prometheus.IncSummaryWithLabel("test_summary_with_label", rand.Float64(), map[string]string{
"summarylabel1": "value1", // label and value for this summary
"summarylabel2": "value2",
})

prometheus. IncCounter("test_counter")
prometheus.IncCounterWithLabel("test_counter_with_label", map[string]string{
"counterlabel1": "value1", // label and value for this counter
"counterlabel2": "value2",
})

prometheus. SetGauge("test_gauge", rand. Float64())
prometheus.SetGaugeWithLabel("test_gauge_with_label", rand.Float64(), map[string]string{
"gaugelabel1": "value1",
"gaugelabel2": "value2",
})
}
```

After running for a period of time, the following user-defined indicators can be collected

```yaml
# HELP dubbo_test_counter
# TYPE dubbo_test_counter counter
dubbo_test_counter 463
# HELP dubbo_test_counter_with_label
# TYPE dubbo_test_counter_with_label counter
dubbo_test_counter_with_label{counterlabel1="value1", counterlabel2="value2"} 463
# HELP dubbo_test_gauge
# TYPE dubbo_test_gauge gauge
dubbo_test_gauge 0.7402836247772934
# HELP dubbo_test_gauge_with_label
# TYPE dubbo_test_gauge_with_label gauge
dubbo_test_gauge_with_label{gaugelabel1="value1", gaugelabel2="value2"} 0.8360973807546456
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