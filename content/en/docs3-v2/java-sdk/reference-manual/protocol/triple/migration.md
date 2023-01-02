---
type: docs
title: "Dubbo2 Protocol Migration"
linkTitle: "Dubbo2 Protocol Migration"
weight: 10
---

## Dubbo2 protocol migration process

Dubbo2 users use dubbo protocol + custom serialization, such as hessian2 to complete remote calls.

By default, Grpc only supports Protobuf serialization, and it cannot support multi-parameter and method overloading in the Java language.

At the beginning of Dubbo3, one goal was to be perfectly compatible with Dubbo2. Therefore, in order to ensure the smooth upgrade of Dubbo2, the Dubbo framework has done a lot of work to ensure that the upgrade is seamless. Currently, the default serialization is consistent with Dubbo2 as `hessian2`.

Therefore, if you decide to upgrade to the `Triple` protocol of Dubbo3, you only need to modify the protocol name in the configuration to `tri` (note: not triple).

Next we use a [project] (https://github.com/apache/dubbo-samples/tree/master/3-extensions/protocol/dubbo-samples-triple/src/main/java/ org/apache/dubbo/sample/tri/migration) as an example, how to upgrade safely step by step.

1. Only use the `dubbo` protocol to start `provider` and `consumer`, and complete the call.
2. Use `dubbo` and `tri` protocols to start `provider`, use `dubbo` protocol to start `consumer`, and complete the call.
3. Start `provider` and `consumer` using only `tri` protocol, and complete the call.

### Define the service

1. Define the interface
```java
public interface IWrapperGreeter {

    //...
    
    /**
     * This is a normal interface, not serialized using pb
     */
    String sayHello(String request);

}
```

2. The implementation class is as follows
```java
public class IGreeter2Impl implements IWrapperGreeter {

    @Override
    public String sayHello(String request) {
        return "hello," + request;
    }
}
```

### Only use dubbo protocol

To ensure compatibility, we first upgrade some providers to the `dubbo3` version and use the `dubbo` protocol.

Start a [`Provider`] using the `dubbo` protocol (https://github.com/apache/dubbo-samples/tree/master/3-extensions/protocol/dubbo-samples-triple/src/main/java/org /apache/dubbo/sample/tri/migration/ApiMigrationDubboProvider.java) and [`Consumer`](https://github.com/apache/dubbo-samples/tree/master/3-extensions/protocol/dubbo-samples-triple/src/main/java/org/apache/dubbo/sample/tri/migration/ApiMigrationDubboConsumer.java), complete the call, the output is as follows:
![result](/imgs/v3/migration/tri/dubbo3-tri-migration-dubbo-dubbo-result.png)

### Use dubbo and triple protocol at the same time

For the upgrade of online services, it is impossible to complete the provider and consumer upgrades at the same time. It needs to be operated step by step to ensure business stability.
In the second step, the provider provides a dual-protocol way to support dubbo + tri clients at the same time.

The structure is shown in the figure:
![trust](/imgs/v3/migration/tri/migrate-dubbo-tri-strust.png)

> According to the recommended upgrade steps, the provider already supports the tri protocol, so the consumer of dubbo3 can directly use the tri protocol

Start [`Provider`] using `dubbo` protocol and `triple` protocol (https://github.com/apache/dubbo-samples/tree/master/3-extensions/protocol/dubbo-samples-triple/src/main /java/org/apache/dubbo/sample/tri/migration/ApiMigrationBothProvider.java) and [`Consumer`](https://github.com/apache/dubbo-samples/tree/master/3-extensions/protocol/ dubbo-samples-triple/src/main/java/org/apache/dubbo/sample/tri/migration/ApiMigrationBothConsumer.java), complete the call, the output is as follows:

![result](/imgs/v3/migration/tri/dubbo3-tri-migration-both-dubbo-tri-result.png)


### Only use triple protocol

When all consuemr are upgraded to a version that supports the `Triple` protocol, the provider can be switched to only use the `Triple` protocol to start

The structure is shown in the figure:
![trust](/imgs/v3/migration/tri/migrate-only-tri-strust.png)

[Provider](https://github.com/apache/dubbo-samples/tree/master/3-extensions/protocol/dubbo-samples-triple/src/main/java/org/apache/dubbo/sample/tri/ migration/ApiMigrationTriProvider.java)
and [Consumer](https://github.com/apache/dubbo-samples/tree/master/3-extensions/protocol/dubbo-samples-triple/src/main/java/org/apache/dubbo/sample/tri /migration/ApiMigrationTriConsumer.java) to complete the call, the output is as follows:

![result](/imgs/v3/migration/tri/dubbo3-tri-migration-tri-tri-result.png)