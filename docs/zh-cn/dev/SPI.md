# 扩展点加载

## 扩展点配置

### 来源：

Dubbo 的扩展点加载从 JDK 标准的 SPI (Service Provider Interface) 扩展点发现机制加强而来。

Dubbo 改进了 JDK 标准的 SPI 的以下问题：

* JDK 标准的 SPI 会一次性实例化扩展点所有实现，如果有扩展实现初始化很耗时，但如果没用上也加载，会很浪费资源。
* 如果扩展点加载失败，连扩展点的名称都拿不到了。比如：JDK 标准的 ScriptEngine，通过 `getName()` 获取脚本类型的名称，但如果 RubyScriptEngine 因为所依赖的 jruby.jar 不存在，导致 RubyScriptEngine 类加载失败，这个失败原因被吃掉了，和 ruby 对应不起来，当用户执行 ruby  脚本时，会报不支持 ruby，而不是真正失败的原因。
* 增加了对扩展点 IoC 和 AOP 的支持，一个扩展点可以直接 setter 注入其它扩展点。

### 约定：

在扩展类的 jar 包内 [^1]，放置扩展点配置文件 `META-INF/dubbo/接口全限定名`，内容为：`配置名=扩展实现类全限定名`，多个实现类用换行符分隔。

### 示例：

以扩展 Dubbo 的协议为例，在协议的实现 jar 包内放置文本文件：`META-INF/dubbo/com.alibaba.dubbo.rpc.Protocol`，内容为：

```properties
xxx=com.alibaba.xxx.XxxProtocol
```

实现类内容 [^2]：

```java
package com.alibaba.xxx;
 
import com.alibaba.dubbo.rpc.Protocol;
 
public class XxxProtocol implemenets Protocol { 
    // ...
}
```

### 配置模块中的配置

Dubbo 配置模块中，扩展点均有对应配置属性或标签，通过配置指定使用哪个扩展实现。比如：

```xml
<dubbo:protocol name="xxx" />
```

## 扩展点特性

### 扩展点自动包装

自动包装扩展点的 Wrapper 类。`ExtensionLoader` 在加载扩展点时，如果加载到的扩展点有拷贝构造函数，则判定为扩展点 Wrapper 类。

Wrapper类内容：

```java
package com.alibaba.xxx;
 
import com.alibaba.dubbo.rpc.Protocol;
 
public class XxxProtocolWrapper implemenets Protocol {
    Protocol impl;
 
    public XxxProtocol(Protocol protocol) { impl = protocol; }
 
    // 接口方法做一个操作后，再调用extension的方法
    public void refer() {
        //... 一些操作
        impl.refer();
        // ... 一些操作
    }
 
    // ...
}
```

Wrapper 类同样实现了扩展点接口，但是 Wrapper 不是扩展点的真正实现。它的用途主要是用于从 `ExtensionLoader` 返回扩展点时，包装在真正的扩展点实现外。即从 `ExtensionLoader` 中返回的实际上是 Wrapper 类的实例，Wrapper 持有了实际的扩展点实现类。

扩展点的 Wrapper 类可以有多个，也可以根据需要新增。

通过 Wrapper 类可以把所有扩展点公共逻辑移至 Wrapper 中。新加的 Wrapper 在所有的扩展点上添加了逻辑，有些类似 AOP，即 Wrapper 代理了扩展点。

### 扩展点自动装配

加载扩展点时，自动注入依赖的扩展点。加载扩展点时，扩展点实现类的成员如果为其它扩展点类型，`ExtensionLoader` 在会自动注入依赖的扩展点。`ExtensionLoader` 通过扫描扩展点实现类的所有 setter 方法来判定其成员。即 `ExtensionLoader` 会执行扩展点的拼装操作。

示例：有两个为扩展点 `CarMaker`（造车者）、`WheelMaker` (造轮者)

接口类如下：

```java
public interface CarMaker {
    Car makeCar();
}
 
public interface WheelMaker {
    Wheel makeWheel();
}
```

`CarMaker` 的一个实现类：

```java
public class RaceCarMaker implemenets CarMaker {
    WheelMaker wheelMaker;
 
    public setWheelMaker(WheelMaker wheelMaker) {
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

`ExtensionLoader` 加载 `CarMaker` 的扩展点实现 `RaceCar` 时，`setWheelMaker` 方法的 `WheelMaker` 也是扩展点则会注入 `WheelMaker` 的实现。

这里带来另一个问题，`ExtensionLoader` 要注入依赖扩展点时，如何决定要注入依赖扩展点的哪个实现。在这个示例中，即是在多个`WheelMaker` 的实现中要注入哪个。

这个问题在下面一点 [扩展点自适应](#扩展点自适应) 中说明。

### 扩展点自适应

`ExtensionLoader` 注入的依赖扩展点是一个 `Adaptive` 实例，直到扩展点方法执行时才决定调用是一个扩展点实现。

Dubbo 使用 URL 对象（包含了Key-Value）传递配置信息。

扩展点方法调用会有URL参数（或是参数有URL成员）

这样依赖的扩展点也可以从URL拿到配置信息，所有的扩展点自己定好配置的Key后，配置信息从URL上从最外层传入。URL在配置传递上即是一条总线。

示例：有两个为扩展点 `CarMaker`、`WheelMaker`

接口类如下：

```java
public interface CarMaker {
    Car makeCar(URL url);
}
 
public interface WheelMaker {
    Wheel makeWheel(URL url);
}
```

`CarMaker` 的一个实现类：

```java
public class RaceCarMaker implemenets CarMaker {
    WheelMaker wheelMaker;
 
    public setWheelMaker(WheelMaker wheelMaker) {
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

当上面执行

```java
// ...
Wheel wheel = wheelMaker.makeWheel(url);
// ...
```

时，注入的 `Adaptive` 实例可以提取约定 Key 来决定使用哪个 `WheelMaker` 实现来调用对应实现的真正的 `makeWheel` 方法。如提取 `wheel.type`, key 即 `url.get("wheel.type")` 来决定 `WheelMake` 实现。`Adaptive` 实例的逻辑是固定，指定提取的 URL 的 Key，即可以代理真正的实现类上，可以动态生成。

在 Dubbo 的 `ExtensionLoader` 的扩展点类对应的 `Adaptive` 实现是在加载扩展点里动态生成。指定提取的 URL 的 Key 通过 `@Adaptive` 注解在接口方法上提供。

下面是 Dubbo 的 Transporter 扩展点的代码：

```java
public interface Transporter {
    @Adaptive({"server", "transport"})
    Server bind(URL url, ChannelHandler handler) throws RemotingException;
 
    @Adaptive({"client", "transport"})
    Client connect(URL url, ChannelHandler handler) throws RemotingException;
}
```

对于 bind() 方法，Adaptive 实现先查找 `server` key，如果该 Key 没有值则找 `transport` key 值，来决定代理到哪个实际扩展点。


### 扩展点自动激活

对于集合类扩展点，比如：`Filter`, `InvokerListener`, `ExportListener`, `TelnetHandler`, `StatusChecker` 等，可以同时加载多个实现，此时，可以用自动激活来简化配置，如：

```java
import com.alibaba.dubbo.common.extension.Activate;
import com.alibaba.dubbo.rpc.Filter;
 
@Activate // 无条件自动激活
public class XxxFilter implements Filter {
    // ...
}
```

或：

```java
import com.alibaba.dubbo.common.extension.Activate;
import com.alibaba.dubbo.rpc.Filter;
 
@Activate("xxx") // 当配置了xxx参数，并且参数为有效值时激活，比如配了cache="lru"，自动激活CacheFilter。
public class XxxFilter implements Filter {
    // ...
}
```

或：

```java
import com.alibaba.dubbo.common.extension.Activate;
import com.alibaba.dubbo.rpc.Filter;
 
@Activate(group = "provider", value = "xxx") // 只对提供方激活，group可选"provider"或"consumer"
public class XxxFilter implements Filter {
    // ...
}
```


[^1]: 注意：这里的配置文件是放在你自己的 jar 包内，不是 dubbo 本身的 jar 包内，Dubbo 会全 ClassPath 扫描所有 jar 包内同名的这个文件，然后进行合并
[^2]: 注意：扩展点使用单一实例加载（请确保扩展实现的线程安全性），缓存在 `ExtensionLoader` 中


