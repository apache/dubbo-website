---
description: ""
linkTitle: 服务测试
no_list: true
title: Admin 服务测试功能简介
type: docs
weight: 3
working_in_progress: true
---

服务测试功能通常提供给 Dubbo 服务的开发者使用，用来对自己发布的服务进行自测。通过在 Admin 控制台上模拟真实的消费端进程，对服务提供者发起调用，并验证调用结果是否符合预期。

## 使用方式

### 准备用例
1. 启动用例

    可以参考 [快速开始](../../../quickstart/java/) 启动一个简单的 Dubbo 服务，对于服务测试来说，只需要启动 provider 即可。

2. 查询服务

    完成服务端部署后，可以到 Admin 的 `服务测试` 页面查询对应的服务:

    ![testSearch](/imgs/blog/admin/testSearch.jpg)

    这里的信息和元数据类似，包含方法名，参数类型和返回值信息，点击右边的标签就可以进入服务测试页面

### 执行服务测试

服务测试页面包含了两个 json 编辑器，参数类型的信息都是以 json 格式保存。

如以下示例所示，在左侧编辑器中填入对应的参数值(本例中数类型是 `String` )，填写完成后点击 `执行` 即可对服务端发起调用，调用结果展示在右边的编辑器中。

![testSuccess](/imgs/blog/admin/testSuccess.jpg)

如果调用失败，会显示详细的失败原因，下面来看一下调用失败的例子：

![testFail](/imgs/blog/admin/testFail.jpg)

本例中，先关掉 Dubbo 服务提供者的进程，再执行服务测试，可以看到返回的结果是`找不到服务提供者`的异常。和普通调用一样，业务和框架的异常都会返回在结果中，方便业务排查。

### 复合类型参数的填写

考虑 `UserService` 中的以下方法和类型：

```java
//org.apache.dubbo.demo.api.UserService
Result getUser(String name, UserInfoDO userInfoDO);
```
```java
public class UserInfoDO {
    private int id;
    private LocationDO locationDO;
    private DepartmentDO departmentDO;

    @Override
    public String toString() {
        return "UserInfoDO{" +
                "id=" + id +
                ", locationDO=" + locationDO.toString() +
                ", departmentDO=" + departmentDO.toString() +
                '}';
    }
}
```

```java
public class DepartmentDO {

    private String departName;
    private LocationDO departLocation;

    @Override
    public String toString() {
        return "DepartmentDO{" +
                "departName='" + departName + '\'' +
                ", departLocation=" + departLocation.toString() +
                '}';
    }
}
```

```java
public class LocationDO {
    private String address;
    private int postNum;

    @Override
    public String toString() {
        return "LocationDO{" +
                "address='" + address + '\'' +
                ", postNum=" + postNum +
                '}';
    }
}
```
参数是比较复杂的符合类型参数，服务测试的时候，会逐层展开填写每一个field的值，如下图所示：
![complex](/imgs/blog/admin/complex.jpg)
同样可以调用成功并且返回结果

## 原理

### 数据来源

服务测试中，最重要的就是完整的方法签名信息，和参数的类型信息，有了这些信息才能够一步步填入每个参数的值，拼装出完整的服务消费者。因此，使用服务测试的前提是在 Dubbo 中开启元数据中心（默认开启，Zookeeper、Nacos、Redis 等默认以注册中心做为元数据中心），Dubbo Admin 的方法签名和参数类型信息就是元数据中心来的：

![medatada](/imgs/blog/admin/metadata.png)

如图所示，服务端在运行的时候会将服务的元数据信息注册到元数据中心，格式如下：

```json
{
    ...
    "methods": [
        {
            "name": "sayHello",
            "parameterTypes": [
                "org.apache.dubbo.demo.model.User"
            ],
            "returnType": "org.apache.dubbo.demo.model.Result"
        },
      ...
    ],
    "types": [
        {
            "type": "char"
        },
        {
            "type": "long"
        },
        {
            "type": "org.apache.dubbo.demo.model.Result",
            "properties": {
                "msg": {
                    "type": "java.lang.String",
                    "properties": {
                        "value": {
                            "type": "char[]"
                        },
                        "hash": {
                            "type": "int"
                        }
                    }
                },
                "userName": {
                    "type": "java.lang.String",
                    "properties": {
                        "value": {
                            "type": "char[]"
                        },
                        "hash": {
                            "type": "int"
                        }
                    }
                }
            }
        },
        {
            "type": "org.apache.dubbo.demo.model.User",
            "properties": {
                "id": {
                    "type": "java.lang.Long",
                    "properties": {
                        "value": {
                            "type": "long"
                        }
                    }
                },
                "username": {
                    "type": "java.lang.Sring",
                    "properties": {
                        "value": {
                            "type": "char[]"
                        },
                        "hash": {
                            "type": "int"
                        }
                    }
                }
            }
        },
       ...
    ]
}
```
与服务测试相关的就是`methods`和`types`所包含的方法和类型信息，Dubbo Admin根据这些信息，将参数渲染到服务测试页面的Json Editor中，由用户来输入每个参数，每个成员变量的值。

### 泛化调用

有了参数类型，下一个问题就是怎么能够调用到服务端，在传统的Dubbo RPC调用中，客户端需要依赖服务端的API jar包 (参考 [Quick Start](https://github.com/apache/dubbo-samples/tree/master/1-basic/dubbo-samples-spring-boot/dubbo-samples-spring-boot-consumer) 中的消费端示例，这对于 Dubbo Admin 来说不太可能，因为服务的上下线是动态的，Dubbo Admin 无法动态增加 jar 包依赖，因此需要用到 Dubbo 中的[**泛化调用**](../../../mannual/java-sdk/advanced-features-and-usage/service/generic-reference/)，指的是在没有服务端API接口的情况下，客户端直接通过 `GenericService` 接口来发起服务调用，返回值中的数据对象都用Map来表示。泛化调用在服务端不需要做特殊处理，只需要客户端发起即可。