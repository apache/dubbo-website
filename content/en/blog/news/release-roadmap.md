---
title: "Focusing on Stability, Dubbo Java Release Plan Announced"
linkTitle: "Dubbo Java Release Plan"
date: 2022-10-22
tags: ["News"]
weight: 10
description: >
  Focusing on stability, the Dubbo release plan has been announced.
---

## Introduction to Dubbo
Apache Dubbo is an RPC service development framework designed to address service governance and communication issues in microservice architectures. Official SDK implementations are available in multiple languages, including Java and Golang. Microservices developed with Dubbo possess built-in capabilities for remote address discovery and communication, leveraging Dubbo's rich service governance features to achieve needs such as service discovery, load balancing, and traffic scheduling. Dubbo is designed for high extensibility, allowing users to easily implement various customized logic for traffic interception and service selection.

## How Should I Choose a Version?
Historically, Dubbo has not effectively answered this question. Ensuring the stability of all versions is quite challenging. For instance, some versions of Dubbo 2.7 experienced backward compatibility issues, causing upgrade difficulties for some users. Many chose a more conservative strategy to maintain stability by using the most commonly adopted version in production and then stopping updates to avoid unexpected issues during upgrades.

However, this approach has significant drawbacks, as it prevents users from accessing new community features and the benefits of technological evolution. Known issues, such as security vulnerabilities and bugs causing instability, will persist without upgrades, leading to substantial risks over time, potentially resulting in severe safety incidents.

To address this, Dubbo has formulated a future version iteration plan with a clear stability maintenance mechanism, boosting developer confidence in using Dubbo.

## Current Status
Previously, Dubbo maintained three major versions: 2.6.x, 2.7.x, and 3.x, with 2.7.x being the version donated to the Apache Foundation.

The 2.6.x version was declared end-of-life (EOL) last year, while 2.7.x has been maintained for four years. During this time, 2.7.x underwent significant modifications, including changes to the registration method for Nacos in version 2.7.3, the addition of application-level service discovery in version 2.7.6, and a major rework of application-level service discovery in version 2.7.9.

These changes presented significant risks to the stability of the 2.7.x version, resulting in various issues across many versions. Users were unable to select the most stable version for use.

Thus, we aim to stabilize this situation in the 3.x version through a release mechanism that enhances the stability of Dubbo versions.

## Overall Future Plan
Moving forward, Dubbo will adopt a six-month cycle for each version, focusing on three main areas: new feature incorporation, stability maintenance, and security vulnerability fixes.

New feature incorporation involves integrating all new features, performance optimizations, and disruptive changes developed during Dubbo's evolution. As new features require time to stabilize, their incorporation will introduce instability and can only occur at the start of each version.

Stability maintenance refers to fixing non-expected behavior of **existing** features to further enhance stability. Significant issue fixes requiring massive rework will be treated as new feature submissions and will follow the new feature incorporation process to avoid introducing more issues while resolving one.

Security maintenance involves addressing security risks in use, mainly focusing on vulnerabilities reported by white hat hackers.

New feature incorporation will continue for **6** months in each version, stability maintenance will last for **12** months, and security maintenance will extend for **18** months.

Overall, Dubbo will start a new version iteration every 6 months, simultaneously announcing the end-of-life (EOL) for one version.

## Version-Specific Maintenance Plan

![image.png](/imgs/blog/release/release-roadmap.png)

The image shows the maintenance status for each version at given time points.

Currently, Dubbo 2.7 and 3.0 have entered the security maintenance phase, with the version maintenance cycle ending in March 2023.

Dubbo 3.1 is in the stability maintenance phase, where only stability modifications will continue. This version is also recommended for production use within the community. Stability maintenance work will continue until March 2023, after which a 6-month security maintenance phase will begin, ending in September 2023.

Dubbo 3.2 is still in the new feature incorporation phase and is releasing as a beta version. This phase is suitable for early adopters, as stability is slightly less than in versions already in stability maintenance. In March 2023, Dubbo 3.2 will conclude the new feature incorporation phase, undergo thorough stability validation, and officially release a production-ready GA version. After that, it will receive stability maintenance until March 2024, when its lifecycle will end.

Development for Dubbo 3.3 will formally commence in March 2023 after the conclusion of the new feature incorporation phase for 3.2. Consequently, the first beta release for Dubbo 3.3 will also be issued in March 2023. After a 6-month new feature incorporation phase, Dubbo 3.3 will officially release a production-ready GA version in September 2023 and enter the stability maintenance phase. Subsequently, it will enter the security maintenance phase in March 2024 and conclude its lifecycle in September 2024.

## Conclusion

For most production users, we recommend using the **latest minor version of the version currently in stability maintenance**. For example, from September 2022 to March 2023, Dubbo 3.1 is in stability maintenance, so the preference is for Dubbo 3.1. For minor versions like 3.1.0, 3.1.1, and 3.1.2, we recommend directly using the latest minor version. As minor versions only contain stability fixes, later versions are generally more stable.

For users eager to try new features, you can directly test the latest development versions. Even in development versions, Dubbo has a comprehensive quality assurance mechanism. If you encounter any issues during use, please feel free to provide feedback to the community.

Currently, Alibaba Group has perfectly supported all calls for the core e-commerce this Double Eleven with the stable version of Dubbo 3.0 and is now upgrading to the latest stable version, Dubbo 3.1. We welcome more users to upgrade to Dubbo 3.1 and refer to the upgrade guidelines provided on the official website during the upgrade process. If you encounter any issues, you can promptly provide feedback to the community through issues, WeChat groups, or DingTalk groups. We will do our best to assist.

## More

In terms of version planning, aside from the iterative roadmap released this time, Dubbo will ensure a continuous and stable user experience through a series of mechanisms. For major version upgrades, Dubbo will build a **complete version upgrade guide**, highlighting significant changes when upgrading from Dubbo 3.1 to 3.2, enabling users to clearly understand the risk points and better plan the upgrade pace.

Additionally, for the currently widely used Dubbo 2.7 version, the Dubbo community will soon launch **guides and tools for upgrading from Dubbo 2.7**, allowing all Dubbo 2.7 users to identify differences in advance and smoothly upgrade to Dubbo 3.

