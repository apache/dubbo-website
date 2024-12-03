---
aliases:
    - /zh/overview/what/ecosystem/serialization/kryo/
    - /zh-cn/overview/what/ecosystem/serialization/kryo/
description: "本文介绍 Kryo 序列化"
linkTitle: Kryo
title: Kryo
type: docs
weight: 8
---




## 1 介绍

Kryo是一种非常成熟的序列化实现，已经在Twitter、Groupon、Yahoo以及多个著名开源项目（如Hive、Storm）中广泛的使用。

## 2 使用方式

### 2.1 添加依赖

```xml
<dependencies>
    <dependency>
      <groupId>org.apache.dubbo.extensions</groupId>
      <artifactId>dubbo-serialization-kryo</artifactId>
      <version>1.0.1</version>
    </dependency>
    <dependency>
        <groupId>com.esotericsoftware</groupId>
        <artifactId>kryo</artifactId>
        <version>5.4.0</version>
    </dependency>
    <dependency>
        <groupId>de.javakaffee</groupId>
        <artifactId>kryo-serializers</artifactId>
        <version>0.45</version>
    </dependency>
</dependencies>
```

### 2.2 配置启用


```yaml
# application.yml (Spring Boot)
dubbo:
 protocol:
   serialization: kryo
```
或
```properties
# dubbo.properties
dubbo.protocol.serialization=kryo

# or
dubbo.consumer.serialization=kryo

# or
dubbo.reference.com.demo.DemoService.serialization=kryo
```
或
```xml
<dubbo:protocol serialization="kryo" />

        <!-- or -->
<dubbo:consumer serialization="kryo" />

        <!-- or -->
<dubbo:reference interface="xxx" serialization="kryo" />
```


## 3 注册被序列化类

要让Kryo和FST完全发挥出高性能，最好将那些需要被序列化的类注册到dubbo系统中，实现如下

**回调接口**
```java
public class SerializationOptimizerImpl implements SerializationOptimizer {

    public Collection<Class> getSerializableClasses() {
        List<Class> classes = new LinkedList<Class>();
        classes.add(BidRequest.class);
        classes.add(BidResponse.class);
        classes.add(Device.class);
        classes.add(Geo.class);
        classes.add(Impression.class);
        classes.add(SeatBid.class);
        return classes;
    }
}
```

然后在XML配置中添加：

```xml
<dubbo:protocol name="dubbo" serialization="kryo" optimizer="org.apache.dubbo.demo.SerializationOptimizerImpl"/>
```

在注册这些类后，序列化的性能可能被大大提升，特别针对小数量的嵌套对象的时候。

当然，在对一个类做序列化的时候，可能还级联引用到很多类，比如Java集合类。

针对这种情况，我们已经自动将JDK中的常用类进行了注册，所以你不需要重复注册它们（当然你重复注册了也没有任何影响)。

包括
```
GregorianCalendar
InvocationHandler
BigDecimal
BigInteger
Pattern
BitSet
URI
UUID
HashMap
ArrayList
LinkedList
HashSet
TreeSet
Hashtable
Date
Calendar
ConcurrentHashMap
SimpleDateFormat
Vector
BitSet
StringBuffer
StringBuilder
Object
Object[]
String[]
byte[]
char[]
int[]
float[]
double[]
```

由于注册被序列化的类仅仅是出于性能优化的目的，所以即使你忘记注册某些类也没有关系。

事实上，即使不注册任何类，Kryo和FST的性能依然普遍优于hessian和dubbo序列化。

> 当然，有人可能会问为什么不用配置文件来注册这些类？这是因为要注册的类往往数量较多，导致配置文件冗长；而且在没有好的IDE支持的情况下，配置文件的编写和重构都比java类麻烦得多；最后，这些注册的类一般是不需要在项目编译打包后还需要做动态修改的。

> 另外，有人也会觉得手工注册被序列化的类是一种相对繁琐的工作，是不是可以用annotation来标注，然后系统来自动发现并注册。但这里annotation的局限是，它只能用来标注你可以修改的类，而很多序列化中引用的类很可能是你没法做修改的（比如第三方库或者JDK系统类或者其他项目的类）。另外，添加annotation毕竟稍微的“污染”了一下代码，使应用代码对框架增加了一点点的依赖性。

> 除了annotation，我们还可以考虑用其它方式来自动注册被序列化的类，例如扫描类路径，自动发现实现Serializable接口（甚至包括Externalizable）的类并将它们注册。当然，我们知道类路径上能找到Serializable类可能是非常多的，所以也可以考虑用package前缀之类来一定程度限定扫描范围。

> 当然，在自动注册机制中，特别需要考虑如何保证服务提供端和消费端都以同样的顺序（或者ID）来注册类，避免错位，毕竟两端可被发现然后注册的类的数量可能都是不一样的。

### 无参构造函数和Serializable接口

如果被序列化的类中不包含无参的构造函数，则在Kryo的序列化中，性能将会大打折扣，因为此时我们在底层将用Java的序列化来透明的取代Kryo序列化。所以，尽可能为每一个被序列化的类添加无参构造函数是一种最佳实践（当然一个java类如果不自定义构造函数，默认就有无参构造函数）。

另外，Kryo和FST本来都不需要被序列化的类实现Serializable接口，但我们还是建议每个被序列化类都去实现它，因为这样可以保持和Java序列化以及dubbo序列化的兼容性，另外也使我们未来采用上述某些自动注册机制带来可能。
