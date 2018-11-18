# Apache 提交者注册流程

## 一、apache提交者的产生
### 项目孵化初始化提交者
   项目孵化阶段，在孵化项目提案中，会有初始化提交者列表这一选项。确认你是初始化提交者的一员。项目在apache孵化器社区投票通过后，提交者可以开始准备注册账户了。可以参看[孵化器wiki](https://wiki.apache.org/incubator/)
### 活跃的贡献者被选举为提交者
   在后期的开发过程中，活跃的贡献者可以被选举为提交者。见[如何成为committer](https://www.apache.org/dev/new-committers-guide.html#becoming-a-committer)

## 二、个人开发者提交ICLA

### 1、选apache id
   在[apache提交者列表页](http://people.apache.org/committer-index.html)查看可用的apache id，
### 2、个人提交者授权协议（ICLA）：
   下载[ICLA模板](https://www.apache.org/licenses/icla.pdf)，查找可用的id。将icla.pdf个人信息填写正确后打印,签名、扫描、并当做附件发送邮件给秘书 secretary@apache.org,秘书会帮忙创建apache 用户id。同时会创建一个your id@apache.org的邮箱，可以在[apache提交者列表页](http://people.apache.org/committer-index.html)查看查找用户是否已经创建。
### 3、导师帮助提交用户id创建请求
   导师将帮助提交apache账户创建请求给root邮件组，会有人帮助建立id。一般需要2天时间账户会建立，请等待并在[apache提交者列表页](http://people.apache.org/committer-index.html)查看查找用户是否已经创建。

## 三、加入apache开发者组
   * 1、登入[Apache账户工具](https://id.apache.org/)，首次登入可以选忘记密码获得初始化密码，会发送到forward邮箱(在孵化项目提案中提交的开发者邮件)
   * 2、关于apache邮箱：apache.org邮箱并没有自己的邮件内容存储服务器。他是需要借用其他邮件提供商的邮件内容存储、分发功能。在很多投票环节是建议用apache邮箱的。
    这就就有一个问题，怎么在其他邮箱里面配置好apache.org邮箱转发功能：
    1）收件箱：收取发送到apache.org的邮件。这个在第一步配置好Apache账户工具的forward邮箱就可以用forward邮箱收取邮件了
    2）发件箱：将发出的邮件显示发件邮箱为apache.org邮箱。请参考：[设置apache邮箱指南](https://reference.apache.org/committer/email)和[gmail邮箱设置方式](http://gmailblog.blogspot.com/2009/07/send-mail-from-another-address-without.html)。 其他邮箱服务的设置方式不方便找到，gmail的最方便，建议换成gmail邮箱(不是广告)。
   * 3、修改编辑页面的homepage url，[apache提交者列表页](http://people.apache.org/committer-index.html)中你的账户能加主页链接。
   * 4、修改编辑页面的github账户，会发有邮件邀请你加入github.com/apache-commiiters组。这时间请看[ASF工作方式](http://www.apache.org/foundation/how-it-works.html#developers)对ASF开发做一些基本了解。
## 四、提交者获得对项目的写权限

[GitBox账户链接工具](https://gitbox.apache.org/setup/)的操作

### 1、Apache账户授权
   按照提示授权对Apache账户的OAuth协议登入
### 2、Github账户授权
   按照提示授权对Github账户的OAuth协议登入
### 3、在github.com设置github账户两因素授权（2FA）
   按照[授权GitHub 2FA wiki](https://help.github.com/articles/configuring-two-factor-authentication-via-a-totp-mobile-app/)操作如下：
* 1)、在手机安装 “google身份验证器” app
* 2)、按照[授权GitHub 2FA wiki](https://help.github.com/articles/configuring-two-factor-authentication-via-a-totp-mobile-app/)一步一步操作。

   在[两因素授权验证(2. Scan this barcode with your app.)](https://github.com/settings/two_factor_authentication/verify)界面，不建议选择用手机扫描二维码，因为有些手机会扫描不出来。
   请打开手机 “google身份验证器” app，点“+”选择“输入提供的秘钥”： 在“账户名”input框写入github账户。在“您的秘钥”input框写入:打开的网页中"enter this text code" 链接里面的文本。在app中点击"添加" 后，将为此账户生成6位数字动态。将此6位数字写入网页中的文本框，然后点“Enable”。这样2fa就设置成功了。

* 3)、退出并重新登入Github，输入用户名、密码后会多一步。动态密码的填写，用app的动态密码

* 4)、约需要半个小时,会有邮件通知你已经加入了xx project-committers开发者组。你也可以自己去[apache teams](https://github.com/orgs/apache/teams) 页面查看。

* 5)、2fa提交后你已经clone的项目会有权限校验问题，解决方法为下面二选一：
  * a.申请Access Token
   在github上 生成access token 后，指令行需要密码的地方就粘贴token。
   参考官网[帮助链接一](https://help.github.com/articles/https-cloning-errors/#provide-access-token-if-2fa-enabled)和[帮助链接二](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/)
  * b. 改用ssh
   ssh-keygen 然后把pub文件中的内容粘贴到github上
  
* 注意：一定要保证github的2fa为"enable"状态。当你将2fa设置为"off"时候，将会被对应的apache committer写权限组除名，直到你再次设置成功为止。
  
## 五、其他
   ### The apache way
   参看[wiki](http://apache.org/foundation/governance/)

   社区重于代码
   如果没有在社区(邮件列表)讨论过，就当没有发生过
   ### 小福利
   Jetbrains给apache提交者一个小福利，就是可以免费使用idea的全产品系列。具体注册地址为：https://www.jetbrains.com/shop/eform/apache?product=ALL
   ### 相关 wiki
https://www.apache.org/dev/new-committers-guide.html