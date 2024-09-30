---
title: "Using Dubbo as an Example to Discuss How to Contribute to Open Source Projects"
linkTitle: "Using Dubbo as an Example to Discuss How to Contribute to Open Source Projects"
tags: ["Java"]
date: 2018-06-03
description: >
    This article will explain using the Dubbo project as an example that contributing to open source projects is not a difficult task.
---

There are many excellent open source projects on GitHub, and most IT professionals use them as readily available libraries. They search for what they need on GitHub, but have you ever thought that you could also contribute to the open source cause one day? This article will use the Dubbo project as an example to explain that contributing to open source projects isn’t difficult.

## 1 Why Contribute to Open Source

The benefits of contributing to open source projects are manifold. To give you sufficient confidence to join open source projects, I have listed many of its benefits at the start of the article.

### 1.1 Solidify Skills

Whether submitting code, writing documentation, filing issues, or organizing events, when you engage with an open source project, your related skills will be honed, and you’ll find your place within the project. On one hand, most of us encounter business scenarios in our daily work and do not have many opportunities to engage with foundational infrastructure components; open source projects provide a platform where you can select projects you are familiar with to contribute to (for example, not all IT companies are capable of developing their own service governance frameworks); on the other hand, the code you submit will be reviewed with the help of administrators who will provide professional suggestions, better coding standards, and superior programming ideas, all of which will ultimately become part of your experience.

### 1.2 Make Friends

The open source community provides you with a platform where you can meet many pure technology enthusiasts. Open source contributors are the group that most fits the definition of geeks; the individuals you encounter are often the top tier in their respective fields.

### 1.3 Build a Reputation

This is a great place to showcase your personal abilities. As the saying goes: talk is cheap, show me the code. As a technical person, nothing is more persuasive than a well-crafted GitHub profile. If you can make substantial contributions to an open source project, you will also gain recognition in the industry, and the achievements of the open source project will then become inextricably linked to you.

### 1.4 Pass on the Open Source Spirit

Only with a continuous influx of contributors can open source projects thrive and foster a good open source culture within communities like GitHub. Otherwise, with only output and no input, open source will lose vitality.

### 1.5 Develop a Habit

Believe me, once you develop the habit of submitting code every day, it’s as if you don't want to interrupt your check-in; you definitely won't want to interrupt your commits. There aren't just English check-ins and fitness check-ins, but also open source check-ins!

## 2 Some Common Issues When Contributing Code

If you are a newcomer to the open source world, you may feel intimidated by the contribution process. For example: how do I modify code and submit it? What if my code has bugs? Will others think my code is low quality? How do I find suitable open source projects? What do all the tools and terms in the open source community mean?

The second part of this article will introduce some common questions from the perspective of a **newbie**.

### 2.1 Git Common Operations

Generally, we choose to use Git as our version control tool; you don’t necessarily need to be very familiar with it. In my opinion, mastering clone, add, commit, pull, and push is sufficient. When faced with complex situations, you still have Google.

**Fork and Clone**

If you just want to download the source code and view its implementation, you can use the "Clone or download" button.

If you want to make changes to the open source project and ultimately request a merge to have your contributed code in the project, you should use fork. Forking will create a copy of the current main branch's code into your repository. Afterward, all your modifications should be based on your own repository. After developing functions or fixing bugs, you can submit a pull request from your repository to the source repository. Only the administrators of the source repository have the authority to merge your request.

Here are some advanced commands that may help you.

```shell
# Set the source repository
git remote add upstream https://github.com/apache/dubbo.git
# Fetch updates from the source repository
git fetch upstream
# Merge updates from the source repository's main branch into your repository
git checkout master
git merge upstream/master
```

**Pull Request**

A pull request is often abbreviated as PR, which refers to a request to merge changes into the source repository. The operation buttons mentioned above are available only after forking the Dubbo repository.

**Pull Request from the Source Repository's Perspective**

Administrators will review the changes involved in the pull request to ensure that your code complies with specifications, has no logical errors, and meets the functional requirements of the framework.

### 2.2 Travis CI

Some automated CI processes are integrated into the build of each pull request to verify whether the contributor's code meets the established standards, such as whether there are compilation issues, whether unit tests pass, whether coverage is up to standard, and whether the code style is compliant, etc.

Generally, you must pass the CI for your pull request to be reviewed by administrators.

### 2.3 Mailing List

Every open source project will have its contribution guidelines, which can typically be found on the homepage under "Contributing." Dubbo, being an incubating Apache project, adheres to Apache's tradition and describes in the [Contributing](https://github.com/apache/dubbo/blob/master/CONTRIBUTING.md) document that when you want to contribute new features to Dubbo, the official recommendation is to describe your intended changes via the mailing list.

Simply put, a mailing list is an email notification mechanism where all Dubbo developers subscribe to the email: dev@dubbo.apache.org. Any changes or suggestions for new features can be sent to this email to inform other developers. Similarly, you can subscribe to learn about the developers' direction if you are a Dubbo user. This [guide](https://github.com/apache/dubbo/wiki/Mailing-list-subscription-guide) can help you subscribe to Dubbo's mailing list.

> As a modern developer, you may find that mailing list communication is somewhat outdated and not particularly efficient. However, it is recommended as the communication method for Apache projects for specific reasons, which will not be elaborated upon here. In summary, follow one principle: bug fixes or discussions can be conducted in GitHub issues, while more impactful features and discussions are recommended to take place in the mailing list.

## 3 Other Forms of Contribution

Contributing code, fixing bugs, and similar actions are not the only ways to contribute to open source. The following behaviors also constitute major forms of contribution:

### 3.1 Writing Documentation

The [Dubbo documentation](/) is a vital component of its open-source composition, with the source files located at: [https://github.com/apache/dubbo-website](https://github.com/apache/dubbo-website). This is also a Git repository; any supplementary contributions regarding Dubbo topics can be submitted with a pull request here. A basic understanding of markdown syntax and some optional npm syntax is all that is required. If you feel that contributing code is a bit challenging for you at the moment, you might start engaging with open source by contributing documentation.

### 3.2 Issues

Whether in GitHub issues or mailing list discussions, whether you are asking questions, reporting bugs, or answering questions (bug fixes require more than just opening issues), assisting administrators in reviewing pull requests is a form of contribution; do not underestimate small acts of kindness.

### 3.3 Other Actions

Any actions you can think of that help an open source project improve count as contributions. For example, tagging issues appropriately, closing duplicate issues, linking related issues, organizing offline salons, answering related questions on Stack Overflow, and correcting a typo in documentation are all valid efforts.

## 4 Best Practices for Open Source

### 4.1 Effective Communication

Regardless of your purpose—whether a one-time contribution or a permanent addition to the community—you must communicate and interact with others. This is a skill you must develop to progress in the open source realm.

Before opening an issue or PR, or asking questions in a chat room, please remember the suggestions listed below, which will make your work more efficient.

**Provide Context** so that others can quickly understand. For instance, if you encounter an error while running a program, you should describe how you did it and how to reproduce the error. If you’re submitting a new idea, explain why you think it’s beneficial for the project (not just for you!).

> 😇 *“X doesn’t work when I do Y.”*
>
> 😢 *“X is broken! Please fix it.”*

**Prepare Before Taking Further Action.** It’s okay not to know, but show that you have tried and made an effort. Before seeking help, make sure you read through the project’s README, documentation, issues (both open and closed), mailing list, and searched online. People appreciate strong curiosity and will be more willing to help you.

> 😇 *“I’m not sure how X is implemented; I’ve consulted the documentation, but it didn’t help.”*
>
> 😢 *“How do I do X?”*

**Keep Requests Short and Direct.** Just like sending an email, every contribution, no matter how simple, requires others to read. Many projects have many requesters but few helpers. Trust me, keeping concise allows for a much greater chance of getting help from others.

> 😇 *“I’d love to write an API tutorial.”*
>
> 😢 *“One day while driving on the highway, I thought we should do this; but before I explain further, let me show you…”*

**Ensure all communication is conducted publicly.** Even small matters should not be sent privately to maintainers unless sharing sensitive information (such as security issues or serious errors). If you can keep conversations public, many people will learn from and benefit from the opinions exchanged.

> 😇 *(Comment) “@maintainer Hi! How should we handle this PR?”*
>
> 😢 *(Email) “Hello, I’m sorry to email you, but I really hope you can take a look at my submitted PR.”*

**Ask Bold Questions (But Be Cautious!).** Everyone involved in the community starts as a newbie; even very experienced contributors are new when entering a new project. For the same reasons, even long-term maintainers may not always be familiar with every part of a project. Be patient with them, and you’ll receive the same in return.

> 😇 *“Thanks for checking out this issue; I did this per your suggestion, and here’s the output.”*
>
> 😢 *“Why haven’t you fixed my problem? Isn’t this your project?”*

**Respect Community Decisions.** Your ideas might differ from the community’s priorities and vision; they may provide feedback and reasoning for their final decisions, at which point you should engage in active discussion and seek compromise. Maintainers must consider your ideas carefully, but if you cannot agree with the community’s approach, you can still stand your ground! Maintain your branch or start anew.

> 😇 *“You can’t support my use case; I’m a bit disappointed, but your explanation only addresses a small part of users; I understand why. Thanks for listening patiently.”*
>
> 😢 *“Why can’t you support my use case? This is unacceptable!”*

**Keep the above points in mind.** Open source is a collaboration of people from all over the world. The challenges are cross-linguistic, cross-cultural, from different geographical points, and across time zones; additionally, written communication is particularly challenging as it cannot convey tone and emotion. Please keep kindness in these conversations! Be polite in situations such as pushing an idea, asking for more context, or clarifying your position. Since you found what you needed on the internet, try to make it better!

### 4.2 Creating Issues

You should create an issue in the following situations:

- Reporting bugs you cannot resolve
- Discussing a high-level topic or idea
- Expressing hope to implement a new feature or another project idea

A few practical tips for communication in issues:

- **If you happen to see an open issue that you plan to resolve,** add a comment to inform others that you will work on it and respond timely. This can help avoid duplicated efforts.
- **If an issue has been open for a while,** it might already be being worked on or may have been resolved, so please add a comment before beginning work to confirm.
- **If you created an issue but resolved it quickly,** also add a comment to inform others and close the issue. The record itself is a contribution to the community.

### 4.3 Creating Pull Requests

In the following situations, please be sure to use a PR:

- Submitting patches (e.g., correcting typos, broken links, or other obvious errors)
- Starting a task requested by someone else or previously discussed in issues

A PR does not indicate that the work is complete. It’s often a good practice to open a PR early so others can view or provide feedback to the author. Just mark it as “WIP” (Work in Progress) in the subtitle. The author can add many comments later.

If the project is hosted on GitHub, here are our summarized suggestions for submitting PRs:

- **Fork the code repository** and clone it locally, then set “upstream” as the remote repository. This way, you can stay in sync with “upstream” when submitting your PR, reducing conflict resolution time. (For more on syncing, refer to [this](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/syncing-a-fork).)
- **Create a branch** for your edits.
- **Reference any related issues** or include supporting documentation in your PR (e.g., “Closes #37.”)
- **Include snapshots before and after** if your changes involve different HTML/CSS. Drag relevant images into your PR.
- **Test your changes!** If test cases exist, run them to cover your changes. If not, create relevant use cases. Regardless of whether tests exist, ensure your changes do not break the existing project.
- **Maintain consistency with the project's existing style.** Do your best to conform; this may mean that your use of indentation, semicolons, and comments may greatly differ from your own style, but to spare the maintainers' energy and for the future comprehension and maintenance of others, please tolerate this.

## 5 Becoming an Open Source Contributor

If you aspire to participate in open source efforts, you can start with the projects you are most familiar with. Open source is not reserved for advanced developers; it evolves through the needs, fixes, and constructions by individuals like you and me. Let's try it!

