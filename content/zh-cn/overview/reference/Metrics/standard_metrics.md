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

| Metrics Name                   | Description              |
| ------------------------------ | ------------------------ |
| dubbo_thread_pool_max_size     | Thread Pool Max Size     |
| dubbo_thread_pool_largest_size | Thread Pool Largest Size |
| dubbo_thread_pool_thread_count | Thread Pool Thread Count |
| dubbo_thread_pool_queue_size   | Thread Pool Queue Size   |
| dubbo_thread_pool_active_size  | Thread Pool Active Size  |
| dubbo_thread_pool_core_size    | Thread Pool Core Size    |
|                                |                          |

#### Registration Center Metrics

| Metrics Name                                       | Description                             | 说明                                     |
| -------------------------------------------------- | --------------------------------------- | ---------------------------------------- |
| dubbo_register_rt_milliseconds_max                 | Max Response Time                       | **应用级:** 实例注册总的最大时间         |
| dubbo_register_rt_milliseconds_avg                 | Average Response Time                   | **应用级：**实例注册总的平均时间         |
| dubbo_register_rt_milliseconds_sum                 | Sum Response Time                       | **应用级：**实例注册总的注册时间         |
| dubbo_register_rt_milliseconds_min                 | Min Response Time                       | **应用级：**实例注册总的最小时间         |
| dubbo_registry_register_requests_succeed_total     | Succeed Register Requests               | **应用级：**实例注册成功的次数           |
| dubbo_registry_register_requests_total             | Total Register Requests                 | **应用级：**实例注册总次数包含成功与失败 |
| dubbo_registry_register_requests_failed_total      | Failed Register Requests                | **应用级：**实例注册失败次数             |
| dubbo_register_rt_milliseconds_last                | Last Response Time                      | **应用级：**实例注册最新响应时间         |
| dubbo_registry_register_requests_failed_total      | Failed Register Requests                | **应用级：**实例注册失败次数             |
| dubbo_registry_register_service_total              | Total Service-Level Register Requests   |                                          |
| dubbo.registry.register.service.succeed.total      | Succeed Service-Level Register Requests |                                          |
| dubbo.registry.register.service.failed.total       | Failed Service-Level Register Requests  |                                          |
| dubbo.registry.subscribe.service.num.total         | Total Service-Level Subscribe Num       |                                          |
| dubbo.registry.subscribe.service.num.succeed.total | Succeed Service-Level Num               |                                          |
| dubbo.registry.subscribe.service.num.failed.total  | Failed Service-Level Num                |                                          |





#### Metadata Center Metrics
元数据指标生效范围：当元数据为集中式配置时（report-metadata为true或者metadataType为remote）
| Metrics Name                               | Description                    | 说明                                                         |
| ------------------------------------------ | ------------------------------ | ------------------------------------------------------------ |
| dubbo_metadata_push_num_total              | Total Num                      | **提供者** 推送元数据到元数据中心的成功次数,当提供者元数据发生了变更时触发 |
| dubbo_metadata_push_num_succeed_total      | Succeed Push Num               | **提供者** 推送元数据到元数据中心的成功次数,当提供者元数据发生了变更时触发 |
| dubbo_metadata_push_num_failed_total       | Failed Push Num                | **提供者** 推送元数据到元数据中心的失败次数,当提供者元数据发生了变更时并且出现异常触发 |
| dubbo_metadata_subscribe_num_total         | Total Metadata Subscribe Num   | **消费者** 获取元数据的总次数，当消费者启动时本地磁盘缓存无元数据获取元数据的次数 |
| dubbo_metadata_subscribe_num_succeed_total | Succeed Metadata Subscribe Num | **消费者** 获取元数据的总次数，当消费者启动时本地磁盘缓存无元数据并且成功获取元数据的次数 |
| dubbo_metadata_subscribe_num_failed_total  | Failed Metadata Subscribe Num  | **消费者** 获取元数据的总次数，当消费者启动时本地磁盘缓存无元数据并且获取元数据失败的次数 |
| dubbo_push_rt_milliseconds_sum             | Sum Response Time              | **提供者：**推送元数据到元数据中心的总时间                   |
| dubbo_push_rt_milliseconds_last            | Last Response Time             | **提供者：**推送元数据到元数据中心的最新耗时                 |
| dubbo_push_rt_milliseconds_min             | Min Response Time              | **提供者：**推送元数据到元数据中心的最小时间                 |
| dubbo_push_rt_milliseconds_max             | Max Response Time              | **提供者：**推送元数据到元数据中心的最大时间                 |
| dubbo_push_rt_milliseconds_avg             | Average Response Time          | **提供者：**推送元数据到元数据中心的平均时间                 |
| dubbo_subscribe_rt_milliseconds_sum        | Sum Response Time              | **消费者：** 获取元数据从元数据中心的总时间                  |
| dubbo_subscribe_rt_milliseconds_last       | Last Response Time             | **消费者：**推送元数据到元数据中心的最新耗时                 |
| dubbo_subscribe_rt_milliseconds_min        | Min Response Time              | **消费者：**推送元数据到元数据中心的最小时间                 |
| dubbo_subscribe_rt_milliseconds_max        | Max Response Time              | **消费者：**推送元数据到元数据中心的最大时间                 |
| dubbo_subscribe_rt_milliseconds_avg        | Average Response Time          | **消费者：**推送元数据到元数据中心的平均时间                 |

 
####  Consumer Or Provider Exception
| MetricsName                                        | Description                                                  |
| -------------------------------------------------- | ------------------------------------------------------------ |
| dubbo.%s.requests.business.failed.total            | Total Failed Business Requests 当RPC请求异常状态码为RpcException.BIZ_EXCEPTION |
| dubbo.%s.requests.timeout.total                    | Total Timeout Failed Requests 当RPC请求异常为超时异常状态码为RpcException.TIMEOUT_EXCEPTION |
| dubbo.%s.requests.limit.total                      | Total Limit Failed Requests RPC请求状态码为RpcException.LIMIT_EXCEEDED_EXCEPTION或者异常类型为LimitExceededException 一般为并发数超过了限制 max concurrent invoke 或者是超过了系统的上限出现了异常LimitExceededException |
| dubbo.%s.requests.unknown.failed.total             | Total Unknown Failed Requests 暂为归类的其他类型的异常具体分析根据日志来看 |
| dubbo.%s.requests.failed.total                     | Total Failed Requests 总的异常次数                           |
| dubbo.%s.requests.failed.network.total             | Total network Failed Requests 一般发生在网络连接失败或者网络通信时候发生的异常，对应Java异常为RemotingException |
| dubbo.%s.requests.failed.service.unavailable.total | Total Service Unavailable Failed Requests 当不存在提供者或者调用了被禁止访问提的提供者时候会出现此异常 ，对应异常码FORBIDDEN_EXCEPTION |
| dubbo.%s.requests.failed.codec.total               | 序列化相关的异常，异常码SERIALIZATION_EXCEPTION              |


#### Configcenter
| Metrics Name             | Description          |
| ------------------------ | -------------------- |
| dubbo.configcenter.total | Config Changed Total |


#### ApplicationInfo
 | Metrics Name                 | Description            |
| ---------------------------- | ---------------------- |
| dubbo_application_info_total | Total Application Info |
 