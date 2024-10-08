---
title: "How to Use Seata to Ensure Consistency Between Dubbo Microservices"
linkTitle: "How to Use Seata to Ensure Consistency Between Dubbo Microservices"
date: 2019-01-17
tags: ["Ecosystem", "Java"]
description: >
    This article mainly introduces how to use Seata to ensure consistency between Dubbo microservices
---

## Case

The user purchases product business, which consists of 3 microservices:

- Inventory Service: Deducts the inventory quantity of the given product.
- Order Service: Generates an order based on the purchase request.
- Account Service: Deducts from the user's account balance.

### Business Structure Diagram

![Architecture](/imgs/blog/fescar/fescar-1.png) 

### StorageService

```java
public interface StorageService {

    /**
     * Deduct storage quantity
     */
    void deduct(String commodityCode, int count);
}
```

### OrderService

```java
public interface OrderService {

    /**
     * Create order
     */
    Order create(String userId, String commodityCode, int orderCount);
}
```

### AccountService

```java
public interface AccountService {

    /**
     * Debit from user account
     */
    void debit(String userId, int money);
}
```

### Main Business Logic:

```java
public class BusinessServiceImpl implements BusinessService {

    private StorageService storageService;

    private OrderService orderService;

    /**
     * Purchase
     */
    public void purchase(String userId, String commodityCode, int orderCount) {

        storageService.deduct(commodityCode, orderCount);

        orderService.create(userId, commodityCode, orderCount);
    }
}
```

```java
public class StorageServiceImpl implements StorageService {

  private StorageDAO storageDAO;
  
    @Override
    public void deduct(String commodityCode, int count) {
        Storage storage = new Storage();
        storage.setCount(count);
        storage.setCommodityCode(commodityCode);
        storageDAO.update(storage);
    }
}
```

```java
public class OrderServiceImpl implements OrderService {

    private OrderDAO orderDAO;

    private AccountService accountService;

    public Order create(String userId, String commodityCode, int orderCount) {

        int orderMoney = calculate(commodityCode, orderCount);

        accountService.debit(userId, orderMoney);

        Order order = new Order();
        order.userId = userId;
        order.commodityCode = commodityCode;
        order.count = orderCount;
        order.money = orderMoney;

        return orderDAO.insert(order);
    }
}
```

## Seata Distributed Transaction Solution

![undefined](/imgs/blog/fescar/fescar-2.png) 

Here, you only need to add a single annotation `@GlobalTransactional` on the method of the business initiator: 

```java

    @GlobalTransactional
    public void purchase(String userId, String commodityCode, int orderCount) {
        ......
    }
```

## Example of Combining Dubbo and Seata

### Step 1: Install Database

- Requirement: MySQL (InnoDB storage engine).

**Tip:** In fact, the 3 microservices in the example require 3 independent databases, but for convenience, we use the same physical database and configure 3 logical connection strings. 

Change the database url, username, and password in the following xml files

dubbo-account-service.xml
dubbo-order-service.xml
dubbo-storage-service.xml

```xml
    <property name="url" value="jdbc:mysql://x.x.x.x:3306/xxx" />
    <property name="username" value="xxx" />
    <property name="password" value="xxx" />
```

### Step 2: Create undo_log Table for Seata

`UNDO_LOG` This table is used for Seata's AT mode.

```sql
-- Note that when Seata version is upgraded to 0.3.0+, it will change from a normal index to a unique index.
CREATE TABLE `undo_log` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `branch_id` bigint(20) NOT NULL,
  `xid` varchar(100) NOT NULL,
  `context` varchar(128) NOT NULL,
  `rollback_info` longblob NOT NULL,
  `log_status` int(11) NOT NULL,
  `log_created` datetime NOT NULL,
  `log_modified` datetime NOT NULL,
  `ext` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_undo_log` (`xid`,`branch_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
```

### Step 3: Create Related Business Tables

```sql

DROP TABLE IF EXISTS `storage_tbl`;
CREATE TABLE `storage_tbl` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `commodity_code` varchar(255) DEFAULT NULL,
  `count` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY (`commodity_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `order_tbl`;
CREATE TABLE `order_tbl` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) DEFAULT NULL,
  `commodity_code` varchar(255) DEFAULT NULL,
  `count` int(11) DEFAULT 0,
  `money` int(11) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `account_tbl`;
CREATE TABLE `account_tbl` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) DEFAULT NULL,
  `money` int(11) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

### Step 4: Start Seata-Server Service

- Download [server package](https://github.com/seata/seata/releases) and decompress it.

```shell
Usage: sh seata-server.sh(for linux and mac) or cmd seata-server.bat(for windows) [options]
  Options:
    --host, -h
      The host to bind.
      Default: 0.0.0.0
    --port, -p
      The port to listen.
      Default: 8091
    --storeMode, -m
      log store mode : file, db
      Default: file
    --help

e.g.

sh seata-server.sh -p 8091 -h 127.0.0.1 -m file
```

### Step 5: Run the Example

- Start the Account Service ([DubboAccountServiceStarter](https://github.com/apache/dubbo-samples/tree/c6a704900501289973b174670beb788eceee5cc4/99-integration/dubbo-samples-transaction/src/main/java/org/apache/dubbo/samples/starter/DubboAccountServiceStarter.java)).
- Start the Inventory Service ([DubboStorageServiceStarter](https://github.com/apache/dubbo-samples/tree/c6a704900501289973b174670beb788eceee5cc4/99-integration/dubbo-samples-transaction/src/main/java/org/apache/dubbo/samples/starter/DubboStorageServiceStarter.java)).
- Start the Order Service ([DubboOrderServiceStarter](https://github.com/apache/dubbo-samples/tree/c6a704900501289973b174670beb788eceee5cc4/99-integration/dubbo-samples-transaction/src/main/java/org/apache/dubbo/samples/starter/DubboOrderServiceStarter.java)).
- Run the BusinessService entry ([DubboBusinessTester](https://github.com/apache/dubbo-samples/tree/c6a704900501289973b174670beb788eceee5cc4/99-integration/dubbo-samples-transaction/src/main/java/org/apache/dubbo/samples/starter/DubboBusinessTester.java)).

### Related Projects
* Seata:          https://github.com/seata/seata
* Seata Samples : https://github.com/seata/seata-samples

