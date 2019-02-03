# 新贡献者向导

这篇向导旨在给正在准备向Dubbo提交贡献的新手提供指导。

### 邮件列表描述

邮件列表是Dubbo官方推荐的讨论方式，所有与Dubbo相关的内容都可以在这里讨论，请点击 [issue](https://github.com/apache/incubator-dubbo/issues/1393) 了解更多关于邮件列表订阅的内容

* dev@dubbo.incubator.apache.org：开发邮件列表，您在使用或者开发Dubbo的过程中遇到的任何问题，都可以在这里进行提问。
* commits@dubbo.incubator.apache.org：所有的提交内容都会推送到这个邮件列表，如果您对Dubbo的进展感兴趣，可以订阅这个邮件列表。
* issues@dubbo.incubator.apache.org：所有的 JIRA [issues](https://issues.apache.org/jira/projects/DUBBO/issues) 和修改信息都会推送到这个邮件列表。Dubbo社区已经决定使用github issues代替JIRA issues，因此大部分issues将由github issues进行跟踪。JIRA issues用于跟踪ASF相关问题。

### 报告问题

### 发送 pull request

* 参考[pull request template](https://github.com/apache/incubator-dubbo/blob/master/PULL_REQUEST_TEMPLATE.md)中的检查列表
* 在您发送pull request之前，请同步您的github仓库和远程仓库，这会使您的pull request简单明了，具体操作请看如下所示步骤：

```sh
git remote add upstream git@github.com:apache/incubator-dubbo.git
git fetch upstream
git rebase upstream/master
git checkout -b your_awesome_patch
... add some work
git push origin your_awesome_patch
```

### 编码规范

请按照[CONTRIBUTING.md](https://github.com/apache/incubator-dubbo/blob/master/CONTRIBUTING.md)中的编码规范对自己的代码进行检查。


### 参与发布投票

参与发布投票是一种重要的贡献社区的方式，Dubbo社区非常欢迎和鼓励任何人参与投票，每当一个版本需要正式发布的时候，会在开发者邮件列表上进行发布投票，只有当投票取得通过之后，才会正式发布，可以参考这个[检查列表](https://wiki.apache.org/incubator/IncubatorReleaseChecklist)对源码进行合规性检查。如果有任何问题，可以在开发者邮件列表上提问。