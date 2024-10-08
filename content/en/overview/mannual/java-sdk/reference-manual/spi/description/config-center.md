---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/config-center/
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/config-center/
description: Configuration Center Extension
linkTitle: Configuration Center Extension
title: Configuration Center Extension
type: docs
weight: 13
---






## Design Purpose

The core function of the configuration center is to serve as a Key-Value storage. The Dubbo framework informs the configuration center of the keys it is concerned about, and the configuration center returns the corresponding value for those keys.

Divided by application scenario, the configuration center primarily undertakes the following responsibilities in the Dubbo framework:

- As an externalized configuration center, storing the dubbo.properties configuration file, where the key is usually the filename, such as dubbo.properties, and the value is the content of the configuration file.
- Storing individual configuration items, such as various switches and constant values.
- Storing service governance rules, where the key is usually organized in the format of "service name + rule type," and the value is the specific governance rule.

To further implement grouped management of key-values, Dubbo's configuration center has also integrated the concepts of namespace and group, which are reflected in many professional third-party configuration centers. Generally, the namespace is used to isolate different tenants, while the group is used to group the collection of keys for the same tenant.

Currently, the Dubbo configuration center has implemented integration with Zookeeper, Nacos, Etcd, Consul, and Apollo. Next, let's specifically look at how Dubbo's abstract configuration center maps to specific third-party implementations.

## Extension Interfaces

* `org.apache.dubbo.configcenter.DynamicConfigurationFactory`
* `org.apache.dubbo.configcenter.DynamicConfiguration`

## Known Extensions

* `org.apache.dubbo.configcenter.support.zookeeper.ZookeeperDynamicConfigurationFactory`
* `org.apache.dubbo.configcenter.support.nacos.NacosDynamicConfigurationFactory`
* `org.apache.dubbo.configcenter.support.etcd.EtcdDynamicConfigurationFactory`
* `org.apache.dubbo.configcenter.consul.ConsulDynamicConfigurationFactory`
* `org.apache.dubbo.configcenter.support.apollo.ApolloDynamicConfigurationFactory`
* `org.apache.dubbo.common.config.configcenter.file.FileSystemDynamicConfigurationFactory`

## Implementation Principles

### Zookeeper

Zookeeper provides a tree-like storage model, and its implementation principles are as follows:

![image-20190127225608553](/imgs/dev/configcenter_zk_model.jpg)

The namespace, group, key, etc., correspond to different levels of ZNode nodes, while the value is stored as the value of the root ZNode.

1. Externalized Configuration Center dubbo.properties

   ![image-20190127225608553](/imgs/dev/configcenter_zk_properties.jpg)
   
   The above figure shows the storage structure of two different scopes of dubbo.properties files in Zookeeper:
   - Namespace is: dubbo
   - Group: Global level is dubbo, shared by all applications; Application level is the application name demo-provider, only effective for that application.
   - Key: dubbo.properties
   
2. Single Configuration Item

   ![image-20190127225608553](/imgs/dev/configcenter_zk_singleitem.jpg)
   
   Setting graceful shutdown event to 15000:
   - Namespace: dubbo
   - Group: dubbo
   - Key: dubbo.service.shutdown.wait
   - Value: 15000
     
3. Service Governance Rules

    ![image-20190127225608553](/imgs/dev/configcenter_zk_rule.jpg)
    
    The above figure shows an application-level conditional routing rule:
    
    - Namespace: dubbo
    - Group: dubbo
    - Key: governance-conditionrouter-consumer.condition-router, where governance-conditionrouter-consumer is the application name, and condition-router represents conditional routing.
    
    
    > Note:
    >
    > Dubbo supports two granularities of service governance rules: application and service. The key value rules for these two granularities are as follows:
    > * Application granularity {application name + rule suffix}. For example: `demo-application.configurators`, `demo-application.tag-router`, etc.
    > * Service granularity {service interface name:[service version]:[service group] + rule suffix}, where service version and service group are optional. If configured, they will be reflected in the key; if not, ":" will be used as a placeholder. For example, `org.apache.dubbo.demo.DemoService::.configurators`, `org.apache.dubbo.demo.DemoService:1.0.0:group1.configurators`.

### Etcd & Consul

Etcd and Consul are essentially similar to Zookeeper in terms of tree-like storage structures. For implementation, please refer to Zookeeper.

### Nacos

As a professional third-party configuration center, Nacos has a storage structure designed specifically for configuration centers, including built-in concepts such as namespace, group, dataid, etc. These concepts correspond one-to-one with those abstracted by the Dubbo framework.

The correspondence with the Zookeeper implementation is as follows:

![image-20190127225608553](/imgs/dev/configcenter_nacos_model.jpg)

Refer to the Zookeeper implementation description mentioned above. The dataid here could be:
* Externalized configuration center: dubbo.properties
* Single configuration item: dubbo.service.shutdown.wait
* Service governance rule: org.apache.dubbo.demo.DemoService:1.0.0:group1.configurators

### Apollo

Apollo is similar to Nacos; please refer to the Apollo section in the dynamic configuration center usage documentation.

