# dubbo://


Dubbo protocol which is the default protocol of Dubbo RPC Framework uses a single long connection and NIO asynchronous communication,it is suitable for small data but with high concurrency RPC call and the number of consumer machine is much greater than provider

On the other hand, the Dubbo protocol is not suitable for transmitting large amounts of data, such as file transmission, video transmission, etc., unless the request is very low.

![dubbo-protocol.jpg](../../sources/images/dubbo-protocol.jpg)

* Transporter: mina, netty, grizzy
* Serialization: dubbo, hessian2, java, json
* Dispatcher: all, direct, message, execution, connection
* ThreadPool: fixed, cached

## Features


The default protocol is Dubbo protocol ,based on netty  `3.2.5.Final` and Hessian2 `3.2.1-fixed-2(Alibaba embed version)`.

* Default connection number: single connection
* Default connection mode: long connection
* Transmission protocol: TCP
* Transmission mode: NIO asynchronous transmission
* Serialization: Hessian2 serialization
* Scope of application: incoming and outgoing data packets are small (recommended less than 100K),try not to transfer large files or large strings with Dubbo protocol.
* Applicable scenarios:: most RPC scenarios 


## Constraint

* Parameters and return values must implement `Serializable` interface
* Parameters and return values can not be customized to implement `List`,` Map`, `Number`,` Date`, `Calendar` interface, can only be implemented with the JDK, because Hessian2 will do some special treatment, Attribute values in the class will be lost.
* Hessian serialization:to solve compatibility issues, only serialize class name,all the fields declared by the class,not included static fields,method information


| Data transformation | Cases | Result |
| ------------- | ------------- | ------------- |
| A->B  | Class A has one more property than Class B| It doesn't throw exception ，Class B doesn't have Class A new property,other is normal |
| A->B  | enum Class A has one more new enum than enum Class B，when use Class A new enum to transfor to B | throw exception |
| A->B | enum Class A has one more new enum than enum Class B，when don't use Class A new enum to transfor to B  | It doesn't throw exception|
| A->B | Class A and Class B have same property name,but the property type is different  | throw exception |
| A->B | serialId is not same | normal |


The interface new addition method has no effect on the client. If the method is not required by the client, the client does not need to redeploy it. The input parameter and result class add new properties, and if the client does not need new properties, it does not need to be redeployed too.

The change of input parameter and result property name has no effect on client serialization, but if the client is not redeployed, no matter the input or output, the value of which property name had change is not available.

Summary: the server side and the client do not need to be fully consistent with the domain objects,but you still should know about what would happen.


## Configuration


configure protocol

```xml
<dubbo:protocol name="dubbo" port="20880" />
```

configure provider level default protocol:

```xml
<dubbo:provider protocol="dubbo" />
```

configure service level default protocol:

```xml
<dubbo:service protocol="dubbo" />
```

configure multiple port：

```xml
<dubbo:protocol id="dubbo1" name="dubbo" port="20880" />
<dubbo:protocol id="dubbo2" name="dubbo" port="20881" />
```

configure protocol options:

```xml
<dubbo:protocol name=“dubbo” port=“9090” server=“netty” client=“netty” codec=“dubbo” serialization=“hessian2” charset=“UTF-8” threadpool=“fixed” threads=“100” queues=“0” iothreads=“9” buffer=“8192” accepts=“1000” payload=“8388608” />
```


configure multiple connectios:

Dubbo protocol default uses a single long connection per service per consumer for each service provider,and multiple connections can be used if the amount of data is large

```xml
<dubbo:protocol name="dubbo" connections="2" />
```

* `<dubbo:service connections="0">`  OR `<dubbo:reference connections="0">` It means that the service uses a share long connection per provider. `default`
* `<dubbo:service connections="1">` OR `<dubbo:reference connections="1">` It means that the service uses a separate long connection.
* `<dubbo:service connections="2">` OR`<dubbo:reference connections="2">` It means that the service uses two separate long connection.

To prevent being hung up by a large number of connections, you can limit the number of connections at the service provider side.

```xml
<dubbo:protocol name="dubbo" accepts="1000" />
```

or configure in `dubbo.properties`：

```
dubbo.service.protocol=dubbo
```

