---
aliases:
    - /zh/contact/committer/release-guide/common/
description: 通用 Release 流程
linkTitle: 通用 Release
title: 通用 Release 流程
type: docs
weight: 1
---



## 理解 Apache 发布的内容和流程

总的来说，Source Release 是 Apache 关注的重点，也是发布的必须内容；而 Binary Release 是可选项，Dubbo 可以选择是否发布二进制包到 Apache 仓库或者发布到 Maven 中央仓库。

请参考以下链接，找到更多关于 ASF 的发布指南:

- [Apache Release Guide](http://www.apache.org/dev/release-publishing)
- [Apache Release Policy](http://www.apache.org/dev/release.html)
- [Maven Release Info](http://www.apache.org/dev/publishing-maven-artifacts.html)

## 发布流程

### 1. 准备分支

从主干分支拉取新分支作为发布分支，如现在要发布 `${release_version}` 版本，则从开发分支拉出新分支 `${release_version}-release`，此后`${release_version}` Release Candidates 涉及的修改及打标签等都在`${release_version}-release`分支进行，最终发布完成后合入主干分支。

例：如 Java SDK 需要发布 `3.0.10` 版本，从 `3.0` 分支拉出新分支 `3.0.10-release`，并在此分支提交从 Snapshot 替换为 `3.0.10` 版本号的 commit。

### 2. Github 打标签并发布 Pre Release 状态

在对应 GitHub 仓库中基于 `${release_version}-release` 分支，打标签 `${release_version}-release`，填写 Release Note 并发布 Pre Release 状态。（**不允许在投票流程正式通过前把 Release 状态置为正式发布状态**）

注：打完标签之后此分支不允许再提交任何 commit，需要保证分支中最后一个 commit 就是标签的 commit 和投票中的 commit。

### 3. 预发布二进制包（可选）

通过构建工具推送二进制包到托管平台，如 Java SDK 发布到 Maven 仓库，状态为 Staging。

注：如果托管平台不支持预发布功能，则需要在投票正式通过后再发布。

### 4. 构建 Source Release 文件

将源码使用 zip 格式进行打包，使用个人 gpg 证书进行签名得到 asc 文件以及使用 shasum 工具生成 sha512 文件。

例：如 Java SDK 发布 `3.0.10` 版本，需要构建 `apache-dubbo-3.0.10-src.zip` 、 `apache-dubbo-3.0.10-src.zip.asc` 和 `apache-dubbo-3.0.10-src.zip.sha512` 三个文件。

### 5. 提交 Source Release 文件到 Apache SVN 仓库

将 Source Release 文件推送到 `https://dist.apache.org/repos/dist/dev/dubbo/` 仓库中，文件存储到 `https://dist.apache.org/repos/dist/dev/dubbo/${component_name}/${release_version}/` 目录下。（需要 Committer 权限才能推送）

### 6. 发送投票邮件

使用 Apache 邮箱发送投票邮件，投票邮件的标题为：`[VOTE] Release ${component_name} ${release_version} RC1`，邮件内容需要包含以下内容：
- Source Release 的链接
- 二进制包预发布的链接（如有）
- GitHub Tag 标签
- 最后一个 Commit 的 Hash
- Release Note 链接
- Source Release 使用的签名文件

以上的 Source Release、Tag、Hash、Release Note 必须完全对应

例：如 Java SDK 发布 `3.0.10` 版本，发送的邮件如下

```
Project: [VOTE] Release Apache Dubbo 3.0.10 RC1

Hello Community,

This is a call for vote to release Apache Dubbo version 3.0.10

The release candidates:
https://dist.apache.org/repos/dist/dev/dubbo/dubbo/3.0.10/

The staging repo:
https://repository.apache.org/content/repositories/orgapachedubbo-1216/

Git tag for the release:
https://github.com/apache/dubbo/tree/dubbo-3.0.10

Hash for the release tag:
e7894ca374e966a1d807e34b2744f276b843f39f

Release Notes:
https://github.com/apache/dubbo/releases/tag/dubbo-3.0.10

The artifacts have been signed with Key 2B249EDD, which can be
found in the keys file:
https://dist.apache.org/repos/dist/dev/dubbo/KEYS

The vote will be open for at least 72 hours or until the necessary number of
votes are reached.

Please vote accordingly:

[ ] +1 approve
[ ] +0 no opinion
[ ] -1 disapprove with the reason

Thanks,
The Apache Dubbo Team
```

### 7. PMC 检查版本信息，并进行投票

详细的检查列表请参考官方的 [check list](https://cwiki.apache.org/confluence/display/INCUBATOR/Incubator+Release+Checklist)

### 8. 投票通过，发布投票结果

在至少等待 72 小时且至少 3 位 PMC 投 +1 approve 票之后，可以发送邮件宣布投票结果。
投票结果邮件的标题为：`[RESULT] [VOTE] Release ${component_name} ${release_version} RC1`，邮件内容需要包含投票的 PMC 信息和投票的 thread。
（可以通过 [https://lists.apache.org/list.html?dev@dubbo.apache.org](https://lists.apache.org/list.html?dev@dubbo.apache.org) 找到）

例：如 Java SDK 发布 `2.7.16` 版本，发送的邮件如下

```
Project: [RESULT] [VOTE] Release Apache Dubbo 2.7.16 RC1

Hello Dubbo Community,

The release vote finished, We’ve received

+1 binding, Jun Liu
+1 binding, Laurence
+1 binding, Hao Guo

The vote and result thread:
https://lists.apache.org/thread/o4hk0b0rok78kw7ftqh0ly49wg8whgps
The vote passed. I am working on the further release process, thanks.

Best regards,
The Apache Dubbo Team
```

### 9. Github 标记正式 Release

在 GitHub 上正式把前面第 2 步打的标签更新为正式发布状态。

### 10. 合并 Release 分支回主干

将 `${release_version}-release` 合并回开发主干，并更新最新 snapshot 版本号。（`${release_version}-release` 可以不保留）

### 11. 移动 Source Release 到 release 仓库（重要）

将 `https://dist.apache.org/repos/dist/dev/dubbo/` 仓库中存储的 Source Release 文件移动到  `https://dist.apache.org/repos/dist/release/dubbo/` 仓库中。（仅 PMC 有权限）
同时删除之前的 Source Release 文件。（会被自动存放在 Archive 仓库）

### 12. 正式发布二进制包（如有）

将前面第 3 步发布的预发布状态的二进制包更新为正式发布状态。

### 13. 更新 Dubbo Website 文档

更新最新的 Source Release 等信息到 `dubbo-website` 对应文件中，至少包括 Source Release 的下载方式和二进制包的引用方式（如有），同时将历史的发布的链接更新到 archive 的域名下。

### 14. 发布正式发布结果通知

投票结果邮件的标题为：`[Announce] Release ${component_name} ${release_version} released`。

注：最好等二进制包发布正式同步生效后发布此邮件。

```
Project: [Announce] Apache Dubbo 3.0.9 released

Hello Dubbo Community,

I am glad to announce that Apache Dubbo 3.0.9 was released.

You can check detailed release notes here:
https://github.com/apache/dubbo/releases/tag/dubbo-3.0.9

If you have any questions using this version, please send mail to here or
report the issue <https://github.com/apache/dubbo/issues> on Github.

Best regards,
Dubbo Team
```