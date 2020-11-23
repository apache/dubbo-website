---
type: docs
title: "SPI Loading"
linkTitle: "SPI"
weight: 3
description: "How Dubbo SPI works"
---


## SPI Config

### Source:

Dubbo SPI is inherited from standard JDK SPI(Service Provider Interface) and makes it more powerful.

Dubbo fixed below issues of the standard JDK SPI:

* The standard JDK SPI will load and instantize all the implementations at once. It will be a waste of resources if one implementation is timecosted, but never be used.
* We can't accquire the SPI name, if loading the SPI implementation is failed.For example: standard JDK ScriptEngine, get script type by invoking method getName(). RubyScriptEngine class will load failed if the depenency jar jruby.jar is missing, and the real error info will be lost. When user executes ruby scripts, the program throws exception that doesn't support ruby, but it is not the real cause.
* Enhance the SPI functionality by supporting IoC and AOP, one SPI can be easily injected by another SPI simply using setter.

### Appointment:

In the jar file containing extension class [^1], places a config file `META-INF/dubbo/full interface name`, file content pattern: `SPI name=the fully qualified name for the extension class`, use new line seperator for multiple implementation.

### Example:

To extend Dubbo Protocol, place a text file in the extension jar file: `META-INF/dubbo/org.apache.dubbo.rpc.Protocol`, content:

```properties
xxx=com.alibaba.xxx.XxxProtocol
```

content of the implementation [^2]:

```java
package com.alibaba.xxx;
 
import org.apache.dubbo.rpc.Protocol;
 
public class XxxProtocol implements Protocol { 
    // ...
}
```

### Configuration in config module

In Dubbo config module, all SPI points have related attributes or labels, we can choose the specific SPI implementation by using its name. Like:

```xml
<dubbo:protocol name="xxx" />
```

## SPI Features

### SPI Auto Wrap

Auto wrap the SPI's Wrapper class. `ExtensionLoader` loads the SPI implementation, if the SPI has a copy instructor, it will be regarded as the SPI's Wrapper class.

Wrapper class content:

```java
package com.alibaba.xxx;
 
import org.apache.dubbo.rpc.Protocol;
 
public class XxxProtocolWrapper implements Protocol {
    Protocol impl;
 
    public XxxProtocolWrapper(Protocol protocol) { impl = protocol; }
 
    //after interface method is executed, the method in extension will be executed
    public void refer() {
        //... some operation
        impl.refer();
        // ... some operation
    }
 
    // ...
}
```

Wrapper class also implements the same SPI interface, but Wrapper is not the real implementation. It is used for wrap the real implementation returned from the `ExtensionLoader`. The real returned instance by `ExtensionLoader` is the Wrapper class instance, Wrapper holder the real SPI implementation class.

There can be many Wrapper for one spi, simply add one if you need.

With Wrapper class, you will be able to move same logics into Wrapper for all SPIs. Newly added Wrapper class add external logics for all SPIs, looks like AOP, Wrapper acts as a proxy for SPI.

### SPI Auto Load

when loading the SPI, Dubbo will auto load the depency SPI. When one SPI implementation contains attribute which is also an SPI of another type,`ExtensionLoader` will automatically load the depency SPI. `ExtensionLoader` knows all the members of the specific SPI by scanning the setter method of all implementation class.

Demo: two SPI `CarMaker`（car maker）、`WheelMaker` (wheel maker)

Intefaces look like:

```java
public interface CarMaker {
    Car makeCar();
}
 
public interface WheelMaker {
    Wheel makeWheel();
}
```

`CarMaker`'s implementation:

```java
public class RaceCarMaker implements CarMaker {
    WheelMaker wheelMaker;
 
    public void setWheelMaker(WheelMaker wheelMaker) {
        this.wheelMaker = wheelMaker;
    }
 
    public Car makeCar() {
        // ...
        Wheel wheel = wheelMaker.makeWheel();
        // ...
        return new RaceCar(wheel, ...);
    }
}
```

when `ExtensionLoader` loads `CarMaker`'s implementation `RaceCarMaker`, the method `setWheelMaker` needs paramType `WheelMaker` which is also a SPI, It will be automatically loaded.

This brings a new question:How `ExtensionLoader` determines which implementation to use when load the injected SPI. As for this demo, when existing multi `WheelMaker` implementation, which one should the `ExtensionLoader` chooses.

Good question, we will explain it in the following chapter: SPI Auto Adaptive.

### SPI Auto Adaptive

The depency SPI that `ExtensionLoader` injects is an instance of `Adaptive`, the real spi implementation is known until the adaptive instance is executed.

Dubbo use URL (containing Key-Value) to pass the configuration.

The SPI method invocation has the URL parameter（Or Entity that has URL attribute）

In this way depended SPI can get configuration from URL, after config all SPI key needed, configuration information will be passed from outer by URL. URL acts as a bus when passing the config information.

Demo: two SPI `CarMaker`、`WheelMaker`

interface looks like:

```java
public interface CarMaker {
    Car makeCar(URL url);
}
 
public interface WheelMaker {
    Wheel makeWheel(URL url);
}
```

`CarMaker`'s implementation:

```java
public class RaceCarMaker implements CarMaker {
    WheelMaker wheelMaker;
 
    public void setWheelMaker(WheelMaker wheelMaker) {
        this.wheelMaker = wheelMaker;
    }
 
    public Car makeCar(URL url) {
        // ...
        Wheel wheel = wheelMaker.makeWheel(url);
        // ...
        return new RaceCar(wheel, ...);
    }
}
```

when execute the code above

```java
// ...
Wheel wheel = wheelMaker.makeWheel(url);
// ...
```

, the injected `Adaptive` object determine which `WheelMaker`'s `makeWheel` method will be executed by predefined Key. Such as `wheel.type`, key `url.get("wheel.type")` will determine `WheelMake` implementation. The logic of`Adaptive` instance of fixed, getting the predefined Key of the URL, dynamically creating the real implementation and execute it.

For Dubbo, the SPI `Adaptive` implementation in `ExtensionLoader` is dynamically created when dubbo is loading the SPI. Get the Key from URL, the Key will be provided through `@Adaptive` annotation for the interface method definition.

Below is Dubbo Transporter SPI codes:

```java
public interface Transporter {
    @Adaptive({"server", "transport"})
    Server bind(URL url, ChannelHandler handler) throws RemotingException;
 
    @Adaptive({"client", "transport"})
    Client connect(URL url, ChannelHandler handler) throws RemotingException;
}
```

for the method bind(), Adaptive will firstly search `server` key, if no Key were founded then will search `transport` key, to determine the implementation that the proxy represent for.


### SPI Auto Activation

As for Collections SPI, such as: `Filter`, `InvokerListener`, `ExportListener`, `TelnetHandler`, `StatusChecker` etc, multi implementations can be loaded at one time. User can simplify configuration by using auto activation, Like:

```java
import org.apache.dubbo.common.extension.Activate;
import org.apache.dubbo.rpc.Filter;
 
@Activate // Active for any condition
public class XxxFilter implements Filter {
    // ...
}
```

Or:

```java
import org.apache.dubbo.common.extension.Activate;
import org.apache.dubbo.rpc.Filter;
 
@Activate("xxx") // when configed xxx parameter and the parameter has a valid value,the SPI is activated, for example configed cache="lru", auto acitivate CacheFilter.
public class XxxFilter implements Filter {
    // ...
}
```

Or:

```java
import org.apache.dubbo.common.extension.Activate;
import org.apache.dubbo.rpc.Filter;
 
@Activate(group = "provider", value = "xxx") // only activate for provider, group can be "provider" or "consumer"
public class XxxFilter implements Filter {
    // ...
}
```


[^1]: Note: The config file here is in you own jar file, not in dubbo release jar file, Dubbo will scan all jar files with the same filename in classpath and then merge them together
[^2]: Note: SPI will be loaded in singleton pattern(Please ensure thread safety), cached in `ExtensionLoader` 


