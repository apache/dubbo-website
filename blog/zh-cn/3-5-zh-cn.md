<h4>在检测到连接断开后，快速返回阻塞</h4>
由于Provider的执行时间无法预测， 在某些情境下会发生 Provider 本身的执行时间过长，且无有效监控机制时，执行时间超时， timeoutfilter 会被触发 此时执行线程将处于不可操控的状态。
例如 Issue 详情 <a href="https://github.com/apache/incubator-dubbo/issues/1968">#1968</a> 
<a href="https://github.com/apache/incubator-dubbo/issues/519">#519</a>

为了解决这些问题，在以下<a = href="https://github.com/apache/incubator-dubbo/pull/2185/files">代码PR</a>中做出以下改变：

+ 在 dubbp.remoting.exchange.Response 中添加了 SERVER_DISCONNECT 字段， 在此之前只有 SERVER_TIMEOUT 字段， 用于判断服务器是否超时，但是没有利用超时字段决定执行线程是否应该继续。
+ 在 dubbo.remoting.Channel 中添加了 List<Request> unFinishRequest() 方法，用于获取未完成的请求，这一方法在 dubbo.remoting.transport.AbstractChannel 中通过 ConcurrrrentHashSet<Long, Request> 实现, key 为对应 Request 的 ID。除此之外， 在 AbstractChannel 中还实现了删除特定 Request 的方法 ——— void finnishRequest(Response response) 以及清空整个 ReuquestList 的方法 ———— void cleanUnFinishedRequest()
+ 在 dubbo.remoting.transport.AbstractChannel 中的 send() 方法中， 如果待发送的 message 是 Request， 将Request 添加到 message 中。
+ HeaderExchangeHandler 添加disconnected() 清理未完成 Request 的请求。 之前执行 disconnected() 操作时仅仅是调用 handler.disconnect() 方法。在新的变更中，disconnect() 会先将所有未完成的 Request 设置为 SERVER_DISCONNECT， 然后设置错误信息，最后使用 DefaultFuture 接收尚未完成的 Request，并清空 unFinishedRequest 的 List。
+ 在 dubbo.remoting.transport.AbstractClient 中， 为了能够检测服务端调用是否已经不可用， 同样地， 在disconnect() 方法中也会通过 Channel 获取未完成的 Request， 接下来执行和 AbstractChannel 相类似的设置字段/设置错误信息/接受/清空的操作。

在实际使用中，可能需要重写对应抽象类的部分方法
+ 重写该上述 send(Object message, boolean sent)方法， 例如确定将 Request 加入未完成的规则
+ 重写上述 finishRequest(Response response), 实现完成 Response 之后的回调逻辑
