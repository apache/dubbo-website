> ![warning](../sources/images/check.gif)管理控制台为内部裁剪版本，开源部分主要包含：路由规则，动态配置，服务降级，访问控制，权重调整，负载均衡，等管理功能。

* 安装:

```shell
wget http://apache.etoak.com/tomcat/tomcat-6/v6.0.35/bin/apache-tomcat-6.0.35.tar.gz
tar zxvf apache-tomcat-6.0.35.tar.gz
cd apache-tomcat-6.0.35
rm -rf webapps/ROOT
wget http://code.alibabatech.com/mvn/releases/com/alibaba/dubbo-admin/2.4.1/dubbo-admin-2.4.1.war
unzip dubbo-admin-2.4.1.war -d webapps/ROOT
```

* 配置: (或将dubbo.properties放在当前用户目录下)

```shell
vi webapps/ROOT/WEB-INF/dubbo.properties
dubbo.properties
dubbo.registry.address=zookeeper://127.0.0.1:2181
dubbo.admin.root.password=root
dubbo.admin.guest.password=guest
```

* 启动:

```shell
./bin/startup.sh
```

* 停止:

```shell
./bin/shutdown.sh
```

* 访问: (用户:root,密码:root 或 用户:guest,密码:guest)

```
http://127.0.0.1:8080/
```