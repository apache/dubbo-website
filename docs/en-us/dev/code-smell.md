# Bad Smell

Ugly Dubbo design or implementation will be record here.

## URL Convertion

### 1. Point to Point Service export and refer

service directly export：

```
EXPORT(dubbo://provider-address/com.xxx.XxxService?version=1.0.0")
```

service directly refer：

```
REFER(dubbo://provider-address/com.xxx.XxxService?version=1.0.0)
```

### 2. Export servie by registry

export service to registry：

```
EXPORT(registry://registry-address/com.alibaba.dubbo.registry.RegistrySerevice?registry=dubbo&export=ENCODE(dubbo://provider-address/com.xxx.XxxService?version=1.0.0))
```

accquire registry：

```
url.setProtocol(url.getParameter("registry", "dubbo"))
GETREGISTRY(dubbo://registry-address/com.alibaba.dubbo.registry.RegistrySerevice)
```

registry service address：

```
url.getParameterAndDecoded("export"))
REGISTER(dubbo://provider-address/com.xxx.XxxService?version=1.0.0)
```

### 3. Refer service from registry

refer service from registry：

```
REFER(registry://registry-address/com.alibaba.dubbo.registry.RegistrySerevice?registry=dubbo&refer=ENCODE(version=1.0.0))
```

accquire registry：

```
url.setProtocol(url.getParameter("registry", "dubbo"))
GETREGISTRY(dubbo://registry-address/com.alibaba.dubbo.registry.RegistrySerevice)
```

subscribe service address：

```
url.addParameters(url.getParameterAndDecoded("refer"))
SUBSCRIBE(dubbo://registry-address/com.xxx.XxxService?version=1.0.0)
```

notify service address：

```
url.addParameters(url.getParameterAndDecoded("refer"))
NOTIFY(dubbo://provider-address/com.xxx.XxxService?version=1.0.0)
```

### 4. Registry push route rule

registry push route rule：

```
NOTIFY(route://registry-address/com.xxx.XxxService?router=script&type=js&rule=ENCODE(function{...}))
```

accquire routers：

```
url.setProtocol(url.getParameter("router", "script"))
GETROUTE(script://registry-address/com.xxx.XxxService?type=js&rule=ENCODE(function{...}))
```

### 5. Load route rule from file

load route rule from file：

```
GETROUTE(file://path/file.js?router=script)
```

accquire routers：

```
url.setProtocol(url.getParameter("router", "script")).addParameter("type", SUFFIX(file)).addParameter("rule", READ(file))
GETROUTE(script://path/file.js?type=js&rule=ENCODE(function{...}))
```

## Invoke parameters

* path      service path
* group    service group
* version  service version
* dubbo   current dubbo release version
* token    verify token
* timeout   invocation timeout

## SPI Loading

### 1. SPI Auto Adaptive

When ExtensionLoader loads SPI, It will check spi attributes(using set method) . If one attribute is SPI, ExtensionLoader  will load the SPI implementation. Auto injected object is an adaptive instance（proxy） ,because the real implementation is confirmed only in execution stage.。when adaptive spi is invoked, Dubbo will choose the real implementation and executes it. Dubbo choose the right implementation according to the parameters that the mehod defines.

All the inner SPIs that  Dubbo defines have the URL  parameter defined for the method invocation. Adaptive SPI uses URL to determine which implementation is needed. One specific Key and Value in the URL confirms the usage of the specific implementation, All these is done by adding `@Adaptive`  annotation.

```java
@Extension
public interface Car {
    @Adaptive({"http://10.20.160.198/wiki/display/dubbo/car.type", "http://10.20.160.198/wiki/display/dubbo/transport.type"})
    public run(URL url, Type1 arg1, Type2 arg2);
}
```

For the rules above，ExtensionLoader  will create a adaptive instance for each SPI injected.

ExtensionLoader generated adaptive classes  look like ：

```java
package <package name for SPI interface>;
 
public class <SPI interface name>$Adpative implements <SPI interface> {
    public <contains @Adaptive annotation method>(<parameters>) {
        if(parameters containing URL Type?) using URL parameter
        else if(method returns URL) using the return URL
        # <else throw exception,inject SPI fail！>
         
        if(URL accquired == null) {
            throw new IllegalArgumentException("url == null");
        }
 
        According to the Key order from @Adaptive annotation，get the Value from the URL as the real SPI name
        if no value is found then use the default SPI implementation。If no SPI point， throw new IllegalStateException("Fail to get extension");
 
        Invoke the method using the spi and return the result.
    }
 
    public <method having annotation @Adaptive>(<parameters>) {
        throw new UnsupportedOperationException("is not adaptive method!");
    }
}
```

`@Adaptive`  annotation usage：

If no value is configed for those Keys in URL，default SPI implementation is used。For example ，String[] {"key1", "key2"}，firstly Dubbo will look up value for key1 and use it as SPI name;if key1 value is not founded then look up for key2，if value of key2 is also not found ,then use default spi implementation. If no default implementation is configed, then the method will throw IllegalStateException。if not configed , then default implement is lower case of the interface class full package name. For Extension interface `com.alibaba.dubbo.xxx.YyyInvokerWrapper` , default value is `new String[] {"yyy.invoker.wrapper"}`

## Callback Function

### 1. Parameter Callback

main theory ： in the persistent connection for one consumer->provider，export a service in  Consumer side，provider  side can reversely call the instance in consumer side.

Implement details：

* For exchanging interface instance in transmition, auto export and auto refer is implemented in DubboCodec . Need to seperate business logic and codec logic.
* you will need to judge whether needing callback when getting exporter from invocation，if needed, get the callback instance id from the attachments. By using this method, consumer side can implement the callback interface with different implementations.

### 2. Event Notification

main theory ： when Consumer  executing invoke method，judging if any configuration for  onreturn/onerror... put  the method for onreturn to the callback list of the async invocatioin.

Implement details：parameters is passed using URL，but string-object is not supported for URL, so the method is stored in  staticMap，it needs to be optimized.

## Lazy Connection

DubboProtocol  specific features, default disabled

When client creating proxy for server, do not establish TCP persistent connection at first, only init the connecton when data is needing transmision.

This feather will disable the connection retry policy , resend the data again(if connection is lost when sending data ,try to establish a new connection to send data)

## Share Connection

DubboProtocol specific features, default enabled。

JVM A export many services，JVM B  refer more than one services of A，Share Connection means those different services invocations between A and B uses the same TCP connection  to transmit data, reducing server connections.

Implement details：when using share connection for the same address，you need pay more attention to the invoker's destroy action.on one hand, you should close the connection when all the invokers refering the same address is destroyed, on another hand ,you should not close the connection when not all of the invokers are destroyed. In design implementation, we uses a strategy called reference count , we create a connection called Lazy connection for exceptions not affacting business when closing the connection just in case.

## sticky policy

when existing many providers and configing the sticky policy，invocation will be sent to the same provider as last invocation. Sticky Policy opens the lazy attribute of connection, for avoiding open useless connectons.

## provider selecting logic

0. existing multi providers，firstly select by Loadbalance 。If the selected  provider is available ,then just doing the invocation
1. If the selected provider is not available in stage 1, then choose from the remaining ,if available then doing the inovation
2. If all providers are not available , rescan the list(not choosen invoker first),juding if any provider is available, if existing,doing the invocatiion.
3. If no available provider in stage 3, then the next invoker of the invoker of stage 1 will be choosen(if not the last one),avoiding collision.



