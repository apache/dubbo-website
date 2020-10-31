
# Install demo consumer

Install:

```sh
$ git clone https://github.com/apache/dubbo.git
$ cd dubbo/dubbo-demo/dubbo-demo-xml
# run org.apache.dubbo.demo.consumer.Application under dubbo-demo-xml-consumer module
# please start Provider first
# add -Djava.net.preferIPv4Stack=true if your IDE is Intellij Idea
```

Configuration:

```sh
# resources/spring/dubbo-consumer.xml
# change dubbo:registry to the real registry center address, for example:
# <dubbo:registry address="zookeeper://127.0.0.1:2181"/>
```
