---
aliases:
    - /zh/docs3-v2/python-sdk/service-discovery/
    - /zh-cn/docs3-v2/python-sdk/service-discovery/
description: 服务发现
linkTitle: 服务发现
title: 服务发现
type: docs
weight: 4
---

在此查看完整[示例](https://github.com/apache/dubbo-python/tree/main/samples/registry)。

使用服务注册和发现非常简单。事实上，与点对点调用相比，它只需要增加两行代码。在使用该功能之前，我们需要安装相关的注册客户端。目前，Dubbo-python 只支持 Zookeeper，因此下面的演示将使用 Zookeeper。与之前类似，我们需要克隆 Dubbo-python 源代码并安装它。不过，在这种情况下，我们还需要安装 Zookeeper 客户端。命令如下：

```bash
git clone https://github.com/apache/dubbo-python.git
cd dubbo-python && pip install .[zookeeper]
```

而后，只需启动 `Zookeeper` 并在现有示例中插入以下代码即可：

```python
# Configure the Zookeeper registry
registry_config = RegistryConfig.from_url("zookeeper://127.0.0.1:2181")
bootstrap = Dubbo(registry_config=registry_config)

# Create the client
client = bootstrap.create_client(reference_config)

# Create and start the server
bootstrap.create_server(service_config).start()
```