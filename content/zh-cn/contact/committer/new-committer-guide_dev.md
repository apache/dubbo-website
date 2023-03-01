---
aliases:
    - /zh/contact/committer/new-committer-guide_dev/
description: Apache 提交者注册流程
linkTitle: 注册流程
title: Apache 提交者注册流程
type: docs
weight: 1
---




## 一、Apache 提交者的产生

### 项目孵化初始化提交者

项目孵化阶段，在孵化项目提案中，会有初始化提交者列表这一选项。确认你是初始化提交者的一员。项目在 apache 孵化器社区投票通过后，提交者可以开始准备注册账户了。可以参看[孵化器 wiki](https://wiki.apache.org/incubator/)

### 活跃的贡献者被选举为提交者

在后期的开发过程中，活跃的贡献者可以被选举为提交者。见[如何成为 committer](https://www.apache.org/dev/new-committers-guide.html#becoming-a-committer)

## 二、个人开发者提交 ICLA

### 1、选择 apache id
在[ apache 提交者列表页](http://people.apache.org/committer-index.html)查看已经注册过的 apache id，

### 2、个人提交者授权协议（ICLA）：
下载[ ICLA 模板](https://www.apache.org/licenses/icla.pdf)，查找可用的 id。将 icla.pdf 个人信息填写正确后打印,签名、扫描、并当做附件发送邮件给秘书 secretary@apache.org，秘书会帮忙创建 apache 用户 id。同时会创建一个 your_id@apache.org 的邮箱，可以在[ apache 提交者列表页](http://people.apache.org/committer-index.html)查看查找用户是否已经创建。

### 3、导师帮助提交用户id创建请求
导师将帮助提交 apache 账户创建请求给 root 邮件组，会有人帮助建立 id。一般需要2天时间账户会建立，请等待并在[ apache 提交者列表页](http://people.apache.org/committer-index.html)查看查找用户是否已经创建。

## 三、加入apache开发者组
1. 登陆 [Apache 账户工具](https://id.apache.org/)，在登陆页面点击"忘记密码"设置始化密码，会有一封密码重置邮件发送到 forward 邮箱(在孵化项目提案中提交的开发者邮件)
2. 关于 apache 邮箱：apache.org 邮箱并没有自己的邮件内容存储服务器。它需要借用其他邮件提供商的邮件内容存储、分发功能。在很多投票环节是建议使用 apache 邮箱的。
    这里就有一个问题，怎么在其它邮箱里面配置 apache.org 邮箱转发功能：
    * 收件箱：收取发送到 apache.org 的邮件。这个在第一步配置好 Apache 账户工具的 forward 邮箱就可以用 forward 邮箱收取邮件了
    * 发件箱：将发出的邮件显示发件邮箱为 apache.org 邮箱。请参考：[设置 apache 邮箱指南](https://reference.apache.org/committer/email)和[ gmail 邮箱设置方式](https://support.google.com/mail/answer/22370)。 其他邮箱服务的设置方式不方便找到，gmail 的最方便，建议换成 gmail 邮箱(不是广告)。
3. 修改编辑页面的 homepage url，[apache 提交者列表页](http://people.apache.org/committer-index.html)中你的账户能加主页链接。
4. 修改编辑页面的 github 账户(username)，提交确认后两个小时内会有邮件邀请你加入 github.com/apache-committers 组。这期间可以阅读[ ASF 工作方式](http://www.apache.org/foundation/how-it-works.html#developers)以对 ASF 开发做一些基本了解。
## 四、提交者获得对项目的写权限

[GitBox 账户链接工具](https://gitbox.apache.org/setup/)的操作

### Apache账户授权
按照提示授权对 Apache 账户的 OAuth 协议登入

### Github账户授权
按照提示授权对 github 账户的 OAuth 协议登入

### 在 github.com 设置 github 账户两因素授权（2FA）
按照[授权 GitHub 2FA wiki](https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication) 操作如下：
* 在手机安装 “google 身份验证器” app
* 按照[授权 GitHub 2FA wiki](https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication) 一步一步操作。

   在[两因素授权验证](https://github.com/settings/security)界面，不建议选择用手机扫描二维码，因为有些手机会扫描不出来。
   请打开手机 “google 身份验证器” app，点“+”选择“输入提供的秘钥”： 在“账户名” input 框写入 github 账户。在“您的秘钥” input 框写入:打开的网页中 "enter this text code" 链接里面的文本。在 app 中点击"添加" 后，将为此账户生成6位数字动态。将此6位数字写入网页中的文本框，然后点 “Enable”。这样 2FA 就设置成功了。

* 退出并重新登陆 github，输入用户名、密码后会多一步动态密码的填写，该动态密码就是 google 身份验证器上面的动态密码

* 大概需要半个小时,会有邮件通知你已经加入了 xx project-committers 开发者组。你也可以进入 [apache teams](https://github.com/orgs/apache/teams) 页面查看。

* 2FA 提交后，你已经 clone 的项目会有权限校验问题，解决方法为下面二选一：
  * 申请 Access Token：
   在 github 上生成 access token 后，指令行需要密码的地方就粘贴token。
   参考官网[帮助链接一](https://docs.github.com/cn/repositories/creating-and-managing-repositories/troubleshooting-cloning-errors#provide-access-token-if-2fa-enabled)和[帮助链接二](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
  * 改用 ssh：
   在命令行执行 ssh-keygen 命令， 然后把pub文件中的内容粘贴到 github 上
  
* 注意：一定要保证 github 的 2FA 为 "enable" 状态。当你将 2FA 设置为 "off" 时候，将会被对应的 apache committer 写权限组除名，直到你再次设置成功为止。
  
## 五、其他

### The Apache Way
详情请参考 [wiki](http://apache.org/foundation/governance/)

社区重于代码，如果某问题或者方案没有在社区(邮件列表)讨论过，就当没有发生过

### 小福利

Jetbrains 给 apache 提交者一个小福利，就是可以免费使用 idea 的全产品系列。具体注册地址为：https://www.jetbrains.com/shop/eform/apache?product=ALL
   
### 相关 wiki
https://www.apache.org/dev/new-committers-guide.html