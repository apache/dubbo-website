# install demo provider

install:

```sh
git clone https://github.com/apache/incubator-dubbo.git
cd incubator-dubbo
run org.apache.dubbo.demo.provider.Provider under dubbo-demo-provider module
add -Djava.net.preferIPv4Stack=true if your IDE is Intellij Idea
```

configuration:

```sh
resource/META-INFO.spring/dubbo-demo-provider.xml
change dubbo:registry to a real registry server address, zookeeper is recommanded
```
