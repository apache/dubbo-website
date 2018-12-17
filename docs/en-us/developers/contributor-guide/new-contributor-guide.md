# New contributor guide

This is a guide for new comers who wants to contribute to Dubbo.

### Subscribe to the mailing list

The mailing list is the recommended way for discussing almost anything that related to Dubbo. Please refer to this [issue](https://github.com/apache/incubator-dubbo/issues/1393) for detailed documentation on how to subscribe.

* dev@dubbo.incubator.apache.org: the develop mailing list, you can ask question here if you have encountered any problem when using or developing Dubbo.
* commits@dubbo.incubator.apache.org: all the commits will be sent to this mailing list. You can subscribe to it if you are interested in Dubbo's development.
* issues@dubbo.incubator.apache.org: all the JIRA [issues](https://issues.apache.org/jira/projects/DUBBO/issues) and updates will be sent to this mailing list. The Dubbo community has decided to use github issues rather than JIRA issues, therefore it is expected that most of the issues will be tracked by github issues. The JIRA issues are used to track ASF related issues.


### Reporting issue

### Sending pull request

* Follow the checklist in the [pull request template](https://github.com/apache/incubator-dubbo/blob/master/PULL_REQUEST_TEMPLATE.md)
* Before you sending out the pull request, please sync your forked repository with remote repository, this will make your pull request simple and clear. See guide below:

```sh
git remote add upstream git@github.com:apache/incubator-dubbo.git
git fetch upstream
git rebase upstream/master
git checkout -b your_awesome_patch
... add some work
git push origin your_awesome_patch
```


### Code convention

Please check the [CONTRIBUTING.md](https://github.com/apache/incubator-dubbo/blob/master/CONTRIBUTING.md) for code convention.