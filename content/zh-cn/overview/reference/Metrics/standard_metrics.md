---
linkTitle: 标准监控指标
title: Dubbo 框架标准监控指标
type: docs
weight: 1
description: |
    描述了 Dubbo 中统计的一些标准监控指标。
---

### Dubbo 指标含义
#### Provider Metrics

| 指标                                        | 含义                     |
|-------------------------------------------|------------------------|
| dubbo_provider_qps_total                  | 提供者每秒接收的请求数            |
| dubbo_provider_requests_total             | 提供者总的接收请求数             |
| dubbo_provider_requests_processing        | 提供者正在处理的接收的请求数         |
| dubbo_provider_requests_succeed_total     | 提供者请求成功接收的请求数          |
| dubbo_provider_requests_total_aggregate   | 滑动窗口下的提供者总的接收请求数       |
| dubbo_provider_requests_succeed_aggregate | 滑动窗口下的提供者成功的接收请求数      |
| dubbo_provider_rt_milliseconds_min             | 提供者所有处理请求中最小的响应时间        |
| dubbo_provider_rt_milliseconds_avg             | 提供者所有处理请求的平均响应时间         |
| dubbo_provider_rt_milliseconds_sum             | 提供者所有处理请求的时间总和           |
| dubbo_provider_rt_milliseconds_max             | 提供者所有请求中最大的响应时间        |
| dubbo_provider_rt_milliseconds_last            | 提供者处理请求中当前的响应时间        |
| dubbo_provider_rt_milliseconds_p95             | 提供者处理请求中95%的请求耗费的总响应时间 |
| dubbo_provider_rt_milliseconds_p99             | 提供者处理请求中99%的请求耗费的总响应时间 |


#### Consumer Metrics

| 指标                                        | 含义                                      |
|-------------------------------------------| ----------------------------------------- |
| dubbo_consumer_qps_total                  | 消费者每秒发送的请求数                    |
| dubbo_consumer_requests_total             | 消费者总的发送请求数                      |
| dubbo_consumer_requests_processing        | 消费者正在处理的发送的请求数              |
| dubbo_provider_requests_succeed_total     | 消费者请求成功发送的请求数                |
| dubbo_consumer_requests_total_aggregate   | 滑动窗口下的消费者总的发送请求数          |
| dubbo_consumer_requests_succeed_aggregate | 滑动窗口下的消费者成功的发送请求数        |
| dubbo_consumer_rt_milliseconds_min             | 消费者所有请求中最小的响应时间            |
| dubbo_consumer_rt_milliseconds_avg             | 消费者所有请求的平均响应时间              |
| dubbo_consumer_rt_milliseconds_sum             | 消费者所有请求的时间总和                  |
| dubbo_consumer_rt_milliseconds_max             | 消费者所有请求中最大的响应时间            |
| dubbo_consumer_rt_milliseconds_last            | 消费者处理请求中当前的响应时间            |
| dubbo_consumer_rt_milliseconds_p95             | 消费者处理请求中95%的请求耗费的总响应时间 |
| dubbo_consumer_rt_milliseconds_p99             | 消费者处理请求中99%的请求耗费的总响应时间 |

#### ThreadPool Metrics
todo
#### Registration Center Metrics
todo
#### Metadata Center Metrics
todo
#### Configuration Center Metrics
todo