# Install demo provider

install:

```sh
$ git clone https://github.com/apache/dubbo.git
$ cd dubbo/dubbo-demo/dubbo-demo-xml
# run org.apache.dubbo.demo.provider.Application under dubbo-demo-xml-provider module
# add -Djava.net.preferIPv4Stack=true if your IDE is Intellij Idea
```

configuration:

```sh
# resources/spring/dubbo-provider.xml
# change dubbo:registry to a real registry server address, zookeeper is recommended, for example:
# <dubbo:registry address="zookeeper://127.0.0.1:2181"/>
```
