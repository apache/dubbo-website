---
title: generalization call
type: docs
weight: 7
---

## 1. Dubbo-go generalization calls Java Server

Use Triple protocol + hessian2 serialization scheme

### 1.1 Java-Server startup

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

### 1.2 Go-Client generalization call

Constructing a generalized interface reference in the form of an API is shown here

```go
// Initialize the Reference configuration
refConf := config. NewReferenceConfigBuilder().
  SetInterface("org. apache. dubbo. UserProvider").
  SetRegistryIDs("zk").
  SetProtocol(tripleConst.TRIPLE).
  SetGeneric(true).
  SetSerialization("hessian2").
  build()

// Construct the Root configuration and import the registry module
rootConfig := config. NewRootConfigBuilder().
  AddRegistry("zk", config. NewRegistryConfigWithProtocolDefaultPort("zookeeper")).
  build()

// Reference configuration initialization, because you need to use the registry for service discovery, you need to pass in the configured rootConfig
if err := refConf.Init(rootConfig); err != nil{
  panic(err)
}

// Generalized call loading, service discovery
refConf. GenericLoad(appName)

time. Sleep(time. Second)

// Initiate generalization call
resp, err := refConf.GetRPCService().(*generic.GenericService).Invoke(
  context. TODO(),
  "getUser1",
  []string{"java. lang. String"},
  []hessian. Object{"A003"},
)

if err != nil {
  panic(err)
}
logger.Infof("GetUser1(userId string) res: %+v", resp)
```

The Invoke method of GenericService includes three parameters: context.Context, []string, []hessian.Object,

The second parameter is the Java class name of the corresponding parameter, such as java.lang.String, org.apache.dubbo.User, the third parameter is the parameter list, and hessian.Object is the interface. The second and third parameters should be consistent with the method signature and correspond in order.

Get the return result of the map structure

```
INFO cmd/client.go:89 GetUser1(userId string) res: map[age:48 class:org.apache.dubbo.User id:A003 name:Joe sex:MAN time:2021-10-04 14:03:03.37 +0800 CST]
```