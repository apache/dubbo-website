---
title: "Meet Dubbo"
linkTitle: "Meet Dubbo"
date: 2019-01-26
tags: ["News"]
description: >
    This article documents the journey of a novice growing into a Dubbo committer.
---

I am a programmer with a Dubbo obsession.

Dubbo has accompanied me throughout my coding career for a short time in various ways. Not long ago, I was elected as a `Committer` through community voting. At that time, I posted a phrase on my social network, which encapsulated my journey from starting to use Dubbo, researching Dubbo, contributing to Dubbo, and finally becoming a `Committer`, providing me with a unique source of internal joy: it’s particularly happy to see footprints in the process of growth.

Today, let’s take a nostalgic look back at my experiences with Dubbo.

## Novice

I first learned about Dubbo when I was an intern skipping classes in my junior year. Back then, I was ignorant, and the coolest people in my eyes were those who could skillfully use various configurations and were proficient in the SSH framework. In that situation, during my internship, I encountered a group of people who have influenced me to this day. By chance, we undertook the service transformation for two very small modules. At that time, besides our team leader, the rest were all newbies, following his lead. He suggested using Dubbo, and that’s when I learned, oh! There’s something called RPC, and Alibaba's RPC framework is Dubbo.

Due to my limited skills and intense work, my connection with Dubbo was superficial—not quite knowing it, but not completely unfamiliar either.

## Contributor

My year at Two-dimensional Fire was a transitional period in my Dubbo journey. At that time, Two-dimensional Fire maintained a branch of Dubbo and had a group of individuals very familiar with it. After work, we would discuss Dubbo, often working overtime on Saturdays to study it. I’d look at the source code, debug when I didn’t understand, and if I was still stuck, I’d ask people or Google, going through all sorts of efforts.

Later, I graduated and joined NetEase Cloud Music. Around May this year, I discovered a small bug in Dubbo and submitted a pull request. After my first merge, I was very encouraged, leading to further developments. Reflecting back on this first submission, it truly marked a turning point in my journey with Dubbo, paving my path toward becoming a `Committer`.

Many people may hesitate when reading this, which is a common misconception about contributing to open source—thinking they must find a BUG to submit a pull request. This is entirely untrue; let's highlight a key point: many contributors' first contributions are not code, but documentation changes or unit tests. Compared to bugs or new features, the barrier for unit tests and documentation fixes is lower.

My method is: **try to add unit tests first, debug while writing tests and reading the code. Or read documentation more, while learning the framework, find typos, ambiguous meanings, or broken links, and submit PRs to the corresponding repository directly**.

Starting is always difficult. Once your code gets merged for the first time, you become a `Contributor`. There are many Contributors, but few Committers. Next, I’ll continue discussing how to grow from a `Contributor` to an independent `Committer`.

## Committer

Contributing to open source is like writing code; it’s not something that happens overnight. It’s a process where quantitative change leads to qualitative change. This is a process with no shortcuts; to wear the crown, one must bear its weight. The foundational knowledge of Dubbo goes without saying—this section highlights other important aspects to consider beyond research and passion.

First, submit high-quality PRs. Every PR will be reviewed; issues in code or deviations in thought will be pointed out. Submitting a PR is a reflective process. The quality of a PR cannot simply be measured by how many lines of code are added. A high-quality PR is the result of meticulous consideration—why certain code is deleted, the significance of the new code, and the effects of the changes, etc. I hope everyone prioritizes quality over quantity, aiming for long-term benefits.

The second point is that we need to cultivate a mindset—the Apache Way. In summary, **the community is more important than the code**. The Apache Software Foundation emphasizes community, and its operational methods differ from our current development practices. Here's an example of the Apache Way to illustrate the difference between traditional methods and the Apache Way, assuming I want to develop a feature A for Dubbo.

**Old Way**:

1. Design the feature: Create a design document (depending on the feature size), outline necessary class modifications or additions, and roughly design interfaces.
2. Develop the code.
3. Submit the PR.
4. Review & Merge.

As you can see, in this process, the only real interaction with the community is in the final step.

**Apache Way**:

1. Design the feature: Send an email to the mailing list and submit an ISSUE for discussion with community members, produce a design document (depending on the feature size), and outline necessary class modifications or additions. Then, resend the email and reply to the ISSUE to notify the community that the design document is finalized or the plan is determined.
2. Develop the code: Send an email to the community, notifying members that I will start developing feature A and state any help needed.
3. Submit the PR: Send an email and respond to the ISSUE, reminding the community that the development is complete, and share the PR link for review.
4. After Review + Merge, send an email and close the ISSUE, notifying the community that development of feature A is complete.

As you can see, the Apache Way involves constant interaction with the community throughout the development process, maximizing community engagement and harnessing collective strength. This is the essence of **community** and **open source**.

## Conclusion

Dubbo is still in its incubation phase, and the entire Dubbo community isn’t fully developed yet. We are growing alongside Dubbo and sincerely hope more Dubbo enthusiasts will participate deeply to create a milestone in your coding career.

Believe in the process, and you will reap the results; diligence is rewarded, and efforts are not in vain!

