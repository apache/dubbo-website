---
aliases:
    - /zh/overview/tasks/ecosystem/transaction/
    - /zh-cn/overview/what/ecosystem/transaction/seata/
description: 本示例演示如何通过 Seata 实现分布式 Dubbo 服务的事务管理，保证数据一致性。
linkTitle: 事务管理
title: 事务管理
type: docs
weight: 1
---

## Seata 是什么
Seata 是一款开源的分布式事务解决方案，致力于提供高性能和简单易用的分布式事务服务。Seata 将为用户提供了 AT、TCC、SAGA 和 XA 事务模式，为用户打造一站式的分布式解决方案。

## 一、示例架构说明
可在此查看本示例完整代码地址：<a href="https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-seata" target="_blank">dubbo-samples-seata</a>

用户采购商品业务，整个业务包含3个微服务:

- 库存服务: 扣减给定商品的库存数量。
- 订单服务: 根据采购请求生成订单。
- 账户服务: 用户账户金额扣减。

![image.png](/imgs/docs3-v2/java-sdk/seata/transaction-1.png)

### StorageService

```java
public interface StorageService {

    /**
     * 扣除存储数量
     */
    void deduct(String commodityCode, int count);
}
```

### OrderService

```java
public interface OrderService {

    /**
     * 创建订单
     */
    Order create(String userId, String commodityCode, int orderCount);
}
```

### AccountService

```java
public interface AccountService {

    /**
     * 从用户账户中借出
     */
    void debit(String userId, int money);
}
```

## 二、主要的业务逻辑

### BusinessService

```java
public class BusinessServiceImpl implements BusinessService {

    private StorageService storageService;

    private OrderService orderService;

    /**
     * 采购
     */
    public void purchase(String userId, String commodityCode, int orderCount) {
        // 扣除存储数量
        storageService.deduct(commodityCode, orderCount);
        // 创建订单
        orderService.create(userId, commodityCode, orderCount);
    }
}
```

### StorageService

```java
public class StorageServiceImpl implements StorageService {

    private JdbcTemplate jdbcTemplate;
  
    @Override
    public void deduct(String commodityCode, int count) {
        // 修改数据库：扣减存储数量
        jdbcTemplate.update("update storage_tbl set count = count - ? where commodity_code = ?",
                new Object[]{count, commodityCode});
    }
}
```

### OrderService

```java
public class OrderServiceImpl implements OrderService {

    private AccountService accountService;
    
    private JdbcTemplate jdbcTemplate;

    public Order create(String userId, String commodityCode, int orderCount) {
        // 计算金额
        int orderMoney = calculate(commodityCode, orderCount);

        // 用户账户中扣减金额
        accountService.debit(userId, orderMoney);

        // 修改数据库：新建订单
        final Order order = new Order();
        order.userId = userId;
        order.commodityCode = commodityCode;
        order.count = orderCount;
        order.money = orderMoney;
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(con -> {
            PreparedStatement pst = con.prepareStatement(
                    "insert into order_tbl (user_id, commodity_code, count, money) values (?, ?, ?, ?)",
                    PreparedStatement.RETURN_GENERATED_KEYS);
            pst.setObject(1, order.userId);
            pst.setObject(2, order.commodityCode);
            pst.setObject(3, order.count);
            pst.setObject(4, order.money);
            return pst;
        }, keyHolder);
        order.id = keyHolder.getKey().longValue();
        return order;
    }
}
```

### AccountService


```java
public class AccountServiceImpl implements AccountService {
        
    private JdbcTemplate jdbcTemplate;
    
    @Override
    public void debit(String userId, int money) {  
        // 修改数据库：用户账户中扣减金额      
        jdbcTemplate.update("update account_tbl set money = money - ? where user_id = ?", new Object[]{money, userId});
    }
}
```

## 三、快速启动示例

### Step 1: 下载源码

```shell script
git clone -b master https://github.com/apache/dubbo-samples.git
cd ./dubbo-samples-transaction/
```

### Step 2: 通过 docker-compose 启动 Seata-Server 和 MySQL 等

在此示例中，我们使用 docker-compose 快速拉起 seata-server 和 mysql 等服务。

```bash
cd src/main/resources/docker
docker-compose up
```

### Step 3: 构建用例

执行 maven 命令，打包 demo 工程

```bash
mvn clean package
```

### Step 4: 启动 AccountService

```java
java -classpath ./target/dubbo-samples-transaction-1.0-SNAPSHOT.jar org.apache.dubbo.samples.starter.DubboAccountServiceStarter
```

### Step 5: 启动 OrderService

```java
java -classpath ./target/dubbo-samples-transaction-1.0-SNAPSHOT.jar org.apache.dubbo.samples.starter.DubboOrderServiceStarter
```
### Step 6: 启动 StorageService

```java
java -classpath ./target/dubbo-samples-transaction-1.0-SNAPSHOT.jar org.apache.dubbo.samples.starter.DubboStorageServiceStarter
```

### Step 7: 启动 BusinessService
```java
java -classpath ./target/dubbo-samples-transaction-1.0-SNAPSHOT.jar org.apache.dubbo.samples.starter.DubboBusinessTester
```

## 四、示例核心流程

![image.png](/imgs/docs3-v2/java-sdk/seata/transaction-2.png)

### Step 1: 修改业务代码
此处仅仅需要一行注解 `@GlobalTransactional` 写在业务发起方的方法上:

```java
    @GlobalTransactional
    public void purchase(String userId, String commodityCode, int orderCount) {
        ......
    }
```

### Step 2: 安装数据库

- 要求: MySQL (InnoDB 存储引擎)。

**提示:** 事实上例子中3个微服务需要3个独立的数据库，但为了方便我们使用同一物理库并配置3个逻辑连接串。

更改以下xml文件中的数据库url、username和password

dubbo-account-service.xml
dubbo-order-service.xml
dubbo-storage-service.xml

```xml
    <property name="url" value="jdbc:mysql://x.x.x.x:3306/xxx" />
    <property name="username" value="xxx" />
    <property name="password" value="xxx" />
```

### Step 3: 为 Seata 创建 undo_log 表

`UNDO_LOG` 此表用于 Seata 的AT模式。

```sql
-- 注意当 Seata 版本升级至 0.3.0+ 将由之前的普通索引变更为唯一索引。
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

### Step 4: 创建相关业务表

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

### Step 5: 启动 Seata-Server 服务

- 下载[服务器软件包](https://github.com/seata/seata/releases)，将其解压缩。

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
      log store mode : file、db
      Default: file
    --help

e.g.

sh seata-server.sh -p 8091 -h 127.0.0.1 -m file
```