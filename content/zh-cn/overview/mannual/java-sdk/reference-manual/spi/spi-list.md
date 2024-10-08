---
description: "Dubbo SPI 定义手册，框架中的 SPI 定义大全。"
linkTitle: SPI 插件列表
title: Dubbo SPI 插件及详情
type: docs
weight: 2
---

Dubbo 在框架中定义了非常多的扩展点，因此，**当你发现官方库没法满足业务需求，想为 Dubbo 框架提供定制能力时，请优先查阅以下扩展点定义，看是否能通过提供扩展实现的方式无侵入的定制 Dubbo 框架**。

具体可参见本文下方的 [Dubbo SPI 扩展定义汇总](./#扩展点汇总)。

<img src="/imgs/v3/concepts/extension-use.png" style="max-width:600px;height:auto;">

## 扩展点汇总

### 生命周期与事件回调

| **SPI 扩展定义** | **功能说明** | **示例实现** | **激活条件** |
| --- | --- | --- | --- |
| org.apache.dubbo.common.lang.ShutdownHookCallback | 优雅下线回调逻辑扩展点，Dubbo 进程销毁前会调用所有 ShutdownHookCallback 实现 | 无 | 无需配置，自动激活 |
| org.apache.dubbo.common.threadpool.event.ThreadPoolExhaustedListener | 当 dubbo 业务线程池满时，会调用这个扩展点发出事件通知 | org.apache.dubbo.metrics.collector.sample.MetricThreadPoolExhaustedListener | 通过 dubbo.protocol.thread-pool-exhausted-listeners=spi-name1,spi-name2 设置激活哪些实现 |
| org.apache.dubbo.rpc.ExporterListener | 每个 Exporter 成功 export/unexport 发布后，都会回调这个扩展点 | org.apache.dubbo.rpc.listener.InjvmExporterListener | 扩展实现必须增加 @Activate 注解激活，可按需配置激活条件。支持通过在 URL 中配置 exporter.listener=spi-name1,spi-name2 控制具体激活哪个实现|
| org.apache.dubbo.rpc.InvokerListener | 每个服务 Invoker 成功 refer/destroy 发布后，都会回调这个扩展点 | org.apache.dubbo.rpc.protocol.CountInvokerListener | 扩展实现必须增加 @Activate 注解激活，可按需配置激活条件。支持通过在 URL 中配置 invoker.listener=spi-name1,spi-name2 控制具体激活哪个实现 |
| org.apache.dubbo.common.status.StatusChecker | 对外透出内部组件状态的扩展点，每个需要透出状态的组件均可实现此扩展点。 | org.apache.dubbo.rpc.protocol.dubbo.status.ThreadPoolStatusChecker | 通过设置 dubbo.protocol.status=spi-name1,spi-name2 激活 |
| org.apache.dubbo.config.ServiceListener | ServciceConfig 回调扩展点，每个 ServiceConfig 成功 export/unexport 后都会被回调。拦截点与 ExporterListener 略有不同 | 无 | 无需配置，自动激活 |
| org.apache.dubbo.registry.RegistryServiceListener | 服务 URL 向注册中心 register/unregister 之后的回调扩展点，所有扩展实现会被依次通知 | 无 | 扩展实现必须增加 @Activate 注解激活，默认激活。支持通过在 Registry URL 中配置 registry.listeners 控制具体激活哪个实现，如dubbo.registry.parameters.registry.listeners=spi-name1,spi-name2 |
| org.apache.dubbo.registry.integration.RegistryProtocolListener | 用于接口级服务发现。 | org.apache.dubbo.registry.client.migration.MigrationRuleListener | RegistryProtocol listener is introduced to provide a chance to user to customize or change export and refer behavior of RegistryProtocol. For example: re-export or re-refer on the fly when certain condition meets. |
| org.apache.dubbo.qos.probe.LivenessProbe | 生命周期检测扩展点。可通过 qos live http 接口配置为 k8s liveness 检测，qos live 会检查所有 LivenessProbe 扩展点实现 | 无 | 扩展实现必须增加 @Activate 注解激活，默认激活。支持通过在 URL 中配置 dubbo.application.liveness-probe=spi-name1,spi-name2 控制具体激活哪些实现 |
| org.apache.dubbo.qos.probe.ReadinessProbe | 生命周期检测扩展点。可通过 qos ready http 接口配置为 k8s readiness 检测，qos ready 会检查所有 ReadinessProbe 扩展点实现 | 无 | 扩展实现必须增加 @Activate 注解激活，默认激活。支持通过在 URL 中配置 dubbo.application.readiness-probe=spi-name1,spi-name2 控制具体激活哪些实现 |
| org.apache.dubbo.qos.probe.StartupProbe | 生命周期检测扩展点。可通过 qos startup http 接口配置为 k8s startup 检测，qos startup 会检查所有 StartupProbe 扩展点实现 | 无 | 扩展实现必须增加 @Activate 注解激活，默认激活。支持通过在 URL 中配置 dubbo.application.startup-probe=spi-name1,spi-name2 控制具体激活哪些实现 |
| org.apache.dubbo.common.deploy.ApplicationDeployListener | Dubbo 进程启动生命周期中的回调扩展，支持包括初始化、启动成功、停止等多个回调点。如果是多应用部署的场景，则是单应用粒度的生命周期回调。 | org.apache.dubbo.security.cert.CertDeployerListener | 无需配置，自动激活 |
| org.apache.dubbo.common.deploy.ModuleDeployListener | Dubbo 进程启动生命周期中的回调扩展，支持包括初始化、启动成功、停止等多个回调点。如果是多模块部署的场景，则是单模块粒度的生命周期回调。 | 无 | 无需配置，自动激活 |
| org.apache.dubbo.qos.api.BaseCommand | QoS 命令扩展点，实现该扩展点增加新 QoS 命令。 | org.apache.dubbo.qos.command.impl.Ls | 无需配置，自动激活 |
| ~~org.apache.dubbo.remoting.telnet.TelnetHandler~~ | | | |
| ~~org.apache.dubbo.config.bootstrap.DubboBootstrapStartStopListener~~ | |  |  |


### 配置相关

| **SPI 扩展定义** | **功能说明** | **示例实现** | **激活条件** |
| --- | --- | --- | --- |
| org.apache.dubbo.common.extension.ExtensionInjector | IoC 注入器扩展点，通过扩展可以实现多种类型的示例自动注入，用于 Dubbo 框架 SPI 实例与不同 IOC 容器之间的结合，如支持 Spring Bean 注入 SPI 实例。 | org.apache.dubbo.config.spring.extension.SpringExtensionInjector | 无需额外配置，自动激活 |
| org.apache.dubbo.common.infra.InfraAdapter | 用于自定义加载环境变量的扩展实现，可以批量的通过编码的方式获取你要读取的环境变量，框架会自动将这些值附加到每个服务的 URL 参数中。 | org.apache.dubbo.common.infra.support.EnvironmentAdapter | 无需额外配置，自动激活 |
| org.apache.dubbo.common.logger.LoggerAdapter | 日志框架适配，如果要额外提供 Dubbo 不支持的日志框架适配，可以使用此扩展点。 | org.apache.dubbo.common.logger.slf4j.Slf4jLoggerAdapter | 通过配置 dubbo.application.logger=spi-name 激活 |
| org.apache.dubbo.config.ConfigInitializer | 在配置初始化之前，服务初始化之前定制 ServciceConfig、ReferenceConfig 参数 | 无 | 扩展实现必须增加 @Activate 注解激活，可按需增加激活条件 |
| org.apache.dubbo.config.CommonConfigPostProcessor | 在配置初始化之后，服务初始化之前定制 ServciceConfig、ReferenceConfig 参数。在 ConfigInitializer 之后执行。 | org.apache.dubbo.rpc.protocol.rest.config.FeignClientAnnotationConfigPostProcessor | 扩展实现必须增加 @Activate 注解激活，可按需增加激活条件 |
| org.apache.dubbo.config.spring.context.DubboSpringInitCustomizer | Custom dubbo spring initialization. Customize dubbo spring initialization on bean registry processing phase.  | 无 | 无需额外配置，自动激活 |

### 服务发现
| **SPI 扩展定义** | **功能说明** | **示例实现** | **激活条件** |
| --- | --- | --- | --- |
| org.apache.dubbo.registry.AddressListener | 用于服务发现。URL 地址通知发生时会调用此扩展点实现，可做一些地址预处理操作 | 无 | 扩展实现必须增加 @Activate 注解激活，可按需配置激活条件 |
| org.apache.dubbo.registry.ProviderFirstParams | 用于服务发现。用于指定 URL 参数优先级，改扩展点实现返回的参数列表（provider优先级高于consumer），多个扩展实现的参数列表会合并 | org.apache.dubbo.registry.support.DefaultProviderFirstParams | 无需配置，自动激活 |
| org.apache.dubbo.registry.RegistryFactory | 用于接口级服务发现。通过扩展此可SPI实现不同的注册中心适配 | org.apache.dubbo.registry.nacos.NacosRegistryFactory | 通过配置 dubbo.registry.address=spi-name://ip:port 激活 |
| org.apache.dubbo.registry.client.RegistryClusterIdentifier | 用于应用级服务发现。Dubbo 框架支持为注册中心集群指定标识，通过此标识 key 可以对地址 URL 进行分类（来自哪个集群），从而根据不同集群做一些事情。此扩展点给用户机会指定依据哪个 key 来作为注册中心集群分类。 | org.apache.dubbo.registry.client.DefaultRegistryClusterIdentifier | 通过 dubbo.provider.parameters.registry-cluster-type=spi-name 激活指定扩展实现 |
| org.apache.dubbo.registry.client.ServiceDiscoveryFactory | 用于应用级服务发现。通过扩展此可SPI实现不同的注册中心适配 | org.apache.dubbo.registry.nacos.NacosServiceDiscoveryFactory | 通过配置 dubbo.registry.address=spi-name://ip:port 激活，同时指定 dubbo.registry.register-mode=instance 激活应用级服务发现 |
| org.apache.dubbo.registry.client.ServiceInstanceCustomizer | 用于应用级服务发现。在应用级地址实例 URL 注册到注册中心之前，通过此扩展点实现进行定制 | org.apache.dubbo.registry.client.metadata.ServiceInstanceMetadataCustomizer | 无需配置，自动激活 |
| org.apache.dubbo.registry.client.migration.MigrationAddressComparator | 用于应用级服务发现。作为接口级地址向应用级别地址迁移机制的一部分，在框架决策是否迁移之前，用于对两边的地址做比较，可自行定制决策逻辑。 | org.apache.dubbo.registry.client.migration.DefaultMigrationAddressComparator | 无需配置，自动激活 |
| ~~org.apache.dubbo.registry.client.migration.PreMigratingConditionChecker~~ | ~~用于应用级服务发现。作为接口级地址向应用级别地址迁移机制的一部分，在框架决策是否迁移之前，可自行定制检查逻辑。~~ | ~~无~~ | ~~无需配置，自动激活~~ |
| org.apache.dubbo.metadata.MetadataParamsFilter | 用于应用级服务发现。通过该扩展点可以控制哪些参数注册到注册中心，哪些参数注册到服务元数据。 | org.apache.dubbo.metadata.DefaultMetadataParamsFilter | 扩展实现必须增加 @Activate 注解激活。支持通过在 URL 中配置 params-filter 控制具体激活哪个实现，如 dubbo.provider.parameters.params-filter=-default,spi-name1 表示关闭所有扩展实现仅启用 spi-name1 实现 |
| org.apache.dubbo.registry.client.metadata.ServiceInstanceNotificationCustomizer | 用于应用级服务发现。识别特殊类型的地址 URL，示例扩展实现用于识别 Spring Cloud Alibaba Dubbo 类型地址 | org.apache.dubbo.registry.client.metadata.SpringCloudServiceInstanceNotificationCustomizer | 无需配置，自动激活。 |
| org.apache.dubbo.registry.integration.ServiceURLCustomizer | 用于接口级服务发现。在优化接口级地址列表并做 URL 精简时，可以通过该扩展点指定哪些 URL 注册到注册中心、哪些 URL 不注册。当有多个扩展实现时，效果叠加。 | org.apache.dubbo.registry.integration.DefaultServiceURLCustomizer | 无需配置，自动激活。 |
| org.apache.dubbo.rpc.cluster.ProviderURLMergeProcessor | 用于接口级服务发现。该扩展点用于完成 consumer url 和 provider url 合并，可以使用不同的实现控制合并策略，以确定保留不同的 key，使用不同的覆盖关系（仅对接口级服务发现有效） | org.apache.dubbo.rpc.cluster.support.merger.DefaultProviderURLMergeProcessor | 可通过配置 dubbo.consumer.url-merge-processor=spi-name 启用指定扩展实现 |

### RPC与流量管控
| **SPI 扩展定义** | **功能说明** | **示例实现** | **激活条件** |
| --- | --- | --- | --- |
| org.apache.dubbo.rpc.Protocol | RPC 协议实现扩展点。通过扩展该扩展点增加更多的协议实现 | org.apache.dubbo.rpc.protocol.dubbo.DubboProtocol | 通过配置 dubbo.prorocol.name=spi-nam,e 激活 |
| org.apache.dubbo.rpc.ProxyFactory | RPC 代理实现扩展点。可以提供多种不同的代理实现，如字节码增强、JDK 等 | org.apache.dubbo.rpc.proxy.javassist.JavassistProxyFactory | 通过配置 dubbo.application.compiler=spi-name 激活 |
| org.apache.dubbo.rpc.ZoneDetector | 在多注册中心场景下，Dubbo 提供了自动同区域优先的匹配策略。此扩展点可以让用户更方便的扩展 zone 读取策略，以更灵活的决策当前请求属于哪个 zone。默认情况下框架会从 RpcContext 特定的 key 读取 | 无 | 只会有一个 ZoneDetector 实现会被激活。key 为 `default`的扩展实现将优先被激活。 |
| org.apache.dubbo.rpc.cluster.Cluster | RPC 请求容灾策略扩展点，比如通过 Cluster 可以设置在请求失败时动作，如 FailoverCluster、FailfastCluster 等。 | org.apache.dubbo.rpc.cluster.support.FailoverCluster | 通过配置 dubbo.consumer.cluster=spi-name 激活 |
| org.apache.dubbo.rpc.cluster.LoadBalance | 负载均衡策略扩展点，通过扩展可以实现不同的负载均衡策略。 | org.apache.dubbo.rpc.cluster.loadbalance.RandomLoadBalance | 通过配置 dubbo.consumer.loadbalance=spi-name 激活 |
| org.apache.dubbo.rpc.HeaderFilter | 在 RPC 请求前，通过不同的扩展实现各种 attachment/header 校验策略 | org.apache.dubbo.rpc.filter.TokenHeaderFilter | 扩展实现必须增加 @Activate 注解激活。支持通过在 URL 中配置 header.filter=spi-name1,spi-name2 控制具体激活哪个实现 |
| org.apache.dubbo.rpc.Filter | RPC 请求过滤器，用于在请求发起前、响应结果返回后，对 RPC 调用进行过滤 | org.apache.dubbo.rpc.filter.GenericFilter | 扩展实现必须增加 @Activate 注解激活，可按需配置激活条件如@Activate(group="consumer")。支持通过在 URL 中配置 service.filter=spi-name1,spi-name2 控制具体在provider侧激活哪些实现；支持通过在 URL 中配置 reference.filter=spi-name1,spi-name2 控制具体在consumer侧激活哪些实现 |
| org.apache.dubbo.rpc.cluster.filter.ClusterFilter | RPC 请求过滤器，与 Filter 作用相同，但 ClusterFilter 发生在选址之前。对于大部分用户可以直接使用：org.apache.dubbo.rpc.Filter | org.apache.dubbo.rpc.cluster.filter.support.ConsumerContextFilter | 扩展实现必须增加 @Activate 注解激活，可按需配置激活条件。支持通过在 URL 中配置 filter=spi-name1,spi-name2 控制具体激活哪个实现 |
| org.apache.dubbo.rpc.cluster.RouterFactory | 路由器扩展点，可以通过扩展增加不同的路由规则策略。 | 无 | 扩展实现必须增加 @Activate 注解激活，可按需配置激活条件。支持通过在 URL 中配置 router=spi-name1,spi-name2 控制具体激活哪个实现 |
| org.apache.dubbo.rpc.cluster.router.state.StateRouterFactory | 路由器扩展点，可以通过扩展增加不同的路由规则策略。与 RouterFactory 作用一致，但具备更高性能。对大部分用户，为简单起见可直接使用 RouterFactory | org.apache.dubbo.rpc.cluster.router.condition.ConditionStateRouterFactory | 扩展实现必须增加 @Activate 注解激活，可按需配置激活条件。支持通过在 URL 中配置 router=spi-name1,spi-name2 控制具体激活哪个实现 |
| org.apache.dubbo.rpc.cluster.ConfiguratorFactory | 动态配置规则扩展点，通过增加扩展可以增加不同的动态配置规则策略 | org.apache.dubbo.rpc.cluster.configurator.override.OverrideConfiguratorFactory | 扩展实现必须增加 @Activate 注解激活，可按需配置激活条件。支持通过在 URL 中配置 router=spi-name1,spi-name2 控制具体激活哪个实现 |
| org.apache.dubbo.rpc.cluster.router.condition.matcher.pattern.ValuePattern | 路由规则处理扩展点。条件路由规则内部的规则处理器，通过扩展可支持更丰富的规则和匹配条件 | org.apache.dubbo.rpc.cluster.router.condition.matcher.pattern.range.RangeValuePattern | 自动激活，通过规则控制激活哪个具体实现 |
| org.apache.dubbo.rpc.cluster.router.condition.matcher.ConditionMatcherFactory | 路由规则处理扩展点。条件路由规则内部的规则处理器，通过扩展可支持更丰富的规则和匹配条件 | org.apache.dubbo.rpc.cluster.router.condition.matcher.argument.ArgumentConditionMatcherFactory | 扩展实现必须增加 @Activate 注解激活，可按需配置激活条件。 |
| org.apache.dubbo.rpc.cluster.router.mesh.util.TracingContextProvider | MeshRule 路由规则处理扩展点，可用于从不同的第三方 Tracing 系统读取上下文 | 无 | 无需配置，自动激活 |
| org.apache.dubbo.rpc.cluster.router.mesh.route.MeshEnvListenerFactory | MeshRule 路由规则处理扩展点 | 无 | 无需配置，自动激活 |
| org.apache.dubbo.cache.CacheFactory | 缓存实现扩展点，用于缓存 RPC 调用结果 | org.apache.dubbo.cache.support.expiring.ExpiringCacheFactory | 通过在 URL 中配置 cache=spi-name 控制具体激活哪个实现 |
| org.apache.dubbo.common.serialize.Serialization | 序列化协议扩展点，如果要扩展新的序列化协议，可以使用此扩展点。 | org.apache.dubbo.common.serialize.hessian2.Hessian2Serialization | 通过配置 dubbo.provider.serialization=spi-name 激活 |
| org.apache.dubbo.common.threadpool.ThreadPool | 线程池策略扩展点。目前仅适用于 dubbo 协议实现，不适用于 triple 协议。 | org.apache.dubbo.common.threadpool.support.fixed.FixedThreadPool | 通过配置 dubbo.provider.threadpool=spi-name 激活 |
| org.apache.dubbo.rpc.executor.IsolationExecutorSupportFactory | 线程池隔离策略扩展点。如 dubbo 协议、triple 协议都可以定义不同的隔离策略，每个协议可设置一个线程池隔离策略。 | org.apache.dubbo.rpc.protocol.tri.transport.TripleIsolationExecutorSupportFactory | 跟随用户配置的 dubbo.protocol.name，因此必须确保配置的 key 值与 rpc 协议名相同 |
| org.apache.dubbo.rpc.PenetrateAttachmentSelector | 通过此扩展点可以自定义参数全链路传递（dubbo链路），Dubbo 默认只会在 A->B 链路传递参数，通过此扩展点可以控制参数在 A->B->C一直传递下去。 | 无 | 无需配置，自动激活 |
| ~~org.apache.dubbo.rpc.cluster.interceptor.ClusterInterceptor~~ | ~~与 ~~~~org.apache.dubbo.rpc.cluster.filter.ClusterFilter 相同，废弃~~ | ~~废弃~~ |  |

### 服务治理

| **SPI 扩展定义** | **功能说明** | **示例实现** | **激活条件** |
| --- | --- | --- | --- |
| org.apache.dubbo.common.config.configcenter.DynamicConfigurationFactory | 配置中心核心扩展点。用于提供不同配置中心适配实现。 | org.apache.dubbo.configcenter.support.nacos.NacosDynamicConfigurationFactory | 通过指定 dubbo.config-center.address=spi-name:// 激活 |
| org.apache.dubbo.metadata.report.MetadataReportFactory | 元数据中心扩展点，用于提供新的元数据中心存储实现 | org.apache.dubbo.metadata.store.nacos.NacosMetadataReportFactory | 通过指定 dubbo.metadata-report.address=spi-name:// 激活 |
| org.apache.dubbo.metrics.report.MetricsReporterFactory | Metrics 指标上报扩展点，可以通过扩展实现适配到不同的 Metrics 后端服务 | org.apache.dubbo.metrics.prometheus.PrometheusMetricsReporterFactory | 通过指定 dubbo.metrics.protocol=spi-name 激活 |
| org.apache.dubbo.metrics.collector.MetricsCollector | 框架内部 Metrics 采集扩展点，可以通过扩展支持 RPC、注册中心等不同组件的 metrics 埋点数据采集 | org.apache.dubbo.metrics.registry.collector.RegistryMetricsCollector | 扩展实现必须增加 @Activate 注解激活，可按需增加激活条件 |
| org.apache.dubbo.auth.spi.AccessKeyStorage | 用于 dubbo-auth 模块，该扩展点可不同的扩展 AK 来源读取方式 | org.apache.dubbo.auth.DefaultAccessKeyStorage | 通过指定 accessKey.storage  URL 参数激活 |
| org.apache.dubbo.auth.spi.Authenticator | 用于 dubbo-auth 模块，该扩展点用于实现具体的认证逻辑 | org.apache.dubbo.auth.AccessKeyAuthenticator | 通过指定 authenticator URL 参数激活 |
| org.apache.dubbo.common.ssl.CertProvider | TLS 证书来源扩展，用于适配不同的证书来源实现 | org.apache.dubbo.common.ssl.impl.SSLConfigCertProvider | 扩展实现必须增加 @Activate 注解激活 |

### 协议与传输层实现
| **SPI 扩展定义** | **功能说明** | **示例实现** | **激活条件** |
| --- | --- | --- | --- |
| org.apache.dubbo.remoting.ChannelHandler |  |  |
| org.apache.dubbo.remoting.Codec |  |  |
| org.apache.dubbo.remoting.Codec2 |  |  |
| org.apache.dubbo.remoting.Dispatcher |  |  |
| org.apache.dubbo.remoting.Transporter |  |  |
| org.apache.dubbo.rpc.protocol.dubbo.ByteAccessor |  |  |
| org.apache.dubbo.remoting.api.pu.PortUnificationTransporter |  |  |
| org.apache.dubbo.remoting.api.WireProtocol |  |  |
| org.apache.dubbo.remoting.api.connection.ConnectionManager |  |  |
| org.apache.dubbo.remoting.exchange.Exchanger |  |  |
| org.apache.dubbo.remoting.http.HttpBinder |  |  |
| org.apache.dubbo.remoting.http12.message.HttpMessageEncoderFactory |  |  |
| org.apache.dubbo.remoting.http12.message.HttpMessageDecoderFactory |  |  |
| org.apache.dubbo.remoting.http12.h2.Http2ServerTransportListenerFactory |  |  |
| org.apache.dubbo.remoting.http12.h1.Http1ServerTransportListenerFactory |  |  |
| org.apache.dubbo.remoting.http12.message.HttpMessageAdapterFactory |  |  |
| org.apache.dubbo.metadata.annotation.processing.builder.TypeBuilder |  |  |
| org.apache.dubbo.metadata.annotation.processing.rest.AnnotatedMethodParameterProcessor |  |  |
| org.apache.dubbo.metadata.annotation.processing.rest.ServiceRestMetadataResolver |  |  |
| org.apache.dubbo.metadata.definition.builder.TypeBuilder |  |  |
| org.apache.dubbo.metadata.rest.AnnotatedMethodParameterProcessor |  |  |
| org.apache.dubbo.metadata.rest.ServiceRestMetadataReader |  |  |
| org.apache.dubbo.rpc.protocol.tri.compressor.Compressor |  |  |
| org.apache.dubbo.rpc.protocol.tri.compressor.DeCompressor |  |  |
| org.apache.dubbo.rpc.protocol.tri.rest.argument.ArgumentConverter |  |  |
| org.apache.dubbo.rpc.protocol.tri.rest.argument.ArgumentResolver |  |  |
| org.apache.dubbo.rpc.protocol.tri.rest.filter.RestExtension |  |  |
| org.apache.dubbo.rpc.protocol.tri.rest.filter.RestExtensionAdapter |  |  |
| org.apache.dubbo.rpc.protocol.tri.rest.mapping.RequestMappingResolver |  |  |
| org.apache.dubbo.rpc.protocol.tri.route.RequestHandlerMapping |  |  |
| org.apache.dubbo.rpc.protocol.rest.annotation.param.parse.provider.BaseProviderParamParser |  |  |
| org.apache.dubbo.metadata.rest.ServiceRestMetadataResolver |  |  |
| org.apache.dubbo.rpc.protocol.rest.filter.RestRequestFilter |  |  |
| org.apache.dubbo.rpc.protocol.rest.filter.RestResponseFilter |  |  |
| org.apache.dubbo.metadata.rest.NoAnnotatedParameterRequestTagProcessor |  |  |
| org.apache.dubbo.rpc.protocol.rest.message.HttpMessageCodec |  |  |
| org.apache.dubbo.rpc.protocol.rest.annotation.consumer.HttpConnectionPreBuildIntercept |  |  |
| org.apache.dubbo.rpc.protocol.rest.annotation.param.parse.consumer.BaseConsumerParamParser |  |  |
| org.apache.dubbo.remoting.http.factory.RestClientFactory |  |  |
| org.apache.dubbo.rpc.protocol.rest.filter.RestResponseInterceptor |  |  |
| org.apache.dubbo.remoting.zookeeper.ZookeeperTransporter |  |  |


### 框架内部实现
| **SPI 扩展定义** | **功能说明** | **示例实现** | **激活条件** |
| --- | --- | --- | --- |
| org.apache.dubbo.common.url.component.param.DynamicParamSource | 可通过扩展自定义动态参数列表，与 Dubbo3 中关于 URL 存储的优化相关。 | org.apache.dubbo.common.url.component.param.DefaultDynamicParamSource |  |
| org.apache.dubbo.common.compiler.Compiler | 用于设置 Dubbo IoC 容器的自适应扩展实现依赖的字节码工具。默认使用 javassist，可设置使用 jdk 或 bytebuddy 等实现。 | org.apache.dubbo.common.compiler.support.JavassistCompiler |  |
| org.apache.dubbo.common.serialize.MultipleSerialization | | |  |
| org.apache.dubbo.common.convert.Converter | 实现原类型到目标类型的转换，多限于框架内部集成使用 | org.apache.dubbo.common.convert.StringToFloatConverter |  |
| org.apache.dubbo.common.config.OrderedPropertiesProvider | 通过扩展可以为框架提供更多的 properties 来源，多限于框架内部集成使用 | 无 |  |
| org.apache.dubbo.common.convert.multiple.MultiValueConverter | 实现原类型到目标类型的转换，多限于框架内部集成使用 | org.apache.dubbo.common.convert.multiple.StringToArrayConverter |  |
| org.apache.dubbo.common.store.DataStore | | |  |
| org.apache.dubbo.common.threadpool.manager.ExecutorRepository | | |  |
| org.apache.dubbo.spring.security.jackson.ObjectMapperCodecCustomer |  |  |  |
| org.apache.dubbo.validation.Validation |  |  |  |
| org.apache.dubbo.rpc.PathResolver |  |  |  |
| org.apache.dubbo.rpc.model.PackableMethodFactory |  |  |  |
| org.apache.dubbo.rpc.model.ApplicationInitListener |  |  |  |
| org.apache.dubbo.rpc.model.BuiltinServiceDetector |  |  |  |
| org.apache.dubbo.rpc.model.ScopeModelInitializer |  |  |  |
| org.apache.dubbo.aot.api.ReflectionTypeDescriberRegistrar |  |  |  |
| org.apache.dubbo.aot.api.ProxyDescriberRegistrar |  |  |  |
| org.apache.dubbo.common.json.JsonUtil |  |  |  |
| org.apache.dubbo.rpc.protocol.injvm.ParamDeepCopyUtil |  |  |  |
| org.apache.dubbo.aot.api.ResourceDescriberRegistrar |  |  |  |
| org.apache.dubbo.common.context.ApplicationExt |  |  |  |
| org.apache.dubbo.common.context.ModuleExt |  |  |  |
| org.apache.dubbo.metrics.service.MetricsService | 用于对外发布/透出 Metrics 指标的内部服务定义，以标准 Dubbo 服务形式发布。 | org.apache.dubbo.metrics.service.DefaultMetricsService |  |
| org.apache.dubbo.metrics.service.MetricsServiceExporter |  |  |  |
| org.apache.dubbo.rpc.cluster.filter.FilterChainBuilder |  |  |  |
| org.apache.dubbo.rpc.cluster.filter.InvocationInterceptorBuilder |  |  |  |
| org.apache.dubbo.rpc.cluster.Merger | 目前用于多 group 调用场景，对请求结果进行合并 |  |  |
| org.apache.dubbo.rpc.cluster.governance.GovernanceRuleRepository |  |  |  |
| org.apache.dubbo.qos.permission.PermissionChecker | 用于检查扩展QoS执行权限检查逻辑，配合每个 QoS 命令配置的 @CMD 权限注解，结合上下文进行检查。 | org.apache.dubbo.qos.permission.DefaultAnonymousAccessPermissionChecker | 默认只支持 qosPermissionChecker |
| org.apache.dubbo.common.status.reporter.FrameworkStatusReporter | 用于上报 Dubbo 框架内部运行状态的扩展点，目前框架在服务发现模型自动迁移等位置做了统计埋点，所有迁移动作都会通过此扩展实现上报出去。未来可考虑用 metrics 标准埋点取代。 | 无 | 无需配置，自动激活 |
| org.apache.dubbo.registry.client.metadata.MetadataServiceURLBuilder | 用于应用级服务发现。在收到应用级地址 URL 推送后，生成 MetadataService URL 时的定制逻辑（仅对点对点应用级地址发现有效） | org.apache.dubbo.registry.client.metadata.StandardMetadataServiceURLBuilder |  |
| org.apache.dubbo.metadata.ServiceNameMapping | 用于应用级服务发现 | org.apache.dubbo.registry.client.metadata.MetadataServiceNameMapping |  |
| ~~org.apache.dubbo.common.extension.ExtensionFactory~~ |  |  |  |


