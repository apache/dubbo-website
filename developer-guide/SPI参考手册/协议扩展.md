##### 1. 扩展说明：

RPC协议扩展，封装远程调用细节。

契约：

* 当用户调用 `refer()` 所返回的 `Invoker` 对象的 `invoke()` 方法时，协议需相应执行同 URL 远端 `export()` 传入的 `Invoker` 对象的 `invoke()` 方法。
* 其中，`refer()` 返回的 `Invoker` 由协议实现，协议通常需要在此 `Invoker` 中发送远程请求，`export()` 传入的 `Invoker` 由框架实现并传入，协议不需要关心。

注意：

* 协议不关心业务接口的透明代理，以 `Invoker` 为中心，由外层将 `Invoker` 转换为业务接口。
* 协议不一定要是 TCP 网络通讯，比如通过共享文件，IPC 进程间通讯等。

##### 2. 扩展接口：

* `com.alibaba.dubbo.rpc.Protocol`
* `com.alibaba.dubbo.rpc.Exporter`
* `com.alibaba.dubbo.rpc.Invoker`

```java
public interface Protocol {
    /**
     * 暴露远程服务：<br>
     * 1. 协议在接收请求时，应记录请求来源方地址信息：RpcContext.getContext().setRemoteAddress();<br>
     * 2. export()必须是幂等的，也就是暴露同一个URL的Invoker两次，和暴露一次没有区别。<br>
     * 3. export()传入的Invoker由框架实现并传入，协议不需要关心。<br>
     * 
     * @param <T> 服务的类型
     * @param invoker 服务的执行体
     * @return exporter 暴露服务的引用，用于取消暴露
     * @throws RpcException 当暴露服务出错时抛出，比如端口已占用
     */
    <T> Exporter<T> export(Invoker<T> invoker) throws RpcException;
 
    /**
     * 引用远程服务：<br>
     * 1. 当用户调用refer()所返回的Invoker对象的invoke()方法时，协议需相应执行同URL远端export()传入的Invoker对象的invoke()方法。<br>
     * 2. refer()返回的Invoker由协议实现，协议通常需要在此Invoker中发送远程请求。<br>
     * 3. 当url中有设置check=false时，连接失败不能抛出异常，需内部自动恢复。<br>
     * 
     * @param <T> 服务的类型
     * @param type 服务的类型
     * @param url 远程服务的URL地址
     * @return invoker 服务的本地代理
     * @throws RpcException 当连接服务提供方失败时抛出
     */
    <T> Invoker<T> refer(Class<T> type, URL url) throws RpcException;
 
}
```

##### 3. 扩展配置：

```xml
<dubbo:protocol id="xxx1" name="xxx" /> <!-- 声明协议，如果没有配置id，将以name为id -->
<dubbo:service protocol="xxx1" /> <!-- 引用协议，如果没有配置protocol属性，将在ApplicationContext中自动扫描protocol配置 -->
<dubbo:provider protocol="xxx1" /> <!-- 引用协议缺省值，当<dubbo:service>没有配置prototol属性时，使用此配置 -->
```

##### 4. 已知扩展：

* `com.alibaba.dubbo.rpc.injvm.InjvmProtocol`
* `com.alibaba.dubbo.rpc.dubbo.DubboProtocol`
* `com.alibaba.dubbo.rpc.rmi.RmiProtocol`
* `com.alibaba.dubbo.rpc.http.HttpProtocol`
* `com.alibaba.dubbo.rpc.http.hessian.HessianProtocol`

##### 5. 扩展示例：

Maven项目结构

```

src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxProtocol.java (实现Protocol接口)
                |-XxxExporter.java (实现Exporter接口)
                |-XxxInvoker.java (实现Invoker接口)
    |-resources
        |-META-INF
            |-dubbo
                |-com.alibaba.dubbo.rpc.Protocol (纯文本文件，内容为：xxx=com.xxx.XxxProtocol)
```

XxxProtocol.java

```java
package com.xxx;
 
import com.alibaba.dubbo.rpc.Protocol;
 
public class XxxProtocol implements Protocol {
    public <T> Exporter<T> export(Invoker<T> invoker) throws RpcException {
        return new XxxExporter(invoker);
    }
    public <T> Invoker<T> refer(Class<T> type, URL url) throws RpcException {
        return new XxxInvoker(type, url);
    }
}
```

XxxExporter.java

```java
package com.xxx;
 
import com.alibaba.dubbo.rpc.support.AbstractExporter;
 
public class XxxExporter<T> extends AbstractExporter<T> {
    public XxxExporter(Invoker<T> invoker) throws RemotingException{
        super(invoker);
        // ...
    }
    public void unexport() {
        super.unexport();
        // ...
    }
}
```

XxxInvoker.java

```java
package com.xxx;
 
import com.alibaba.dubbo.rpc.support.AbstractInvoker;
 
public class XxxInvoker<T> extends AbstractInvoker<T> {
    public XxxInvoker(Class<T> type, URL url) throws RemotingException{
        super(type, url);
    }
    protected abstract Object doInvoke(Invocation invocation) throws Throwable {
        // ...
    }
}
```

META-INF/dubbo/com.alibaba.dubbo.rpc.Protocol

```
xxx=com.xxx.XxxProtocol
```