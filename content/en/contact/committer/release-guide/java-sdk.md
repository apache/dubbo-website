---
aliases:
    - /en/contact/committer/release-guide/java-sdk/
description: Java SDK Release Process
linkTitle: Java SDK Release
title: Java SDK Release Process
type: docs
weight: 2
---




## Understanding Apache Release Content and Process

In general, the Source Release is the focus of Apache and is a necessary component of the release; the Binary Release is optional, and Dubbo can choose whether to publish binary packages to the Apache repository or to the Maven Central repository.

Please refer to the following links for more information about ASF's release guidelines:

- [Apache Release Guide](http://www.apache.org/dev/release-publishing)
- [Apache Release Policy](http://www.apache.org/dev/release.html)
- [Maven Release Info](http://www.apache.org/dev/publishing-maven-artifacts.html)

## Local Build Environment Preparation

Mainly includes preparation for signing tools and Maven repository authentication.

### Install GPG

For detailed documentation, please refer to [here](https://www.gnupg.org/download/index.html). Configuration on Mac OS is as follows:

```sh
$ brew install gpg
$ gpg --version # Check version, should be 2.x
```

### Generate Key with gpg

Follow the prompts to generate a key.

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
 You need a Passphrase to protect your secret key. # Enter password, which will be used frequently during the packaging process
 ```

### View Key ID

```sh
$ gpg --list-keys
pub   rsa4096/28681CB1 2018-04-26 # 28681CB1 is the key id
uid       [ultimate] liujun (apache-dubbo) <liujun@apache.org>
sub   rsa4096/D3D6984B 2018-04-26

# Send public key to keyserver via key id
$ gpg --keyserver pgpkeys.mit.edu --send-key 28681CB1
# Here, pgpkeys.mit.edu is a randomly chosen keyserver. The list of keyservers is available at: https://sks-keyservers.net/status/, which are automatically synchronized with each other, so any one can be chosen.
```
If there are multiple public keys, set the default key. Modify `~/.gnupg/gpg.conf`

```sh
# If you have more than 1 secret key in your keyring, you may want to
# uncomment the following option and set your preferred keyid.
default-key 28681CB1
```
If there are multiple public keys, you can also delete unnecessary keys:

```sh  
### First delete the private key, then delete the public key
$ gpg --yes --delete-secret-keys shenglicao2@gmail.com   ### Old private key, just specify the email
$ gpg --delete-keys 1808C6444C781C0AEA0AAD4C4D6A8007D20DB8A4
```

> PS: The latest version has been tested and does not have the gpg.conf file in the local environment. Therefore, if you encounter a signing failure during the execution process, you can refer to this article: https://blog.csdn.net/wenbo20182/article/details/72850810 or https://d.sb/2016/11/gpg-inappropriate-ioctl-for-device-errors.

Since the public key server has no verification mechanism, anyone can upload the public key in your name, so there is no way to ensure the reliability of the public keys on the server. Typically, you can publish a public key fingerprint on the website so that others can verify whether the downloaded public key is genuine.
```sh
# Generate public key fingerprint with fingerprint parameter:
$ gpg --fingerprint liujun
pub   rsa4096 2019-10-17 [SC]
      1376 A2FF 67E4 C477 5739  09BD 7DB6 8550 D366 E4C0
uid           [ultimate] liujun (CODE SIGNING KEY) <liujun@apache.org>
sub   rsa4096 2019-10-17 [E]
```
Log in to https://id.apache.org and paste the fingerprint above (i.e., 1376 A2FF 67E4 C477 5739  09BD 7DB6 8550 D366 E4C0) into your user information for OpenPGP Public Key Primary Fingerprint.

### Set Up Apache Central Repository

The parent POM of the Dubbo project is the Apache POM (this is required for versions above 2.7.0, not needed for 2.6.x release versions).

```xml
<parent>
<groupId>org.apache</groupId>
<artifactId>apache</artifactId>
<version>19</version>
</parent>
```

Add the following content to .m2/settings.xml. All passwords should be filled in after being encrypted using [maven-encryption-plugin](http://maven.apache.org/guides/mini/guide-encryption.html).

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

## Packaging & Uploading

### Prepare Branch

Create a new branch from the trunk branch as the release branch. For instance, if you are going to release version `$`{release_version}`, create a new branch `${release_version}-release` from 2.6.x. All modifications and tagging related to `${release_version}` Release Candidates will be done in the `${release_version}-release` branch, and after the final release is completed, it will be merged back into the trunk branch.

### Compile and Package

First, validate whether Maven's component packaging, source code packaging, signing, etc., work correctly in the `${release_version}-release` branch. **Remember to use 1.6 for compiling and packaging for 2.6.x.**

```shell
$ mvn clean install -Prelease
$ mvn deploy
```

The above commands will push the snapshot package to the Maven Central repository.

### Use mvn deploy for deployment

> Requirements: Maven 3.5+

Modify the version in the POM file from 2.7.x-SNAPSHOT to 2.7.x, currently there are 3 places that need modification. It is recommended to search the entire text.

```shell
$ mvn clean install -Prelease
$ mvn deploy -Prelease -DskipTests
```

All artifacts that are deployed to the remote [Maven repository](http://repository.apache.org) will be in staging status.

#### Notes

- During the deployment process, there may be interruptions due to network issues; if so, you can restart the process.
- Please check the total number of packages to ensure their accuracy when deploying to the Maven repository. There have been multiple occurrences of missing packages, especially the dubbo-parent package.


## Prepare for Apache Release

1. Prepare the SVN local environment (Apache uses SVN to host the release content of the project).

2. Check out dubbo to the local directory.

   ```shell
   $ svn checkout https://dist.apache.org/repos/dist/dev/dubbo
   # Assume the local directory is ~/apache/dubbo
   ```

3. The current release version is ${release_version}. Create a new directory.

   ```shell
   $ cd ~/apache/dubbo # dubbo svn root directory
   $ mkdir ${release_version}
   ```

4. Add your public key to the [KEYS](https://dist.apache.org/repos/dist/dev/dubbo/KEYS) file and submit it to the SVN repository (first-time publishers need to perform this operation; refer to the instructions in the KEYS file for specific operations). The KEYS file allows voters to import locally to verify the correctness of the signatures.

   ```sh
   $ (gpg --list-sigs <your name> && gpg --armor --export <your name>) >> KEYS
   ```

5. Copy the source-related packages from `dubbo-distribution/dubbo-apache-release/target` to the SVN local repository `dubbo/${release_version}`.

6. Generate SHA512 signatures and ASC signatures.

   Perform SHA512 signing for `src.zip`.

   ```shell
   $ shasum -a 512 apache-dubbo-${release_version}-src.zip >> apache-dubbo-${release_version}-src.zip.sha512
   ```

   For `bin-release.zip`, you need to add the `-b` parameter to indicate it is a binary file.

   ```shell
   $ shasum -b -a 512 apache-dubbo-${release_version}-bin.zip >> apache-dubbo-${release_version}-bin.zip.sha512
   ```

   Perform ASC signing for `src.zip`.

    ```shell
   $ gpg --armor --output apache-dubbo-${release_version}-src.zip.asc --detach-sig apache-dubbo-${release_version}-src.zip
    ```


7. If there is a binary release to be published simultaneously.

   In the `dubbo-distribution/dubbo-apache-release/target` directory, copy the `bin.zip` and `bin.zip.asc` to the SVN local repository `dubbo/${release_version}`, and reference step 6 to generate SHA512 signatures.

8. Commit to Apache SVN.

   ```shell
   $ svn status
   $ svn commit -m 'prepare for ${release_version} RC1'
   ```

9. Close the Maven staging repository.

   This step is mandatory for releasing versions 2.7.0 and above. Please ensure all artifacts are okay beforehand. Log in to http://repository.apache.org, click on `Staging repositories` on the left, then search for the Dubbo keyword. A series of repositories will appear; select the one you recently uploaded, then click the Close button above. This process will perform a series of checks, and after passing, a link will appear on the Summary tab below. Please save this link for the upcoming voting email. The link should be something like: `https://repository.apache.org/content/repositories/orgapachedubbo-1015`.

   > Please note that clicking Close might fail, usually due to network issues; just retry a few times. You can check the Activity tab next to Summary for confirmation.

## Verify Release Candidates

For a detailed checklist, refer to the official [checklist](https://cwiki.apache.org/confluence/display/INCUBATOR/Incubator+Release+Checklist).

First, download the Release Candidate to the local environment from the following address:

<pre>
https://dist.apache.org/repos/dist/dev/dubbo/${release_version}/
</pre>

Then, begin the verification process, which includes but is not limited to the following content and forms.

### Check signatures and hash information

#### Check SHA512 hash

```sh
$ shasum -c apache-dubbo-${release_version}-src.zip.sha512
$ shasum -c apache-dubbo-${release_version}-bin.zip.sha512
```
#### Check ASC signature
```shell
$  gpg --verify apache-dubbo-${release_version}-src.zip.asc
```

#### Check GPG signature

If it's the first time checking, you need to import the public key first.

```sh
 $ curl https://dist.apache.org/repos/dist/dev/dubbo/KEYS >> KEYS # download public keys to local directory
 $ gpg --import KEYS # import keys
 $ gpg --edit-key liujun
   > trust # type trust command
```
Then use the following commands to check the signatures.

 ```sh
gpg --verify apache-dubbo-3.0.4-src.zip.asc apache-dubbo-3.0.4-src.zip
gpg --verify apache-dubbo-3.0.4-bin.zip.asc apache-dubbo-3.0.4-bin.zip
 ```


### Check the contents of the source package files

Unzip `apache-dubbo-${release_version}-src.zip` and check as follows:

- DISCLAIMER exists
- LICENSE and NOTICE exist and contents are correct
- All files exist and there are no binary files
- All files have a standard ASF License header
- Can compile from source
- All unit tests can pass  
  ```sh
  mvn clean test # This will run all unit tests
  # you can also open rat and style plugin to check if every file meets requirements.
  mvn clean test -Drat.skip=false -Dcheckstyle.skip=false
  ```
- Release candidates match with corresponding tags; you can find tag links and hash in the vote email.
  - Check the version numbers in pom.xml are the same.
  - Check there are no extra files or directories in the source package, for example, no empty directories or useless log files; pay attention to whether the line endings are consistent.  
    `diff -r a rc_dir tag_dir`
  - Check the top n tag commits, dive into the related files, and check if the source package has the same changes.

### Check the compliance of third-party dependencies

According to the compliance regulations of the Apache Foundation, neither the source nor the binary distribution packages can contain Category X dependencies, which is commonly known to include GPL/LGPL dependencies, even transitive dependencies are not allowed. Therefore, during release, the following commands must be executed for compliance checks:

```sh
mvn license:add-third-party -Dlicense.useMissingFile
find . -name THIRD-PARTY.txt | xargs grep -E 'GPL|General Public License' | grep -v Apache | grep -v MIT | grep -v CDDL
```

If a dependency provides dual or multiple licenses, choose the one that is most compatible with Apache.

You can refer to this article: [ASF Third Party License Policy](https://apache.org/legal/resolved.html)


### Check the contents of the binary package files

Unzip `apache-dubbo-${release_version}-bin.zip` and check as follows:

* Check signatures are valid
* LICENSE and NOTICE exist and contents are correct

Note that if third-party dependencies are introduced in the binary package, the LICENSE should be updated to include the LICENSE of the third-party dependencies. If the LICENSE of the third-party dependency is Apache 2.0 and the corresponding project contains NOTICE, the NOTICE file must also be updated.

## Enter Voting

After the graduation of Dubbo, only one vote is needed:

1. Dubbo community voting, send a voting email to dev@dubbo.apache.org. Upon review by community developers, if there are at least 3 binding votes in favor of the release after 72 hours, the voting process can proceed to the next stage (only PMC votes are binding).

Dubbo community voting email template:

```text
Hello Dubbo Community,

This is a call for a vote to release Apache Dubbo version 2.7.2.

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

The artifacts have been signed with Key: 28681CB1, which can be found in the keys file:
https://dist.apache.org/repos/dist/dev/dubbo/KEYS

The vote will be open for at least 72 hours or until the necessary number of votes are reached.

Please vote accordingly:

[ ] +1 approve 
[ ] +0 no opinion 
[ ] -1 disapprove with the reason

Thanks,
The Apache Dubbo Team
```


Announcement Vote Results Template:
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

## Official Release

1. Move the release package from the [dev](https://dist.apache.org/repos/dist/dev/dubbo) directory to the [release](https://dist.apache.org/repos/dist/release/dubbo) directory, and if the KEYS have been updated, they need to be synchronized.
2. Delete the release package from the [dev](https://dist.apache.org/repos/dist/dev/dubbo) directory.
3. Delete the release package of the previous version from the [release](https://dist.apache.org/repos/dist/release/dubbo) directory. These packages will be automatically saved [here](https://archive.apache.org/dist/dubbo).
4. This step is mandatory for releasing versions 2.7.0 and above. Ensure that all artifacts are okay beforehand. Log in to http://repository.apache.org, click on `Staging repositories` on the left, then search for the Dubbo keyword. A series of repositories will appear; select the one you recently uploaded, then click the Release button above.
5. Publish the [release notes](https://github.com/apache/dubbo/releases) on GitHub.
6. Update the version number in the GitHub README file to the latest released version.
7. Add the latest download link for the version on the download [page](/en/blog/2020/05/18/past-releases/). The latest download link should be something like [this](https://www.apache.org/dyn/closer.cgi?path=dubbo/$VERSION/apache-dubbo-$VERSION-source-release.zip). Also, update the previous version’s download link to something like `https://archive.apache.org/dist/dubbo/$VERSION/apache-dubbo-$VERSION-bin-release.zip`. For specifics, please refer to past [download links](/en/blog/2020/05/18/past-releases/) and [this] (https://github.com/apache/dubbo-website/pull/887).
8. Merge the `${release-version}-release` branch into the corresponding trunk branch, and then delete the corresponding release branch, for example: `git push origin --delete 2.7.0-release`.
9. Send an email to `dev@dubbo.apache.org`
  Announcement release email template: 

```text
Hello Community,

The Apache Dubbo team is pleased to announce that the
2.6.6 has just been released.

Apache Dubbo™  is a high-performance, java-based, open-source
RPC framework. Dubbo offers three key functionalities, which include
interface-based remote call, fault tolerance & load balancing, and
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


## Complete Maven Convenient Binary Release (Optional)

Permission for the **repository.apache.org** nexus repository has been applied for, see [jira](https://issues.apache.org/jira/browse/INFRA-16451).

To publish jar packages to the Maven repository, first visit [repository.apache.org](https://repository.apache.org), select `staging repository`, then click the `release` button. After a while, confirm the integrity and correctness [here](https://repository.apache.org/content/repositories/releases/org/apache/dubbo/). Publication to the Maven Central repository may also take some time. You can confirm at [this link](https://repo.maven.apache.org/maven2/org/apache/dubbo).

## FAQ

#### gpg: signing failed: Inappropriate ioctl for device

If you've encountered this error, try the following commands:

```
export GPG_TTY=$(tty)
```
