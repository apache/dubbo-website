---
title: "One-stop Distributed Transaction Solution in Seata Microservices Architecture"
linkTitle: "One-stop Distributed Transaction Solution in Seata Microservices Architecture"
tags: ["apachecon2023", "seata", "ecosystem"]
date: 2023-10-07
authors: ["Ji Min"]
description: One-stop Distributed Transaction Solution in Seata Microservices Architecture
---

Abstract: This article is derived from the sharing by Ji Min, the product manager of Alibaba Cloud's distributed transaction, founder of the Seata open-source project, and head of microservice open-source governance. The content is mainly divided into three parts:

* 1. Challenges of Data Consistency in Microservices Architecture
* 2. Architectural Evolution of Seata Distributed Transactions
* 3. How to Extend RPC and Database Based on Seata

## 1. Challenges of Data Consistency in Microservices Architecture

![dubbo-seata-distributed-transaction-best-practice](/imgs/blog/2023/8/apachecon-scripts/seata/img.png)

In 2019, during the Dubbo Ecosystem Meetup, we collected over 2,000 survey responses regarding the core issues developers are most concerned about in microservices architecture, with distributed transactions accounting for the largest share at 54%.

However, before Seata, it was commonly said that distributed transactions should be avoided, as eventual consistency addressed the issues. But after Seata became open-source, these problems were resolved. For me, the ultimate concern is data. Regardless of how the front-end business interacts, it ultimately boils down to data. If the business data is inconsistent, the underlying architecture is less meaningful, hence data is the core asset of an enterprise.

![dubbo-seata-distributed-transaction-best-practice](/imgs/blog/2023/8/apachecon-scripts/seata/img_1.png)

So what scenarios will encounter distributed transaction issues?

The first scenario is that after splitting into microservices, different services may be managed by different teams causing inconsistencies during service publishing. 

The second scenario involves unreliable or unstable infrastructure, which leads to network failures or individual host outages.

The third scenario is timeouts in distributed architectures, as service call timeouts raise questions about the execution of the business logic and data consistency.

The fourth scenario involves the integration of third-party components, such as caches and Redis, leading to consistency challenges.

The fifth scenario appears when the parameters passed between services are invalid, requiring the upstream service to reject the invalid input.

Overall, distributed transaction scenarios involve cross-database, cross-service, and resource diversity, with exceptions including business and system anomalies.

Is distributed transactions a problem unique to microservices architecture? Not really; it also exists in monolithic applications, although it is more pronounced in microservices.

In monolithic architecture, scenarios include modifying multiple databases or modules. Essentially, local transactions within a monolithic database can lead to distributed transaction issues when crossing local transaction boundaries.

Distributed transactions encompass extensive applications across both distributed and monolithic architectures.

![dubbo-seata-distributed-transaction-best-practice](/imgs/blog/2023/8/apachecon-scripts/seata/img_2.png)

There are six types of distributed transaction solutions available in the market:

- XA model, which has lower throughput and performance but the highest level of consistency.
- TCC and SAGA models, which represent business-level distributed transactions; they do not intercept data.
- Eventual consistency, which allows for decoupling and asynchronous operation but has rollback issues.
- Compensating scheduled tasks, which have low learning costs but high practical costs.
- AT model, which balances consistency and performance, is easy to learn but may have restrictions.

## 2. Architectural Evolution of Seata Distributed Transactions

![dubbo-seata-distributed-transaction-best-practice](/imgs/blog/2023/8/apachecon-scripts/seata/img_3.png)

Seata is internally codenamed TXC at Alibaba and DTX at Ant Financial. Its origin lies in the group’s Rainbow Stone project, which transitioned from monolithic to distributed architecture. TXC serves as a guarantee for service consistency. 

We deeply integrated with three key components in the group: the service invocation framework HSF, the TDDL component for database sharding, and MetaQ for asynchronous messaging. 

Currently, Seata is used widely with billions of daily calls and can handle around 100,000 TPS on a standard three-node cluster.

Our SLA offers availability and performance guarantees, ensuring that additional overhead for each transaction does not exceed specified limits. Transaction processing can reach millisecond levels, ensuring stability year-round.

![dubbo-seata-distributed-transaction-best-practice](/imgs/blog/2023/8/apachecon-scripts/seata/img_4.png)

Initially, we considered at which level to implement distributed transactions.

From an application architecture perspective, there are several layers, including the application development framework, service invocation framework (like Apache Dubbo), data middleware (ORM frameworks, transactions), and database connectivity (like JDBC).

We compared where to implement distributed transactions—at the DB level, data middleware level, or application framework level.

At the application framework level, consistency is relatively weak due to various uncontrolled factors, such as service invocation timeouts, which introduce uncertainty.

In the data middleware layer, consistency is better than in the application framework, though there can still be issues with concurrent transactions because it is not at the DB layer.

The best consistency is at the DB layer, but it is often vendor-specific. A significant challenge is coordinating data consistency across services. 

We designed the AT model to operate at the database middleware level while aligning with the application development framework.

The theoretical model was initially underdeveloped, so we extended existing models like Spring's transaction model to lower developers' learning costs.

Additionally, we defined how to establish consistency, whether across nodes or within business application data.

![dubbo-seata-distributed-transaction-best-practice](/imgs/blog/2023/8/apachecon-scripts/seata/img_5.png)

What is the model definition of distributed transactions? For example, during a bank transfer, if a network timeout occurs, it's uncertain whether the funds were deducted, which could lead to asset loss or damage to the company's reputation.

We often discuss distributed architecture, but not everything is inherently distributed. The totality of application architecture, including what today is called a distributed database, appears as integrated data storage. 

In a distributed architecture, each business node only has partial information, necessitating integrated solutions for troubleshooting. The core of distributed transactions is coordination, requiring global awareness.

This is where the Transaction Coordinator comes into play, acting as a third-party coordinator with a "God perspective." Resource Managers do the actual work, while Transaction Managers execute transaction actions along the business execution chain.

![dubbo-seata-distributed-transaction-best-practice](/imgs/blog/2023/8/apachecon-scripts/seata/img_6.png)

Seata went open-source in January 2019, starting with the AT model. By version 0.4, TCC was added to supplement compatibility with various databases. 

In version 0.9, we integrated the Saga transaction model to address long transaction scenarios. Version 1.1 introduced XA transaction models for clients using Seata's AT model needing a unified solution across diverse business transactions.

Ultimately, we developed a one-stop distributed transaction solution. Seata's versatility across different business scenarios has no equal in current distributed transaction solutions, addressing synchronization and asynchronous needs for diverse consistency requirements.

