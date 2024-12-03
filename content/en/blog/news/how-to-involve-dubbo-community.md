---
title: "How to Contribute to the Dubbo Community"
linkTitle: "How to Contribute to the Dubbo Community"
date: 2018-03-11
tags: ["News"]
description: >
  This article explains how to participate in the Dubbo community and contribute in an Apache Way.
---


![img](/imgs/blog/involve-dubbo/head.jpg)

## Introduction

This article was first shared at the Apache Dubbo meetup in Chengdu, where the topic was discussed for the first time. It's not that we lack better topics; rather, we believe this topic is crucial and even suggest it should be covered in every meetup.

Most of you are familiar with the development history of Dubbo. Dubbo was open-sourced on GitHub in 2011 and, for several years, was not maintained due to various reasons. It was restarted by Alibaba in July last year and donated to Apache on February 16, 2018.

The donation to Apache aims to dispel community concerns regarding Dubbo's future and to build confidence among Dubbo users; Apache believes that `community is greater than code` and emphasizes diversity, stating that a project requires contributions from multiple companies and individuals. Currently, Dubbo operates entirely under `The Apache Way`.

## The Birth of Apache

Apache is the world's largest software foundation, and many projects, like Maven, Log4j, and Tomcat, are used globally. Among these, the Apache HTTP Server stands out as Apache's first project.

The Apache Software Foundation was officially established in 1999 to provide useful free software to the public and to support the software developer community. Its founders were a group self-identified as the `Apache group`.

As early as 1995, this organization formed around the NCSA HTTPd server developed at the University of Illinois' National Center for Supercomputing Applications.

Originally, the NCSA HTTPd server was developed by Rob McCool, who eventually lost interest, leading to a lack of maintenance for the powerful and user-friendly server. Enthusiasts and users then took it upon themselves to maintain and improve it. To facilitate better communication, one individual created a mailing list, efficiently organized the maintenance work, and self-identified as the `Apache group`, dubbing the software `Apache Server`.

This is why all Apache projects still primarily use mailing lists for communication today.

Regarding the name Apache, it originates from a North American Indian tribe known for its superior military skill and remarkable endurance, which resisted invaders in the latter half of the 19th century. The name was chosen to honor this tribe. There’s also a lighthearted story that while patching the NCSA HTTPd, it was humorously referred to as `A Patchy Server`, sounding similar to `Apache Server`.

![img](/imgs/blog/involve-dubbo/apache-history.png)

With the expansion of commercial demand, more projects emerged around the Apache HTTP Server, leading to the establishment of the Incubator project in 2002 to facilitate the smooth entry of external projects into the Apache Foundation. By 2010, after more than a decade of development, there were 75 top-level projects and 30 incubator projects, with 2,697 discussion emails per day. By 2018, this number further increased to 194 top-level projects, 54 incubator projects, and 3,255 committers. Projects led by Chinese developers include RocketMQ, WeeX, ECharts, and Skywalking.

Dubbo is on the path to becoming an Apache top-level project—currently an Apache incubator project.

Reflecting on Apache's history and data, we can identify several key terms: interest, participation, and mailing lists; these will be the focus of our later discussion on `The Apache Way`.

## ASF Organizational Structure

![img](/imgs/blog/involve-dubbo/apache-org.png)

Every organization has its own structure, and the ASF is no exception. So what does Apache's organizational structure look like? Is there anything unique? Notably, we have Project Management Committees, or PMC. Each project has a PMC from the incubation stage, primarily responsible for ensuring that the community activities of the open-source project operate smoothly under `The Apache Way`.

In the diagram, the Board oversees the foundation's operations according to its charter. We rarely interact with the Board but engage more with the PMC and the several layers below.

Participants in Apache project community activities can be categorized as follows:

* Direct Users: Many present are users of Dubbo, some may not be now, but will definitely be in the future.

* Contributors: Some users, encountering issues while using Dubbo, identify solutions through analysis and debugging, submitting them to the Dubbo team, eventually becoming contributors.

* Committers: After making significant contributions, a Committer position can be achieved through PMC nomination and voting. Being a Committer means officially joining Apache, gaining a personal Apache account, and write permissions on relevant projects.

* PMC: Advancing from a Committer to a PMC requires nomination by existing PMC members.

Individual growth in the community resembles promotions within a company, progressing step by step.

The goal of this article is to demonstrate that moving from User to Contributor is not as difficult as imagined, and transitioning from Contributor to Committer is also achievable. With a spirit of open source, finding projects of interest, and sustained effort, contributions will surely be rewarded.

## The Apache Way

Just as you need to understand a company's culture before joining, participating in Apache open-source projects also requires understanding the culture of the ASF, known as `The Apache Way`.

![img](/imgs/blog/involve-dubbo/apache-way.png)

Here are some key points to emphasize:

* Community over Code: Building a project is not true open source; creating a community is. Everything revolves around code; without code, there is no community. Above code is the philosophy of how to work, treat people, and make decisions. A healthy community is far more important than great code—if the code is awful, the community can rewrite it, but if the community has issues, the code will ultimately perish.

* Open and Transparent Consensus Decision-Making: `If it doesn't happen on email, it doesn't happen.` All decisions, whether about technical features, development direction, or version releases, should be publicly discussed, primarily through mailing lists, and all discussions and conclusions should be archived permanently. The discussion process allows everyone to freely express opinions, but a vote is necessary at the end—a rather democratic approach.

* Meritocracy: `Those that have proven they can do, get to do more.` It's crucial to emphasize that contributions are not limited to code; many aspects can contribute. 

## Participating in the Dubbo Community

![img](/imgs/blog/involve-dubbo/dubbo-community.png)

To participate in the Dubbo community, it's essential to understand how the community currently operates. In short, it revolves around four roles, three pathways, and two code bases:

1. The four roles mentioned earlier are User, Contributor, Committer, and PMC. It's important to note that these roles are not isolated—for instance, someone suggesting features can also be a Committer or Contributor. PMC has voting rights, but others can also vote; this itself is a form of participation and contribution.

2. The three pathways are the Dubbo official website, GitHub, and the developer mailing list. Currently, GitHub issues/PRs are the most active. We encourage everyone to engage via mailing lists in the spirit of `The Apache Way`, enabling mentors to see our contributions.

3. The two code bases are `github.com/apache/dubbo*`, which is the Dubbo incubator project focusing on dubbo-rpc, dubbo-spring-boot-start, and dubbo-ops; and `github.com/dubbo`, which encompasses all related ecosystem aspects for Dubbo as a microservices solution, including extensions of dubbo-rpc, integration with other products, multilingual client implementations, tools, and packages.

![img](/imgs/blog/involve-dubbo/dubbo-project.png)

For those looking to participate in the Dubbo community and contribute to this microservices solution, here are some immediate actions you can take:

1. Subscribe to the developer mailing group; guidance is available here: https://github.com/apache/dubbo/wiki/Mailing-list-subscription-guide
2. Star and fork github.com/apache/dubbo.
3. Review and optimize the English and Chinese documentation, submitting PRs; for any questions, email the mailing group or raise an issue; responses from official developers are usually much better than what you find on Google or StackOverflow.
4. If you're using Dubbo, summarize your experiences and write a blog to share with the community; real cases are always the most persuasive.
5. If you have time, participate in resolving issues and PRs by responding to user inquiries and reviewing PRs; there will always be suitable `Good first issue` or `Help wanted` issues for you.
6. If you want to delve into the dubbo-rpc framework, UT is an excellent starting point; improving and supplementing existing UTs allows you to learn while contributing—what's not to love?
7. If you discover bugs, report issues; solving them through your efforts qualifies you as a `first-contributor`, which isn't that challenging. Oh, and spelling errors count too.
8. If you identify opportunities to help users conveniently use Dubbo, whether through development, testing, debugging, mocking, or tools, you can contribute to the Dubbo ecosystem.
9. Finally, we welcome everyone to share ideas via email and engage in discussions; you’ll find that as your technical skills improve, your English will too.

## Joining the Apache Incubator

If you have promising projects you hope to donate to Apache, you can refer to the following process:

![img](/imgs/blog/involve-dubbo/get-into-apache.png)

Joining Apache involves three stages: the preparation stage, incubation stage, and graduation stage. During the preparation phase, you'll need to find a mentor willing to help with incubation and submit an application to enter the incubation. After discussions and votes among the mentors, if approved, you'll enter incubation. The incubation stage comprises two major steps: signing agreements with the company and individuals to transfer code and intellectual property to Apache, followed by version iterations and community management under Apache guidelines to develop more Committers. If you pass the maturity assessment at the end, you can successfully graduate to become a top-level Apache project.

## Conclusion

We hope more teams and individuals can contribute to the international open-source community and work together to build our Chinese open-source brands! We also hope everyone can contribute happily—Rome wasn't built in a day, but contributions will definitely pay off.

Here’s a little perk: all Apache Committers can use the entire suite of paid IntelliJ products for free, including the best IDE, IDEA.

