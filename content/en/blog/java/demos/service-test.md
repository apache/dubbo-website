---
title: "Dubbo Admin Service Testing Features"
linkTitle: "Dubbo Admin Service Testing Features"
tags: ["Java"]
date: 2019-08-26
slug: service-test
description: >
   You can call the real service provider on the console through generic invocation 
---

Based on the metadata of Dubbo 2.7, Dubbo Admin implements service testing functions, allowing real service providers to be called on the console through generic invocation.

## Usage
* Deploy Service Provider: You can download the demo [here](https://github.com/nzomkxia/dubbo-demo). This project is based on Spring Boot, making it easy to start from an IDE or command line. For service testing, simply start `dubbo-basic-provider`.
* Service Query: After completing the server deployment, you can query the corresponding service on the Dubbo Admin `Service Testing` page:  
![testSearch](/imgs/blog/admin/testSearch.jpg)  
The information here is similar to the metadata and contains method names, parameter types, and return value information. Click the tab on the right to enter the service testing page.  
* Service Testing:  
![testSuccess](/imgs/blog/admin/testSuccess.jpg)  
The service testing page includes two JSON editors. Parameter type information is stored in JSON format. Here, you need to fill in the corresponding parameter values (in this case, the data type is `String`), and after filling in, click `Execute` to invoke the backend service. The call result is displayed in the editor on the right. If the call fails, detailed failure reasons will be shown. Let's look at an example of a failed call:  
![testFail](/imgs/blog/admin/testFail.jpg)  
In this example, the Dubbo service provider's process is first shut down, and then the service test is executed. The returned result indicates an exception of `Service provider not found`. Similar to normal calls, business and framework exceptions will be returned in the result, facilitating business troubleshooting.

* Complex Type Parameters  
Consider the following methods and types in `UserService`:  
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
The parameters are relatively complex compound type parameters. During service testing, each field's value needs to be filled in layer by layer, as shown in the figure below:  
![complex](/imgs/blog/admin/complex.jpg)  
It can also be invoked successfully and return results.

## Principle: Data Source  
In service testing, the most important aspect is the complete method signature information and parameter type information. With this information, each parameter's value can be filled in step by step to assemble a complete service consumer. In Dubbo 2.7, a metadata center has been added, and the method signature and parameter type information of Dubbo Admin come from here:  
![medatada](/imgs/blog/admin/metadata.png)  
As shown in the figure, the server will register the service's metadata information to the metadata center when running, in the format:  
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
The information related to service testing is contained in the `methods` and `types` sections. Dubbo Admin uses this information to render parameters in the JSON Editor on the service testing page, allowing users to input each parameter and each member variable's value.

## Principle: Generic Calling  
With parameter types identified, the next question is how to invoke the service on the server side. In traditional Dubbo RPC calls, the client needs to rely on the server-side API jar package (refer to the earlier demo for [dubbo-basic-consumer](https://github.com/nzomkxia/dubbo-demo/tree/master/dubbo-basic-consumer)). This is not feasible for Dubbo Admin because services go online and offline dynamically, and Dubbo Admin cannot dynamically add jar package dependencies. Therefore, Dubbo's **generic call** is utilized, which allows the client to initiate a service call directly through the `GenericService` interface without the server API interfaces, using Map to represent data objects in the return value. Generic calls do not require special handling on the server side; they only need to be initiated by the client.

## Summary and Outlook  
This article briefly introduces the usage and principles of service testing. In the future, there will be enhancements for this feature, such as handling abstract class parameter types, supporting importing parameter values from JSON files, and saving parameter values, making it easier for regression testing of service interfaces.  
