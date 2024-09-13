---
aliases:
    - /zh/overview/tasks/extensibility/registry/
    - /zh-cn/overview/tasks/extensibility/registry/
description: 本文讲解如何通过扩展 `org.apache.dubbo.registry.client.ServiceDiscovery` SPI，提供自定义的注册中心实现。
linkTitle: Registry
no_list: true
title: Registry
type: docs
weight: 3
---

在 [服务发现](/zh-cn/overview/mannual/java-sdk/tasks/protocols/) 一章中，我们了解了 Dubbo 内置的几个核心注册中心实现 `Nacos`、`Zookeeper` 的使用方式与工作原理。本文讲解如何通过扩展 `org.apache.dubbo.registry.client.ServiceDiscovery` 和 `org.apache.dubbo.registry.nacos.NacosServiceDiscoveryFactory` SPI，提供自定义的注册中心实现。

本示例的完整源码请参见 [dubbo-registry-etcd](https://github.com/apache/dubbo-spi-extensions/tree/3.2.0/dubbo-registry-extensions/dubbo-registry-etcd3)。除了本示例之外，Dubbo 核心仓库 apache/dubbo 以及扩展库 apache/dubbo-spi-extensions 中的众多注册中心扩展实现，都可以作为扩展参考实现：

```properties
# Dubbo对外支持的常用注册中心实现
nacos=org.apache.dubbo.registry.nacos.NacosServiceDiscoveryFactory
zookeeper=org.apache.dubbo.registry.zookeeper.ZookeeperServiceDiscoveryFactory
```

## 任务详情
通过扩展 SPI 实现基于的 etcd 注册中心。

## 实现方式

#### 代码详情
首先，通过继承 `AbstractServiceDiscoveryFactory` 实现 `ServiceDiscoveryFactory` 接口

```java
public class EtcdServiceDiscoveryFactory extends AbstractServiceDiscoveryFactory {

    @Override
    protected ServiceDiscovery createDiscovery(URL registryURL) {
        return new EtcdServiceDiscovery(applicationModel, registryURL);
    }

}
```

`EtcdServiceDiscovery` 的一些关键方法与实现如下：

```java
public class EtcdServiceDiscovery extends AbstractServiceDiscovery {

    private final Set<String> services = new ConcurrentHashSet<>();
    private final Map<String, InstanceChildListener> childListenerMap = new ConcurrentHashMap<>();

    EtcdClient etcdClient;

    public EtcdServiceDiscovery(ApplicationModel applicationModel, URL registryURL) {
        super(applicationModel, registryURL);
        EtcdTransporter etcdTransporter = applicationModel.getExtensionLoader(EtcdTransporter.class).getAdaptiveExtension();

        etcdClient = etcdTransporter.connect(registryURL);

        etcdClient.addStateListener(state -> {
            if (state == StateListener.CONNECTED) {
                try {
                    recover();
                } catch (Exception e) {
                    logger.error(e.getMessage(), e);
                }
            }
        });

        this.registryURL = registryURL;
    }

    @Override
    public void doRegister(ServiceInstance serviceInstance) {
        try {
            String path = toPath(serviceInstance);
            etcdClient.putEphemeral(path, new Gson().toJson(serviceInstance));
            services.add(serviceInstance.getServiceName());
        } catch (Throwable e) {
            throw new RpcException("Failed to register " + serviceInstance + " to etcd " + etcdClient.getUrl()
                + ", cause: " + (OptionUtil.isProtocolError(e)
                ? "etcd3 registry may not be supported yet or etcd3 registry is not available."
                : e.getMessage()), e);
        }
    }

    @Override
    protected void doUnregister(ServiceInstance serviceInstance) {
        try {
            String path = toPath(serviceInstance);
            etcdClient.delete(path);
            services.remove(serviceInstance.getServiceName());
        } catch (Throwable e) {
            throw new RpcException("Failed to unregister " + serviceInstance + " to etcd " + etcdClient.getUrl() + ", cause: " + e.getMessage(), e);
        }
    }

    @Override
    public void addServiceInstancesChangedListener(ServiceInstancesChangedListener listener) throws NullPointerException, IllegalArgumentException {
        for (String serviceName : listener.getServiceNames()) {
            registerServiceWatcher(serviceName, listener);
        }
    }

    @Override
    public List<ServiceInstance> getInstances(String serviceName) {
        List<String> children = etcdClient.getChildren(toParentPath(serviceName));
        if (CollectionUtils.isEmpty(children)) {
            return Collections.emptyList();
        }
        List<ServiceInstance> list = new ArrayList<>(children.size());
        for (String child : children) {
            ServiceInstance serviceInstance = new Gson().fromJson(etcdClient.getKVValue(child), DefaultServiceInstance.class);
            list.add(serviceInstance);
        }
        return list;
    }
}
```

#### SPI配置

在 `resources/META-INF/dubbo/org.apache.dubbo.registry.client.ServiceDiscoveryFactory` 文件中添加如下配置：

```properties
etcd=org.apache.dubbo.registry.etcd.EtcdServiceDiscoveryFactory
```

## 使用方式

要开启 etcd 作为注册中心，修改应用中的 `resources/application.properties` 文件中的 registry 配置如下：

```properties
dubbo.registry.address=etcd://host:port
```

