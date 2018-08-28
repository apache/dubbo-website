## <font size=6>Using Efficient Java Serialization in Dubbo (Kryo and FST)</font>
## Start Kryo and FST

<font size=3>It is easy to use Kryo and FST. You only need to add an attribute in the XML configuration of Dubbo RPC:</font>

```
<dubbo:protocol name="dubbo" serialization="kryo"/>
```

```
<dubbo:protocol name="dubbo" serialization="fst"/>
```

## Register serialized class

<font size=3>To make Kryo and FST have high-performance, it is better to register those classes that need serialization to the Dubbo system. For example, we can implement the following callback interface: </font>

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



<font size=3>Then add in the XML configuration:</font>

```
<dubbo:protocol name="dubbo" serialization="kryo" optimizer="com.alibaba.dubbo.demo.SerializationOptimizerImpl"/>
```

<font size=3>After registering these classes, serialization performance can be greatly improved, especially for small numbers of nested objects.

Of course, when serializing a class, you might also cascade references to many classes, such as Java collection classes. In this case, we've automatically registered common classes in the JDK, so you don't need to register them repeatedly (and of course, it doesn't matter if you register them again), including:</font>


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


<font size=3>Since registering serialized classes is only for performance optimization purposes, it doesn't matter if you forget to register some classes. In fact, Kryo and FST generally perform better than Hessian and Dubbo serializations even if no classes are registered.</font>