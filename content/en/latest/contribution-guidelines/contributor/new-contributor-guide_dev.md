---
type: docs
title: "新贡献者向导"
linkTitle: "新手向导"
weight: 2
---


这篇向导旨在给正在准备向 Dubbo 提交贡献的新手提供指导。

### 邮件列表描述

邮件列表是 Dubbo 官方推荐的讨论方式，所有与 Dubbo 相关的内容都可以在这里讨论，请点击 [issue](https://github.com/apache/dubbo/issues/1393) 了解更多关于邮件列表订阅的内容

如需订阅如下邮件列表，请参考 [邮件列表订阅向导](../mailing-list-subscription-guide_dev/)

* dev@dubbo.apache.org：开发邮件列表，您在使用或者开发 Dubbo 的过程中遇到的任何问题，都可以在这里进行提问。
* commits@dubbo.apache.org：所有的提交内容都会推送到这个邮件列表，如果您对 Dubbo 的进展感兴趣，可以订阅这个邮件列表。
* issues@dubbo.apache.org：所有的 JIRA [issues](https://issues.apache.org/jira/projects/DUBBO/issues) 和修改信息都会推送到这个邮件列表。Dubbo 社区已经决定使用 github issues 代替 JIRA issues，因此大部分 issues 将由 github issues 进行跟踪。JIRA issues 用于跟踪 ASF 相关问题。

### 报告问题

### 贡献代码
#### 贡献流程
此贡献流程适用于所有的Apache Dubbo社区内容，包括但不限于dubbo(主干仓库)、dubbo admin、dubbo website。

以下以贡献dubbo(主干仓库)为例，详细说明贡献流程。

##### 1. **fork Apache/Dubbo 项目到您的github帐号下**

##### 2. **克隆您fork的Dubbo代码仓库到您本地**
```shell
git clone ${your fork dubbo repo address，for example：https://github.com/${your github id}/dubbo.git}
cd dubbo
```

##### 3. **添加Apache/Dubbo仓库为upstream仓库**
```shell
git remote add upstream https://github.com/apache/dubbo.git

git remote -v

    origin    ${your fork dubbo repo address} (fetch)
    origin    ${your fork dubbo repo address} (push)
    upstream    https://github.com/apache/dubbo.git (fetch)
    upstream    https://github.com/apache/dubbo.git (push)

git fetch origin
git fetch upstream
```
##### 4. **我们的工作以issue为驱动，认领一个issue，或者创建一个issue并描述清楚要做什么。**
新人推荐标记为： `good first issue` 的 issue

##### 5. **选择一个开发的基础分支，通常是 master/3.1， 并基于此创建一个新的本地分支**
master/3.1 分支是目前 3.1 版本的开发分支

```shell
# 从远程仓库创建分支到本地
git checkout -b up-dev-issue#${issue-number} upstream/master
```
为了避免一些不必要的麻烦，我们推荐以 "upstream" 中的分支为基础创建新的本地分支。
可以以要做的事情的简单描述作为分支名(只要你能看懂就行)，通常情况下我们会把issue号包含到分支名中，例如上面的 checkout 命令中的。 

##### 6. **在本地新建的开发分支上进行各种修改**
首先请保证您阅读并正确设置Dubbo code style， 相关内容请阅读 [编码规范](#编码规范) 。

修改时请保证该本地分支上的修改仅和issue相关，并尽量细化，做到一个分支只修改一件事，一个PR只修改一件事。

可以在提交注释中添加"#issue号"，将该提交与issue关联。

##### 7. **将您开发完成后的分支，上传到您fork的仓库**
```shell
git push origin up-dev-issue#${issue-number}
```

##### 8. **创建 pull request**

* 参考[pull request template](https://github.com/apache/dubbo/blob/master/PULL_REQUEST_TEMPLATE.md)中的检查列表
  
Dubbo社区将会Review您的Pull Request，并可能提出修改意见，您可以根据修改意见回到步骤6进行修改，并使用步骤7进行重新提交。

##### 9. **如果没有问题，Dubbo社区将会把您的修改合并，恭喜您成为Dubbo的贡献者。**

#### 特别说明:
* 开源项目一般都是以分支的方式工作，每件事情都创建一个分支。
* 创建分支时，不要从本地仓库里的分支里创建，而是从指向主仓库的远程仓库创建。
* 不要一直在同一个分支工作， 一个分支只做一件事情，不要在同一个分支做多件事情。
* 一直在同一分支中修改，提交都会一直在该分支中。这样就会造成每次PR都会带着之前的所有被merge、未被merge的提交。
* 一件事情可以是一个issue，也可以是一个issue中的部分(issue太大可以拆解)。
* 一个分支(一件事情)只提一个PR。
* 提了PR后，如果PR有问题需要修改，可以继续在这个PR关联的分支修改提交。在PR被merge前，向这个分支继提交都会进入这个PR。
* 如果只是想纯更新代码，可以从主仓库提PR到你fork的仓库， 源选择主仓库里的分支，目标选你fork的仓库的分支。
* 这种方式更新代码，你fork的仓库中会多一个提交。如果以你fork的仓库中的分支为源创建分支， 这个提交纪录会被带过去并会在PR中， 所以要以主仓库的分支为源创建分支。
* issue 认领: 在要认领的issue中回复，明确表式你将处理这个issue。这样社区的PMC和Committer会把该issue assign给你。当然认领前先看下这个issue有没有被别人认领了。
  为了方便，我们可以把认领的回复统一为: **@i will solve it@**， 当然这不是必须的。

#### 编码规范
请按照[CONTRIBUTING.md](https://github.com/apache/dubbo/blob/master/CONTRIBUTING.md)中的编码规范对自己的代码进行检查。
##### **代码约定**
我们的代码风格几乎和标准 Java 约定一致（流行IDE的默认设置满足这一点），主要有以下附加限制：
* 如果当前行中有超过 120 个字符，则起一个新的行。
* 确保所有新的 .java 文件都有一个简单的 JavaDoc 类注释，最好至少有一个关于该类的解释说明。
* 将ASF许可注释添加到所有新的 .java 文件（从项目中的现有文件复制）
* 请确保没有将 @author 标记添加到您所贡献的文件中，因为 Apache 不使用 @author 标记，其他方式（如cvs）将公平地记录所有您的贡献。
* 为代码添加一些 JavaDoc，如果您更改命名空间，则需要一些 XSD DOC 元素。
* 对于新的特征或重要的修复程序，应该添加单元测试。
* 如果没有其他人使用您的分支，请将它与 master（或主项目中的其他目标分支）同步。
* 当编写提交消息时，请遵循这些约定，如果您正在修复一个现有问题，请在提交消息的末尾添加 Fixes XXX（其中XXX是问题编号）。

##### **代码风格**
我们提供了 IntelliJ idea 的模版文件 dubbo根目录/codestyle/dubbo_codestyle_for_idea.xml，您可以将它导入到IDE。
如果使用 Eclipse，可以通过参考该文件手动配置。

**代码风格检查:**

1. 安装 checkstyle 插件(IDEA可以在插件市场搜索)
2. 插件安装好后，在IDEA的settings==>tool==>checkstyle中设置:
![checkstyle1](/imgs/dev/checkstyle1.png)
![checkstyle2](/imgs/dev/checkstyle2.png)
![checkstyle3](/imgs/dev/checkstyle3.png)
![checkstyle4](/imgs/dev/checkstyle4.png)
   
**注意事项**

使用 dubbo_codestyle_for_idea.xml 为你的 IDEA 设置代码格式是贡献代码前至关重要的一个步骤，否则你将会无法通过 CI 的代码风格校验，下面几个步骤给你演示了如何配置代码格式：
1. 进入菜单页 Editor > Code Style
2. 在 Code Style 页面的 scheme 菜单中点击 manage profiles 选项 在下拉列表中选择 Import Scheme， 接着选择 IntelliJ IDEA code style XML 导入 xml 文件
3. 输入你的格式名称，方便在不同工程之间进行识别，最后别忘了 ⏎ 来保存更改.
   设置完成后，IDEA 会帮助你自动 reformat 代码

### 参与发布投票

参与发布投票是一种重要的贡献社区的方式，Dubbo 社区非常欢迎和鼓励任何人参与投票，每当一个版本需要正式发布的时候，会在开发者邮件列表上进行发布投票，只有当投票取得通过之后，才会正式发布，可以参考这个[检查列表](https://cwiki.apache.org/confluence/display/INCUBATOR/Incubator+Release+Checklist)对源码进行合规性检查。如果有任何问题，可以在开发者邮件列表上提问。
