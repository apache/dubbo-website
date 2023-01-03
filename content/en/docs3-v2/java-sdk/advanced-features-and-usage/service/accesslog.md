---
type: docs
title: "Call Information Record"
linkTitle: "Call Information Record"
weight: 13
description: "Understand dubbo3 call information records to configure and use through access logs"
---
## Feature description

The log in dubbo3 is divided into log adaptation and access log. If you want to record each request information, you can enable the access log, which is similar to the apache access log.

## scenes to be used

Based on audit needs, etc. similar to nginx accesslog output, etc.

## How to use
### log4j log
Output access logs to the current application's log4j log
```xml
<dubbo:protocol accesslog="true" />
```
### specify the file
Output the access log to the specified file
```xml
<dubbo:protocol accesslog="http://10.20.160.198/wiki/display/dubbo/foo/bar.log" />
```
> The log volume is relatively large, please pay attention to the disk capacity.