---
aliases:
    - /en/contact/committer/release-guide/common/
description: General Release Process
linkTitle: General Release
title: General Release Process
type: docs
weight: 1
---



## Understanding the Content and Process of Apache Releases

In general, Source Release is the primary focus of Apache and a necessary element of the release; Binary Release is optional, and Dubbo can choose whether to release binary packages to the Apache repository or publish to the Maven Central Repository.

Please refer to the following links for more information about the ASF release guidelines:

- [Apache Release Guide](http://www.apache.org/dev/release-publishing)
- [Apache Release Policy](http://www.apache.org/dev/release.html)
- [Maven Release Info](http://www.apache.org/dev/publishing-maven-artifacts.html)

## Release Process

### 1. Prepare a Branch

Create a new branch from the trunk as a release branch. For example, to release version `${release_version}`, create a new branch `${release_version}-release` from the development branch. All modifications and tagging related to `${release_version}` Release Candidates will then occur in the `${release_version}-release` branch, merging back to the trunk after the final release is complete.

### 2. Tag on Github and Publish Pre Release Status

In the corresponding GitHub repository, tag the `${release_version}-release` branch, fill out the Release Note, and publish it as a Pre Release status. (**The release status must not be changed to formal release status until the voting process is officially passed.**)

Note: After tagging, no commits can be made to this branch. The last commit in the branch must be the tagged commit and the commit in the vote.

### 3. Pre-Release Binary Package (Optional)

Push the binary package to the hosting platform using a build tool, such as releasing the Java SDK to the Maven repository in Staging.

Note: If the hosting platform does not support pre-release functionality, it must be released only after the vote passes.

### 4. Build Source Release Files

Package the source code in zip format, sign it with your personal gpg key to get the asc file, and generate the sha512 file using the shasum tool.

Example: For releasing version `3.0.10` of the Java SDK, build `apache-dubbo-3.0.10-src.zip`, `apache-dubbo-3.0.10-src.zip.asc`, and `apache-dubbo-3.0.10-src.zip.sha512`.

### 5. Commit Source Release Files to Apache SVN Repository

Push the Source Release files to the `https://dist.apache.org/repos/dist/dev/dubbo/` repository, storing the files in the `https://dist.apache.org/repos/dist/dev/dubbo/${component_name}/${release_version}/` directory. (Committer permission is required to push.)

### 6. Send Voting Email

Send the voting email using the Apache email. The subject of the voting email is: `[VOTE] Release ${component_name} ${release_version} RC1`, and the email content must include the following:
- Link to the Source Release
- Link to the pre-released binary package (if any)
- GitHub Tag
- Hash of the last commit
- Link to the Release Note
- Signature file used for the Source Release

The above Source Release, Tag, Hash, and Release Note must correspond completely.

Example: For releasing version `3.0.10` of the Java SDK, the email sent would be as follows:

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

### 7. PMC Checks Version Information and Votes

For a detailed checklist, please refer to the official [checklist](https://cwiki.apache.org/confluence/display/INCUBATOR/Incubator+Release+Checklist).

### 8. Voting Passed, Announce Voting Results

After waiting at least 72 hours and receiving at least 3 +1 approve votes from PMC, an email can be sent to announce the voting results. The subject of the voting results email is: `[RESULT] [VOTE] Release ${component_name} ${release_version} RC1`, and the email content must include the voting PMC information and the voting thread.
(You can find it through [https://lists.apache.org/list.html?dev@dubbo.apache.org](https://lists.apache.org/list.html?dev@dubbo.apache.org).)

Example: For releasing version `2.7.16` of the Java SDK, the email sent would be as follows:

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

### 9. Tag the Official Release on Github

Officially update the tag made in step 2 to the formal release status on GitHub.

### 10. Merge the Release Branch Back into the Main Branch

Merge `${release_version}-release` back into the development trunk and update the latest snapshot version number. (`${release_version}-release` can be deleted.)

### 11. Move Source Release to Release Repository (Important)

Move the Source Release files stored in the `https://dist.apache.org/repos/dist/dev/dubbo/` repository to `https://dist.apache.org/repos/dist/release/dubbo/` repository. (Only PMC has permission to do this.)
At the same time, delete the previous Source Release files. (They will automatically be stored in the Archive repository.)

### 12. Officially Release Binary Package (if any)

Update the pre-released binary package from step 3 to be in formal release status.

### 13. Update Dubbo Website Documentation

Update the latest Source Release and other information in the corresponding file of `dubbo-website`, including at least the download method for the Source Release and the reference method for the binary package (if any), while updating historical release links to the archive domain.

### 14. Publish Official Release Result Notification

The subject of the voting result email should be: `[Announce] Release ${component_name} ${release_version} released`.

Note: It is best to wait until the binary package goes live in formal status before sending this email.

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
