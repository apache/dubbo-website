---
type: docs
title: "如何准备 Apache Release"
linkTitle: "发版准备"
weight: 2
---


## 理解 Apache 发布的内容和流程

总的来说，Source Release 是 Apache 关注的重点，也是发布的必须内容；而 Binary Release 是可选项，Dubbo 可以选择是否发布二进制包到 Apache 仓库或者发布到 Maven 中央仓库。

请参考以下链接，找到更多关于 ASF 的发布指南:

- [Apache Release Guide](http://www.apache.org/dev/release-publishing)
- [Apache Release Policy](http://www.apache.org/dev/release.html)
- [Maven Release Info](http://www.apache.org/dev/publishing-maven-artifacts.html)

## 本地构建环境准备

主要包括签名工具、Maven 仓库认证相关准备

### 安装GPG

详细文档请参见[这里](https://www.gnupg.org/download/index.html), Mac OS 下配置如下

```sh
$ brew install gpg
$ gpg --version #检查版本，应该为2.x
```

### 用gpg生成key

根据提示，生成 key

 ```shell
 $ gpg --full-gen-key
 gpg (GnuPG) 2.0.12; Copyright (C) 2009 Free Software Foundation, Inc.
 This is free software: you are free to change and redistribute it.
 There is NO WARRANTY, to the extent permitted by law.
 
 Please select what kind of key you want:
   (1) RSA and RSA (default)
   (2) DSA and Elgamal
   (3) DSA (sign only)
   (4) RSA (sign only)
 Your selection? 1
 RSA keys may be between 1024 and 4096 bits long.
 What keysize do you want? (2048) 4096
 Requested keysize is 4096 bits
 Please specify how long the key should be valid.
         0 = key does not expire
      <n>  = key expires in n days
      <n>w = key expires in n weeks
      <n>m = key expires in n months
      <n>y = key expires in n years
 Key is valid for? (0) 
 Key does not expire at all
 Is this correct? (y/N) y
 
 GnuPG needs to construct a user ID to identify your key.
 
 Real name: Robert Burrell Donkin
 Email address: rdonkin@apache.org
 Comment: CODE SIGNING KEY
 You selected this USER-ID:
    "Robert Burrell Donkin (CODE SIGNING KEY) <rdonkin@apache.org>"
 
 Change (N)ame, (C)omment, (E)mail or (O)kay/(Q)uit? O
 You need a Passphrase to protect your secret key. # 填入密码，以后打包过程中会经常用到
 ```

### 查看 key id 

```sh
$ gpg --list-keys
pub   rsa4096/28681CB1 2018-04-26 # 28681CB1就是key id
uid       [ultimate] liujun (apache-dubbo) <liujun@apache.org>
sub   rsa4096/D3D6984B 2018-04-26

# 通过key id发送public key到keyserver
$ gpg --keyserver pgpkeys.mit.edu --send-key 28681CB1
# 其中，pgpkeys.mit.edu为随意挑选的keyserver，keyserver列表为：https://sks-keyservers.net/status/，为相互之间是自动同步的，选任意一个都可以。
```
如果有多个 public key，设置默认 key。修改`~/.gnupg/gpg.conf`

```sh
# If you have more than 1 secret key in your keyring, you may want to
# uncomment the following option and set your preferred keyid.
default-key 28681CB1
```
如果有多个 public key, 也可以删除无用的 key：

```sh  
### 先删除私钥，再删除公钥
$ gpg --yes --delete-secret-keys shenglicao2@gmail.com   ###老的私钥，指明邮箱即可
$ gpg --delete-keys 1808C6444C781C0AEA0AAD4C4D6A8007D20DB8A4
```

> PS: 最新版本经过实测，本地没有gpg.conf这个文件，因此如果在执行过程中遇到签名失败，可以参考这个文章：https://blog.csdn.net/wenbo20182/article/details/72850810 或 https://d.sb/2016/11/gpg-inappropriate-ioctl-for-device-errors

由于公钥服务器没有检查机制，任何人都可以用你的名义上传公钥，所以没有办法保证服务器上的公钥的可靠性。
通常，你可以在网站上公布一个公钥指纹，让其他人核对下载到的公钥是否为真。
```sh
# fingerprint参数生成公钥指纹：
$ gpg --fingerprint liujun
pub   rsa4096 2019-10-17 [SC]
      1376 A2FF 67E4 C477 5739  09BD 7DB6 8550 D366 E4C0
uid           [ultimate] liujun (CODE SIGNING KEY) <liujun@apache.org>
sub   rsa4096 2019-10-17 [E]
```
登录 https://id.apache.org, 将上面的 fingerprint （即 1376 A2FF 67E4 C477 5739  09BD 7DB6 8550 D366 E4C0）
粘贴到自己的用户信息中 OpenPGP Public Key Primary Fingerprint

### 设置 Apache 中央仓库

Dubbo 项目的父 pom 为 Apache pom(2.7.0 以上版本需要，2.6.x 发布版本不需要此操作)

```xml
<parent>
<groupId>org.apache</groupId>
<artifactId>apache</artifactId>
<version>19</version>
</parent>
```

 添加以下内容到 .m2/settings.xml
 所有密码请使用 [maven-encryption-plugin](http://maven.apache.org/guides/mini/guide-encryption.html)加密后再填入

```xml
<settings>
...
 <servers>
   <!-- To publish a snapshot of some part of Maven -->
   <server>
     <id>apache.snapshots.https</id>
     <username> <!-- YOUR APACHE LDAP USERNAME --> </username>
     <password> <!-- YOUR APACHE LDAP PASSWORD (encrypted) --> </password>
   </server>
   <!-- To stage a release of some part of Maven -->
   <server>
     <id>apache.releases.https</id>
     <username> <!-- YOUR APACHE LDAP USERNAME --> </username>
     <password> <!-- YOUR APACHE LDAP PASSWORD (encrypted) --> </password>
   </server>
  ...
     <!-- gpg passphrase used when generate key -->
    <server>
     <id>gpg.passphrase</id>
     <passphrase><!-- yourKeyPassword --></passphrase>
   </server>
 </servers>
</settings>
```

## 打包&上传

### 准备分支

从主干分支拉取新分支作为发布分支，如现在要发布$`{release_version}`版本，则从2.6.x拉出新分支`${release_version}-release`，此后`${release_version}` Release Candidates涉及的修改及打标签等都在`${release_version}-release`分支进行，最终发布完成后合入主干分支。

### 编译打包

首先，在`${release_version}-release`分支验证maven组件打包、source源码打包、签名等是否都正常工作。**2.6.x记得要使用1.6进行编译打包**

```shell
$ mvn clean install -Prelease
$ mvn deploy
```

上述命令将snapshot包推送到maven中央仓库

### ~~用maven-release-plugin发布~~ (`废弃`，参考后一步)

~~先用dryRun验证是否ok~~

```shell
$ mvn release:prepare -Prelease -Darguments="-DskipTests" -DautoVersionSubmodules=true -Dusername=YOUR GITHUB ID-DdryRun=true
```

~~验证通过后，执行release:prepare~~

```shell
$ mvn release:clean
$ mvn release:prepare -Prelease -Darguments="-DskipTests" -DautoVersionSubmodules=true -Dusername=YOUR GITHUB ID -DpushChanges=false
```

> 执行release插件时，如果指定了`-DpushChanges=true`, 插件会自动提交到远端的GitHub仓库中，此时就需要输入GitHub的密码，注意不是输入web页面的登录密码，而是一个`Personal access tokens`，获取方式详见[这里](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

> 这里有一点要注意的是tag， 在执行过程中，需要选择发布的artifactId, 下一个版本artifactId以及发布版本的tag, tag默认的是dubbo-parent-xxxx，需要改成dubbo-xxxx

执行完上述步骤后，你会发现：
1. `source-release.zip` 和 `bin-release.zip`包已经生成在`dubbo-distribution`目录下，请解压并检查文件是否完整
2. 本地已经打出相应的tag，同时新增一个commit，名叫`[maven-release-plugin] prepare release dubbo-x.x.x`
3. 分支版本自动升级为`${release_version+1}-SNAPSHOT`，同时新增一个commit，名叫`[[maven-release-plugin] prepare for next development iteration`

> 如果指定了`-DpushChanges=true`, 则本地提交会自动推送到远端的GitHub仓库。根据经验，建议不要指定为true，请设置为false，待本地检查通过之后再手动提交

~~执行release:perform，做staging发布~~

```shell
$ mvn -Prelease release:perform -Darguments="-DskipTests" -DautoVersionSubmodules=true -Dusername=YOUR GITHUB ID
```

此时插件会自动下载远端的tag对应的源码，编译后，将所有Artifacts发布到配置的远程[maven仓库](http://repository.apache.org)，处于staging状态。

### 使用mvn deploy进行deploy

> 要求：maven 3.5+ 

修改pom文件中的版本号，从2.7.x-SNAPSHOT改为2.7.x， 目前有3个地方需要修改。建议全文搜索。

```shell
$ mvn clean install -Prelease
$ mvn deploy -Prelease -DskipTests
```

所有被deploy到远程[maven仓库](http://repository.apache.org)的Artifacts都会处于staging状态

#### 注意点

- 在deploy执行过程中，有可能因为网络等原因被中断，如果是这样，可以重新开始执行。
- deploy执行到maven仓库的时候，请确认下包的总量是否正确。多次出现了包丢失的情况，特别是dubbo-parent包。


## 准备Apache发布

1. 准备svn本机环境（Apache使用svn托管项目的发布内容）

2. 将dubbo checkout到本地目录

   ```shell
   $ svn checkout https://dist.apache.org/repos/dist/dev/dubbo
   # 假定本地目录为 ~/apache/dubbo
   ```

3. 当前发布版本为${release_version}，新建目录

   ```shell
   $ cd ~/apache/dubbo # dubbo svn根目录
   $ mkdir ${release_version}
   ```

4. 添加public key到[KEYS](https://dist.apache.org/repos/dist/dev/dubbo/KEYS)文件并提交到SVN仓库（第一次做发布的人需要做这个操作，具体操作参考KEYS文件里的说明）。KEYS主要是让参与投票的人在本地导入，用来校验sign的正确性

   ```sh
   $ (gpg --list-sigs <your name> && gpg --armor --export <your name>) >> KEYS
   ```

5. 拷贝`dubbo-distribution/dubbo-apache-release/target`下的source相关的包到svn本地仓库`dubbo/${release_version}`

6. 生成sha512签名

   针对`src.zip`

   ```shell
   $ shasum -a 512 apache-dubbo-${release_version}-src.zip >> apache-dubbo-${release_version}-src.zip.sha512
   ```
  
   针对`bin-release.zip`，需要增加`-b`参数，表明是一个二进制文件

   ```shell
   $ shasum -b -a 512 apache-dubbo-${release_version}-bin.zip >> apache-dubbo-${release_version}-bin.zip.sha512
   ```


7. 如果有binary release要同时发布

   在`dubbo-distribution/dubbo-apache-release/target`目录下，拷贝`bin.zip`以及`bin.zip.asc`到svn本地仓库`dubbo/${release_version}`，参考第6步，生成sha512签名。

8. 提交到Apache svn

   ```shell
   $ svn status
   $ svn commit -m 'prepare for ${release_version} RC1'
   ```

9. 关闭Maven的staging仓库

   此步骤为发布2.7.0及以上版本必须要的步骤。在此之前请先确保所有的artifact都是ok的。登录http://repository.apache.org，点击左侧的`Staging repositories`，然后搜索Dubbo关键字，会出现一系列的仓库，选择你最近上传的仓库，然后点击上方的Close按钮，这个过程会进行一系列检查，检查通过以后，在下方的Summary标签页上出现一个连接，请保存好这个链接，需要放在接下来的投票邮件当中。链接应该是类似这样的: `https://repository.apache.org/content/repositories/orgapachedubbo-1015`

   > 请注意点击Close可能会出现失败，通常是网络原因，只要重试几次就可以了。可以点击Summary旁边的Activity标签来确认。  

## 验证Release Candidates

详细的检查列表请参考官方的[check list](https://cwiki.apache.org/confluence/display/INCUBATOR/Incubator+Release+Checklist)

首先，从一下地址下载要发布的Release Candidate到本地环境：

<pre>
https://dist.apache.org/repos/dist/dev/dubbo/${release_version}/
</pre>

然后，开始验证环节，验证包含但不限于以下内容和形式

### 检查签名和hash等信息

#### 检查sha512哈希

```sh
$ shasum -c apache-dubbo-${release_version}-src.zip.sha512
$ shasum -c apache-dubbo-${release_version}-bin.zip.sha512
```

#### 检查gpg签名

如果是第一次检查，需要首先导入公钥。 

```sh
 $ curl https://dist.apache.org/repos/dist/dev/dubbo/KEYS >> KEYS # download public keys to local directory
 $ gpg --import KEYS # import keys
 $ gpg —-edit-key liujun
   > trust # type trust command
```
然后使用如下命令检查签名

 ```sh
gpg --verify apache-dubbo-3.0.4-src.zip.asc apache-dubbo-3.0.4-src.zip
gpg --verify apache-dubbo-3.0.4-bin.zip.asc apache-dubbo-3.0.4-bin.zip
 ```


### 检查源码包的文件内容

解压缩`apache-dubbo-${release_version}-src.zip`，进行如下检查:

- DISCLAIMER exists
- LICENSE and NOTICE exists and contents are good
- All files and no binary files exist
- All files has standard ASF License header
- Can compile from source
- All unit tests can pass  
  ```sh
  mvn clean test # This will run all unit tests
  # you can also open rat and style plugin to check if every file meets requirements.
  mvn clean test -Drat.skip=false -Dcheckstyle.skip=false
  ```
- Release candidates match with corresponding tags, you can find tag link and hash in vote email.
  - check the version number in pom.xml are the same
  - check there are no extra files or directories in the source package, for example, no empty directories or useless log files，这里需要注意换行符是否一致  
    `diff -r a rc_dir tag_dir`
  - check the top n tag commits, dive into the related files and check if the source package has the same changes

### 检查三方依赖的合规性

按照Apache基金会合规性规定，源码或者是二进制分发包中均不能包含Category X的依赖，其中就常见的是包含了GPL/LGPL的依赖，即使是传递依赖也不行。因此在发版的时候需要通过以下的命令进行检查：

```sh
mvn license:add-third-party -Dlicense.useMissingFile
find . -name THIRD-PARTY.txt | xargs grep -E 'GPL|General Public License' | grep -v Apache | grep -v MIT | grep -v CDDL
```

如果一个依赖提供了双协议或多重协议，可以选择与Apache最兼容的一个协议。

你可以参考此文章：[ASF第三方许可证策](https://apache.org/legal/resolved.html)


### 检查二进制包的文件内容

解压缩`apache-dubbo-${release_version}-bin.zip`，进行如下检查:

* Check signatures are good
* LICENSE and NOTICE exists and contents are good

注意，如果二进制包里面引入了第三方依赖，则需要更新LICENSE，加入第三方依赖的LICENSE，如果第三方依赖的LICENSE是Apache 2.0，并且对应的项目中包含了NOTICE，还需要更新NOTICE文件

## 进入投票

dubbo毕业之后，投票分只需要一次：

1. Dubbo社区投票，发起投票邮件到dev@dubbo.apache.org。在社区开发者Review，经过至少72小时并统计到3个同意发版的binding票后（只有PMC的票才是binding），即可进入下一阶段的投票。

Dubbo社区投票邮件模板：

```text
Hello Dubbo Community,

This is a call for vote to release Apache Dubbo version 2.7.2.

The release candidates:
https://dist.apache.org/repos/dist/dev/dubbo/2.7.2/

The staging repo:
https://repository.apache.org/content/repositories/orgapachedubbo-1005

Git tag for the release:
https://github.com/apache/dubbo/tree/dubbo-2.7.2

Hash for the release tag:
afab04c53edab38d52275d2a198ea1aff7a4f41e

Release Notes:
https://github.com/apache/dubbo/releases/tag/untagged-4775c0a22c60fca55118

The artifacts have been signed with Key : 28681CB1, which can be found in the keys file:
https://dist.apache.org/repos/dist/dev/dubbo/KEYS

The vote will be open for at least 72 hours or until necessary number of votes are reached.

Please vote accordingly:

[ ] +1 approve 
[ ] +0 no opinion 
[ ] -1 disapprove with the reason

Thanks,
The Apache Dubbo Team
```


宣布投票结果模板：
```text
We’ve received 3 +1 binding votes and one +1 non-binding vote:

+1 binding, Ian Luo
+1 binding, Huxing Zhang
+1 binding, Jun Liu

+1 non-binding, Jerrick

I will start to release today.

Best regards,
The Apache Dubbo Team
```

## 正式发布

1. 将[dev](https://dist.apache.org/repos/dist/dev/dubbo)目录下的发布包添加到[release](https://dist.apache.org/repos/dist/release/dubbo)目录下，KEYS有更新的，也需要同步更新。
2. 删除[dev](https://dist.apache.org/repos/dist/dev/dubbo)目录下的发布包
3. 删除[release](https://dist.apache.org/repos/dist/release/dubbo)目录下上一个版本的发布包，这些包会被自动保存在[这里](https://archive.apache.org/dist/dubbo)
4. 此步骤为发布2.7.0及以上版本必须要的步骤。在此之前请先确保所有的artifact都是ok的。登录http://repository.apache.org，点击左侧的`Staging repositories`，然后搜索Dubbo关键字，会出现一系列的仓库，选择你最近上传的仓库，然后点击上方的Release按钮.
5. 发布GitHub上的[release notes](https://github.com/apache/dubbo/releases)
6. 修改GitHub的Readme文件，将版本号更新到最新发布的版本
7. 在官网下载[页面](/en/blog/2020/05/18/past-releases/)上添加最新版本的下载链接。最新的下载链接应该类似[这样](https://www.apache.org/dyn/closer.cgi?path=dubbo/$VERSION/apache-dubbo-$VERSION-source-release.zip). 同时更新以前版本的下载链接，改为类似`https://archive.apache.org/dist/dubbo/$VERSION/apache-dubbo-$VERSION-bin-release.zip`. 具体可以参考过往的[下载链接](/en/blog/2020/05/18/past-releases/) [可以参考] (https://github.com/apache/dubbo-website/pull/887)
8. 合并`${release-version}-release`分支到对应的主干分支， 然后删除相应的release分支，例如: `git push origin --delete 2.7.0-release`
9. 发邮件到 `dev@dubbo.apache.org`
  宣布release邮件模板： 

```text
Hello Community,

The Apache Dubbo team is pleased to announce that the
2.6.6 has just been released.

Apache Dubbo™  is a high-performance, java based, open source
RPC framework. Dubbo offers three key functionalities, which include
interface based remote call, fault tolerance & load balancing, and
automatic service registration & discovery.

Both the source release[1] and the maven binary release[2] are available
now, you can also find the detailed release notes here[3].


If you have any usage questions, or have problems when upgrading or find
any problems about enhancements included in this release, please don’t
hesitate to let us know by sending feedback to this mailing list or filing
an issue on GitHub[4].


[1] https://dubbo.apache.org/en/blog/2020/05/18/past-releases/
[2] https://repo1.maven.org/maven2/org/apache/dubbo/dubbo
[3] https://github.com/apache/dubbo/releases
[4] https://github.com/apache/dubbo/issues

```


## 完成Maven Convenient Binary发布（可选）

**repository.apache.org** nexus仓库的权限已经申请，参见[jira](https://issues.apache.org/jira/browse/INFRA-16451)

发布jar包到maven仓库，首先访问[repository.apache.org](https://repository.apache.org), 选择`staging repository`, 点击`release`按钮。等待一段时间之后，在[这里](https://repository.apache.org/content/repositories/releases/org/apache/dubbo/)确认完整性和正确性. 发布到Maven中央仓库则还需要等待一段时间。可以在[这里](https://repo.maven.apache.org/maven2/org/apache/dubbo)进行确认。

## FAQ

#### gpg: signing failed: Inappropriate ioctl for device

If you've encountered this error, try the following commands:

```
export GPG_TTY=$(tty)
```
