---
type: docs
title: "provider timeout release"
linkTitle: "provider timeout release"
weight: 15
description: "Dubbo provider executes timeout release"
---

Dubbo allows providers to shutdown operations based on how long the timeout lasts.

Applicable scenario: when a certain operation times out, providers can release that thread instead of simply printing out the timeout log message.

{{% alert title="Notice" color="primary" %}}
support on `2.7.12` or above.
{{% /alert %}}

## Main Logic

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

## Demo

- Set Dubbo ProtocolConfig thread dispatch strategy as "all2".

```java
	/**
	 * Configuration Protocol
	 */
	@Bean
	public ProtocolConfig protocolConfig() {
		ProtocolConfig protocolConfig = new ProtocolConfig();
		protocolConfig.setName("dubbo");
		protocolConfig.setPort(-1);
		protocolConfig.setTransporter("netty4");
		protocolConfig.setThreadpool("fixed");
        // Set up thread dispatch strategy
        protocolConfig.setDispatcher("all2");
        protocolConfig.setThreads(200);
		return protocolConfig;
	}
```

- provider demo

When timeout, the thread will be stopped. In other words, if providers cannot return results to the consumers in time, then the thread will be stopped.

```java
// Set provider timeout period as 1000ms
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
            // when timeout, return the following
            throw new RuntimeException("call sum timeout");
        }
    }
}
```
As for the provider demo above, when running the last try-catch, if the thread is released then catch InterruptedException and return "call sum timeout".


- consumer demo

```java
    // Set consumer timeout period as 2000 longer than the server execution period
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

- execution outcome

```
curl http://localhost:8081/sum
>call sum timeout 
```
