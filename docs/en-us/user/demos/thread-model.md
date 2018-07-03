

# Thread Model

## Thread Model

* If events handing can be executed quickly without sending new request like marking in memory. Events should be handled by I/O thread since it reduces thread dispatching.
* If event handling will be executed slowly or needs to send new I/O request like querying from database, events should be handled in thread pool. Otherwise, I/O thread will be blocked and then will be not able to receive requests.
* If events are handled by I/O thread, and send new I/O requests during the handling like sending a l login request during connect event, it will alert with “Potentially leading to deadlock”, but deadlock will not happen actually.



![dubbo-protocol](../sources/images/dubbo-protocol.jpg)


Thus, we need different dispatch strategies and different thread pool configurations to face difference scenarios. 

```xml
<dubbo:protocol name="dubbo" dispatcher="all" threadpool="fixed" threads="100" />
```

## Dispatcher

* all: All messages will be dispatched to thread pool, including request, response, connect event, disconnect event and heartbeat. 
* direct: All messages will not be dispatched to thread pool and will be executed directly by I/O thread.
* message: Only request, response messages will be dispatched to I/O thread. Other messages like disconnect, connect, heartbeat messages will be executed by I/O thread.
* execution: Only request message will be dispatched to thread pool. Other messages like response, connect, disconnect, heartbeat will be directly executed by I/O thread.
* connection: I/O thread will put disconnect and connect events in the queue and execute them sequentially, other messages will be dispatched to the thread pool.

## Thread pool

* fixed: A fixed size of thread pool. It creates threads when starts, never shut down.（default).
* cached: A cached thread pool. Automatically delete the thread when it’s in idle for one minute. Recreate when needed. 
* limit: elastic thread pool. But it can only increase the size of the thread pool. The reason is to avoid performance issue caused by traffic spike when decrease the size of the thread pool.
