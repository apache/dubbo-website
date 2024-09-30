---
aliases:
    - /en/docs3-v2/dubbo-go-pixiu/user/appendix/http-to-dubbo-default-stragety/
    - /en/docs3-v2/dubbo-go-pixiu/user/appendix/http-to-dubbo-default-stragety/
    - /en/overview/reference/pixiu/user/appendix/http-to-dubbo-default-stragety/
    - /en/overview/mannual/dubbo-go-pixiu/user/appendix/http-to-dubbo-default-stragety/
description: HTTP to Dubbo Default Conversion Protocol
linkTitle: HTTP to Dubbo Default Conversion Protocol
title: HTTP to Dubbo Default Conversion Protocol
type: docs
weight: 10
---






# Background


​    By providing a unified service provider view through Http, users need not worry about backend Dubbo service version differences or protocol differences. They just need to pass RPC call parameters in an HTTP request to complete an RPC call, simplifying backend service design complexity by implementing HTTP calls to backend Dubbo services.

# Purpose

​    To unify the format of HTTP calls to backend Dubbo services, facilitating gateway products to achieve HTTP-to-Dubbo call conversion and enhancing the integration of Dubbo with the gateway.

# Conception

## Basic Form of Dubbo RPC Calls



![img](/imgs/pixiu/user/appendix/img1.png)



It aims to simplify the RPC call process for consumers by providing an HTTP to Dubbo calling method.



![img](/imgs/pixiu/user/appendix/img2.png)



In the service call process, the gateway will assume many of the client's original functions such as load balancing, service governance, and security, allowing external users to focus more on the call itself.



## Format of Http Request and Http Response

The URL and Header of the request contain RPC call meta-information, including service name, method name, service group, and service version. The request body contains parameters in **json list** format. If there are no parameters, it is ***null***

The HTTP response includes the processing status, result, or error type and specific information. The returned body contains only one ***json object***, with ***code***, ***result***, and ***error*** fields.

The code indicates the specific status, and result and error (only one will be returned) indicate the call's return result or error information.



### Http Request

#### Http Request Method

It must be **POST**.



#### Http Request URL

Format: `[http://host/{service}/{method}` or `[https://host/{service}/{method}`



-  service is the service name corresponding to the service name in the Dubbo message body.
-  method is the method name corresponding to the method name in the Dubbo message body.

Service name and method name should be consistent with backend service declarations.



If the URL lacks service or method, it should directly return:

| http code | code | detail                         |
| --------- | ---- | ------------------------------ |
| 400       | 3    | service or method not provided |



#### Http Request Header



Headers must contain the following items:

- x-dubbo-service-protocol

Indicates this HTTP request is an HTTP to Dubbo request. Supported protocols are Dubbo and triple. Configurable options are:

- - x-dubbo-service-protocol: triple
  - x-dubbo-service-protocol: dubbo

  The former indicates conversion to the triple protocol, the latter to the Dubbo protocol.



Optional parameters:

-  x-dubbo-service-version If provided, it should fill the Serviceversion field in the Dubbo message.
-  x-dubbo-service-group If provided, it should add the group field in the attachment.



#### Http Request Body



The body contains request parameters, including only one ***Json object***.

This object currently includes two fields:

- param

The param value is a list indicating the method's parameters, in the same order as the method signature.

Using the object to assemble request parameters allows the protocol to be backward compatible, and new fields may be added to the object in the future.

