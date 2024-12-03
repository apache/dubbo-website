---
aliases:
    - /en/contact/
    - /en/contribution-guidelines/
description: Contact the community, Dubbo community contribution guidelines
linkTitle: Contact the Community
# menu:
#     main:
#         weight: 40
title: Contact the Community
type: docs
---

## Contributing to Dubbo

Dubbo is released under the permissive Apache 2.0 license, follows the standard GitHub development process, uses GitHub to track issues, and merges pull requests into master. If you want to contribute to Dubbo (even something small), please don't hesitate to follow the guidelines below.

### Contact Us

#### Social Media
{{< cardpane >}}
  {{< card header="WeChat Official Account" >}}
<div class="community-resource">
   <a href="/">
       <img src="/imgs/contacts/wechat-account.jpg" alt="Wechat">
   </a>
   <p>Official WeChat Account (Apache Dubbo)</p>
</div>
  {{< /card >}}
  {{< card header="DingTalk Group" >}}
<div id="slack" class="community-resource">
    <a href="/">
        <img src="/imgs/contacts/dingtalk.png" alt="Dingtalk">
    </a>
    <p>Regular online community meetings or developer bi-weekly meetings</p>
</div>
  {{< /card >}}
  {{< card header="Twitter" >}}
<div id="twitter" class="community-resource">
    <a href="https://twitter.com/apachedubbo">
        <img src="/imgs/contacts/twitter.png" alt="Twitter">
    </a>
    <a href="https://twitter.com/apachedubbo">Twitter&nbsp;&#9654;</a>
    <p><em>#apachedubbo</em></p>
    <p>International community dynamics of the Apache Dubbo project and industry news</p>
</div>
  {{< /card >}}
  {{< card header="GitHub" >}}
<div id="github" class="community-resource">
    <a href="https://github.com/apache/dubbo-awesome">
        <img src="/imgs/contacts/github.png" alt="GitHub">
    </a>
    <a href="../github/">GitHub&nbsp;&#9654;</a>
    <p>Find the GitHub address of the corresponding language implementation or ecosystem project and participate in Dubbo's source code contribution</p>
</div>
  {{< /card >}}
{{< /cardpane >}}

#### Mailing Lists

Mailing lists are the recommended way to discuss almost everything related to Dubbo. For detailed documentation on how to subscribe, please refer to the [guide](https://github.com/apache/dubbo/wiki/Mailing-list-subscription-guide).

- [dev@dubbo.apache.org](mailto:dev-subscribe@dubbo.apache.org): Development mailing list, where you can raise issues if you encounter problems using or developing Dubbo.
- [commits@dubbo.apache.org](mailto:commits-subscribe@dubbo.apache.org): All commits will be sent to this mailing list. If you're interested in the development of Dubbo, you can subscribe to it.
- [notification@dubbo.apache.org](mailto:notification-subscribe@dubbo.apache.org): All updates on GitHub [issues](https://github.com/apache/dubbo/issues) and [pull requests](https://github.com/apache/dubbo/pulls) will be sent to this mailing list.

### Reporting Issues

Please follow the [template](https://github.com/apache/dubbo/issues/new?template=dubbo-issue-report-template.md) when reporting any issues.

### Code Conventions
Our coding style is mostly aligned with standard Java conventions (the default settings of popular IDEs meet this), with the following additional restrictions:

* Start a new line if the current line has more than 120 characters.

* Ensure that all new .java files have a simple JavaDoc class comment with at least one tag indicating the creation date and ideally at least one explanation about the class.

* Add ASF license comments to all new .java files (copy from existing files in the project).

* Please ensure that no @author tag is added to the files you contribute, as Apache does not use the @author tag; other methods (like cvs) will fairly document all your contributions.

* Add some JavaDoc to the code, and if you change namespaces, XSD DOC elements are needed.

* Unit tests should be added for new features or significant fixes.

* If no one else is using your branch, synchronize it with master (or another target branch in the main project).

* Follow these conventions when writing commit messages; if you are fixing an existing issue, add "Fixes XXX" at the end of the commit message, where XXX is the issue number.

### Contribution Process

Here is a rough outline of a contributor's workflow:

* Clone the current project
* Branch off from the branch you wish to contribute to, usually the master branch.
* Commit your changes.
* Ensure the commit message format is correct.
* Push the new branch to your cloned repository.
* Execute the checklist [pull request template](https://github.com/apache/dubbo/blob/master/PULL_REQUEST_TEMPLATE.md).
* Before submitting the pull request, sync your cloned code with the remote repository so that your pull request is simple and clear. Here are the steps:
```
git remote add upstream git@github.com:apache/dubbo.git
git fetch upstream
git rebase upstream/master
git checkout -b your_awesome_patch
... add some work
git push origin your_awesome_patch
```
* Submit the pull request to apache/dubbo and wait for a response.

Thank you for your contributions!

### Code Style

We provide the IntelliJ IDEA template file [dubbo_codestyle_for_idea.xml](https://github.com/apache/dubbo/tree/master/codestyle/dubbo_codestyle_for_idea.xml), which you can import into the IDE.

If using Eclipse, you can manually configure it by referring to this file.

**Note**

Using dubbo_codestyle_for_idea.xml to set code formatting for your IDEA is a crucial step before contributing code; otherwise, you will not pass the code style check by Travis CI. Here are the steps to configure your code format:

1. Go to the menu page `Editor > Code Style`
2. Click on manage profiles in the scheme menu of the Code Style page
Select `Import Scheme` from the dropdown list, then choose `IntelliJ IDEA code style XML` to import the xml file
3. Enter your format name for recognition across different projects, and don’t forget to ⏎ to save changes.

Once set up, IDEA will help you automatically reformat the code.

