# 管理控制台安装

管理控制台为内部裁剪版本，开源部分主要包含：路由规则，动态配置，服务降级，访问控制，权重调整，负载均衡，等管理功能。

安装:

```sh
wget http://apache.etoak.com/tomcat/tomcat-6/v6.0.35/bin/apache-tomcat-6.0.35.tar.gz
tar zxvf apache-tomcat-6.0.35.tar.gz
cd apache-tomcat-6.0.35
rm -rf webapps/ROOT

git clone https://github.com/dubbo/dubbo-ops.git /var/tmp/dubbo-ops
pushd /var/tmp/dubbo-ops
mvn clean package
popd

unzip /var/tmp/dubbo-ops/dubbo-admin/target/dubbo-admin-2.0.0.war -d webapps/ROOT
```

配置 [^1]:

```sh
vi webapps/ROOT/WEB-INF/dubbo.properties
dubbo.properties
dubbo.registry.address=zookeeper://127.0.0.1:2181
dubbo.admin.root.password=root
dubbo.admin.guest.password=guest
```

启动:

```sh
./bin/startup.sh
```

停止:

```sh
./bin/shutdown.sh
```

访问 [^2]:

```
http://127.0.0.1:8080/
```

[^1]: 或将 `dubbo.properties` 放在当前用户目录下
[^2]: 用户: root, 密码: root 或者 用户: guest, 密码: guest