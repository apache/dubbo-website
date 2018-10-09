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
    
    # send public key to keyserver via key id 
    $ gpg --keyserver pgpkeys.mit.edu --send-key 28681CB1
    # Here pgpkeys.mit.edu is a random selection of keyserver. Any key server from the list https://sks-keyservers.net/status/ is acceptable because they are automatically synchronized.
    ```

   - If there are multiple public keys，set the default key 

    ~/.gnupg/gpg.conf
    
    ```proper
    # If you have more than 1 secret key in your keyring, you may want to
    # uncomment the following option and set your preferred keyid.
    
    default-key 28681CB1
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
   # push the snapshot package to the maven central repository,in staging state
   ```

3. Release with maven-release-plugin

   - verify with dryRun

    ```shell
    $ mvn release:prepare -Papache-release -Darguments="-DskipTests" -DautoVersionSubmodules=true -Dusername=YOUR GITHUB ID -DdryRun=true
    ```

   - After verification, run release:prepare

    ```shell
    $ mvn release:clean
    $ mvn release:prepare -Papache-release -Darguments="-DskipTests" -DautoVersionSubmodules=true -Dusername=YOUR GITHUB ID
    # After running：1. Generate source.zip; 2. Tag and push to github repository; 3. The branch version is upgraded to ${release_version}-SNAPSHOT automatically and the modifications are pushed to the github repository
    ```

   - Run release:perform, make an offical release

    ```shell
    $ mvn -Prelease release:perform -Darguments="-DskipTests" -DautoVersionSubmodules=true -Dusername=YOUR GITHUB ID
    # All artifacts are released to  configured remote maven central repository, in staging state 
    ```

## Prepare Apache Release 

1. Prepare the svn local environment (Apache hosting the release content of project by svn)

2. Checkout dubbo to local directory

   ```shell
   $ svn checkout https://dist.apache.org/repos/dist/dev/incubator/dubbo
   # Assume that the local directory is
   ~/apache/incubator/dubbo
   ```

3. The current release version is ${release_version},new directory

   ```shell
   $ cd ~/apache/incubator/dubbo # dubbo svn root directory
   $ mkdir ${release_version}
   ```

4. Add public key to [KEYS](https://dist.apache.org/repos/dist/dev/incubator/dubbo/KEYS) file.KEYS is mainly used to allow people who participate in the voting to be imported locally to verify the correctness of the sign.

5. Copy the source.zip package from the Dubbo root directory to the svn local repository dubbo/${release_version} 

6. Generate sha512 sign

   ```shell
   $ shasum -a 512 apache-dubbo-incubating-${release_version}-source-release.zip >> apache-dubbo-incubating-${release_version}-source-release.zip.sha512
   ```

7. If the binary release is accompanied with the source release

   ```shell
   # In the module of the dubbo project distribution
   run：
   $ mvn install
   # In target directory,copy bin-release.zip and bin-release.zip.asc to svn local repository dubbo/${release_version}
   # Refer to the six step,generate sha512 sign
   ```

8. Commit to Apache svn

   ```shell
   $ svn status
   $ svn commit -m 'prepare for ${release_version} RC1'
   ```

## Verify Release Candidates

The verification link includes but is not limited to the following contents and forms:

1. Check signatures and hashes are good
* sha512
```sh
$ shasum -c apache-dubbo-incubating-${release_version}-source-release.zip.sha512
$ shasum -c apache-dubbo-incubating-${release_version}-bin-release.zip.sha512
```
* gpg
   * If it's your first time verify a release candidte, you should import public keys first.  
   ```sh
   $ curl https://dist.apache.org/repos/dist/dev/incubator/dubbo/KEYS >> KEYS # download public keys to local directory
   $ gpg --import KEYS # import keys
   $ gpg —edit-key liujun
     > trust # type trust command
   ```
   * Now, you can verify signature with command
   ```
   gpg --verify apache-dubbo-incubating-2.6.3-source-release.zip.asc apache-dubbo-incubating-2.6.3-source-release.zip
   ```


2. Unzip apache-dubbo-incubating-${release_version}-source-release.zip to the default directory and check the following:

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
    `diff -r a rc_dir tag_dir`
  - check the top n tag commits, dive into the related files and check if the source package has the same changes

3. Unzip apache-dubbo-incubating-${release_version}-bin-release.zip and check:
* Check signatures are good
* 'incubating' in name
* LICENSE and NOTICE exists and contents are good

## Begin voting

The voting is divided into two phases:

1. Dubbo community votes and sends the voting email to dev@dubbo.apache.org. After reviewing by community developers and winning 3 binding tickets that agree to release, you can go to the next stage of voting.
2. Apache community votes and sends the voting email to general@apache.org. After reviewing by Apache PMC Review and winning 3 binding tickets that agree to release,you will be allowed to release officially.
3. Publish [release notes](https://github.com/apache/incubator-dubbo/releases) on Github.
4. Update the recommend dependency on [Github](https://github.com/apache/incubator-dubbo#maven-dependency) to the latest version, also update the version in other place if necessary.
5. Announce on the [official site](http://dubbo.apache.org/) that the version was successfully released.

Mail template：

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

## Official Release

1. Commit release package of  https://dist.apache.org/repos/dist/dev/incubator/dubbo to https://dist.apache.org/repos/dist/release/incubator/dubbo/, complete official release。
2. Send mail to dev@dubbo.apache.org and general@apache.org, notify the community that the release is completed.

## Complete Maven Convenient Binary release（Optional）

**apache.repository.org The permissions of the nexus repository have been applied, see [jira](https://issues.apache.org/jira/browse/INFRA-16451)。**

The artifacts that were previously published to the maven repository are in the staging state. Log in to apache.repository.org with the Apache id and release it.
