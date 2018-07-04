
# install demo consumer

install:

```sh
git clone https://github.com/apache/incubator-dubbo.git
cd incubator-dubbo
Please start Provider first
add -Djava.net.preferIPv4Stack=true if your IDE is Intellij Idea
```

configuration:

```sh
resource/META-INFO.spring/dubbo-demo-consumer.xml
change dubbo:registery to the real registery center address
```
