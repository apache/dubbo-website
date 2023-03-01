---
aliases:
    - /zh/docsv2.7/user/examples/msgpack-serialization/
description: 在Dubbo中使用msgpack序列化
linkTitle: msgpack序列化
title: msgpack序列化
type: docs
weight: 15
---


## 背景
MessagePack是一种高效的二进制序列化格式。它允许您在多种语言(如JSON)之间交换数据。但它更快更小。短整型被编码成一个字节，而典型的短字符串除了字符串本身只需要一个额外的字节。


{{% alert title="提示" color="primary" %}}
支持版本：`2.7.12` 之后
{{% /alert %}}

## 示例

- 1. provider与consumer引入msgpack依赖

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

- 2. provider示例demo

dubbo 配置类增加如下协议配置：

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

dubbo provider:

dubbo provider 接口实现的@Service注解添加:protocol = {"msgpackProtocol"}协议声明。

dubbo provider 接口:

```java
public interface MsgpackService {
    int tint(int i);
    long tlong(long i);
    List<String> tlist(List<String> l);
    String multiParams(String str, int i, MyParam myParam);
}
```

dubbo provider 接口实现:

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

用到的实体类：

```java
@Data
public class MyParam {
    private String name;
    private int age;

    public MyParam(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    // 需要提供无参构造函数
    public MyParam(){}
}

```

- 3. consumer 示例demo

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

- 4. 调用执行

```
> curl http://localhost:8081/msgpack
> msgpack1 2 [1, 2, 3] hello3Tom24
```