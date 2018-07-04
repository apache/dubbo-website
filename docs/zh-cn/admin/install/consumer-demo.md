
# 示例消费者安装

安装:

```sh
git clone https://github.com/apache/incubator-dubbo.git
cd incubator-dubbo
运行 dubbo-demo-consumer中的com.alibaba.dubbo.demo.consumer.Consumer
请确保先启动Provider
如果使用Intellij Idea 请加上-Djava.net.preferIPv4Stack=true
```

配置:

```sh
resource/META-INFO.spring/dubbo-demo-consumer.xml
修改其中的dubbo:registery，替换成Provider提供的注册中心地址
```

