---
aliases:
    - /en/overview/what/ecosystem/serialization/kryo/
    - /en/overview/what/ecosystem/serialization/kryo/
description: "This article introduces Kryo serialization"
linkTitle: Kryo
title: Kryo
type: docs
weight: 8
---




## 1 Introduction

Kryo is a very mature serialization implementation that has been widely used in Twitter, Groupon, Yahoo, and several well-known open-source projects (such as Hive, Storm).

## 2 How to Use

### 2.1 Adding Dependencies

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

### 2.2 Configuration Enable


```yaml
# application.yml (Spring Boot)
dubbo:
 protocol:
   serialization: kryo
```
or
```properties
# dubbo.properties
dubbo.protocol.serialization=kryo

# or
dubbo.consumer.serialization=kryo

# or
dubbo.reference.com.demo.DemoService.serialization=kryo
```
or
```xml
<dubbo:protocol serialization="kryo" />

        <!-- or -->
<dubbo:consumer serialization="kryo" />

        <!-- or -->
<dubbo:reference interface="xxx" serialization="kryo" />
```


## 3 Registering Serializable Classes

To let Kryo and FST fully leverage high performance, it is best to register those classes that need to be serialized into the Dubbo system as follows:

**Callback Interface**
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

Then add in the XML configuration:

```xml
<dubbo:protocol name="dubbo" serialization="kryo" optimizer="org.apache.dubbo.demo.SerializationOptimizerImpl"/>
```

After registering these classes, the performance of serialization may be greatly improved, especially for a small number of nested objects.

Of course, when serializing a class, it may also cascade references to many classes, such as Java collection classes.

For this situation, we have automatically registered commonly used classes in the JDK, so you do not need to register them again (of course, it doesn't matter if you do). 

Including
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

The registration of serialized classes is only for performance optimization, so it doesn't matter if you forget to register certain classes.

In fact, even without registering any classes, the performance of Kryo and FST generally surpasses that of Hessian and Dubbo serialization.

> Of course, some may ask why not use configuration files to register these classes? This is because the number of classes to be registered is often large, leading to lengthy configuration files; and without good IDE support, writing and refactoring configuration files is much more cumbersome than Java classes; finally, these registered classes generally do not need to be dynamically modified after the project is compiled and packaged.

> Additionally, some may feel that manually registering serialized classes is a relatively tedious task. Could we use annotations to mark them and let the system discover and register automatically? However, the limitation of annotations is that they can only mark classes you can modify, and many classes referred to in serialization are likely to be unmodifiable (e.g., third-party libraries or JDK system classes). Also, adding annotations slightly "pollutes" the code, increasing the application's dependency on the framework.

> Aside from annotations, we could consider other ways to automatically register serialized classes, such as scanning the class path to automatically find and register classes implementing the Serializable interface (including Externalizable). Indeed, there could be many Serializable classes found along the class path, so prefixes like package names can be considered to restrict the scanning scope to some extent.

> Of course, in the automatic registration mechanism, it is essential to ensure that both the service provider and consumer register classes in the same order (or ID) to avoid misalignment, as the number of classes that can be discovered and registered may vary on both ends.

### No-Arg Constructor and Serializable Interface

If the serialized class does not contain a no-arg constructor, the performance of Kryo serialization will be severely compromised, as we will transparently replace Kryo serialization with Java serialization at the lower level. Therefore, it is best practice to add a no-arg constructor for each serialized class (of course, a Java class has a default no-arg constructor if no custom constructor is defined).

Additionally, while Kryo and FST do not require the serialized class to implement the Serializable interface, we still recommend that each serialized class implements it to maintain compatibility with Java serialization and Dubbo serialization, also allowing for the possibility of adopting the aforementioned automatic registration mechanisms in the future.

