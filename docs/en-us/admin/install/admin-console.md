# Install admin console

Include: route rule, dynamic configuration, service downgrade, access control, weight adjustment, load balance, etc.

Install:

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

Configuration [^1]:

```sh
vi webapps/ROOT/WEB-INF/dubbo.properties
dubbo.properties
dubbo.registry.address=zookeeper://127.0.0.1:2181
dubbo.admin.root.password=root
dubbo.admin.guest.password=guest
```

Start:

```sh
./bin/startup.sh
```

Stop:

```sh
./bin/shutdown.sh
```

Visit [^2]:

```
http://127.0.0.1:8080/
```

[^1]: Or put `dubbo.properties` in current user directory
[^2]: User: root, password: root or user: guest, password: guest
