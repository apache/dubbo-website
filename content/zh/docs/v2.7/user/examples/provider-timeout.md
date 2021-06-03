---
type: docs
title: "provider超时"
linkTitle: "provider超时"
weight: 3
description: "Dubbo provider执行超时释放执行线程"
---

支持provider根据超时时间进行业务打断

适用场景：对于一个provider，如果某个操作执行超时，则打断(释放)该执行线程，而不是仅仅打印超时日志。

## 核心处理逻辑

```java
public class AllChannelHandler2 extends AllChannelHandler {

    public static final Timer TIME_OUT_TIMER = new HashedWheelTimer(
            new NamedThreadFactory("dubbo-server-future-timeout", true),
            30,
            TimeUnit.MILLISECONDS);

    public AllChannelHandler2(ChannelHandler handler, URL url) {
        super(handler, url);
    }


    @Override
    public void received(Channel channel, Object message) throws RemotingException {
        ExecutorService executor = getPreferredExecutorService(message);
        try {
            Future<?> future = executor.submit(new ChannelEventRunnable(channel, handler, ChannelState.RECEIVED, message));
            long timeout = this.url.getParameter("timeout", 1000) + 90;
            TIME_OUT_TIMER.newTimeout(t -> {
                if (!future.isDone() && (!future.isCancelled())) {
                    try {
                        future.cancel(true);
                    } catch (Throwable ex) {
                        //ignore
                    }
                }
            }, timeout, TimeUnit.MILLISECONDS);

        } catch (Throwable t) {
            if (message instanceof Request && t instanceof RejectedExecutionException) {
                sendFeedback(channel, (Request) message, t);
                return;
            }
            throw new ExecutionException(message, channel, getClass() + " error when process received event .", t);
        }
    }

}
```

## 使用示例

