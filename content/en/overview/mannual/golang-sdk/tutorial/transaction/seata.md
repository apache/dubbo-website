---
description: "Use Seata distributed transaction solution to solve Dubbo data consistency issues."
title: Seata Distributed Transactions
type: docs
weight: 1
---

1. First, execute the following command to start the seata-server.

   ```shell
   cd ../dockercompose
   docker-compose -f docker-compose.yml up -d seata-server
   ```

2. Then, execute the main() method in the triple/client/cmd and triple/server/cmd directories.


<a href="https://github.com/apache/dubbo-go-samples/tree/main/context" target="_blank">Complete example source code address</a>
