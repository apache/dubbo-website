# Maven 插件参考手册

## 启动一个简易注册中心

以指定的9099端口启动一个简易注册中心 [^1]：

```sh
mvn dubbo:registry -Dport=9099 
```

## 生成demo服务提供者应用

生成指定接口和版本的服务提供者应用：

```sh
mvn dubbo:create -Dapplication=xxx -Dpackage=com.alibaba.xxx -Dservice=XxxService,YyyService -Dversion=1.0.0 
```

[^1]: 如果端口不指定，默认端口为 9090
