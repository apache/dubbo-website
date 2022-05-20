---
type: docs
title: "Netty4 支持"
linkTitle: "Netty4"
weight: 44
description: "在 Dubbo 中配置 Netty4"
---

Dubbo 2.5.6 版本新增了对 netty4 通信模块的支持，启用方式如下

provider 端：
```xml
<dubbo:protocol server="netty4" />
```

或

```xml
<dubbo:provider server="netty4" />
```

consumer 端：
```xml
<dubbo:consumer client="netty4" />

```

{{% alert title="注意" color="warning" %}}
1. provider 端如需不同的协议使用不同的通信层框架，请配置多个 protocol 分别设置
2. consumer 端请使用如下形式：

```xml
<dubbo:consumer client="netty">
  <dubbo:reference />
</dubbo:consumer>
```

```xml
<dubbo:consumer client="netty4">
  <dubbo:reference />
</dubbo:consumer>
```

接下来我们会继续完善： 性能测试指标及与 netty3 版本的性能测试对比，我们会提供一份参考数据  
{{% /alert %}}

