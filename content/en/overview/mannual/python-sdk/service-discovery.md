---
aliases:
    - /en/docs3-v2/python-sdk/service-discovery/
description: Service Discovery
linkTitle: Service Discovery
title: Service Discovery
type: docs
weight: 4
---

See the full [example here](https://github.com/apache/dubbo-python/tree/main/samples/registry)

Using service registration and discovery is very simple. In fact, it only requires two additional lines of code compared to point-to-point calls. Before using this feature, we need to install the relevant registry client. Currently, Dubbo-python only supports `Zookeeper`, so the following demonstration will use `Zookeeper`.

Similar to before, we need to clone the Dubbo-python source code and install it. However, in this case, we also need to install the `Zookeeper` client. The commands are:

```shell
git clone https://github.com/apache/dubbo-python.git
cd dubbo-python && pip install .[zookeeper]
```

After that, simply start `Zookeeper` and insert the following code into your existing example:

```python
# Configure the Zookeeper registry
registry_config = RegistryConfig.from_url("zookeeper://127.0.0.1:2181")
bootstrap = Dubbo(registry_config=registry_config)

# Create the client
client = bootstrap.create_client(reference_config)

# Create and start the server
bootstrap.create_server(service_config).start()
```

This enables service registration and discovery within your Dubbo-python project.
