---
aliases:
    - /zh/docs3-v2/golang-sdk/tutorial/develop/features/generic/
    - /zh-cn/docs3-v2/golang-sdk/tutorial/develop/features/generic/
description: 泛化调用
title: 泛化调用
type: docs
weight: 7
---






## 1. Dubbo-go 泛化调用 Java Server

使用 Triple 协议 + hessian2 序列化方案

### 1.1 Java-Server启动

1. 传输结构定义

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

2. 接口定义

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

### 1.2 Go-Client 泛化调用

此处展示以 API 的形式构造泛化接口引用

```go
// 初始化 Reference 配置
refConf := config.NewReferenceConfigBuilder().
  SetInterface("org.apache.dubbo.UserProvider").
  SetRegistryIDs("zk").
  SetProtocol(tripleConst.TRIPLE).
  SetGeneric(true).
  SetSerialization("hessian2").
  Build()

// 构造 Root 配置，引入注册中心模块
rootConfig := config.NewRootConfigBuilder().
  AddRegistry("zk", config.NewRegistryConfigWithProtocolDefaultPort("zookeeper")).
  Build()

// Reference 配置初始化，因为需要使用注册中心进行服务发现，需要传入经过配置的 rootConfig
if err := refConf.Init(rootConfig); err != nil{
  panic(err)
}

// 泛化调用加载、服务发现
refConf.GenericLoad(appName)

time.Sleep(time.Second)

// 发起泛化调用
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

GenericService 的 Invoke 方法包括三个参数：context.Context, []string, []hessian.Object, 

其中第二个参数为对应参数的 Java 类名，例如java.lang.String、org.apache.dubbo.User，第三个参数为参数列表，hessian.Object 即为 interface。第二、第三个参数应与方法签名一致，按顺序对应。

获得map结构的返回结果

```
INFO    cmd/client.go:89        GetUser1(userId string) res: map[age:48 class:org.apache.dubbo.User id:A003 name:Joe sex:MAN time:2021-10-04 14:03:03.37 +0800 CST]
```