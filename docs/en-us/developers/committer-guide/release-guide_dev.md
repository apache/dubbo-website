---
title: Understanding the Apache Release Cycle
keywords: Dubbo, Apache, Release
---

## Understanding the Apache Release Cycle

In general, Source Release is the key and the required content of Apache. But Binary Release is optional, Dubbo can choose whether to release binary packages to the Apache repository or to the Maven central repository.

Please refer to the following links for more information on ASF's release guide:

- [Apache Release Guide](http://www.apache.org/dev/release-publishing)
- [Apache Release Policy](http://www.apache.org/dev/release.html)
- [Maven Release Info](http://www.apache.org/dev/publishing-maven-artifacts.html)

## Preparation of Local Building Environment 

Mainly including the related preparation of signature utilities and Maven repository certification

1. Install GPG,refer to https://www.gnupg.org/download/index.html

   - For example, in Mac OS

    ```sh
    $ brew install gpg
    $ gpg --version #check version,should be 2.x
    ```

2. Generate the key with GPG

   - Generate the key according to the prompt

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
    You need a Passphrase to protect your secret key. # enter the password, which will be used frequently when packaging.
    ```

   - View key id 

    ```sh
    $ gpg --list-keys
    pub   rsa4096/28681CB1 2018-04-26 # 28681CB1 is the key id
    uid       [ultimate] liujun (apache-dubbo) <liujun@apache.org>
    sub   rsa4096/D3D6984B 2018-04-26
    
    ########### Note: Different diaplay for different version.
    $ gpg --list-keys
    pub   rsa4096 2018-11-12 [SC]
          63AAE9838F4A303E40BAF5FEA3A1CA7A5D4A3981     # Last 8 character(5D4A3981) as key id，it will be used when send public key to keyserver
    uid           [ 绝对 ] Victory Cao (CODE SIGNING KEY) <victory@apache.org>
    sub   rsa4096 2018-11-12 [E]
        
    
    # send public key to keyserver via key id 
    $ gpg --keyserver pgpkeys.mit.edu --send-key 28681CB1
    # Here pgpkeys.mit.edu is a random selection of keyserver. Any key server from the list https://sks-keyservers.net/status/ is acceptable because they are automatically synchronized.
    ```

   - If there are multiple public keys，you can set the default key 

    ~/.gnupg/gpg.conf
    
    ```proper
    # If you have more than 1 secret key in your keyring, you may want to
    # uncomment the following option and set your preferred keyid.
    
    default-key 28681CB1
    ```
    
   - If there are multiple public keys, you can also delete unuseful key：
   
    ```sh  
    ### Delete the private key first, then delete the public key.
    
    $ gpg --yes --delete-secret-keys shenglicao2@gmail.com   ### indicate email address  
    
    $ gpg --delete-keys 1808C6444C781C0AEA0AAD4C4D6A8007D20DB8A4 
    
    ```

3. Set up Apache central repository.

   - The parent pom of Dubbo project is apache pom

    ```xml
    <parent>
    <groupId>org.apache</groupId>
    <artifactId>apache</artifactId>
    <version>19</version>
    </parent>
    ```

   - Add the following contents to .m2/settings.xml

     Enter the passwords after
     encrypting by [maven-encryption-plugin](http://maven.apache.org/guides/mini/guide-encryption.html)

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


## Pack & Upload

1. Pull the new branch from the master branch as the release branch. If you want to release the ${release_version} version now, pull the new branch ${release_version}-release from 2.6.x. Then the 
modifications and taggings related to ${release_version} Release Candidates are applied to ${release_version}-release branch, and is merged into the master branch after the final release. 

2. First of all, verify that the maven component packing, source packing, signature, etc are working properly on the ${release_version}-release branch.

   ```shell
   $ mvn clean install -Papache-release
   $ mvn deploy
   ```

  This push the snapshot package to the maven central repository.

3. Release with maven-release-plugin

   - verify with dryRun

    ```shell
    $ mvn release:prepare -Prelease -Darguments="-Dmaven.test.skip=true" -DautoVersionSubmodules=true -Dusername=YOUR GITHUB ID -DdryRun=true
    ```

   - After verification, run release:prepare

    ```shell
    $ mvn release:clean
    $ mvn release:prepare -Prelease -Darguments="-Dmaven.test.skip=true" -DautoVersionSubmodules=true -Dusername=YOUR GITHUB ID -DpushChanges=false
    ```

    > If you are promted to input password for pushing to GitHub (basically including adding new commits and tags), do not input your login password of GitHub. Use `Personal access tokens` instead. You can go to https://github.com/settings/profile, click `Developer settings` -> `Personal access tokens`, and generate a new token if not. Please refer to this [guide](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/) for more infomation.
    > you need to choose the release artifactId, next artifactId and the release tag, the default tag is dubbo-parent-xxxx, you need to change it to dubbo-xxxx


    After executing the above commands, you will find that:
    1. source-release.zip and bin-release.zip are generated under dubbo-distribution directory, please unzip it and check the file structure
    2. `-DpushChanges=false` tells maven not to push the commits and tags to the remote repostiroy. If not specified, the version tag will be pushed to github repository, you will see a commit called `[maven-release-plugin] prepare release dubbo-x.x.x` added.
    3. The branch version is upgraded to ${release_version+1}-SNAPSHOT automatically. If `-DpushChanges=true` is specified, the modifications will be pushed to the remote repository, you will see a commit called `[maven-release-plugin] prepare for next development iteration` added.

    If `-DpushChanges=false` is specified, you will have to manually push the commit to remote repository before go to next step.

   - Run release:perform

    ```shell
    $ mvn release:perform -Prelease -Darguments="-Dmaven.test.skip=true" -DautoVersionSubmodules=true -Dusername=YOUR GITHUB ID
    ```

    Maven will download the source code from the tag you just pushed, compile it, and deploy to remote maven repsoitry in staging state.

### Note

> When you deploy the package into repository, it will be interrupted for network. So you must restart to desploy.  
> The problem is that missing package occurred many times at deploying. So you should check the quantity of package, especially parent package.

## Prepare Apache Release 

1. Prepare the svn local environment (Apache hosting the release content of project by svn)

2. Checkout dubbo to local directory

   ```shell
   $ svn checkout https://dist.apache.org/repos/dist/dev/incubator/dubbo
   ```
   Assume that the local directory is `~/apache/incubator/dubbo`

3. The current release version is ${release_version}, new directory

   ```shell
   $ cd ~/apache/incubator/dubbo # dubbo svn root directory
   $ mkdir ${release_version}
   ```

4. Add public key to [KEYS](https://dist.apache.org/repos/dist/dev/incubator/dubbo/KEYS) file if you are the first time to be a release manager. KEYS is mainly used to allow people who participate in the voting to be imported locally to verify the correctness of the sign.

   ```shell
   $ (gpg --list-sigs <your name> && gpg --armor --export <your name>) >> KEYS
   ```

   For more information on how to get your key id, please refer to this [guide](https://help.github.com/articles/generating-a-new-gpg-key/)

5. Copy the source.zip package from the Dubbo root directory to the svn local repository dubbo/${release_version} 

6. Generate sha512 sign

   For source-release.zip

   ```shell
   $ shasum -a 512 apache-dubbo-incubating-${release_version}-source-release.zip >> apache-dubbo-incubating-${release_version}-source-release.zip.sha512
   ```

   For bin-release.zip

   Please add `-b` paramter when generating sha512 for bin-release.zip, which indicates it is a binary file. 

   ```shell
   $ shasum -b -a 512 apache-dubbo-incubating-${release_version}-bin-release.zip >> apache-dubbo-incubating-${release_version}-bin-release.zip.sha512
   ```
   You should generate something like this:

   ```
   b8f13d1df6d6c9a1facc72fafc00b2d22bea1e600517c507467d8fca2f776a7a3877101742da53114bfa629ca5b941eb4d9ef989de43f0833e2a794e7ccf5c8a *apache-dubbo-spring-boot-project-incubating-2.7.0-bin-release.zip
   ```

   Note there is a `*` sign before the file name.

7. If the binary release is accompanied with the source release. Run the following command in the dubbo-distribution module:

   ```shell
   $ mvn install
   ```
   Go to target directory, copy bin-release.zip and bin-release.zip.asc to svn local repository dubbo/${release_version}, and refer to step 6 to generate sha512 sign.

8. Commit to Apache svn

   ```shell
   $ svn status
   $ svn commit -m 'prepare for ${release_version} RC1'
   ```

9. Close the maven staging repository

   This step is required when prepare for a 2.7.0+ release, where package name has been changed to org.apache. Before that, please make sure all the maven artifacts look good. Login to http://repository.apache.org, click the `Staging repositories` on the left bar, search with keyword Dubbo, and you will see a list of repositories. Find the one you just uploaded, and then click the close button in the top area. This will do some sannity check, such as gpg signature check, and checksum check. After that, a link will be shown in the summary tab in the bottom. Please copy that link, it will be used for release vote. The link should look like this: https://repository.apache.org/content/repositories/orgapachedubbo-1015.

   > Please be aware that it may fail when you close the repository, this is normally due to network issues, please try again if it failed. You can confirm it by clicking the `Activiey` tab next to `Summary`.

## Verify Release Candidates

**A full check list can be found [here](https://wiki.apache.org/incubator/IncubatorReleaseChecklist)**

The verification link includes but is not limited to the following contents and forms:

### Check signatures and hashes are good

#### check the sha512 sum

  
```sh
$ shasum -c apache-dubbo-incubating-${release_version}-source-release.zip.sha512
$ shasum -c apache-dubbo-incubating-${release_version}-bin-release.zip.sha512
```
#### check the gpg signarure

If it's your first time verify a release candidte, you should import public keys first.  

```sh
 $ curl https://dist.apache.org/repos/dist/dev/incubator/dubbo/KEYS >> KEYS # download public keys to local directory
 $ gpg --import KEYS # import keys
 $ gpg —edit-key liujun
   > trust # type trust command
 ```
Now, you can verify signature with command
 
 ```sh
gpg --verify apache-dubbo-incubating-2.6.3-source-release.zip.asc apache-dubbo-incubating-2.6.3-source-release.zip
gpg --verify apache-dubbo-incubating-2.6.3-bin-release.zip.asc apache-dubbo-incubating-2.6.3-bin-release.zip
 ```

### Check source release file content

Unzip apache-dubbo-incubating-${release_version}-source-release.zip to the default directory and check the following:

- Directory with 'incubating' in name
  `apache-dubbo-incubating-${release_version}-source-release`
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
  - check there are no extra files or directories in the source package, for example, no empty directories or useless log files.  
    `diff -r rc_dir tag_dir`
  - check the top n tag commits, dive into the related files and check if the source package has the same changes


### check third party dependencies

According to ASF policy, any [Category X](https://www.apache.org/legal/resolved.html#what-can-we-not-include-in-an-asf-project-category-x) dependency can not be included in ASF product, this includes common LGPL/GPL licensed dependencies. Even transitive dependencies are not allowed. Therefore we need to run the following command to ensure no such dependencies are included.

```sh
mvn license:add-third-party -Dlicense.useMissingFile
find . -name THIRD-PARTY.txt | xargs grep -E 'GPL|General Public License' | grep -v Apache | grep -v MIT | grep -v CDDL
```

If one dependency is dual/multiple licensed, just choose the most permissive one.

### Check binary distribution file content

Unzip apache-dubbo-incubating-${release_version}-bin-release.zip and check:

* Check signatures are good
* 'incubating' in name
* LICENSE and NOTICE exists and contents are good

Note that if the binary distribution contains third party files, you may need to update LICENSE file by adding the 3rd party license files. If these dependency is Apache License 2.0, and it contains NOTICE file, you may also need to update NOTICE file as well.

## Release vote

The voting is divided into two phases:

1. Dubbo community votes and sends the voting email to dev@dubbo.apache.org. After reviewing by community developers and winning 3 binding tickets that agree to release, you can go to the next stage of voting.
2. Apache community votes and sends the voting email to general@incubator.apache.org. After reviewing by Apache IPMC(Incubator PMC) members and winning 3 binding votes that agree to release, you will be allowed to release officially.

The mail template for Apache Dubbo vote：

```tex
Hello Dubbo Community,

This is a call for vote to release Apache Dubbo (Incubating) version 2.6.2.

The release candidates:
https://dist.apache.org/repos/dist/dev/incubator/dubbo/2.6.2/

The staging repo:
https://repository.apache.org/content/repositories/orgapachedubbo-1005

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

The mail template for Apache Incubator vote：

```text
Hello all,

This is a call for vote to release Apache Dubbo (Incubating) version 2.6.4.

The Apache Dubbo community has voted on and approved a proposal to release
Apache Dubbo (Incubating) version 2.6.4.

We now kindly request the Incubator PMC members review and vote on this
incubator release.

Apache Dubbo™ (incubating) is a high-performance, java based, open source
RPC framework. Dubbo offers three key functionalities, which include
interface based remote call, fault tolerance & load balancing, and
automatic service registration & discovery.

Dubbo community vote and result thread:
https://lists.apache.org/thread.html/8d5c39eece6288beed2e22ca976350728c571d2a9cef1c9a9e56a409@%3Cdev.dubbo.apache.org%3E
A minor issue also can be found in the above thread.

The release candidates (RC1):
https://dist.apache.org/repos/dist/dev/incubator/dubbo/2.6.4

The staging repo:
https://repository.apache.org/content/repositories/orgapachedubbo-1005

Git tag for the release (RC1):
https://github.com/apache/incubator-dubbo/tree/dubbo-2.6.4

Hash for the release tag:
88037747a3b69d3225c73f6fbcda36ebd8435887

Release Notes:
*https://github.com/apache/incubator-dubbo/blob/dubbo-2.6.4/CHANGES.md
<https://github.com/apache/incubator-dubbo/blob/dubbo-2.6.4/CHANGES.md>*

The artifacts have been signed with Key : 7955FB6D1DD21CF7, which can be
found in the keys file:
https://dist.apache.org/repos/dist/dev/incubator/dubbo/KEYS

Look at here for how to verify this release candidate:
https://github.com/apache/incubator-dubbo-website/blob/asf-site/blog/en-us/prepare-an-apache-release.md#prepare-apache-release

The vote will be open for at least 72 hours or until necessary number of
votes are reached.

Please vote accordingly:
[ ] +1 approve
[ ] +0 no opinion
[ ] -1 disapprove with the reason

Thanks,
The Apache Dubbo (Incubating) Team
```

The mail template to announce the vote result:

```text
We’ve received 3 +1 binding votes and one +1 non-binding vote:

+1 binding, Ian Luo
+1 binding, Huxing Zhang
+1 binding, Jun Liu

+1 non-binding, Jerrick

I will create a new vote thread in Apache community now.

Best regards,
The Apache Dubbo (Incubating) Team
```

## Official Release

When the release vote has passed,


1. Add the release files to [official release directory](https://dist.apache.org/repos/dist/release/incubator/dubbo)
2. Remove the release files in [dev directory](https://dist.apache.org/repos/dist/dev/incubator/dubbo)
3. Remove the the release file for the previous release under [official release directory](https://dist.apache.org/repos/dist/release/incubator/dubbo/), which will be archived and can be found [here](https://archive.apache.org/dist/incubator/dubbo/)
5. Publish [release notes](https://github.com/apache/incubator-dubbo/releases) on Github.
6. Update the recommend dependency on [Github](https://github.com/apache/incubator-dubbo#maven-dependency) to the latest version, also update the version in other place if necessary.
7. Add the download link to official website http://dubbo.apache.org/en-us/blog/download.html, using the ASF mirror system. The latest release download link should be something like [this](https://www.apache.org/dyn/closer.cgi?path=incubator/dubbo/$VERSION/apache-dubbo-incubating-$VERSION-source-release.zip). The download link for the previous release version should be changed like [this](https://archive.apache.org/dist/incubator/dubbo/$VERSION/apache-dubbo-incubating-$VERSION-bin-release.zip). Please refer to the [download page](https://github.com/apache/incubator-dubbo-website/blob/asf-site/blog/en-us/download.md) for more details.
8. Make sure all the commits in the release branch are merged into master branch, and then remove the remote release branch. For example: `git push origin --delete 2.7.0-release`
9. Send mail to dev@dubbo.apache.org and general@incubator.apache.org, notify the community that the release is completed. 
The mail template to announce release: 
```text
Hello Community,

The Apache Dubbo(incubating) team is pleased to announce that the
2.6.6 has just been released.

Apache Dubbo™ (incubating) is a high-performance, java based, open source
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


[1] http://dubbo.apache.org/en-us/blog/download.html
[2] http://central.maven.org/maven2/com/alibaba/dubbo
[3] https://github.com/apache/incubator-dubbo/releases
[4] https://github.com/apache/incubator-dubbo/issues

```


## Complete Maven Convenient Binary release

**[repository.apache.org](https://repository.apache.org/) The permissions of the nexus repository have been applied, see [jira](https://issues.apache.org/jira/browse/INFRA-16451)。**

To release the maven artifacts, go to [repository.apache.org](https://repository.apache.org), and choose the staging repository, click the release button. Wait for a moment and verify it at [here](https://repository.apache.org/content/repositories/releases/org/apache/dubbo/), make sure your artifacts are there and correct. It will take some time to sync to maven central repository. You can verify it at [here](https://repo.maven.apache.org/maven2/org/apache/dubbo)

## FAQ

#### gpg: signing failed: Inappropriate ioctl for device

If you've encoutered this error, try the following commands:

```
export GPG_TTY=$(tty)
```
