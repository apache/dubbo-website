---
type: docs
title: "The server makes a callback to the client"
linkTitle: "The server makes a callback to the client"
weight: 9
description: "Call client-side logic from server-side via parameter callback"
---
## Feature description
The parameter callback method is the same as calling a local callback or listener, you only need to declare which parameter is the callback type in the Spring configuration file. Dubbo will generate a reverse proxy based on the persistent connection, so that the client logic can be invoked from the server. You can refer to [sample code in the dubbo project](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-callback).

## scenes to be used
The callback function notifies the client of the execution result, or sends a notification. When the method execution time is relatively long, it is similar to an asynchronous call, and the client approval result is called back in the approval workflow.

## How to use
### Service interface example

CallbackService.java
```java
package com. callback;
 
public interface CallbackService {
    void addListener(String key, CallbackListener listener);
}
```

CallbackListener.java
```java
package com. callback;
 
public interface CallbackListener {
    void changed(String msg);
}
```

### Service provider interface implementation example

```java
package com.callback.impl;
 
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
 
import com.callback.CallbackListener;
import com.callback.CallbackService;
 
public class CallbackServiceImpl implements CallbackService {
     
    private final Map<String, CallbackListener> listeners = new ConcurrentHashMap<String, CallbackListener>();
  
    public CallbackServiceImpl() {
        Thread t = new Thread(new Runnable() {
            public void run() {
                while(true) {
                    try {
                        for(Map.Entry<String, CallbackListener> entry : listeners.entrySet()){
                           try {
                               entry.getValue().changed(getChanged(entry.getKey()));
                           } catch (Throwable t) {
                               listeners. remove(entry. getKey());
                           }
                        }
                        Thread.sleep(5000); // Timely trigger change notification
                    } catch (Throwable t) { // defensive fault tolerance
                        t. printStackTrace();
                    }
                }
            }
        });
        t. setDaemon(true);
        t. start();
    }
  
    public void addListener(String key, CallbackListener listener) {
        listeners. put(key, listener);
        listener.changed(getChanged(key)); // send change notification
    }
     
    private String getChanged(String key) {
        return "Changed: " + new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
    }
}
```

### Service provider configuration example

```xml
<bean id="callbackService" class="com.callback.impl.CallbackServiceImpl" />
<dubbo:service interface="com.callback.CallbackService" ref="callbackService" connections="1" callbacks="1000">
    <dubbo:method name="addListener">
        <dubbo:argument index="1" callback="true" />
        <!--You can also specify the type -->
        <!--<dubbo:argument type="com.demo.CallbackListener" callback="true" />-->
    </dubbo:method>
</dubbo:service>
```

### Service consumer configuration example

```xml
<dubbo:reference id="callbackService" interface="com.callback.CallbackService" />
```

### Service consumer call example

```java
ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext("classpath:consumer.xml");
context. start();
 
CallbackService callbackService = (CallbackService) context. getBean("callbackService");
 
callbackService.addListener("foo.bar", new CallbackListener(){
    public void changed(String msg) {
        System.out.println("callback1:" + msg);
    }
});
```