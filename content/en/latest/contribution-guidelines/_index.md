
---
type: docs
title: "Dubbo Contribution Guidelines"
linkTitle: "Contribution"
description: "Dubbo Contribution Guidelines"
---


## 为 Dubbo 做贡献

Dubbo 是在非限制性的 Apache 2.0 许可下发布的，遵循标准的 Github 开发流程，使用Github追踪处理问题，并将 pull request 合并到 master 中。如果您想为 Dubbo 做贡献（即便是一些微小的），请不要犹豫，遵循下面的指导方针。

### 联系我们

#### 邮件列表


邮件列表是讨论几乎所有与 Dubbo 有关事情的推荐方式。有关如何订阅的详细文档，请参阅[指南](https://github.com/apache/dubbo/wiki/Mailing-list-subscription-guide)。

- [dev@dubbo.apache.org](mailto:dev-subscribe@dubbo.apache.org): 开发邮件列表，如果您在使用或开发Dubbo时遇到任何问题，您可以在此提出问题。
- [commits@dubbo.apache.org](mailto:commits-subscribe@dubbo.apache.org): 所有提交将被发送到这个邮件列表。如果您对Dubbo的发展感兴趣，您可以订阅它。
- [notification@dubbo.apache.org](mailto:notification-subscribe@dubbo.apache.org): 所有Github  [issue](https://github.com/apache/dubbo/issues)和[pull request](https://github.com/apache/dubbo/pulls)的更新都会被发送到这个邮件列表。

### 报告问题

在报告任何问题时请遵循[模版](https://github.com/apache/dubbo/issues/new?template=dubbo-issue-report-template.md)。

### 代码约定
我们的代码风格几乎和标准 Java 约定一致（流行IDE的默认设置满足这一点），主要有以下附加限制：

* 如果当前行中有超过 120 个字符，则起一个新的行。

* 确保所有新的 .java 文件都有一个简单的 JavaDoc 类注释，其中至少有一个标识创建日期的标签，最好至少有一个关于该类的解释说明。

* 将ASF许可注释添加到所有新的 .java 文件（从项目中的现有文件复制）

* 请确保没有将 @author 标记添加到您所贡献的文件中，因为 Apache 不使用 @author 标记，其他方式（如cvs）将公平地记录所有您的贡献。

* 为代码添加一些 JavaDoc，如果您更改命名空间，则需要一些 XSD DOC 元素。

* 对于新的特征或重要的修复程序，应该添加单元测试。

* 如果没有其他人使用您的分支，请将它与 master（或主项目中的其他目标分支）同步。

* 当编写提交消息时，请遵循这些约定，如果您正在修复一个现有问题，请在提交消息的末尾添加 Fixes XXX（其中XXX是问题编号）。

### 贡献流程

这是一个贡献者工作流程的大致说明：

* 克隆当前项目
* 从希望贡献的分支上创新新的分支，通常是 master 分支。
* 提交您的更改。
* 确保提交消息的格式正确。
* 将新分支推送到您克隆的代码库中。
* 执行检查表 [pull request模版](https://github.com/apache/dubbo/blob/master/PULL_REQUEST_TEMPLATE.md)。
* 在提交 pull request 请求前, 请将您克隆的代码和远程代码库同步，这样您的 pull request 会简单清晰。具体操作如下：
```
git remote add upstream git@github.com:apache/dubbo.git
git fetch upstream
git rebase upstream/master
git checkout -b your_awesome_patch
... add some work
git push origin your_awesome_patch
```
* 提交 pull request 请求到 apache/dubbo 并等待回复。

谢谢您的贡献！

### 代码风格


我们提供了 IntelliJ idea 的模版文件[dubbo_codestyle_for_idea.xml](https://github.com/apache/dubbo/tree/master/codestyle/dubbo_codestyle_for_idea.xml)，您可以将它导入到IDE。

如果使用 Eclipse，可以通过参考该文件手动配置。

**注意事项**

使用 dubbo_codestyle_for_idea.xml 为你的 IDEA 设置代码格式是贡献代码前至关重要的一个步骤，否则你将会无法通过 Travis CI 的代码风格校验，下面几个步骤给你演示了如何配置代码格式：

1. 进入菜单页 `Editor > Code Style`
2. 在 Code Style 页面的 scheme 菜单中点击 manage profiles 选项
在下拉列表中选择 `Import Scheme`, 接着选择 `IntelliJ IDEA code style XML` 导入 xml 文件
3. 输入你的格式名称，方便在不同工程之间进行识别，最后别忘了 ⏎ 来保存更改.

设置完成后，IDEA 会帮助你自动 reformat 代码




