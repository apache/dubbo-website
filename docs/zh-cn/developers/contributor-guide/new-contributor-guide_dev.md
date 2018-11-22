# 新贡献者向导

这篇向导旨在给正在准备贡献 Dubbo 的新手提供指导。

### 邮件列表描述

邮件列表是 Dubbo 官方推荐的讨论基本上所有与 Dubbo 相关内容的方式，请点击 [issue](https://github.com/apache/incubator-dubbo/issues/1393) 了解更多关于邮件列表订阅的内容

* dev@dubbo.incubator.apache.org：开发邮件列表，您在使用或者开发 Dubbo 的过程中遇到的任何问题，都可以在这里进行提问。
* commits@dubbo.incubator.apache.org：所有的提交内容都会推送到这个邮件列表，如果您对 Dubbo 的进展感兴趣，可以订阅这个邮件列表。
* issues@dubbo.incubator.apache.org：所有的 JIRA [issues](https://issues.apache.org/jira/projects/DUBBO/issues) 和修改信息都会推送到这个邮件列表。Dubbo 社区已经决定使用 github issues 代替 JIRA issues，因此大部分 issues 将由 github issues 进行跟踪。JIRA issues 用于跟踪 ASF 相关问题。

### 报告问题

### 发送提交请求

* 参考[提交请求模版](https://github.com/apache/incubator-dubbo/blob/master/PULL_REQUEST_TEMPLATE.md)中的检查列表
* 在您发送提交请求（pull request）之前，请同步您的 github 仓库和远程仓库，这会使您的提交请求简单明了，具体操作请看如下所示步骤：

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