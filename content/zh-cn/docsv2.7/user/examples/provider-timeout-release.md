---
aliases:
    - /zh/docsv2.7/user/examples/provider-timeout-release/
description: Dubbo provider执行超时释放执行线程
linkTitle: provider超时打断
title: provider超时打断
type: docs
weight: 15
---


## 背景
支持provider根据超时时间进行业务打断

适用场景：对于一个provider，如果某个操作执行超时，则打断(释放)该执行线程，而不是仅仅打印超时日志。

{{% alert title="提示" color="primary" %}}
支持版本：`2.7.12` 之后
{{% /alert %}}

#### 核心处理逻辑

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

## 示例

- 设置Dubbo ProtocolConfig 线程分发策略为"all2"。

```java
	/**
	 * 配置协议
	 */
	@Bean
	public ProtocolConfig protocolConfig() {
		ProtocolConfig protocolConfig = new ProtocolConfig();
		protocolConfig.setName("dubbo");
		protocolConfig.setPort(-1);
		protocolConfig.setTransporter("netty4");
		protocolConfig.setThreadpool("fixed");
        // 设置线程分发策略
        protocolConfig.setDispatcher("all2");
        protocolConfig.setThreads(200);
		return protocolConfig;
	}
```

- provider demo

执行超时，直接对业务线程进行打断。即如果provider不能及时返回给counsumer执行结果，则对执行线程进行打断。

```java
// 设置provider执行超时时间为1000ms
@Service(interfaceClass = TestService.class,timeout = 1000)
public class TestServiceImpl implements TestService {
    @Override
    public Integer sum(int a, int b) {
        CountDownLatch latch = new CountDownLatch(2);
        AtomicInteger i = new AtomicInteger();

        new Thread(()->{
            i.incrementAndGet();
            latch.countDown();
        }).start();

        new Thread(()->{
            try {
                TimeUnit.MILLISECONDS.sleep(2000); 
            }catch (InterruptedException e){
                e.printStackTrace();
            }
            i.incrementAndGet();
            latch.countDown();
        }).start();

        try {
            latch.await();
            return i.get();
        }catch (InterruptedException e){
            // 业务执行超时，并且被打断，走入此逻辑
            throw new RuntimeException("call sum timeout");
        }
    }
}
```

即对于上述provider demo，执行最后一个try catch时，如果业务线程被超时释放，则捕获InterruptedException异常进入catch块，返回"call sum timeout"。

- consumer demo

```java
    // 设置consumer超时时间大于服务端执行时间2000
    @Reference(check = false,interfaceClass = TestService.class,timeout = 3000)
    private TestService testService;

    @GetMapping("/sum")
    public String consumeSum(){
        Integer ret = 0;
        try{
             ret = testService.sum(1,1);
        }catch (Exception e){
           return e.getMessage();
        }
        return String.valueOf(ret);
    }
```

- 执行结果

```
curl http://localhost:8081/sum
>call sum timeout 
```