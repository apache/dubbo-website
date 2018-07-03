# Callback parameter

The parameter callback is the same as calling a local callback or listener, just declare which parameter is a callback type in Spring's configuration file, and Dubbo will generate a reverse proxy based on the long connection so that client logic can be called from the server.Can ref to [Sample code in the dubbo project](https://github.com/apache/incubator-dubbo/tree/master/dubbo-test/dubbo-test-examples/src/main/java/com/alibaba/dubbo/examples/callback).

## Example of service interface

### CallbackService.java

```java
package com.callback;

public interface CallbackService {
    void addListener(String key, CallbackListener listener);
}
```

### CallbackListener.java

```java
package com.callback;

public interface CallbackListener {
    void changed(String msg);
}
```
## Example of service provider interface implementation

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
                        Thread.sleep(5000); // Timed trigger change notification
                    } catch (Throwable t) { // Defense fault tolerance
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
        listener.changed(getChanged(key)); // send change notification
    }

    private String getChanged(String key) {
        return "Changed: " + new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
    }
}
```

## Example of service provider configuration

```xml
<bean id="callbackService" class="com.callback.impl.CallbackServiceImpl" />
<dubbo:service interface="com.callback.CallbackService" ref="callbackService" connections="1" callbacks="1000">
    <dubbo:method name="addListener">
        <dubbo:argument index="1" callback="true" />
        <!--also can via specified argument type-->
        <!--<dubbo:argument type="com.demo.CallbackListener" callback="true" />-->
    </dubbo:method>
</dubbo:service>
```

## Example of service consumer configuration

```xml
<dubbo:reference id="callbackService" interface="com.callback.CallbackService" />
```
## Example of service consumer call

```java
ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext("classpath:consumer.xml");
context.start();

CallbackService callbackService = (CallbackService) context.getBean("callbackService");

callbackService.addListener("http://10.20.160.198/wiki/display/dubbo/foo.bar", new CallbackListener(){
    public void changed(String msg) {
        System.out.println("callback1:" + msg);
    }
});
```

**NOTE** `2.0.6+` version supported.
