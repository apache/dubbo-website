# install demo provider

install:

```sh
git clone https://github.com/apache/incubator-dubbo.git
cd incubator-dubbo
run com.alibaba.dubbo.demo.provider.Provider under dubbo-demo-provider module
add -Djava.net.preferIPv4Stack=true if your IDE is Intellij Idea
```

configuration:

```sh
resource/META-INFO.spring/dubbo-demo-provider.xml
change dubbo:registery to a real registery server address, zookeeper is recommanded
```
