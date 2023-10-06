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

| Attribute | Corresponding URL parameter | Type | Required | Default |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| name | application | string | <b>Required</b> | | Service Governance| The name of the current application, which is used by the registry to calculate dependencies between applications. Note: the consumer and provider application names should not be the same, this parameter is not Matching conditions, you can fill in the name of your current project, which has nothing to do with the role of the provider and consumer. For example, if the kylin application calls the service of the morgan application, the kylin project will be kylin, and the morgan project will be morgan. Maybe kylin also provides other The service is used by others, but the kylin project will always be dubbed kylin, so the registry will show that kylin depends on morgan | version 2.7 .0 or later |
compiler | compiler | string | optional | javassist | performance optimization | Java bytecode compiler, used to generate dynamic classes, optional: jdk or javassist | version 2.7.0 or later |
| logger | logger | string | optional | slf4j | performance optimization | log output method, optional: slf4j, jcl, log4j, log4j2, jdk | version 2.7.0 or later |
| owner | owner | string | Optional | | Service Governance | The person in charge of the application, used for service governance, please fill in the email prefix of the person in charge | Version above 2.0.5 |
| organization | organization | string | Optional | | Service Governance | Organization name (BU or department), which is used by the registration center to distinguish service sources. It is recommended not to use autoconfig for this configuration item, and write it directly in the configuration, such as china, intl, itu, crm, asc, dw, aliexpress, etc. | Version 2.0.0 and above |
| architecture <br class="atl-forced-newline" /> | architecture <br class="atl-forced-newline" /> | string | optional | | Service Governance | . Different architectures use different layers. | Version 2.0. 7 and above |
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
| metadataType | metadata-type |String| Optional | local | Service Governance | Application-level service discovery The metadata delivery method is from the perspective of Provider, and the configuration on the Consumer side is invalid. The optional values are:<br> * remote - Provider Put the metadata in the remote registry, and the Consumer gets it from the registry;<br/>* local - Provider puts the metadata locally, and the Consumer gets it directly from the Provider; | Version 2.7.5 and above |
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

| Attribute | Corresponding URL parameter | Type | Required | Default |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| interface | | class | <b>required</b> | | service discovery | service interface name | version 1.0.0 or later |
| ref | | object | <b>required</b> | | service discovery | service object implementation reference | version 1.0.0 or later |
| version | version | string | optional | 0.0.0 | service discovery | service version, it is recommended to use a two-digit version, such as: 1.0, usually the version number needs to be upgraded when the interface is not compatible | version 1.0.0 or later |
| group | group | string | optional | | service discovery | service grouping, when an interface has multiple implementations, they can be distinguished by grouping | version 1.0.7 or later |
| path | <path> | string | optional | default interface name | service discovery | service path (note: 1.0 does not support custom path, always use the interface name, if there is 1.0 to 2.0, the configuration service path may not be Compatible) | Version 1.0.12+ |
| delay | delay | int | Optional | 0 | Performance tuning | Delayed registration service time (milliseconds), when set to -1, it means that the service is delayed until the initialization of the Spring container is completed | Version 1.0.14 and above |
timeout | timeout | int | optional | 1000 | performance tuning | remote service call timeout (milliseconds) | version 2.0.0 or later |
| retries | retries | int | Optional | 2 | Performance tuning | The number of remote service call retries, excluding the first call, please set it to 0 if you don't need to retry | Version 2.0.0 or later |
connections | connections | int | optional | 100 | performance tuning | the maximum number of connections for each provider, short connection protocols such as rmi, http, and hessian indicate the limit on the number of connections, and long connection agreements such as dubbo indicate the established long connections Number | Version 2.0.0 or above |
loadbalance | loadbalance | string | optional | random | performance tuning | load balancing strategy, optional values: <br/>* random - random; <br/>* roundrobin - polling; <br/>* leastactive - Least active calls; br/>* consistenthash - consistent hash (2.1.0+); <br/>* shortestresponse - shortest response (2.7.7+);| 2.0.0+|
| async | async | boolean | Optional | false | Performance tuning | Whether to execute asynchronously by default, unreliable asynchronous, just ignore the return value, do not block the execution thread | Version above 2.0.0 |
| local | local | class/boolean | optional | false | service governance | set to true, means to use the default proxy class name, that is: interface name + Local suffix, obsolete, please use stub| 2.0.0 or above |
| stub | stub | class/boolean | Optional | false | Service Governance | Set to true, which means to use the default proxy class name, that is: interface name + Stub suffix, the local proxy class name of the service interface client, used in the client The client executes local logic, such as local cache, etc. The constructor of the local proxy class must allow remote proxy objects to be passed in, such as: public XxxServiceStub(XxxService xxxService) | Version 2.0.0 or later |
| mock | mock | class/boolean | Optional | false | Service Governance | Set to true, which means to use the default Mock class name, that is: interface name + Mock suffix, if the service interface fails to call the Mock implementation class , the Mock class must have A no-argument constructor, the difference from Local is that Local is always executed, while Mock is only executed when non-business exceptions (such as timeouts, network exceptions, etc.) occur, Local is executed before remote calls, and Mock is executed after remote calls . | Version 2.0.0 and above |
| token | token | string/boolean | Optional | | service governance | Consumers bypass the registration center for direct access to ensure that the authorization function of the registration center is valid. If point-to-point calls are used, the token function must be turned off | version 2.0.0 or later |
| registry | | string | optional | default registration to all registries | configuration association | registration to the specified registry, used in multiple registries, the value is the id attribute of <dubbo:registry>, used for multiple registries IDs Separated by commas, If you don't want to register the service to any registry, you can set the value to N/A | Version 2.0.0 or later |
| provider | | string | optional | the first provider configuration is used by default | configuration association | specify the provider, the value is the id attribute of <dubbo:provider> | version above 2.0.0 |
| deprecated | deprecated | boolean | Optional | false | Service Governance | Whether the service is deprecated, if set to true, the consumer will print the service deprecated warning error log | 2.0.5 or later |
| dynamic | dynamic | boolean | Optional | true | Service Governance | Whether the service is dynamically registered, if it is set to false, the disabled status will be displayed after registration, and it needs to be manually enabled, and the registration will not be canceled automatically when the service provider stops , need to be disabled manually. | Version 2.0.5 and above |
| accesslog | accesslog | string/boolean | optional | false | service management | set to true, the access log will be output to the logger, and the access log file path can also be filled in to output the access log directly to the specified file | 2.0.5 and above version |
| owner | owner | string | optional | | service governance |
| document | document | string | optional | | service governance | service document URL | version 2.0.5 or later |
| weight | weight | int | optional | | performance tuning | service weight | version 2.0.5 or later |
| executes | executes | int | optional | 0 | performance tuning | the maximum number of parallel execution requests per service and method of a service provider | version 2.0.5 or later |
actives | actives | int | optional | 0 | performance tuning | maximum number of concurrent calls per service consumer per service per method | version 2.0.5 or later |
proxy | proxy | string | optional | javassist | performance tuning | generate dynamic proxy, optional: jdk/javassist | version 2.0.5 or later |
cluster | cluster | string | optional | failover | performance tuning | cluster mode, optional: failover/failfast/failsafe/failback/forking/available/mergeable (2.1. )/zone-aware (version 2.7.5 or later) | version 2.0 .5 or later |
filter | service.filter | string | optional | default | performance tuning | service provider remote call process interceptor name, multiple names separated by commas | version 2.0.5 or later |
| listener | exporter.listener | string | optional | default | performance tuning | service provider export service listener name, multiple names separated by commas | |
| protocol | | string | optional | | configuration association | use the specified protocol to expose the service, used in multi-protocol, the value is the id attribute of <dubbo:protocol>, multiple protocol IDs are separated by commas | version 2.0 .5 or later |
| layer | layer | string | optional | | service governance | the layer where the service provider resides. Such as: biz, dao, intl:web, china:acton. | Version 2.0.7 and above |
| register | register | boolean | optional | true | service governance | whether the service of this protocol is registered to the registry | version 2.0.8 or later |
| validation | validation | string | optional | | service governance | whether to enable JSR303 standard annotation validation, if enabled, the annotations on the method parameters will be validated | version 2.7.0 or later |
| parameters | None | Map<string, string> | Optional | | Service Governance | Reserved for extensions, any parameters can be extended and defined, and all extended parameters will be reflected in the URL configuration as they are | Version 2.0.0 and above |

### reference


A service consumer references a service configuration. Corresponding configuration class: `org.apache.dubbo.config.ReferenceConfig`

| Attribute | Corresponding URL parameter | Type | Required | Default |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| id | | string | <b>required</b> | | configuration association | service reference BeanId | version 1.0.0 or later |
| interface | | class | <b>required</b> | | service discovery | service interface name | version 1.0.0 or later |
| version | version | string | optional | | service discovery | service version, consistent with the version of the service provider | version above 1.0.0 |
| group | group | string | optional | | service discovery | service grouping, when an interface has multiple implementations, they can be distinguished by grouping, must be consistent with the service provider | version 1.0.7 or later |
| timeout | timeout | long | optional | timeout of <dubbo:consumer> is used by default | performance tuning | service method call timeout (milliseconds) | version 1.0.5 or later |
retries | retries | int | optional | retries of <dubbo:consumer> are used by default | performance tuning | retries of remote service calls, excluding the first call, please set to 0 | 2.0. Version 0 and above |
connections | connections | int | optional | default connections of <dubbo:consumer> | performance tuning | the maximum number of connections for each provider, rmi, http, hessian and other short connection protocols indicate the limit of the number of connections, dubbo The equal-length connection association indicates the number of established long connections | Version 2.0.0 or later |
| loadbalance | loadbalance | string | optional | default loadbalance of <dubbo:consumer> | performance tuning | load balancing strategy, optional values: <br/>* random - random; <br/>* roundrobin - round <br/>* leastactive - least active call; <br/>* consistenthash - consistent hash (version 2.1.0 and above); <br/>* shortestresponse - shortest response (version 2.7.7 and above); | 2.0 .0+ version |
| async | async | boolean | optional | async of <dubbo:consumer> is used by default | performance tuning | whether to execute asynchronously, unreliable and asynchronous, just ignore the return value and not block the execution thread | version 2.0.0 or later |
| generic | generic | boolean | optional | default <dubbo:consumer> generic | service governance | whether to default the generic interface, if it is a generic interface, it will return GenericService | version 2.0.0 or later |
| check | check | boolean | optional | default check of <dubbo:consumer> | service governance | check whether the provider exists at startup, true will report an error, false will ignore | version 2.0.0 or later |
| url | url | string | optional | | service governance | point-to-point direct connection service provider address, will bypass the registration center | version 1.0.6 or later |
| stub | stub | class/boolean | Optional | | Service Governance | The name of the service interface client's local proxy class, which is used to execute local logic on the client, such as local cache, etc. The constructor of the local proxy class must allow input Remote proxy object, constructor such as: public XxxServiceLocal(XxxService xxxService) | version 2.0.0 or later |
| mock | mock | class/boolean | Optional | | Service Governance | Service interface call failure Mock implementation class name, the Mock class must have a no-argument constructor, the difference from Local is that Local is always executed, while Mock Execute only When a non-business exception occurs (such as timeout, network exception, etc.), Local is executed before the remote call, and Mock is executed after the remote call. | Supported by Dubbo1.0.13 and above |
| cache | cache | string/boolean | Optional | | Service Governance | The call parameter is used as the key to cache the returned result, optional: lru, threadlocal, jcache, etc. | Supported by Dubbo2.1.0 and above |
| validation | validation | boolean | optional | | service governance | whether to enable JSR303 standard annotation validation, if enabled, the annotations on the method parameters will be validated | Dubbo2.1.0 and above versions support |
proxy | proxy | boolean | optional | javassist | performance tuning | choose dynamic proxy implementation strategy, optional: javassist, jdk | version above 2.0.2 |
| client | client | string | optional | | performance tuning | client transport type setting, such as netty or mina of Dubbo protocol. | Supported by Dubbo2.0.0 and above |
| registry | | string | optional | By default, the service list will be obtained from all registries and the results will be merged | Configuration Association | Register to obtain the service list from the specified registry, used when there are multiple registries, the value is <dubbo:registry> The id attribute, multiple registration center IDs are separated by commas | Version 2.0.0 or later |
| owner | owner | string | Optional | | Service Governance | To call the person in charge of the service for service governance, please fill in the email prefix of the person in charge | Version above 2.0.5 |
actives | actives | int | optional | 0 | performance tuning | maximum number of concurrent calls per service consumer per service per method | version 2.0.5 or later |
cluster | cluster | string | optional | failover | performance tuning | cluster mode, optional: failover/failfast/failsafe/failback/forking/available/mergeable (2.1. )/zone-aware (version 2.7.5 or later) | version 2.0 .5 or later |
connections | connections | int | optional | 100 | performance tuning | the maximum number of connections for each provider, short connection protocols such as rmi, http, and hessian indicate the limit on the number of connections, and long connection agreements such as dubbo indicate the established long connections Number | Version 2.0.0 or above |
filter | reference.filter | string | optional | default | performance tuning | service consumer remote call process interceptor name, multiple names separated by commas | version 2.0.5 or later |
listener | invoker.listener | string | optional | default | performance tuning | The service consumer quotes the name of the service listener, and multiple names are separated by commas | Version 2.0.5 or later |
| layer | layer | string | optional | | service governance | the layer where the service caller resides. Such as: biz, dao, intl:web, china:acton. | Version 2.0.7 and above |
| init | init | boolean | optional | false | Performance tuning | Whether to starvely initialize the reference when afterPropertiesSet(), otherwise wait until someone injects or references the instance before initializing. | Version 2.0.10 and above |
| protocol | protocol | string | optional | | service governance | only call the service provider of the specified protocol, and ignore other protocols. | Version 2.7.0 and above |
client | client | string | optional | dubbo protocol defaults to netty | service discovery | protocol client implementation type, such as: dubbo protocol mina, netty, etc. | version 2.7.0 or later |
| providerPort | provider-port | int | Optional | | Service Mesh | When dubbo.consumer.meshEnable=true, Dubbo will convert the request to K8S standard format by default, and combine VirtualService and DestinationRule for traffic management. At this time, the consumer can perceive to provider. If you don't want to use VirtualService and DestinationRule, please set providerPort to make the consumer aware of the service port exposed by the provider | Version 3.1.0 and above |
| unloadClusterRelated | unloadClusterRelated | boolean | Optional | false | Service Mesh | When dubbo.consumer.meshEnable=true, in Service Mesh mode, set it to true to unload the Directory, Router and Load Balance related to the Cluster in the current call , Delegate retry, load balancing, timeout and other traffic management functions to Sidecar, use VirtualService and DestinationRule for traffic management | Version 3.1.0 and above |
| parameters | None | Map<string, string> | Optional | | Service Governance | Reserved for extensions, any parameters can be extended and defined, and all extended parameters will be reflected in the URL configuration as they are | Version 2.0.0 and above |
| providedBy | provided-by | string | Optional | | Service Mesh | When dubbo.consumer.meshEnable=true, Dubbo will convert the request to K8S standard format by default, and combine VirtualService and DestinationRule for traffic management. At this time, the consumer can perceive to provider. The value should be consistent with the declared `k8s service` | Version 3.1.0 or later |
| providerNamespace | provider-namespace | string | Optional | | Service Mesh | When dubbo.consumer.meshEnable=true, Dubbo will convert the request into K8S standard format by default, and combine VirtualService and DestinationRule for traffic management. At this time, the Consumer can perceive to provider. Please set the providerNamespace so that the consumer can address the provider dns according to this configuration, the default `default` | version 3.1.2 or later |


### registry

Registry configuration. Corresponding configuration class: `org.apache.dubbo.config.RegistryConfig`. At the same time, if there are multiple different registries, you can declare multiple `<dubbo:registry>` tags, and specify the registry to use in the `registry` attribute of `<dubbo:service>` or `<dubbo:reference>` .

| Attribute | Corresponding URL parameter | Type | Required | Default |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| id | | string | optional | | configuration association | the registration center references the BeanId, which can be referenced in <dubbo:service registry=""> or <dubbo:reference registry=""> | version 1.0.16 or later |
| address | <host:port> | string | <b>Required</b> | | Service discovery| The address of the registration center server. If the address has no port, the default is 9090. Multiple addresses in the same cluster are separated by commas. Such as: ip:port, ip:port, registry centers of different clusters, please configure multiple <dubbo:registry> tags | Version 1.0.16 or later |
| protocol | <protocol> | string | optional | dubbo | service discovery | registry address protocol, support `dubbo`, `multicast`, `zookeeper`, `redis`, `consul(2.7. .2)`, `etcd( 2.7.2)`, `nacos(2.7.2)` and other protocols | Version 2.0.0 and above |
| port | <port> | int | optional | 9090 | service discovery | the default port of the registry, when the address does not have a port, use this port as the default value | version 2.0.0 or later |
| username | <username> | string | Optional | | Service Governance | Username for logging in to the registration center, if the registration center does not require verification, it can be left blank | Version 2.0.0 or later |
| password | <password> | string | Optional | | Service Governance | Password for logging in to the registration center, if the registration center does not require verification, you can leave it blank | Version 2.0.0 or later |
transport | registry.transporter | string | optional | netty | performance tuning | network transport mode, optional mina, netty | version 2.0.0 or later |
| timeout | registry.timeout | int | optional | 5000 | performance tuning | registry center request timeout (milliseconds) | version 2.0.0 or later |
| session | registry.session | int | optional | 60000 | Performance tuning | Registry session timeout (milliseconds), used to detect dirty data after abnormal disconnection of the provider, such as the implementation of heartbeat detection, this time It is the heartbeat interval , which is different for different registration centers. | Version 2.1.0 and above |
| zone | zone | string | optional | | service governance | the region to which the registry belongs, usually used for traffic isolation | version 2.7.5 or later
| file | registry.file | string | Optional | | Service Governance | Use a file to cache the registry address list and service provider list. When the application is restarted, it will be restored based on this file. Note: two registries cannot use the same file storage | Version 2.0.0 or later |
| wait | registry.wait | int | optional | 0 | performance tuning | wait notification completion time (milliseconds) when stopping | version 2.0.0 or later |
| check | check | boolean | optional | true | service governance | whether to report an error when the registration center does not exist | version 2.0.0 or later |
| register | register | boolean | Optional | true | Service Governance | Whether to register the service with this registry, if set to false, it will only subscribe and not register | Version 2.0.5 and above |
| subscribe | subscribe | boolean | optional | true | service governance | whether to subscribe to this registry service, if set to false, it will only register, not subscribe | version 2.0.5 or later |
| dynamic | dynamic | boolean | Optional | true | Service Governance | Whether the service is dynamically registered, if it is set to false, it will be displayed as disabled after registration, it needs to be manually enabled, and when the service provider stops , it will not be automatically unregistered , need to be disabled manually. | Version 2.0.5 and above |
| group | group | string | Optional | dubbo | Service Governance | Service registration grouping, cross-group services will not affect each other, and cannot call each other, suitable for environment isolation. | Version 2.0.5 and above |
| version | version | string | optional | | service discovery | service version | version above 1.0.0 |
| simplified | simplified | boolean | optional | false | service governance | whether the URL registered to the registration center is in simplified mode (compatible with lower versions) | version 2.7.0 or later |
| extra-keys | extraKeys | string | Optional | | Service Governance | When simplified=true, extraKeys allows you to put extra keys in the URL besides the default parameters, in the format: "interface,key1,key2". | Version 2.7 .0 and above |
| useAsConfigCenter | | boolean | optional | | service governance | whether the registry is used as a configuration center | version 2.7.5 or later |
| useAsMetadataCenter | | boolean | optional | | service governance | whether the registry is used as a metadata center | version 2.7.5 or later |
| accepts | accepts | string | Optional | | Service Governance | The registry receives a list of rpc protocols, multiple protocols are separated by commas, such as dubbo, rest | version 2.7.5 or later |
| preferred | preferred | boolean | optional | | service governance | whether to be the preferred registry. When subscribing to multiple registries, if set to true, the registries will be preferred | Version 2.7.5 and above |
| weight | weight | int | optional | | performance tuning | registration traffic weight. When using multiple registries, you can use this value to adjust the distribution of registration traffic. This value does not take effect when setting the preferred registry | Version 2.7. 5 or later |
| registerMode | register-mode | string | Optional | all | Service Governance | Control address registration behavior, used for application-level service discovery and migration. <br/>* instance only registers application-level addresses;<br/>* interface only registers interface-level addresses;<br/>* all (default) registers both application-level and interface-level addresses; | Version 3.0.0 and above |
| enableEmptyProtection | enable-empty-protection | boolean | Optional | true | Service Governance | Whether to enable the protection of the empty address list on the consumer side globally. After enabling it, the empty address push from the registration center will be ignored. The default is true | Version 3.0.0 or later |
| parameters | None | Map<string, string> | Optional | | Service Governance | Reserved for extensions, any parameters can be extended and defined, and all extended parameters will be reflected in the URL configuration as they are | Version 2.0.0 and above |

### config-center

configuration center. Corresponding configuration class: `org.apache.dubbo.config.ConfigCenterConfig`

| Attribute | Corresponding URL parameter | Type | Required | Default | Description | Compatibility |
| ---------------- | ---------------------- | --------- ---------- | -------- | ---------------- | ------------- -------------------------------------------------- | -- ---- |
| protocol | protocol | string | optional | zookeeper | Which configuration center to use: apollo, zookeeper, nacos, etc. <br />Take zookeeper as an example<br />1. If the protocol is specified, the address can be simplified to `127.0.0.1:2181`;<br />2. If the protocol is not specified, the address value will be `zookeeper:// 127.0.0.1:2181` | Version 2.7.0 or higher |
| address | address | string | Mandatory | | Configuration center address. <br />See the protocol description for the value | Version 2.7.0 and above |
| highestPriority | highest-priority| boolean | optional | true | The configuration item from the configuration center has the highest priority, that is, the local configuration item will be overwritten. | Version 2.7.0 and above |
| namespace | namespace | string | optional | dubbo | Usually used for multi-tenant isolation, the actual meaning depends on the specific configuration center. <br />Such as: <br />zookeeper - environment isolation, the default value is ` dubbo`; <br />apollo - distinguishes configuration sets in different domains, using `dubbo` and `application` by default | Version 2.7.0 and above |
| cluster | cluster | string | optional | | The meaning depends on the selected configuration center. <br />It is used to distinguish different configuration clusters in Apollo | Version 2.7.0 and above |
group | group | string | optional | dubbo | The meaning depends on the selected configuration center. <br />nacos - isolate different configuration sets<br />zookeeper - isolate different configuration sets | Version 2.7.0 and above |
| check | check | boolean | optional | true | Whether to terminate the application startup when the connection to the configuration center fails. | Version 2.7.0 and above |
| configFile | config-file | string | optional | dubbo.properties | the key to which the global configuration file is mapped<br />zookeeper - default path /dubbo/config/dubbo/dubbo.properties<br />apollo - dubbo dubbo.properties key in namespace | Version 2.7.0 or later |
| appConfigFile | app-config-file | string | optional | | "configFile" is shared globally. This item is restricted to properties configured by this application | 2.7.0+ |
| timeout | timeout | int | optional | 3000ms | get the configured timeout | version 2.7.0 or later |
| username | username | string | optional | | If the configuration center needs to be verified, the username<br />Apollo is not enabled yet | Version 2.7.0 or later |
| password | password | string | Optional | | If the configuration center needs to be verified, the password<br />Apollo is not enabled yet | Version 2.7.0 or later |
| parameters | parameters | Map<string, string> | Optional | | Extended parameters, used to support customized configuration parameters of different configuration centers | Version 2.7.0 or later |
| includeSpringEnv |include-spring-env| boolean | Optional | false | Supported when using the Spring framework. When true, the configuration will be automatically read from the Spring Environment. <br />By default, <br />key is dubbo .properties configuration <br />key is Dubbo.properties PropertySource | Version 2.7.0 or above |

### metadata-report-config

metadata center. Corresponding configuration class: `org.apache.dubbo.config.MetadataReportConfig`

| Attribute | Corresponding URL parameter | Type | Required | Default | Description | Compatibility |
| --------------- | --------- | ------ | -------- | ------- -- | ----------------------------------------------- ------------- | ------ |
| address | address | string | required | | metadata center address. | Version 2.7.0 and above |
protocol | protocol | string | optional | zookeeper | metadata center protocol: zookeeper, nacos, redis, etc. <br />Take zookeeper as an example<br />1. If the protocol is specified, the address can be simplified to `127.0.0.1:2181`;<br />2. If the protocol is not specified, the address value will be `zookeeper:// 127.0.0.1:2181` | Version 2.7.13 and above |
| port | port | int | optional | | metadata center port number. Specify the port, then the address can be simplified, no need to configure the port number | Version 2.7.13 or later |
| username | username | string | optional | | metadata center needs to be verified, username<br />Apollo is not enabled yet | version 2.7.0 or later |
| password | password | string | Optional | | The metadata center needs to be verified, and the password<br />Apollo is not enabled yet | Version 2.7.0 or later |
| timeout | timeout | int | optional | | get metadata timeout (ms) | version 2.7.0 or later |
| group | group | string | optional | dubbo | Metadata grouping, suitable for environment isolation. It has the same meaning as the registration center group | Version 2.7.0 and above |
| retryTimes | retry-times | int | optional | 100 | number of retries | version 2.7.0 or later |
| retryPeriod | retry-period | int | optional | 3000ms | retry interval (ms) | version 2.7.0 or later |
| cycleReport | cycle-report | boolean| optional | true | Whether to update full metadata every day | Version 2.7.0 and above |
| syncReport | sync-report | boolean| optional | false | whether to update metadata synchronously, the default is asynchronous | version 2.7.0 or later |
| cluster | cluster | string | optional | | The meaning depends on the selected metadata center. <br />It is used to distinguish different configuration clusters in Apollo | Version 2.7.0 and above |
| file | file | string | optional | | use the file cache metadata center list, when the application is restarted, it will be restored based on this file, note: two metadata centers cannot use the same file storage | version 2.7.0 or later |
| check | check | boolean | optional | true | Whether to terminate the application startup when the metadata center connection fails. | Version 3.0.0 and above |
| reportMetadata | report-metadata | boolean | Optional | false | Whether to upload the interface configuration report metadata in the address discovery, `dubbo.application.metadata-type=remote` If the configuration does not work, it will be reported, `dubbo. Whether to report when application.metadata-type=local` is determined by the configuration value | Version 3.0.0 or later |
| reportDefinition | report-definition | boolean | Optional | true | Whether to report metadata for service operation and maintenance | Version 3.0.0 or later |
| reportConsumerDefinition | report-consumer-definition | boolean | Optional | true | Whether to report metadata for service operation and maintenance on the consumer side | Version 3.0.0 or later |
| parameters | parameters | Map<string, string> | Optional | | Extended parameters, used to support customized configuration parameters of different metadata centers | Version 2.7.0 or later |

### protocol

Service provider protocol configuration. Corresponding configuration class: `org.apache.dubbo.config.ProtocolConfig`. At the same time, if you need to support multiple protocols, you can declare multiple `<dubbo:protocol>` tags, and specify the used protocol through the `protocol` attribute in `<dubbo:service>`.

| Attribute | Corresponding URL parameter | Type | Required | Default |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| id | | string | optional | dubbo | configuration association | protocol BeanId, you can refer to this ID in <dubbo:service protocol="">, if the ID is not filled, the default is the same as the value of the name attribute, and if it is repeated, it will be in the name followed by the serial number. | Version 2.0.5 and above |
| name | <protocol> | string | <b>Required</b> | dubbo | Performance tuning | Protocol name | Version above 2.0.5 |
| port | <port> | int | optional | The default port of dubbo protocol is 20880, the default port of rmi protocol is 1099, the default port of http and hessian protocol is 80; if <b>no</b> port is configured, The default port will be used automatically, if configured as <b>-1</b>, an unoccupied port will be allocated. For Dubbo 2.4.0+, the allocated port is increased on the basis of the default port of the protocol to ensure that the port segment is controllable. | Service Discovery | Service Port | Version 2.0.5 and above |
| host | <host> | string | Optional | Automatically find local IP | Service discovery | - Service host name, used when selecting multiple network cards or specifying VIP and domain name, if it is empty, it will automatically find local IP, - it is recommended not to configure , let Dubbo automatically obtain the local IP | version 2.0.5 or later |
| threadpool | threadpool | string | optional | fixed | performance tuning | thread pool type, optional: fixed/cached/limit (above 2.5.3)/eager (above 2.6.x) | version 2.0.5 or above |
| threadname | threadname | string | optional | | performance tuning | thread pool name | version 2.7.6 or later |
| threads | threads | int | optional | 200 | performance tuning | service thread pool size (fixed size) | version 2.0.5 or later |
| corethreads | corethreads | int | optional | 200 | performance tuning | thread pool core thread size | version 2.0.5 or later |
| iothreads | threads | int | optional | number of cpus + 1 | performance tuning | io thread pool size (fixed size) | version 2.0.5 or later |
| accepts | accepts | int | optional | 0 |
| payload | payload | int | optional | 8388608(=8M) | performance tuning | request and response packet size limit, unit: byte | version 2.0.5 or later |
| codec | codec | string | optional | dubbo | performance tuning | protocol encoding | version 2.0.5 or later |
| serialization | serialization | string | optional | dubbo protocol defaults to hessian2, rmi protocol defaults to java, http protocol defaults to json | performance tuning | protocol serialization method, used when the protocol supports multiple serialization methods , such as: dubbo, hessian2, java, compactedjava of dubbo protocol, and json of http protocol, etc. | Version 2.0.5 and above |
| accesslog | accesslog | string/boolean | Optional | | Service Governance| Set to true, the access log will be output to the logger, you can also fill in the access log file path, directly output the access log to the specified file | Version 2.0.5 or later |
| path | <path> | string | optional | | service discovery | provider context path, prefix of service path | version 2.0.5 or later |
| transporter | transporter | string | optional | dubbo protocol defaults to netty | performance tuning | protocol server and client implementation types, such as: dubbo protocol mina, netty, etc., can be split into server and client configuration | Version 2.0.5 and above |
| server | server | string | Optional | Dubbo protocol defaults to netty, http protocol defaults to servlet | Performance tuning | The server-side implementation type of the protocol, such as: mina, netty of dubbo protocol, etc., jetty of http protocol, servlet, etc. | Version 2.0.5 and above |
| client | client | string | Optional | Dubbo protocol defaults to netty | Performance tuning | Protocol client implementation type, such as: dubbo protocol mina, netty, etc. | Version 2.0.5 or later |
| dispatcher | dispatcher | string | optional | dubbo protocol defaults to all | performance tuning | protocol message distribution method, used to specify the thread model, such as: all, direct, message, execution, connection, etc. of dubbo protocol | 2.1 .0+ version |
| queues | queues | int | optional | 0 | performance tuning | thread pool queue size, when the thread pool is full, the size of the queue waiting to be executed, it is recommended not to set, when the thread pool is full, it should fail immediately, and retry other Serving provisioning machines, rather than queuing, unless there is a special need. | Version 2.0.5 and above |
| charset | charset | string | optional | UTF-8 | performance tuning | serialization encoding | version 2.0.5 or later |
| buffer | buffer | int | optional | 8192 | performance tuning | network read and write buffer size | version 2.0.5 or later |
| heartbeat | heartbeat | int | Optional | 0 | Performance Tuning| A heartbeat is required to help check if a connection is broken | 2.0.10+ |
| telnet | telnet | string | Optional | | Service Governance | Supported telnet commands, separated by commas | Version 2.0.5 and above |
| register | register | boolean | optional | true | service governance | whether the service of this protocol is registered to the registry | version 2.0.8 or later |
| contextpath | contextpath | String | optional | default is empty string | service governance | context path | version 2.0.6 or later |
| sslEnabled | ssl-enabled | boolean | optional | false | service governance | whether to enable ssl | version 2.7.5 or later |
| parameters | parameters | Map<string, string> | optional | | extended parameters | version 2.0.0 or later |

### provider

Service provider default configuration. Corresponding configuration class: `org.apache.dubbo.config.ProviderConfig`. At the same time, this tag is the default value setting of `<dubbo:service>` and `<dubbo:protocol>` tags.

| Attribute | Corresponding URL parameter | Type | Required | Default |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| id | | string | optional | dubbo | configuration association | protocol BeanId, you can refer to this ID in <dubbo:service proivder=""> | version above 1.0.16 |
| protocol | <protocol> | string | optional | dubbo | performance tuning | protocol name | version 1.0.16 or later |
| host | <host> | string | Optional | Automatically search for local IP | Service discovery | Service host name, used when selecting multiple network cards or specifying VIP and domain name, if it is empty, it will automatically search for local IP. Dubbo automatically obtains the local IP | version 1.0.16 or later |
| threads | threads | int | optional | 200 | performance tuning | service thread pool size (fixed size) | version 1.0.16 or later |
| payload | payload | int | optional | 8388608(=8M) | performance tuning | request and response packet size limit, unit: byte | version above 2.0.0 |
| path | <path> | string | optional | | service discovery | provider context path, prefix of service path | version 2.0.0 or later |
| transporter | transporter | string | optional | dubbo protocol defaults to netty | performance tuning | protocol server and client implementation types, such as: dubbo protocol mina, netty, etc., can be split into server and client configuration | Version 2.0.5 and above |
| server | server | string | Optional | Dubbo protocol defaults to netty, http protocol defaults to servlet | Performance tuning | The server-side implementation type of the protocol, such as: mina, netty of dubbo protocol, etc., jetty of http protocol, servlet, etc. | Version 2.0.0 and above |
| client | client | string | Optional | Dubbo protocol defaults to netty | Performance tuning | Protocol client implementation type, such as: dubbo protocol mina, netty, etc. | Version 2.0.0 or later |
| dispatcher | dispatcher | string | optional | dubbo protocol defaults to all | performance tuning | protocol message distribution method, used to specify the thread model, such as: all, direct, message, execution, connection, etc. of dubbo protocol | 2.1 .0+ version |
| codec | codec | string | optional | dubbo | performance tuning | protocol encoding | version 2.0.0 or later |
| serialization | serialization | string | optional | dubbo protocol defaults to hessian2, rmi protocol defaults to java, http protocol defaults to json | performance tuning | protocol serialization method, used when the protocol supports multiple serialization methods , such as: dubbo, hessian2, java, compactedjava of the dubbo protocol, and json, xml of the http protocol | Version 2.0.5 and above |
| default | | boolean | optional | false | configuration association | whether it is the default protocol, used for multi-protocol | version 1.0.16 or later |
| filter | service.filter | string | optional | | performance tuning | service provider remote call process interceptor name, multiple names separated by commas | version 2.0.5 or later |
| listener | exporter.listener | string | optional | | performance tuning | service provider export service listener name, multiple names separated by commas | version 2.0.5 or later |
| threadpool | threadpool | string | optional | fixed | performance tuning | thread pool type, optional: fixed/cached/limit (above 2.5.3)/eager (above 2.6.x) | version 2.0.5 or above |
| threadname | threadname | string | optional | | performance tuning | thread pool name | version 2.7.6 or later |
| accepts | accepts | int | optional | 0 |
| version | version | string | optional | 0.0.0 | service discovery | service version, it is recommended to use a two-digit version, such as: 1.0, usually the version number needs to be upgraded when the interface is incompatible | version 2.0.5 or later |
| group | group | string | optional | | service discovery | service grouping, when an interface has multiple implementations, they can be distinguished by grouping | version 2.0.5 or later |
| delay | delay | int | Optional | 0 | Performance tuning | Delayed registration service time (milliseconds) - When set to -1, it means that the service is delayed until the initialization of the Spring container is completed | Version 2.0.5 and above |
| timeout | default.timeout | int | optional | 1000 | performance tuning | remote service call timeout (milliseconds) | version 2.0.5 or later |
| retries | default.retries | int | optional | 2 | Performance tuning | The number of remote service call retries, excluding the first call, please set it to 0 if you don't need to retry | Version 2.0.5 or later |
| connections | default.connections | int | optional | 0 | performance tuning | the maximum number of connections for each provider, short connection protocols such as rmi, http, and hessian indicate the limit on the number of connections, long connection agreements such as dubbo indicate the established The number of long connections | Version 2.0.5 and above |
| loadbalance | default.loadbalance | string | optional | random | performance tuning | load balancing strategy, optional values:<br/>* random - random; <br/>* roundrobin - round robin; leastactive - least active call; <br/>* consistenthash - consistent hash (2.1.0+); <br/>* shortestresponse - shortest response (2.7.7+); | 2.0.5+ |
| async | default.async | boolean | optional | false | performance tuning | whether to execute asynchronously by default, unreliable and asynchronous, just ignore the return value and not block the execution thread | Version 2.0.5 and above |
| stub | stub | boolean | Optional | false | Service Governance | If set to true, it means to use the default proxy class name, namely: interface name + Local suffix. | Version 2.0.5 and above |
| mock | mock | boolean | Optional | false | Service Governance | Set to true to use the default Mock class name, namely: interface name + Mock suffix. | Version 2.0.5 and above |
| token | token | boolean | Optional | | Service Governance | Token verification, empty means not enabled, if true, means randomly generated dynamic tokens | Version 2.0.5 and above |
| registry | registry | string | optional | register with all registries by default | configuration association | register with the specified registry, used when there are multiple registries, the value is the id attribute of <dubbo:registry>, multiple registry IDs Separated by commas, if you do not want to register the service to any registry, you can set the value to N/A | Version 2.0.5 or later |
| dynamic | dynamic | boolean | Optional | true | Service Governance | Whether the service is dynamically registered, if it is set to false, the disabled status will be displayed after registration, and it needs to be manually enabled, and the registration will not be canceled automatically when the service provider stops , need to be disabled manually. | Version 2.0.5 and above |
| accesslog | accesslog | string/boolean | optional | false | service management | set to true, the access log will be output to the logger, and the access log file path can also be filled in to output the access log directly to the specified file | 2.0.5 and above version |
| owner | owner | string | optional | | service governance |
| document | document | string | optional | | service governance | service document URL | version 2.0.5 or later |
| weight | weight | int | optional | | performance tuning | service weight | version 2.0.5 or later |
| executes | executes | int | optional | 0 | performance tuning | the maximum number of parallel execution requests per service and method of a service provider | version 2.0.5 or later |
| actives | default.actives | int | optional | 0 | performance tuning | maximum number of concurrent calls per service consumer per service per method | version 2.0.5 or later |
proxy | proxy | string | optional | javassist | performance tuning | generate dynamic proxy, optional: jdk/javassist | version 2.0.5 or later |
| cluster | default.cluster | string | optional | failover | performance tuning | cluster mode, optional: failover/failfast/failsafe/failback/forking | version above 2.0.5 |
| deprecated | deprecated | boolean | Optional | false | Service Governance | Whether the service is deprecated, if set to true, the consumer will print the service deprecated warning error log | 2.0.5 or later |
| queues | queues | int | optional | 0 | performance tuning | thread pool queue size, when the thread pool is full, the size of the queue waiting to be executed, it is recommended not to set, when the thread pool is full, it should fail immediately, and retry other Serving provisioning machines, rather than queuing, unless there is a special need. | Version 2.0.5 and above |
| charset | charset | string | optional | UTF-8 | performance tuning | serialization encoding | version 2.0.5 or later |
| buffer | buffer | int | optional | 8192 | performance tuning | network read and write buffer size | version 2.0.5 or later |
| iothreads | iothreads | int | Optional | CPU + 1 | Performance tuning | IO thread pool, receive network read and write interrupts, serialize and deserialize, do not process business, business thread pool see threads configuration, this thread pool It is related to the CPU and is not recommended to be configured. | Version 2.0.5 and above |
| alive | alive | int | optional | | service management | thread pool keepAliveTime, the default unit is ms | version 2.0.5 or later |
| telnet | telnet | string | Optional | | Service Governance | Supported telnet commands, separated by commas | Version 2.0.5 and above |
| wait | wait | int | Optional | | Service Governance | Waiting time when stopping the service |
| contextpath | contextpath | String | optional | default is empty string | service governance | context path | version 2.0.6 or later |
| layer | layer | string | optional | | service governance | the layer where the service provider resides. Such as: biz, dao, intl:web, china:acton. | Version 2.0.7 and above |
| parameters | parameters | Map<string, string> | optional | | service governance | extended parameters | version 2.0.0 or later |

### consumer

Service consumer default configuration. Configuration class: `org.apache.dubbo.config.ConsumerConfig`. At the same time, this tag is the default value setting of the `<dubbo:reference>` tag.

| Attribute | Corresponding URL parameter | Type | Required | Default |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| timeout | default.timeout | int | optional | 1000 | performance tuning | remote service call timeout (milliseconds) | version 1.0.16 or later |
| retries | default.retries | int | optional | 2 | Performance tuning | The number of remote service call retries, excluding the first call, please set it to 0 if you do not need to retry, it is only valid when the cluster is failback/failover | Version 1.0.16 and above |
| loadbalance | default.loadbalance | string | optional | random | performance tuning | load balancing strategy, optional values:<br/>* random - random; <br/>* roundrobin - round robin; leastactive - least active call; <br/>* consistenthash - consistent hash (2.1.0+); <br/>* shortestresponse - shortest response (2.7.7+); | 1.0.16+ |
| async | default.async | boolean | optional | false | performance tuning | whether to execute asynchronously by default, unreliable and asynchronous, just ignore the return value and not block the execution thread | Version 2.0.0 or later |
| sent | default.sent | boolean | optional | true | service governance | when calling asynchronously, when the flag sent=true, it means that the network has sent data | version 2.0.6 or later |
| connections | default.connections | int | optional | 100 | performance tuning | the maximum number of connections for each service to each provider, rmi, http, hessian and other short connection protocols support this configuration, dubbo protocol long connection does not support This configuration | 1.0.16+ version |
| generic | generic | boolean | optional | false | service governance | whether to default the generic interface, if it is a generic interface, it will return GenericService | version above 2.0.0 |
| check | check | boolean | Optional | true | Service Governance | Check whether the provider exists at startup, true reports an error, false ignores | version 1.0.16 and above |
proxy | proxy | string | optional | javassist | performance tuning | generate dynamic proxy, optional: jdk/javassist | version 2.0.5 or later |
| owner | owner | string | Optional | | Service Governance | To call the person in charge of the service for service governance, please fill in the email prefix of the person in charge | Version above 2.0.5 |
| actives | default.actives | int | optional | 0 | performance tuning | maximum number of concurrent calls per service consumer per service per method | version 2.0.5 or later |
| cluster | default.cluster | string | optional | failover | performance tuning | cluster mode, optional: failover/failfast/failsafe/failback/forking/available/mergeable (2.1. above)/zone-aware(2.7.5 above) | 2.0.5 above |
| filter | reference.filter | string | optional | | performance tuning | service consumer remote call process interceptor name, multiple names separated by commas | version 2.0.5 or later |
| listener | invoker.listener | string | optional | | performance tuning | the service consumer quotes the name of the service listener, multiple names are separated by commas | version 2.0.5 or later |
| registry | | string | optional | default registration to all registries | configuration association | registration to the specified registry, used in multiple registries, the value is the id attribute of <dubbo:registry>, used for multiple registries IDs Separated by commas, if you do not want to register the service to any registry, you can set the value to N/A | Version 2.0.5 or later |
| layer | layer | string | optional | | service governance | the layer where the service caller resides. Such as: biz, dao, intl:web, china:acton. | Version 2.0.7 and above |
| init | init | boolean | optional | false | Performance tuning | Whether to starvely initialize the reference when afterPropertiesSet(), otherwise wait until someone injects or references the instance before initializing. | Version 2.0.10 and above |
| cache | cache | string/boolean | Optional | | Service Governance | The call parameter is used as the key to cache the returned result, optional: lru, threadlocal, jcache, etc. | Supported by version 2.1.0 and above |
| validation | validation | boolean | optional | | service governance | whether to enable JSR303 standard annotation validation, if enabled, the annotations on the method parameters will be validated | 2.1.0 and above version support |
| version | version | string | optional | | service governance | configure multiple versions for the same service in Dubbo | 2.2.0 and above versions support |
| client | client | string | Optional | Dubbo protocol defaults to netty | Performance tuning | Protocol client implementation type, such as: dubbo protocol mina, netty, etc. | Version 2.0.0 or later |
| threadpool | threadpool | string | optional | fixed | performance tuning | thread pool type, optional: fixed/cached/limit (above 2.5.3)/eager (above 2.6.x) | version 2.0.5 or above |
| corethreads | corethreads | int | optional | 200 | performance tuning | thread pool core thread size | version 2.0.5 or later |
| threads | threads | int | optional | 200 | performance tuning | service thread pool size (fixed size) | version 2.0.5 or later |
| queues | queues | int | optional | 0 | performance tuning | thread pool queue size, when the thread pool is full, the size of the queue waiting to be executed, it is recommended not to set, when the thread pool is full, it should fail immediately, and retry other Serving provisioning machines, rather than queuing, unless there is a special need. | Version 2.0.5 and above |
| shareconnections | shareconnections | int | optional | 1 | performance tuning | number of shared connections. When the connection parameter is set to 0, the shared mode connection will be enabled, and there is only one connection by default. Only supports dubbo protocol | version 2.7.0 and above |
| referThreadNum | | int | optional | | performance optimization | thread pool size for asynchronous calls | version 3.0.0 or later |
| meshEnable | mesh-enable| boolean | optional | false | Service Mesh | Dubbo Mesh mode switch. After it is turned on, it can adapt to the SideCar mode and convert Dubbo service calls to K8S standard calls. Only supports the Triple protocol and is compatible with GRPC. After setting to true, the native docking K8S, no third-party registration center is required, just set dubbo.registry.address=N/A | Version 3.1.0 or later |
| parameters | parameters | Map<string, string> | optional | | service governance | extended parameters | version 2.0.0 or later |

### metrics

Indicator configuration. Configuration class: `org.apache.dubbo.config.MetricsConfig`

| Attribute | Corresponding URL parameter | Type | Required | Default |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| protocol | protocol | string | optional | prometheus | performance tuning | protocol name, prometheus is used by default | version 3.0.0 or later |
| prometheus | | PrometheusConfig | optional | | configuration association | prometheus related configuration | version 3.0.0 or later |
| aggregation | | AggregationConfig | Optional | | Configuration association | Indicator aggregation related configuration | Version 3.0.0 or later |

- PrometheusConfig corresponding class: `org.apache.dubbo.config.nested.PrometheusConfig`

| Attribute | Type | Required | Default | Description |
| --- | --- | ---- | --- | --- |
| exporter.enabled | boolean | optional | | whether to enable prometheus exporter |
| exporter.enableHttpServiceDiscovery | boolean | optional | | whether to enable http service discovery |
| exporter.httpServiceDiscoveryUrl | string | optional | | http service discovery URL |
| exporter.metricsPort | int | optional | | port number to expose when using the pull method |
| exporter.metricsPath | string | optional | | path to expose metrics when using pull method |
| pushgateway.enabled | boolean | optional | | whether to publish metrics through the Pushgateway of prometheus |
| pushgateway.baseUrl | string | optional | | Pushgateway address |
| pushgateway.username | string | optional | | Pushgateway username |
| pushgateway.password | string | optional | | Pushgateway password |
| pushgateway.pushInterval | int | optional | | push indicator interval time |

- AggregationConfig corresponding class: `org.apache.dubbo.config.nested.AggregationConfig`

| Attribute | Type | Required | Default | Description |
| --- | --- | ---- | --- | --- |
| enabled | boolean | optional | | Whether to enable the local indicator aggregation function |
| bucketNum | int | optional | | the number of time window buckets |
| timeWindowSeconds | int | optional | | time window duration (s) |


### ssl

TLS authentication configuration. Configuration class: `org.apache.dubbo.config.SslConfig`

| Attribute | Corresponding URL parameter | Type | Required | Default |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| serverKeyCertChainPath | server-key-cert-chain-path | string | optional | | security configuration |
| serverPrivateKeyPath | server-private-key-path | string | optional | | security configuration | server private key path | version 2.7.5 or later |
| serverKeyPassword | server-key-password | string | optional | | security configuration | server key password | version 2.7.5 or later |
| serverTrustCertCollectionPath | server-trust-cert-collection-path | string | optional | | security configuration | server trust certificate path | version 2.7.5 or later |
| clientKeyCertChainPath | client-key-cert-chain-path | string | optional | | security configuration | client signature certificate path | version 2.7.5 or later |
| clientPrivateKeyPath | client-private-key-path | string | optional | | security configuration | client private key path | version 2.7.5 or later |
| clientKeyPassword | client-key-password | string | optional | | security configuration | client key password | version 2.7.5 or later |
| clientTrustCertCollectionPath | client-trust-cert-collection-path | string | optional | | security configuration | client trust certificate path | version 2.7.5 or later |

### module

Module information configuration. The corresponding configuration class `org.apache.dubbo.config.ModuleConfig`

| Attribute | Corresponding URL parameter | Type | Required | Default |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| name | module | string | <b>Required</b> | | Service Governance | Current module name, used by the registry to calculate dependencies between modules | Version 2.2.0 or later |
| version | module.version | string | optional | | service governance | current module version | version 2.2.0 or later |
| owner | module.owner | string | Optional | | Service Governance | The person in charge of the module, used for service governance, please fill in the email prefix of the person in charge | Version above 2.2.0 |
| organization | module.organization | string | Optional | | Service Governance | Organization name (BU or department), which is used by the registration center to distinguish service sources. It is recommended not to use autoconfig for this configuration item, and write it directly in the configuration, such as China, intl, itu, crm, asc, dw, aliexpress, etc. | Version 2.2.0 and above |
| background | background | boolean | optional | | performance tuning | whether to enable the background startup mode. If enabled, there is no need to wait for the spring ContextRefreshedEvent event to complete | Version 3.0.0 and above |
| referAsync | referAsync | boolean | Optional | | Performance tuning | Whether to enable asynchronous calls on the consumer side | Version 3.0.0 or later |
| referThreadNum | referThreadNum | int | optional | | performance tuning | thread pool size for asynchronous calls | version 3.0.0 or later |
| exportAsync | exportAsync | boolean | Optional | | Performance tuning | Whether export is enabled on the server | Version 3.0.0 or later |
| exportThreadNum | exportThreadNum | int | optional | | asynchronous export thread pool size | | version 3.0.0 or later |

### monitor

Monitoring center configuration. Corresponding configuration class: `org.apache.dubbo.config.MonitorConfig`

| Attribute | Corresponding URL parameter | Type | Required | Default |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| protocol | protocol | string | optional | dubbo | service governance | monitoring center protocol, if it is protocol="registry", it means that the address of the monitoring center is found from the registry, otherwise it is directly connected to the monitoring center. | Version 2.0.9 and above |
| address | <url> | string | Optional | | Service Governance | Directly connected to the monitoring center server address, address="10.20.130.230:12080" | Version 1.0.16 or later |
| username | username | string | optional | | service governance | monitoring center username | version 2.0.9 or later |
| password | password | string | optional | | service governance | monitoring center password | version 2.0.9 or later |
| group | group | string | optional | | service governance | grouping | version 2.0.9 or later |
| version | version | string | optional | | service governance | version number | version 2.0.9 or later |
| interval | interval | string | optional | | service governance | interval time | version 2.0.9 or later |
| parameters | parameters | Map<string, string> | optional | | custom parameters | version 2.0.0 or later |

### method

Method-level configuration. Corresponding configuration class: `org.apache.dubbo.config.MethodConfig`. At the same time, this tag is a sub-tag of `service` or `reference`, which is used to control to the method level.

for example:

```xml
<dubbo:reference interface="com.xxx.XxxService">
   <dubbo:method name="findXxx" timeout="3000" retries="2" />
</dubbo:reference>
```

| Attribute | Corresponding URL parameter | Type | Required | Default |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| name | | string | <b>required</b> | | logo | method name | version 1.0.8 or later |
| timeout | <methodName>.timeout | int | optional | default is timeout | performance tuning | method call timeout (milliseconds) | version 1.0.8 or later |
| retries | <methodName>.retries | int | optional | The default is retries of <dubbo:reference> | Performance tuning | The number of retries for remote service calls, excluding the first call, please set it to 0 | Version 2.0.0 or higher |
| loadbalance | <methodName>.loadbalance | string | optional | default is loadbalance | performance tuning | load balancing strategy, optional values: <br/>* random - random; <br/>* roundrobin - polling ; <br/>* leastactive - least active call; <br/>* consistenthash - consistent hash (version 2.1.0+); <br/>* shortestresponse - shortest response (version 2.7.7+); | 2.0. Version 0 and above |
| async | <methodName>.async | boolean | Optional | The default is async of <dubbo:reference> | Performance tuning | Whether to execute asynchronously, unreliable and asynchronous, just ignore the return value and not block the execution thread | 1.0.9 above version |
| sent | <methodName>.sent | boolean | Optional | true | Performance tuning | When calling asynchronously, when the mark sent=true, it means that the network has sent data | Version 2.0.6 or later |
| actives | <methodName>.actives | int | optional | 0 | performance tuning | maximum concurrent call limit for each service consumer | version 2.0.5 or later |
| executes | <methodName>.executes | int | optional | 0 | performance tuning | the maximum number of threads used per service and method - -, this attribute is only used when <dubbo:method> is used as a subtag of <dubbo:service> Valid | Version 2.0.5 and above |
| deprecated | <methodName>.deprecated | boolean | Optional | false | Service Governance | Whether the service method is deprecated, this attribute is only valid when <dubbo:method> is used as a subtag of <dubbo:service> | Version above 2.0.5 |
| sticky | <methodName>.sticky | boolean | optional | false | service governance | set true All methods on this interface use the same provider. If you need more complex rules, please use routing | 2.0.6 or later |
| return | <methodName>.return | boolean | Optional | true | Performance tuning | Whether the method call needs to return a value. It will take effect only when async is set to true. If it is set to true, it will return future, or call back methods such as onreturn. If set to false, Null will be returned directly after the request is sent successfully | Versions above 2.0.6 |
| oninvoke | attribute attribute, not reflected in the URL | String | Optional | | Performance tuning | Intercept before instance execution | Version 2.0.6 or later |
| onreturn | attribute attribute, not reflected in the URL | String | Optional | | Performance tuning | Intercept after instance execution returns |
| onthrow | attribute attribute, not reflected in the URL | String | optional | | performance tuning | exception interception in instance execution |
| oninvokeMethod | attribute attribute, not reflected in the URL | String | Optional | | Performance tuning | Intercept before method execution | Version 2.0.6 or later |
| onreturnMethod | attribute attribute, not reflected in the URL | String | Optional | | Performance tuning | Intercept after method execution returns | Version above 2.0.6 |
| onthrowMethod | attribute attribute, not reflected in the URL | String | Optional | | Performance tuning | Method execution has exception interception | Version 2.0.6 or later |
| cache | <methodName>.cache | string/boolean | Optional | | Service Governance | Use the call parameter as the key to cache the returned result, optional: lru, threadlocal, jcache, etc. | Version above 2.1.0 |
| validation | <methodName>.validation | boolean | Optional | | Service Governance | Whether to enable JSR303 standard annotation validation, if enabled, the annotations on method parameters will be validated | Version 2.1.0 or later |

### argument

Method parameter configuration. Corresponding configuration class: `org.apache.dubbo.config.ArgumentConfig`. This tag is a sub-tag of `method`, which is used to describe the characteristics of method parameters, such as XML format:

```xml
<dubbo:method name="findXxx" timeout="3000" retries="2">
   <dubbo:argument index="0" callback="true" />
</dubbo:method>
```

| Attribute | Corresponding URL parameter | Type | Required | Default |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| index | | int | <b>required</b> | | identifier | parameter index | version 2.0.6 or later |
| type | | String | choose one of index and index | | identification | find parameter index by parameter type | version 2.0.6 or later |
| callback | <metodName><index>.callback | boolean | optional | | service governance | whether the parameter is a callback interface, if it is callback, the service provider will generate a reverse proxy, and the consumer can be reversely called from the service provider , usually used for event push. | Versions above 2.0.6 |

### parameter

Option parameter configuration. Corresponding configuration class: `java.util.Map`. At the same time, the label is a sub-label of `protocol` or `service` or `provider` or `reference` or `consumer` or `monitor` or `registry` or `metadata-config` or `config-center`, used for configuration Custom parameters, this configuration item will be used as an extension point to set custom parameters.

for example:

```xml
<dubbo:protocol name="napoli">
   <dubbo:parameter key="http://10.20.160.198/wiki/display/dubbo/napoli.queue.name" value="xxx" />
</dubbo:protocol>
```

You can also:

```xml
<dubbo:protocol name="jms" p:queue="xxx" />
```

| Attribute | Corresponding URL parameter | Type | Required | Default |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| key | key | string | <b>Required</b> | | Service governance | Routing parameter key | Version 2.0.0 or later |
| value | value | string | <b>Required</b> | | Service governance | Routing parameter value | Version 2.0.0 or later |

### Environment variables
The supported keys are the following two:

1. `dubbo.labels`, specify a list of key-value pairs configured in the URL, usually through JVM -D or system environment variables.

   Add the following configuration:

    ```properties
    # JVM
    -Ddubbo.labels = "tag1=value1; tag2=value2"
    # environment variables
    DUBBO_LABELS = "tag1=value1; tag2=value2"
    ```

   The final generated URL will contain two keys tag1 and tag2: `dubbo://xxx?tag1=value1&tag2=value2`

2. `dubbo.env.keys`, specify the environment variable key value, Dubbo will try to load each key from the environment variable

    ```properties
    # JVM
    -Ddubbo.env.keys="DUBBO_TAG1, DUBBO_TAG2"
    # environment variables
    DUBBO_ENV_KEYS = "DUBBO_TAG1, DUBBO_TAG2"
    ```

   The final generated URL will contain two keys DUBBO_TAG1 and DUBBO_TAG2: `dubbo://xxx?DUBBO_TAG1=value1&DUBBO_TAG2=value2`
### Other configuration
#### config-mode
**background**

Some types of configuration class instances can only appear once in each dubbo application (such as `ApplicationConfig`, `MonitorConfig`, `MetricsConfig`, `SslConfig`, `ModuleConfig`), and some can appear multiple times (such as `RegistryConfig` , `ProtocolConfig`, etc.).

If the application accidentally scans multiple unique configuration class instances (for example, the user misconfigures two `ApplicationConfig` in a dubbo application), which strategy should be used to deal with this situation? Is it throwing an exception directly? Is it to keep the former and ignore the latter? Is it to ignore the former and keep the latter? Or does it allow a certain form of coexistence (such as the attributes of the latter overriding the former)?

Currently, the only configuration class type in dubbo and the configuration modes/strategies allowed by finding multiple instances of a unique configuration type are as follows.

**Unique configuration class type**

`ApplicationConfig`, `MonitorConfig`, `MetricsConfig`, `SslConfig`, `ModuleConfig`.

The first four belong to the application level, and the last one belongs to the module level.

**configuration mode**

- `strict`: Strict mode. Throw an exception directly.
- `override`: override mode. Ignore the former and keep the latter.
- `ignore`: ignore pattern. Ignore the latter and keep the former.
- `override_all`: attribute override mode. No matter whether the attribute value of the former is empty or not, the attribute of the latter is overwritten/set on the former.
- `override_if_absent`: attribute override mode if absent. Only when the corresponding attribute value of the former is empty, can the attribute of the latter be overwritten/set on the former.

Note: The latter two also affect property overrides for configuration instances. Because dubbo has multiple configuration methods, that is, there are multiple configuration sources, and the configuration sources also have priorities. For example, a `ServiceConfig` is configured through xml and the attribute `version=1.0.0` is specified. At the same time, we configure `dubbo.service.{interface}.version=2.0.0` in the external configuration (configuration center), Before the `config-mode` configuration item is introduced, according to the original configuration source priority, `version=2.0.0` of the final instance. However, after the `config-mode` configuration item is introduced, the configuration priority rules are no longer so strict, that is, if `config-mode is override_all` is specified, it is `version=2.0.0`, if `config-mode is override_if_absent` If it is `version=1.0.0`, if `config-mode` is other values, the property setting/overwriting will follow the original configuration priority.

**Configuration method**

The configured key is `dubbo.config.mode`, the configured values are as described above, and the default policy value is `strict`. A sample configuration is shown below

```properties
# JVM -D
-Ddubbo.config.mode=strict

# environment variables
DUBBO_CONFIG_MODE=strict

# External configuration (configuration center), Environment of Spring application, dubbo.properties
dubbo.config.mode=strict
```
