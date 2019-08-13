# 示例提供者安装

安装：

```sh
git clone https://github.com/apache/dubbo.git
cd dubbo
运行 dubbo-demo-provider中的org.apache.dubbo.demo.provider.Provider
如果使用Intellij Idea 请加上-Djava.net.preferIPv4Stack=true
```

配置：

```sh
resource/META-INFO.spring/dubbo-demo-provider.xml
修改其中的dubbo:registry，替换成真实的注册中心地址，推荐使用zookeeper
```

