---
type: docs
title: "Service Authentication"
linkTitle: "Service Authentication"
weight: 23
description: "Understand dubbo3 service authentication"
---

## Feature description

Security-sensitive businesses like payments may have a need to limit anonymous calls. In terms of security enhancement, 2.7.5 introduces the authentication and authentication mechanism based on the AK/SK mechanism, and introduces the authentication service center. The main principle is that when the consumer requests a service that requires authentication, it will pass SK, request Data, timestamps, parameters and other information to generate the corresponding request signature, which is carried to the peer end through Dubbo's Attahcment mechanism for signature verification, and business logic processing is performed only after the signature verification is passed. As shown below:

![img](/imgs/docsv2.7/user/examples/auth/auth.png)


## scenes to be used

## How to use
### access method

1. Users need to fill in their application information on the microservice site and generate a unique certificate for the application.

2. Submit a work order on the management site to apply for the permission to use a certain sensitive business service, which will be approved by the corresponding business manager. After the approval is passed, the corresponding AK/SK will be generated and sent to the authentication service center.

3. Import the certificate to the corresponding application and configure it. The configuration method is also very simple. Take the annotation method as an example:

   ### Service Provider
   You only need to set `service.auth` to true, which means that the call of the service needs to pass the authentication. `param.sign` is `true`, which means that the parameter needs to be verified.

   ```java
   @Service(parameters = {"service.auth","true","param.sign","true"})
   public class AuthDemoServiceImpl implements AuthService {
   }

   ```

   ### Service consumer
   You only need to configure the corresponding certificate and other information, and then the signature operation will be automatically performed before invoking these interfaces that require authentication. Through the interaction with the authentication service, the user does not need to configure sensitive information such as AK/SK in the code , and refresh the AK/SK without restarting the application to achieve the purpose of dynamically issuing permissions.

The solution has been submitted to the Dubbo open source community, and the basic framework has been merged. In addition to the AK/SK authentication method, the SPI mechanism supports user-customizable authentication and encryption that adapts to the company's internal infrastructure. key storage.
