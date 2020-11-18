---
type: docs
title: "Dubbo Configuration Center Extensions"
linkTitle: "Config Center"
weight: 13
---

## Design Purpose

The key function of CC(Configuration Center) is to act as a Key-Value store. Dubbo Framework tells CC the key it care about, CC return the corresponding value.

Divided by application scenarios, CC mainly undertake the following responsibilities in Dubbo Framework:

- As a external configuration center, CC store configuration files like dubbo.properties, where the key is usually file name like dubbo.properties, and value is content of the file.
- Store single configuration items, like all kinds of switchs, contants, etc.
- Store service governance rules, where the key is usually formated like "ServiceName+RuleType", while value is the specific governance rule.

Dubbo CC also introduced concepts of `namespace` and `group` to better manage Key-Value pairs by group, those concepts are already built-in in many professional third-party configuration centers. In most cases, `namespace` is used to isolate different tetants, while `group` is used to divid the key set from one tetant into groups.

Dubbo CC has currently supported Zookeeper, Nacos, Etcd, Consul, Apollo, next we will see how Dubbo CC is mapped to a specific third-party implementation.

## Extension Interface

* `org.apache.dubbo.configcenter.DynamicConfigurationFactory`
* `org.apache.dubbo.configcenter.DynamicConfiguration`

## Existing Extension

* `org.apache.dubbo.configcenter.support.zookeeper.ZookeeperDynamicConfigurationFactory`
* `org.apache.dubbo.configcenter.support.nacos.NacosDynamicConfigurationFactory`
* `org.apache.dubbo.configcenter.support.etcd.EtcdDynamicConfigurationFactory`
* `org.apache.dubbo.configcenter.consul.ConsulDynamicConfigurationFactory`
* `org.apache.dubbo.configcenter.support.apollo.ApolloDynamicConfigurationFactory`
* `org.apache.dubbo.common.config.configcenter.file.FileSystemDynamicConfigurationFactory`

## Implementation

### Zookeeper

Zookeeper provided a tree-structure storage model, the implementation is as follows:

![image-20190127225608553](/imgs/dev/configcenter_zk_model.jpg)

namespace, group, key are corresponded to different levels of ZNodes, while value is content of the key ZNode.

1. External configuration cetner dubbo.properties

   ![image-20190127225608553](/imgs/dev/configcenter_zk_properties.jpg)
   
   The figure above shows the storage structure of the dubbo.properties file in two different scopes in zookeeper:
   - namespace: both are 'dubbo'
   - group: 'dubbo' is globally shared by all applications; 'demo-provider' is application level, only affect the specific application
   - key: dubbo.properties
   
2. Single configuration item

   ![image-20190127225608553](/imgs/dev/configcenter_zk_singleitem.jpg)
   
   The figure above shows how we set the shutdown wait time to 15000:
   - namespace: dubbo
   - group: dubbo
   - key: dubbo.service.shutdown.wait
   - value: 15000
     
3. Service governance rule

    ![image-20190127225608553](/imgs/dev/configcenter_zk_rule.jpg)
    
    The figure above shows an application-level conditional routing rule:
    
    - namespace：dubbo
    - group：dubbo
    - key：governance-conditionrouter-consumer.condition-router, in wich governance-conditionrouter-consumer is application name, condition-router represents condition router.
    
    
    > Notice:
    >
    > Dubbo support two level of governance rules: application, service. The key format are as follows:
    > * application level {application name + rule suffix}, such as: `demo-application.configurators`,`demo-application.tag-router`, etc.
    > * service level {service interface name:[version]:[group] + rule suffix}, in which version and group are optional, such as: `org.apache.dubbo.demo.DemoService::.configurators`,`org.apache.dubbo.demo.DemoService:1.0.0:group1.configurators`, etc.

### Etcd & Consul

Etcd and Consul are essencially tree-structure storage like Zookeeper, see zookeeper for implementation.

### Nacos

Nacos is a professional third-party configuration center, it has a storage structure designed specifically for the configuration center, including built-in concepts like namespace, group, dataid, etc. And these concepts basically correspond to the configuration center of the Dubbo framework abstraction.

The correspondence with the Zookeeper implementation is as follows：

![image-20190127225608553](/imgs/dev/configcenter_nacos_model.jpg)

Refer to the example described in the zookeeper implementation above, where dataid might be:
* External configuration center: dubbo.properties
* Single configuration item: dubbo.service.shutdown.wait
* Service governance rule: org.apache.dubbo.demo.DemoService:1.0.0:group1.configurators

### Apollo

Apollo is similar to Nacos. Please refer to the documentation on the Apollo section.
