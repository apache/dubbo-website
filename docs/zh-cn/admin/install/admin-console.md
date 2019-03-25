### 管理控制台安装

目前版本的管理控制台正在开发中，已经完成了服务查询和服务治理的功能，采用前后端分离的模式，具体的安装和使用步骤如下：

安装:

```sh
git clone https://github.com/apache/incubator-dubbo-admin.git /var/tmp/dubbo-admin
cd /var/tmp/dubbo-admin
mvn clean package
```

配置 [^1]:

```sh
配置文件为：
dubbo-admin-backend/src/main/resources/application.properties
主要的配置有：
dubbo.registry.address=zookeeper://127.0.0.1:2181
```

启动:

```sh
mvn --projects dubbo-admin-backend spring-boot:run
```

其他配置请访问github中的文档:

```sh
https://github.com/apache/incubator-dubbo-admin
```

访问:

```
http://127.0.0.1:8080
```

[^1]: 当前版本中未实现登录功能，会在后续版本加上
