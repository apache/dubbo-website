# Install admin console

The current version of dubbo admin is under development, including: route rule, dynamic configuration, access control, weight adjustment, load balance, etc.

Install:

```sh
git clone https://github.com/apache/incubator-dubbo-ops.git /var/tmp/dubbo-ops
cd /var/tmp/dubbo-ops
mvn clean package
```

Configuration [^1]:

```sh
configuration file：
dubbo-admin-backend/src/main/resources/application.properties
dubbo-admin-backend/src/main/resources/application-develop.properties
dubbo-admin-backend/src/main/resources/application-production.properties
configurations：
dubbo.registry.address=zookeeper://127.0.0.1:2181
dubbo.admin.root.password=root
dubbo.admin.guest.password=guest
```

Start:

```sh
mvn --projects dubbo-admin-backend spring-boot:run
```

For more information, please visit:

```sh
https://github.com/apache/incubator-dubbo-ops
```

Visit [^2]:

```
http://127.0.0.1:8080
```

[^1]: There's no login for current version, will be added later