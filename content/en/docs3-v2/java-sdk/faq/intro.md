---
type: docs
title: "Introduction to Error Code Mechanism"
linkTitle: "Introduction to Error Code Mechanism"
weight: 0
---

## background
The Logger abstraction layer that Dubbo relies on internally provides log output capabilities, but most of the exception logs do not come with troubleshooting instructions, resulting in users being unable to handle the exception after seeing it.

In order to solve this problem, since Dubbo version 3.1, an error code mechanism has been introduced. It connects the error code FAQ in the official documentation with the logging framework. When the abstract output of the log is abnormal, a link to the official website document corresponding to the output is attached to guide the user to conduct independent investigation.

## Error code format
`[Cat]-[X]`

Both spaces are numbers. The first number is the category, and the second number is the specific error code.

## The format of the prompt display
```
This may be caused by ..., go to https://dubbo.apache.org/faq/[Cat]/[X] to find instructions.
```
In addition, supplementary information (ie extendedInformation) can be specified after this sentence.

## Displayed examples
`[31/07/22 02:43:07:796 CST] main WARN support.AbortPolicyWithReport: [DUBBO] Thread pool is EXHAUSTED! Thread Name: Test, Pool Size: 0 (active: 0, core: 1, max: 1, largest: 0), Task: 0 (completed: 0), Executor status:(isShutdown:false, isTerminated:false, isTerminating:false), in dubbo://10.20.130.230:20880!, dubbo version: , current host: 10.20.130.230, error code: 0-1. This may be caused by too much client requesting provider, go to https://dubbo.apache.org/faq/0/1 to find instructions.`

Users only need to click on the link to find the reason according to the error code.

## Logger interface support
To ensure compatibility, Dubbo 3.1 builds a new interface `ErrorTypeAwareLogger` based on the original Logger abstraction. It extends the method of warn level as follows:
```
void warn(String code, String cause, String extendedInformation, String msg);
void warn(String code, String cause, String extendedInformation, String msg, Throwable e);
```

Among them, code refers to the error code, cause refers to the Possible Reason (that is, the text followed by caused by...), extendedInformation is used as supplementary information, and is directly attached to the sentence caused by.

The same extension is done for the error level.

<p style="margin-top: 3rem;"> </p>