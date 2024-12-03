---
description: "Dubbo SPI Definition Manual, a comprehensive list of SPI definitions in the framework."
linkTitle: SPI Plugin List
title: Dubbo SPI Plugins and Details
type: docs
weight: 2
---

Dubbo defines many extension points within the framework, so **when you find that the official library cannot meet business needs and wish to provide customization for the Dubbo framework, please first refer to the following extension point definitions to see if you can achieve non-intrusive customization of the Dubbo framework by providing extension implementations**.

For specific information, please refer to the [Summary of Dubbo SPI Extension Definitions](./#extension-summary) below this article.

<img src="/imgs/v3/concepts/extension-use.png" style="max-width:600px;height:auto;">

## Summary of Extension Points

### Lifecycle and Event Callbacks

| **SPI Extension Definition** | **Function Description** | **Example Implementation** | **Activation Conditions** |
| --- | --- | --- | --- |
| org.apache.dubbo.common.lang.ShutdownHookCallback | Elegant offline callback logic extension point, all ShutdownHookCallback implementations will be called before the Dubbo process is destroyed. | None | Automatically activated, no configuration needed. |
| org.apache.dubbo.common.threadpool.event.ThreadPoolExhaustedListener | This extension point will trigger an event notification when the Dubbo business thread pool is full. | org.apache.dubbo.metrics.collector.sample.MetricThreadPoolExhaustedListener | Activate implementations with dubbo.protocol.thread-pool-exhausted-listeners=spi-name1,spi-name2. |
| org.apache.dubbo.rpc.ExporterListener | This extension point will be called back after each Exporter successfully exports/unexports. | org.apache.dubbo.rpc.listener.InjvmExporterListener | Extensions must add the @Activate annotation to be activated; activation conditions can be configured as needed. Implementations can be activated by configuring exporter.listener=spi-name1,spi-name2 in the URL. |
| org.apache.dubbo.rpc.InvokerListener | This extension point will be called back after each service Invoker successfully refers/destroys. | org.apache.dubbo.rpc.protocol.CountInvokerListener | Similar as above. |
| org.apache.dubbo.common.status.StatusChecker | Extension point for exposing the internal status of components. Each component that needs to expose status can implement this extension point. | org.apache.dubbo.rpc.protocol.dubbo.status.ThreadPoolStatusChecker | Activated by setting dubbo.protocol.status=spi-name1,spi-name2. |
| org.apache.dubbo.config.ServiceListener | Callback extension point for ServiceConfig; every ServiceConfig will be called back after successfully exporting/unexporting. The interception point is slightly different from ExporterListener. | None | Automatically activated, no configuration needed. |
| org.apache.dubbo.registry.RegistryServiceListener | Callback extension point after service URL registers/unregisters with the registry center; all extension implementations will be notified in sequence. | None | Extensions must add the @Activate annotation to be activated, default activated. Supports controlling specific activated implementations through registry.listeners in the Registry URL such as dubbo.registry.parameters.registry.listeners=spi-name1,spi-name2. |
| org.apache.dubbo.registry.integration.RegistryProtocolListener | For interface-level service discovery. | org.apache.dubbo.registry.client.migration.MigrationRuleListener | RegistryProtocol listener is introduced to provide a chance to users to customize or change export and refer behavior of RegistryProtocol. For example: re-export or re-refer on the fly when certain conditions are met. |
| org.apache.dubbo.qos.probe.LivenessProbe | Lifecycle detection extension point. It can be configured for k8s liveness checks via the qos live HTTP interface. | None | Extensions must add the @Activate annotation to be activated; default activated. Supports controlling which implementations are activated through dubbo.application.liveness-probe=spi-name1,spi-name2 in the URL. |
| org.apache.dubbo.qos.probe.ReadinessProbe | Lifecycle detection extension point. It can be configured for k8s readiness checks via the qos ready HTTP interface. | None | Similar as above. |
| org.apache.dubbo.qos.probe.StartupProbe | Lifecycle detection extension point. It can be configured for k8s startup checks via the qos startup HTTP interface. | None | Similar as above. |
| org.apache.dubbo.common.deploy.ApplicationDeployListener | Callback extension during the Dubbo process lifecycle, supporting multiple callback points including initialization, startup success, and stop. For multi-application deployment scenarios, it is a single application granularity lifecycle callback. | org.apache.dubbo.security.cert.CertDeployerListener | Automatically activated, no configuration needed. |
| org.apache.dubbo.common.deploy.ModuleDeployListener | Callback extension during the Dubbo process lifecycle, supporting multiple callback points. For multi-module deployment scenarios, it is a single module granularity lifecycle callback. | None | Automatically activated, no configuration needed. |
| org.apache.dubbo.qos.api.BaseCommand | QoS command extension point; implementing this extension adds new QoS commands. | org.apache.dubbo.qos.command.impl.Ls | Automatically activated, no configuration needed. |
| ~~org.apache.dubbo.remoting.telnet.TelnetHandler~~ | | | |
| ~~org.apache.dubbo.config.bootstrap.DubboBootstrapStartStopListener~~ | | | |


### Configuration Related

| **SPI Extension Definition** | **Function Description** | **Example Implementation** | **Activation Conditions** |
| --- | --- | --- | --- |
| org.apache.dubbo.common.extension.ExtensionInjector | IoC injector extension point; through extensions, various types of instances can be automatically injected, used for the integration of Dubbo framework SPI instances and different IoC containers, such as supporting Spring Bean injection SPI instances. | org.apache.dubbo.config.spring.extension.SpringExtensionInjector | Automatically activated, no additional configuration needed. |
| org.apache.dubbo.common.infra.InfraAdapter | Custom loading environment variables extension implementation; allows batch retrieval of environment variables through coding, and the framework will automatically append these values to each service's URL parameters. | org.apache.dubbo.common.infra.support.EnvironmentAdapter | Automatically activated, no additional configuration needed. |
| org.apache.dubbo.common.logger.LoggerAdapter | Log framework adapter; if you want to provide support for a log framework not supported by Dubbo, you can use this extension point. | org.apache.dubbo.common.logger.slf4j.Slf4jLoggerAdapter | Activated by configuring dubbo.application.logger=spi-name. |
| org.apache.dubbo.config.ConfigInitializer | Customize ServiceConfig and ReferenceConfig parameters before configuration initialization and service initialization. | None | Extensions must add the @Activate annotation to be activated, activation conditions can be added as needed. |
| org.apache.dubbo.config.CommonConfigPostProcessor | Customize ServiceConfig and ReferenceConfig parameters after configuration initialization, but before service initialization. Executes after ConfigInitializer. | org.apache.dubbo.rpc.protocol.rest.config.FeignClientAnnotationConfigPostProcessor | Extensions must add the @Activate annotation to be activated; activation conditions can be added as needed. |
| org.apache.dubbo.config.spring.context.DubboSpringInitCustomizer | Custom Dubbo spring initialization; customize Dubbo spring initialization during bean registry processing phase. | None | Automatically activated, no additional configuration needed. |

### Service Discovery
| **SPI Extension Definition** | **Function Description** | **Example Implementation** | **Activation Conditions** |
| --- | --- | --- | --- |
| org.apache.dubbo.registry.AddressListener | Extension used for service discovery. This extension will be triggered when URL address notifications occur; address preprocessing operations can be performed. | None | Extensions must add the @Activate annotation to be activated; activation conditions can be configured as needed. |
| org.apache.dubbo.registry.ProviderFirstParams | Used for service discovery; specifies URL parameter priorities. The parameters list returned by this extension has provider priorities higher than consumer. | org.apache.dubbo.registry.support.DefaultProviderFirstParams | Automatically activated, no configuration needed. |
| org.apache.dubbo.registry.RegistryFactory | For interface-level service discovery. Extensions can implement different registration center adaptations through this SPI. | org.apache.dubbo.registry.nacos.NacosRegistryFactory | Activated by configuring dubbo.registry.address=spi-name://ip:port. |
| org.apache.dubbo.registry.client.RegistryClusterIdentifier | For application-level service discovery. The Dubbo framework supports specifying identification for the registry center cluster, allowing categorization of address URLs based on the cluster they come from. | org.apache.dubbo.registry.client.DefaultRegistryClusterIdentifier | Activated by configuring dubbo.provider.parameters.registry-cluster-type=spi-name to specify the extension implementation. |
| org.apache.dubbo.registry.client.ServiceDiscoveryFactory | For application-level service discovery. Extensions can implement different registration center adaptations through this SPI. | org.apache.dubbo.registry.nacos.NacosServiceDiscoveryFactory | Activated by configuring dubbo.registry.address=spi-name://ip:port, while specifying dubbo.registry.register-mode=instance to activate application-level service discovery. |
| org.apache.dubbo.registry.client.ServiceInstanceCustomizer | For application-level service discovery; customizations can be made before application-level instance URLs are registered to the registry center. | org.apache.dubbo.registry.client.metadata.ServiceInstanceMetadataCustomizer | Automatically activated, no configuration needed. |
| org.apache.dubbo.registry.client.migration.MigrationAddressComparator | Used for application-level service discovery; this extension serves as part of the interface-level to application-level address migration mechanism. | org.apache.dubbo.registry.client.migration.DefaultMigrationAddressComparator | Automatically activated, no configuration needed. |
| ~~org.apache.dubbo.registry.client.migration.PreMigratingConditionChecker~~ | ~~For application-level service discovery; this extension allows custom check logic before the framework decides to migrate addresses.~~ | ~~None~~ | ~~Automatically activated, no configuration needed.~~ |
| org.apache.dubbo.metadata.MetadataParamsFilter | For application-level service discovery; allows control over which parameters are registered to the registry and which are registered as service metadata. | org.apache.dubbo.metadata.DefaultMetadataParamsFilter | Extensions must add the @Activate annotation to be activated. Supports URL configuration params-filter to control which implementation is activated, such as dubbo.provider.parameters.params-filter=-default,spi-name1 to disable all implementations and only enable spi-name1. |
| org.apache.dubbo.registry.client.metadata.ServiceInstanceNotificationCustomizer | For application-level service discovery; identifies special types of address URLs, e.g., an extension implementation to identify Spring Cloud Alibaba Dubbo type addresses. | org.apache.dubbo.registry.client.metadata.SpringCloudServiceInstanceNotificationCustomizer | Automatically activated, no configuration needed. |
| org.apache.dubbo.registry.integration.ServiceURLCustomizer | For interface-level service discovery; specifies which URLs to register to the registry and which URLs not to register when optimizing the interface-level address list. | org.apache.dubbo.registry.integration.DefaultServiceURLCustomizer | Automatically activated, no configuration needed. |
| org.apache.dubbo.rpc.cluster.ProviderURLMergeProcessor | For interface-level service discovery; this extension is used to complete the merge of consumer URL and provider URL, allowing control over merge strategies to retain different keys and use different overlay relations. | org.apache.dubbo.rpc.cluster.support.merger.DefaultProviderURLMergeProcessor | Activated by configuring dubbo.consumer.url-merge-processor=spi-name to enable the specified extension implementation. |

### RPC and Traffic Control
| **SPI Extension Definition** | **Function Description** | **Example Implementation** | **Activation Conditions** |
| --- | --- | --- | --- |
| org.apache.dubbo.rpc.Protocol | RPC protocol implementation extension point; this extension can add more protocol implementations. | org.apache.dubbo.rpc.protocol.dubbo.DubboProtocol | Activated by configuring dubbo.protocol.name=spi-name. |
| org.apache.dubbo.rpc.ProxyFactory | RPC proxy implementation extension point; can provide various proxy implementations, such as bytecode enhancement, JDK, etc. | org.apache.dubbo.rpc.proxy.javassist.JavassistProxyFactory | Activated by configuring dubbo.application.compiler=spi-name. |
| org.apache.dubbo.rpc.ZoneDetector | In multi-registration center scenarios, Dubbo provides an automatic same-region priority matching strategy. This extension allows easier customization of zone reading strategies. | None | Only one ZoneDetector implementation will be activated; the one with the key 'default' will be prioritized. |
| org.apache.dubbo.rpc.cluster.Cluster | RPC request disaster recovery strategy extension point, for instance, you can set actions to take when a request fails, like FailoverCluster, FailfastCluster, etc. | org.apache.dubbo.rpc.cluster.support.FailoverCluster | Activated by configuring dubbo.consumer.cluster=spi-name. |
| org.apache.dubbo.rpc.cluster.LoadBalance | Load balancing strategy extension point; various load balancing strategies can be implemented through extensions. | org.apache.dubbo.rpc.cluster.loadbalance.RandomLoadBalance | Activated by configuring dubbo.consumer.loadbalance=spi-name. |
| org.apache.dubbo.rpc.HeaderFilter | Various attachment/header validation strategies through different extension implementations before RPC requests. | org.apache.dubbo.rpc.filter.TokenHeaderFilter | Extensions must add the @Activate annotation to be activated; supports controlling implementations activated through header.filter=spi-name1,spi-name2 in the URL. |
| org.apache.dubbo.rpc.Filter | RPC request filter; filters RPC calls before the request is initiated and after the response is returned. | org.apache.dubbo.rpc.filter.GenericFilter | Extensions must add the @Activate annotation to be activated; activation conditions can also be configured, e.g., @Activate(group="consumer"). Supports controlling which implementations to activate in the provider side via service.filter=spi-name1,spi-name2, and in the consumer side via reference.filter=spi-name1,spi-name2. |
| org.apache.dubbo.rpc.cluster.filter.ClusterFilter | RPC request filter; functions the same as Filter but occurs before service locating. Most users can directly use org.apache.dubbo.rpc.Filter. | org.apache.dubbo.rpc.cluster.filter.support.ConsumerContextFilter | Extensions must add the @Activate annotation to be activated; supports controlling which implementations to activate through filter=spi-name1,spi-name2 in the URL. |
| org.apache.dubbo.rpc.cluster.RouterFactory | Router extension point; allows adding different routing rule strategies through extensions. | None | Extensions must add the @Activate annotation to be activated; supports controlling which implementations to activate through router=spi-name1,spi-name2 in the URL. |
| org.apache.dubbo.rpc.cluster.router.state.StateRouterFactory | Router extension point; similar to RouterFactory but with higher performance. For most users, RouterFactory can be directly used for simplicity. | org.apache.dubbo.rpc.cluster.router.condition.ConditionStateRouterFactory | Extensions must add the @Activate annotation to be activated; supports controlling which implementations to activate through router=spi-name1,spi-name2 in the URL. |
| org.apache.dubbo.rpc.cluster.ConfiguratorFactory | Dynamic configuration rule extension point; allows adding different dynamic configuration rule strategies. | org.apache.dubbo.rpc.cluster.configurator.override.OverrideConfiguratorFactory | Extensions must add the @Activate annotation to be activated; supports controlling which implementations to activate through router=spi-name1,spi-name2 in the URL. |
| org.apache.dubbo.rpc.cluster.router.condition.matcher.pattern.ValuePattern | Routing rule processing extension point; internal rule processor for conditional routing rules; extends support for richer rules and matching conditions. | org.apache.dubbo.rpc.cluster.router.condition.matcher.pattern.range.RangeValuePattern | Automatically activated; activation of specific implementations can be controlled through rules. |
| org.apache.dubbo.rpc.cluster.router.condition.matcher.ConditionMatcherFactory | Routing rule processing extension point; internal rule processor for conditional routing rules; extends support for richer rules and matching conditions. | org.apache.dubbo.rpc.cluster.router.condition.matcher.argument.ArgumentConditionMatcherFactory | Extensions must add the @Activate annotation to be activated; activation conditions can be configured as needed. |
| org.apache.dubbo.rpc.cluster.router.mesh.util.TracingContextProvider | MeshRule routing rule processing extension point; used to read context from different third-party tracing systems. | None | Automatically activated, no configuration needed. |
| org.apache.dubbo.rpc.cluster.router.mesh.route.MeshEnvListenerFactory | MeshRule routing rule processing extension point. | None | Automatically activated, no configuration needed. |
| org.apache.dubbo.cache.CacheFactory | Cache implementation extension point for caching RPC call results. | org.apache.dubbo.cache.support.expiring.ExpiringCacheFactory | Activated by controlling which implementation to activate through cache=spi-name in the URL. |
| org.apache.dubbo.common.serialize.Serialization | Serialization protocol extension point; use this extension if you want to add new serialization protocols. | org.apache.dubbo.common.serialize.hessian2.Hessian2Serialization | Activated by configuring dubbo.provider.serialization=spi-name. |
| org.apache.dubbo.common.threadpool.ThreadPool | Thread pool strategy extension point; currently only suitable for Dubbo protocol implementations, not applicable for Triple protocol. | org.apache.dubbo.common.threadpool.support.fixed.FixedThreadPool | Activated by configuring dubbo.provider.threadpool=spi-name. |
| org.apache.dubbo.rpc.executor.IsolationExecutorSupportFactory | Thread pool isolation strategy extension point; various isolation strategies can be defined for Dubbo and Triple protocols; each protocol can set one thread pool isolation strategy. | org.apache.dubbo.rpc.protocol.tri.transport.TripleIsolationExecutorSupportFactory | Must follow user-configured dubbo.protocol.name; config key must match RPC protocol name. |
| org.apache.dubbo.rpc.PenetrateAttachmentSelector | This extension allows custom parameters to be passed through the chain (Dubbo link); Dubbo only passes parameters from A->B by default, but this extension can control parameters to pass from A->B->C. | None | Automatically activated, no configuration needed. |
| ~~org.apache.dubbo.rpc.cluster.interceptor.ClusterInterceptor~~ | ~~Same as org.apache.dubbo.rpc.cluster.filter.ClusterFilter; deprecated.~~ | ~~Deprecated.~~ |  |

### Service Governance

| **SPI Extension Definition** | **Function Description** | **Example Implementation** | **Activation Conditions** |
| --- | --- | --- | --- |
| org.apache.dubbo.common.config.configcenter.DynamicConfigurationFactory | Core extension point for configuration center; provides different configuration center adaptation implementations. | org.apache.dubbo.configcenter.support.nacos.NacosDynamicConfigurationFactory | Activated by specifying dubbo.config-center.address=spi-name://. |
| org.apache.dubbo.metadata.report.MetadataReportFactory | Extension point for metadata center to provide new storage implementations for metadata center. | org.apache.dubbo.metadata.store.nacos.NacosMetadataReportFactory | Activated by specifying dubbo.metadata-report.address=spi-name://. |
| org.apache.dubbo.metrics.report.MetricsReporterFactory | Metrics reporting extension point; can adapt to different Metrics backend services through extensions. | org.apache.dubbo.metrics.prometheus.PrometheusMetricsReporterFactory | Activated by specifying dubbo.metrics.protocol=spi-name. |
| org.apache.dubbo.metrics.collector.MetricsCollector | Internal metrics collection extension point; can support RPC, registry, and other components' metrics data collection through extensions. | org.apache.dubbo.metrics.registry.collector.RegistryMetricsCollector | Extensions must add the @Activate annotation to be activated; activation conditions can be added as needed. |
| org.apache.dubbo.auth.spi.AccessKeyStorage | Used for the dubbo-auth module; this extension point can read AK from different sources. | org.apache.dubbo.auth.DefaultAccessKeyStorage | Activated by specifying accessKey.storage URL parameter. |
| org.apache.dubbo.auth.spi.Authenticator | Used for the dubbo-auth module; this extension point implements specific authentication logic. | org.apache.dubbo.auth.AccessKeyAuthenticator | Activated by specifying authenticator URL parameter. |
| org.apache.dubbo.common.ssl.CertProvider | TLS certificate source extension used for adapting different certificate source implementations. | org.apache.dubbo.common.ssl.impl.SSLConfigCertProvider | Extensions must add the @Activate annotation to be activated. |

### Protocol and Transport Layer Implementation
| **SPI Extension Definition** | **Function Description** | **Example Implementation** | **Activation Conditions** |
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


### Framework Internal Implementation
| **SPI Extension Definition** | **Function Description** | **Example Implementation** | **Activation Conditions** |
| --- | --- | --- | --- |
| org.apache.dubbo.common.url.component.param.DynamicParamSource | Allows custom dynamic parameter lists extension, related to URL storage optimizations in Dubbo3. | org.apache.dubbo.common.url.component.param.DefaultDynamicParamSource |  |
| org.apache.dubbo.common.compiler.Compiler | Sets adaptive extension implementations for the Dubbo IoC container dependent on bytecode tools. Default uses Javassist, can be set to use JDK or ByteBuddy, etc. | org.apache.dubbo.common.compiler.support.JavassistCompiler |  |
| org.apache.dubbo.common.serialize.MultipleSerialization | | |  |
| org.apache.dubbo.common.convert.Converter | Implements conversion from source type to target type, mainly limited to internal framework integration. | org.apache.dubbo.common.convert.StringToFloatConverter |  |
| org.apache.dubbo.common.config.OrderedPropertiesProvider | Provides more properties sources for the framework through extension, mainly limited to internal framework integration. | None |  |
| org.apache.dubbo.common.convert.multiple.MultiValueConverter | Implements conversion from source type to target type, mainly limited to internal framework integration. | org.apache.dubbo.common.convert.multiple.StringToArrayConverter |  |
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
| org.apache.dubbo.metrics.service.MetricsService | Internal service definition for releasing/exposing Metrics indicators, published as a standard Dubbo service. | org.apache.dubbo.metrics.service.DefaultMetricsService |  |
| org.apache.dubbo.metrics.service.MetricsServiceExporter |  |  |  |
| org.apache.dubbo.rpc.cluster.filter.FilterChainBuilder |  |  |  |
| org.apache.dubbo.rpc.cluster.filter.InvocationInterceptorBuilder |  |  |  |
| org.apache.dubbo.rpc.cluster.Merger | Currently used for multi-group calling scenarios to merge request results. |  |  |
| org.apache.dubbo.rpc.cluster.governance.GovernanceRuleRepository |  |  |  |
| org.apache.dubbo.qos.permission.PermissionChecker | Checks extended QoS execution permission logic, in conjunction with the @CMD permission annotation for each QoS command, combining context for checks. | org.apache.dubbo.qos.permission.DefaultAnonymousAccessPermissionChecker | Defaults to supporting only qosPermissionChecker. |
| org.apache.dubbo.common.status.reporter.FrameworkStatusReporter | Extension point for reporting the internal running status of the Dubbo framework. Currently used for statistics in service discovery model automatic migration, all migration actions will be reported through this extension. | None | Automatically activated, no configuration needed. |
| org.apache.dubbo.registry.client.metadata.MetadataServiceURLBuilder | For application-level service discovery; generates custom logic when creating MetadataService URL after receiving application-level address URL pushes (only for point-to-point application-level address discovery). | org.apache.dubbo.registry.client.metadata.StandardMetadataServiceURLBuilder |  |
| org.apache.dubbo.metadata.ServiceNameMapping | Used for application-level service discovery. | org.apache.dubbo.registry.client.metadata.MetadataServiceNameMapping |  |
| ~~org.apache.dubbo.common.extension.ExtensionFactory~~ |  |  |  |

