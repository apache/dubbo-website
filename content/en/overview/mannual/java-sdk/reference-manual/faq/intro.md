---
aliases:
- /en/docs3-v2/java-sdk/faq/intro/
- /en/docs3-v2/java-sdk/faq/intro/
- /en/overview/mannual/java-sdk/faq/intro/
- /en/overview/java-sdk/reference-manual/faq/intro/
description: Introduction to the error code mechanism
linkTitle: Introduction to the error code mechanism
title: Introduction to the error code mechanism
type: docs
weight: 0
---




### Background
The Logger abstraction layer relied on by Dubbo provides logging capabilities, but most exception logs do not include troubleshooting explanations, making it difficult for users to handle issues when they see exceptions.

To address this problem, starting from version 3.1 of Dubbo, an error code mechanism has been introduced. It links the error code FAQ in the official documentation with the logging framework. When exceptions are output in the log abstraction, the corresponding official documentation link is also provided to guide users in self-troubleshooting.

### Error Code Format
`[Cat]-[X]`

> Both spaces are numbers. The first number represents the category, and the second number represents the specific error code.

### Format of Hint Display
```
This may be caused by ..., go to https://dubbo.apache.org/faq/[Cat]/[X] to find instructions.
```
> Additionally, supplementary information (i.e., extendedInformation) can be specified after this sentence.

### Display Example
```
[31/07/22 02:43:07:796 CST] main  WARN support.AbortPolicyWithReport:  [DUBBO] Thread pool is EXHAUSTED! Thread Name: Test, Pool Size: 0 (active: 0, core: 1, max: 1, largest: 0), Task: 0 (completed: 0), Executor status:(isShutdown:false, isTerminated:false, isTerminating:false), in dubbo://10.20.130.230:20880!, dubbo version: , current host: 10.20.130.230, error code: 0-1. This may be caused by too much client requesting provider, go to https://dubbo.apache.org/faq/0/1 to find instructions.
```

> Users only need to click the link to find out the cause based on the error code.

### Logger Interface Support
To ensure compatibility, Dubbo 3.1 built a new interface `ErrorTypeAwareLogger` based on the original Logger abstraction.

The methods at the warn level have been extended as follows
```
void warn(String code, String cause, String extendedInformation, String msg);
void warn(String code, String cause, String extendedInformation, String msg, Throwable e);
```

Where `code` refers to the error code, `cause` refers to the possible reason (i.e., the text following caused by...), and `extendedInformation` serves as supplementary information, directly appended to the phrase caused by.

> The same extension has been made for the error level.

