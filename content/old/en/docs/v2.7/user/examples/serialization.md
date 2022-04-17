---
type: docs
title: "Serialization"
linkTitle: "Serialization"
weight: 44
description: "Using Efficient Java Serialization in Dubbo (Kryo and FST)"
---

Using Kryo and FST is very simple, just add an attribute to the dubbo RPC XML configurition:

```
<dubbo:protocol name="dubbo" serialization="kryo"/>
```

```
<dubbo:protocol name="dubbo" serialization="fst"/>
```

## Register serialized class

For releasing the high ability of Kryo and FST, it's best to register the classes that need serializing into the dubbo system. For example, we can implement the following callback interface:

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

After registering these classes, serialization performance can be greatly improved, especially for small numbers of nested objects.

Of course, when serializing a class, you might also cascade references to many classes, such as Java collection classes. In this case, we've automatically registered common classes in the JDK, so you don't need to register them repeatedly (and of course, it doesn't matter if you register them again), including:
* GregorianCalendar
* InvocationHandler
* BigDecimal
* BigInteger
* Pattern
* BitSet
* URI
* UUID
* HashMap
* ArrayList
* LinkedList
* HashSet
* TreeSet
* Hashtable
* Date
* Calendar
* ConcurrentHashMap
* SimpleDateFormat
* Vector
* BitSet
* StringBuffer
* StringBuilder
* Object
* Object[]
* String[]
* byte[]
* char[]
* int[]
* float[]
* double[]

Since registering serialized classes is only for performance optimization purposes, it doesn't matter if you forget to register some classes. In fact, Kryo and FST generally perform better than Hessian and Dubbo serializations even if no classes are registered.
