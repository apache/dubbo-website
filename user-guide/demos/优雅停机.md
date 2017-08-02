> ![warning](../sources/images/warning-3.gif)  Dubbo是通过JDK的ShutdownHook来完成优雅停机的，所以如果用户使用"kill -9 PID"等强制关闭指令，是不会执行优雅停机的，只有通过"kill PID"时，才会执行。

**原理**

服务提供方

* 停止时，先标记为不接收新请求，新请求过来时直接报错，让客户端重试其它机器。
* 然后，检测线程池中的线程是否正在运行，如果有，等待所有线程执行完成，除非超时，则强制关闭。

服务消费方

* 停止时，不再发起新的调用请求，所有新的调用在客户端即报错。
* 然后，检测有没有请求的响应还没有返回，等待响应返回，除非超时，则强制关闭。

设置优雅停机超时时间，缺省超时时间是10秒：(超时则强制关闭)

```xml

<dubbo:application ...>
    <dubbo:parameter key="shutdown.timeout" value="60000" /> <!-- 单位毫秒 -->
</dubbo:application>
```

如果ShutdownHook不能生效，可以自行调用：

```java
ProtocolConfig.destroyAll();
```