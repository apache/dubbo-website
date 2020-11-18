---
type: docs
title: "新贡献者向导"
linkTitle: "新手向导"
weight: 2
---


这篇向导旨在给正在准备向 Dubbo 提交贡献的新手提供指导。

### 邮件列表描述

邮件列表是 Dubbo 官方推荐的讨论方式，所有与 Dubbo 相关的内容都可以在这里讨论，请点击 [issue](https://github.com/apache/dubbo/issues/1393) 了解更多关于邮件列表订阅的内容

如需订阅如下邮件列表，请参考 [邮件列表订阅向导](/zh-cn/docs/developers/contributor-guide/mailing-list-subscription-guide_dev.html)

* dev@dubbo.apache.org：开发邮件列表，您在使用或者开发 Dubbo 的过程中遇到的任何问题，都可以在这里进行提问。
* commits@dubbo.apache.org：所有的提交内容都会推送到这个邮件列表，如果您对 Dubbo 的进展感兴趣，可以订阅这个邮件列表。
* issues@dubbo.apache.org：所有的 JIRA [issues](https://issues.apache.org/jira/projects/DUBBO/issues) 和修改信息都会推送到这个邮件列表。Dubbo 社区已经决定使用 github issues 代替 JIRA issues，因此大部分 issues 将由 github issues 进行跟踪。JIRA issues 用于跟踪 ASF 相关问题。

### 报告问题

### 发送 pull request

* 参考[pull request template](https://github.com/apache/dubbo/blob/master/PULL_REQUEST_TEMPLATE.md)中的检查列表
* 在您发送 pull request 之前，请同步您的 github 仓库和远程仓库，这会使您的 pull request 简单明了，具体操作请看如下所示步骤：

```sh
git remote add upstream git@github.com:apache/dubbo.git
git fetch upstream
git rebase upstream/master
git checkout -b your_awesome_patch
... add some work
git push origin your_awesome_patch
```

### 编码规范

请按照[CONTRIBUTING.md](https://github.com/apache/dubbo/blob/master/CONTRIBUTING.md)中的编码规范对自己的代码进行检查。


### 参与发布投票

参与发布投票是一种重要的贡献社区的方式，Dubbo 社区非常欢迎和鼓励任何人参与投票，每当一个版本需要正式发布的时候，会在开发者邮件列表上进行发布投票，只有当投票取得通过之后，才会正式发布，可以参考这个[检查列表](https://wiki.apache.org/incubator/IncubatorReleaseChecklist)对源码进行合规性检查。如果有任何问题，可以在开发者邮件列表上提问。
