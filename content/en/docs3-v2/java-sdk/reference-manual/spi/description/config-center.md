---
type: docs
title: "Configuration Center Extension"
linkTitle: "Configuration Center Extension"
weight: 13
---

## aim of design

The core function of the configuration center is as Key-Value storage. The Dubbo framework informs the configuration center of the key it cares about, and the configuration center returns the value corresponding to the key.

According to the application scenarios, the configuration center mainly undertakes the following responsibilities in the Dubbo framework:

- As an external configuration center, it stores the dubbo.properties configuration file. At this time, the key value is usually the file name such as dubbo.properties, and the value is the content of the configuration file.
- Store individual configuration items, such as various switch items, constant values, etc.
- Store service governance rules. At this time, the key is usually organized in the format of "service name + rule type", and the value is the specific governance rule.

In order to further realize the group management of key-value, Dubbo's configuration center also added the concepts of namespace and group. These concepts are reflected in many professional third-party configuration centers. Usually, namespace is used to isolate different tenants , group is used to group the key collection of the same tenant.

Currently, the Dubbo configuration center has realized the docking of Zookeeper, Nacos, Etcd, Consul, and Apollo. Next, let’s take a look at how Dubbo’s abstract configuration center is mapped to a specific third-party implementation.

## Extension ports

* `org.apache.dubbo.configcenter.DynamicConfigurationFactory`
* `org.apache.dubbo.configcenter.DynamicConfiguration`

## Known extensions

* `org.apache.dubbo.configcenter.support.zookeeper.ZookeeperDynamicConfigurationFactory`
* `org.apache.dubbo.configcenter.support.nacos.NacosDynamicConfigurationFactory`
* `org.apache.dubbo.configcenter.support.etcd.EtcdDynamicConfigurationFactory`
* `org.apache.dubbo.configcenter.consul.ConsulDynamicConfigurationFactory`
* `org.apache.dubbo.configcenter.support.apollo.ApolloDynamicConfigurationFactory`
* `org.apache.dubbo.common.config.configcenter.file.FileSystemDynamicConfigurationFactory`

## Implementation principle

### Zookeeper

zookeeper provides a tree-like storage model, the implementation principle is as follows:

![image-20190127225608553](/imgs/dev/configcenter_zk_model.jpg)

namespace, group, key, etc. correspond to different levels of ZNode nodes, and value is stored as the value of the root ZNode node.

1. External configuration center dubbo.properties

   ![image-20190127225608553](/imgs/dev/configcenter_zk_properties.jpg)

   The figure above shows the storage structure of dubbo.properties files in two different scopes in zookeeper:
   - Namespace namespace is: dubbo
   - Grouping group: the global level is dubbo, shared by all applications; the application level is the application name demo-provider, which only takes effect for this application
   - key: dubbo.properties

2. Single configuration item

   ![image-20190127225608553](/imgs/dev/configcenter_zk_singleitem.jpg)

   Set the graceful shutdown event to 15000:
   - Namespace namespace: dubbo
   - Grouping group: dubbo
   - key: dubbo.service.shutdown.wait
   - value: 15000

3. Service Governance Rules

   ![image-20190127225608553](/imgs/dev/configcenter_zk_rule.jpg)

   The figure above shows an application-level conditional routing rule:

   - Namespace namespace: dubbo
   - Grouping group: dubbo
   - key: governance-conditionrouter-consumer.condition-router, where governance-conditionrouter-consumer is the application name, and condition-router represents conditional routing


    > Note:
    >
    > Dubbo supports service governance rules at two granularities of application and service at the same time. For these two granularities, the key value rules are as follows:
    > * Application granularity {application name + rule suffix}. Such as: `demo-application.configurators`, `demo-application.tag-router`, etc.
    > * Service granularity {service interface name:[service version]:[service group] + rule suffix}, where service version and service group are optional, if they are configured, they will be reflected in the key, if they are not configured, use " :"Occupy place. Such as
    > `org.apache.dubbo.demo.DemoService::.configurators`, `org.apache.dubbo.demo.DemoService:1.0.0:group1.configurators`

### Etcd & Consul

Etcd and Consul are essentially a tree-like storage structure similar to zookeeper. For implementation, please refer to zookeeper.

### Nacos

As a professional third-party configuration center, Nacos has a storage structure specially designed for configuration centers, including built-in concepts such as namespace, group, and dataid. And these concepts are basically in one-to-one correspondence with the abstract configuration center of the Dubbo framework.

The corresponding relationship with Zookeeper implementation is as follows:

![image-20190127225608553](/imgs/dev/configcenter_nacos_model.jpg)

Referring to the example described above about the zookeeper implementation, the dataid here may be:
* External configuration center: dubbo.properties
* Single configuration item: dubbo.service.shutdown.wait
* Service governance rules: org.apache.dubbo.demo.DemoService:1.0.0:group1.configurators

### Apollo

Apollo is similar to Nacos, please refer to the description about Apollo in the Dynamic Configuration Center Documentation.