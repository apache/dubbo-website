---
type: docs
title: "Install Admin Console"
linkTitle: "Admin Console"
weight: 1
---

The current version of dubbo admin is under development, including: route rule, dynamic configuration, access control, weight adjustment, load balance, etc.

Install:

```sh
git clone https://github.com/apache/dubbo-admin.git /var/tmp/dubbo-admin
cd /var/tmp/dubbo-admin
mvn clean package
```

Configuration [^1]:

```sh
configuration file：
dubbo-admin-backend/src/main/resources/application.properties
configurations：
dubbo.registry.address=zookeeper://127.0.0.1:2181
```

Start:

```sh
mvn --projects dubbo-admin-backend spring-boot:run
```

For more information, please visit:

```sh
https://github.com/apache/dubbo-admin
```

Visit [^2]:

```
http://127.0.0.1:8080
```

[^1]: There's no login for current version, will be added later
