---
type: docs
title: "msgpack serialization"
linkTitle: "msgpack serialization"
weight: 15
description: "Using msgpack serialization in Dubbo"
---

MessagePack is an efficient binary serialization format. It lets you exchange data among multiple languages like JSON. 
But it's faster and smaller. Small integers are encoded into a single byte, and typical short strings require only one 
extra byte in addition to the strings themselves.

{{% alert title="Notice" color="primary" %}}
support on `2.7.12` or above.
{{% /alert %}}

## msgpack demo

- 1. provider and consumer import msgpack dependencies

```xml
        <dependency>
            <groupId>org.msgpack</groupId>
            <artifactId>msgpack-core</artifactId>
            <version>0.8.22</version>
        </dependency>

        <dependency>
            <groupId>org.msgpack</groupId>
            <artifactId>jackson-dataformat-msgpack</artifactId>
            <version>0.8.22</version>
        </dependency>
```

- 2. provider demo

Add the following protocol configurations into Dubbo configuration class:

```java
...
    @Bean
	public ProtocolConfig msgpackProtocol(){
        ProtocolConfig protocolConfig = new ProtocolConfig();
        protocolConfig.setName("dubbo");
        protocolConfig.setId("msgpack");
        protocolConfig.setSerialization("msgpack");
        return protocolConfig;
    }
```

Dubbo provider:

Add protocol declaration protocol = {"msgpackProtocol"} to annotations of @Service implemented by Dubbo provider interface.

Dubbo provider interface:
```java
public interface MsgpackService {
    int tint(int i);
    long tlong(long i);
    List<String> tlist(List<String> l);
    String multiParams(String str, int i, MyParam myParam);
}
```

Dubbo provider interface implement:

```java
@Service(interfaceClass = MsgpackService.class,protocol = {"msgpackProtocol"})
public class MsgpackServiceImpl implements MsgpackService {
    @Override
    public int tint(int i) {
        return i;
    }
    @Override
    public long tlong(long i) {
        return i;
    }
    @Override
    public List<String> tlist(List<String> l) {
        return l;
    }
    @Override
    public String multiParams(String str, int i, MyParam myParam) {
        return str + i + myParam.getName() + myParam.getAge();
    }
}
```

Entities used:

```java
@Data
public class MyParam {
    private String name;
    private int age;
    public MyParam(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    // parameterless construct function needed
    public MyParam(){}
}
```

- 3. consumer demo

```java
    @DubboReference(interfaceClass = MsgpackService.class)
    private MsgpackService msgPackService;
    @GetMapping("/msgpack")
    public String testMsgpack(){
        int v1 = msgPackService.tint(1);
        long v2 = msgPackService.tlong(2);
        List<String> v3 = msgPackService.tlist(Lists.newArrayList("1","2","3"));
        String v4 = msgPackService.multiParams("hello", 3, new MyParam("Tom", 24));
        return "msgpack"+v1+" "+v2+" "+v3+" "+v4;
    }
```

- 4. invoke

```
> curl http://localhost:8081/msgpack
> msgpack1 2 [1, 2, 3] hello3Tom24
```
