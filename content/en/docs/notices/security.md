
---
type: docs
title: "Security"
linkTitle: "Security"
description: "Dubbo Security information, such impact of vulnerabilities in upstream components"
weight: 90
---

## Reporting security issues

The Apache Software Foundation takes a very active stance in eliminating security problems and denial of service attacks against its products.

We strongly encourage folks to report such problems to our private security mailing list first, before disclosing them in a public forum.

Please note that the security mailing list should only be used for reporting undisclosed security vulnerabilities and managing the process of fixing such vulnerabilities. We cannot accept regular bug reports or other queries at this address. All mail sent to this address that does not relate to an undisclosed security problem in our source code will be ignored.

If you need to report a bug that isn't an undisclosed security vulnerability, please use the bug reporting page.

The private security mailing address is: security@dubbo.apache.org

For more information about how the ASF deals with security potential problems see https://www.apache.org/security/

## Security issues in dependencies

### Log4j CVE-2021-44228

Recently, the mainstream log framework [log4j2](https://logging.apache.org/log4j/2.x/) was reported with a severe security vulnerability [cve-2021-44228](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2021-44228).

The following is a summary of the impact of this vulnerability cve-2021-44228 on the Apache Dubbo framework and the user's guide.

#### Potential Influence on Dubbo

**CVE-2021-44228 has no security impact on use of Dubbo framework**

Dubbo itself does not rely on the log4j2 framework, nor will it bring log4j2 to the project through dependency transfer. Therefore, Dubbo users of version 2.7.x and 3.0.x do not need to upgrade their Dubbo versions.

The following is the dependency analysis of Dubbo components on log4j2, involving `Dubbo common`, `Dubbo spring boot starter` and `Dubbo spring boot actuator`:

* `dubbo-common` optionally depends on `log4j-core`. The only need to check is whether the project itself has enabled log4j dependency. If so, upgrade accordingly.

```xml
[INFO] --- maven-dependency-plugin:3.1. 2:tree (default-cli) @ dubbo-common ---
[INFO] org. apache. dubbo:dubbo-common:jar:2.7. 14-SNAPSHOT
[INFO] +- org. apache. logging. log4j:log4j-api:jar:2.11. 1:provided
[INFO] \- org. apache. logging. log4j:log4j-core:jar:2.11. 1:provided
```

* `dubbo-spring-boot-starter` transfers log4j-api dependency through spring-boot. log4j-api itself has no security issue. But pay attention to compatibility with log4j-api when upgrading the log4j-core component

```xml
[INFO] org. apache. dubbo:dubbo-spring-boot-starter:jar:2.7. 14-SNAPSHOT
[INFO] \- org. springframework. boot:spring-boot-starter:jar:2.3. 1.RELEASE:compile (optional)
[INFO] \- org. springframework. boot:spring-boot-starter-logging:jar:2.3. 1.RELEASE:compile (optional)
[INFO] \- org. apache. logging. log4j:log4j-to-slf4j:jar:2.13. 3:compile (optional)
[INFO] \- org. apache. logging. log4j:log4j-api:jar:2.13. 3:compile (optional)
```

* `dubbo-spring-boot-actuator` transfers log4j-api dependency through spring-boot. log4j-api itself has no security issue. But pay attention to compatibility with log4j-api when upgrading the log4j-core component


```xml
[INFO] org. apache. dubbo:dubbo-spring-boot-actuator:jar:2.7. 14-SNAPSHOT
[INFO] \- org. springframework. boot:spring-boot-starter-web:jar:2.3. 1.RELEASE:compile (optional)
[INFO] \- org. springframework. boot:spring-boot-starter:jar:2.3. 1.RELEASE:compile
[INFO] \- org. springframework. boot:spring-boot-starter-logging:jar:2.3. 1.RELEASE:compile
[INFO] \- org. apache. logging. log4j:log4j-to-slf4j:jar:2.13. 3:compile
[INFO] \- org. apache. logging. log4j:log4j-api:jar:2.13. 3:compile
```

## Security Model

### Third-party Deserialization Library Vulnerabilities

Dubbo supports the extension of serialization protocol. Theoretically, users can enable serialization protocol with arbitrary order based on the extension mechanism, which brings great flexibility, but at the same time, they should be aware of the potential security risks.
Data deserialization is one of the most vulnerable links to be exploited by attackers. Attackers use it to steal or destroy server-side data, such as rce attack. 
Before switching the serialization protocol or implementation, the user should fully investigate the security guarantee of target serialization protocol and its framework implementation, and set corresponding security measures in advance (such as setting Black / white list). The Dubbo framework itself cannot guarantee the security of the target serialization mechanism.

Dubbo 2.7 The official version provides the following serialization protocols:
* Hessian2
* Fastjson
* Kryo
* FST
* JDK
* Protostuff/Protobuf
* Avro
* Gson

For the above serialization extension, after finding or receiving the relevant vulnerability report, Dubbo will follow up and upgrade to the latest security version, but the final vulnerability repair scheme depends on the serialization framework implementation.
> For users using [dubbo hessian2](https://github.com/apache/dubbo-hessian-lite/releases), Dubbo will guarantee the security of Hessian 2 serialization mechanism and repair the reported security vulnerabilities as much as possible   

If you have any questions or security issues, please send mail to here security@dubbo.apache.org

#### Some suggestions to deal with the security vulnerability of deserialization

* External network access restrictions

According to the research, most of the existing deserialization utilization chains need to load malicious classes remotely. If there is no special requirement, it is recommended to configure the server out of the Internet without affecting the business.

* IP white list

It is suggested that the Server developer add the consumer IP that can connect to the Dubbo server to the trusted IP white list, and configure the trusted IP white list on the server to prevent the attacker from directly initiating the connection request externally.

* More secure deserialization

The protocol and deserialization method can be changed without affecting the business, such as rest, grpc, thrift, etc.

* Close the public network port

Do not expose the open port of Dubbo server to the public network. But pay attention to the exceptional, if the attacker is in the Intranet environment, he can still attack.

* Enable filtering of incoming serialization data for Java default serialization  
Remember to configure filtering rules before enabling Java default serialization. 
This feature is first supported in JDK 9 and has been back-ported to JDK 8, 7, and 6.  
https://docs.oracle.com/javase/10/core/serialization-filtering1.htm#JSCOR-GUID-3ECB288D-E5BD-4412-892F-E9BB11D4C98A  
http://openjdk.java.net/jeps/290
