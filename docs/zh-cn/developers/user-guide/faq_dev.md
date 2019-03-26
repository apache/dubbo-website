# FAQ

### dubbo-admin在哪里？

从Dubbo 2.6.1版本开始，dubbo-admin已经从核心库迁移到https://github.com/apache/incubator-dubbo-admin

### 我应该选择哪个版本？

目前，dubbo保持着3个版本的并行推进：

* 2.7.x (master) ：要求java 1.8，重要功能分支。
* 2.6.x：要求java 1.6，次要功能、bug修复分支，GA，生产准备。
* 2.5.x：要求java 1.6，维护分支，只接受具有安全漏洞和致命性错误的bugfix，该分支将会在2019-06-15停止维护，请尽快升级到2.6.x版本。

点击[这里](https://github.com/apache/incubator-dubbo/issues/1208)以了解更详细的版本管理计划。

对于贡献者，请确保所有的变更都提交到正确的分支上，也就是说，大多数的pull request都必须提交到2.7.x上，如有必要，将其反向合并到2.6.x和2.5.x上，如果是针对指定分支的bugfix，也请确保您的pull request提交到了正确的分支上。

对于提交者，请给每一个PR选择正确的标签和分支，如有必要，也请不要忘记将bugfix反向合并到低版本分支

### 如何在docker中正确地注册ip？

[示例问题](https://github.com/alibaba/dubbo/issues/742)

Dubbo支持通过配置系统环境参数的方式指定ip/port，点击[这里](https://github.com/dubbo/dubbo-samples/tree/master/dubbo-samples-docker)可以查看详细示例。
