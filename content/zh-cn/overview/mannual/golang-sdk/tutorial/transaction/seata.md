---
description: "使用 Seata 分布式事务解决方案解决 Dubbo 数据一致性问题。"
title: Seata分布式事务
type: docs
weight: 1
---

1. 先执行以下命令，启动 seata-server。

   ```shell
   cd ../dockercompose
   docker-compose -f docker-compose.yml up -d seata-server
   ```

2. 再执行 triple/client/cmd 和 triple/server/cmd 目录下的 main()方法。


<a href="https://github.com/apache/dubbo-go-samples/tree/main/context" target="_blank">完整示例源码地址</a>