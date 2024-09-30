---
aliases:
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/service/echo-service/
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/service/echo-service/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/service/echo-service/
description: Detect whether Dubbo services are available through echo testing
linkTitle: Echo Testing
title: Echo Testing
type: docs
weight: 3
---



## Feature Description
Echo testing is used to detect whether a service is available. The echo test follows the normal request process, allowing the entire call to be tested for smooth operation and can be used for monitoring. In an echo test, the client sends a request containing a specific value (such as a string). The server should respond with the same value to verify that the request has been successfully received and processed. If the response does not match the request, it indicates that the service is not functioning properly and further investigation is needed. It requires that the Dubbo server is running and that there is a network connection between the server and the client. On the client side, the Dubbo client must be configured to connect to the server, which will send requests to the server, and then the server should return the same response as the request.

## Use Cases
Testing verifies whether a service can be called and whether the response is correct, making it particularly useful for validating the service before attempting to use it in a production environment. Echo testing is a simple and effective way to validate the basic functionality of Dubbo services, and it is crucial to perform this test before deploying services to production to ensure they function as expected.

## How to Use

For the complete source code of this example, please refer to [dubbo-samples-echo](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-echo).

All services automatically implement the `EchoService` interface, and you can use it by casting any service reference to `EchoService`.

For the following Dubbo proxy instance:

```java
@DubboReference
private DemoService demoService;
```

### Code Example
```java
EchoService echoService = (EchoService) demoService;

String status = (String) echoService.$echo("OK");
```
