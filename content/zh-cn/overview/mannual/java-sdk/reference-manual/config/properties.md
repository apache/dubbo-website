---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/config/properties/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/config/properties/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/performance/dump/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/performance/lazy-connect/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/performance/simplify-registry-data/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/performance/stickiness/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/service/delay-publish/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/service/preflight-check/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/service/registry-only/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/service/service-downgrade/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/service/subscribe-only/
description: 包含 Dubbo 支持的所有配置组件及每个配置组件支持的所有配置项
linkTitle: 配置项手册
title: 配置项参考手册
type: docs
weight: 6
---


## JVM(-D) 参数


| JVM 参数 | 示例值 | 说明 |
| --- | --- | --- |
| dubbo.{config-name}.{property} | -Ddubbo.application.name="dubbo-demo"<br/><br/>-Ddubbo.registry.address="nacos://host:port"<br/><br/>-Ddubbo.protocol.port="20880"<br/><br/>...... | Dubbo支持 [所有的配置项](aaa) 以JVM参数格式指定。其中`config` 是指如 application、registry、protocol 等配置项，而`property`则是指每个配置项中的具体属性。 |
| dubbo.resolve.file | -Ddubbo.resolve.file=/home/ken/.../dubbo-resolve.properties | 在文件中指定每个接口的直连地址url，如：org.apache.dubbo.demo.DemoService=tri://127.0.0.1:50051/org.apache.dubbo.demo.DemoService?xxx=xxx |
| org.graalvm.nativeimage.imagecode || [https://github.com/oracle/graal/blob/master/sdk/src/org.graalvm.nativeimage/src/org/graalvm/nativeimage/ImageInfo.java](https://github.com/oracle/graal/blob/master/sdk/src/org.graalvm.nativeimage/src/org/graalvm/nativeimage/ImageInfo.java) |
| dubbo.properties.file | -Ddubbo.properties.file=foo.properties | 指定 properties 配置文件地址，可以是绝对路径或者classpath相对路径。默认值为 dubbo.properties |
| dubbo.jstack-dump.max-line | -Ddubbo.jstack-dump.max-line=20 | Dubbo 支持自动打印调用堆栈，这个参数可以控制堆栈行数，如示例中只会打印前20行堆栈 |
| dubbo.json-framework.prefer| -Ddubbo.json-framework.prefer=gson | 设置框架中 json 序列化的具体实现，目前可选实现有 `fastjson2`、`fastjson`、`gson`、`jackson`。默认情况，框架会自动查找可用实现，以上按顺序优先级依次降低 |
| dubbo.network.interface.ignored | -Ddubbo.network.interface.ignored=eth1,eth2 | 在多网卡环境下，当需要手动控制注册到注册中心的网卡地址时使用。用于排除某些网卡 |
| dubbo.network.interface.preferred | -Ddubbo.network.interface.ignored=eth0 | 在多网卡环境下，当需要手动控制注册到注册中心的网卡地址时使用。用于指定一个特定网卡 |
| sun.rmi.transport.tcp.responseTimeout | -Dsun.rmi.transport.tcp.responseTimeout=5000 | 用于设置 RMI 协议下的超时时间，单位ms |
| env |  | Apollo 配置中心特有参数 |
| app.id |  | Apollo 配置中心特有参数 |
| apollo.cluster |  | Apollo 配置中心特有参数 |
| apollo.meta |  | Apollo 配置中心特有参数 |
| dubbo.mapping.cache.filePath | -Ddubbo.mapping.cache.filePath=~/.dubbo/mapping/ | 用于设置`接口-应用`映射关系缓存文件，通常用于服务发现。文件绝对路径地址 |
| dubbo.mapping.cache.fileName | -Ddubbo.mapping.cache.fileName=dubbo-mapping | 用于设置`接口-应用`映射关系缓存文件，通常用于服务发现。文件名，如此示例最终会读取和存储在文件 dubbo-mapping.dubbo.cache |
| dubbo.mapping.cache.entrySize | -Ddubbo.mapping.cache.maxFileSize=300 | 用于设置`接口-应用`映射关系缓存文件，通常用于服务发现。文件名中内容最大条目数限制 |
| dubbo.mapping.cache.maxFileSize | -Ddubbo.mapping.cache.maxFileSize=104857600 | 用于设置`接口-应用`映射关系缓存文件，通常用于服务发现。文件最大占用空间限制，单位byte |
| dubbo.meta.cache.filePath | -Ddubbo.meta.cache.filePath=~/.dubbo/meta/ | 用于设置`metadata元数据`缓存文件，通常用于服务发现。文件绝对路径地址 |
| dubbo.meta.cache.fileName | -Ddubbo.meta.cache.fileName=dubbo-meta | 用于设置`metadata元数据`缓存文件，通常用于服务发现。文件名，如此示例最终会读取和存储在文件 dubbo-meta.dubbo.cache |
| dubbo.meta.cache.entrySize | -Ddubbo.meta.cache.maxFileSize=300 | 用于设置`metadata元数据`缓存文件，通常用于服务发现。文件名中内容最大条目数限制 |
| dubbo.meta.cache.maxFileSize | -Ddubbo.meta.cache.maxFileSize=104857600 | 用于设置`metadata元数据`缓存文件，通常用于服务发现。文件最大占用空间限制，单位byte |
| dubbo.application.use-secure-random-request-id | -Ddubbo.application.use-secure-random-request-id=true | 设置每次 rpc 调用 request id 的生成规则，是不是用随机值。如不设置则使用递增值。 |
| dubbo.protocol.default-close-timeout | -Ddubbo.protocol.default-close-timeout=10000 | 设置 tcp server 关闭等待时间，单位毫秒ms |
| dubbo.protocol.default-heartbeat | -Ddubbo.protocol.default-heartbeat=10000 | 设置发起心跳 heartbeat 的间隔，单位毫秒ms |
| dubbo.hessian.allowNonSerializable |  | 是否允许对没有实现 Serializable 接口的类进行序列化，对hessian序列化有效 |
| dubbo.application.hessian2.whitelist | -Ddubbo.application.hessian2.whitelist=true | 设置是否启用白名单机制，对hessian序列化有效。如果设置 true，则继续配置下面的 allow 规则；否则，配置 deny 规则 |
| dubbo.application.hessian2.allow | -Ddubbo.application.hessian2.allow=org.apache.dubbo.*;com.company.* | 如果设置 true，则继续配置配置 allow 规则，参见文档说明 |
| dubbo.application.hessian2.deny | -Ddubbo.application.hessian2.deny=org.apache.dubbo.*;io.commons.* | 如果设置 false，则继续配置配置 deny 规则，参见文档说明 |
| dubbo.application.manual-register | -Ddubbo.application.manual-register=true | 设置之后，所有服务都不会被自动注册到注册中心，直到用户调用 online 等命令手动完成注册 |
| dubbo.compact.enable |  |  |
| dubbo.migration-file.enable | -Ddubbo.migration-file.enable=true | 在往应用级地址发现迁移时，是否启用规则文件读取 |
| dubbo.migration.file | -Ddubbo.migration.file=dubbo-migration.yaml | 指定往应用级地址发现迁移的规则文件路径，可以是绝对路径或者classpath相对路径。默认值为 dubbo-migration.yaml |
| dubbo.application.logger | -Ddubbo.application.logger=slf4j | 设置dubbo框架使用的日志组件，设置后，dubbo框架自身的日志将打印到这里（不影响应用自身）；目前支持的 slf4j、log4j、log4j2 等，设置之后须确保相应的组件依赖已经加入应用。 |
| dubbo.properties.file | -Ddubbo.properties.file=foo.properties | 指定 properties 配置文件地址，可以是绝对路径或者classpath相对路径。默认值为 dubbo.properties |


## 环境变量

| 环境变量 | 示例值 | 说明 |
| --- | --- | --- |
| DUBBO_{CONFIG-NAME}.{PROPERTY} | DUBBO_APPLICATION_NAME="dubbo-demo"<br/><br/>DUBBO_REGISTRY_ADDRESS="nacos://host:port"<br/><br/>DUBBO_PROTOCOL_PORT="20880"<br/><br/>...... | Dubbo支持[所有的配置项](aaa)以环境变量格式指定。其中`CONFIG-NAME` 是指如 application、registry、protocol 等配置项，而 `PROPERTY`则是指每个配置项中的具体属性。 |
| DUBBO_DEFAULT_SERIALIZATION | DUBBO_DEFAULT_SERIALIZATION="hessan2" | 设置框架的默认序列化方式，如hessian2、fastjson2、msgpack等 |
| DUBBO2_COMPACT_ENABLE | DUBBO2_COMPAT_ENABLE="true" |  |
| DUBBO_ENV_KEYS| DUBBO_LABELS="tag1=value1; tag2=value2" | `tag1=value1`会作为附加参数上报到地址 URL，作为系统环境变量可用于为实例打标等。 |
| DUBBO_LABELS | DUBBO_ENV_KEYS="DUBBO_TAG1, DUBBO_TAG2" | Dubbo 会读取 `DUBBO_TAG1`、`DUBBO_TAG2`两个环境变量，并将读取的值 value `DUBBO_TAG1=value` 作为附加参数上报到地址 URL。 |
| POD_NAMESPACE |  | 用于 Kubernetes Service 场景，指定命名空间 |
| CLUSTER_DOMAIN |  | 用于 Kubernetes Service 场景，指定集群名称，默认 default |
| DUBBO_IP_TO_REGISTRY | DUBBO_IP_TO_REGISTRY=30.123.45.187 | 指定注册到注册中心 URL 中的 ip 地址 |
| DUBBO_PORT_TO_REGISTRY | DUBBO_PORT_TO_REGISTRY=20880 | 指定注册到注册中心 URL 中的 port 端口号 |
| DUBBO_{PROTOCOL}_PORT_TO_REGISTRY | DUBBO_DUBBO_IP_TO_REGISTRY=30.123.45.187<br/><br/>DUBBO_TRI_IP_TO_REGISTRY=30.123.45.187 | 指定注册到注册中心 URL 中的 ip 地址，可以为不同协议指定不同 ip |
| DUBBO_{PROTOCOL}_PORT_TO_REGISTRY | DUBBO_DUBBO_PORT_TO_REGISTRY=20880<br/><br/>DUBBO_TRI_PORT_TO_REGISTRY=50051 | 指定注册到注册中心 URL 中的 port 端口，可以为不同协议指定不同 port |
| DUBBO_IP_TO_BIND | DUBBO_IP_TO_BIND=30.123.45.187 | 指定 tcp 监听绑定的 ip 地址 |
| DUBBO_PORT_TO_BIND | DUBBO_PORT_TO_BIND=20880 | 指定 tcp 监听绑定的 port 端口 |
| DUBBO_{PROTOCOL}_IP_TO_BIND | DUBBO_DUBBO_IP_TO_BIND=30.123.45.187<br/><br/>DUBBO_TRI_IP_TO_BIND=30.123.45.187 | 指定 tcp 监听绑定的 ip 地址，可以为不同协议指定不同 ip |
| DUBBO_{PROTOCOL}_PORT_TO_BIND | DUBBO_DUBBO_PORT_TO_BIND=20880<br/><br/>DUBBO_TRI_PORT_TO_BIND=50051 | 指定 tcp 监听绑定的 port 端口，可以为不同协议指定不同 port |
| dubbo.properties.file | dubbo.properties.file=foo.properties | 指定 properties 配置文件地址，可以是绝对路径或者classpath相对路径。默认值为 dubbo.properties |
| dubbo.migration.file | dubbo.migration.file=dubbo-migration.yaml | 指定应用级地址发现的迁移规则的文件地址，可以是绝对路径或者classpath相对路径。默认值为 dubbo-migration.yaml |


## 配置项手册
不论您是使用 Spring Boot、XML、注解还是 API 编写 Dubbo 应用，都可以通过以下表格参考每一项的具体含义。

### dubbo.tracing.baggage.correlation
**Class:** `org.apache.dubbo.config.nested.BaggageConfig$Correlation`

|Key|Type|Description|Default value|Deprecation|
|---|----|-----------|-------------|-----------|
| enabled| java.lang.Boolean| Whether to enable correlation of the baggage context with logging contexts.| true| |
| fields| java.util.List&lt;java.lang.String&gt;| List of fields that should be correlated with the logging context. That means that these fields would end up as key-value pairs in e.g. MDC.| | |
### dubbo.tracing.tracing-exporter.otlp-config
**Class:** `org.apache.dubbo.config.nested.ExporterConfig$OtlpConfig`

|Key|Type|Description|Default value|Deprecation|
|---|----|-----------|-------------|-----------|
| compression-method| java.lang.String| The method used to compress payloads. If unset, compression is disabled. Currently supported compression methods include &quot;gzip&quot; and &quot;none&quot;.| none| |
| endpoint| java.lang.String| URL to the Otlp API.| | |
| headers| java.util.Map&lt;java.lang.String,java.lang.String&gt;| | | |
| timeout| java.time.Duration| The maximum time to wait for the collector to process an exported batch of spans. (seconds)| 10| |
### dubbo.tracing.tracing-exporter.zipkin-config
**Class:** `org.apache.dubbo.config.nested.ExporterConfig$ZipkinConfig`

|Key|Type|Description|Default value|Deprecation|
|---|----|-----------|-------------|-----------|
| connect-timeout| java.time.Duration| Connection timeout for requests to Zipkin. (seconds)| 1| |
| endpoint| java.lang.String| URL to the Zipkin API.| | |
| read-timeout| java.time.Duration| Read timeout for requests to Zipkin. (seconds)| 10| |
### dubbo.metrics.prometheus.exporter
**Class:** `org.apache.dubbo.config.nested.PrometheusConfig$Exporter`

|Key|Type|Description|Default value|Deprecation|
|---|----|-----------|-------------|-----------|
| enable-http-service-discovery| java.lang.Boolean| Enable http service discovery for prometheus| | |
| enabled| java.lang.Boolean| Enable prometheus exporter| | |
| http-service-discovery-url| java.lang.String| Http service discovery url| | |
### dubbo.metrics.prometheus.pushgateway
**Class:** `org.apache.dubbo.config.nested.PrometheusConfig$Pushgateway`

|Key|Type|Description|Default value|Deprecation|
|---|----|-----------|-------------|-----------|
| base-url| java.lang.String| Base URL for the Pushgateway| | |
| enabled| java.lang.Boolean| Enable publishing via a Prometheus Pushgateway| | |
| job| java.lang.String| Job identifier for this application instance| | |
| password| java.lang.String| Login password of the Prometheus Pushgateway| | |
| push-interval| java.lang.Integer| Frequency with which to push metrics| | |
| username| java.lang.String| Login user of the Prometheus Pushgateway| | |
### Unknown group
**Class:** `Unknown`

|Key|Type|Description|Default value|Deprecation|
|---|----|-----------|-------------|-----------|
| dubbo.config-center.include-spring-env| java.lang.Boolean| Whether to include Spring Environment.| | |
| dubbo.config.mode| org.apache.dubbo.config.context.ConfigMode| Config processing mode. See &lt;code&gt;org.apache.dubbo.config.context.ConfigMode&lt;/code&gt;.| | |
| dubbo.config.multiple| java.lang.Boolean| Whether to enable multiple configurations in Dubbo, allowing multiple configurations to be loaded and used, default value is &lt;code&gt;true&lt;/code&gt;.| | |
| dubbo.config.override| java.lang.Boolean|  Whether to allow configuration override in Dubbo, default value is &lt;code&gt;true&lt;/code&gt;.| | |
| dubbo.enabled| java.util.Set&lt;java.lang.String&gt;| Whether enable autoconfiguration of dubbo, default value is &lt;code&gt;true&lt;/code&gt;.| | |
| dubbo.env.keys| java.lang.String| The keys for specify environment-specific keys, allowing for differentiation and utilization of various runtime environments (e.g., development, testing, production), the multiple-value is delimited by comma.| | |
| dubbo.labels| java.lang.String| The labels for these service providers, enabling categorization and grouping, thereby enhancing their management and monitoring, the multiple-value is delimited by &#x27;;&#x27;.| | |
| dubbo.scan.base-packages| java.util.Set&lt;java.lang.String&gt;| The basePackages to scan, the multiple-value is delimited by comma @see EnableDubbo#scanBasePackages().| | |
### dubbo.tracing.baggage
**Class:** `org.apache.dubbo.config.nested.BaggageConfig`

|Key|Type|Description|Default value|Deprecation|
|---|----|-----------|-------------|-----------|
| enabled| java.lang.Boolean| Whether baggage is enabled or not.| true| |
| remote-fields| java.util.List&lt;java.lang.String&gt;| List of fields that are referenced the same in-process as it is on the wire. For example, the field &quot;x-vcap-request-id&quot; would be set as-is including the prefix.| | |
### dubbo.tracing.propagation
**Class:** `org.apache.dubbo.config.nested.PropagationConfig`

|Key|Type|Description|Default value|Deprecation|
|---|----|-----------|-------------|-----------|
| type| java.lang.String| Tracing context propagation type.| W3C| |
### dubbo.tracing.sampling
**Class:** `org.apache.dubbo.config.nested.SamplingConfig`

|Key|Type|Description|Default value|Deprecation|
|---|----|-----------|-------------|-----------|
| probability| java.lang.Float| Probability in the range from 0.0 to 1.0 that a trace will be sampled.| 0.1| |
### dubbo.tracing.tracing-exporter
**Class:** `org.apache.dubbo.config.nested.ExporterConfig`

|Key|Type|Description|Default value|Deprecation|
|---|----|-----------|-------------|-----------|
### dubbo.rpc.tri
**Class:** `org.apache.dubbo.config.TripleConfig`

|Key|Type|Description|Default value|Deprecation|
|---|----|-----------|-------------|-----------|
| enable-push| java.lang.Boolean| Whether to enable push, default is false.| | |
| header-table-size| java.lang.String| The header table size.| | |
| initial-window-size| java.lang.String| Initial window size.| | |
| max-concurrent-streams| java.lang.String| Maximum concurrent streams.| | |
| max-frame-size| java.lang.String| Maximum frame size.| | |
| max-header-list-size| java.lang.String| Maximum header list size.| | |
### dubbo
**Class:** `org.apache.dubbo.spring.boot.autoconfigure.DubboConfigurationProperties`

|Key|Type|Description|Default value|Deprecation|
|---|----|-----------|-------------|-----------|
| config-centers| java.util.Map&lt;java.lang.String,org.apache.dubbo.config.ConfigCenterConfig&gt;| Multiple configurations for ConfigCenterBean.| | |
| consumers| java.util.Map&lt;java.lang.String,org.apache.dubbo.config.ConsumerConfig&gt;| Multiple configurations for Consumer.| | |
| metadata-reports| java.util.Map&lt;java.lang.String,org.apache.dubbo.config.MetadataReportConfig&gt;| Multiple configurations for MetadataReportConfig.| | |
| metricses| java.util.Map&lt;java.lang.String,org.apache.dubbo.config.MetricsConfig&gt;| Multiple configurations for MetricsConfig.| | |
| modules| java.util.Map&lt;java.lang.String,org.apache.dubbo.config.ModuleConfig&gt;| Multiple configurations for Module.| | |
| monitors| java.util.Map&lt;java.lang.String,org.apache.dubbo.config.MonitorConfig&gt;| Multiple configurations for Monitor.| | |
| protocols| java.util.Map&lt;java.lang.String,org.apache.dubbo.config.ProtocolConfig&gt;| Multiple configurations for Protocol.| | |
| providers| java.util.Map&lt;java.lang.String,org.apache.dubbo.config.ProviderConfig&gt;| Multiple configurations for Provider.| | |
| registries| java.util.Map&lt;java.lang.String,org.apache.dubbo.config.RegistryConfig&gt;| Multiple configurations for Registry.| | |
| tracings| java.util.Map&lt;java.lang.String,org.apache.dubbo.config.TracingConfig&gt;| Multiple configurations for TracingConfig.| | |
### dubbo.application
**Class:** `org.apache.dubbo.config.ApplicationConfig`

|Key|Type|Description|Default value|Deprecation|
|---|----|-----------|-------------|-----------|
| architecture| java.lang.String| Architecture layer.| | |
| auto-trust-serialize-class| java.lang.Boolean| Whether to automatically trust serialized classes.| | |
| check-serializable| java.lang.Boolean| Whether to check serializable.| | |
| compiler| java.lang.String| Java compiler.| | |
| default| java.lang.Boolean| | | |
| dump-directory| java.lang.String| Directory for saving thread dump.| | |
| dump-enable| java.lang.Boolean| Whether to enable saving thread dump or not.| | |
| enable-empty-protection| java.lang.Boolean| Whether to enable protection against empty objects.| | |
| enable-file-cache| java.lang.Boolean| Whether to enable file caching.| | |
| environment| java.lang.String| Environment, e.g., dev, test, or production.| | |
| executor-management-mode| java.lang.String| Thread pool management mode: &#x27;default&#x27; or &#x27;isolation&#x27;.| | |
| id| java.lang.String| Identifier for this configuration.| | |
| liveness-probe| java.lang.String| Used to set extensions of the probe in QoS.| | |
| logger| java.lang.String| The type of log access.| | |
| mapping-retry-interval| java.lang.Integer| The retry interval of service name mapping.| | |
| meta-data| java.util.Map&lt;java.lang.String,java.lang.String&gt;| | | |
| metadata-service-port| java.lang.Integer| Metadata Service, used in Service Discovery.| | |
| metadata-service-protocol| java.lang.String| The protocol used for peer-to-peer metadata transmission.| | |
| metadata-type| java.lang.String| Metadata type, local or remote. If &#x27;remote&#x27; is chosen, you need to specify a metadata center further.| | |
| monitor| org.apache.dubbo.config.MonitorConfig| Monitor center.| | |
| name| java.lang.String| The Application name.| | |
| need-refresh| java.lang.Boolean| Specifies if this configuration should be refreshed (true for refreshing).| true| |
| organization| java.lang.String| The application&#x27;s organization (BU).| | |
| owner| java.lang.String| The application owner.| | |
| parameters| java.util.Map&lt;java.lang.String,java.lang.String&gt;| Customized parameters.| | |
| prefixes| java.util.List&lt;java.lang.String&gt;| | | |
| protocol| java.lang.String| The preferred protocol (name) of this application, convenient for places where it&#x27;s hard to determine the preferred protocol.| | |
| qos-accept-foreign-ip| java.lang.Boolean| Should we accept foreign IP or not?| | |
| qos-accept-foreign-ip-compatible| java.lang.Boolean| | | |
| qos-accept-foreign-ip-whitelist| java.lang.String| When we disable accepting foreign IP, support specifying foreign IPs in the whitelist.| | |
| qos-accept-foreign-ip-whitelist-compatible| java.lang.String| | | |
| qos-anonymous-access-permission-level| java.lang.String| The anonymous (any foreign IP) access permission level, default is NONE, which means no access to any command.| | |
| qos-anonymous-access-permission-level-compatible| java.lang.String| | | |
| qos-anonymous-allow-commands| java.lang.String| The anonymous (any foreign IP) allowed commands, default is empty, which means no access to any command.| | |
| qos-check| java.lang.Boolean| Whether QoS should start successfully or not, will check qosEnable first.| | |
| qos-enable| java.lang.Boolean| Whether to enable Quality of Service (QoS) or not.| | |
| qos-enable-compatible| java.lang.Boolean| | | |
| qos-host| java.lang.String| The QoS host to listen.| | |
| qos-host-compatible| java.lang.String| | | |
| qos-port| java.lang.Integer| The QoS port to listen.| | |
| qos-port-compatible| java.lang.Integer| | | |
| readiness-probe| java.lang.String| The probe for checking the readiness of the application.| | |
| register-consumer| java.lang.Boolean| Used to control whether to register the instance with the registry or not. Set to &#x27;false&#x27; only when the instance is a pure consumer.| | |
| register-mode| java.lang.String| Register mode.| | |
| registries| java.util.List&lt;org.apache.dubbo.config.RegistryConfig&gt;| Registry centers.| | |
| registry| org.apache.dubbo.config.RegistryConfig| | | |
| registry-ids| java.lang.String| The comma-separated list of registry IDs to which the service will be registered.| | |
| repository| java.lang.String| Repository.| | |
| scope-model| org.apache.dubbo.rpc.model.ScopeModel| The scope model of this config instance. &lt;p&gt; &lt;b&gt;NOTE:&lt;/b&gt; the model maybe changed during config processing, the extension spi instance needs to be reinitialized after changing the model!| | |
| serialize-check-status| java.lang.String| The status of class serialization checking.| | |
| shutwait| java.lang.String| Config the shutdown wait.| | |
| startup-probe| java.lang.String| The probe for checking the startup of the application.| | |
| trust-serialize-class-level| java.lang.Integer| The trust level for serialized classes.| | |
| version| java.lang.String| The application version.| | |
### dubbo.config-center
**Class:** `org.apache.dubbo.config.ConfigCenterConfig`

|Key|Type|Description|Default value|Deprecation|
|---|----|-----------|-------------|-----------|
| address| java.lang.String| The address (URL or hostname) of the config center server.| | |
| app-config-file| java.lang.String| The properties file under &#x27;configFile&#x27; is global shared, while &#x27;.properties&#x27; under this one is limited only to this application.| | |
| app-external-configuration| java.util.Map&lt;java.lang.String,java.lang.String&gt;| Application-specific external configuration for the config center.| | |
| check| java.lang.Boolean| Behavior when the initial connection attempt to the config center fails. &#x27;true&#x27; means interrupt the whole process once a failure occurs. Default value is true.| | |
| cluster| java.lang.String| The config center cluster, its actual meaning may vary depending on the specific config center product.| | |
| config-file| java.lang.String| Key mapping for properties files. Most of the time, you do not need to change this parameter. Default value is CommonConstants.DEFAULT_DUBBO_PROPERTIES.| | |
| default| java.lang.Boolean| | | |
| external-configuration| java.util.Map&lt;java.lang.String,java.lang.String&gt;| External configuration for the config center.| | |
| group| java.lang.String| The group of the config center, often used to identify an isolated space for a batch of config items. Its actual meaning depends on the specific config center you use. Default value is CommonConstants.DUBBO.| | |
| highest-priority| java.lang.Boolean| If the config center should have the highest priority and override all other configurations. Deprecated and no longer used. Default value is true.| | Reason: null, use for replacement: null|
| id| java.lang.String| Identifier for this configuration.| | |
| meta-data| java.util.Map&lt;java.lang.String,java.lang.String&gt;| | | |
| namespace| java.lang.String| The namespace of the config center, generally used for multi-tenancy. Its actual meaning depends on the specific config center you use. Default value is CommonConstants.DUBBO.| | |
| need-refresh| java.lang.Boolean| Specifies if this configuration should be refreshed (true for refreshing).| true| |
| parameters| java.util.Map&lt;java.lang.String,java.lang.String&gt;| Additional parameters specific to your config center product can be added here. For example, with XML: &lt;dubbo:config-center&gt; &lt;dubbo:parameter key&#x3D;&quot;{your key}&quot; value&#x3D;&quot;{your value}&quot; /&gt; &lt;/dubbo:config-center&gt;| | |
| password| java.lang.String| Password for authentication with the config center.| | |
| port| java.lang.Integer| The port number for the config center server.| | |
| prefixes| java.util.List&lt;java.lang.String&gt;| | | |
| protocol| java.lang.String| The protocol used for accessing the config center.| | |
| scope-model| org.apache.dubbo.rpc.model.ScopeModel| The scope model of this config instance. &lt;p&gt; &lt;b&gt;NOTE:&lt;/b&gt; the model maybe changed during config processing, the extension spi instance needs to be reinitialized after changing the model!| | |
| timeout| java.lang.Long| The timeout for accessing the config center. Default value is 30000L.| | |
| username| java.lang.String| Username for authentication with the config center.| | |
### dubbo.consumer
**Class:** `org.apache.dubbo.config.ConsumerConfig`

|Key|Type|Description|Default value|Deprecation|
|---|----|-----------|-------------|-----------|
| actives| java.lang.Integer| Maximum concurrent invocations allowed.| | |
| application| org.apache.dubbo.config.ApplicationConfig| Application configuration for the service.| | Reason: null, use for replacement: null|
| async| java.lang.Boolean| Enable asynchronous invocation. Note that it is unreliable asynchronous, ignoring return values and not blocking threads.| | |
| auth| java.lang.Boolean| Enable service authentication.| | |
| cache| java.lang.String| Cache provider for caching return results. available options: lru, threadlocal, jcache etc.| | |
| callbacks| java.lang.Integer| Callback limits for the service.| | |
| check| java.lang.Boolean| Check if service provider exists, if not exists, it will be fast fail| | |
| client| java.lang.String| client type| | |
| cluster| java.lang.String| Cluster type for service.| | |
| config-center| org.apache.dubbo.config.ConfigCenterConfig| Configuration center settings.| | Reason: null, use for replacement: null|
| connections| java.lang.Integer| Connection limits: 0 for shared connection, otherwise specifying connections for the service.| | |
| corethreads| java.lang.Integer| Consumer threadpool core thread size| | |
| default| java.lang.Boolean| | | |
| exported-urls| java.util.List&lt;org.apache.dubbo.common.URL&gt;| | | |
| filter| java.lang.String| Filters for service exposure or reference (multiple filters can be separated by commas).| | |
| forks| java.lang.Integer| Forks for forking cluster.| | |
| generic| java.lang.String| Whether to use generic interface| | |
| group| java.lang.String| Group of the remote service referenced by the consumer/provider.| | |
| id| java.lang.String| Identifier for this configuration.| | |
| init| java.lang.Boolean| Whether to eagle-init| | |
| injvm| java.lang.Boolean| Whether to find reference&#x27;s instance from the current JVM| | Reason: null, use for replacement: null|
| interface| java.lang.String| | | |
| layer| java.lang.String| Layer of service providers.| | |
| lazy| java.lang.Boolean| Lazy create connection| | |
| listener| java.lang.String| Listeners for service exposure or reference (multiple listeners can be separated by commas).| | |
| loadbalance| java.lang.String| Load balancing strategy for service invocation.| | |
| local| java.lang.String| Local implementation class name for the service interface.| | Reason: null, use for replacement: null|
| merger| java.lang.String| Merger for result data.| | |
| mesh-enable| java.lang.Boolean| enable mesh mode @since 3.1.0| | |
| meta-data| java.util.Map&lt;java.lang.String,java.lang.String&gt;| | | |
| metadata-report-config| org.apache.dubbo.config.MetadataReportConfig| Metadata report configuration.| | Reason: null, use for replacement: null|
| methods| java.util.List&lt;org.apache.dubbo.config.MethodConfig&gt;| Method-specific configuration.| | |
| mock| java.lang.String| Mock class name to be called when a service fails to execute. The mock doesn&#x27;t support on the provider side, and it is executed when a non-business exception occurs after a remote service call.| | |
| module| org.apache.dubbo.config.ModuleConfig| Module configuration for the service.| | Reason: null, use for replacement: null|
| monitor| org.apache.dubbo.config.MonitorConfig| Service monitoring configuration.| | Reason: null, use for replacement: null|
| need-refresh| java.lang.Boolean| Specifies if this configuration should be refreshed (true for refreshing).| true| |
| onconnect| java.lang.String| Event handler for connection establishment.| | |
| ondisconnect| java.lang.String| Event handler for disconnection.| | |
| owner| java.lang.String| Owner of the service providers.| | |
| parameters| java.util.Map&lt;java.lang.String,java.lang.String&gt;| Customized parameters for configuration.| | |
| prefixes| java.util.List&lt;java.lang.String&gt;| | | |
| protocol| java.lang.String| Only the service provider of the specified protocol is invoked, and other protocols are ignored.| | |
| provided-by| java.lang.String| declares which app or service this interface belongs to| | |
| provider-namespace| java.lang.String| assign the namespace that provider belong to @since 3.1.1| | |
| provider-port| java.lang.Integer| By VirtualService and DestinationRule, envoy will generate a new route rule,such as &#x27;demo.default.svc.cluster.local:80&#x27;,the default port is 80. When you want to specify the provider port,you can use this config. @since 3.1.0| | |
| proxy| java.lang.String| Strategy for generating dynamic agents (options: &quot;jdk&quot; or &quot;javassist&quot;).| | |
| queues| java.lang.Integer| Consumer threadpool queue size| | |
| reconnect| java.lang.String| | | |
| refer-async| java.lang.Boolean| Weather the reference is referred asynchronously @see ModuleConfig#referAsync @deprecated| | Reason: null, use for replacement: null|
| refer-background| java.lang.Boolean| Whether refer should run in background or not. @see ModuleConfig#setBackground(Boolean) @deprecated replace with {@link ModuleConfig#setBackground(Boolean)}| | Reason: null, use for replacement: null|
| refer-thread-num| java.lang.Integer| Thread num for asynchronous refer pool size| | |
| registries| java.util.List&lt;org.apache.dubbo.config.RegistryConfig&gt;| Registries where the service will be registered (use this or registryIds, not both).| | |
| registry| org.apache.dubbo.config.RegistryConfig| | | |
| registry-ids| java.lang.String| Registry IDs for service registration (use this or registries, not both).| | |
| retries| java.lang.Integer| Retry times for failed invocations.| | |
| router| java.lang.String| | | |
| scope| java.lang.String| Service scope (&quot;local&quot; implies searching in the current JVM only).| | |
| scope-model| org.apache.dubbo.rpc.model.ScopeModel| The scope model of this config instance. &lt;p&gt; &lt;b&gt;NOTE:&lt;/b&gt; the model maybe changed during config processing, the extension spi instance needs to be reinitialized after changing the model!| | |
| sent| java.lang.Boolean| Acknowledge asynchronous-sent invocations.| | |
| shareconnections| java.lang.Integer| By default, a TCP long-connection communication is shared between the consumer process and the provider process. This property can be set to share multiple TCP long-connection communications. Note that only the dubbo protocol takes effect.| | |
| singleton| java.lang.Boolean| Use separate instances for services with the same serviceKey (applies when using ReferenceConfig and SimpleReferenceCache together). Directly calling ReferenceConfig.get() will not check this attribute.| | |
| sticky| java.lang.Boolean| | | |
| stub| java.lang.String| Local stub class name for the service interface.| | |
| tag| java.lang.String| Custom tag for the service configuration.| | |
| threadpool| java.lang.String| Consumer thread pool type: cached, fixed, limit, eager| | |
| threads| java.lang.Integer| Consumer threadpool thread size| | |
| timeout| java.lang.Integer| Timeout for remote invocation in milliseconds.| | |
| url-merge-processor| java.lang.String| Url Merge Processor Used to customize the URL merge of consumer and provider| | |
| validation| java.lang.String| Enable JSR303 standard annotation validation for method parameters.| | |
| version| java.lang.String| Version of the remote service referenced by the consumer/provider.| | |
### dubbo.metadata-report
**Class:** `org.apache.dubbo.config.MetadataReportConfig`

|Key|Type|Description|Default value|Deprecation|
|---|----|-----------|-------------|-----------|
| address| java.lang.String| The address of the metadata center.| | |
| check| java.lang.Boolean| Decide the behavior when the initial connection attempt fails, where &#x27;true&#x27; means interrupt the whole process once it fails. The default value is true.| | |
| cluster| java.lang.Boolean| Whether to use a cluster configuration for the metadata center.| | |
| cycle-report| java.lang.Boolean| By default, the metadata store will store full metadata repeatedly every day.| | |
| default| java.lang.Boolean| | | |
| file| java.lang.String| The file path for saving the metadata center&#x27;s dynamic list.| | |
| group| java.lang.String| The group for the metadata center, which is similar to the registry group.| | |
| id| java.lang.String| Identifier for this configuration.| | |
| meta-data| java.util.Map&lt;java.lang.String,java.lang.String&gt;| | | |
| need-refresh| java.lang.Boolean| Specifies if this configuration should be refreshed (true for refreshing).| true| |
| parameters| java.util.Map&lt;java.lang.String,java.lang.String&gt;| Customized parameters for the metadata center.| | |
| password| java.lang.String| The password used to log in to the metadata center.| | |
| port| java.lang.Integer| The default port for the metadata center.| | |
| prefixes| java.util.List&lt;java.lang.String&gt;| | | |
| protocol| java.lang.String| The protocol for the metadata center.| | |
| registry| java.lang.String| The registry ID for the metadata center.| | |
| report-definition| java.lang.Boolean| Whether to report definition.| | |
| report-metadata| java.lang.Boolean| Whether to report metadata.| | |
| retry-period| java.lang.Integer| The retry period in milliseconds when connecting to the metadata center.| | |
| retry-times| java.lang.Integer| The number of retry times when connecting to the metadata center.| | |
| scope-model| org.apache.dubbo.rpc.model.ScopeModel| The scope model of this config instance. &lt;p&gt; &lt;b&gt;NOTE:&lt;/b&gt; the model maybe changed during config processing, the extension spi instance needs to be reinitialized after changing the model!| | |
| sync-report| java.lang.Boolean| Synchronization report, with the default value as asynchronous.| | |
| timeout| java.lang.Integer| The request timeout in milliseconds for the metadata center.| | |
| username| java.lang.String| The username used to log in to the metadata center.| | |
### dubbo.metrics
**Class:** `org.apache.dubbo.config.MetricsConfig`

|Key|Type|Description|Default value|Deprecation|
|---|----|-----------|-------------|-----------|
| collector-sync-period| java.lang.Integer| Collector synchronization period.| | |
| default| java.lang.Boolean| | | |
| enable-collector-sync| java.lang.Boolean| Whether to enable collector synchronization.| | |
| enable-jvm| java.lang.Boolean| Whether to enable JVM metrics collection.| | |
| enable-metadata| java.lang.Boolean| Whether to enable metadata metrics collection.| | |
| enable-metrics-init| java.lang.Boolean| Whether to enable metrics initialization.| | |
| enable-netty| java.lang.Boolean| Whether to enable Netty metrics collection.| | |
| enable-registry| java.lang.Boolean| Whether to enable registry metrics collection.| | |
| enable-rpc| java.lang.Boolean| Whether to enable RPC (Remote Procedure Call) metrics collection.| | |
| enable-threadpool| java.lang.Boolean| Whether to enable thread pool metrics collection.| | |
| export-metrics-service| java.lang.Boolean| Whether to export metrics service.| | |
| export-service-port| java.lang.Integer| Port used for exporting metrics services.| | |
| export-service-protocol| java.lang.String| Protocol used for metrics collection and export.| | |
| id| java.lang.String| Identifier for this configuration.| | |
| meta-data| java.util.Map&lt;java.lang.String,java.lang.String&gt;| | | |
| need-refresh| java.lang.Boolean| Specifies if this configuration should be refreshed (true for refreshing).| true| |
| port| java.lang.String| Deprecated: This parameter should no longer be used and will be removed in the future.| | |
| prefixes| java.util.List&lt;java.lang.String&gt;| | | |
| protocol| java.lang.String| Protocol used for metrics.| | |
| rpc-level| java.lang.String| The level of metrics collection, which can be &quot;SERVICE&quot; or &quot;METHOD&quot;. The default is &quot;METHOD&quot;.| | |
| scope-model| org.apache.dubbo.rpc.model.ScopeModel| The scope model of this config instance. &lt;p&gt; &lt;b&gt;NOTE:&lt;/b&gt; the model maybe changed during config processing, the extension spi instance needs to be reinitialized after changing the model!| | |
| use-global-registry| java.lang.Boolean| Decide whether to use the global registry of Micrometer.| | |
### dubbo.module
**Class:** `org.apache.dubbo.config.ModuleConfig`

|Key|Type|Description|Default value|Deprecation|
|---|----|-----------|-------------|-----------|
| background| java.lang.Boolean| Whether to start the module in the background. If started in the background, it does not await finish on Spring ContextRefreshedEvent. @see org.apache.dubbo.config.spring.context.DubboDeployApplicationListener| | |
| check-reference-timeout| java.lang.Long| The timeout to check references.| | |
| default| java.lang.Boolean| | | |
| export-async| java.lang.Boolean| Whether the service is exported asynchronously.| | |
| export-thread-num| java.lang.Integer| The thread number for asynchronous export pool size.| | |
| id| java.lang.String| Identifier for this configuration.| | |
| meta-data| java.util.Map&lt;java.lang.String,java.lang.String&gt;| | | |
| monitor| org.apache.dubbo.config.MonitorConfig| Monitor center| | |
| name| java.lang.String| The module name| | |
| need-refresh| java.lang.Boolean| Specifies if this configuration should be refreshed (true for refreshing).| true| |
| organization| java.lang.String| The module&#x27;s organization| | |
| owner| java.lang.String| The module owner| | |
| prefixes| java.util.List&lt;java.lang.String&gt;| | | |
| refer-async| java.lang.Boolean| Whether the reference is referred asynchronously.| | |
| refer-thread-num| java.lang.Integer| The thread number for asynchronous reference pool size.| | |
| registries| java.util.List&lt;org.apache.dubbo.config.RegistryConfig&gt;| Registry centers| | |
| registry| org.apache.dubbo.config.RegistryConfig| | | |
| scope-model| org.apache.dubbo.rpc.model.ScopeModel| The scope model of this config instance. &lt;p&gt; &lt;b&gt;NOTE:&lt;/b&gt; the model maybe changed during config processing, the extension spi instance needs to be reinitialized after changing the model!| | |
| version| java.lang.String| The module version| | |
### dubbo.monitor
**Class:** `org.apache.dubbo.config.MonitorConfig`

|Key|Type|Description|Default value|Deprecation|
|---|----|-----------|-------------|-----------|
| address| java.lang.String| The monitor address| | |
| default| java.lang.Boolean| | | |
| group| java.lang.String| The monitor group| | |
| id| java.lang.String| Identifier for this configuration.| | |
| interval| java.lang.String| The monitor reporting interval| | |
| meta-data| java.util.Map&lt;java.lang.String,java.lang.String&gt;| | | |
| need-refresh| java.lang.Boolean| Specifies if this configuration should be refreshed (true for refreshing).| true| |
| parameters| java.util.Map&lt;java.lang.String,java.lang.String&gt;| Customized parameters| | |
| password| java.lang.String| The monitor password| | |
| prefixes| java.util.List&lt;java.lang.String&gt;| | | |
| protocol| java.lang.String| The protocol of the monitor. If the value is &quot;registry&quot; it will search the monitor address from the registry center. Otherwise, it will directly connect to the monitor center.| | |
| scope-model| org.apache.dubbo.rpc.model.ScopeModel| The scope model of this config instance. &lt;p&gt; &lt;b&gt;NOTE:&lt;/b&gt; the model maybe changed during config processing, the extension spi instance needs to be reinitialized after changing the model!| | |
| username| java.lang.String| The monitor username| | |
| version| java.lang.String| The monitor version| | |
### dubbo.protocol
**Class:** `org.apache.dubbo.config.ProtocolConfig`

|Key|Type|Description|Default value|Deprecation|
|---|----|-----------|-------------|-----------|
| accepts| java.lang.Integer| The maximum acceptable connections.| | |
| accesslog| java.lang.String| The access log configuration.| | |
| alive| java.lang.Integer| The keep-alive time for threads in the thread pool (default unit is TimeUnit.MILLISECONDS).| | |
| buffer| java.lang.Integer| The buffer size.| | |
| charset| java.lang.String| The character set used for communication.| | |
| client| java.lang.String| The client implementation.| | |
| codec| java.lang.String| The protocol codec.| | |
| contextpath| java.lang.String| The context path for the service.| | |
| corethreads| java.lang.Integer| The core thread size of the thread pool.| | |
| default| java.lang.Boolean| | | |
| dispatcher| java.lang.String| The thread dispatch mode.| | |
| dispather| java.lang.String| | | Reason: null, use for replacement: null|
| exchanger| java.lang.String| The method of information exchange.| | |
| ext-protocol| java.lang.String| Extra protocol for this service, using Port Unification Server.| | |
| extension| java.lang.String| Additional extensions.| | |
| heartbeat| java.lang.Integer| The interval for sending heartbeats.| | |
| host| java.lang.String| The service&#x27;s IP address (useful when there are multiple network cards available).| | |
| id| java.lang.String| Identifier for this configuration.| | |
| iothreads| java.lang.Integer| The fixed size of the IO thread pool.| | |
| json-check-level| java.lang.String| JSON check level for serialization.| | |
| keep-alive| java.lang.Boolean| Indicates whether it is a persistent connection.| | |
| meta-data| java.util.Map&lt;java.lang.String,java.lang.String&gt;| | | |
| name| java.lang.String| The name of the protocol.| | |
| need-refresh| java.lang.Boolean| Specifies if this configuration should be refreshed (true for refreshing).| true| |
| networker| java.lang.String| The networker implementation.| | |
| optimizer| java.lang.String| The optimizer used for dubbo protocol.| | |
| parameters| java.util.Map&lt;java.lang.String,java.lang.String&gt;| Custom parameters.| | |
| path| java.lang.String| | | Reason: null, use for replacement: null|
| payload| java.lang.Integer| The maximum payload length.| | |
| port| java.lang.Integer| The service&#x27;s port number.| | |
| prefer-serialization| java.lang.String| Specifies the preferred serialization method for the consumer.  If specified, the consumer will use this parameter first. If the Dubbo Sdk you are using contains the serialization type, the serialization method specified by the argument is used. &lt;p&gt; When this parameter is null or the serialization type specified by this parameter does not exist in the Dubbo SDK, the serialization type specified by serialization is used. If the Dubbo SDK if still does not exist, the default type of the Dubbo SDK is used. For Dubbo SDK &gt;&#x3D; 3.2, &lt;code&gt;preferSerialization&lt;/code&gt; takes precedence over &lt;code&gt;serialization&lt;/code&gt; &lt;p&gt; Supports multiple values separated by commas, e.g., &quot;fastjson2,fastjson,hessian2&quot;.| | |
| prefixes| java.util.List&lt;java.lang.String&gt;| | | |
| prompt| java.lang.String| The command line prompt.| | |
| queues| java.lang.Integer| The length of the thread pool&#x27;s queue.| | |
| register| java.lang.Boolean| Indicates whether the service should be registered.| | |
| scope-model| org.apache.dubbo.rpc.model.ScopeModel| The scope model of this config instance. &lt;p&gt; &lt;b&gt;NOTE:&lt;/b&gt; the model maybe changed during config processing, the extension spi instance needs to be reinitialized after changing the model!| | |
| serialization| java.lang.String| The serialization method.| | |
| server| java.lang.String| The server implementation.| | |
| ssl-enabled| java.lang.Boolean| Indicates whether SSL is enabled.| | |
| status| java.lang.String| The status check configuration.| | |
| telnet| java.lang.String| Supported Telnet commands, separated by commas.| | |
| thread-pool-exhausted-listeners| java.lang.String| Listeners for exhausted thread pool.| | |
| threadpool| java.lang.String| The name of the thread pool.| | |
| threads| java.lang.Integer| The fixed size of the thread pool.| | |
| transporter| java.lang.String| The transporter used for communication.| | |
### dubbo.provider
**Class:** `org.apache.dubbo.config.ProviderConfig`

|Key|Type|Description|Default value|Deprecation|
|---|----|-----------|-------------|-----------|
| accepts| java.lang.Integer| The maximum number of acceptable connections.| | |
| accesslog| java.lang.String| Whether to export access logs to logs.| | |
| actives| java.lang.Integer| Maximum concurrent invocations allowed.| | |
| alive| java.lang.Integer| The keep-alive time of the thread pool, default unit: TimeUnit.MILLISECONDS.| | |
| application| org.apache.dubbo.config.ApplicationConfig| Application configuration for the service.| | Reason: null, use for replacement: null|
| async| java.lang.Boolean| Enable asynchronous invocation. Note that it is unreliable asynchronous, ignoring return values and not blocking threads.| | |
| auth| java.lang.Boolean| Enable service authentication.| | |
| buffer| java.lang.Integer| The size of the network I/O buffer.| | |
| cache| java.lang.String| Cache provider for caching return results. available options: lru, threadlocal, jcache etc.| | |
| callbacks| java.lang.Integer| Callback limits for the service.| | |
| charset| java.lang.String| The charset used for serialization.| | |
| client| java.lang.String| The client-side implementation model of the protocol.| | |
| cluster| java.lang.String| Cluster type for service.| | |
| codec| java.lang.String| The codec used by the protocol.| | |
| config-center| org.apache.dubbo.config.ConfigCenterConfig| Configuration center settings.| | Reason: null, use for replacement: null|
| connections| java.lang.Integer| Connection limits: 0 for shared connection, otherwise specifying connections for the service.| | |
| contextpath| java.lang.String| The context path of the service.| | |
| default| java.lang.Boolean| | | |
| delay| java.lang.Integer| The time delay to register the service (in milliseconds).| | |
| deprecated| java.lang.Boolean| Whether the service is deprecated.| | |
| dispatcher| java.lang.String| The mode of thread dispatching.| | |
| dispather| java.lang.String| | | Reason: null, use for replacement: null|
| document| java.lang.String| Document center for the service.| | |
| dynamic| java.lang.Boolean| Whether to register the service as a dynamic service on the registry. If true, the service will be enabled automatically after registration, and manual disabling is required to stop it.| | |
| exchanger| java.lang.String| The method of information exchange.| | |
| executes| java.lang.Integer| Max allowed executing times.| | |
| executor| java.util.concurrent.Executor| used for thread pool isolation between services| | |
| export| java.lang.Boolean| Whether to export the service.| | |
| export-async| java.lang.Boolean| Weather the service is export asynchronously @deprecated @see ModuleConfig#exportAsync| | Reason: null, use for replacement: null|
| export-background| java.lang.Boolean| Whether the export should run in the background or not. @deprecated Replace with {@link ModuleConfig#setBackground(Boolean)} @see ModuleConfig#setBackground(Boolean)| | Reason: null, use for replacement: null|
| export-thread-num| java.lang.Integer| The number of threads for the asynchronous export pool.| | Reason: null, use for replacement: null|
| exported-urls| java.util.List&lt;org.apache.dubbo.common.URL&gt;| | | |
| filter| java.lang.String| Filters for service exposure or reference (multiple filters can be separated by commas).| | |
| forks| java.lang.Integer| Forks for forking cluster.| | |
| group| java.lang.String| The service group.| | |
| host| java.lang.String| The IP addresses of the service (used when there are multiple network cards available).| | |
| id| java.lang.String| Identifier for this configuration.| | |
| interface| java.lang.String| | | |
| iothreads| java.lang.Integer| The size of the I/O thread pool (fixed size).| | |
| layer| java.lang.String| Layer of service providers.| | |
| listener| java.lang.String| Listeners for service exposure or reference (multiple listeners can be separated by commas).| | |
| loadbalance| java.lang.String| Load balancing strategy for service invocation.| | |
| local| java.lang.String| Local implementation class name for the service interface.| | Reason: null, use for replacement: null|
| merger| java.lang.String| Merger for result data.| | |
| meta-data| java.util.Map&lt;java.lang.String,java.lang.String&gt;| | | |
| metadata-report-config| org.apache.dubbo.config.MetadataReportConfig| Metadata report configuration.| | Reason: null, use for replacement: null|
| methods| java.util.List&lt;org.apache.dubbo.config.MethodConfig&gt;| Method-specific configuration.| | |
| mock| java.lang.String| Mock class name to be called when a service fails to execute. The mock doesn&#x27;t support on the provider side, and it is executed when a non-business exception occurs after a remote service call.| | |
| module| org.apache.dubbo.config.ModuleConfig| Module configuration for the service.| | Reason: null, use for replacement: null|
| monitor| org.apache.dubbo.config.MonitorConfig| Service monitoring configuration.| | Reason: null, use for replacement: null|
| need-refresh| java.lang.Boolean| Specifies if this configuration should be refreshed (true for refreshing).| true| |
| networker| java.lang.String| The networker used by the protocol.| | |
| onconnect| java.lang.String| Event handler for connection establishment.| | |
| ondisconnect| java.lang.String| Event handler for disconnection.| | |
| owner| java.lang.String| Owner of the service providers.| | |
| parameters| java.util.Map&lt;java.lang.String,java.lang.String&gt;| Customized parameters for configuration.| | |
| path| java.lang.String| | | Reason: null, use for replacement: null|
| payload| java.lang.Integer| The maximum payload length.| | |
| port| java.lang.Integer| The port of the service.| | Reason: null, use for replacement: null|
| prefer-serialization| java.lang.String| Specifies the preferred serialization method for the consumer.  If specified, the consumer will use this parameter first. If the Dubbo Sdk you are using contains the serialization type, the serialization method specified by the argument is used. &lt;p&gt; When this parameter is null or the serialization type specified by this parameter does not exist in the Dubbo SDK, the serialization type specified by serialization is used. If the Dubbo SDK if still does not exist, the default type of the Dubbo SDK is used. For Dubbo SDK &gt;&#x3D; 3.2, &lt;code&gt;preferSerialization&lt;/code&gt; takes precedence over &lt;code&gt;serialization&lt;/code&gt; &lt;p&gt; Supports multiple values separated by commas, e.g., &quot;fastjson2,fastjson,hessian2&quot;.| | |
| prefixes| java.util.List&lt;java.lang.String&gt;| | | |
| prompt| java.lang.String| The command line prompt.| | |
| protocol| org.apache.dubbo.config.ProtocolConfig| | | |
| protocol-ids| java.lang.String| Id list of protocols the service will export with (use this or protocols, not both).| | |
| protocols| java.util.List&lt;org.apache.dubbo.config.ProtocolConfig&gt;| List of protocols the service will export with (use this or protocolIds, not both).| | |
| proxy| java.lang.String| Strategy for generating dynamic agents (options: &quot;jdk&quot; or &quot;javassist&quot;).| | |
| queues| java.lang.Integer| The length of the thread pool queue.| | |
| register| java.lang.Boolean| Whether to register the service.| | |
| registries| java.util.List&lt;org.apache.dubbo.config.RegistryConfig&gt;| Registries where the service will be registered (use this or registryIds, not both).| | |
| registry| org.apache.dubbo.config.RegistryConfig| | | |
| registry-ids| java.lang.String| Registry IDs for service registration (use this or registries, not both).| | |
| retries| java.lang.Integer| Retry times for failed invocations.| | |
| scope| java.lang.String| Service scope (&quot;local&quot; implies searching in the current JVM only).| | |
| scope-model| org.apache.dubbo.rpc.model.ScopeModel| The scope model of this config instance. &lt;p&gt; &lt;b&gt;NOTE:&lt;/b&gt; the model maybe changed during config processing, the extension spi instance needs to be reinitialized after changing the model!| | |
| sent| java.lang.Boolean| Acknowledge asynchronous-sent invocations.| | |
| serialization| java.lang.String| Serialization type for service communication.| | |
| server| java.lang.String| The server-side implementation model of the protocol.| | |
| singleton| java.lang.Boolean| Use separate instances for services with the same serviceKey (applies when using ReferenceConfig and SimpleReferenceCache together). Directly calling ReferenceConfig.get() will not check this attribute.| | |
| status| java.lang.String| The status check configuration.| | |
| stub| java.lang.String| Local stub class name for the service interface.| | |
| tag| java.lang.String| Custom tag for the service configuration.| | |
| telnet| java.lang.String| Supported telnet commands, separated by commas.| | |
| threadname| java.lang.String| The name of the thread pool.| | |
| threadpool| java.lang.String| The thread pool configuration.| | |
| threads| java.lang.Integer| The size of the thread pool (fixed size).| | |
| timeout| java.lang.Integer| Timeout for remote invocation in milliseconds.| | |
| token| java.lang.String| Whether to use a token for authentication.| | |
| transporter| java.lang.String| The transporter used by the protocol.| | |
| use-java-package-as-path| java.lang.Boolean| Whether to use java_package in IDL as path. Default use package. This param only available when service using native stub.| | |
| validation| java.lang.String| Enable JSR303 standard annotation validation for method parameters.| | |
| version| java.lang.String| The service version.| | |
| wait| java.lang.Integer| The wait time when stopping the service.| | |
| warmup| java.lang.Integer| Warm-up period for the service.| | |
| weight| java.lang.Integer| The service weight.| | |
### dubbo.registry
**Class:** `org.apache.dubbo.config.RegistryConfig`

|Key|Type|Description|Default value|Deprecation|
|---|----|-----------|-------------|-----------|
| accepts| java.lang.String| List of RPC protocols accepted by this registry, e.g., &quot;dubbo,rest&quot;.| | |
| address| java.lang.String| Register center address.| | |
| check| java.lang.Boolean| Whether to check if the register center is available when booting up.| | |
| client| java.lang.String| Client implementation.| | |
| cluster| java.lang.String| Affects how traffic distributes among registries, useful when subscribing to multiple registries. Available options: - &quot;zone-aware&quot;: A certain type of traffic always goes to one Registry according to where the traffic is originated.| | |
| default| java.lang.Boolean| | | |
| dynamic| java.lang.Boolean| Whether to allow dynamic service registration on the register center.| | |
| enable-empty-protection| java.lang.Boolean| Enable empty protection.| | |
| extra-keys| java.lang.String| After simplifying the registry, add some parameters individually, useful for providers. Example: extra-keys &#x3D; &quot;A, b, c, d&quot;. @since 2.7.0| | |
| file| java.lang.String| File for saving the register center dynamic list.| | |
| group| java.lang.String| The group that services registry belongs to.| | |
| id| java.lang.String| Identifier for this configuration.| | |
| meta-data| java.util.Map&lt;java.lang.String,java.lang.String&gt;| | | |
| need-refresh| java.lang.Boolean| Specifies if this configuration should be refreshed (true for refreshing).| true| |
| parameters| java.util.Map&lt;java.lang.String,java.lang.String&gt;| Customized parameters.| | |
| password| java.lang.String| Password to login the register center.| | |
| port| java.lang.Integer| Default port for the register center.| | |
| preferred| java.lang.Boolean| Always use this registry first if set to true, useful when subscribing to multiple registries.| | |
| prefixes| java.util.List&lt;java.lang.String&gt;| | | |
| protocol| java.lang.String| Protocol used for the register center.| | |
| register| java.lang.Boolean| Whether to allow exporting service on the register center.| | |
| register-mode| java.lang.String| Register mode.| | |
| scope-model| org.apache.dubbo.rpc.model.ScopeModel| The scope model of this config instance. &lt;p&gt; &lt;b&gt;NOTE:&lt;/b&gt; the model maybe changed during config processing, the extension spi instance needs to be reinitialized after changing the model!| | |
| secure| java.lang.String| Security settings.| | |
| server| java.lang.String| Server implementation.| | |
| session| java.lang.Integer| Session timeout in milliseconds for the register center.| | |
| simplified| java.lang.Boolean| Simplify the registry, useful for both providers and consumers. @since 2.7.0| | |
| subscribe| java.lang.Boolean| Whether to allow subscribing to services on the register center.| | |
| timeout| java.lang.Integer| Connect timeout in milliseconds for the register center.| | |
| transport| java.lang.String| | | Reason: null, use for replacement: null|
| transporter| java.lang.String| Network transmission type.| | |
| use-as-config-center| java.lang.Boolean| Indicates whether the address works as a configuration center or not.| | |
| use-as-metadata-center| java.lang.Boolean| Indicates whether the address works as a remote metadata center or not.| | |
| username| java.lang.String| Username to login the register center.| | |
| version| java.lang.String| Version of the registry.| | |
| wait| java.lang.Integer| Wait time before stopping.| | Reason: null, use for replacement: null|
| weight| java.lang.Integer| Affects traffic distribution among registries, useful when subscribing to multiple registries. Takes effect only when no preferred registry is specified.| | |
| zone| java.lang.String| The region where the registry belongs, usually used to isolate traffics.| | |
### dubbo.rpc
**Class:** `org.apache.dubbo.spring.boot.autoconfigure.DubboConfigurationProperties$RpcConfig`

|Key|Type|Description|Default value|Deprecation|
|---|----|-----------|-------------|-----------|
### dubbo.ssl
**Class:** `org.apache.dubbo.config.SslConfig`

|Key|Type|Description|Default value|Deprecation|
|---|----|-----------|-------------|-----------|
| ca-address| java.lang.String| Address for Certificate Authority (CA).| | |
| ca-cert-path| java.lang.String| Path to the CA certificate file.| | |
| client-key-cert-chain-path| java.lang.String| Path to the client&#x27;s key certificate chain file.| | |
| client-key-cert-chain-path-stream| java.io.InputStream| Input stream for the client&#x27;s key certificate chain (if provided).| | |
| client-key-password| java.lang.String| Password for the client&#x27;s private key (if applicable).| | |
| client-private-key-path| java.lang.String| Path to the client&#x27;s private key file.| | |
| client-private-key-path-stream| java.io.InputStream| Input stream for the client&#x27;s private key (if provided).| | |
| client-trust-cert-collection-path| java.lang.String| Path to the client&#x27;s trust certificate collection file.| | |
| client-trust-cert-collection-path-stream| java.io.InputStream| Input stream for the client&#x27;s trust certificate collection (if provided).| | |
| default| java.lang.Boolean| | | |
| env-type| java.lang.String| Environment type for SSL configuration.| | |
| id| java.lang.String| Identifier for this configuration.| | |
| meta-data| java.util.Map&lt;java.lang.String,java.lang.String&gt;| | | |
| need-refresh| java.lang.Boolean| Specifies if this configuration should be refreshed (true for refreshing).| true| |
| oidc-token-path| java.lang.String| Path to the OIDC (OpenID Connect) token file.| | |
| prefixes| java.util.List&lt;java.lang.String&gt;| | | |
| scope-model| org.apache.dubbo.rpc.model.ScopeModel| The scope model of this config instance. &lt;p&gt; &lt;b&gt;NOTE:&lt;/b&gt; the model maybe changed during config processing, the extension spi instance needs to be reinitialized after changing the model!| | |
| server-key-cert-chain-path| java.lang.String| Path to the server&#x27;s key certificate chain file.| | |
| server-key-cert-chain-path-stream| java.io.InputStream| Input stream for the server&#x27;s key certificate chain (if provided).| | |
| server-key-password| java.lang.String| Password for the server&#x27;s private key (if applicable).| | |
| server-private-key-path| java.lang.String| Path to the server&#x27;s private key file.| | |
| server-private-key-path-stream| java.io.InputStream| Input stream for the server&#x27;s private key (if provided).| | |
| server-trust-cert-collection-path| java.lang.String| Path to the server&#x27;s trust certificate collection file.| | |
| server-trust-cert-collection-path-stream| java.io.InputStream| Input stream for the server&#x27;s trust certificate collection (if provided).| | |
### dubbo.tracing
**Class:** `org.apache.dubbo.config.TracingConfig`

|Key|Type|Description|Default value|Deprecation|
|---|----|-----------|-------------|-----------|
| default| java.lang.Boolean| | | |
| enabled| java.lang.Boolean| Indicates whether the feature is enabled (default is false).| false| |
| id| java.lang.String| Identifier for this configuration.| | |
| meta-data| java.util.Map&lt;java.lang.String,java.lang.String&gt;| | | |
| need-refresh| java.lang.Boolean| Specifies if this configuration should be refreshed (true for refreshing).| true| |
| prefixes| java.util.List&lt;java.lang.String&gt;| | | |
| scope-model| org.apache.dubbo.rpc.model.ScopeModel| The scope model of this config instance. &lt;p&gt; &lt;b&gt;NOTE:&lt;/b&gt; the model maybe changed during config processing, the extension spi instance needs to be reinitialized after changing the model!| | |
### dubbo.metrics.aggregation
**Class:** `org.apache.dubbo.config.nested.AggregationConfig`

|Key|Type|Description|Default value|Deprecation|
|---|----|-----------|-------------|-----------|
| bucket-num| java.lang.Integer| The number of buckets for time window quantile.| | |
| enable-qps| java.lang.Boolean| Enable QPS (Queries Per Second) aggregation or not.| | |
| enable-request| java.lang.Boolean| Enable Request aggregation or not.| | |
| enable-rt| java.lang.Boolean| Enable Response Time aggregation or not.| | |
| enable-rt-pxx| java.lang.Boolean| Enable Response Time Percentile (Pxx) aggregation or not.| | |
| enabled| java.lang.Boolean| Enable aggregation or not.| | |
| qps-time-window-mill-seconds| java.lang.Integer| The time window in milliseconds for QPS (Queries Per Second) aggregation.| | |
| time-window-seconds| java.lang.Integer| The time window in seconds for time window quantile.| | |
### dubbo.metrics.histogram
**Class:** `org.apache.dubbo.config.nested.HistogramConfig`

|Key|Type|Description|Default value|Deprecation|
|---|----|-----------|-------------|-----------|
| buckets-ms| java.lang.Integer[]| Buckets in milliseconds for the histograms. Defines the histogram bucket boundaries.| | |
| distribution-statistic-expiry-min| java.lang.Integer| Expiry time in minutes for distribution statistics. After this time, the statistics are expired.| | |
| enabled| java.lang.Boolean| Whether histograms are enabled or not. Default is not enabled (false).| | |
| enabled-percentiles| java.lang.Boolean| Whether enabledPercentiles are enabled or not. Default is not enabled (false).| | |
| max-expected-ms| java.lang.Integer| Maximum expected value in milliseconds for the histograms. Values higher than this will be considered outliers.| | |
| min-expected-ms| java.lang.Integer| Minimum expected value in milliseconds for the histograms. Values lower than this will be considered outliers.| | |
| percentiles| java.lang.Double[]| Array of percentiles to be calculated for the histograms. Each percentile is a double value.| | |
### dubbo.metrics.prometheus
**Class:** `org.apache.dubbo.config.nested.PrometheusConfig`

|Key|Type|Description|Default value|Deprecation|
|---|----|-----------|-------------|-----------|


### method

方法级配置。

> 对应的配置类： `org.apache.dubbo.config.MethodConfig`。同时该标签为 `service` 或 `reference` 的子标签，用于控制到方法级。

比如:

```xml
<dubbo:reference interface="com.xxx.XxxService">
   <dubbo:method name="findXxx" timeout="3000" retries="2" />
</dubbo:reference>
```

| 属性 | 对应URL参数 | 类型 | 是否必填 | 缺省值 | 作用 | 描述 | 兼容性 |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| name | | string | <b>必填</b> | | 标识 | 方法名 | 1.0.8以上版本 |
| timeout | &lt;methodName&gt;.timeout | int | 可选 | 缺省为的timeout | 性能调优 | 方法调用超时时间(毫秒) | 1.0.8以上版本 |
| retries | &lt;methodName&gt;.retries | int | 可选 | 缺省为&lt;dubbo:reference&gt;的retries | 性能调优 | 远程服务调用重试次数，不包括第一次调用，不需要重试请设为0 | 2.0.0以上版本 |
| loadbalance | &lt;methodName&gt;.loadbalance | string | 可选 | 缺省为的loadbalance | 性能调优 | 负载均衡策略，可选值：<br/><br/>* random - 随机; <br/><br/>* roundrobin - 轮询; <br/><br/>* leastactive - 最少活跃调用; <br/><br/>* consistenthash - 哈希一致 (2.1.0以上版本); <br/><br/>* shortestresponse - 最短响应 (2.7.7以上版本); | 2.0.0以上版本 |
| async | &lt;methodName&gt;.async | boolean | 可选 | 缺省为&lt;dubbo:reference&gt;的async | 性能调优 | 是否异步执行，不可靠异步，只是忽略返回值，不阻塞执行线程 | 1.0.9以上版本 |
| sent | &lt;methodName&gt;.sent | boolean | 可选 | true | 性能调优 | 异步调用时，标记sent=true时，表示网络已发出数据 | 2.0.6以上版本 |
| actives | &lt;methodName&gt;.actives | int | 可选 | 0 | 性能调优 | 每服务消费者最大并发调用限制 | 2.0.5以上版本 |
| executes | &lt;methodName&gt;.executes | int | 可选 | 0 | 性能调优 | 每服务每方法最大使用线程数限制&#45; &#45;，此属性只在&lt;dubbo:method&gt;作为&lt;dubbo:service&gt;子标签时有效 | 2.0.5以上版本 |
| deprecated | &lt;methodName&gt;.deprecated | boolean | 可选 | false | 服务治理 | 服务方法是否过时，此属性只在&lt;dubbo:method&gt;作为&lt;dubbo:service&gt;子标签时有效 | 2.0.5以上版本 |
| sticky | &lt;methodName&gt;.sticky | boolean | 可选 | false | 服务治理 | 设置true 该接口上的所有方法使用同一个provider.如果需要更复杂的规则，请使用路由 | 2.0.6以上版本 |
| return | &lt;methodName&gt;.return | boolean | 可选 | true | 性能调优 | 方法调用是否需要返回值,async设置为true时才生效，如果设置为true，则返回future，或回调onreturn等方法，如果设置为false，则请求发送成功后直接返回Null | 2.0.6以上版本 |
| oninvoke | attribute属性，不在URL中体现 | String | 可选 | | 性能调优 | 实例执行前拦截 | 2.0.6以上版本 |
| onreturn | attribute属性，不在URL中体现 | String | 可选 | | 性能调优 | 实例执行返回后拦截 | 2.0.6以上版本 |
| onthrow | attribute属性，不在URL中体现 | String | 可选 | | 性能调优 | 实例执行有异常拦截 | 2.0.6以上版本 |
| oninvokeMethod | attribute属性，不在URL中体现 | String | 可选 | | 性能调优 | 方法执行前拦截 | 2.0.6以上版本 |
| onreturnMethod | attribute属性，不在URL中体现 | String | 可选 | | 性能调优 | 方法执行返回后拦截 | 2.0.6以上版本 |
| onthrowMethod | attribute属性，不在URL中体现 | String | 可选 | | 性能调优 | 方法执行有异常拦截 | 2.0.6以上版本 |
| cache | &lt;methodName&gt;.cache | string/boolean | 可选 | | 服务治理 | 以调用参数为key，缓存返回结果，可选：lru, threadlocal, jcache等 | 2.1.0以上版本 |
| validation | &lt;methodName&gt;.validation | boolean | 可选 | | 服务治理 | 是否启用JSR303标准注解验证，如果启用，将对方法参数上的注解进行校验 | 2.1.0以上版本 |

### argument

方法参数配置。

> 对应的配置类： `org.apache.dubbo.config.ArgumentConfig`。该标签为 `method` 的子标签，用于方法参数的特征描述，比如 XML 格式：

```xml
<dubbo:method name="findXxx" timeout="3000" retries="2">
   <dubbo:argument index="0" callback="true" />
</dubbo:method>
```

| 属性 | 对应URL参数 | 类型 | 是否必填 | 缺省值 | 作用 | 描述 | 兼容性 |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| index | | int | <b>必填</b> | | 标识 | 参数索引 | 2.0.6以上版本 |
| type | | String | 与index二选一 | | 标识 | 通过参数类型查找参数的index | 2.0.6以上版本 |
| callback | &lt;metodName&gt;&lt;index&gt;.callback | boolean | 可选 | | 服务治理 | 参数是否为callback接口，如果为callback，服务提供方将生成反向代理，可以从服务提供方反向调用消费方，通常用于事件推送. | 2.0.6以上版本 |

### parameter

选项参数配置。

> 对应的配置类：`java.util.Map`。同时该标签为 `protocol` 或 `service` 或 `provider` 或 `reference` 或 `consumer` 或 `monitor` 或 `registry` 或 `metadata-config` 或 `config-center` 的子标签，用于配置自定义参数，该配置项将作为扩展点设置自定义参数使用。

比如：

```xml
<dubbo:protocol name="napoli">
   <dubbo:parameter key="http://10.20.160.198/wiki/display/dubbo/napoli.queue.name" value="xxx" />
</dubbo:protocol>
```

或：

```xml
<dubbo:protocol name="jms" p:queue="xxx" />
```

| 属性 | 对应URL参数 | 类型 | 是否必填 | 缺省值 | 作用 | 描述 | 兼容性 |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| key | key | string | <b>必填</b> | | 服务治理 | 路由参数键 | 2.0.0以上版本 |
| value | value | string | <b>必填</b> | | 服务治理 | 路由参数值 | 2.0.0以上版本 |


