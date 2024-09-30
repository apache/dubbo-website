aliases:
- /en/docs3-v2/java-sdk/reference-manual/config/properties/
- /en/docs3-v2/java-sdk/reference-manual/config/properties/
- /en/overview/mannual/java-sdk/advanced-features-and-usage/performance/dump/
- /en/overview/mannual/java-sdk/advanced-features-and-usage/performance/lazy-connect/
- /en/overview/mannual/java-sdk/advanced-features-and-usage/performance/simplify-registry-data/
- /en/overview/mannual/java-sdk/advanced-features-and-usage/performance/stickiness/
- /en/overview/mannual/java-sdk/advanced-features-and-usage/service/delay-publish/
- /en/overview/mannual/java-sdk/advanced-features-and-usage/service/preflight-check/
- /en/overview/mannual/java-sdk/advanced-features-and-usage/service/registry-only/
- /en/overview/mannual/java-sdk/advanced-features-and-usage/service/service-downgrade/
- /en/overview/mannual/java-sdk/advanced-features-and-usage/service/subscribe-only/
description: Contains all configuration components supported by Dubbo and all configuration items supported by each configuration component.
linkTitle: Configuration Manual
title: Configuration Reference Manual
type: docs
weight: 6
---

## JVM (-D) Parameters

| JVM Parameter | Example Value | Description |
| --- | --- | --- |
| dubbo.{config-name}.{property} | -Ddubbo.application.name="dubbo-demo"<br/><br/>-Ddubbo.registry.address="nacos://host:port"<br/><br/>-Ddubbo.protocol.port="20880"<br/><br/>...... | Dubbo supports specifying [all configuration items](aaa) in the JVM parameter format. Here, `config` refers to items such as application, registry, protocol, and `property` refers to specific properties within each configuration item. |
| dubbo.resolve.file | -Ddubbo.resolve.file=/home/ken/.../dubbo-resolve.properties | Specifies the direct connection URL for each interface in the file, e.g., org.apache.dubbo.demo.DemoService=tri://127.0.0.1:50051/org.apache.dubbo.demo.DemoService?xxx=xxx |
| org.graalvm.nativeimage.imagecode | | [https://github.com/oracle/graal/blob/master/sdk/src/org.graalvm.nativeimage/src/org/graalvm/nativeimage/ImageInfo.java](https://github.com/oracle/graal/blob/master/sdk/src/org.graalvm.nativeimage/src/org/graalvm/nativeimage/ImageInfo.java) |
| dubbo.properties.file | -Ddubbo.properties.file=foo.properties | Specifies the properties configuration file path, which can be an absolute path or a classpath-relative path. Default value is `dubbo.properties`. |
| dubbo.jstack-dump.max-line | -Ddubbo.jstack-dump.max-line=20 | Dubbo supports automatic printing of the call stack. This parameter controls the number of stack lines, e.g., only the first 20 lines will be printed. |
| dubbo.json-framework.prefer | -Ddubbo.json-framework.prefer=gson | Sets the specific implementation of JSON serialization in the framework. Currently available implementations are `fastjson2`, `fastjson`, `gson`, `jackson`. The framework automatically finds the available implementation in decreasing order of preference. |
| dubbo.network.interface.ignored | -Ddubbo.network.interface.ignored=eth1,eth2 | In multi-network card environments, used when you need to manually control the network card address registered with the registry. It is used to exclude certain network cards. |
| dubbo.network.interface.preferred | -Ddubbo.network.interface.ignored=eth0 | In multi-network card environments, used to specify a particular network card for registration with the registry. |
| sun.rmi.transport.tcp.responseTimeout | -Dsun.rmi.transport.tcp.responseTimeout=5000 | Sets the timeout for RMI protocol, in milliseconds. |
| env |  | Specific parameter for Apollo configuration center. |
| app.id |  | Specific parameter for Apollo configuration center. |
| apollo.cluster |  | Specific parameter for Apollo configuration center. |
| apollo.meta |  | Specific parameter for Apollo configuration center. |
| dubbo.mapping.cache.filePath | -Ddubbo.mapping.cache.filePath=~/.dubbo/mapping/ | Sets the cache file for `interface-application` mapping, usually for service discovery. The file's absolute path address. |
| dubbo.mapping.cache.fileName | -Ddubbo.mapping.cache.fileName=dubbo-mapping | Sets the cache file for `interface-application` mapping, usually for service discovery. The file name; the final file will be stored as `dubbo-mapping.dubbo.cache`. |
| dubbo.mapping.cache.entrySize | -Ddubbo.mapping.cache.maxFileSize=300 | Sets the maximum number of entries in the `interface-application` mapping cache file, usually for service discovery. |
| dubbo.mapping.cache.maxFileSize | -Ddubbo.mapping.cache.maxFileSize=104857600 | Sets the maximum space for the `interface-application` mapping cache file, usually for service discovery, in bytes. |
| dubbo.meta.cache.filePath | -Ddubbo.meta.cache.filePath=~/.dubbo/meta/ | Sets the cache file for `metadata` cache, usually for service discovery. The file's absolute path address. |
| dubbo.meta.cache.fileName | -Ddubbo.meta.cache.fileName=dubbo-meta | Sets the cache file for `metadata` cache, usually for service discovery. The file name; the final file will be stored as `dubbo-meta.dubbo.cache`. |
| dubbo.meta.cache.entrySize | -Ddubbo.meta.cache.maxFileSize=300 | Sets the maximum number of entries in the `metadata` cache file, usually for service discovery. |
| dubbo.meta.cache.maxFileSize | -Ddubbo.meta.cache.maxFileSize=104857600 | Sets the maximum space for the `metadata` cache file, usually for service discovery, in bytes. |
| dubbo.application.use-secure-random-request-id | -Ddubbo.application.use-secure-random-request-id=true | Sets the rule for generating the request ID for each RPC call. If not set, an incremental value will be used. |
| dubbo.protocol.default-close-timeout | -Ddubbo.protocol.default-close-timeout=10000 | Sets the TCP server shutdown wait time, in milliseconds. |
| dubbo.protocol.default-heartbeat | -Ddubbo.protocol.default-heartbeat=10000 | Sets the interval for initiating heartbeat, in milliseconds. |
| dubbo.hessian.allowNonSerializable |  | Allows serialization of classes that do not implement the `Serializable` interface, effective for Hessian serialization. |
| dubbo.application.hessian2.whitelist | -Ddubbo.application.hessian2.whitelist=true | Enables a whitelist mechanism for Hessian serialization. If set to true, it will continue to configure the following allow rules; otherwise, it will configure the deny rules. |
| dubbo.application.hessian2.allow | -Ddubbo.application.hessian2.allow=org.apache.dubbo.*;com.company.* | If true, configures allow rules (refer to the documentation for more details). |
| dubbo.application.hessian2.deny | -Ddubbo.application.hessian2.deny=org.apache.dubbo.*;io.commons.* | If false, configures deny rules (refer to the documentation for more details). |
| dubbo.application.manual-register | -Ddubbo.application.manual-register=true | When set, all services will not be automatically registered to the registry until the user calls `online` or other commands to manually complete registration. |
| dubbo.compact.enable |  |  |
| dubbo.migration-file.enable | -Ddubbo.migration-file.enable=true | Whether to enable rule file reading during migration to application-level address discovery. |
| dubbo.migration.file | -Ddubbo.migration.file=dubbo-migration.yaml | Specifies the path to the rule file for migrating to application-level address discovery, which can be an absolute or classpath-relative path. Default value is `dubbo-migration.yaml`. |
| dubbo.application.logger | -Ddubbo.application.logger=slf4j | Sets the logging component used by the Dubbo framework. After setting, Dubbo's own logs will be printed here (does not affect application logs). Currently supported components are `slf4j`, `log4j`, `log4j2`, etc. Ensure that the corresponding component dependency is added to the application. |
| dubbo.properties.file | -Ddubbo.properties.file=foo.properties | Specifies the properties configuration file path, which can be an absolute or classpath-relative path. Default value is `dubbo.properties`. |

## Environment Variables

| Environment Variable | Example Value | Description |
| --- | --- | --- |
| DUBBO_{CONFIG-NAME}.{PROPERTY} | DUBBO_APPLICATION_NAME="dubbo-demo"<br/><br/>DUBBO_REGISTRY_ADDRESS="nacos://host:port"<br/><br/>DUBBO_PROTOCOL_PORT="20880"<br/><br/>...... | Dubbo supports specifying [all configuration items](aaa) as environment variables. `CONFIG-NAME` refers to items such as application, registry, protocol, and `PROPERTY` refers to specific properties within each item. |
| DUBBO_DEFAULT_SERIALIZATION | DUBBO_DEFAULT_SERIALIZATION="hessian2" | Sets the default serialization method for the framework, e.g., `hessian2`, `fastjson2`, `msgpack`. |
| DUBBO2_COMPACT_ENABLE | DUBBO2_COMPAT_ENABLE="true" |  |
| DUBBO_ENV_KEYS | DUBBO_LABELS="tag1=value1; tag2=value2" | `tag1=value1` will be reported as an additional parameter to the URL, serving as a system environment variable for instance tagging, etc. |
| DUBBO_LABELS | DUBBO_ENV_KEYS="DUBBO_TAG1, DUBBO_TAG2" | Dubbo will read `DUBBO_TAG1`, `DUBBO_TAG2` environment variables, and report values such as `DUBBO_TAG1=value` as additional parameters to the URL. |
| POD_NAMESPACE |  | Specifies the namespace for Kubernetes Service scenarios. |
| CLUSTER_DOMAIN |  | Specifies the cluster name for Kubernetes Service scenarios, default is `default`. |
| DUBBO_IP_TO_REGISTRY | DUBBO_IP_TO_REGISTRY=30.123.45.187 | Specifies the IP address to register in the registry URL. |
| DUBBO_PORT_TO_REGISTRY | DUBBO_PORT_TO_REGISTRY=20880 | Specifies the port number to register in the registry URL. |
| DUBBO_{PROTOCOL}_PORT_TO_REGISTRY | DUBBO_DUBBO_IP_TO_REGISTRY=30.123.45.187<br/><br/>DUBBO_TRI_IP_TO_REGISTRY=30.123.45.187 | Specifies the IP address to register in the registry URL, and can specify different IPs for different protocols. |
| DUBBO_{PROTOCOL}_PORT_TO_REGISTRY | DUBBO_DUBBO_PORT_TO_REGISTRY=20880<br/><br/>DUBBO_TRI_PORT_TO_REGISTRY=50051 | Specifies the port number to register in the registry URL, and can specify different ports for different protocols. |
| DUBBO_IP_TO_BIND | DUBBO_IP_TO_BIND=30.123.45.187 | Specifies the IP address for TCP binding. |
| DUBBO_PORT_TO_BIND | DUBBO_PORT_TO_BIND=20880 | Specifies the port for TCP binding. |
| DUBBO_{PROTOCOL}_IP_TO_BIND | DUBBO_DUBBO_IP_TO_BIND=30.123.45.187<br/><br/>DUBBO_TRI_IP_TO_BIND=30.123.45.187 | Specifies the IP address for TCP binding, and can specify different IPs for different protocols. |
| DUBBO_{PROTOCOL}_PORT_TO_BIND | DUBBO_DUBBO_PORT_TO_BIND=20880<br/><br/>DUBBO_TRI_PORT_TO_BIND=50051 | Specifies the port for TCP binding, and can specify different ports for different protocols. |
| dubbo.properties.file | dubbo.properties.file=foo.properties | Specifies the properties configuration file path, which can be an absolute or classpath-relative path. Default value is `dubbo.properties`. |
| dubbo.migration.file | dubbo.migration.file=dubbo-migration.yaml | Specifies the migration rule file path for application-level address discovery, which can be an absolute or classpath-relative path. Default value is `dubbo-migration.yaml`. |

## Configuration Manual

Regardless of whether you are using Spring Boot, XML, annotations, or APIs to write Dubbo applications, you can refer to the table below to understand the specific meaning of each configuration item.

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

Method-level configuration.

> Corresponding configuration class: `org.apache.dubbo.config.MethodConfig`. This tag is a child tag of `service` or `reference`, used to control at the method level.

For example:

```xml
<dubbo:reference interface="com.xxx.XxxService">
   <dubbo:method name="findXxx" timeout="3000" retries="2" />
</dubbo:reference>
```

| Property | Corresponding URL parameter | Type | Required | Default value | Effect | Description | Compatibility |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| name | | string | <b>Required</b> | | Identifier | Method name | Version 1.0.8 and above |
| timeout | &lt;methodName&gt;.timeout | int | Optional | Default timeout | Performance tuning | Timeout for method call (milliseconds) | Version 1.0.8 and above |
| retries | &lt;methodName&gt;.retries | int | Optional | Default retries of &lt;dubbo:reference&gt; | Performance tuning | Number of retries for remote service calls, excluding the first call; set to 0 if no retries are needed | Version 2.0.0 and above |
| loadbalance | &lt;methodName&gt;.loadbalance | string | Optional | Default loadbalance | Performance tuning | Load balancing strategy, optional values:<br/><br/>* random - Random; <br/><br/>* roundrobin - Round Robin; <br/><br/>* leastactive - Least Active Calls; <br/><br/>* consistenthash - Consistent Hashing (Version 2.1.0 and above); <br/><br/>* shortestresponse - Shortest Response (Version 2.7.7 and above); | Version 2.0.0 and above |
| async | &lt;methodName&gt;.async | boolean | Optional | Default async of &lt;dubbo:reference&gt; | Performance tuning | Whether to execute asynchronously, unreliable asynchronous, just ignore the return value, does not block the execution thread | Version 1.0.9 and above |
| sent | &lt;methodName&gt;.sent | boolean | Optional | true | Performance tuning | During asynchronous calls, if sent=true, indicates that the data has been sent over the network | Version 2.0.6 and above |
| actives | &lt;methodName&gt;.actives | int | Optional | 0 | Performance tuning | Maximum concurrent call limit per service consumer | Version 2.0.5 and above |
| executes | &lt;methodName&gt;.executes | int | Optional | 0 | Performance tuning | Maximum number of threads used per service and method limit; this property is only effective when &lt;dubbo:method&gt; is a child tag of &lt;dubbo:service&gt; | Version 2.0.5 and above |
| deprecated | &lt;methodName&gt;.deprecated | boolean | Optional | false | Service governance | Whether the service method is deprecated; this property is only effective when &lt;dubbo:method&gt; is a child tag of &lt;dubbo:service&gt; | Version 2.0.5 and above |
| sticky | &lt;methodName&gt;.sticky | boolean | Optional | false | Service governance | Set to true for all methods on this interface to use the same provider. For more complex rules, use routing | Version 2.0.6 and above |
| return | &lt;methodName&gt;.return | boolean | Optional | true | Performance tuning | Whether the method call requires a return value; takes effect only when async is set to true. If set to true, returns future or callbacks like onreturn, etc. If set to false, returns null directly after the request is successfully sent | Version 2.0.6 and above |
| oninvoke | attribute, not reflected in URL | String | Optional | | Performance tuning | Intercept before instance execution | Version 2.0.6 and above |
| onreturn | attribute, not reflected in URL | String | Optional | | Performance tuning | Intercept after instance execution returns | Version 2.0.6 and above |
| onthrow | attribute, not reflected in URL | String | Optional | | Performance tuning | Intercept when an exception occurs during instance execution | Version 2.0.6 and above |
| oninvokeMethod | attribute, not reflected in URL | String | Optional | | Performance tuning | Intercept before method execution | Version 2.0.6 and above |
| onreturnMethod | attribute, not reflected in URL | String | Optional | | Performance tuning | Intercept after method execution returns | Version 2.0.6 and above |
| onthrowMethod | attribute, not reflected in URL | String | Optional | | Performance tuning | Intercept when an exception occurs during method execution | Version 2.0.6 and above |
| cache | &lt;methodName&gt;.cache | string/boolean | Optional | | Service governance | Cache return results using call parameters as keys, optional values: lru, threadlocal, jcache, etc. | Version 2.1.0 and above |
| validation | &lt;methodName&gt;.validation | boolean | Optional | | Service governance | Whether to enable JSR303 standard annotation validation; if enabled, the annotations on the method parameters will be validated | Version 2.1.0 and above |

### argument

Method parameter configuration.

> Corresponding configuration class: `org.apache.dubbo.config.ArgumentConfig`. This tag is a child tag of `method`, used for feature description of method parameters, for example in XML format:

```xml
<dubbo:method name="findXxx" timeout="3000" retries="2">
   <dubbo:argument index="0" callback="true" />
</dubbo:method>
```

| Property | Corresponding URL parameter | Type | Required | Default value | Effect | Description | Compatibility |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| index | | int | <b>Required</b> | | Identifier | Parameter index | Version 2.0.6 and above |
| type | | String | Either index or type | | Identifier | Lookup parameter's index by type | Version 2.0.6 and above |
| callback | &lt;metodName&gt;&lt;index&gt;.callback | boolean | Optional | | Service governance | Whether the parameter is a callback interface; if it is a callback, the service provider will generate a reverse proxy that can call back to the consumer from the provider, usually used for event pushing. | Version 2.0.6 and above |

### parameter

Custom parameter configuration.

> Corresponding configuration class: `java.util.Map`. This tag is a child of `protocol`, `service`, `provider`, `reference`, `consumer`, `monitor`, `registry`, `metadata-config`, or `config-center`, used to set custom parameters that will be used as extension points.

For example:

```xml
<dubbo:protocol name="napoli">
   <dubbo:parameter key="http://10.20.160.198/wiki/display/dubbo/napoli.queue.name" value="xxx" />
</dubbo:protocol>
```

or:

```xml
<dubbo:protocol name="jms" p:queue="xxx" />
```

| Property | Corresponding URL parameter | Type | Required | Default value | Effect | Description | Compatibility |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| key | key | string | <b>Required</b> | | Service governance | Routing parameter key | Version 2.0.0 and above |
| value | value | string | <b>Required</b> | | Service governance | Routing parameter value | Version 2.0.0 and above |

