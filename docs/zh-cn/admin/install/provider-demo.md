# 示例提供者安装

安装：

```sh
git clone https://github.com/apache/incubator-dubbo.git
cd incubator-dubbo
运行 dubbo-demo-provider中的com.alibaba.dubbo.demo.provider.Provider
如果使用Intellij Idea 请加上-Djava.net.preferIPv4Stack=true
```

配置：

```sh
resource/META-INFO.spring/dubbo-demo-provider.xml
修改其中的dubbo:registery，替换成真实的注册中心地址，推荐使用zookeeper
```

