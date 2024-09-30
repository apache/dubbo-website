---
title: "How to Prepare Apache Release"
linkTitle: "How to Prepare Apache Release"
date: 2018-09-02
tags: ["News"]
description: >
    This article describes how Apache releases content and the processes involved.
---

## Understanding Apache Release Content and Processes

In general, the Source Release is the focus of Apache and is essential for the release; the Binary Release is optional. Dubbo can choose whether to publish a binary package to the Apache repository or release it to the Maven Central Repository.

Please refer to the following links for more about ASF's release guidelines:

- [Apache Release Guide](http://www.apache.org/dev/release-publishing)
- [Apache Release Policy](http://www.apache.org/dev/release.html)
- [Maven Release Info](http://www.apache.org/dev/publishing-maven-artifacts.html)

## Preparing Local Build Environment

Mainly includes signing tools and Maven repository authentication preparations.

### Installing GPG

See detailed documentation [here](https://www.gnupg.org/download/index.html), for Mac OS the configuration is as follows:

```sh
$ brew install gpg
$ gpg --version # check version, should be 2.x
```

### Generate Key with gpg

Follow the prompts to generate the key.

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
 You need a Passphrase to protect your secret key. # Enter the password, it will be needed often during the packaging process
```

### View Key ID

```sh
$ gpg --list-keys
pub   rsa4096/28681CB1 2018-04-26 # 28681CB1 is the key id
uid       [ultimate] liujun (apache-dubbo) <liujun@apache.org>
sub   rsa4096/D3D6984B 2018-04-26

# Send public key to keyserver using key id
$ gpg --keyserver pgpkeys.mit.edu --send-key 28681CB1
# Here, pgpkeys.mit.edu is a randomly selected keyserver, the keyserver list is: https://sks-keyservers.net/status/, which automatically syncs with each other; any one can be selected.
```
If there are multiple public keys, set a default key. Modify `~/.gnupg/gpg.conf`.

```sh
# If you have more than 1 secret key in your keyring, you may want to
# uncomment the following option and set your preferred keyid.
default-key 28681CB1
```
If there are multiple public keys, you can also delete unused keys:

```sh  
### First delete the private key, then delete the public key
$ gpg --yes --delete-secret-keys shenglicao2@gmail.com   ### Old private key, specify the email address
$ gpg --delete-keys 1808C6444C781C0AEA0AAD4C4D6A8007D20DB8A4
```

> PS: The latest version has been tested, and there is no gpg.conf file locally, so if you encounter signing failures during the execution process, you can refer to this article: https://blog.csdn.net/wenbo20182/article/details/72850810 or https://d.sb/2016/11/gpg-inappropriate-ioctl-for-device-errors

### Set Up Apache Central Repository

The parent POM for the Dubbo project is Apache POM (required for versions 2.7.0 and above, not needed for 2.6.x release versions).

```xml
<parent>
<groupId>org.apache</groupId>
<artifactId>apache</artifactId>
<version>19</version>
</parent>
```
Add the following content to .m2/settings.xml. All passwords should be filled in after being encrypted with [maven-encryption-plugin](http://maven.apache.org/guides/mini/guide-encryption.html).
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
     <!-- gpg passphrase used when generating key -->
    <server>
     <id>gpg.passphrase</id>
     <passphrase><!-- yourKeyPassword --></passphrase>
   </server>
 </servers>
</settings>
```


## Packaging & Uploading

### Prepare Branch

Pull a new branch from the main branch as a release branch. If you are going to release version `$`{release_version}`, create a new branch `${release_version}-release` from 2.6.x. All modifications and tagging related to `${release_version} Release Candidates` will be done in the `${release_version}-release` branch, and after the final release is completed, it will be merged back into the main branch.

### Compile and Package

First, verify that the Maven components packaging, source code packaging, signing, etc., are functioning correctly in the `${release_version}-release` branch. **For 2.6.x, make sure to use 1.6 for compiling and packaging.**

```shell
$ mvn clean install -Prelease
$ mvn deploy
```

The above commands will push the snapshot package to the Maven Central Repository.

### Release with maven-release-plugin

First, use dryRun to verify that it is okay.

```shell
$ mvn release:prepare -Prelease -Darguments="-DskipTests" -DautoVersionSubmodules=true -Dusername=YOUR GITHUB ID-DdryRun=true
```

After validation passes, execute release:prepare.

```shell
$ mvn release:clean
$ mvn release:prepare -Prelease -Darguments="-DskipTests" -DautoVersionSubmodules=true -Dusername=YOUR GITHUB ID -DpushChanges=false
```

> When executing the release plugin, if `-DpushChanges=true` is specified, the plugin will automatically commit to the remote GitHub repository. At this time, you need to enter the GitHub password, which is not the web page login password, but rather a `Personal access tokens`. Please see [here](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) for how to obtain it.

> One thing to note is the tag. During execution, you need to select the released artifactId, the next version artifactId, and the released version tag. The tag defaults to dubbo-parent-xxxx, which needs to be changed to dubbo-xxxx.

After completing the above steps, you will find:
1. `source-release.zip` and `bin-release.zip` packages have been generated in the `dubbo-distribution` directory. Please unzip and check if the files are complete.
2. A corresponding tag has been created locally, along with a new commit named `[maven-release-plugin] prepare release dubbo-x.x.x`.
3. The branch version automatically upgrades to `${release_version+1}-SNAPSHOT`, along with a new commit named `[[maven-release-plugin] prepare for next development iteration`.

> If `-DpushChanges=true` is specified, local commits will be automatically pushed to the remote GitHub repository. Based on experience, it is recommended not to set it as true, please set it to false, and manually commit after local verification.

Execute release:perform to do the staging release.

```shell
$ mvn -Prelease release:perform -Darguments="-DskipTests" -DautoVersionSubmodules=true -Dusername=YOUR GITHUB ID
```

At this time, the plugin will automatically download the source code corresponding to the remote tag, compile it, and publish all artifacts to the configured remote [Maven repository](http://repository.apache.org), which is in a staging state.

#### Notes

- During the deploy execution, it may be interrupted due to network issues. If this is the case, you can start executing again.
- When the deploy command reaches the Maven repository, please confirm whether the total number of packages is correct. There have been multiple cases of package loss, especially for the dubbo-parent package.


## Preparing for Apache Release

1. Prepare the local environment for svn (Apache uses svn to host project release content).

2. Check out dubbo to the local directory.

   ```shell
   $ svn checkout https://dist.apache.org/repos/dist/dev/dubbo
   # Assume the local directory is ~/apache/incubator/dubbo
   ```

3. For the current release version of ${release_version}, create a new directory.

   ```shell
   $ cd ~/apache/incubator/dubbo # Dubbo svn root directory
   $ mkdir ${release_version}
   ```

4. Add the public key to the [KEYS](https://dist.apache.org/repos/dist/dev/dubbo/KEYS) file and commit it to the SVN repository (first-timers need to perform this operation; refer to the KEYS file for specific instructions). The KEYS file mainly allows voters to import it locally to verify the correctness of the signatures.

   ```sh
   $ gpg -a --export your_key_id >> KEYS
   ```

5. Copy the source-related packages from `distribution/target` to the SVN local repository `dubbo/${release_version}`.

6. Generate sha512 signatures.

   For `source-release.zip`:

   ```shell
   $ shasum -a 512 apache-dubbo-${release_version}-source-release.zip >> apache-dubbo-${release_version}-source-release.zip.sha512
   ```

   For `bin-release.zip`, the `-b` parameter needs to be added to indicate that it is a binary file.

   ```shell
   $ shasum -b -a 512 apache-dubbo-${release_version}-bin-release.zip >> apache-dubbo-${release_version}-bin-release.zip.sha512
   ```

7. If there is a binary release to publish simultaneously.

   In the `distribution/target` directory, copy `bin-release.zip` and `bin-release.zip.asc` to the SVN local repository `dubbo/${release_version}`, referencing step 6 to generate sha512 signatures.

8. Commit to Apache svn.

   ```shell
   $ svn status
   $ svn commit -m 'prepare for ${release_version} RC1'
   ```

## Validate Release Candidates

For a detailed checklist, refer to the official [check list](https://cwiki.apache.org/confluence/display/INCUBATOR/Incubator+Release+Checklist).

First, download the release Candidate you want to validate from the following address to the local environment:

<pre>
https://dist.apache.org/repos/dist/dev/dubbo/${release_version}/
</pre>

Then, begin the validation phase, which includes but is not limited to the following content and forms.

### Check Signature and Hash Information

#### Check sha512 Hash

```sh
$ shasum -c apache-dubbo-${release_version}-source-release.zip.sha512
$ shasum -c apache-dubbo-${release_version}-bin-release.zip.sha512
```

#### Check gpg Signature

If it's the first check, you need to import the public key first.

```sh
 $ curl https://dist.apache.org/repos/dist/dev/dubbo/KEYS >> KEYS # Download public keys to local directory
 $ gpg --import KEYS # Import keys
 $ gpg —edit-key liujun
   > trust # Type trust command
```
Then, use the following command to check the signature.

```sh
gpg --verify apache-dubbo-2.6.3-source-release.zip.asc apache-dubbo-2.6.3-source-release.zip
gpg --verify apache-dubbo-2.6.3-bin-release.zip.asc apache-dubbo-2.6.3-bin-release.zip
```

### Check Source Package File Content

Unzip `apache-dubbo-${release_version}-source-release.zip` and perform the following checks:

- Directory with 'incubating' in name
  `apache-dubbo-${release_version}-source-release`  
- DISCLAIMER exists
- LICENSE and NOTICE exist and contents are good
- All files and no binary files exist
- All files have standard ASF License header
- Can compile from source
- All unit tests can pass  
  ```sh
  mvn clean test # This will run all unit tests
  # You can also open rat and style plugin to check if every file meets requirements.
  mvn clean test -Drat.skip=false -Dcheckstyle.skip=false
  ```
- Release candidates match with corresponding tags; you can find tag links and hashes in the vote email.
  - Check that the version number in pom.xml is the same
  - Check that there are no extra files or directories in the source package, for example, no empty directories or useless log files, paying attention to whether line endings are consistent.  
    `diff -r a rc_dir tag_dir`
  - Check the top n tag commits, dive into the related files and check if the source package has the same changes.

### Check Binary Package File Content

Unzip `apache-dubbo-${release_version}-bin-release.zip` and perform the following checks:

* Check signatures are good
* 'incubating' in name
* LICENSE and NOTICE exist and contents are good

Note that if third-party dependencies are introduced in the binary package, the LICENSE needs to be updated to include the LICENSE of the third-party dependencies. If the third-party dependencies' LICENSE is Apache 2.0 and the corresponding project includes a NOTICE, the NOTICE file also needs to be updated.

## Entering Voting

Voting consists of two phases:

1. Dubbo community vote, initiate the voting email to dev@dubbo.apache.org. After the community developers review, if there are at least 72 hours and three binding votes in favor of the version (only PMC votes are binding), it can proceed to the next phase of voting.
2. Apache community vote, initiate the voting email to general@incubator.apache.org. After at least 72 hours and counting three binding votes in favor of the version (only IPMC Member votes are binding), formal release can proceed.

Dubbo community voting email template:

```text
Hello Dubbo Community,

This is a call for vote to release Apache Dubbo (Incubating) version 2.6.2.

The release candidates:
https://dist.apache.org/repos/dist/dev/dubbo/2.6.2/

Git tag for the release:
https://github.com/apache/dubbo/tree/dubbo-2.6.2

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
The Apache Dubbo (Incubating) Team
```

Apache community voting email template:

```text
Hello all,

This is a call for vote to release Apache Dubbo (Incubating) version 2.6.4.

The Apache Dubbo community has voted on and approved a proposal to release
Apache Dubbo (Incubating) version 2.6.4.

We now kindly request the Incubator PMC members review and vote on this
incubator release.

Apache Dubbo™  is a high-performance, java based, open source
RPC framework. Dubbo offers three key functionalities, which include
interface based remote call, fault tolerance & load balancing, and
automatic service registration & discovery.

Dubbo community vote and result thread:
https://lists.apache.org/thread.html/8d5c39eece6288beed2e22ca976350728c571d2a9cef1c9a9e56a409@%3Cdev.dubbo.apache.org%3E
A minor issue can also be found in the above thread.

The release candidates (RC1):
https://dist.apache.org/repos/dist/dev/dubbo/2.6.4

Git tag for the release (RC1):
https://github.com/apache/dubbo/tree/dubbo-2.6.4

Hash for the release tag:
88037747a3b69d3225c73f6fbcda36ebd8435887

Release Notes:
*https://github.com/apache/dubbo/blob/dubbo-2.6.4/CHANGES.md
<https://github.com/apache/dubbo/blob/dubbo-2.6.4/CHANGES.md>*

The artifacts have been signed with Key : 7955FB6D1DD21CF7, which can be
found in the keys file:
https://dist.apache.org/repos/dist/dev/dubbo/KEYS

Look at here for how to verify this release candidate:
https://github.com/apache/dubbo-website/blob/asf-site/blog/en-us/prepare-an-apache-release.md#prepare-apache-release

The vote will be open for at least 72 hours or until necessary number of
votes are reached.

Please vote accordingly:
[ ] +1 approve
[ ] +0 no opinion
[ ] -1 disapprove with the reason

Thanks,
The Apache Dubbo (Incubating) Team
```

Announcement voting result template:
```text
We’ve received 3 +1 binding votes and one +1 non-binding vote:

+1 binding, Ian Luo
+1 binding, Huxing Zhang
+1 binding, Jun Liu

+1 non-binding, Jerrick

I will create a new vote thread in the Apache community now.

Best regards,
The Apache Dubbo (Incubating) Team
```

## Formal Release

1. Add the released package from the [dev](https://dist.apache.org/repos/dist/dev/dubbo) directory to the [release](https://dist.apache.org/repos/dist/release/dubbo) directory. If KEYS have been updated, they also need to be synchronized.
2. Delete the released package from the [dev](https://dist.apache.org/repos/dist/dev/dubbo) directory.
3. Delete the released package of the previous version in the [release](https://dist.apache.org/repos/dist/release/dubbo) directory. These packages will be automatically saved [here](https://archive.apache.org/dist/incubator/dubbo).
4. Publish the release notes on GitHub [here](https://github.com/apache/dubbo/releases).
5. Update the version number to the latest released version in the GitHub README file.
6. Add the latest version download link on the download [page](/en/blog/2020/05/18/past-releases/). The latest download link should be similar to `https://www.apache.org/dyn/closer.cgi?path=incubator/dubbo/$VERSION/apache-dubbo-$VERSION-source-release.zip`. At the same time, update the download links for older versions to something like `https://archive.apache.org/dist/dubbo/$VERSION/apache-dubbo-$VERSION-bin-release.zip`. Specifics can refer to previous [download links](/en/blog/2020/05/18/past-releases/).
7. Merge the `${release-version}-release` branch into the corresponding main branch, then delete the respective release branch, for example: `git push origin --delete 2.7.0-release`.
8. Send an email to `dev@dubbo.apache.org` and `general@incubator.apache.org`.
The release announcement email template: 

```text
Hello Community,

The Apache Dubbo team is pleased to announce that the
2.6.6 has just been released.

Apache Dubbo™  is a high-performance, java based, open source
RPC framework. Dubbo offers three key functionalities, which include
interface based remote call, fault tolerance & load balancing, and
automatic service registration & discovery.

Both the source release[1] and the maven binary release[2] are available
now, you can also find the detailed release notes in here[3].


If you have any usage questions, or have problems when upgrading or find
any problems about enhancements included in this release, please don’t
hesitate to let us know by sending feedback to this mailing list or filing
an issue on GitHub[4].



=====
*Disclaimer*

Apache Dubbo is an effort undergoing incubation at The Apache Software Foundation (ASF), sponsored by the Incubator. Incubation is required of all newly accepted projects until a further review indicates that the infrastructure, communications, and decision making process have stabilized in a manner consistent with other successful ASF projects. While incubation status is not necessarily a reflection of the completeness or stability of the code, it does indicate that the project has yet to be fully endorsed by the ASF.


[1] https://dubbo.apache.org/en/blog/2020/05/18/past-releases/
[2] http://central.maven.org/maven2/com/alibaba/dubbo
[3] https://github.com/apache/dubbo/releases
[4] https://github.com/apache/dubbo/issues

```


## Completing Maven Convenient Binary Release (Optional)

**repository.apache.org** Nexus repository permissions have been applied for, see [jira](https://issues.apache.org/jira/browse/INFRA-16451).

To publish the jar package to the Maven repository, first visit [repository.apache.org](https://repository.apache.org), select the `staging repository`, and click the `release` button. After a while, confirm integrity and correctness [here](https://repository.apache.org/content/repositories/releases/org/apache/dubbo/). It will take some time to release to the Maven Central Repository as well. You can confirm [here](https://repo.maven.apache.org/maven2/org/apache/dubbo).

## FAQ

#### gpg: signing failed: Inappropriate ioctl for device

If you've encountered this error, try the following commands:

```
export GPG_TTY=$(tty)
```

