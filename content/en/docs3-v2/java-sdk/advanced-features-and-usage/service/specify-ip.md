---
type: docs
title: "Dynamic IP call"
linkTitle: "Dynamic IP call at runtime"
weight: 5
description: "Specify the target IP of this call before initiating a Dubbo call"
---
## Feature description
Use the extension of Dubbo to realize the specified IP call.

## scenes to be used

When initiating a request, you need to specify the server for this call, such as message callback, traffic isolation, etc.

## How to use

### Plugin dependencies

Adapt to Dubbo 3 version

```xml
<dependency>
  <groupId>org.apache.dubbo.extensions</groupId>
  <artifactId>dubbo-cluster-specify-address-dubbo3</artifactId>
  <version>1.0.0</version>
</dependency>
```

Adapt to Dubbo 2 version

```xml
<dependency>
  <groupId>org.apache.dubbo.extensions</groupId>
  <artifactId>dubbo-cluster-specify-address-dubbo2</artifactId>
  <version>1.0.0</version>
</dependency>
```

### call example

```java
ReferenceConfig<DemoService> referenceConfig = new ReferenceConfig<>();
// ...init
DemoService demoService = referenceConfig. get();

// for invoke
// 1. find 10.10.10.10:20880 exist
// 2. if not exist, create a invoker to 10.10.10.10:20880 if `needToCreate` is true (only support in Dubbo 3.x's implementation)
UserSpecifiedAddressUtil.setAddress(new Address("10.10.10.10", 20880, true));
demoService.sayHello("world");


// for invoke
// 1. find 10.10.10.10:any exist
// 2. if not exist, create a invoker to 10.10.10.10:20880 if `needToCreate` is true (only support in Dubbo 3.x's implementation)
UserSpecifiedAddressUtil.setAddress(new Address("10.10.10.10", 0, true));
demoService.sayHello("world");
```

### Parameter Description

Parameters specifying an IP call wrap around an `Address` object. The parameter type reference is as follows:

```java
package org.apache.dubbo.rpc.cluster.specifyaddress;

public class Address implements Serializable {
    // ip - priority: 3
    private String ip;

    // ip+port - priority: 2
    private int port;

    // address - priority: 1
    private URL urlAddress;
    
    private boolean needToCreate = false;

    // ignore setter and getter
}
```

1. `urlAddress` is the highest priority, if the URL address of the target is specified, it will be used first. (no longer matches follow-up)
2. ip + port (non-0 port) is the second priority, and will be matched from the addresses that have been pushed by the registration center. (no longer matches follow-up)
3. IP is the third priority, and it will be matched from the addresses that have been pushed by the registration center.

In particular, if `needToCreate` is specified as `true`, an invoker will be automatically built according to the parameters passed in. For addresses specified by specifying ip ( + port ),
It will automatically use the parameter of the first address in the registry to create the template; if there is no address, it will be automatically created based on the Dubbo protocol.
To customize the logic of creating invoker, please implement `org.apache.dubbo.rpc.cluster.specifyaddress.UserSpecifiedServiceAddressBuilder` SPI interface. (This function is only supported by **Dubbo 3 implementation**)

Pass the `UserSpecifiedAddressUtil` tool class to the Dubbo framework before constructing the `Address` parameter for each request.

```java
package org.apache.dubbo.rpc.cluster.specifyaddress;

public class UserSpecifiedAddressUtil {
    
    public static void setAddress(Address address) { ... }
    
}
```

> **Must be set every time, and the call must be initiated immediately after setting**, if there is an interceptor error (remove this value in the Dubbo framework is performed during the address selection process), it is recommended to set null to avoid ThreadLocal memory leaks that will affect the follow-up transfer.