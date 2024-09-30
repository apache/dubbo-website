---
aliases:
    - /en/overview/what/ecosystem/serialization/fst/
    - /en/overview/what/ecosystem/serialization/fst/
description: "This article introduces FST serialization"
linkTitle: FST
title: FST
type: docs
weight: 6
---

## 1 Introduction

FST serialization stands for Fast Serialization, which is a replacement implementation for Java serialization. Since the previous discussion highlighted two serious shortcomings of Java serialization, these have been significantly improved in FST. The characteristics of FST are as follows:

1. Improved performance by 10 times compared to JDK serialization, with size reduction of more than 3-4 times
2. Supports off-heap Maps and the persistence of off-heap Maps
3. Supports serialization to JSON

## 2 Usage

### 2.1 Adding Dependencies

```xml
<dependencies>
    <dependency>
      <groupId>org.apache.dubbo.extensions</groupId>
      <artifactId>dubbo-serialization-fst</artifactId>
      <version>3.3.0</version>
    </dependency>
    <dependency>
        <groupId>de.ruedigermoeller</groupId>
        <artifactId>fst</artifactId>
        <version>3.0.3</version>
    </dependency>
</dependencies>
```

### 2.2 Configuring Activation

```yaml
# application.yml (Spring Boot)
dubbo:
 protocol:
   serialization: fst
```
or
```properties
# dubbo.properties
dubbo.protocol.serialization=fst

# or
dubbo.consumer.serialization=fst

# or
dubbo.reference.com.demo.DemoService.serialization=fst
```
or
```xml
<dubbo:protocol serialization="fst" />

        <!-- or -->
<dubbo:consumer serialization="fst" />

        <!-- or -->
<dubbo:reference interface="xxx" serialization="fst" />
```

## 3 Registering Serializable Classes

To fully leverage the high performance of Kryo and FST, it is best to register the classes that need to be serialized into the Dubbo system, implemented as follows.

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

After registering these classes, serialization performance may be greatly enhanced, particularly for small numbers of nested objects.

Of course, when serializing a class, it might also reference many other classes, such as Java collection classes.

In this case, we have automatically registered commonly used classes from the JDK, so you don't need to register them again (though registering them again has no impact).

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

Since registering the serializable classes is solely for performance optimization, it doesn't matter if you forget to register some classes.

In fact, even without registering any classes, the performance of Kryo and FST is generally superior to that of Hessian and Dubbo serialization.

> Of course, some may ask why we don't use a configuration file to register these classes. This is because the number of classes to be registered is often large, leading to lengthy configuration files; furthermore, without good IDE support, writing and refactoring configuration files is much more cumbersome than dealing with Java classes; finally, these registered classes generally do not need to be dynamically modified after the project is compiled and packaged.

> Additionally, some might find manually registering serializable classes relatively cumbersome and wonder if annotations could be used to mark them for automatic discovery and registration. However, the limitation of annotations here is that they can only mark classes that you can modify, while many classes referenced in serialization may be unmodifiable (e.g., from third-party libraries, JDK system classes, or classes from other projects). Moreover, adding annotations does slightly "pollute" the code, increasing the dependency of application code on the framework.

> Apart from annotations, we could also consider other ways to automatically register serializable classes, such as scanning the classpath to automatically discover and register classes that implement the Serializable interface (including Externalizable). Of course, we know that there could be a large number of Serializable classes found in the classpath, so using package prefixes to some extent to limit the scanning range could also be considered.

> Of course, in an automatic registration mechanism, it is particularly important to ensure that the provider and consumer register classes in the same order (or ID) to avoid misalignment, as the number of classes discoverable and registrable on both ends may be different.

### No-Argument Constructor and Serializable Interface

If a serializable class does not include a no-argument constructor, its performance in Kryo serialization will be significantly reduced, as we will transparently use Java serialization to replace Kryo serialization. Therefore, adding a no-argument constructor to each serializable class is considered a best practice (of course, a Java class will have a no-argument constructor by default if no custom constructors are defined).

Moreover, while Kryo and FST don't require the serializable classes to implement the Serializable interface, we still recommend that each serializable class does so, as this ensures compatibility with Java serialization and Dubbo serialization, thus potentially easing the use of some of the aforementioned automatic registration mechanisms in the future.

