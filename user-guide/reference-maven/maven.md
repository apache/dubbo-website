#### mvn dubbo:registry
以缺省的9090端口启动一个简易注册中心

样例：以指定的9099端口启动一个简易注册中心

```sh
mvn dubbo:registry -Dport=9099 
```

#### mvn dubbo:create
(尚未发布)

生成demo服务提供者应用

样例：生成指定接口和版本的服务提供者应用

```sh
mvn dubbo:create -Dapplication=xxx -Dpackage=com.alibaba.xxx -Dservice=XxxService,YyyService -Dversion=1.0.0 
```
