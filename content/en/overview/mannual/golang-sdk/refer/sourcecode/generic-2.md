---
aliases:
    - /en/docs3-v2/golang-sdk/tutorial/develop/features/generic/
    - /en/docs3-v2/golang-sdk/tutorial/develop/features/generic/
    - /en/docs3-v2/golang-sdk/tutorial/develop/features/generic-2/
    - /en/docs3-v2/golang-sdk/tutorial/develop/features/generic-2/
    - /en/overview/mannual/golang-sdk/tutorial/develop/features/generic/
description: Generic Invocation
title: Generic Invocation
type: docs
weight: 8
---






## 1. Dubbogo Generic Invocation to Java Server

Using Triple protocol + hessian2 serialization scheme

Refer to Dubbogo 3.0 [Generic Invocation Documentation](https://www.yuque.com/docs/share/f4e72670-74ab-45b9-bc0c-4b42249ed953?#)

### 1.1 Java Server Startup

1. Transmission structure definition

```java
package org.apache.dubbo;

import java.io.Serializable;
import java.util.Date;

public class User implements Serializable {
	private String id;

  private String name;

  private int age;

  private Date time = new Date();
}
```

2. Interface definition

```java
package org.apache.dubbo;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
//import org.apache.dubbo.rpc.filter.GenericFilter;

public interface UserProvider {
	User GetUser1(String userId);
}
```

### 1.2 Go-Client Generic Invocation

Here is the construction of the generic interface reference in the form of API

```go
// Initialize Reference configuration
refConf := config.NewReferenceConfigBuilder().
  SetInterface("org.apache.dubbo.UserProvider").
  SetRegistryIDs("zk").
  SetProtocol(tripleConst.TRIPLE).
  SetGeneric(true).
  SetSerialization("hessian2").
  Build()

// Construct Root configuration, introducing the registry module
rootConfig := config.NewRootConfigBuilder().
  AddRegistry("zk", config.NewRegistryConfigWithProtocolDefaultPort("zookeeper")).
  Build()

// Reference configuration initialization, as service discovery requires the configured rootConfig
if err := refConf.Init(rootConfig); err != nil{
  panic(err)
}

// Generic invocation loading, service discovery
refConf.GenericLoad(appName)

time.Sleep(time.Second)

// Initiate generic invocation
resp, err := refConf.GetRPCService().(*generic.GenericService).Invoke(
  context.TODO(),
  "getUser1",
  []string{"java.lang.String"},
  []hessian.Object{"A003"},
)

if err != nil {
  panic(err)
}
logger.Infof("GetUser1(userId string) res: %+v", resp)
```

The Invoke method of GenericService includes three parameters: context.Context, []string, []hessian.Object, 

where the second parameter corresponds to the Java class names such as java.lang.String, org.apache.dubbo.User, and the third parameter is the parameter list, hessian.Object as the interface. The second and third parameters should match the method signature in order.

Obtained a map structure return result

```
INFO    cmd/client.go:89        GetUser1(userId string) res: map[age:48 class:org.apache.dubbo.User id:A003 name:Joe sex:MAN time:2021-10-04 14:03:03.37 +0800 CST]
```
