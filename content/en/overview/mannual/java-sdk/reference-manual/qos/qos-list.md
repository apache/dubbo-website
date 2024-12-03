---
aliases:
  - /en/overview/mannual/java-sdk/reference-manual/qos/command/
description: "List of QoS commands, command reference."
linkTitle: Command List
title: QoS Command List, Command Reference
type: docs
weight: 2
---

| <span style="display:inline-block;width:150px">QoS Command</span> | Description | <span style="display:inline-block;width:200px">Telnet Usage Example</span> | <span style="display:inline-block;width:200px">HTTP Usage Example</span> |
| --- | --- | --- | --- |
| cd | Set service context, all subsequent commands will target this service | cd org.demo.DemoService | http://localhost:22222/cd?service=org.demo.DemoService |
| count | Show service or method call count. Currently only supports dubbo protocol, does not support triple protocol; RpcStatus implementation depends on Active/Limit Filter | count org.demo.DemoService <br/><br/>count org.demo.DemoService methodName | http://localhost:22222/count?service=org.demo.DemoService&method=methodName |
| disableDetailProfiler | Disable RPC call profiler tool (fine-grained version) | disableDetailProfiler | http://localhost:22222/disableDetailProfiler |
| disableRouterSnapshot | Disable RPC request Router routing result tracking | disableRouterSnapshot | http://localhost:22222/disableRouterSnapshot |
| disableSimpleProfiler | Disable RPC call profiler tool (coarse-grained version) | disableSimpleProfiler | http://localhost:22222/disableSimpleProfiler |
| enableDetailProfiler | Enable RPC call profiler tool (fine-grained version) | enableDetailProfiler | http://localhost:22222/enableDetailProfiler |
| enableRouterSnapshot | Enable RPC request Router routing result tracking, helpful for tracking if routing rules execution meets expectations | enableRouterSnapshot org.demo.DemoService | http://localhost:22222/enableRouterSnapshot?service=org.demo.DemoService |
| enableSimpleProfiler | Enable RPC call profiler tool (coarse-grained version) | enableSimpleProfiler | http://localhost:22222/enableSimpleProfiler |
| getAddress | View the effective IP address list of a service | getAddress org.demo.DemoService | http://localhost:22222/getAddress?service=org.demo.DemoService |
| getConfig | Dump the effective configuration of the current application | getConfig | http://localhost:22222/getConfig |
| getEnabledRouterSnapshot | View the list of services with "Enabled Router routing result tracking" | getEnabledRouterSnapshot | http://localhost:22222/getEnabledRouterSnapshot |
| getRecentRouterSnapshot | View the most recent 32 "Router routing result tracking" data | getRecentRouterSnapshot | http://localhost:22222/getRecentRouterSnapshot |
| gracefulShutdown | Offline all services registered with the current IP instance from the registry; different from offline, this command will also inform all consumers to stop calling this instance through TCP connection. <br/><br/>To restore, please execute online to put all services back online | gracefulShutdown | http://localhost:22222/gracefulShutdown |
| help | Help command | help | http://localhost:22222/help |
| invoke | Call a specific RPC service | invoke org.demo.DemoService.methodName(1234, "abcd", {"prop":"value"}) | ? |
| live | Check if the current process/service is alive, can be configured as Kubernetes liveness | live | http://localhost:22222/live |
| loggerInfo | View current log logger configuration | loggerInfo | http://localhost:22222/loggerInfo |
| ls | View the current list of all services | ls | http://localhost:22222/ls |
| metrics | View metrics indicators; metrics statistics must be enabled to see data. What granularity? | metrics  | http://localhost:22222/metrics |
| metrics_default | View metrics indicators; metrics statistics must be enabled to see data. What granularity? | metrics_default | http://localhost:22222/metrics_default |
| offline | Take one or more services offline from the registry (including application-level and interface-level addresses) | offline <br/><br/> offline org.demo.DemoService | http://localhost:22222/offline <br/><br/> http://localhost:22222/offline?service=org.demo.DemoService |
| offlineApp | Take one or more application-level services offline from the registry | offlineApp <br/><br/> offlineApp org.demo.DemoService | http://localhost:22222/offlineApp?service=org.demo.DemoService |
| offlineInterface | Take one or more interface-level services offline from the registry | offlineInterface <br/><br/> offlineInterface org.demo.DemoService | http://localhost:22222/offlineInterface?service=org.demo.DemoService |
| online | Register one or more services to the registry (including application-level and interface-level addresses) | online <br/><br/> online org.demo.DemoService | http://localhost:22222/online?service=org.demo.DemoService |
| onlineApp | Register one or more application-level services to the registry | onlineApp <br/><br/> onlineApp org.demo.DemoService | http://localhost:22222/onlineApp?service=org.demo.DemoService |
| onlineInterface | Register one or more interface-level services to the registry | onlineInterface <br/><br/> onlineInterface org.demo.DemoService | http://localhost:22222/onlineInterface?service=org.demo.DemoService |
| ps | View current process information, including listening ports, etc. | ps | http://localhost:22222/ps |
| publishMetadata | Publish or update current application Metadata data (can be used for manual updates of application-level service discovery metadata). publishMetadata 10 means delay of 10s for publishing. In versions before 3.3.0, the command was publish-metadata | publishMetadata <br/><br/> publishMetadata 10 | http://localhost:22222/publishMetadata |
| pwd | View the current service context, used with cd | pwd | http://localhost:22222/pwd |
| quit | Exit the current telnet command | quit | None |
| ready | Check if the current process/service is ready for external service, can be configured as Kubernetes readiness | ready | http://localhost:22222/ready |
| select | Call method? What is the relationship with invoke? | ? | http://localhost:22222/? |
| serializeCheckStatus | Check the list of classes currently in the serialization whitelist | serializeCheckStatus | http://localhost:22222/serializeCheckStatus |
| serializeWarnedClasses | Check the list of classes currently in the serialization warning list | serializeWarnedClasses | http://localhost:22222/serializeWarnedClasses |
| setProfilerWarnPercent | Control serialization alarm frequency (only for classes in the warning list) | setProfilerWarnPercent 0.75 | http://localhost:22222/setProfilerWarnPercent?k=0.75 |
| shutdown | Try to shut down the current Dubbo application (destroy all resources, cannot be recovered before restart) | shutdown | http://localhost:22222/shutdown |
| startup | Check if the current process/service has started normally, can be configured as Kubernetes startup | startup | http://localhost:22222/startup |
| switchLogLevel | Dynamically adjust log level | switchLogLevel debug | http://localhost:22222/switchLogLevel?k=debug |
| switchLogger | Switch log logger component. Available logger components can be viewed through loggerInfo (please ensure the application has joined the relevant component dependencies before switching) | switchLogger log4j2 | http://localhost:22222/switchLogger?k=log4j2 |
| version | View the current Dubbo framework version in use | version | http://localhost:22222/version |

