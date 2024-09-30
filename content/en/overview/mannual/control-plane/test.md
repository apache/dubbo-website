---
aliases:
   - /en/overview/reference/admin/test/
   - /en/overview/reference/admin/test/
description: ""
linkTitle: Service Testing
no_list: true
title: Overview of Admin Service Testing Features
type: docs
weight: 3
working_in_progress: true
---

The service testing feature is usually provided for developers of Dubbo services to perform self-testing on their published services. By simulating a real consumer process on the Admin console, calls can be made to the service provider, and the results can be verified to meet expectations.

## Usage

### Prepare Test Cases
1. Start the test case

    You can refer to [Quick Start](../../../quickstart/java/) to start a simple Dubbo service. For service testing, you only need to start the provider.

2. Query Services

    After deploying the server, you can go to the Admin's `Service Testing` page to query the corresponding service:

    ![testSearch](/imgs/blog/admin/testSearch.jpg)

    The information here is similar to metadata and includes method names, parameter types, and return value information. Click the tag on the right to enter the service testing page.

### Execute Service Test

The service testing page has two JSON editors, where the parameter type information is stored in JSON format.

As shown in the example below, fill in the corresponding parameter values in the left editor (in this example, the data type is `String`), and after filling, click `Execute` to call the server, with results displayed in the right editor.

![testSuccess](/imgs/blog/admin/testSuccess.jpg)

If the call fails, the detailed failure reason will be displayed; below is an example of a failed call:

![testFail](/imgs/blog/admin/testFail.jpg)

In this example, the Dubbo service provider's process is first shut down, and then the service test is executed, resulting in an exception indicating that the `service provider cannot be found`. Similar to ordinary calls, both business and framework exceptions are returned in the results for easier troubleshooting.

### Filling Complex Type Parameters

Consider the following method and types in `UserService`:

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

The parameters are relatively complex composite type parameters. During service testing, each field's value is filled in layer by layer, as shown in the following image:
![complex](/imgs/blog/admin/complex.jpg)
It can also be successfully called and return results.

## Principle

### Data Source

In service testing, the most important aspects are the complete method signature information and parameter type information. With this information, each parameter's value can be filled step by step to assemble a complete service consumer. Therefore, a prerequisite for using service testing is to enable the metadata center in Dubbo (enabled by default, with Zookeeper, Nacos, Redis, etc. defaulting to the registry as the metadata center). The method signature and parameter type information in Dubbo Admin come from the metadata center:

![medatada](/imgs/blog/admin/metadata.png)

As shown in the image, when the server is running, it registers the service's metadata to the metadata center in the following format:

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
The `methods` and `types` containing the method and type information related to service testing are used by Dubbo Admin to render the parameters in the JSON Editor on the service testing page for users to input each parameter's values.

### Generic Invocation

With the parameter types defined, the next issue is how to invoke the service on the server. In traditional Dubbo RPC calls, clients rely on the server's API jar package (refer to the consumer example in [Quick Start](https://github.com/apache/dubbo-samples/tree/master/1-basic/dubbo-samples-spring-boot/dubbo-samples-spring-boot-consumer)). However, this is not really feasible for Dubbo Admin, as the service's online and offline status is dynamic, and Dubbo Admin cannot dynamically add jar dependencies. Therefore, the [**generic invocation**](../../../mannual/java-sdk/advanced-features-and-usage/service/generic-reference/) feature in Dubbo is utilized, which allows the client to invoke services directly through the `GenericService` interface without needing the server's API interface. The data objects in the return value are represented using Map. No special processing on the server side is needed for generic invocation; it only needs to be initiated by the client.

