---
aliases:
  - /zh-cn/overview/mannual/java-sdk/reference-manual/qos/command/
description: "QoS 命令列表、命令大全。"
linkTitle: 命令列表
title: QoS 命令列表，命令大全
type: docs
weight: 2
---

| <span style="display:inline-block;width:150px">QoS 命令</span> | 说明 | <span style="display:inline-block;width:200px">telnet 用法示例</span> | <span style="display:inline-block;width:200px">http 用法示例</span> |
| --- | --- | --- | --- |
| cd | 设定服务上下文，cd 之后所有的命令都是针对该服务 | cd org.demo.DemoService | http://localhost:22222/cd?service=org.demo.DemoService |
| count | 展示服务或方法调用次数。暂时只支持 dubbo 协议，不支持 triple 协议；RpcStatus 实现依赖 Active/Limit Filter，需改造 | count org.demo.DemoService <br/><br/>count org.demo.DemoService methodName | http://localhost:22222/count?service=org.demo.DemoService&method=methodName |
| disableDetailProfiler | 关闭 RPC 调用 profiler 工具（细粒度版本） | disableDetailProfiler | http://localhost:22222/disableDetailProfiler |
| disableRouterSnapshot | 关闭 RPC 请求 Router 路由结果跟踪 | disableRouterSnapshot | http://localhost:22222/disableRouterSnapshot |
| disableSimpleProfiler | 关闭 RPC  调用 profiler 工具（粗粒度版） | disableSimpleProfiler | http://localhost:22222/disableSimpleProfiler |
| enableDetailProfiler | 开启 RPC 调用 profiler 工具（细粒度版本） | enableDetailProfiler | http://localhost:22222/enableDetailProfiler |
| enableRouterSnapshot | 开启 RPC 请求 Router 路由结果跟踪，有助于跟踪路由规则执行是否符合预期 | enableRouterSnapshot org.demo.DemoService | http://localhost:22222/enableRouterSnapshot?service=org.demo.DemoService |
| enableSimpleProfiler | 开启 RPC  调用 profiler 工具（粗粒度版） | enableSimpleProfiler | http://localhost:22222/enableSimpleProfiler |
| getAddress | 查看某个服务的有效 ip 地址列表 | getAddress org.demo.DemoService | http://localhost:22222/getAddress?service=org.demo.DemoService |
| getConfig | dump 当前应用的有效配置 | getConfig | http://localhost:22222/getConfig |
| getEnabledRouterSnapshot | 查看当前 “启用 Router 路由结果跟踪” 的服务列表 | getEnabledRouterSnapshot | http://localhost:22222/getEnabledRouterSnapshot |
| getRecentRouterSnapshot | 查看最近 32 条 “Router 路由结果跟踪” 数据 | getRecentRouterSnapshot | http://localhost:22222/getRecentRouterSnapshot |
| gracefulShutdown | 从注册中心下线当前 ip 实例注册的所有服务，与offline的区别是，该命令会同时通过 tcp 连接告知所有消费方停止调用此实例。<br/><br/>如要恢复，请执行 online 上线所有服务 | gracefulShutdown | http://localhost:22222/gracefulShutdown |
| help | 帮助命令 | help | http://localhost:22222/help |
| invoke | 调用某个 RPC 服务 | invoke org.demo.DemoService.methodName(1234, "abcd", {"prop":"value"}) | ? |
| live | 检查当前进程/服务是否存活，可配置为 kubernetes liveness | live | http://localhost:22222/live |
| loggerInfo | 查看当前日志 logger 配置 | loggerInfo | http://localhost:22222/loggerInfo |
| ls | 查看当前所有服务列表 | ls | http://localhost:22222/ls |
| metrics | 查看 metrics 指标，需开启metrics 统计才能看到数据。什么粒度？ | metrics  | http://localhost:22222/metrics |
| metrics_default | 查看 metrics 指标 ，需开启metrics 统计才能看到数据。什么粒度？ | metrics_default | http://localhost:22222/metrics_default |
| offline | 从注册中心下线某个或多个服务（包含应用级和接口级地址） | offline <br/><br/> offline org.demo.DemoService | http://localhost:22222/offline <br/><br/> http://localhost:22222/offline?service=org.demo.DemoService |
| offlineApp | 从注册中心下线某个或多个服务（仅应用级） | offlineApp <br/><br/> offlineApp org.demo.DemoService | http://localhost:22222/offlineApp?service=org.demo.DemoService |
| offlineInterface | 从注册中心下线某个或多个服务（仅接口级） | offlineInterface <br/><br/> offlineInterface org.demo.DemoService | http://localhost:22222/offlineInterface?service=org.demo.DemoService |
| online | 将一个或多个服务注册到注册中心（包含应用级和接口级地址） | online <br/><br/> online org.demo.DemoService | http://localhost:22222/online?service=org.demo.DemoService |
| onlineApp | 将一个或多个服务注册到注册中心（仅应用级） | onlineApp <br/><br/> onlineApp org.demo.DemoService | http://localhost:22222/onlineApp?service=org.demo.DemoService |
| onlineInterface | 将一个或多个服务注册到注册中心（仅接口级） | onlineInterface <br/><br/> onlineInterface org.demo.DemoService | http://localhost:22222/onlineInterface?service=org.demo.DemoService |
| ps | 查看当前进程信息，包括监听的端口等 | ps | http://localhost:22222/ps |
| publishMetadata | 发布或更新当前应用Metadata数据（可用于手动更新应用级服务发现元数据）。publishMetadata 10 表示延迟 10s 发布。在3.3.0之前版本的命令为 publish-metadata | publishMetadata <br/><br/> publishMetadata 10 | http://localhost:22222/publishMetadata |
| pwd | 查看当前服务上下文，与 cd 配合使用 | pwd | http://localhost:22222/pwd |
| quit | 退出当前 telnet 命令 | quit | 无 |
| ready | 检查当前进程/服务是否准备就绪对外服务，可配置为 kubernetes readiness | ready | http://localhost:22222/ready |
| select | 调用方法？和invoke的关系？ | ? | http://localhost:22222/? |
| serializeCheckStatus | 检查当前在序列化白名单中的类列表 | serializeCheckStatus | http://localhost:22222/serializeCheckStatus |
| serializeWarnedClasses | 检查当前在序列化警告名单中的类列表 | serializeWarnedClasses | http://localhost:22222/serializeWarnedClasses |
| setProfilerWarnPercent | 控制序列化报警频率（仅限在警告名单中的类） | setProfilerWarnPercent 0.75 | http://localhost:22222/setProfilerWarnPercent?k=0.75 |
| shutdown | 尝试关闭当前 Dubbo 应用（销毁所有资源，重启前无法恢复） | shutdown | http://localhost:22222/shutdown |
| startup | 检查当前进程/服务是否已经正常启动，可配置为 kubernetes startup | startup | http://localhost:22222/startup |
| switchLogLevel | 动态调整日志级别 | switchLogLevel debug | http://localhost:22222/switchLogLevel?k=debug |
| switchLogger | 切换日志logger组件。可用 logger 组件，可通过 loggerInfo 查看（切换前请务必确保应用已经加入相关组件依赖） | switchLogger log4j2 | http://localhost:22222/switchLogger?k=log4j2 |
| version | 查看当前使用的 Dubbo 框架版本 | version | http://localhost:22222/version |

