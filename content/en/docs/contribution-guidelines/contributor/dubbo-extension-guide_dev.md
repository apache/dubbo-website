---
type: docs
title: "Extension Guide"
linkTitle: "Developing Extension"
weight: 5
---


Dubbo Use microkernel + plugin design pattern. Microkernel is only responsible for assembling plugins, the functions of Dubbo are implemented by extension points(plugins), which means that all functions of Dubbo can be replaced by user customized extension.

## Dubbo Ecosystem

We recommend you to put extension to Dubbo [ecosystem](https://github.com/dubbo). Using this pattern will keep the core repository cleaner and decrease the maintains work. With less code also speed up core repository build process.

## Dependency
Implement your own Dubbo extension, in general is just dependence on API jar correspond to what you want.
For example:
```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-serialization-api</artifactId>
    <version>${dubbo.version}</version>
</dependency>
```

## Src Guide
Usually, implement special extension, just need reference the [Developer Guide](/en/latest/contribution-guidelines/) docs. Implement necessary interface and adapt extension to dubbo. Besides, some others should be considered:
1. Well tested. You should write unit test and mock test to eliminate potential bugs.
2. No warning, if some warning cannot to avoid, use @SuppressWarnings to suppress it, but do not abuse it.
3. README. Add necessary readme to show how to use your extension, and something to take notice.
4. License. Make sure of use Apache License 2.0.

## Notify the Community
1. Commit your code to [GitHub](https://github.com).
2. Join the mail list (recommended). [HowTo](https://github.com/apache/dubbo/wiki/Mailing-list-subscription-guide)
2. Send email to dev@incubator.dubbo.apache.org to notify the community
3. Usually, after sending email, community will discuss your extension, and Administrators of dubbo group will contact you for transfer project to dubbo ecosystem.

## Transfer Project to Dubbo Group
1. Administrators of dubbo group will ask you, grant your project owner to dubbo.
2. Administrators of dubbo group will create a new project under dubbo group and invite you join the project.
3. Once you accept the invitation, you can transfer your project to new project under dubbo group.
4. Existing members of dubbo group will do the code review. After that you may make some improvement to code.
