---
type: docs
title: "New Contributor Guide"
linkTitle: "New Contributor"
weight: 2
---

This is a guide for new comers who wants to contribute to Dubbo.

### Subscribe to the mailing list

The mailing list is the recommended way for discussing almost anything that related to Dubbo. Please refer to this [issue](https://github.com/apache/dubbo/issues/1393) for detailed documentation on how to subscribe.

To subscribe to the following mailing list, please refer to [Mailing list subscription guide](/en/docs/contribution-guidelines/contributor/mailing-list-subscription-guide_dev)

* dev@dubbo.apache.org: the develop mailing list, you can ask question here if you have encountered any problem when using or developing Dubbo.
* commits@dubbo.apache.org: all the commits will be sent to this mailing list. You can subscribe to it if you are interested in Dubbo's development.
* issues@dubbo.apache.org: all the JIRA [issues](https://issues.apache.org/jira/projects/DUBBO/issues) and updates will be sent to this mailing list. The Dubbo community has decided to use github issues rather than JIRA issues, therefore it is expected that most of the issues will be tracked by github issues. The JIRA issues are used to track ASF related issues.


### Reporting issue

You can always reporting an issue to Dubbo via Github [Issues](https://github.com/apache/dubbo/issues).

If you are reporting bugs, please refer to the issue report [template](https://github.com/apache/dubbo/issues/new?template=dubbo-issue-report-template.md).

If you are reporting regualur issues, like raise an question, you can open an [regular issue](https://github.com/apache/dubbo/issues/new)

### Sending pull request

* Follow the checklist in the [pull request template](https://github.com/apache/dubbo/blob/master/PULL_REQUEST_TEMPLATE.md)
* Before you sending out the pull request, please sync your forked repository with remote repository, this will make your pull request simple and clear. See guide below:

```sh
git remote add upstream git@github.com:apache/dubbo.git
git fetch upstream
git rebase upstream/master
git checkout -b your_awesome_patch
... add some work
git push origin your_awesome_patch
```

### Code convention

Please check the [CONTRIBUTING.md](https://github.com/apache/dubbo/blob/master/CONTRIBUTING.md) for code convention.

### Participate in the release vote

Participate in the release vote is an important way to contribute to Dubbo. The Dubbo community welcomes everyone to partipate, you can check the release vote using this [check list](https://cwiki.apache.org/confluence/display/INCUBATOR/Incubator+Release+Checklist).
If you have any question regarding the check list, please feel free to ask on dev@dubbo.apache.org.


### What can I contribute?

* Take a look at issues with tag called [`Good first issue`](https://github.com/apache/dubbo/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22) or [`Help wanted`](https://github.com/apache/dubbo/issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted%22).
* Join the discussion on mailing list, subscription [guide](https://github.com/apache/dubbo/wiki/Mailing-list-subscription-guide).
* Answer questions on [issues](https://github.com/apache/dubbo/issues).
* Fix bugs reported on [issues](https://github.com/apache/dubbo/issues), and send us pull request.
* Review the existing [pull request](https://github.com/apache/dubbo/pulls).
* Improve the [website](https://github.com/apache/dubbo-website), typically we need
  * blog post
  * translation on documentation
  * use cases about how Dubbo is being used in enterprise system.
* Improve the [dubbo-admin/dubbo-monitor](https://github.com/apache/dubbo-admin).
* Contribute to the projects listed in [ecosystem](https://github.com/dubbo).
* Any form of contribution that is not mentioned above.
* If you would like to contribute, please send an email to dev@dubbo.apache.org to let us know!
