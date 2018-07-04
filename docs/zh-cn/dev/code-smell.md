# 坏味道

这里记录的是 Dubbo 设计或实现不优雅的地方。

## URL 转换

### 1. 点对点暴露和引用服务

直接暴露服务：

```
EXPORT(dubbo://provider-address/com.xxx.XxxService?version=1.0.0")
```

点对点直连服务：

```
REFER(dubbo://provider-address/com.xxx.XxxService?version=1.0.0)
```

### 2. 通过注册中心暴露服务

向注册中心暴露服务：

```
EXPORT(registry://registry-address/com.alibaba.dubbo.registry.RegistrySerevice?registry=dubbo&export=ENCODE(dubbo://provider-address/com.xxx.XxxService?version=1.0.0))
```

获取注册中心：

```
url.setProtocol(url.getParameter("registry", "dubbo"))
GETREGISTRY(dubbo://registry-address/com.alibaba.dubbo.registry.RegistrySerevice)
```

注册服务地址：

```
url.getParameterAndDecoded("export"))
REGISTER(dubbo://provider-address/com.xxx.XxxService?version=1.0.0)
```

### 3. 通过注册中心引用服务

从注册中心订阅服务：

```
REFER(registry://registry-address/com.alibaba.dubbo.registry.RegistrySerevice?registry=dubbo&refer=ENCODE(version=1.0.0))
```

获取注册中心：

```
url.setProtocol(url.getParameter("registry", "dubbo"))
GETREGISTRY(dubbo://registry-address/com.alibaba.dubbo.registry.RegistrySerevice)
```

订阅服务地址：

```
url.addParameters(url.getParameterAndDecoded("refer"))
SUBSCRIBE(dubbo://registry-address/com.xxx.XxxService?version=1.0.0)
```

通知服务地址：

```
url.addParameters(url.getParameterAndDecoded("refer"))
NOTIFY(dubbo://provider-address/com.xxx.XxxService?version=1.0.0)
```

### 4. 注册中心推送路由规则

注册中心路由规则推送：

```
NOTIFY(route://registry-address/com.xxx.XxxService?router=script&type=js&rule=ENCODE(function{...}))
```

获取路由器：

```
url.setProtocol(url.getParameter("router", "script"))
GETROUTE(script://registry-address/com.xxx.XxxService?type=js&rule=ENCODE(function{...}))
```

### 5. 从文件加载路由规则

从文件加载路由规则：

```
GETROUTE(file://path/file.js?router=script)
```

获取路由器：

```
url.setProtocol(url.getParameter("router", "script")).addParameter("type", SUFFIX(file)).addParameter("rule", READ(file))
GETROUTE(script://path/file.js?type=js&rule=ENCODE(function{...}))
```

## 调用参数

* path 服务路径
* group 服务分组
* version 服务版本
* dubbo 使用的 dubbo 版本
* token 验证令牌
* timeout 调用超时

## 扩展点的加载

### 1. 自适应扩展点

ExtensionLoader 加载扩展点时，会检查扩展点的属性（通过set方法判断），如该属性是扩展点类型，则会注入扩展点对象。因为注入时不能确定使用哪个扩展点（在使用时确定），所以注入的是一个自适应扩展（一个代理）。自适应扩展点调用时，选取一个真正的扩展点，并代理到其上完成调用。Dubbo 是根据调用方法参数（上面有调用哪个扩展点的信息）来选取一个真正的扩展点。

在 Dubbo 给定所有的扩展点上调用都有 URL 参数（整个扩展点网的上下文信息）。自适应扩展即是从 URL 确定要调用哪个扩展点实现。URL 哪个 Key 的 Value 用来确定使用哪个扩展点，这个信息通过的 `@Adaptive` 注解在方法上说明。

```java
@Extension
public interface Car {
    @Adaptive({"http://10.20.160.198/wiki/display/dubbo/car.type", "http://10.20.160.198/wiki/display/dubbo/transport.type"})
    public run(URL url, Type1 arg1, Type2 arg2);
}
```

由于自适应扩展点的上面的约定，ExtensionLoader 会为扩展点自动生成自适应扩展点类(通过字节码)，并将其实例注入。

ExtensionLoader 生成的自适应扩展点类如下：

```java
package <扩展点接口所在包>;
 
public class <扩展点接口名>$Adpative implements <扩展点接口> {
    public <有@Adaptive注解的接口方法>(<方法参数>) {
        if(是否有URL类型方法参数?) 使用该URL参数
        else if(是否有方法类型上有URL属性) 使用该URL属性
        # <else 在加载扩展点生成自适应扩展点类时抛异常，即加载扩展点失败！>
         
        if(获取的URL == null) {
            throw new IllegalArgumentException("url == null");
        }
 
        根据@Adaptive注解上声明的Key的顺序，从URL获致Value，作为实际扩展点名。
        如URL没有Value，则使用缺省扩展点实现。如没有扩展点， throw new IllegalStateException("Fail to get extension");
 
        在扩展点实现调用该方法，并返回结果。
    }
 
    public <有@Adaptive注解的接口方法>(<方法参数>) {
        throw new UnsupportedOperationException("is not adaptive method!");
    }
}
```

`@Adaptive` 注解使用如下：

如果 URL 这些 Key 都没有 Value，使用缺省的扩展（在接口的 Default 中设定的值）。比如，String[] {"key1", "key2"}，表示先在 URL 上找 key1 的 Value 作为要 Adapt 成的 Extension 名；key1 没有 Value，则使用 key2 的 Value 作为要 Adapt 成的 Extension 名。 key2 没有 Value，使用缺省的扩展。如果没有设定缺省扩展，则方法调用会抛出 IllegalStateException。如果不设置则缺省使用 Extension 接口类名的点分隔小写字串。即对于 Extension 接口 `com.alibaba.dubbo.xxx.YyyInvokerWrapper` 的缺省值为 `new String[] {"yyy.invoker.wrapper"}`

## Callback 功能

### 1. 参数回调

主要原理: 在一个 consumer->provider 的长连接上，自动在 Consumer 端暴露一个服务（实现方法参数上声明的接口A），provider 端便可反向调用到 consumer 端的接口实例。

实现细节：

* 为了在传输时能够对回调接口实例进行转换，自动暴露与自动引用目前在 DubboCodec 中实现。此处需要考虑将此逻辑与 codec 逻辑分离。
* 在根据 invocation 信息获取 exporter 时，需要判断是否是回调，如果是回调，会从 attachments 中取得回调服务实例的 id，在获取 exporter，此处用于 consumer 端可以对同一个 callback 接口做不同的实现。

### 2. 事件通知

主要原理：Consumer 在 invoke 方法时，判断如果有配置 onreturn/onerror... 则将 onreturn 对应的参数值(实例方法)加入到异步调用的回调列表中。

实现细节：参数的传递采用 URL，但 URL 中没有支持 string-object，所以将实例方法存储在 staticMap 中，此处实现需要进行改造。

## Lazy连接

DubboProtocol 特有功能，默认关闭。

当客户端与服务端创建代理时，暂不建立 tcp 长连接，当有数据请求时在做连接初始化。

此项功能自动关闭连接重试功能，开启发送重试功能（即发送数据时如果连接已断开，尝试重新建立连接）

## 共享连接

DubboProtocol 特有功能，默认开启。

JVM A 暴露了多个服务，JVM B 引用了 A 中的多个服务，共享连接是说 A 与 B 多个服务调用是通过同一个 TCP 长连接进行数据传输，已达到减少服务端连接数的目的.

实现细节：对于同一个地址由于使用了共享连接，那 invoker 的 destroy 就需要特别注意，一方面要满足对同一个地址 refer 的 invoker 全部 destroy 后，连接需要关闭，另一方面还需要注意如何避免部分 invoker destroy 时不能关闭连接。在实现中采用了引用计数的方案，但为了防范，在连接关闭时，重新建立了一个 Lazy connection (称为幽灵连接), 用于当出现异常场景时，避免影响业务逻辑的正常调用.

## sticky 策略

有多个服务提供者的情况下，配置了 sticky 后，在提供者可用的情况下，调用会继续发送到上一次的服务提供者。sticky 策略默认开启了连接的 lazy 选项, 用于避免开启无用的连接.

## 服务提供者选择逻辑

0. 存在多个服务提供者的情况下，首先根据 Loadbalance 进行选择，如果选择的 provider 处于可用状态，则进行后续调用
0. 如果第一步选择的服务提供者不可用，则从剩余服务提供者列表中继续选择，如果可用，进行后续调用
0. 如果所有的服务提供者都不可用，重新遍历整个列表（优先从没有选过的列表中选择），判断是否有可用的服务提供者（选择过程中，不可用的服务提供者可能会恢复到可用状态），如果有，则进行后续调用
0. 如果第三步没有选择出可用的服务提供者，会选第一步选出的 invoker 中的下一个（如果不是最后一个），避免碰撞。



