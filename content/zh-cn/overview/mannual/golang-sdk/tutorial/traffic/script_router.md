---
description: 脚本路由
title: 脚本路由
type: docs
weight: 1
---

## 使用方法

### 前置准备

- Docker 以及 Docker compose 环境来部署Nacos配置中心。
- Nacos 2.x+
- Go 1.23+

#### 启动Nacos配置中心

参考这个教程来[启动Nacos](https://dubbo-next.staged.apache.org/zh-cn/overview/reference/integrations/nacos/)。

### Script router 介绍

Script router与condition router类似，都提供了使用表达式进行流量管控的功能。
但是Script router具有更强大的匹配功能，与此同时带来的是匹配消耗的资源更多，因此在生产环境中应当尽量少使用。

Script router的示例代码与Condition router类似，在nacos配置上略有差别，这里仅提供nacos上的简单配置。

```yaml
scope: "application"
key: "script-server"
enabled: true
type: "javascript"
script: |
  (function(invokers, invocation, context) {
    if (!invokers || invokers.length === 0) return [];
    return invokers.filter(function(invoker) {
      var url = invoker.GetURL();
      return url && url.Port === "20000";
    });
  })(invokers, invocation, context);
```

参数说明:

| 参数     | 说明                 |
|--------|--------------------|
| type   | script的类型，目前仅可使用js |
| script | script实际内容         |

完整示例请见: [本示例完整代码](https://github.com/apache/dubbo-go-samples/tree/main/router/script)。