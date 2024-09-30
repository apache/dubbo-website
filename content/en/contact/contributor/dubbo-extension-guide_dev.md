---
aliases:
    - /en/contact/contributor/dubbo-extension-guide_dev/
description: Extending Dubbo Guide
linkTitle: Extend Dubbo
title: Extending Dubbo Guide
type: docs
weight: 5
---




Dubbo uses a microkernel + plugin design pattern. The kernel is only responsible for assembling plugins, and all of Dubbo’s functionalities are implemented by extension points (plugins), which means that all of Dubbo’s features can be replaced by user-defined extensions.

### Dubbo Ecosystem

We recommend adding extensions to the Dubbo ecosystem. Using this model can keep the core repository cleaner and reduce maintenance work. Less code can also improve the build speed of the core repository.

### Dependencies

To implement your own Dubbo extension, you typically only need to rely on the API jar. For example:

```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-serialization-api</artifactId>
    <version>${dubbo.version}</version>
</dependency>
```

### Src Guidance

Typically, to achieve specific extensions, you just need to refer to the [Developer Guide](../new-contributor-guide_dev), implement the necessary Dubbo interfaces and suitable extensions. In addition, there are some other matters to pay attention to:

1. Good testing, you need to write unit tests and smoke tests to eliminate potential bugs.
2. No warnings, if there are unavoidable warnings, please use @SuppressWarnings to suppress them, but do not overuse.
3. README. Add necessary readme to explain how to use the extension and what to note.
4. License: Ensure you use Apache License 2.0.

### Notify the Community

1. Submit your code to [github](https://github.com).
2. Join the mailing list (recommended). Click [here](https://github.com/apache/dubbo/wiki/Mailing-list-subscription-guide) to see how to join the mailing list.
3. Send an email to dev@incubator.dubbo.apache.org to notify the community.
4. Typically, after sending the email, the community will discuss your extension, and the administrators of the dubbo group will contact you to transfer your project to the dubbo ecosystem.

### Transfer Project to Dubbo Ecosystem

1. The administrators of the dubbo group will ask you to transfer the ownership of your project to dubbo.
2. The administrators of the dubbo group will create a new project under the dubbo group and invite you to join this project.
3. Once you accept the invitation, you can transfer your project to the new project under the dubbo group.
4. Members of the dubbo group will review your project code. After that, you can improve these codes. 
