# Graceful Shutdown

Dubbo is graceful shutdown through the `ShutdownHook` of the JDK, so graceful shutdowns are not performed if you force shutdown the command, such as `kill -9 PID`, and will only be executed if `kill PID` is passed.

## Howto

### Service provider

* When stop, first marked as not receiving new requests, the new request directly return the error, so that the client retries other machines.
* Then check thread pool thread is running, if any, waiting for all threads to complete execution, unless overtime, then forced to close.

### Service consumer

* When stop, No longer initiate a new request, all request on the client that got an error.
* Then check the request has not returned the response, waiting for the response to return, unless overtime, then forced to close.

## Configuration shutdown wait time

Set graceful shutdown timeout, the default timeout is 10 seconds, if the overtime is forced to close.

```properties
# dubbo.properties
dubbo.service.shutdown.wait=15000
```

If ShutdownHook does not take effect, you can call it yourself, **in tomcat, it is recommended by extending the ContextListener and call the following code for graceful shutdown**：

```java
ProtocolConfig.destroyAll();
```
