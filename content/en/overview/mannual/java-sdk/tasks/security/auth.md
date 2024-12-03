---
aliases:
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/security/auth/
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/security/auth/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/security/auth/
description: Understanding Dubbo Service Authorization
linkTitle: Service Authorization
title: Service Authorization
type: docs
weight: 23
---






## Feature Description

Business scenarios that are sensitive to security, such as payment, may have limitations on anonymous calls. To enhance security, version 2.7.5 introduced an authentication and authorization mechanism based on the AK/SK model, along with an authorization service center. The main principle is that the consumer client generates the corresponding request signature using SK, request metadata, timestamp, parameters, etc., when requesting a service that requires authorization. This signature is carried to the other end via Dubbo's Attachment mechanism for verification. Only after successful verification will business logic be processed. As shown in the figure below:

![img](/imgs/docsv2.7/user/examples/auth/auth.png)


## Usage Scenarios
When deploying new services, use authentication to ensure only the correct services are deployed. If unauthorized services are deployed, authentication will deny access and prevent the use of these unauthorized services.

## Usage Method

### Access Method

1. Users need to fill in their application information on the microservice site and generate a unique certificate credential for that application.

2. Then submit a ticket on the management site to request access to a certain sensitive business service, which will be approved by the corresponding business manager. Once approved, corresponding AK/SK will be generated in the authorization service center.

3. Import the certificate into the corresponding application and configure it. The configuration is very simple; for example, using annotations:

   ### Service Provider Side
   Just set `service.auth` to true, indicating that the service call requires authentication. `param.sign` set to `true` indicates that parameters also need to be validated.

   ```java
   @Service(parameters = {"service.auth","true","param.sign","true"})
   public class AuthDemoServiceImpl implements AuthService {
   }

   ```

   ### Service Consumer Side
   Just configure the corresponding certificate and other information; then it will automatically perform signature operations before invoking these authenticated interfaces. The user does not need to configure sensitive information like AK/SK in the code and can refresh AK/SK without restarting the application, achieving dynamic permission distribution.

> This solution has currently been submitted to the Dubbo open-source community and has completed the basic framework integration. In addition to the AK/SK authorization method, it supports customizable authentication through the SPI mechanism and adapts to the company's internal infrastructure for key storage.

