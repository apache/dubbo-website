---
aliases:
    - /en/contact/contributor/new-contributor-guide_dev/
description: New Contributor Guide
linkTitle: Beginner's Guide
title: New Contributor Guide
type: docs
weight: 2
---




This guide aims to provide guidance for newcomers preparing to contribute to Dubbo.

### Mailing List Description

The mailing list is the official recommended discussion channel for Dubbo, where all topics related to Dubbo can be discussed. Please click [Issue](https://github.com/apache/dubbo/issues/1393) for more information about subscribing to the mailing list.

To subscribe to the mailing lists below, please refer to the [Mailing List Subscription Guide](../mailing-list-subscription-guide_dev)

* dev@dubbo.apache.org: Development mailing list where you can ask any questions encountered while using or developing Dubbo.
* commits@dubbo.apache.org: All commit content will be pushed to this mailing list. If you're interested in Dubbo's progress, you can subscribe to this mailing list.
* issues@dubbo.apache.org: All [JIRA Issues](https://issues.apache.org/jira/projects/DUBBO/issues) and modification information will be pushed to this mailing list. The Dubbo community has decided to use GitHub Issues instead of JIRA Issues, so most Issues will be tracked by GitHub Issues. JIRA Issues are used to track ASF related issues.

### Reporting Issues
* For non-security issues, raise them directly in GitHub Issues, and also refer to the [Issue Template](https://github.com/apache/dubbo/blob/master/.github/ISSUE_TEMPLATE/dubbo-issue-report-template.md).
* For security issues, please refer to [“Reporting Vulnerabilities”](../reporting-security-issues_dev).

### Code Contribution Process
This contribution process applies to all content in the Apache Dubbo community, including but not limited to dubbo (main repository), dubbo-admin, and dubbo-website.

The following provides a detailed contribution process using contributing to dubbo (the main repository) as an example.

#### 1. **Fork the apache/dubbo project to your GitHub account**

#### 2. **Clone your forked Dubbo repository locally**
```shell
git clone ${your fork dubbo repo address，for example：https://github.com/${your github id}/dubbo.git}
cd dubbo
```

#### 3. **Add apache/dubbo as the upstream repository**
```shell
git remote add upstream https://github.com/apache/dubbo.git

git remote -v

    origin    ${your fork dubbo repo address} (fetch)
    origin    ${your fork dubbo repo address} (push)
    upstream    https://github.com/apache/dubbo.git (fetch)
    upstream    https://github.com/apache/dubbo.git (push)

git fetch origin
git fetch upstream
```
#### 4. **Our work is issue-driven; claim an issue or create an issue and describe what needs to be done.**
Newcomers are recommended to tag issues as: `good first issue`.

#### 5. **Choose a base branch for development, typically master / 3.0 / 3.1, and create a new local branch based on it**
* The 3.1 branch is for the 3.1 version development.
* The 3.0 branch is for the 3.0 version development.
* The master branch is for the 2.7 version development.

```shell
# Create a branch from the remote repository to local
git checkout -b up-dev-issue#${issue-number} upstream/master
```
To avoid unnecessary troubles, we recommend creating a new local branch based on the branch in the "upstream".
You can use a simple description of what you're doing as the branch name (as long as you can understand it). Usually, we include the Issue number in the branch name, as in the checkout command above.

#### 6. **Make various modifications on the newly created local development branch**
First, ensure you have read and correctly set the Dubbo code style. For relevant content, please refer to [Coding Standards](#coding-standards).

When modifying, ensure that changes on this local branch are only related to the issue and try to be specific, ensuring one branch modifies one thing, and one PR modifies one thing.

You can add "#Issue number" in the commit message to associate that commit with the issue.

#### 7. **Push the completed branch to your forked repository**
```shell
git push origin up-dev-issue#${issue-number}
```

#### 8. **Create a Pull Request**

* Refer to the checklist in the [Pull Request Template](https://github.com/apache/dubbo/blob/master/PULL_REQUEST_TEMPLATE.md)

The Dubbo community will review your Pull Request and may suggest modifications. You can return to step 6 to make changes based on feedback and resubmit using step 7.

#### 9. **If there are no issues, the Dubbo community will merge your changes, congratulations on becoming a Dubbo contributor.**

#### Special Notes:
* Open-source projects usually work with branches, creating a branch for each task.
* Don't create branches from branches in your local repository, but create them from the remote repository pointing to the main repository.
* Don't continuously work on the same branch; do one task per branch, and do not accomplish multiple tasks on the same branch.
* Staying on the same branch for modifications means all commits will remain on that branch. This will cause every PR to include all previous merged and unmerged commits.
* A task can be an Issue or part of an Issue (if the Issue is too large, it can be broken down).
* One branch (one task) should only propose one PR.
* After submitting a PR, if there are issues that need adjusting, you can continue to modify and submit commits to the branch associated with this PR. Any commits made to this branch before the PR is merged will enter this PR.
* If you only want to update code, you can propose a PR from the main repository to your forked repository, selecting the branch in the main repository as the source and your forked repository's branch as the target.
* Updating code this way will add a new commit to your forked repository. If you create a branch from your forked repository's branch, this commit record will be carried over and appear in the PR, so it's best to create a branch from the main repository's branch.
* Claiming issues: Reply in the issue you want to claim, clearly stating that you will handle this issue. The community's PMC and Committer will assign the issue to you. However, be sure to check if anyone else has already claimed this issue beforehand.
  To make it easier, we can standardize our claiming replies to: **@i will solve it@**, but this is not mandatory.

#### Coding Standards
Please check your code against the coding standards in [CONTRIBUTING.md](https://github.com/apache/dubbo/blob/master/CONTRIBUTING.md).
##### **Code Conventions**
Our code style is generally consistent with standard Java conventions (default settings of popular IDEs meet this requirement) with the following additional restrictions:
* If the current line has more than 120 characters, start a new line.
* Ensure all new .java files have a simple JavaDoc class comment, preferably with at least one explanatory statement about the class.
* Add the ASF license comment to all new .java files (copy from existing files in the project).
* Please ensure not to add @author tags to your contributed files, as Apache does not use @author tags; other methods (such as CVS, Git) will fairly record all your contributions.
* Add some JavaDoc for the code. If you change the namespace, you will need some XSD DOC elements.
* For new features or significant fixes, unit tests should be added.
* If no one else is using your branch, sync it with the master (or other target branches in the main project).
* When writing commit messages, follow these conventions; if you're fixing an existing issue, add Fixes XXX (where XXX is the issue number) at the end of the commit message.

##### **Code Style**
We provide an IntelliJ IDEA template file located at dubbo root directory/codestyle/dubbo_codestyle_for_idea.xml, which you can import into your IDE. For Eclipse, you can manually configure it by referencing the file.

**Code Style Check:**

1. Install the Checkstyle plugin (you can search for it in the plugin market of IDEA).
2. Once the plugin is installed, set it in IDEA's settings==>tool==>checkstyle:
![checkstyle1](/imgs/dev/checkstyle1.png)
![checkstyle2](/imgs/dev/checkstyle2.png)
![checkstyle3](/imgs/dev/checkstyle3.png)
![checkstyle4](/imgs/dev/checkstyle4.png)
   
**Notes**

Setting the code format in your IDEA using dubbo_codestyle_for_idea.xml is a crucial step before contributing code; otherwise, you will not pass the CI code style check. The following steps demonstrate how to configure the code format:
1. Go to the menu page Editor > Code Style
2. In the scheme menu on the Code Style page, click on manage profiles, select Import Scheme from the dropdown list, and then choose IntelliJ IDEA code style XML to import the XML file.
3. Enter a name for your format for easy recognition between different projects, and don't forget to press ⏎ to save the changes.
   After setting up, IDEA will help you automatically reformat the code.

### Participate in Release Voting

Participating in release voting is an important way to contribute to the community. The Dubbo community warmly welcomes and encourages anyone to participate in the voting. Whenever a version needs to be formally released, a release vote will be held on the developer mailing list. A formal release will only occur once the vote passes. You can refer to this [checklist](https://cwiki.apache.org/confluence/display/INCUBATOR/Incubator+Release+Checklist) for compliance checks on the source code. If you have any questions, please ask on the developer mailing list. 
