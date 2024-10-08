---
aliases:
    - /en/docs3-v2/golang-sdk/tutorial/develop/features/generic/
    - /en/docs3-v2/golang-sdk/tutorial/develop/features/generic/
description: Generic Call
title: Generic Call
type: docs
weight: 7
---






## 1. Dubbo-go Generic Call Java Server

Using Triple protocol + hessian2 serialization scheme

### 1.1 Java Server Startup

1. Transport Structure Definition

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

2. Interface Definition

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

### 1.2 Go Client Generic Call

This section shows how to construct a generic interface reference in the form of an API

```go
// Initialize Reference Configuration
refConf := config.NewReferenceConfigBuilder().
  SetInterface("org.apache.dubbo.UserProvider").
  SetRegistryIDs("zk").
  SetProtocol(tripleConst.TRIPLE).
  SetGeneric(true).
  SetSerialization("hessian2").
  Build()

// Construct Root Configuration, importing registry module
rootConfig := config.NewRootConfigBuilder().
  AddRegistry("zk", config.NewRegistryConfigWithProtocolDefaultPort("zookeeper")).
  Build()

// Reference Configuration initialization, as service discovery needs to pass in the configured rootConfig
if err := refConf.Init(rootConfig); err != nil{
  panic(err)
}

// Generic call loading, service discovery
refConf.GenericLoad(appName)

time.Sleep(time.Second)

// Initiating a generic call
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

where the second parameter is the corresponding Java class name, such as java.lang.String, org.apache.dubbo.User, and the third parameter is the parameter list, where hessian.Object is the interface. The second and third parameters should match the method signature and correspond in order.

Obtain a map structure return result

```
INFO    cmd/client.go:89        GetUser1(userId string) res: map[age:48 class:org.apache.dubbo.User id:A003 name:Joe sex:MAN time:2021-10-04 14:03:03.37 +0800 CST]
```

