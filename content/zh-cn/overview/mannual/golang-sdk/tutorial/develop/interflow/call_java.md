---
aliases:
    - /zh/docs3-v2/golang-sdk/tutorial/develop/interflow/call_java/
    - /zh-cn/docs3-v2/golang-sdk/tutorial/develop/interflow/call_java/
description: 与 Java 应用跨语言互通
title: 与 Java 应用跨语言互通
type: docs
weight: 4
---






## 准备工作

### 环境

JDK 8，Golang >= 1.15，Dubbo 3.0.2，zookeeper 启动，

### Go- Java 互通前提

- Go/Java 定义的传输结构一致

  - PB 序列化

  proto for Go

  ```protobuf
  // The response message containing the greetings
  message User {
    string name = 1;
    string id = 2;
    int32 age = 3;
  }
  ```

  proto for Java

  ```protobuf
  // The response message containing the greetings
  message User {
    string name = 1;
    string id = 2;
    int32 age = 3;
  }
  ```

  - Hessian 序列化

  POJO for Go，需参考 [Dubbogo Hessian 序列化支持文档](https://cn.dubbo.apache.org/zh-cn/overview/mannual/golang-sdk/tutorial/develop/interflow/call_java/)

  ```go
  type User struct {
    ID   string
    Name string
    Age  int32
  }
  
  func (u *User) JavaClassName() string {
  	return "org.apache.dubbo.User"
  }
  
  func init(){
  	hessian.RegisterPOJO(&User{})  
  }
  ```

  POJO for Java

  ```java
  package org.apache.dubbo
    
  public class User {
    private String id;
    private String name;
    private int age;
  }
  ```

- Java 需要互通的方法签名与 Go 一致

  例如：

  Java Interface

  ```java
  public interface IGreeter {
    /**
     * <pre>
     *  Sends a greeting
     * </pre>
     */
  	User sayHello(HelloRequest request);
  }
  ```

  Go client (由protoc-gen-go-triple 根据 proto 文件自动生成)

  ```go
  type GreeterClientImpl struct {
  	// Sends a greeting
  	SayHello func(ctx context.Context, in *HelloRequest) (*User, error)
  }
  ```

  Go server (由开发者定义)

  ```go
  type GreeterProvider struct {
  	api.GreeterProviderBase
  }
  
  func (s *GreeterProvider) SayHello(ctx context.Context, in *api.HelloRequest) (*api.User, error) {
  	logger.Infof("Dubbo3 GreeterProvider get user name = %s\n", in.Name)
  	return &api.User{Name: "Hello " + in.Name, Id: "12345", Age: 21}, nil
  }
  ```

  Go 方法需要遵守 [Dubbogo 3.0 用户服务接口定义规范](https://www.yuque.com/docs/share/eff9c51f-a7f4-47d6-87ff-11a2152bdffe?)

  

- Java 的三元组与Go service/reference 配置的 interface 一致

  三元组，即为接口级别配置的：interface, group, version。**其中需要注意，group 和 version 的概念为 dubbo 接口的 group 和vesion，在启动 dubbo-java 服务时配置于 spring cloud 的 properties 文件中，并非pom.xml 中 mvn 依赖的version。** group 和version 默认为空，在 dubbo-go 框架中，可以在service/reference 的对应位置指定 group 和 version。

  例如：

  Java 的接口全名：com.apache.dubbo.sample.basic.IGreeter，接口 version 为v1.0.1, group 为

  Go-client: 

  ```yaml
  references:
    GreeterClientImpl:
      protocol: tri
      interface: com.apache.dubbo.sample.basic.IGreeter # must be compatible with grpc or dubbo-java
      group: dubbogo # 需要与服务端对应 默认为空
      version: v1.0.1 # 需要与服务端对应 默认为空
  ```

  Go-server:

  ```yaml
  services:
    GreeterProvider:
      protocol-ids: tripleProtocol
      interface: com.apache.dubbo.sample.basic.IGreeter # must be compatible with grpc or dubbo-java
      group: dubbogo # 需要与服务端对应 默认为空
      version: v1.0.1 # 需要与服务端对应 默认为空
  ```



## 1. 基于 Triple 协议互通 (PB序列化)

参考 [dubbo-go-samples/helloworld](https://github.com/apache/dubbo-go-samples/tree/master/helloworld)

### 1.1 Go-Client -> Java-Server

#### Java-Server 启动

1. 定义 Java 的 PB 文件，可参考 [Dubbo 快速开始](/zh-cn/docs/quick-start/)

```protobuf
syntax = "proto3";

option java_package = "org.apache.dubbo.sample.hello";

package helloworld;

// The request message containing the user's name.
message HelloRequest {
  string name = 1;
}

// The response message containing the greetings
message User {
  string name = 1;
  string id = 2;
  int32 age = 3;
}
```

该接口描述文件定义了将会生成的 Java 类 org.apache.dubbo.sample.hello.Helloworld，以及类中包含的传输结构 HelloRequest 和 User 类。

2. 定义服务接口: 

   com.apache.dubbo.sample.basic.IGreeter

```java
package com.apache.dubbo.sample.basic;

// 引入根据 PB 生成的类
import org.apache.dubbo.sample.hello.Helloworld.User;
import org.apache.dubbo.sample.hello.Helloworld.HelloRequest;

public interface IGreeter {
    /**
     * <pre>
     *  Sends a greeting
     * </pre>
     */
  // 定义接口
	User sayHello(HelloRequest request);
}
```

3. 实现服务接口: 

   IGreeter1Impl.java

```java
package com.apache.dubbo.sample.basic;

import org.apache.dubbo.sample.hello.Helloworld.User;
import org.apache.dubbo.sample.hello.Helloworld.HelloRequest;

public class IGreeter1Impl implements IGreeter {
    @Override
    public User sayHello(HelloRequest request) {
        System.out.println("receiv: " + request);
        User usr = User.newBuilder()
                .setName("hello " + request.getName())
                .setAge(18)
                .setId("12345").build();
        return usr;
    }
}
```

4. 使用 Dubbo3 框架启动服务

   ApiProvider.java

```java
package com.apache.dubbo.sample.basic;

import org.apache.dubbo.common.constants.CommonConstants;
import org.apache.dubbo.config.ApplicationConfig;
import org.apache.dubbo.config.ProtocolConfig;
import org.apache.dubbo.config.RegistryConfig;
import org.apache.dubbo.config.ServiceConfig;
import java.util.concurrent.CountDownLatch;

public class ApiProvider {
    public static void main(String[] args) throws InterruptedException {
      ServiceConfig<IGreeter> service = new ServiceConfig<>();
      service.setInterface(IGreeter.class);
      service.setRef(new IGreeter1Impl());
      // 使用 Triple 协议
      service.setProtocol(new ProtocolConfig(CommonConstants.TRIPLE, 50051));
      service.setApplication(new ApplicationConfig("demo-provider"));
      // 使用 ZK 作为注册中心
      service.setRegistry(new RegistryConfig("zookeeper://127.0.0.1:2181"));
      service.export();
      System.out.println("dubbo service started");
      new CountDownLatch(1).await();
    }
}
```

启动服务，可看到输出如下日志，代表 Java Triple Server 启动成功

```
main  INFO bootstrap.DubboBootstrap:  [DUBBO] DubboBootstrap has started., dubbo version: 3.0.2, current host: 192.168.0.108
dubbo service started
```

#### Go-Client 启动

对于已经启动的Dubbo服务，如需要开发与其对应的Go-client，需要进行如下步骤：

1. 编写与 Java 适配的 proto文件

   samples_api.proto

```protobuf
syntax = "proto3";
package api; // pacakge 名随意指定

// necessary
option go_package = "./;api";

// The greeting service definition.
service Greeter {
  // Sends a greeting
  rpc SayHello (HelloRequest) returns (User) {}
}

// The request message containing the user's name.
message HelloRequest {
  string name = 1;
}

// The response message containing the greetings
message User {
  string name = 1;
  string id = 2;
  int32 age = 3;
}
```

2. 使用 protoc-gen-triple 生成接口文件

```bash
protoc -I . samples_api.proto --triple_out=plugins=triple:.
```

3. 撰写配置文件: dubbogo.yml

```yaml
dubbo:
  registries:
    demoZK:
      protocol: zookeeper
      address: 127.0.0.1:2181
  consumer:
    references:
      GreeterClientImpl:
        protocol: tri
        interface: com.apache.dubbo.sample.basic.IGreeter # must be compatible with grpc or dubbo-java
```

4. 撰写 main.go 文件，发起调用

```go
// 引入生成的接口结构
var grpcGreeterImpl = new(api.GreeterClientImpl)

// export DUBBO_GO_CONFIG_PATH=dubbogo.yml
func main() {
	config.SetConsumerService(grpcGreeterImpl)
	if err := config.Load(); err != nil {
		panic(err)
	}
	time.Sleep(3 * time.Second)

	logger.Info("start to test dubbo")
	req := &api.HelloRequest{
		Name: "laurence",
	}
	reply, err := grpcGreeterImpl.SayHello(context.Background(), req)
	if err != nil {
		logger.Error(err)
	}
	logger.Infof("client response result: %v\n", reply)
}
```

5. 可查看到调用成功的日志

- go-client

```
cmd/client.go:53        client response result: name:"hello laurence" id:"12345" age:18 
```

- java-server

```
receiv: name: "laurence"
```

### 1.2 Java-Client -> Go-Server

#### Go-Server 启动

1. 定义配置文件

```yaml
dubbo:
  registries:
    demoZK:
      protocol: zookeeper
      address: 127.0.0.1:2181
  protocols:
    triple:
      name: tri
      port: 20000
  provider:
    services:
      GreeterProvider:
        interface: com.apache.dubbo.sample.basic.IGreeter # must be compatible with grpc or dubbo-java
```

2. 引入传输结构，定义服务

```go
type GreeterProvider struct {
	api.GreeterProviderBase
}

func (s *GreeterProvider) SayHello(ctx context.Context, in *api.HelloRequest) (*api.User, error) {
	logger.Infof("Dubbo3 GreeterProvider get user name = %s\n", in.Name)
	return &api.User{Name: "Hello " + in.Name, Id: "12345", Age: 21}, nil
}
```

3. 启动服务

```go
// export DUBBO_GO_CONFIG_PATH=dubbogo.yml
func main() {
	config.SetProviderService(&GreeterProvider{})
	if err := config.Load(); err != nil {
		panic(err)
	}
	select {}
}
```



#### Java-Client 启动

1. proto 文件编写和接口生成参考上述 java-server 介绍

2. 启动Consumer

   ApiCnosumer.java

```java
public class ApiConsumer {
    public static void main(String[] args) throws InterruptedException, IOException {
        ReferenceConfig<IGreeter> ref = new ReferenceConfig<>();
        ref.setInterface(IGreeter.class);
        ref.setCheck(false);
        ref.setProtocol(CommonConstants.TRIPLE);
        ref.setLazy(true);
        ref.setTimeout(100000);
        ref.setApplication(new ApplicationConfig("demo-consumer"));
        ref.setRegistry(new RegistryConfig("zookeeper://127.0.0.1:2181"));
        final IGreeter iGreeter = ref.get();

        System.out.println("dubbo ref started");
        Helloworld.HelloRequest req = Helloworld.HelloRequest.newBuilder().setName("laurence").build();
        try {
            final Helloworld.User reply = iGreeter.sayHello(req);
            TimeUnit.SECONDS.sleep(1);
            System.out.println("Reply:" + reply);
        } catch (Throwable t) {
            t.printStackTrace();
        }
        System.in.read();
    }
}
```

## 2. 基于 Dubbo 协议互通 (Hessian2序列化)

参考 [dubbo-go-samples/rpc/dubbo](https://github.com/apache/dubbo-go-samples/tree/master/rpc/dubbo)

### 2.1 Go-Client -> Java-Server

#### Java-Server 启动

1. 定义 Java 接口、参数和返回值，可参考 [Dubbo 快速开始](/zh-cn/docs/quick-start/)

```java
package org.apache.dubbo;

// 需要暴露的服务接口
public interface UserProvider {
    User getUser(int usercode);
}

```

```java
package org.apache.dubbo;

public class User implements Serializable  {

    private String id;

    private String name;

    private int age;

    private Date time = new Date();
		/* ... */
}
```

2. 实现服务接口: 

UserProviderImpl.java

```java
package org.apache.dubbo;
public class UserProviderImpl implements UserProvider {
    public User getUser(int userCode) {
        return new User(String.valueOf(userCode), "userCode get", 48);
    }
}

```

3. 使用SpringBoot 启动

Provider.java

```java
package org.apache.dubbo;

// use when config by API
/* 
import java.util.concurrent.CountDownLatch;

import org.apache.dubbo.common.constants.CommonConstants;
import org.apache.dubbo.config.ApplicationConfig;
import org.apache.dubbo.config.ProtocolConfig;
import org.apache.dubbo.config.RegistryConfig;
import org.apache.dubbo.config.ServiceConfig;
*/
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class Provider {
    // main function, config from spring boot
    public static void main(String[] args) throws Exception {
        ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext(new String[]{"META-INF/spring/dubbo.provider.xml"});
        context.start();
        System.in.read(); // press any key to exit
    }

  
//    config by API
//    public static void startComplexService() throws InterruptedException {
//        ServiceConfig<ComplexProvider> service = new ServiceConfig<>();
//        service.setInterface(ComplexProvider.class);
//        service.setRef(new ComplexProviderImpl());
//        service.setProtocol(new ProtocolConfig(CommonConstants.DUBBO_PROTOCOL, 20001));
//        service.setApplication(new ApplicationConfig("demo-provider"));
//        service.setRegistry(new RegistryConfig("zookeeper://127.0.0.1:2181"));
//        service.export();
//        System.out.println("dubbo service started");
//        new CountDownLatch(1).await();
//    }
}

```

4. 通过Spring 配置 Dubbo 参数

   Resources/META-INF.spring/dubbo.provider.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!--
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
-->

<beans xmlns="http://www.springframework.org/schema/beans"
	   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	   xmlns:dubbo="http://code.alibabatech.com/schema/dubbo"
	   xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-2.5.xsd
	http://code.alibabatech.com/schema/dubbo http://code.alibabatech.com/schema/dubbo/dubbo.xsd">

	<!-- 应用名 -->
	<dubbo:application name="user-info-server"/>
	<!-- 连接到哪个本地注册中心 -->
	<dubbo:registry id="dubbogo"  address="zookeeper://127.0.0.1:2181" />
	<!-- 用dubbo协议在20880端口暴露服务 -->
	<dubbo:protocol id="dubbo" name="dubbo" host="127.0.0.1" port="20010" />
	<!-- 声明需要暴露的服务接口 -->
	<dubbo:service id="aaa" registry="dubbogo" timeout="3000" interface="org.apache.dubbo.UserProvider" ref="demoService"/>
	<dubbo:service id="bbb" registry="dubbogo" timeout="3000" interface="org.apache.dubbo.UserProvider" ref="otherService" version="2.0"/>
	<dubbo:service id="ccc" registry="dubbogo" timeout="3000" interface="org.apache.dubbo.UserProvider" ref="otherService" group="as" version="2.0"/>

	<bean id="demoService" class="org.apache.dubbo.UserProviderImpl" />
	<bean id="otherService" class="org.apache.dubbo.UserProviderAnotherImpl"/>

</beans>
```



启动Provider类，可看到输出如下日志，代表 Dubbo Server 启动成功

```
[DUBBO] DubboBootstrap is ready., dubbo version: 2.7.7, current host: 127.0.0.1
[DUBBO] DubboBootstrap has started., dubbo version: 2.7.7, current host: 127.0.0.1
```

#### Go-Client 启动

对于已经启动的Dubbo服务，如需要开发与其对应的Go-client，需要进行如下步骤：

1. 编写与 Java 适配的 POJO 类 User


```go
import(
  hessian "github.com/apache/dubbo-go-hessian2"
)

// 字段需要与 Java 侧对应，首字母大写
type User struct {
	ID   string
	Name string
	Age  int32
	Time time.Time
}


func (u *User) JavaClassName() string {
	return "org.apache.dubbo.User" // 需要与 Java 侧 User 类名对应
}

func init(){
	hessian.RegisterPOJO(&pkg.User{}) // 注册 POJO
}
```

2. 编写与 Java 侧一致的客户端存根类，其接口方法需要与Java侧对应

   规定第一个参数必须为 context.Context，最后一个返回值必须为 error

```go
import(
	"dubbo.apache.org/dubbo-go/v3/config"
)

var (
	userProvider = &pkg.UserProvider{}
)

// UserProvider 客户端存根类
type UserProvider struct {
  // dubbo标签，用于适配go侧客户端大写方法名 -> java侧小写方法名，只有 dubbo 协议客户端才需要使用
	GetUser  func(ctx context.Context, req int32) (*User, error) `dubbo:"getUser"` 
}

func init(){
  // 注册客户端存根类到框架，实例化客户端接口指针 userProvider
	config.SetConsumerService(userProvider)
}

```

3. 撰写配置文件: dubbogo.yml

```yaml
dubbo:
  registries:
    demoZK: # 定义注册中心ID
      protocol: zookeeper
      timeout: 3s
      address: 127.0.0.1:2181
  consumer:
    references:
      UserProvider: # 存根类名
        protocol: dubbo # dubbo 协议，默认 hessian2 序列化方式
        interface: org.apache.dubbo.UserProvider # 接口需要与Java侧对应
  logger:
    zap-config:
      level: info # 日志级别
```

或者使用Triple + Hessian2 序列化请求Server。本例子如果跟Java Server互通则不能用Triple。

```yaml
dubbo:
  registries:
    demoZK:
      protocol: zookeeper
      timeout: 3s
      address: 127.0.0.1:2181
  consumer:
    references:
      UserProvider: 
        protocol: tri # triple 协议
        serialization: hessian2 # 序列化方式 hessian2，triple 协议默认为 pb 序列化，不配置会报错
        interface: org.apache.dubbo.UserProvider 
  logger:
    zap-config:
      level: info
```

4. 撰写 main.go 文件，发起调用

```go
func main(){
  config.Load()
	var i int32 = 1
	user, err := userProvider.GetUser2(context.TODO(), i)
	if err != nil {
		panic(err)
	}
	logger.Infof("response result: %v", user)
}
```

5. 可查看到调用成功的日志,符合预期

- go-client

```bash
response result: User{ID:1, Name:userCode get, Age:48, Time:2021-10-21 20:25:26.009 +0800 CST}
```

### 2.2 Java-Client -> Go-Server

#### Go-Server 启动

1. 定义配置文件

```yaml
dubbo:
  registries:
    demoZK:
      protocol: zookeeper
      address: 127.0.0.1:2181
  protocols:
    dubbo:
      name: dubbo
      port: 20000
  provider:
    services:
      UserProvider:
        interface: org.apache.dubbo.UserProvider
  logger:
    zap-config:
      level: info
```

2. 引入传输结构，定义服务以及方法名映射

```go
type UserProvider struct {
}

func (u *UserProvider) GetUser(ctx context.Context, req int32) (*User, error) {
	var err error
	logger.Infof("req:%#v", req)
	user := &User{}
	user.ID = strconv.Itoa(int(req))
	return user, err
}

// MethodMapper 定义方法名映射，从 Go 的方法名映射到 Java 小写方法名，只有 dubbo 协议服务接口才需要使用
func (s *UserProvider) MethodMapper() map[string]string {
	return map[string]string{
		"GetUser": "getUser",
	}
}

func init(){
  config.SetProviderService(&pkg.UserProvider{})
}

```

3. 启动服务

```go
// export DUBBO_GO_CONFIG_PATH=dubbogo.yml
func main() {
	if err := config.Load(); err != nil {
		panic(err)
	}
	select {}
}
```



#### Java-Client 启动

1. Java 客户端 Spring 配置

   resources/META-INF.spring/dubbo.consumer.xml

   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <!--
     Licensed under the Apache License, Version 2.0 (the "License");
     you may not use this file except in compliance with the License.
     You may obtain a copy of the License at
   
          http://www.apache.org/licenses/LICENSE-2.0
   
     Unless required by applicable law or agreed to in writing, software
     distributed under the License is distributed on an "AS IS" BASIS,
     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     See the License for the specific language governing permissions and
     limitations under the License.
   -->
   <beans xmlns="http://www.springframework.org/schema/beans"
   	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
   	xmlns:dubbo="http://code.alibabatech.com/schema/dubbo"
   	xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-2.5.xsd
   	http://code.alibabatech.com/schema/dubbo http://code.alibabatech.com/schema/dubbo/dubbo.xsd">
   
   
   	<!-- 消费方应用名，用于计算依赖关系，不是匹配条件，不要与提供方一样 -->
   	<dubbo:application name="user-info-client" />
   	<!-- 连接到哪个本地注册中心 -->
   	<dubbo:registry id="dubbogo"  address="zookeeper://127.0.0.1:2181" />
   	<!-- dubbo.registry.address from dubbo.properties -->
   	<!-- dubbo:registry address="${dubbo.registry.address}" / -->
   
   	<!-- 用dubbo协议在20880端口暴露服务 -->
   	<dubbo:protocol id="dubbo" name="dubbo" />
   
   	<!-- 声明需要使用的服务接口 -->
   	<dubbo:reference registry="dubbogo" check="false" id="userProvider" protocol="dubbo" interface="org.apache.dubbo.UserProvider">
   		<!--<dubbo:parameter key="heartbeat" value="10000"/ -->
       </dubbo:reference>
   
   	<dubbo:reference registry="dubbogo" check="false" id="userProvider1" protocol="dubbo" version="2.0" interface="org.apache.dubbo.UserProvider">
   	</dubbo:reference>
   	<dubbo:reference registry="dubbogo" check="false" id="userProvider2" protocol="dubbo" version="2.0" group="as" interface="org.apache.dubbo.UserProvider">
   	</dubbo:reference>
   </beans>
   
   ```

2. 发起调用

```java
public class Consumer {
    // Define a private variable (Required in Spring)
    private static UserProvider userProvider;

    public static void main(String[] args) throws Exception {
        ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext(new String[]{"META-INF/spring/dubbo.consumer.xml"});
        userProvider = (UserProvider)context.getBean("userProvider");
        testGetUser();
    }
  
 
    private static void testGetUser() throws Exception {
        User user = userProvider.getUser(1);
        System.out.println(user.getId());
    }
}
```