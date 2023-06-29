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

| Metrics Name                                            | Description                                                                         | 说明                                                                                                                                                    |
|---------------------------------------------------------|-------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| dubbo_provider_qps_total                                | The number of requests received by the provider per second                          | 提供者每秒接收的请求数                                                                                                                                           |
| dubbo_provider_requests_total                           | The total number of received requests by the provider                               | 提供者总的接收请求数                                                                                                                                            |
| dubbo_provider_requests_total_aggregate                 | The total number of received requests by the provider under the sliding window      | 滑动窗口下的提供者总的接收请求数                                                                                                                                      |
| dubbo_provider_requests_processing                      | The number of received requests being processed by the provider                     | 提供者正在处理的接收的请求数                                                                                                                                        |
| dubbo_provider_requests_succeed_total                   | The number of requests successfully received by the provider                        | 提供者请求成功接收的请求数                                                                                                                                         |
| dubbo_provider_requests_succeed_aggregate               | The number of successful requests received by the provider under the sliding window | 滑动窗口下的提供者成功的接收请求数                                                                                                                                     |
| dubbo_provider_rt_milliseconds_min                      | The minimum response time among all requests processed by the provider              | 提供者所有处理请求中最小的响应时间                                                                                                                                     |
| dubbo_provider_rt_min_milliseconds_aggregate            | The minimum response time of the provider under the sliding window                  | 滑动窗口下的提供者最小响应时间                                                                                                                                       |
| dubbo_provider_rt_milliseconds_avg                      | The average response time of all requests processed by the provider                 | 提供者所有处理请求的平均响应时间                                                                                                                                      |
| dubbo_provider_rt_avg_milliseconds_aggregate            | The average response time of the provider under the sliding window                  | 滑动窗口下的提供者平均响应时间                                                                                                                                       |
| dubbo_provider_rt_milliseconds_sum                      | The total time taken by the provider to process all requests                        | 提供者所有处理请求的时间总和                                                                                                                                        |
| dubbo_provider_rt_milliseconds_max                      | The maximum response time among all requests from the provider                      | 提供者所有请求中最大的响应时间                                                                                                                                       |
| dubbo_provider_rt_max_milliseconds_aggregate            | The maximum response time of the provider under the sliding window                  | 滑动窗口下的提供者最大响应时间                                                                                                                                       |
| dubbo_provider_rt_milliseconds_last                     | The current response time in the provider's processing of requests                  | 提供者处理请求中当前的响应时间                                                                                                                                       |
| dubbo_provider_rt_milliseconds_p50                      | The total response time spent by providers processing 50% of requests               | 提供者处理请求中50%的请求耗费的总响应时间                                                                                                                                |
| dubbo_provider_rt_milliseconds_p90                      | The total response time spent by providers processing 90% of requests               | 提供者处理请求中90%的请求耗费的总响应时间                                                                                                                                |
| dubbo_provider_rt_milliseconds_p95                      | The total response time spent by providers processing 95% of requests               | 提供者处理请求中95%的请求耗费的总响应时间                                                                                                                                |
| dubbo_provider_rt_milliseconds_p99                      | The total response time spent by providers processing 99% of requests               | 提供者处理请求中99%的请求耗费的总响应时间                                                                                                                                |
| dubbo_provider_requests_processing_total                | The number of received requests being processed by the provider                     | 提供者正在处理的接收的请求数                                                                                                                                        |
| dubbo_provider_rt_milliseconds_histogram_seconds_bucket | The histogram of response time of the provider under the sliding window             | 滑动窗口下的提供者响应时间直方图                                                                                                                                      |
| dubbo_provider_rt_milliseconds_histogram_seconds_count  | The count of histogram of response time of the provider under the sliding window    | 滑动窗口下的提供者响应时间直方图总数                                                                                                                                    |
| dubbo_provider_rt_milliseconds_histogram_seconds_max    | The max of histogram of response time of the provider under the sliding window      | 滑动窗口下的提供者响应时间直方图最大值                                                                                                                                   |
| dubbo_provider_rt_milliseconds_histogram_seconds_sum    | The sum of histogram of response time of the provider under the sliding window      | 滑动窗口下的提供者响应时间直方图总和                                                                                                                                    |
| dubbo_provider_requests_business_failed_total            | Total Failed Business Requests            | 当RPC请求异常状态码为 RpcException.BIZ_EXCEPTION                                                                                                               |
| dubbo_provider_requests_timeout_total                    | Total Timeout Failed Requests             | 当RPC请求异常为超时异常状态码为 RpcException.TIMEOUT_EXCEPTION                                                                                                      |
| dubbo_provider_requests_limit_total                      | Total Limit Failed Requests               | RPC请求中一般为并发数超过了限制 max concurrent invoke 或者是超过了系统的上限出现了异常状态码为RpcException.LIMIT_EXCEEDED_EXCEPTION或者异常类型为LimitExceededException LimitExceededException |
| dubbo_provider_requests_unknown_failed_total             | Total Unknown Failed Requests             | 暂为归类的其他类型的异常具体分析根据日志来看                                                                                                                                |
| dubbo_provider_requests_failed_total                     | Total Failed Requests                     | 总的异常次数                                                                                                                                                |
| dubbo_provider_requests_failed_total_aggregate           | Total Failed Aggregate Requests           | 聚合请求失败次数，当聚合请求中有一个请求失败时候会触发此异常                                                                                                                        |
| dubbo_provider_requests_failed_network_total             | Total network Failed Requests             | 一般发生在网络连接失败或者网络通信时候发生的异常，对应Java异常为RemotingException                                                                                                   |
| dubbo_provider_requests_failed_service_unavailable_total | Total Service Unavailable Failed Requests | 当不存在提供者或者调用了被禁止访问提的提供者时候会出现此异常 ，对应异常码FORBIDDEN_EXCEPTION                                                                                              |
| dubbo_provider_requests_failed_codec_total               | Total codec failed                        | 序列化相关的异常，异常码SERIALIZATION_EXCEPTION                                                                                                                   |
| dubbo_provider_requests_failed_aggregate                 | Total Failed Aggregate Requests           | 聚合请求失败次数，当聚合请求中有一个请求失败时候会触发此异常                                                                                                                        |
| dubbo_provider_requests_timeout_total                    | Total Timeout Failed Requests             | 当RPC请求异常为超时异常状态码为 RpcException.TIMEOUT_EXCEPTION                                                                                                      |
| dubbo_provider_requests_limit_total                      | Total Limit Failed Requests               | RPC请求中一般为并发数超过了限制 max concurrent invoke 或者是超过了系统的上限出现了异常状态码为RpcException_LIMIT_EXCEEDED_EXCEPTION或者异常类型为LimitExceededException LimitExceededException |
| dubbo_provider_requests_unknown_failed_total             | Total Unknown Failed Requests             | 暂为归类的其他类型的异常具体分析根据日志来看                                                                                                                                |
| dubbo_provider_requests_failed_total                     | Total Failed Requests                     | 总的异常次数                                                                                                                                                |
| dubbo_provider_requests_failed_network_total             | Total network Failed Requests             | 一般发生在网络连接失败或者网络通信时候发生的异常，对应Java异常为RemotingException                                                                                                   |
| dubbo_provider_requests_failed_service_unavailable_total | Total Service Unavailable Failed Requests | 当不存在提供者或者调用了被禁止访问提的提供者时候会出现此异常 ，对应异常码FORBIDDEN_EXCEPTION                                                                                              |
| dubbo_provider_requests_failed_codec_total               | Total codec failed                        | 序列化相关的异常，异常码SERIALIZATION_EXCEPTION                                                                                                                   |

#### Consumer Metrics

| Metrics Name                                            | Description                                                                  | 说明                     |
|---------------------------------------------------------|------------------------------------------------------------------------------|------------------------|
| dubbo_consumer_qps_total                                | The number of requests sent by consumers per second                          | 消费者每秒发送的请求数            |
| dubbo_consumer_requests_total                           | Total number of sent requests by consumers                                   | 消费者总的发送请求数             |
| dubbo_consumer_requests_total_aggregate                 | The total number of requests sent by consumers under the sliding window      | 滑动窗口下的消费者总的发送请求数       |
| dubbo_consumer_requests_processing                      | The number of sent requests that consumers are currently processing          | 消费者正在处理的发送的请求数         |
| dubbo_consumer_requests_succeed_total                   | The number of successful requests sent by consumers                          | 消费者请求成功发送的请求数          |
| dubbo_consumer_requests_succeed_aggregate               | The number of successful requests sent by consumers under the sliding window | 滑动窗口下的消费者成功的发送请求数      |
| dubbo_consumer_rt_milliseconds_min                      | Minimum response time among all consumer requests                            | 消费者所有请求中最小的响应时间        |
| dubbo_consumer_rt_min_milliseconds_aggregate            | The minimum response time of the consumer under the sliding window           | 滑动窗口下的消费者最小响应时间        |
| dubbo_consumer_rt_milliseconds_avg                      | Average response time of all requests from consumers                         | 消费者所有请求的平均响应时间         |
| dubbo_consumer_rt_avg_milliseconds_aggregate            | The average response time of the consumer under the sliding window           | 滑动窗口下的消费者平均响应时间        |
| dubbo_consumer_rt_milliseconds_sum                      | The total time of all consumer requests                                      | 消费者所有请求的时间总和           |
| dubbo_consumer_rt_milliseconds_max                      | Maximum response time among all requests from consumers                      | 消费者所有请求中最大的响应时间        |
| dubbo_consumer_rt_max_milliseconds_aggregate            | The maximum response time of the consumer under the sliding window           | 滑动窗口下的消费者最大响应时间        |
| dubbo_consumer_rt_milliseconds_last                     | The current response time in consumer processing requests                    | 消费者处理请求中当前的响应时间        |
| dubbo_consumer_rt_milliseconds_p50                      | The total response time spent by consumers processing 50% of requests        | 消费者处理请求中50%的请求耗费的总响应时间 |
| dubbo_consumer_rt_milliseconds_p90                      | The total response time spent by consumers processing 90% of requests        | 消费者处理请求中90%的请求耗费的总响应时间 |
| dubbo_consumer_rt_milliseconds_p95                      | The total response time spent by consumers processing 95% of requests        | 消费者处理请求中95%的请求耗费的总响应时间 |
| dubbo_consumer_rt_milliseconds_p99                      | The total response time spent by consumers processing 99% of requests        | 消费者处理请求中99%的请求耗费的总响应时间 |
| dubbo_consumer_rt_milliseconds_histogram_seconds_bucket | Histogram of response time of all requests from consumers                    | 消费者所有请求的响应时间直方图        |
| dubbo_consumer_rt_milliseconds_histogram_seconds_count  | count of Histogram   of all requests from consumers                          | 消费者所有请求的响应时间直方图总数量     |
| dubbo_consumer_rt_milliseconds_histogram_seconds_sum    | sum of Histogram   of all requests from consumers                            | 消费者所有请求的响应时间直方图总和      |
| dubbo_consumer_rt_milliseconds_histogram_seconds_max    | max of Histogram   of all requests from consumers                            | 消费者所有请求的响应时间直方图最大值     |
| dubbo_consumer_requests_business_failed_total            | Total Failed Business Requests            | 当RPC请求异常状态码为RpcException.BIZ_EXCEPTION                                                                                                               |
| dubbo_consumer_requests_timeout_total                    | Total Timeout Failed Requests             | 当RPC请求异常为超时异常状态码为RpcException.TIMEOUT_EXCEPTION                                                                                                      |
| dubbo_consumer_requests_timeout_failed_aggregate         | Total Timeout Failed Requests             | 滑动窗口内的聚合指标 当RPC请求异常为超时异常状态码为RpcException.TIMEOUT_EXCEPTION                                                                                           |
| dubbo_consumer_requests_limit_total                      | Total Limit Failed Requests               | RPC请求状态码为RpcException.LIMIT_EXCEEDED_EXCEPTION或者异常类型为LimitExceededException 一般为并发数超过了限制 max concurrent invoke 或者是超过了系统的上限出现了异常LimitExceededException |
| dubbo_consumer_requests_unknown_failed_total             | Total Unknown Failed Requests             | 暂为归类的其他类型的异常具体分析根据日志来看                                                                                                                               |
| dubbo_consumer_requests_failed_total                     | Total Failed Requests                     | 总的异常次数                                                                                                                                               |
| dubbo_consumer_requests_failed_total_aggregate           | Total Failed Requests                     | 滑动窗口内的聚合指标 总的异常次数                                                                                                                                    |
| dubbo_consumer_requests_failed_network_total             | Total network Failed Requests             | 一般发生在网络连接失败或者网络通信时候发生的异常，对应Java异常为RemotingException                                                                                                  |
| dubbo_consumer_requests_failed_network_total_aggregate   | Total network Failed Requests             | 滑动窗口内的聚合指标 一般发生在网络连接失败或者网络通信时候发生的异常，对应Java异常为RemotingException                                                                                       |
| dubbo_consumer_requests_failed_service_unavailable_total | Total Service Unavailable Failed Requests | 当不存在提供者或者调用了被禁止访问提的提供者时候会出现此异常 ，对应异常码FORBIDDEN_EXCEPTION                                                                                             |
| dubbo_consumer_requests_failed_codec_total               | Total codec failed                        | 序列化相关的异常，异常码SERIALIZATION_EXCEPTION                                                                                                                  |

#### ThreadPool Metrics

| Metrics Name                   | Description              | 说明          |
|--------------------------------|--------------------------|-------------|
| dubbo_thread_pool_max_size     | Thread Pool Max Size     | 线程池最大大小     |
| dubbo_thread_pool_largest_size | Thread Pool Largest Size | 线程池最大大小     |
| dubbo_thread_pool_thread_count | Thread Pool Thread Count | 线程池线程计数     |
| dubbo_thread_pool_queue_size   | Thread Pool Queue Size   | 线程池队列大小     |
| dubbo_thread_pool_active_size  | Thread Pool Active Size  | 线程池活动大小     |
| dubbo_thread_pool_core_size    | Thread Pool Core Size    | 线程池核心大小     |
| dubbo_thread_pool_reject_thread_count    | Thread Pool Reject Count | 线程池拒绝执行任务数量 |

#### Registration Center Metrics

| Metrics Name                                       | Description                             | 说明                     |
|----------------------------------------------------|-----------------------------------------|------------------------|
| dubbo_register_service_rt_milliseconds_avg         | Average Service Register Time           | **接口级** 服务接口注册平均时间     |
| dubbo_register_service_rt_milliseconds_last        | Last Service Register Time              | **接口级** 服务接口注册最新响应时间   |
| dubbo_register_service_rt_milliseconds_max         | Max Service Register Time               | **接口级** 服务接口注册总的最大时间   |
| dubbo_register_service_rt_milliseconds_min         | Min Service Register Time               | **接口级** 服务接口注册总的最小时间   |
| dubbo_register_service_rt_milliseconds_sum         | Sum Service Register Time               | **接口级** 服务接口注册总的注册时间   |
| dubbo_registry_directory_num_all                   | Total Directory Num                     | **接口级** 服务接口目录总数       |
| dubbo_registry_directory_num_disable_total         | Total Disable Directory Num             | **接口级** 服务接口目录禁用总数     |
| dubbo_registry_directory_num_to_reconnect_total    | Total Directory Num To Reconnect        | **接口级** 服务接口目录重连总数     |
| dubbo_registry_directory_num_valid_total           | Total Valid Directory Num               | **接口级** 服务接口目录有效总数     |
| dubbo_registry_notify_num_last                     | Last Notify Num                         | **接口级** 服务接口通知最新响应时间   |
| dubbo_registry_notify_requests_total               | Total Notify Requests                   | **接口级** 服务接口通知总次数      |
| dubbo_register_rt_milliseconds_max                 | Max Response Time                       | **应用级** 实例注册总的最大时间     |
| dubbo_register_rt_milliseconds_avg                 | Average Response Time                   | **应用级** 实例注册总的平均时间     |
| dubbo_register_rt_milliseconds_sum                 | Sum Response Time                       | **应用级** 实例注册总的注册时间     |
| dubbo_register_rt_milliseconds_min                 | Min Response Time                       | **应用级** 实例注册总的最小时间     |
| dubbo_registry_register_requests_succeed_total     | Succeed Register Requests               | **应用级** 实例注册成功的次数      |
| dubbo_registry_register_requests_total             | Total Register Requests                 | **应用级** 实例注册总次数包含成功与失败 |
| dubbo_registry_register_requests_failed_total      | Failed Register Requests                | **应用级** 实例注册失败次数       |
| dubbo_register_rt_milliseconds_last                | Last Response Time                      | **应用级** 实例注册最新响应时间     |
| dubbo_registry_register_service_total              | Total Service-Level Register Requests   | **接口级** 服务接口注册总数       |
| dubbo_registry_register_service_succeed_total      | Succeed Service-Level Register Requests | **接口级** 服务接口注册成功总数     |
| dubbo_registry_register_service_failed_total       | Failed Service-Level Register Requests  | **接口级** 服务接口注册失败总数     |
| dubbo_registry_subscribe_num_failed_total          | Failed Subscribe Num                    | **应用级** 实例订阅失败总数       |
| dubbo_registry_subscribe_num_succeed_total         | Succeed Subscribe Num                   | **应用级** 实例订阅成功总数       |
| dubbo_registry_subscribe_num_total                 | Total Subscribe Num                     | **应用级** 实例订阅总数         |
| dubbo_registry_subscribe_service_num_total         | Total Service-Level Subscribe Num       | **接口级** 服务接口订阅总数       |
| dubbo_registry_subscribe_service_num_succeed_total | Succeed Service-Level Num               | **接口级** 服务接口订阅成功总数     |
| dubbo_registry_subscribe_service_num_failed_total  | Failed Service-Level Num                | **接口级** 服务接口订阅失败总数     |
| dubbo_notify_rt_milliseconds_avg                   | Average Notify Time                     | **接口级** 服务接口通知总的平均时间   |
| dubbo_notify_rt_milliseconds_last                  | Last Notify Time                        | **接口级** 服务接口通知最新响应时间   |
| dubbo_notify_rt_milliseconds_max                   | Max Notify Time                         | **接口级** 服务接口通知总的最大时间   |
| dubbo_notify_rt_milliseconds_min                   | Min Notify Time                         | **接口级** 服务接口通知总的最小时间   |
| dubbo_notify_rt_milliseconds_sum                   | Sum Notify Time                         | **接口级** 服务接口通知总的通知时间   |

#### Metadata Center Metrics

部分元数据指标生效范围：当元数据为集中式配置时（report-metadata为true或者metadataType为remote）

| Metrics Name                                        | Description                           | 说明                                              |
|-----------------------------------------------------|---------------------------------------|-------------------------------------------------|
| dubbo_metadata_push_num_total                       | Total Num                             | **提供者** 推送元数据到元数据中心的成功次数,当提供者元数据发生了变更时触发        |
| dubbo_metadata_push_num_succeed_total               | Succeed Push Num                      | **提供者** 推送元数据到元数据中心的成功次数,当提供者元数据发生了变更时触发        |
| dubbo_metadata_push_num_failed_total                | Failed Push Num                       | **提供者** 推送元数据到元数据中心的失败次数,当提供者元数据发生了变更时并且出现异常触发  |
| dubbo_metadata_subscribe_num_total                  | Total Metadata Subscribe Num          | **消费者** 获取元数据的总次数，当消费者启动时本地磁盘缓存无元数据获取元数据的次数     |
| dubbo_metadata_subscribe_num_succeed_total          | Succeed Metadata Subscribe Num        | **消费者** 获取元数据的总次数，当消费者启动时本地磁盘缓存无元数据并且成功获取元数据的次数 |
| dubbo_metadata_subscribe_num_failed_total           | Failed Metadata Subscribe Num         | **消费者** 获取元数据的总次数，当消费者启动时本地磁盘缓存无元数据并且获取元数据失败的次数 |
| dubbo_push_rt_milliseconds_sum                      | Sum Response Time                     | **提供者** 推送元数据到元数据中心的总时间                         |
| dubbo_push_rt_milliseconds_last                     | Last Response Time                    | **提供者** 推送元数据到元数据中心的最新耗时                        |
| dubbo_push_rt_milliseconds_min                      | Min Response Time                     | **提供者** 推送元数据到元数据中心的最小时间                        |
| dubbo_push_rt_milliseconds_max                      | Max Response Time                     | **提供者** 推送元数据到元数据中心的最大时间                        |
| dubbo_push_rt_milliseconds_avg                      | Average Response Time                 | **提供者** 推送元数据到元数据中心的平均时间                        |
| dubbo_subscribe_rt_milliseconds_sum                 | Sum Response Time                     | **消费者** 获取元数据从元数据中心的总时间                         |
| dubbo_subscribe_rt_milliseconds_last                | Last Response Time                    | **消费者** 推送元数据到元数据中心的最新耗时                        |
| dubbo_subscribe_rt_milliseconds_min                 | Min Response Time                     | **消费者** 推送元数据到元数据中心的最小时间                        |
| dubbo_subscribe_rt_milliseconds_max                 | Max Response Time                     | **消费者** 推送元数据到元数据中心的最大时间                        |
| dubbo_subscribe_rt_milliseconds_avg                 | Average Response Time                 | **消费者** 推送元数据到元数据中心的平均时间                        |
| dubbo_metadata_store_provider_failed_total          | Total Failed Provider Metadata Store  | **提供者** 元数据中心存储提供者元数据失败次数                       |
| dubbo_metadata_store_provider_succeed_total         | Total Succeed Provider Metadata Store | **提供者** 元数据中心存储提供者元数据成功次数                       |
| dubbo_metadata_store_provider_total                 | Total Provider Metadata Store         | **提供者** 元数据中心存储提供者元数据总次数                        |
| dubbo_store_provider_interface_rt_milliseconds_avg  | Average Store Provider Interface Time | **接口级** 服务接口存储提供者平均时间                           |
| dubbo_store_provider_interface_rt_milliseconds_last | Last Store Provider Interface Time    | **接口级** 服务接口存储提供者最新响应时间                         |
| dubbo_store_provider_interface_rt_milliseconds_max  | Max Store Provider Interface Time     | **接口级** 服务接口存储提供者最大时间                           |
| dubbo_store_provider_interface_rt_milliseconds_min  | Min Store Provider Interface Time     | **接口级** 服务接口存储提供者最小时间                           |
| dubbo_store_provider_interface_rt_milliseconds_sum  | Sum Store Provider Interface Time     | **接口级** 服务接口存储提供者总的存储时间                         |
| dubbo_subscribe_service_rt_milliseconds_last        | Last Subscribe Service Time           | **接口级** 服务接口订阅元数据最新响应时间                         |
| dubbo_subscribe_service_rt_milliseconds_max         | Max Subscribe Service Time            | **接口级** 服务接口订阅元数据最大时间                           |
| dubbo_subscribe_service_rt_milliseconds_min         | Min Subscribe Service Time            | **接口级** 服务接口订阅元数据最小时间                           |
| dubbo_subscribe_service_rt_milliseconds_sum         | Sum Subscribe Service Time            | **接口级** 服务接口订阅元数据总的存储时间                         |
| dubbo_subscribe_service_rt_milliseconds_avg         | Average Subscribe Service Time        | **接口级** 服务接口订阅元数据平均时间                           |
 
#### Configcenter

| Metrics Name             | Description          | 说明         |
|--------------------------|----------------------|------------|
| dubbo_configcenter_total | Config Changed Total | 配置中心推送配置次数 |

#### ApplicationInfo

| Metrics Name                 | Description            | 说明             |
|------------------------------|------------------------|----------------|
| dubbo_application_info_total | Total Application Info | 应用信息包含应用名、版本号等 |

