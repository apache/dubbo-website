---
aliases:
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/service/callback-parameter/
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/service/callback-parameter/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/service/callback-parameter/
description: Callback parameter to invoke client logic from the server side
linkTitle: Server Callback to Client
title: Server Callback to Client
type: docs
weight: 9
---





## Feature Description
The callback parameter method is similar to calling a local callback or listener; you only need to declare which parameter is a callback type in the Spring configuration file. Dubbo will generate a reverse proxy based on a long connection, allowing the server to invoke client logic. You can refer to the [example code in the dubbo project](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-callback).

## Use Case
The callback function informs the client of execution results or sends notifications, functioning similarly to asynchronous calls when method execution times are long, such as in approval workflows where the client is notified of approval results.

## Usage
### Service Interface Example

CallbackService.java
```java
package com.callback;
 
public interface CallbackService {
    void addListener(String key, CallbackListener listener);
}
```

CallbackListener.java
```java
package com.callback;
 
public interface CallbackListener {
    void changed(String msg);
}
```

### Service Provider Interface Implementation Example

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
                               listeners.remove(entry.getKey());
                           }
                        }
                        Thread.sleep(5000); // Regularly trigger change notification
                    } catch (Throwable t) { // Fault tolerance
                        t.printStackTrace();
                    }
                }
            }
        });
        t.setDaemon(true);
        t.start();
    }
  
    public void addListener(String key, CallbackListener listener) {
        listeners.put(key, listener);
        listener.changed(getChanged(key)); // Send change notification
    }
     
    private String getChanged(String key) {
        return "Changed: " + new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
    }
}
```

### Service Provider Configuration Example

```xml
<bean id="callbackService" class="com.callback.impl.CallbackServiceImpl" />
<dubbo:service interface="com.callback.CallbackService" ref="callbackService" connections="1" callbacks="1000">
    <dubbo:method name="addListener">
        <dubbo:argument index="1" callback="true" />
        <!-- You can also specify by type -->
        <!--<dubbo:argument type="com.demo.CallbackListener" callback="true" />-->
    </dubbo:method>
</dubbo:service>
```

### Service Consumer Configuration Example

```xml
<dubbo:reference id="callbackService" interface="com.callback.CallbackService" />
```

### Service Consumer Calling Example

```java
ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext("classpath:consumer.xml");
context.start();
 
CallbackService callbackService = (CallbackService) context.getBean("callbackService");
 
callbackService.addListener("foo.bar", new CallbackListener(){
    public void changed(String msg) {
        System.out.println("callback1:" + msg);
    }
});
```
