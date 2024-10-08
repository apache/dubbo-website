---
aliases:
    - /en/overview/tasks/extensibility/registry/
    - /en/overview/tasks/extensibility/registry/
description: This article explains how to provide a custom registry implementation by extending the `org.apache.dubbo.registry.client.ServiceDiscovery` SPI.
linkTitle: Registry
no_list: true
title: Registry
type: docs
weight: 3
---

In the [Service Discovery](/en/overview/mannual/java-sdk/tasks/protocols/) chapter, we learned about the usage and working principles of several core built-in registry implementations in Dubbo, such as `Nacos` and `Zookeeper`. This article explains how to provide a custom registry implementation by extending the `org.apache.dubbo.registry.client.ServiceDiscovery` and `org.apache.dubbo.registry.nacos.NacosServiceDiscoveryFactory` SPI.

For the complete source code of this example, please refer to [dubbo-registry-etcd](https://github.com/apache/dubbo-spi-extensions/tree/3.2.0/dubbo-registry-extensions/dubbo-registry-etcd3). In addition to this example, many registry extension implementations in the core repository apache/dubbo and the extension library apache/dubbo-spi-extensions can serve as references for extensions:

```properties
# Common registry implementations supported by Dubbo
nacos=org.apache.dubbo.registry.nacos.NacosServiceDiscoveryFactory
zookeeper=org.apache.dubbo.registry.zookeeper.ZookeeperServiceDiscoveryFactory
```

## Task Details
Implement the etcd registry based on extending SPI.

## Implementation Method

#### Code Details
First, implement the `ServiceDiscoveryFactory` interface by extending `AbstractServiceDiscoveryFactory`

```java
public class EtcdServiceDiscoveryFactory extends AbstractServiceDiscoveryFactory {

    @Override
    protected ServiceDiscovery createDiscovery(URL registryURL) {
        return new EtcdServiceDiscovery(applicationModel, registryURL);
    }

}
```

Some key methods and implementations of `EtcdServiceDiscovery` are as follows:

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

#### SPI Configuration

Add the following configuration in the `resources/META-INF/dubbo/org.apache.dubbo.registry.client.ServiceDiscoveryFactory` file:

```properties
etcd=org.apache.dubbo.registry.etcd.EtcdServiceDiscoveryFactory
```

## Usage

To enable etcd as the registry, modify the registry configuration in the `resources/application.properties` file as follows:

```properties
dubbo.registry.address=etcd://host:port
```

