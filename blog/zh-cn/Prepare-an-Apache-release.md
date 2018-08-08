## 理解Apache发布的内容和流程

总的来说，Source Release是Apache关注的重点，也是发布的必须内容；而Binary Release是可选项，Dubbo可以选择是否发布二进制包到Apache仓库或者发布到Maven中央仓库。

请参考以下链接，找到更多关于ASF的发布指南:

- [Apache Release Guide](http://www.apache.org/dev/release-publishing)
- [Apache Release Policy](http://www.apache.org/dev/release.html)
- [Maven Release Info](http://www.apache.org/dev/publishing-maven-artifacts.html)

## 本地构建环境准备

主要包括签名工具、Maven仓库认证相关准备

1. 安装GPG，参见 https://www.gnupg.org/download/index.html

   - 如Mac OS

    ```sh
    $ brew install gpg
    $ gpg --version #检查版本，应该为2.x
    ```

2. 用gpg生成key

   - 根据提示，生成key

    ```shell
    $ gpg2 --full-gen-key
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

   - 查看key id 

    ```sh
    $ gpg --list-keys
    pub   rsa4096/28681CB1 2018-04-26 # 28681CB1就是key id
    uid       [ultimate] liujun (apache-dubbo) <liujun@apache.org>
    sub   rsa4096/D3D6984B 2018-04-26
    
    # 通过key id发送public key到keyserver
    $ gpg --keyserver pgpkeys.mit.edu --send-key 28681CB1
    # 其中，pgpkeys.mit.edu为随意挑选的keyserver，keyserver列表为：https://sks-keyservers.net/status/，因为相互之间是自动同步的，选任意一个都可以。
    ```

   - 如果有多个public key，设置默认key

    ~/.gnupg/gpg.conf
    
    ```proper
    # If you have more than 1 secret key in your keyring, you may want to
    # uncomment the following option and set your preferred keyid.
    
    default-key 28681CB1
    ```

3. 设置Apache中央仓库

   - Dubbo项目的父pom为apache pom

    ```xml
    <parent>
    <groupId>org.apache</groupId>
    <artifactId>apache</artifactId>
    <version>19</version>
    </parent>
    ```

   - 添加以下内容到.m2/settings.xml

     所有密码请使用[maven-encryption-plugin](http://maven.apache.org/guides/mini/guide-encryption.html)加密后再填入

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

   ​

## 打包&上传

1. 从主干分支拉取新分支作为发布分支，如现在要发布2.6.4版本，则从2.6.x拉出新分支2.6.4-release，此后2.6.4 Release Candidates涉及的修改及打标签等都在2.6.4-release分支进行，最终发布完成后合入主干分支。

2. 首先，在2.6.4-release分支验证maven组件打包、source源码打包、签名等是否都正常工作

   ```shell
   $ mvn clean install -Papache-release
   $ mvn deploy
   # 将snapshot包推送到maven中央仓库，处于staging状态
   ```

3. 用maven-release-plugin发布

   - 先用dryRun验证是否ok

    ```shell
    $ mvn release:prepare -Papache-release -Darguments="-DskipTests" -DautoVersionSubmodules=true -Dusername=YOUR GITHUB ID -DdryRun=true
    ```

   - 验证通过后，执行release:prepare

    ```shell
    $ mvn release:clean
    $ mvn release:prepare -Papache-release -Darguments="-DskipTests" -DautoVersionSubmodules=true -Dusername=YOUR GITHUB ID
    # 执行完成后：1.生成source.zip包； 2.打出tag，并推送到github仓库； 3.分支版本自动升级为2.6.4-SNAPSHOT，并将修改推送到github仓库
    ```

   - 执行release:perform，做正式发布

    ```shell
    $ mvn -Prelease release:perform -Darguments="-DskipTests" -DautoVersionSubmodules=true -Dusername=YOUR GITHUB ID
    # 所有artifacts发布到配置的远程maven中央仓库，处于staging状态
    ```

## 准备Apache发布

1. 准备svn本机环境（Apache使用svn托管项目的发布内容）

2. 将dubbo checkout到本地目录

   ```shell
   $ svn checkout https://dist.apache.org/repos/dist/dev/incubator/dubbo
   # 假定本地目录为 ~/apache/incubator/dubbo
   ```

3. 当前发布版本为2.6.4，新建目录

   ```shell
   $ cd ~/apache/incubator/dubbo # dubbo svn根目录
   $ mkdir 2.6.4
   ```

4. 添加public key到[KEYS](https://dist.apache.org/repos/dist/dev/incubator/dubbo/KEYS)文件。KEYS主要是让参与投票的人在本地导入，用来校验sign的正确性

5. 拷贝Dubbo根目录下的source.zip包到svn本地仓库dubbo/2.6.4

6. 生成sha512签名

   ```shell
   $ shasum -a 512 dubbo-incubating-2.6.4-source-release.zip >> dubbo-incubating-2.6.4-source-release.zip.sha512
   ```

7. 如果有binary release要同时发布

   ```shell
   # 到dubbo项目distribution的module下，执行：
   $ mvn install
   # target目录下，拷贝bin-release.zip以及bin-release.zip.asc到svn本地仓库dubbo/2.6.4
   # 参考第6步，生成sha512签名
   ```

8. 提交到Apache svn

   ```shell
   $ svn status
   $ svn commit -m 'prepare for 2.6.4 RC1'
   ```

## 验证Release Candidates

验证环节包含但不限于以下内容和形式：

1. Check signatures and hashes are good
```sh
sha512 dubbo-incubating-${release_version}-bin-release.zip.sha512
sha512 dubbo-incubating-${release_version}-source-release.zip.sha512
```

2. Unzip dubbo-incubating-${release_version}-source-release.zip to the default directory and check the following:

- Directory with 'incubating' in name
  `dubbo-incubating-${release_version}-bin-release`
  
- DISCLAIMER exists

- LICENSE and NOTICE exists and contents are good

- All files and no binary files exist

- All files has standard ASF License header

- Can compile from source

- All unit tests can pass  

  ```sh
  mvn clean test # This will run all unit tests
  # you can also open rat and style plugin to check if every file meets requirements.
  mvn clean install -Drat.skip=false -Dcheckstyle.skip=false
  ```

- Release candidates match with corresponding tags, you can find tag link and hash in vote email.

## 进入投票

投票分两个阶段：

1. Dubbo社区投票，发起投票邮件到dev@dubbo.apache.org。在社区开发者Review，并统计到3个同意发版的binding票后，即可进入下一阶段的投票。
2. Apache社区投票，发起投票邮件到general@apache.org。在Apache PMC Review，并统计到3个统一发版的binding票后，即可进行正式发布。

邮件模板：

```tex
Hello Dubbo Community,

This is a call for vote to release Apache Dubbo (Incubating) version 2.6.2.

The release candidates:
https://dist.apache.org/repos/dist/dev/incubator/dubbo/2.6.2/

Git tag for the release:
https://github.com/apache/incubator-dubbo/tree/dubbo-2.6.2

Hash for the release tag:
afab04c53edab38d52275d2a198ea1aff7a4f41e

Release Notes:
https://github.com/apache/incubator-dubbo/releases/tag/untagged-4775c0a22c60fca55118

The artifacts have been signed with Key : 28681CB1, which can be found in the keys file:
https://dist.apache.org/repos/dist/dev/incubator/dubbo/KEYS

The vote will be open for at least 72 hours or until necessary number of votes are reached.

Please vote accordingly:

[ ] +1 approve 
[ ] +0 no opinion 
[ ] -1 disapprove with the reason

Thanks,
The Apache Dubbo (Incubating) Team
```

##正式发布

1. 提交https://dist.apache.org/repos/dist/dev/incubator/dubbo目录下的发布包到https://dist.apache.org/repos/dist/release/incubator/dubbo/，完成正式发布。
2. 发邮件到dev@dubbo.apache.org和general@apache.org，通知社区发布完成。

## 完成Maven Convenient Binary发布（可选）

**apache.repository.org nexus仓库的权限已经申请，参见[jira](https://issues.apache.org/jira/browse/INFRA-16451)。**

之前发布到maven仓库的atifacts都处于staging状态，用Apache id登录apache.repository.org，发布即可。