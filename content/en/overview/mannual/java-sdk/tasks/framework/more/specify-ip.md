---
aliases:
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/service/specify-ip/
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/service/specify-ip/
description: Specify the target IP for this call before initiating a Dubbo call
linkTitle: Dynamically Specify IP Call at Runtime
title: Dynamically Specify IP Call
type: docs
weight: 4
---


## Feature Description

When initiating an RPC request, it is necessary to specify the server for this call. Common scenarios include message callbacks, traffic isolation, etc.

## Usage

### Plugin Dependency

First, add the following plugin dependency to your project

```xml
<dependency>
  <groupId>org.apache.dubbo.extensions</groupId>
  <artifactId>dubbo-cluster-specify-address-dubbo3</artifactId>
  <version>3.3.0</version>
</dependency>
```

For Dubbo 2 version

```xml
<dependency>
  <groupId>org.apache.dubbo.extensions</groupId>
  <artifactId>dubbo-cluster-specify-address-dubbo2</artifactId>
  <version>1.0.0</version>
</dependency>
```

### Call Example

```java
ReferenceConfig<DemoService> referenceConfig = new ReferenceConfig<>();
// ... init
DemoService demoService = referenceConfig.get();

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

The parameters for specifying IP calls revolve around the `Address` object. The parameter types are as follows:

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

1. `urlAddress` has the highest priority; if a target URL is specified, it will be used first. (No further matching will be performed)
2. ip + port (non-0 port) is the second priority; matching will be done from addresses already pushed by the registry. (No further matching will be performed)
3. ip is the third priority; matching will be done from addresses already pushed by the registry.

Specifically, if `needToCreate` is specified as `true`, an invoker will be automatically constructed based on the passed parameters. For addresses specified via ip (+ port), the parameters of the first address in the registry will be used as a template for creation; if no address is available, it will be automatically created based on the Dubbo protocol. If you need customized invoker creation logic, please implement the `org.apache.dubbo.rpc.cluster.specifyaddress.UserSpecifiedServiceAddressBuilder` SPI interface. (This feature is only **supported by Dubbo 3 implementation**)

Before each request, the constructed `Address` parameter should be passed to the Dubbo framework through the `UserSpecifiedAddressUtil` utility class.

```java
package org.apache.dubbo.rpc.cluster.specifyaddress;

public class UserSpecifiedAddressUtil {
    
    public static void setAddress(Address address) { ... }
    
}
```

> **You must set it every time, and you must immediately make the call after setting it**. If an interceptor error occurs (the removal of this value in the Dubbo framework happens during the address selection process), it is recommended to set null to avoid memory leaks in ThreadLocal, which may affect subsequent calls.

