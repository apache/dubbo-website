## Enable Kryo and FST
Using Kryo and FST is very simple, just add an attribute to the dubbo RPC XML configurition:

```xml
<dubbo:protocol name="dubbo" serialization="kryo"/>
```

```xml
<dubbo:protocol name="dubbo" serialization="fst"/>
```
## <span data-type="color" style="color:#262626">Register serialized class</span>
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

And then add in the XML configuration:

```xml
<dubbo:protocol name="dubbo" serialization="kryo" optimizer="com.alibaba.dubbo.demo.SerializationOptimizerImpl"/>
```

After registering these classes, serialized performance may be greatly improved, especially for the small numbers of nested objects.

Of course, when serializing a class, you may cascade to reference many classes, such as Java collection classes. For this situation, we have automatically registered the commonly used classes in the JDK, so you don't have to register them repeatedly (of course, it doesn't matter if you do), including:

```xml
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

It doesn't matter if you forget to register some classes, as the registering serialized classes are only for performance optimization. In fact, even without registering any classes, the performance of Kryo and FST is generally better than hessian and dubbo serialization.
