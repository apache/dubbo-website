---
aliases:
    - /zh/docs3-v2/dubbo-go-pixiu/user/appendix/http-to-dubbo-default-stragety/
    - /zh-cn/docs3-v2/dubbo-go-pixiu/user/appendix/http-to-dubbo-default-stragety/
description: HTTP to Dubbo 默认转换协议
linkTitle: HTTP to Dubbo 默认转换协议
title: HTTP to Dubbo 默认转换协议
type: docs
weight: 10
---






# 背景


​	通过 Http 提供一个统一的服务提供者视图，用户不用在乎后端Dubbo服务的版本差异，协议差异，通过简单地在Http请求中传递rpc调用的参数，完成一次Rpc调用，通过实现http调用后端dubbo服务，进一步简化后端服务设计的复杂性。

# 目的

​	统一Http调用后端dubbo服务的形式，方便网关产品实现 Http 调用转 dubbo 调用的实现，Dubbo能和网关更好的融合。

# Conception

## Dubbo RPC 调用的基本形式



![img](/imgs/pixiu/user/appendix/img1.png)



希望通过提供Http调用Dubbo的方式简化 Consumer 的Rpc调用流程



![img](/imgs/pixiu/user/appendix/img2.png)



网关会在整个服务调用的过程中承担更多的原本客户端的功能，比如负载均衡，服务治理，安全等能力，外部用户调用服务的时候将更多的关注与调用本身。



## Http request 和 Http response 的格式

request的URL和Header中包含RPC调用的元信息，包含服务名，方法名，服务分组，服务版本，request 的 body 中包含请求的参数，参数是 **json list** 的格式, 如果没有参数则为 ***null***

http response 中包含请求的处理状态，返回结果或者调用的错误类型以及错误具体信息，返回的body中只包含一个 ***json object***，这个object中包含 ***code***，***result***，***error***

通过 code 表示返回的具体状态，result 和 error 在返回中只会返回其中一个，分别是调用的返回结果，调用返回的错误信息。



### Http request

#### Http 请求的方法

只能为 **POST** 方法



#### Http 请求的 URL

格式：`[http://host/ {service} / {method](http://host/service/method)}` or `[https://host/ {service} / {method](https://host/service/method)}`



-  service 是调用的服务名，对应于Dubbo message body中的 service Name 
-  method 是调用的方法名，对应于Dubbo message body中的 method Name 

服务名和方法名都应该和后端服务的声明一致



如果URL中无法获取到service和method，应该直接返回 

| http code | code | detail                         |
| --------- | ---- | ------------------------------ |
| 400       | 3    | service or method not provided |



#### Http 请求的Header



Header中必须包含以下条目：

- x-dubbo-service-protocol

表明这个Http 请求是一个Http转dubbo的请求，目前支持Dubbo 协议和 triple 协议，可配置的选项为：

- - x-dubbo-service-protocol: triple
  - x-dubbo-service-protocol: dubbo

​      前者表示这是转化为triple协议，后者表示转化为dubbo协议



可选参数：

-  x-dubbo-service-version 如果提供了应该填充到Dubbo message 的Serviceversion字段中.
-  x-dubbo-service-group  如果提供了应该在attachment 添加 group 字段并把对应的值进行填充。 



#### Http 请求的Body



body中包含请求的参数，body中只包含一个 ***Json object*** 对象

这个对象目前包含两个字段：

- param

param 的值类型为 list，标识调用方法的参数，顺序和方法签名中的参数顺序一致

这里使用object组装请求参数是为了协议能够向后兼容，body中的对象可能会增加新的字段。



##### 基本类型在 Json Java Go 中的映射关系

| Json Type | Java Type         | Golang Type |
| --------- | ----------------- | ----------- |
| Integer   | java.lang.Long    | int64       |
| Double    | java.lang.Double  | float64     |
| String    | java.lang.String  | string      |
| Null      | null              | nil         |
| Bool      | java.lang.Boolean | bool        |
| List      | java.lang.List    | silice      |
| Object    | java.lang.Map     | map         |

通过对基本类型映射关系的定义简化网关配置，对于只使用基本配置的转化，网关应该可以在不使用额外配置的情况下完成转化的



##### Body 处理异常时的处理策略

1.  调用方提供的请求参数 Json 解析错误，返回状态码 400 
2.  调用的时候，无法确定参数的具体类型，例如，用户使用的自定义类型，但是没有在网关配置具体的类型名，应该返回状态码 400  

| http code | code | detail                       |
| --------- | ---- | ---------------------------- |
| 400       | 3    | argument parse error         |
| 400       | 3    | argument type info not found |

在以上条件都符合时，一个Http 调用可以被转化成为 Dubbo 协议的调用，只要网关能够成功进行请求的转化，则网关回复调用方的时候，Http 状态码都应该是 200 OK，至于调用方调用后端服务出现错误的信息，应该放在 body 中的 code 以及 error 字段中。



### http response

在请求经过后端返回之后，需要将一下信息传递给调用方：

| name     | description                                              |
| -------- | -------------------------------------------------------- |
| status   | 返回的状态，在dubbo response 的header的status 中         |
| 返回值   | 调用成功返回的结果，如果没有返回值，则result 的值为 null |
| 返回异常 | 调用失败，产生异常，返回异常的具体message                |

返回值和返回异常只能出现一项

code 和 grpc 中的 status code 一致 详细的 code 及其含义见 https://grpc.github.io/grpc/core/md_doc_statuscodes.html



#### 返回异常的处理：

dubbo 中的异常以hessian2 的 class 类型返回，返沪的error中只需要对应的message 字段即可





## Dubbo 协议的具体转化

### Dubbo 协议的具体介绍 可以见文章

https://dubbo.apache.org/en/blog/2018/10/05/introduction-to-the-dubbo-protocol/



### Dubbo 协议的 message 格式

![img](/imgs/dev/dubbo_protocol_header.png)



#### Dubbo Header的封装要求

| bits     | Name           | description                                           |
| -------- | -------------- | ----------------------------------------------------- |
| 0 - 15   | Magic Number   | 必须为 0xdabb                                         |
| 16       | message 的类型 | 必须为 1 （request）                                  |
| 17       | 2-way          | 必须为 1 （需要服务端返回值）                         |
| 18       | Event          | 必须为 0 不支持事件类型                               |
| 19 - 23  | 序列化类型     | 可以扩展实现Hessian，Json等序列化类型，类型编号如下表 |
| 24 - 31  | Status         | 表示 response 的状态，见Status 处理要求               |
| 32 - 95  | Request Id     | 客户端的请求ID，可以根据需要自行定义                  |
| 96 - 127 | Data length    | 请求体的长度，请求体的大小                            |



序列化类型编号：

| Serialization Type | Code |
| ------------------ | ---- |
| Hessian2           | 2    |
| Java               | 3    |
| Compact Java       | 4    |
| Fast Json          | 6    |
| Native Java        | 7    |



请求Header中的字段应该以大端的形式封装，发送到服务端



#### Dubbo Body



请求的body应该包含以下内容：

| name                   | description                                                  |
| ---------------------- | ------------------------------------------------------------ |
| Dubbo Version          | 根据网关的配置，或者Http请求获取                             |
| Service Name           | 服务名                                                       |
| Method Name            | 调用方法名，采用泛化调用的方式，此项目固定为“$invoke”        |
| Method parameter types | 参数类型，泛化调用有固定值 "Ljava/lang/String;[Ljava/lang/String;[Ljava/lang/Object;" |
| Method arguments       | 使用配置的序列化方式将对应的参数序列化，按照用户传入的参数的顺序放入参数 |

以上的各个项目在使用了指定的序列化形式之后，按照上表指定的顺序进行序列化。

attachment 目前不转化



***注意***：



使用文本类型的序列化（Json） 在每一个序列化对象后边要加上行分割符( ***"\n"*** or ***"\r\n"*** )

Java 中在使用FastJson 编解码的时候使用了BufferedReader，每次取buffer中的对象的时候，会先调用BufferReader的readLine方法，此方法分割行依靠 ‘/n’ ， ’/r/n‘

以下给出了Dubbo 协议中返回header中的status对应于GRPC status的对应列表



##### Status 的处理

Dubbo resposne status 中，OK延续使用grpc的 OK code，其余的 status Number编号紧接着 grpc 的16个 code进行编号

对应的error详情是 response 中异常的 message。

| Dubbo State                                    | Number |
| ---------------------------------------------- | ------ |
| ResponseStatus::Ok                             | 0      |
| ResponseStatus::ClientTimeout                  | 130    |
| ResponseStatus::ServerTimeout                  | 131    |
| ResponseStatus::ServiceNotFound                | 12     |
| ResponseStatus::ServerThreadpoolExhaustedError | 13     |
| ResponseStatus::ClientError                    | \      |
| ResponseStatus::ServerError                    | 13     |
| ResponseStatus::ServiceError                   | 13     |
| ResponseStatus::BadResponse                    | 13     |
| ResponseStatus::BadRequest                     | 3      |

## Triple 协议的具体转化

Triple 是基于GRPC的，定义在Http2 协议之上

### Triple中RPC调用的元信息



#### Triple 通过 URL 传递调用的服务名和方法名

格式： `[http://host/ {service} / {method](http://host/service/method)}`

我们的规范兼容 Triple 通过http2传递参数的形式，尽量做到dubbo 和 triple 的统一。



#### Header Frame

header 中应该包含以下条目

- Content-Type：***application/grpc-proto***

标识这是一个 triple 协议的rpc调用

- x-dubbo-service-group

指明调用的服务的分组

- x-dubbo-service-version

指明调用的服务的版本



#### Data frame

Triple协议将请求参数放在Body中，在triple中，如果服务中的方法定义能够使用pb序列化，则只有一层序列化，如果需要用到其他的序列化，则需要使用TripleRequestWrapper

对参数进行包装。



我们推广使用 ***Triple + pb*** 的序列化形式，服务的提供方需要给出服务的 proto 定义，对于triple协议网关对于***triple + pb***  的转化是比较容易实现的，如果用户没有提供proto定义，需要返回信息：

| http code | code | detail                       |
| --------- | ---- | ---------------------------- |
| 400       | 3    | argument type info not found |

###