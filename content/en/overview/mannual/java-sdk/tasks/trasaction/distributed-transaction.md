---
aliases:
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/service/distributed-transaction/
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/service/distributed-transaction/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/service/distributed-transaction/
description: "Use Seata to solve the data consistency problem of Dubbo services, supporting distributed transactions."
linkTitle: Use Seata to enable distributed transactions in Dubbo
title: Support Distributed Transactions with Seata
type: docs
weight: 42
---
This example demonstrates how to implement Dubbo distributed transaction functionality using Apache Seata to ensure data consistency.

Apache Seata is an open-source distributed transaction solution that aims to provide high-performance and easy-to-use distributed transaction services under microservices architecture. Integrating Seata with Dubbo to achieve distributed transactions is very convenient, requiring just a few simple steps. This article will guide you through a quick experience with an example; the overall architecture diagram is as follows:

![seata-flow](/imgs/docs3-v2/java-sdk/seata/flow.png)

Before starting, please complete the following:

1. Download the example source code
	```shell
	git clone --depth=1 https://github.com/apache/dubbo-samples.git
	```

	Enter the example source directory:
	```shell
	cd dubbo-samples/2-advanced/dubbo-samples-seata
	```

2. Download the latest version of the [seata-server binary package](https://seata.apache.org/zh-cn/unversioned/download/seata-server) to your local.

## Step 1: Create the database and initialize related test data
- This article will use MySQL 5.7 (more supported databases can be viewed in the appendix at the end).
Go to the script directory of dubbo-samples-seata, find the two database script files dubbo_biz.sql and undo_log.sql, the content is as follows:

undo_log.sql is the `UNDO_LOG` table required for Seata AT mode
```sql
-- for AT mode you must to init this sql for you business database. the seata server not need it.
CREATE TABLE IF NOT EXISTS `undo_log`
(
    `branch_id`     BIGINT       NOT NULL COMMENT 'branch transaction id',
    `xid`           VARCHAR(128) NOT NULL COMMENT 'global transaction id',
    `context`       VARCHAR(128) NOT NULL COMMENT 'undo_log context,such as serialization',
    `rollback_info` LONGBLOB     NOT NULL COMMENT 'rollback info',
    `log_status`    INT(11)      NOT NULL COMMENT '0:normal status,1:defense status',
    `log_created`   DATETIME(6)  NOT NULL COMMENT 'create datetime',
    `log_modified`  DATETIME(6)  NOT NULL COMMENT 'modify datetime',
    UNIQUE KEY `ux_undo_log` (`xid`, `branch_id`)
    ) ENGINE = InnoDB AUTO_INCREMENT = 1 DEFAULT CHARSET = utf8mb4 COMMENT ='AT transaction mode undo table';
ALTER TABLE `undo_log` ADD INDEX `ix_log_created` (`log_created`);

```
dubbo_biz.sql is the example business tables and initialization data

```sql
DROP TABLE IF EXISTS `stock_tbl`;
CREATE TABLE `stock_tbl`
(
    `id`             int(11) NOT NULL AUTO_INCREMENT,
    `commodity_code` varchar(255) DEFAULT NULL,
    `count`          int(11) DEFAULT 0,
    PRIMARY KEY (`id`),
    UNIQUE KEY (`commodity_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `order_tbl`;
CREATE TABLE `order_tbl`
(
    `id`             int(11) NOT NULL AUTO_INCREMENT,
    `user_id`        varchar(255) DEFAULT NULL,
    `commodity_code` varchar(255) DEFAULT NULL,
    `count`          int(11) DEFAULT 0,
    `money`          int(11) DEFAULT 0,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `account_tbl`;
CREATE TABLE `account_tbl`
(
    `id`      int(11) NOT NULL AUTO_INCREMENT,
    `user_id` varchar(255) DEFAULT NULL,
    `money`   int(11) DEFAULT 0,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

---INITIALIZE THE ACCOUNT TABLE
INSERT INTO account_tbl(`user_id`,`money`) VALUES('ACC_001','1000');
---INITIALIZE THE STOCK TABLE
INSERT INTO stock_tbl(`commodity_code`,`count`) VALUES('STOCK_001','100');

```
### Please perform the following operations in order:
* 1.1 Create the seata database (in a real business scenario, different databases will be used; this article creates only one database for demonstration convenience, and all tables are created in this database).
* 1.2 Execute the scripts in undo_log.sql to create the undo_log table required for AT mode.
* 1.3 Execute the scripts in dubbo_biz.sql to create the example business tables and initialize test data.

## Step 2: Update the database connection information in the spring-boot application configuration

Please update the database connection information for the following 3 sub-modules with your information; other configurations do not need to be changed. At this point, the client configuration is complete.

* dubbo-samples-seata-account
* dubbo-samples-seata-order
* dubbo-samples-seata-stock
```yaml
url: jdbc:mysql://127.0.0.1:3306/seata?serverTimezone=Asia/Shanghai&useSSL=false&useUnicode=true&characterEncoding=utf8&zeroDateTimeBehavior=convertToNull&useOldAliasMetadataBehavior=true
username: root
password: 123456
```

## Step 3: Start Seata-Server
- This article uses Seata-Server version 2.0.0.

Please unzip the downloaded Seata-Server binary package, enter the bin directory, and then execute the following command to start Seata-Server.

If you are using Mac OS or Linux, please execute:
```
./seata-server.sh
```
Or if you are using Windows, please execute:
```
./seata-server.bat
```

## Step 4: Start the Example

Everything is ready; start the example.

### Please start the following sub-projects in order:
* 4.1 Account Service
* 4.2 Order Service
* 4.3 Stock Service
* 4.4 Business Service

## Step 5: View the results of the distributed transaction execution
By accessing the following link, you can test the successful submission flow of the distributed transaction:

http://127.0.0.1:9999/test/commit?userId=ACC_001&commodityCode=STOCK_001&orderCount=1

**When the distributed transaction is successfully submitted, the data in the business table will be updated normally; please pay attention to observe the data in the database table.**

By accessing the following link, you can test the failed rollback process of the distributed transaction:

http://127.0.0.1:9999/test/rollback?userId=ACC_001&commodityCode=STOCK_001&orderCount=1

**When the distributed transaction fails to roll back, there will be no changes in the data of the business table; please pay attention to observe the data in the database table.**

## Appendix
* Supported transaction modes: Seata currently supports AT, TCC, SAGA, XA, and more; for details, please visit [Seata official website](https://seata.apache.org/zh-cn/docs/user/mode/at).
* Supported configuration centers: Seata supports various configuration centers such as zookeeper, nacos, consul, apollo, etcd, file (this article uses this configuration center for easy demonstration without third-party dependencies); for details, please visit [Seata configuration center](https://seata.apache.org/zh-cn/docs/user/configuration/).
* Supported registry centers: Seata supports various registry centers such as eureka, sofa, redis, zookeeper, nacos, consul, etcd, file (this article uses this registry center for easy demonstration without third-party dependencies); for details, please visit [Seata registry center](https://seata.apache.org/zh-cn/docs/user/registry/).
* Supported deployment methods: direct deployment, Docker, K8S, Helm, etc.; for details, please visit [Seata deployment methods](https://seata.apache.org/zh-cn/docs/ops/deploy-guide-beginner).
* Supported APIs: Seata's APIs are divided into two categories: High-Level API and Low-Level API; for details, please visit [Seata API](https://seata.apache.org/zh-cn/docs/user/api).
* Supported databases: Seata supports MySQL, Oracle, PostgreSQL, TiDB, MariaDB, etc.; different transaction modes may have differences; for details, please visit [Seata supported databases](https://seata.apache.org/zh-cn/docs/user/datasource).
* Supported ORM frameworks: Although Seata is a component for ensuring data consistency, it does not have special requirements for ORM frameworks; mainstream frameworks such as Mybatis, Mybatis-Plus, Spring Data JPA, Hibernate, etc., are all supported. This is because ORM frameworks are located above the JDBC structure, while Seata's AT and XA transaction modes intercept and enhance the operations on the JDBC standard interface. For more details, please visit [Seata supported ORM frameworks](https://seata.apache.org/zh-cn/docs/user/ormframework).
* Supported microservice frameworks: Seata currently supports Dubbo, gRPC, hsf, http, motan, sofa, etc. Additionally, Seata provides a rich extension mechanism and can theoretically support any microservice framework. For more details, please visit [Seata supported microservice frameworks](https://seata.apache.org/zh-cn/docs/user/microservice).
* SQL limitations: Seata transactions currently support some functionalities of INSERT, UPDATE, DELETE DML statements; these have been validated by the Seata open-source community. The scope of SQL support is continually expanding; it is recommended to use within the limits specified in this article. For more details, please visit [Seata SQL limitations](https://seata.apache.org/zh-cn/docs/user/sqlreference/sql-restrictions).

