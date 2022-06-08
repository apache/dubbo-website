---
title: dubbogo 3.0  启动时检查
keywords: dubbogo 3.0 启动时检查
description: dubbogo 3.0 启动时检查
---

# 启动时检查

在启动时检查依赖的服务是否可用

Dubbo-go 缺省会在启动时检查依赖的服务是否可用，不可用时会抛出异常，阻止应用初始化完成，以便上线时，能及早发现问题，默认 check="true"，并等待3s。

可以通过 check="false" 关闭检查，比如，测试时，有些服务不关心，或者出现了循环依赖，必须有一方先启动。

关闭 check 后，请注意 provider数量比较多时， consumer 订阅 provider 生成服务字典可能会有一定延迟，如果 consumer 一启动就对外提供服务，
可能会造成"冷启动"。所以在这个时候，请对服务进行预热。

示例：

```yaml
dubbo:
  consumer:
    check : false
    reference: 
      myserivce:
       check: true 
```


