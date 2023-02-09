---
type: docs
title: Elegant online and offline
keywords: elegant online and offline
description: Elegant online and offline
---

# Gracefully log in and out

## Introduction

In the process of stable production, container scheduling is completely controlled by k8s, and microservice governance is completely maintained and managed by service framework or operation and maintenance personnel. In the case of releasing a new version or expanding or shrinking the capacity, the old container instance will be terminated and replaced with a new container instance. For an online production environment carrying high traffic, if the connection of this replacement process is unreasonable, the A large number of wrong requests are caused in a short period of time, triggering alarms and even affecting normal business. For larger manufacturers, the loss caused by problems in the release process will be huge.

Therefore, the appeal of graceful online and offline is put forward. This requires that the service framework, on the basis of having stable service invocation capabilities and traditional service governance capabilities, should provide stable guarantees during the process of going online and offline, thereby reducing operation and maintenance costs and improving application stability.

## Expected effect

Ideally, the effect of graceful offline and offline is that in a distributed system carrying a large amount of traffic, all component instances can be expanded, reduced, and rolled over at will. In this case, it is necessary to ensure stable tps and rt, to ensure that no request errors are caused by the application going offline.

## How to use

The Dubbo-go app enables graceful log-off and offline by default.

Related reading: [[Design and Practice of Dubbo-go Elegant Online and Offline]](https://developer.aliyun.com/article/860775)