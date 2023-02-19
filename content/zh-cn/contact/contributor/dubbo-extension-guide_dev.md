---
type: docs
title: "扩展 Dubbo 向导"
linkTitle: "扩展 Dubbo"
weight: 5
---


Dubbo 使用微内核+插件的设计模式。内核只负责组装插件，Dubbo 的功能都是由扩展点（插件）实现，这就意味着 Dubbo 的所有功能都可以被用户定制的扩展所替代。

### Dubbo 生态系统

我们建议您将扩展加入到 Dubbo 生态系统。使用这种模式，可以使 Dubbo 的核心仓库更干净，并且可以减少维护工作。更少的代码也可以提高核心仓库的构建速度。

### 依赖

要实现您自己的 Dubbo 扩展，通常只需依赖 API jar 就可以满足您的需求。例如：

```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-serialization-api</artifactId>
    <version>${dubbo.version}</version>
</dependency>
```

### Src指导

通常，要实现特殊的扩展，只需要参考[开发者指南](../new-contributor-guide_dev)，实现Dubbo必要的接口和合适的扩展即可。除此之外，还有一些其它的事项需要注意：

1. 良好的测试，您需要编写单元测试和冒烟测试以消除潜在的 bug。
2. 没有警告，如有不可避免的警告，请使用 @SuppressWarnings 阻止它，但是请不要乱用。
3. README。添加必要的自述以说明如何使用扩展，以及需要注意的事项。
4. 许可证：请确保使用Apache License 2.0。

### 通知社区

1. 提交您的代码到 [github](https://github.com)。
2. 加入邮件列表（建议）。点击[这里](https://github.com/apache/dubbo/wiki/Mailing-list-subscription-guide)查看如何加入邮件列表。
3. 发送一封邮件到 dev@incubator.dubbo.apache.org 通知社区。
4. 通常，发送邮件之后，社区会对您的扩展进行讨论，dubbo 组的管理员会联系您转移您的项目到 dubbo 生态系统。

### 转移项目到dubbo生态系统

1. dubbo 组的管理员会请您将您的项目的所有者转让给 dubbo。
2. dubbo 组的管理员会在 dubbo 组下新建一个项目并邀请您加入到这个项目。
3. 一旦您接受邀请，您可以将您的项目转移到 dubbo 组下的新项目里。
4. dubbo 组的成员会对您的项目进行代码审查。随后，您可以对这些代码进行改进。





