---
type: docs
title: "Configuration Item Reference Manual"
linkTitle: "Configuration Item Manual"
weight: 6
description: "Contains all configuration components supported by Dubbo and all configuration items supported by each configuration component"
---

## Configuration Details

### application

Each application must have one and only one application configuration, corresponding configuration class: `org.apache.dubbo.config.ApplicationConfig`

| Attribute | Corresponding URL parameter | Type | Required | Default | Function | Description | Compatibility |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| name | application | string | <b>Required</b> | | Service Governance| The name of the current application, which is used by the registry to calculate dependencies between applications. Note: the consumer and provider application names should not be the same, this parameter is not Matching conditions, you can fill in the name of your current project, which has nothing to do with the role of the provider and consumer. For example, if the kylin application calls the service of the morgan application, the kylin project will be kylin, and the morgan project will be morgan. Maybe kylin also provides other The service is used by others, but the kylin project will always be dubbed kylin, so the registry will show that kylin depends on morgan | version 2.7.0 or later |
| compiler | compiler | string | optional | javassist | performance optimization | Java bytecode compiler, used to generate dynamic classes, optional: jdk or javassist | version 2.7.0 or later |
| logger | logger | string | optional | slf4j | performance optimization | log output method, optional: slf4j, jcl, log4j, log4j2, jdk | version 2.7.0 or later |
| owner | owner | string | Optional | | Service Governance | The person in charge of the application, used for service governance, please fill in the email prefix of the person in charge | Version above 2.0.5 |
| organization | organization | string | Optional | | Service Governance | Organization name (BU or department), which is used by the registration center to distinguish service sources. It is recommended not to use autoconfig for this configuration item, and write it directly in the configuration, such as china, intl, itu, crm, asc, dw, aliexpress, etc. | Version 2.0.0 and above |
| architecture <br class="atl-forced-newline" /> | architecture <br class="atl-forced-newline" /> | string | optional | | Service Governance | Architecture for service layering. Such as, intl, china. Different architectures use different layers. | Version 2.0.7 and above |
| environment | environment | string | Optional | | Service Governance | Application environment, such as: develop/test/product, different environments use different default values, and it is only used as a restriction for developing and testing functions | 2.0.0 and above version |
| version | application.version | string | optional | | service governance | current application version | version 2.7.0 or later |
| dumpDirectory | dump.directory | string | Optional | | Service Governance | When the process has a problem such as the thread pool is full, the storage path of the framework's automatic dump file | Version 2.7.0 or later |
| qosEnable | qos.enable | boolean | Optional | | Service governance | Whether to enable the qos operation and maintenance port | Version 2.7.0 or later |
| qosHost | qos.host | string | Optional | | Service Governance | Network interface address to monitor, default 0.0.0.0 | Version 2.7.3 or later |
| qosPort | qos.port | int | optional | | service governance | network port to monitor | version 2.7.0 or later |
| qosAcceptForeignIp | qos.accept.foreign.ip | boolean | Optional | | Service Governance | Security configuration, whether to accept external requests except localhost local access | Version 2.7.0 or later |
| shutwait | dubbo.service.shutdown.wait | string | optional | | service governance | shutdown waiting time (ms) during graceful shutdown | version 2.7.0 or later |
| hostname | | string | optional | local hostname | service governance | hostname | version 2.7.5 or later |
| registerConsumer | registerConsumer | boolean | optional | true | service governance | whether to register the instance to the registry. Only set to `false` when the instance is a pure consumer | Version 2.7.5 and above |
| repository | application.version | string | optional | | service governance | current application version | version 2.7.6 or later |
| enableFileCache | file.cache | boolean | optional | true | service governance | whether to enable local cache | version 3.0.0 or later |
| protocol | | string | optional | dubbo | service governance | preferred protocol, applicable when the preferred protocol cannot be determined | version 3.0.0 or later |
| metadataType | metadata-type |String| Optional | local | Service Governance | Application-level service discovery The metadata delivery method is from the perspective of Provider, and the configuration on the Consumer side is invalid. The optional values are:<br>* remote - Provider Put the metadata in the remote registry, and the Consumer gets it from the registry;<br/>* local - Provider puts the metadata locally, and the Consumer gets it directly from the Provider; | Version 2.7.5 and above |
|
| metadataServicePort | metadata-service-port | int | Optional | | Service Governance | If metadataType is configured as local, this property sets the port number used by the MetadataService service | Version 2.7.9 or later |
| livenessProbe | liveness-probe | string | optional | | service governance | concept and format corresponding to k8s system liveness probe | version 3.0.0 or later |
| readinessProbe | readiness-probe | string | optional | | service governance | concept and format corresponding to k8s system readiness probe | version 3.0.0 or later |
| startupProbe | startup-probe | string | Optional | | Service Governance | The concept and format correspond to the k8s system startup probe | Version 3.0.0 or later |
| registerMode | register-mode | string | Optional | all | Service Governance | Control address registration behavior, used for application-level service discovery and migration. <br/>* instance only registers application-level addresses;<br/>* interface only registers interface-level addresses;<br/>* all (default) registers both application-level and interface-level addresses; | Version 3.0.0 and above |
| enableEmptyProtection | enable-empty-protection | boolean | Optional | true | Service Governance | Whether to enable the protection of the empty address list on the consumer side globally. After enabling it, the empty address push from the registration center will be ignored. The default is true | Version 3.0.0 or later |
| parameters | None | Map<string, string> | Optional | | Service Governance | Reserved for extensions, any parameters can be extended and defined, and all extended parameters will be reflected in the URL configuration as they are | Version 2.7.0 and above |


### service

A service provider exposes service configuration. Corresponding configuration class: `org.apache.dubbo.config.ServiceConfig`

| Attribute | Corresponding URL parameter | Type | Required | Default | Function | Description | Compatibility |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| interface | | class | <b>required</b> | | service discovery | service interface name | version 1.0.0 or later |
| ref | | object | <b>required</b> | | service discovery | service object implementation reference | version 1.0.0 or later |
| version | version | string | optional | 0.0.0 | service discovery | service version, it is recommended to use a two-digit version, such as: 1.0, usually the version number needs to be upgraded when the interface is not compatible | version 1.0.0 or later |
| group | group | string | optional | | service discovery | service grouping, when an interface has multiple implementations, they can be distinguished by grouping | version 1.0.7 or later |
| path | <path> | string | optional | default interface name | service discovery | service path (note: 1.0 does not support custom path, always use the interface name, if there is 1.0 to 2.0, the configuration service path may not be Compatible) | Version 1.0.12+ |
| delay | delay | int | Optional | 0 | Performance tuning | Delayed registration service time (milliseconds), when set to -1, it means that the service is delayed until the initialization of the Spring container is completed | Version 1.0.14 and above |
| timeout | timeout | int | optional | 1000 | performance tuning | remote service call timeout (milliseconds) | version 2.0.0 or later |
| retries | retries | int | Optional | 2 | Performance tuning | The number of remote service call retries, excluding the first call, please set it to 0 if you don't need to retry | Version 2.0.0 or later |
| connections | connections | int | optional | 100 | performance tuning | the maximum number of connections for each provider, short connection protocols such as rmi, http, and hessian indicate the limit on the number of connections, and long connection agreements such as dubbo indicate the established long connections Number | Version 2.0.0 or above |
| loadbalance | loadbalance | string | optional | random | performance tuning | load balancing strategy, optional values: <br/>* random - random; <br/>* roundrobin - polling; <br/>* leastactive - Least active calls; <br/>* consistenthash - consistent hash (2.1.0+); <br/>* shortestresponse - shortest response (2.7.7+);| 2.0.0+|
| async | async | boolean | Optional | false | Performance tuning | Whether to execute asynchronously by default, unreliable asynchronous, just ignore the return value, do not block the execution thread | Version above 2.0.0 |
| local | local | class/boolean | optional | false | service governance | set to true, means to use the default proxy class name, that is: interface name + Local suffix, obsolete, please use stub| 2.0.0 or above |
| stub | stub | class/boolean | Optional | false | Service Governance | Set to true, which means to use the default proxy class name, that is: interface name + Stub suffix, the local proxy class name of the service interface client, used in the client The client executes local logic, such as local cache, etc. The constructor of the local proxy class must allow remote proxy objects to be passed in, such as: public XxxServiceStub(XxxService xxxService) | Version 2.0.0 or later |
| mock | mock | class/boolean | Optional | false | Service Governance | Set to true, which means to use the default Mock class name, that is: interface name + Mock suffix, if the service interface fails to call the Mock implementation class, the Mock class must have A no-argument constructor, the difference from Local is that Local is always executed, while Mock is only executed when non-business exceptions (such as timeouts, network exceptions, etc.) occur, Local is executed before remote calls, and Mock is executed after remote calls . | Version 2.0.0 and above |
| token | token | string/boolean | Optional | false | service governance | Consumers bypass the registration center for direct access to ensure that the authorization function of the registration center is valid. If point-to-point calls are used, the token function must be turned off | version 2.0.0 or later |
| registry | | string | optional | default registration to all registries | configuration association | registration to the specified registry, used in multiple registries, the value is the id attribute of <dubbo:registry>, used for multiple registries IDs Separated by commas, if you don't want to register the service to any registry, you can set the value to N/A | Version 2.0.0 or later |
| provider | | string | optional | the first provider configuration is used by default | configuration association | specify the provider, the value is the id attribute of <dubbo:provider> | version above 2.0.0 |
| deprecated | deprecated | boolean | Optional | false | Service Governance | Whether the service is deprecated, if set to true, the consumer will print the service deprecated warning error log | 2.0.5 or later |
| dynamic | dynamic | boolean | Optional | true | Service Governance | Whether the service is dynamically registered, if it is set to false, the disabled status will be displayed after registration, and it needs to be manually enabled, and the registration will not be canceled automatically when the service provider stops , need to be disabled manually. | Version 2.0.5 and above |
| accesslog | accesslog | string/boolean | optional | false | service management | set to true, the access log will be output to the logger, and the access log file path can also be filled in to output the access log directly to the specified file | 2.0.5 and above version |
| owner | owner | string | optional | | service governance |
| document | document | string | optional | | service governance | service document URL | version 2.0.5 or later |
| weight | weight | int | optional | | performance tuning | service weight | version 2.0.5 or later |
| executes | executes | int | optional | 0 | performance tuning | the maximum number of parallel execution requests per service and method of a service provider | version 2.0.5 or later |
| actives | actives | int | optional | 0 | performance tuning | maximum number of concurrent calls per service consumer per service per method | version 2.0.5 or later |
| proxy | proxy | string | optional | javassist | performance tuning | generate dynamic proxy, optional: jdk/javassist | version 2.0.5 or later |
| cluster | cluster | string | optional | failover | performance tuning | cluster mode, optional: failover/failfast/failsafe/failback/forking/available/mergeable (2.1. )/zone-aware (version 2.7.5 or later) | version 2.0.5 or later |
| filter | service.filter | string | optional | default | performance tuning | service provider remote call process interceptor name, multiple names separated by commas | version 2.0.5 or later |
| listener | exporter.listener | string | optional | default | performance tuning | service provider export service listener name, multiple names separated by commas | |
| protocol | | string | optional | | configuration association | use the specified protocol to expose the service, used in multi-protocol, the value is the id attribute of <dubbo:protocol>, multiple protocol IDs are separated by commas | version 2.0.5 or later |
| layer | layer | string | optional | | service governance | the layer where the service provider resides. Such as: biz, dao, intl:web, china:acton. | Version 2.0.7 and above |
| register | register | boolean | optional | true | service governance | whether the service of this protocol is registered to the registry | version 2.0.8 or later |
| validation | validation | string | optional | | service governance | whether to enable JSR303 standard annotation validation, if enabled, the annotations on the method parameters will be validated | version 2.7.0 or later |
| parameters | None | Map<string, string> | Optional | | Service Governance | Reserved for extensions, any parameters can be extended and defined, and all extended parameters will be reflected in the URL configuration as they are | Version 2.0.0 and above |

### reference


A service consumer references a service configuration. Corresponding configuration class: `org.apache.dubbo.config.ReferenceConfig`

| Attribute | Corresponding URL parameter | Type | Required | Default | Function | Description | Compatibility |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| id | | string | <b>required</b> | | configuration association | service reference BeanId | version 1.0.0 or later |
| interface | | class | <b>required</b> | | service discovery | service interface name | version 1.0.0 or later |
| version | version | string | optional | | service discovery | service version, consistent with the version of the service provider | version above 1.0.0 |
| group | group | string | optional | | service discovery | service grouping, when an interface has multiple implementations, they can be distinguished by grouping, must be consistent with the service provider | version 1.0.7 or later |
| timeout | timeout | long | optional | timeout of <dubbo:consumer> is used by default | performance tuning | service method call timeout (milliseconds) | version 1.0.5 or later |
| retries | retries | int | optional | retries of <dubbo:consumer> are used by default | performance tuning | retries of remote service calls, excluding the first call, please set to 0 | 2.0. Version 0 and above |
| connections | connections | int | optional | default connections of <dubbo:consumer> | performance tuning | the maximum number of connections for each provider, rmi, http, hessian and other short connection protocols indicate the limit of the number of connections, dubbo The equal-length connection association indicates the number of established long connections | Version 2.0.0 or later |
| loadbalance | loadbalance | string | optional | default loadbalance of <dubbo:consumer> | performance tuning | load balancing strategy, optional values: <br/>* random - random; <br/>* roundrobin - round <br/>* leastactive - least active call; <br/>* consistenthash - consistent hash (version 2.1.0 and above); <br/>* shortestresponse - shortest response (version 2.7.7 and above); | 2.0 .0+ version |
| async | async | boolean | optional | async of <dubbo:consumer> is used by default | performance tuning | whether to execute asynchronously, unreliable and asynchronous, just ignore the return value and not block the execution thread | version 2.0.0 or later |
| generic | generic | boolean | optional | default <dubbo:consumer> generic | service governance | whether to default the generic interface, if it is a generic interface, it will return GenericService | version 2.0.0 or later |
| check | check | boolean | optional | default check of <dubbo:consumer> | service governance | check whether the provider exists at startup, true will report an error, false will ignore | version 2.0.0 or later |
| url | url | string | optional | | service governance | point-to-point direct connection service provider address, will bypass the registration center | version 1.0.6 or later |
| stub | stub | class/boolean | Optional | | Service Governance | The name of the service interface client's local proxy class, which is used to execute local logic on the client, such as local cache, etc. The constructor of the local proxy class must allow input Remote proxy object, constructor such as: public XxxServiceLocal(XxxService xxxService) | version 2.0.0 or later |
| mock | mock | class/boolean | Optional | | Service Governance | Service interface call failure Mock implementation class name, the Mock class must have a no-argument constructor, the difference from Local is that Local is always executed, while Mock Execute only when a non-business exception occurs (such as timeout, network exception, etc.), Local is executed before the remote call, and Mock is executed after the remote call. | Supported by Dubbo1.0.13 and above |
| cache | cache | string/boolean | Optional | | Service Governance | The call parameter is used as the key to cache the returned result, optional: lru, threadlocal, jcache, etc. | Supported by Dubbo2.1.0 and above |
| validation | validation | boolean | optional | | service governance | whether to enable JSR303 standard annotation validation, if enabled, the annotations on the method parameters will be validated | Dubbo2.1.0 and above versions support |
| proxy | proxy | boolean | optional | javassist | performance tuning | choose dynamic proxy implementation strategy, optional: javassist, jdk | version above 2.0.2 |
| client | client | string | optional | | performance tuning | client transport type setting, such as netty or mina of Dubbo protocol. | Supported by Dubbo2.0.0 and above |
| registry | | string | optional | By default, the service list will be obtained from all registries and the results will be merged | Configuration Association | Register to obtain the service list from the specified registry, used when there are multiple registries, the value is <dubbo:registry> The id attribute, multiple registration center IDs are separated by commas | Version 2.0.0 or later |
| owner | owner | string | Optional | | Service Governance | To call the person in charge of the service for service governance, please fill in the email prefix of the person in charge | Version above 2.0.5 |
| actives | actives | int | optional | 0 | performance tuning | maximum number of concurrent calls per service consumer per service per method | version 2.0.5 or later |
| cluster | cluster | string | optional | failover | performance tuning | cluster mode, optional: failover/failfast/failsafe/failback/forking/available/mergeable (2.1. )/zone-aware (version 2.7.5 or later) | version 2.0.5 or later |
| connections | connections | int | optional | 100 | performance tuning | the maximum number of connections for each provider, short connection protocols such as rmi, http, and hessian indicate the limit on the number of connections, and long connection agreements such as dubbo indicate the established long connections Number | Version 2.0.0 or above |
| filter | reference.filter | string | optional | default | performance tuning | service consumer remote call process interceptor name, multiple names separated by commas | version 2.0.5 or later |
| listener | invoker.listener | string | optional | default | performance tuning | The service consumer quotes the name of the service listener, and multiple names are separated by commas | Version 2.0.5 or later |
| layer | layer | string | optional | | service governance | the layer where the service caller resides. Such as: biz, dao, intl:web, china:acton. | Version 2.0.7 and above |
| init | init | boolean | optional | false | Performance tuning | Whether to starvely initialize the reference when afterPropertiesSet(), otherwise wait until someone injects or references the instance before initializing. | Version 2.0.10 and above |
| protocol | protocol | string | optional | | service governance | only call the service provider of the specified protocol, and ignore other protocols. | Version 2.7.0 and above |
| client | client | string | optional | dubbo protocol defaults to netty | service discovery | protocol client implementation type, such as: dubbo protocol mina, netty, etc. | version 2.7.0 or later |
| providerPort | provider-port | int | Optional | | Service Mesh | When dubbo.consumer.meshEnable=true, Dubbo will convert the request to K8S standard format by default, and combine VirtualService and DestinationRule for traffic management. At this time, the consumer can perceive to provider. If you don't want to use VirtualService and DestinationRule, please set providerPort to make the consumer aware of the service port exposed by the provider | Version 3.1.0 and above |
| unloadClusterRelated | unloadClusterRelated | boolean | Optional | false | Service Mesh | When dubbo.consumer.meshEnable=true, in Service Mesh mode, set it to true to unload the Directory, Router and Load Balance related to the Cluster in the current call , Delegate retry, load balancing, timeout and other traffic management functions to Sidecar, use VirtualService and DestinationRule for traffic management | Version 3.1.0 and above |
| parameters | None | Map<string, string> | Optional | | Service Governance | Reserved for extensions, any parameters can be extended and defined, and all extended parameters will be reflected in the URL configuration as they are | Version 2.0.0 and above |
| providedBy | provided-by | string | Optional | | Service Mesh | When dubbo.consumer.meshEnable=true, Dubbo will convert the request to K8S standard format by default, and combine VirtualService and DestinationRule for traffic management. At this time, the consumer can perceive to provider. The value should be consistent with the declared `k8s service` | Version 3.1.0 or later |
| providerNamespace | provider-namespace | string | Optional | | Service Mesh | When dubbo.consumer.meshEnable=true, Dubbo will convert the request into K8S standard format by default, and combine VirtualService and DestinationRule for traffic management. At this time, the consumer can perceive to provider. Please set the providerNamespace so that the consumer can address the provider dns according to this configuration, the default `default` | version 3.1.2 or later |


###registry

Registry configuration. Corresponding configuration class: `org.apache.dubbo.config.RegistryConfig`. At the same time, if there are multiple different registries, you can declare multiple `<dubbo:registry>` tags, and specify the registry to use in the `registry` attribute of `<dubbo:service>` or `<dubbo:reference>` .

| Attribute | Corresponding URL parameter | Type | Required | Default | Function | Description | Compatibility |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| id | | string | optional | | configuration association | the registration center references the BeanId, which can be referenced in <dubbo:service registry=""> or <dubbo:reference registry=""> | version 1.0.16 or later |
| address | <host:port> | string | <b>Required</b> | | Service discovery| The address of the registration center server. If the address has no port, the default is 9090. Multiple addresses in the same cluster are separated by commas. Such as: ip:port, ip:port, registry centers of different clusters, please configure multiple <dubbo:registry> tags | Version 1.0.16 or later |
| protocol | <protocol> | string | optional | dubbo | service discovery | registry address protocol, support `dubbo`, `multicast`, `zookeeper`, `redis`, `consul(2.7.1)`, `sofa (2.7.2)`, `etcd(2.7.2)`, `nacos(2.7.2)` and other protocols | Version 2.0.0 and above |
| port | <port> | int | optional | 9090 | service discovery | the default port of the registry, when the address does not have a port, use this port as the default value | version 2.0.0 or later |
| username | <username> | string | Optional | | Service Governance | Username for logging in to the registration center, if the registration center does not require verification, it can be left blank | Version 2.0.0 or later |
| password | <password> | string | Optional | | Service Governance | Password for logging in to the registration center, if the registration center does not require verification, you can leave it blank | Version 2.0.0 or later |
| transport | registry.transporter | string | optional | netty | performance tuning | network transport mode, optional mina, netty | version 2.0.0 or later |
| timeout | registry.timeout | int | optional | 5000 | performance tuning | registry center request timeout (milliseconds) | version 2.0.0 or later |
| session | registry.session | int | optional | 60000 | Performance tuning | Registry session timeout (milliseconds), used to detect dirty data after abnormal disconnection of the provider, such as the implementation of heartbeat detection, this time It is the heartbeat interval, which is different for different registration centers. | Version 2.1.0 and above |
| zone | zone | string | optional | | service governance | the region to which the registry belongs, usually used for traffic isolation | version 2.7.5 or later
| file | registry.file | string | Optional | | Service Governance | Use a file to cache the registry address list and service provider list. When the application is restarted, it will be restored based on this file. Note: two registries cannot use the same file storage| Version 2.0.0 or later |
| wait | registry.wait | int | optional | 0 | performance tuning | wait notification completion time (milliseconds) when stopping | version 2.0.0 or later |
| check | check | boolean | optional | true | service governance | whether to report an error when the registration center does not exist | version 2.0.0 or later |
| register | register | boolean | Optional | true | Service Governance | Whether to register the service with this registry, if set to false, it will only subscribe and not register | Version 2.0.5 and above |
| subscribe | subscribe | boolean | optional | true | service governance | whether to subscribe to this registry service, if set to false, it will only register, not subscribe | version 2.0.5 or later |
| dynamic | dynamic | boolean | Optional | true | Service Governance | Whether the service is dynamically registered, if it is set to false, it will be displayed as disabled after registration, it needs to be manually enabled, and when the service provider stops, it will not be automatically unregistered , need to be disabled manually. | Version 2.0.5 and above |
| group | group | string | Optional | dubbo | Service Governance | Service registration grouping, cross-group services will not affect each other, and cannot call each other, suitable for environment isolation. | Version 2.0.5 and above |
| version | version | string | optional | | service discovery | service version | version above 1.0.0 |
| simplified | simplified | boolean | optional | false | service governance | whether the URL registered to the registration center is in simplified mode (compatible with lower versions) | version 2.7.0 or later |
| extra-keys | extraKeys | string | Optional | | Service Governance | When simplified=true, extraKeys allows you to put extra keys in the URL besides the default parameters, in the format: "interface,key1,key2". | Version 2.7.0 and above |
| useAsConfigCenter | | boolean | optional | | service governance | whether the registry is used as a configuration center | version 2.7.5 or later |
| useAsMetadataCenter | | boolean | optional | | service governance | whether the registry is used as a metadata center | version 2.7.5 or later |
| accepts | accepts | string | Optional | | Service Governance | The registry receives a list of rpc protocols, multiple protocols are separated by commas, such as dubbo, rest | version 2.7.5 or later |
| preferred | preferred | boolean | optional | | service governance | whether to be the preferred registry. When subscribing to multiple registries, if set to true, the registries will be preferred | Version 2.7.5 and above |
| weight | weight | int | optional | | performance tuning | registration traffic weight. When using multiple registries, you can use this value to adjust the distribution of registration traffic. This value does not take effect when setting the preferred registry | Version 2.7.5 or later |
| registerMode | register-mode | string | Optional | all | Service Governance | Control address registration behavior, used for application-level service discovery and migration. <br/>* instance only registers application-level addresses;<br/>* interface only registers interface-level addresses;<br/>* all (default) registers both application-level and interface-level addresses; | Version 3.0.0 and above |
| enableEmptyProtection | enable-empty-protection | boolean | Optional | true | Service Governance | Whether to enable the protection of the empty address list on the consumer side globally. After enabling it, the empty address push from the registration center will be ignored. The default is true | Version 3.0.0 or later |
| parameters | None | Map<string, string> | Optional | | Service Governance | Reserved for extensions, any parameters can be extended and defined, and all extended parameters will be reflected in the URL configuration as they are | Version 2.0.0 and above |

###config-center

configuration center. Corresponding configuration class: `org.apache.dubbo.config.ConfigCenterConfig`

| Attribute | Corresponding URL parameter | Type | Required | Default | Description | Compatibility |
| ---------------- | ---------------------- | --------- ---------- | -------- | ---------------- | ------------- -------------------------------------------------- | -- ---- |
| protocol | protocol | string | optional | zookeeper | Which configuration center to use: apollo, zookeeper, nacos, etc. <br />Take zookeeper as an example<br />1. If the protocol is specified, the address can be simplified to `127.0.0.1:2181`;<br />2. If the protocol is not specified, the address value will be `zookeeper:// 127.0.0.1:2181` | Version 2.7.0 or higher |
| address | address | string | Mandatory | | Configuration center address. <br />See the protocol description for the value | Version 2.7.0 and above |
| highestPriority | highest-priority| boolean | optional | true | The configuration item from the configuration center has the highest priority, that is, the local configuration item will be overwritten. | Version 2.7.0 and above |
| namespace | namespace | string | optional | dubbo | Usually used for multi-tenant isolation, the actual meaning depends on the specific configuration center. <br />Such as: <br />zookeeper - environment isolation, the default value is `dubbo`; <br />apollo - distinguishes configuration sets in different domains, using `dubbo` and `application` by default | Version 2.7.0 and above |
| cluster | cluster | string | optional | | The meaning depends on the selected configuration center. <br />It is used to distinguish different configuration clusters in Apollo | Version 2.7.0 and above |
| group | group | string | optional | dubbo | The meaning depends on the selected configuration center. <br />nacos - isolate different configuration sets<br />zookeeper - isolate different configuration sets | Version 2.7.0 and above |
| check | check | boolean | optional | true | Whether to terminate the application startup when the connection to the configuration center fails. | Version 2.7.0 and above |
| configFile | config-file | string | optional | dubbo.properties | the key to which the global configuration file is mapped<br />zookeeper - default path /dubbo/config/dubbo/dubbo.properties<br />apollo - dubbo dubbo.properties key in namespace | Version 2.7.0 or later |
| appConfigFile | app-config-file | string | optional | | "configFile" is shared globally. This item is restricted to properties configured by this application | 2.7.0+ |
| timeout | timeout | int | optional | 3000ms | get the configured timeout | version 2.7.0 or later |
| username | username | string | optional | | If the configuration center needs to be verified, the username<br />Apollo is not enabled yet | Version 2.7.0 or later |
| password | password | string | Optional | | If the configuration center needs to be verified, the password<br />Apollo is not enabled yet | Version 2.7.0 or later |
| parameters | parameters | Map<string, string> | Optional | | Extended parameters, used to support customized configuration parameters of different configuration centers | Version 2.7.0 or later |
| includeSpringEnv |include-spring-env| boolean | Optional | false | Supported when using the Spring framework. When true, the configuration will be automatically read from the Spring Environment. <br />By default, <br />key is dubbo.properties configuration <br />key is Dubbo.properties PropertySource | Version 2.7.0 or above |

### metadata-report-config

metadata center. Corresponding configuration class: `org.apache.dubbo.config.MetadataReportConfig`

| Attribute | Corresponding URL parameter | Type | Required | Default | Description | Compatibility |
| --------------- | --------- | ------ | -------- | ------- -- | ----------------------------------------------- ------------- | ------ |
| address | address | string | required | | metadata center address. | Version 2.7.0 and above |
| protocol | protocol | string | optional | zookeeper | metadata center protocol: zookeeper, nacos, redis, etc. <br />Take zookeeper as an example<br />1. If the protocol is specified, the address can be simplified to `127.0.0.1:2181`;<br />2. If the protocol is not specified, the address value will be `zookeeper:// 127.0.0.1:2181` | Version 2.7.13 and above |
| port | port | int | optional | | metadata center port number. Specify the port, then the address can be simplified, no need to configure the port number | Version 2.7.13 or later |
| username | username | string | optional | | metadata center needs to be verified, username<br />Apollo is not enabled yet | version 2.7.0 or later |
| password        | password  | string | 可选     |           | 元数据中心需要做校验，密码<br />Apollo暂未启用             | 2.7.0以上版本 |
| timeout         | timeout   | int    | 可选     |           | 获取元数据超时时间(ms)                                    | 2.7.0以上版本 |
| group           | group     | string | 可选     | dubbo     | 元数据分组，适用于环境隔离。与注册中心group意义相同         | 2.7.0以上版本 |
| retryTimes      | retry-times| int   | 可选     | 100       | 重试次数                                                 | 2.7.0以上版本 |  
| retryPeriod     | retry-period | int | 可选     | 3000ms    | 重试间隔时间(ms)                                         | 2.7.0以上版本 |
| cycleReport     | cycle-report | boolean| 可选  | true      | 是否每天更新完整元数据                                    | 2.7.0以上版本 |
| syncReport      | sync-report | boolean| 可选  | false      | 是否同步更新元数据，默认为异步                             | 2.7.0以上版本 |
| cluster         | cluster  | string | 可选    |            | 含义视所选定的元数据中心而不同。<br />如Apollo中用来区分不同的配置集群 | 2.7.0以上版本 |
| file            | file      | string | 可选   |            | 使用文件缓存元数据中心列表，应用重启时将基于此文件恢复，注意：两个元数据中心不能使用同一文件存储 | 2.7.0以上版本 |
| check           | check   | boolean | 可选   | true       | 当元数据中心连接失败时，是否终止应用启动。                     | 3.0.0以上版本 |
| reportMetadata  | report-metadata | boolean | 可选 | false | 是否上地址发现中的接口配置报元数据，`dubbo.application.metadata-type=remote` 该配置不起作用即一定会上报，`dubbo.application.metadata-type=local` 时是否上报由该配置值决定 | 3.0.0以上版本 |
| reportDefinition | report-definition | boolean | 可选 | true | 是否上报服务运维用元数据                                   | 3.0.0以上版本 |
| reportConsumerDefinition | report-consumer-definition | boolean | 可选 | true | 是否在消费端上报服务运维用元数据                                    | 3.0.0以上版本 |
| parameters      | parameters | Map<string, string> | 可选     |  | 扩展参数，用来支持不同元数据中心的定制化配置参数         | 2.7.0以上版本 |

### protocol

服务提供者协议配置。对应的配置类： `org.apache.dubbo.config.ProtocolConfig`。同时，如果需要支持多协议，可以声明多个 `<dubbo:protocol>` 标签，并在 `<dubbo:service>` 中通过 `protocol` 属性指定使用的协议。

| 属性 | 对应URL参数 | 类型 | 是否必填 | 缺省值 | 作用 | 描述 | 兼容性 |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| id | | string | 可选 | dubbo | 配置关联 | 协议BeanId，可以在<dubbo:service protocol="">中引用此ID，如果ID不填，缺省和name属性值一样，重复则在name后加序号。 | 2.0.5以上版本 |
| name | <protocol> | string | <b>必填</b> | dubbo | 性能调优 | 协议名称 | 2.0.5以上版本 |
| port | <port> | int | 可选 | dubbo协议缺省端口为20880，rmi协议缺省端口为1099，http和hessian协议缺省端口为80；如果<b>没有</b>配置port，则自动采用默认端口，如果配置为<b>-1</b>，则会分配一个没有被占用的端口。Dubbo 2.4.0+，分配的端口在协议缺省端口的基础上增长，确保端口段可控。 | 服务发现 | 服务端口 | 2.0.5以上版本 |
| host | <host> | string | 可选 | 自动查找本机IP | 服务发现 | -服务主机名，多网卡选择或指定VIP及域名时使用，为空则自动查找本机IP，-建议不要配置，让Dubbo自动获取本机IP | 2.0.5以上版本 |
| threadpool | threadpool | string | 可选 | fixed | 性能调优 | 线程池类型，可选：fixed/cached/limit(2.5.3以上)/eager(2.6.x以上) | 2.0.5以上版本 |
| threadname | threadname | string | 可选 |       | 性能调优 | 线程池名称 | 2.7.6以上版本 |
| threads | threads | int | 可选 | 200 | 性能调优 | 服务线程池大小(固定大小) | 2.0.5以上版本 |
| corethreads | corethreads | int | 可选 | 200 | 性能调优 | 线程池核心线程大小 | 2.0.5以上版本 |
| iothreads | threads | int | 可选 | cpu个数+1 | 性能调优 | io线程池大小(固定大小) | 2.0.5以上版本 |
| accepts | accepts | int | 可选 | 0 | 性能调优 | 服务提供方最大可接受连接数 | 2.0.5以上版本 |
| payload | payload | int | 可选 | 8388608(=8M) | 性能调优 | 请求及响应数据包大小限制，单位：字节 | 2.0.5以上版本 |
| codec | codec | string | 可选 | dubbo | 性能调优 | 协议编码方式 | 2.0.5以上版本 |
| serialization | serialization | string | 可选 | dubbo协议缺省为hessian2，rmi协议缺省为java，http协议缺省为json | 性能调优 | 协议序列化方式，当协议支持多种序列化方式时使用，比如：dubbo协议的dubbo,hessian2,java,compactedjava，以及http协议的json等 | 2.0.5以上版本 |
| accesslog | accesslog | string/boolean | 可选 | | 服务治理 | 设为true，将向logger中输出访问日志，也可填写访问日志文件路径，直接把访问日志输出到指定文件 | 2.0.5以上版本 |
| path | <path> | string | 可选 | | 服务发现 | 提供者上下文路径，为服务path的前缀 | 2.0.5以上版本 |
| transporter | transporter | string | 可选 | dubbo协议缺省为netty | 性能调优 | 协议的服务端和客户端实现类型，比如：dubbo协议的mina,netty等，可以分拆为server和client配置 | 2.0.5以上版本 |
| server | server | string | 可选 | dubbo协议缺省为netty，http协议缺省为servlet | 性能调优 | 协议的服务器端实现类型，比如：dubbo协议的mina,netty等，http协议的jetty,servlet等 | 2.0.5以上版本 |
| client | client | string | 可选 | dubbo协议缺省为netty | 性能调优 | 协议的客户端实现类型，比如：dubbo协议的mina,netty等 | 2.0.5以上版本 |
| dispatcher | dispatcher | string | 可选 | dubbo协议缺省为all | 性能调优 | 协议的消息派发方式，用于指定线程模型，比如：dubbo协议的all, direct, message, execution, connection等 | 2.1.0以上版本 |
| queues | queues | int | 可选 | 0 | 性能调优 | 线程池队列大小，当线程池满时，排队等待执行的队列大小，建议不要设置，当线程池满时应立即失败，重试其它服务提供机器，而不是排队，除非有特殊需求。 | 2.0.5以上版本 |
| charset | charset | string | 可选 | UTF-8 | 性能调优 | 序列化编码 | 2.0.5以上版本 |
| buffer | buffer | int | 可选 | 8192 | 性能调优 | 网络读写缓冲区大小 | 2.0.5以上版本 |
| heartbeat | heartbeat | int | 可选 | 0 | 性能调优 | 心跳间隔，对于长连接，当物理层断开时，比如拔网线，TCP的FIN消息来不及发送，对方收不到断开事件，此时需要心跳来帮助检查连接是否已断开 | 2.0.10以上版本 |
| telnet | telnet | string | 可选 | | 服务治理 | 所支持的telnet命令，多个命令用逗号分隔 | 2.0.5以上版本 |
| register | register | boolean | 可选 | true | 服务治理 | 该协议的服务是否注册到注册中心 | 2.0.8以上版本 |
| contextpath | contextpath | String | 可选 | 缺省为空串 | 服务治理 | 上下文路径 | 2.0.6以上版本 |
| sslEnabled | ssl-enabled | boolean | 可选 | false | 服务治理 | 是否启用ssl | 2.7.5以上版本 |
| parameters | parameters | Map<string, string> | 可选 |  | 扩展参数 | 2.0.0以上版本 |

### provider

服务提供者缺省值配置。对应的配置类： `org.apache.dubbo.config.ProviderConfig`。同时该标签为 `<dubbo:service>` 和 `<dubbo:protocol>` 标签的缺省值设置。

| 属性 | 对应URL参数 | 类型 | 是否必填 | 缺省值 | 作用 | 描述 | 兼容性 |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| id | | string | 可选 | dubbo | 配置关联 | 协议BeanId，可以在<dubbo:service proivder="">中引用此ID | 1.0.16以上版本 |
| protocol | <protocol> | string | 可选 | dubbo | 性能调优 | 协议名称 | 1.0.16以上版本 |
| host | <host> | string | 可选 | 自动查找本机IP | 服务发现 | 服务主机名，多网卡选择或指定VIP及域名时使用，为空则自动查找本机IP，建议不要配置，让Dubbo自动获取本机IP | 1.0.16以上版本 |
| threads | threads | int | 可选 | 200 | 性能调优 | 服务线程池大小(固定大小) | 1.0.16以上版本 |
| payload | payload | int | 可选 | 8388608(=8M) | 性能调优 | 请求及响应数据包大小限制，单位：字节 | 2.0.0以上版本 |
| path | <path> | string | 可选 | | 服务发现 | 提供者上下文路径，为服务path的前缀 | 2.0.0以上版本 |
| transporter | transporter | string | 可选 | dubbo协议缺省为netty | 性能调优 | 协议的服务端和客户端实现类型，比如：dubbo协议的mina,netty等，可以分拆为server和client配置 | 2.0.5以上版本 |
| server | server | string | 可选 | dubbo协议缺省为netty，http协议缺省为servlet | 性能调优 | 协议的服务器端实现类型，比如：dubbo协议的mina,netty等，http协议的jetty,servlet等 | 2.0.0以上版本 |
| client | client | string | 可选 | dubbo协议缺省为netty | 性能调优 | 协议的客户端实现类型，比如：dubbo协议的mina,netty等 | 2.0.0以上版本 |
| dispatcher | dispatcher | string | 可选 | dubbo协议缺省为all | 性能调优 | 协议的消息派发方式，用于指定线程模型，比如：dubbo协议的all, direct, message, execution, connection等 | 2.1.0以上版本 |
| codec | codec | string | 可选 | dubbo | 性能调优 | 协议编码方式 | 2.0.0以上版本 |
| serialization | serialization | string | 可选 | dubbo协议缺省为hessian2，rmi协议缺省为java，http协议缺省为json | 性能调优 | 协议序列化方式，当协议支持多种序列化方式时使用，比如：dubbo协议的dubbo,hessian2,java,compactedjava，以及http协议的json,xml等 | 2.0.5以上版本 |
| default | | boolean | 可选 | false | 配置关联 | 是否为缺省协议，用于多协议 | 1.0.16以上版本 |
| filter | service.filter | string | 可选 | | 性能调优 | 服务提供方远程调用过程拦截器名称，多个名称用逗号分隔 | 2.0.5以上版本 |
| listener | exporter.listener | string | 可选 | | 性能调优 | 服务提供方导出服务监听器名称，多个名称用逗号分隔 | 2.0.5以上版本 |
| threadpool | threadpool | string | 可选 | fixed | 性能调优 | 线程池类型，可选：fixed/cached/limit(2.5.3以上)/eager(2.6.x以上) | 2.0.5以上版本 |
| threadname | threadname | string | 可选 |       | 性能调优 | 线程池名称 | 2.7.6以上版本 |
| accepts | accepts | int | 可选 | 0 | 性能调优 | 服务提供者最大可接受连接数 | 2.0.5以上版本 |
| version | version | string | 可选 | 0.0.0 | 服务发现 | 服务版本，建议使用两位数字版本，如：1.0，通常在接口不兼容时版本号才需要升级 | 2.0.5以上版本 |
| group | group | string | 可选 |   | 服务发现 | 服务分组，当一个接口有多个实现，可以用分组区分 | 2.0.5以上版本 |
| delay | delay | int | 可选 | 0 | 性能调优 | 延迟注册服务时间(毫秒)- ，设为-1时，表示延迟到Spring容器初始化完成时暴露服务 | 2.0.5以上版本 |
| timeout | default.timeout | int | 可选 | 1000 | 性能调优 | 远程服务调用超时时间(毫秒) | 2.0.5以上版本 |
| retries | default.retries | int | 可选 | 2 | 性能调优 | 远程服务调用重试次数，不包括第一次调用，不需要重试请设为0 | 2.0.5以上版本 |
| connections | default.connections | int | 可选 | 0 | 性能调优 | 对每个提供者的最大连接数，rmi、http、hessian等短连接协议表示限制连接数，dubbo等长连接协表示建立的长连接个数 | 2.0.5以上版本 |
| loadbalance | default.loadbalance | string | 可选 | random | 性能调优 | 负载均衡策略，可选值：<br/>* random - 随机; <br/>* roundrobin - 轮询; <br/>* leastactive - 最少活跃调用; <br/>* consistenthash - 哈希一致 (2.1.0以上版本); <br/>* shortestresponse - 最短响应 (2.7.7以上版本); | 2.0.5以上版本 |
| async | default.async | boolean | 可选 | false | 性能调优 | 是否缺省异步执行，不可靠异步，只是忽略返回值，不阻塞执行线程 | 2.0.5以上版本 |
| stub | stub | boolean | 可选 | false | 服务治理 | 设为true，表示使用缺省代理类名，即：接口名 + Local后缀。 | 2.0.5以上版本 |
| mock | mock | boolean | 可选 | false | 服务治理 | 设为true，表示使用缺省Mock类名，即：接口名 + Mock后缀。 | 2.0.5以上版本 |
| token | token | boolean | 可选 | false | 服务治理 | 令牌验证，为空表示不开启，如果为true，表示随机生成动态令牌 | 2.0.5以上版本 |
| registry | registry | string | 可选 | 缺省向所有registry注册 | 配置关联 | 向指定注册中心注册，在多个注册中心时使用，值为<dubbo:registry>的id属性，多个注册中心ID用逗号分隔，如果不想将该服务注册到任何registry，可将值设为N/A | 2.0.5以上版本 |
| dynamic | dynamic | boolean | 可选 | true | 服务治理 | 服务是否动态注册，如果设为false，注册后将显示后disable状态，需人工启用，并且服务提供者停止时，也不会自动取消册，需人工禁用。 | 2.0.5以上版本 |
| accesslog | accesslog | string/boolean | 可选 | false | 服务治理 | 设为true，将向logger中输出访问日志，也可填写访问日志文件路径，直接把访问日志输出到指定文件 | 2.0.5以上版本 |
| owner | owner | string | 可选 | | 服务治理 | 服务负责人，用于服务治理，请填写负责人公司邮箱前缀 | 2.0.5以上版本 |
| document | document | string | 可选 | | 服务治理 | 服务文档URL | 2.0.5以上版本 |
| weight | weight | int | 可选 | | 性能调优 | 服务权重 | 2.0.5以上版本 |
| executes | executes | int | 可选 | 0 | 性能调优 | 服务提供者每服务每方法最大可并行执行请求数 | 2.0.5以上版本 |
| actives | default.actives | int | 可选 | 0 | 性能调优 | 每服务消费者每服务每方法最大并发调用数 | 2.0.5以上版本 |
| proxy | proxy | string | 可选 | javassist | 性能调优 | 生成动态代理方式，可选：jdk/javassist | 2.0.5以上版本 |
| cluster | default.cluster | string | 可选 | failover | 性能调优 | 集群方式，可选：failover/failfast/failsafe/failback/forking | 2.0.5以上版本 |
| deprecated | deprecated | boolean | 可选 | false | 服务治理 | 服务是否过时，如果设为true，消费方引用时将打印服务过时警告error日志 | 2.0.5以上版本 |
| queues | queues | int | 可选 | 0 | 性能调优 | 线程池队列大小，当线程池满时，排队等待执行的队列大小，建议不要设置，当线程池满时应立即失败，重试其它服务提供机器，而不是排队，除非有特殊需求。 | 2.0.5以上版本 |
| charset | charset | string | 可选 | UTF-8 | 性能调优 | 序列化编码 | 2.0.5以上版本 |
| buffer | buffer | int | 可选 | 8192 | 性能调优 | 网络读写缓冲区大小 | 2.0.5以上版本 |
| iothreads | iothreads | int | 可选 | CPU + 1 | 性能调优 | IO线程池，接收网络读写中断，以及序列化和反序列化，不处理业务，业务线程池参见threads配置，此线程池和CPU相关，不建议配置。 | 2.0.5以上版本 |
| alive | alive | int | 可选 | | 服务治理 | 线程池keepAliveTime，默认单位为ms | 2.0.5以上版本 |
| telnet | telnet | string | 可选 | | 服务治理 | 所支持的telnet命令，多个命令用逗号分隔 | 2.0.5以上版本 |
| wait | wait | int | 可选 | | 服务治理 | 停服务时等待时间 | 2.0.5以上版本 |
| contextpath | contextpath | String | 可选 | 缺省为空串 | 服务治理 | 上下文路径 | 2.0.6以上版本 |
| layer | layer | string | 可选 | | 服务治理 | 服务提供者所在的分层。如：biz、dao、intl:web、china:acton。 | 2.0.7以上版本 |
| parameters | parameters | Map<string, string> | 可选 | | 服务治理 | 扩展参数 | 2.0.0以上版本 |

### consumer

服务消费者缺省值配置。配置类： `org.apache.dubbo.config.ConsumerConfig` 。同时该标签为 `<dubbo:reference>` 标签的缺省值设置。

| 属性 | 对应URL参数 | 类型 | 是否必填 | 缺省值 | 作用 | 描述 | 兼容性 |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| timeout | default.timeout | int | 可选 | 1000 | 性能调优 | 远程服务调用超时时间(毫秒) | 1.0.16以上版本 |
| retries | default.retries | int | 可选 | 2 | 性能调优 | 远程服务调用重试次数，不包括第一次调用，不需要重试请设为0,仅在cluster为failback/failover时有效 | 1.0.16以上版本 |
| loadbalance | default.loadbalance | string | 可选 | random | 性能调优 | 负载均衡策略，可选值：<br/>* random - 随机; <br/>* roundrobin - 轮询; <br/>* leastactive - 最少活跃调用; <br/>* consistenthash - 哈希一致 (2.1.0以上版本); <br/>* shortestresponse - 最短响应 (2.7.7以上版本); | 1.0.16以上版本 |
| async | default.async | boolean | 可选 | false | 性能调优 | 是否缺省异步执行，不可靠异步，只是忽略返回值，不阻塞执行线程 | 2.0.0以上版本 |
| sent | default.sent | boolean | 可选 | true | 服务治理 | 异步调用时，标记sent=true时，表示网络已发出数据 | 2.0.6以上版本 |
| connections | default.connections | int | 可选 | 100 | 性能调优 | 每个服务对每个提供者的最大连接数，rmi、http、hessian等短连接协议支持此配置，dubbo协议长连接不支持此配置 | 1.0.16以上版本 |
| generic | generic | boolean | 可选 | false | 服务治理 | 是否缺省泛化接口，如果为泛化接口，将返回GenericService | 2.0.0以上版本 |
| check | check | boolean | 可选 | true | 服务治理 | 启动时检查提供者是否存在，true报错，false忽略 | 1.0.16以上版本 |
| proxy | proxy | string | 可选 | javassist | 性能调优 | 生成动态代理方式，可选：jdk/javassist | 2.0.5以上版本 |
| owner | owner | string | 可选 | | 服务治理 | 调用服务负责人，用于服务治理，请填写负责人公司邮箱前缀 | 2.0.5以上版本 |
| actives | default.actives | int | 可选 | 0 | 性能调优 | 每服务消费者每服务每方法最大并发调用数 | 2.0.5以上版本 |
| cluster | default.cluster | string | 可选 | failover | 性能调优 | 集群方式，可选：failover/failfast/failsafe/failback/forking/available/mergeable(2.1.0以上版本)/broadcast(2.1.0以上版本)/zone-aware(2.7.5以上版本) | 2.0.5以上版本 |
| filter | reference.filter | string | 可选 |   | 性能调优 | 服务消费方远程调用过程拦截器名称，多个名称用逗号分隔 | 2.0.5以上版本 |
| listener | invoker.listener | string | 可选 | | 性能调优 | 服务消费方引用服务监听器名称，多个名称用逗号分隔 | 2.0.5以上版本 |
| registry | | string | 可选 | 缺省向所有registry注册 | 配置关联 | 向指定注册中心注册，在多个注册中心时使用，值为<dubbo:registry>的id属性，多个注册中心ID用逗号分隔，如果不想将该服务注册到任何registry，可将值设为N/A | 2.0.5以上版本 |
| layer | layer | string | 可选 | | 服务治理 | 服务调用者所在的分层。如：biz、dao、intl:web、china:acton。 | 2.0.7以上版本 |
| init | init | boolean | 可选 | false | 性能调优 | 是否在afterPropertiesSet()时饥饿初始化引用，否则等到有人注入或引用该实例时再初始化。 | 2.0.10以上版本 |
| cache | cache | string/boolean | 可选 | | 服务治理 | 以调用参数为key，缓存返回结果，可选：lru, threadlocal, jcache等 | 2.1.0及其以上版本支持 |
| validation | validation | boolean | 可选 | | 服务治理 | 是否启用JSR303标准注解验证，如果启用，将对方法参数上的注解进行校验 | 2.1.0及其以上版本支持 |
| version | version | string | 可选 | | 服务治理 | 在 Dubbo 中为同一个服务配置多个版本 | 2.2.0及其以上版本支持 |
| client | client | string | 可选 | dubbo协议缺省为netty | 性能调优 | 协议的客户端实现类型，比如：dubbo协议的mina,netty等 | 2.0.0以上版本 |
| threadpool | threadpool | string | 可选 | fixed | 性能调优 | 线程池类型，可选：fixed/cached/limit(2.5.3以上)/eager(2.6.x以上) | 2.0.5以上版本 |
| corethreads | corethreads | int | 可选 | 200 | 性能调优 | 线程池核心线程大小 | 2.0.5以上版本 |
| threads | threads | int | 可选 | 200 | 性能调优 | 服务线程池大小(固定大小) | 2.0.5以上版本 |
| queues | queues | int | 可选 | 0 | 性能调优 | 线程池队列大小，当线程池满时，排队等待执行的队列大小，建议不要设置，当线程池满时应立即失败，重试其它服务提供机器，而不是排队，除非有特殊需求。 | 2.0.5以上版本 |
| shareconnections | shareconnections | int | 可选 | 1 | 性能调优| 共享连接数。当connection参数设置为0时，会启用共享方式连接，默认只有一个连接。仅支持dubbo协议 | 2.7.0以上版本 |
| referThreadNum | | int | 可选 | | 性能优化 | 异步调用线程池大小 | 3.0.0以上版本 |
| meshEnable | mesh-enable| boolean | 可选 | false | Service Mesh | Dubbo Mesh模式的开关。开启后，可适配SideCar模式，将Dubbo服务调用转换为K8S标准调用。仅支持Triple协议，兼容GRPC。设置为true后，原生对接K8S，无需第三方注册中心，设置dubbo.registry.address=N/A即可 | 3.1.0以上版本 |
| parameters | parameters | Map<string, string> | 可选 | | 服务治理 | 扩展参数 | 2.0.0以上版本 |

### metrics

指标配置。配置类： `org.apache.dubbo.config.MetricsConfig`

| 属性 | 对应URL参数 | 类型 | 是否必填 | 缺省值 | 作用 | 描述 | 兼容性 |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| protocol | protocol | string | 可选 | prometheus | 性能调优 | 协议名称，默认使用prometheus | 3.0.0以上版本 |
| prometheus | | PrometheusConfig | 可选 | | 配置关联 | prometheus相关配置 | 3.0.0以上版本 |
| aggregation | | AggregationConfig | 可选 | | 配置关联 | 指标聚合相关配置 | 3.0.0以上版本 |

- PrometheusConfig 对应类：`org.apache.dubbo.config.nested.PrometheusConfig`

| 属性 | 类型 | 是否必填 | 缺省值 | 描述 |
| --- | --- | ---- | --- | --- |
| exporter.enabled | boolean | 可选 | | 是否启用prometheus exporter | 
| exporter.enableHttpServiceDiscovery | boolean | 可选 | | 是否启用http服务发现 |
| exporter.httpServiceDiscoveryUrl | string | 可选 | | http服务发现地址 |
| exporter.metricsPort | int | 可选 | | 当使用pull方法时，暴露的端口号 |
| exporter.metricsPath | string | 可选 | | 当使用pull方法时，暴露指标的路径 |
| pushgateway.enabled | boolean | 可选 | | 是否可以通过prometheus的Pushgateway发布指标 |
| pushgateway.baseUrl | string | 可选 | | Pushgateway地址 |
| pushgateway.username | string | 可选 | | Pushgateway用户名 |
| pushgateway.password | string | 可选 | | Pushgateway密码 |
| pushgateway.pushInterval | int | 可选 | | 推送指标间隔时间 |

- AggregationConfig 对应类：`org.apache.dubbo.config.nested.AggregationConfig`

| 属性 | 类型 | 是否必填 | 缺省值 | 描述 |
| --- | --- | ---- | --- | --- |
| enabled | boolean | 可选 | | 是否开启本地指标聚合功能 |
| bucketNum | int | 可选 | | 时间窗口存储桶个数 |
| timeWindowSeconds | int | 可选 | | 时间窗口时长（s） |


### ssl

TLS认证配置。配置类： `org.apache.dubbo.config.SslConfig`

| 属性 | 对应URL参数 | 类型 | 是否必填 | 缺省值 | 作用 | 描述 | 兼容性 |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| serverKeyCertChainPath | server-key-cert-chain-path | string | 可选 | | 安全配置 | 服务端签名证书路径 | 2.7.5以上版本 |
| serverPrivateKeyPath | server-private-key-path | string | 可选 | | 安全配置 | 服务端私钥路径 | 2.7.5以上版本 |
| serverKeyPassword | server-key-password | string | 可选 | | 安全配置 | 服务端密钥密码 | 2.7.5以上版本 |
| serverTrustCertCollectionPath | server-trust-cert-collection-path | string | 可选 | | 安全配置 | 服务端信任证书路径 | 2.7.5以上版本 |
| clientKeyCertChainPath | client-key-cert-chain-path | string | 可选 | | 安全配置 | 客户端签名证书路径 | 2.7.5以上版本 |
| clientPrivateKeyPath | client-private-key-path | string | 可选 | | 安全配置 | 客户端私钥路径 | 2.7.5以上版本 |
| clientKeyPassword | client-key-password | string | 可选 | | 安全配置 | 客户端密钥密码 | 2.7.5以上版本 |
| clientTrustCertCollectionPath | client-trust-cert-collection-path | string | 可选 | | 安全配置 | 客户端信任证书路径 | 2.7.5以上版本 |

### module

模块信息配置。对应的配置类 `org.apache.dubbo.config.ModuleConfig`

| 属性 | 对应URL参数 | 类型 | 是否必填 | 缺省值 | 作用 | 描述 | 兼容性 |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| name | module | string | <b>必填</b> | | 服务治理 | 当前模块名称，用于注册中心计算模块间依赖关系 | 2.2.0以上版本 |
| version | module.version | string | 可选 | | 服务治理 | 当前模块的版本 | 2.2.0以上版本 |
| owner | module.owner | string | 可选 | | 服务治理 | 模块负责人，用于服务治理，请填写负责人公司邮箱前缀 | 2.2.0以上版本 |
| organization | module.organization | string | 可选 | | 服务治理 | 组织名称(BU或部门)，用于注册中心区分服务来源，此配置项建议不要使用autoconfig，直接写死在配置中，比如china,intl,itu,crm,asc,dw,aliexpress等 | 2.2.0以上版本 |
| background | background | boolean | 可选 | | 性能调优 | 是否开启后台启动模式。如果开启，无需等待spring ContextRefreshedEvent事件完成 | 3.0.0以上版本 |
| referAsync | referAsync | boolean | 可选 | | 性能调优 | 消费端是否开启异步调用 | 3.0.0以上版本 |
| referThreadNum | referThreadNum | int | 可选 | | 性能调优 | 异步调用线程池大小 | 3.0.0以上版本 |
| exportAsync | exportAsync | boolean | 可选 | | 性能调优 | 服务端是否开启导出 | 3.0.0以上版本 |
| exportThreadNum | exportThreadNum | int | 可选 | | 异步导出线程池大小 | | 3.0.0以上版本 |

### monitor

监控中心配置。对应的配置类： `org.apache.dubbo.config.MonitorConfig`

| 属性 | 对应URL参数 | 类型 | 是否必填 | 缺省值 | 作用 | 描述 | 兼容性 |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| protocol | protocol | string | 可选 | dubbo | 服务治理 | 监控中心协议，如果为protocol="registry"，表示从注册中心发现监控中心地址，否则直连监控中心。 | 2.0.9以上版本 |
| address | <url> | string | 可选 | | 服务治理 | 直连监控中心服务器地址，address="10.20.130.230:12080" | 1.0.16以上版本 |
| username | username | string | 可选 | | 服务治理 | 监控中心用户名 | 2.0.9以上版本 |
| password | password | string | 可选 | | 服务治理 | 监控中心密码 | 2.0.9以上版本 |
| group | group | string | 可选 | | 服务治理 | 分组 | 2.0.9以上版本 |
| version | version | string | 可选 | | 服务治理 | 版本号 | 2.0.9以上版本 |
| interval | interval | string | 可选 | | 服务治理 | 间隔时间 | 2.0.9以上版本 |
| parameters | parameters | Map<string, string> | 可选 |  | 自定义参数 | 2.0.0以上版本 |

### method

方法级配置。对应的配置类： `org.apache.dubbo.config.MethodConfig`。同时该标签为 `service` 或 `reference` 的子标签，用于控制到方法级。

for example:

```xml
<dubbo:reference interface="com.xxx.XxxService">
   <dubbo:method name="findXxx" timeout="3000" retries="2" />
</dubbo:reference>
```

| 属性 | 对应URL参数 | 类型 | 是否必填 | 缺省值 | 作用 | 描述 | 兼容性 |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| name | | string | <b>必填</b> | | 标识 | 方法名 | 1.0.8以上版本 |
| timeout | <methodName>.timeout | int | 可选 | 缺省为的timeout | 性能调优 | 方法调用超时时间(毫秒) | 1.0.8以上版本 |
| retries | <methodName>.retries | int | 可选 | 缺省为<dubbo:reference>的retries | 性能调优 | 远程服务调用重试次数，不包括第一次调用，不需要重试请设为0 | 2.0.0以上版本 |
| loadbalance | <methodName>.loadbalance | string | 可选 | 缺省为的loadbalance | 性能调优 | 负载均衡策略，可选值：<br/>* random - 随机; <br/>* roundrobin - 轮询; <br/>* leastactive - 最少活跃调用; <br/>* consistenthash - 哈希一致 (2.1.0以上版本); <br/>* shortestresponse - 最短响应 (2.7.7以上版本); | 2.0.0以上版本 |
| async | <methodName>.async | boolean | 可选 | 缺省为<dubbo:reference>的async | 性能调优 | 是否异步执行，不可靠异步，只是忽略返回值，不阻塞执行线程 | 1.0.9以上版本 |
| sent | <methodName>.sent | boolean | 可选 | true | 性能调优 | 异步调用时，标记sent=true时，表示网络已发出数据 | 2.0.6以上版本 |
| actives | <methodName>.actives | int | 可选 | 0 | 性能调优 | 每服务消费者最大并发调用限制 | 2.0.5以上版本 |
| executes | <methodName>.executes | int | 可选 | 0 | 性能调优 | 每服务每方法最大使用线程数限制- -，此属性只在<dubbo:method>作为<dubbo:service>子标签时有效 | 2.0.5以上版本 |
| deprecated | <methodName>.deprecated | boolean | 可选 | false | 服务治理 | 服务方法是否过时，此属性只在<dubbo:method>作为<dubbo:service>子标签时有效 | 2.0.5以上版本 |
| sticky | <methodName>.sticky | boolean | 可选 | false | 服务治理 | 设置true 该接口上的所有方法使用同一个provider.如果需要更复杂的规则，请使用路由 | 2.0.6以上版本 |
| return | <methodName>.return | boolean | 可选 | true | 性能调优 | 方法调用是否需要返回值,async设置为true时才生效，如果设置为true，则返回future，或回调onreturn等方法，如果设置为false，则请求发送成功后直接返回Null | 2.0.6以上版本 |
| oninvoke | attribute属性，不在URL中体现 | String | 可选 | | 性能调优 | 实例执行前拦截 | 2.0.6以上版本 |
| onreturn | attribute属性，不在URL中体现 | String | 可选 | | 性能调优 | 实例执行返回后拦截 | 2.0.6以上版本 |
| onthrow | attribute属性，不在URL中体现 | String | 可选 | | 性能调优 | 实例执行有异常拦截 | 2.0.6以上版本 |
| oninvokeMethod | attribute属性，不在URL中体现 | String | 可选 | | 性能调优 | 方法执行前拦截 | 2.0.6以上版本 |
| onreturnMethod | attribute属性，不在URL中体现 | String | 可选 | | 性能调优 | 方法执行返回后拦截 | 2.0.6以上版本 |
| onthrowMethod | attribute属性，不在URL中体现 | String | 可选 | | 性能调优 | 方法执行有异常拦截 | 2.0.6以上版本 |
| cache | <methodName>.cache | string/boolean | 可选 | | 服务治理 | 以调用参数为key，缓存返回结果，可选：lru, threadlocal, jcache等 | 2.1.0以上版本 |
| validation | <methodName>.validation | boolean | 可选 | | 服务治理 | 是否启用JSR303标准注解验证，如果启用，将对方法参数上的注解进行校验 | 2.1.0以上版本 |

### argument

方法参数配置。对应的配置类： `org.apache.dubbo.config.ArgumentConfig`。该标签为 `method` 的子标签，用于方法参数的特征描述，比如 XML 格式：

```xml
<dubbo:method name="findXxx" timeout="3000" retries="2">
   <dubbo:argument index="0" callback="true" />
</dubbo:method>
```

| 属性 | 对应URL参数 | 类型 | 是否必填 | 缺省值 | 作用 | 描述 | 兼容性 |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| index | | int | <b>必填</b> | | 标识 | 参数索引 | 2.0.6以上版本 |
| type | | String | 与index二选一 | | 标识 | 通过参数类型查找参数的index | 2.0.6以上版本 |
| callback | <metodName><index>.callback | boolean | 可选 | | 服务治理 | 参数是否为callback接口，如果为callback，服务提供方将生成反向代理，可以从服务提供方反向调用消费方，通常用于事件推送. | 2.0.6以上版本 |

### parameter

选项参数配置。对应的配置类：`java.util.Map`。同时该标签为 `protocol` 或 `service` 或 `provider` 或 `reference` 或 `consumer` 或 `monitor` 或 `registry` 或 `metadata-config` 或 `config-center` 的子标签，用于配置自定义参数，该配置项将作为扩展点设置自定义参数使用。

for example:

```xml
<dubbo:protocol name="napoli">
   <dubbo:parameter key="http://10.20.160.198/wiki/display/dubbo/napoli.queue.name" value="xxx" />
</dubbo:protocol>
```

也可以：

```xml
<dubbo:protocol name="jms" p:queue="xxx" />
```

| 属性 | 对应URL参数 | 类型 | 是否必填 | 缺省值 | 作用 | 描述 | 兼容性 |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| key | key | string | <b>必填</b> | | 服务治理 | 路由参数键 | 2.0.0以上版本 |
| value | value | string | <b>必填</b> | | 服务治理 | 路由参数值 | 2.0.0以上版本 |

### 环境变量
支持的 key 有以下两个：

1. `dubbo.labels`，指定一些列配置到 URL 中的键值对，通常通过 JVM -D 或系统环境变量指定。

   增加以下配置：

    ```properties
    # JVM
    -Ddubbo.labels = "tag1=value1; tag2=value2"
    # 环境变量
    DUBBO_LABELS = "tag1=value1; tag2=value2"
    ```

   最终生成的 URL 会包含 tag1、tag2 两个 key: `dubbo://xxx?tag1=value1&tag2=value2`

2. `dubbo.env.keys`，指定环境变量 key 值，Dubbo 会尝试从环境变量加载每个 key

    ```properties
    # JVM
    -Ddubbo.env.keys = "DUBBO_TAG1, DUBBO_TAG2"
    # 环境变量
    DUBBO_ENV_KEYS = "DUBBO_TAG1, DUBBO_TAG2"
    ```

   最终生成的 URL 会包含 DUBBO_TAG1、DUBBO_TAG2 两个 key: `dubbo://xxx?DUBBO_TAG1=value1&DUBBO_TAG2=value2`
### 其他配置
#### config-mode
**背景**

在每个dubbo应用中某些种类的配置类实例只能出现一次（比如`ApplicationConfig`、`MonitorConfig`、`MetricsConfig`、`SslConfig`、`ModuleConfig`），有些能出现多次（比如`RegistryConfig`、`ProtocolConfig`等）。

如果应用程序意外的扫描到了多个唯一配置类实例（比如用户在一个dubbo应用中错误了配置了两个`ApplicationConfig`），应该以哪种策略来处理这种情况呢？是直接抛异常？是保留前者忽略后者？是忽略前者保留后者？还是允许某一种形式的并存（比如后者的属性覆盖到前者上）？

目前dubbo中的唯一配置类类型和以及某唯一配置类型找到多个实例允许的配置模式/策略如下。

**唯一配置类类型**

`ApplicationConfig`、`MonitorConfig`、`MetricsConfig`、`SslConfig`、`ModuleConfig`。

前四个属于应用级别的，最后一个属于模块级别的。

**配置模式**

- `strict`：严格模式。直接抛异常。
- `override`：覆盖模式。忽略前者保留后者。
- `ignore`：忽略模式。忽略后者保留前者。
- `override_all`：属性覆盖模式。不管前者的属性值是否为空，都将后者的属性覆盖/设置到前者上。
- `override_if_absent`：若不存在则属性覆盖模式。只有前者对应属性值为空，才将后者的属性覆盖/设置到前者上。

注：后两种还影响配置实例的属性覆盖。因为dubbo有多种配置方式，即存在多个配置源，配置源也有优先级。比如通过xml方式配置了一个`ServiceConfig`且指定属性`version=1.0.0`，同时我们又在外部配置(配置中心)中配置了`dubbo.service.{interface}.version=2.0.0`，在没有引入`config-mode`配置项之前，按照原有的配置源优先级，最终实例的`version=2.0.0`。但是引入了`config-mode`配置项之后，配置优先级规则也不再那么严格，即如果指定`config-mode为override_all`则为`version=2.0.0`，如果`config-mode为override_if_absent`则为`version=1.0.0`，`config-mode`为其他值则遵循原有配置优先级进行属性设值/覆盖。

**配置方式**

配置的key为`dubbo.config.mode`，配置的值为如上描述的几种，默认的策略值为`strict`。下面展示了配置示例

```properties
# JVM -D
-Ddubbo.config.mode=strict

# 环境变量
DUBBO_CONFIG_MODE=strict

# 外部配置(配置中心)、Spring应用的Environment、dubbo.properties
dubbo.config.mode=strict
```