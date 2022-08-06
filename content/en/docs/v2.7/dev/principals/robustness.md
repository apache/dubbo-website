---
type: docs
title: "The Robustness Of The Design Implementation"
linkTitle: "Robustness"
weight: 7
---

Dubbo as a remote service exposure, calls and management solutions, through the meridians of the application is running, its itself to achieve robustness of importance is self-evident.

Here are some Dubbo principle and method of use.

## The log

Logging is one of the most commonly used way to find, discover problems. Log quality is often neglected, there is no log on using expressly agreed upon. Attaches great importance to the use of the Log, and improve the concentration of the Log information. Log too much, too much chaos, could lead to useful information.

To effectively use this tool to note:

### Record the contents of the stipulated strictly WARN, the ERROR level

* WARN that can restore the problem without human intervention.
* The ERROR says requires human intervention.

With such agreement, the regulatory system found in the ERROR log file of the string will call the police, and to minimize the occurrence. Excessive alarm can let a person tired, make the person lose vigilance in alarm, make the ERROR log. Along with artificial, regularly check the WARN level information to assess the degree of "subhealth" system.

### In the log, as much as possible to collect key information

What is the key information?

* Site information at the time of the problem, namely the screening questions to use information. Such as service invocation fails, to give the use of Dubbo version, the service provider's IP, which is used in the registry; Which service invocation, which method and so on. This information if not given, then later artificial collection, problem after the site may have already can't recover, increase the difficulty of the problem.
* If possible, the cause of the problem and the solution is given. This makes maintenance and problem solving becomes simple, rather than seeking savvy (often the implementer) for help.

### Don't duplicate records many times the same or a class of problems

The same or a kind of abnormal log continuous there dozens of times, still can often see.The human eye is easy to miss under the different important log information. Try to avoid this situation. Will appear in the foreseeable, it is necessary to add some logic to avoid.

As a symbol for a question, a problem after log Settings after sign and avoid a repeat of the log. The problem clear sign after recovery.

Although a bit troublesome, but do ensure log information concentration, the more effective for monitoring.

## Limit set

Resources are limited, CPU, memory, IO, etc. Don't cry because it is outside of the request, the data is not limited.

### The size of the thread pool (ExectorService) and saturated strategy

The Server end ExectorService set limit for processing requests. Use limited queue ExecutorService task waiting queue, avoid resource depletion. When the task waiting queue saturated, choose a suitable saturated strategy. This ensures smooth degradation.

In Dubbo, saturated strategy is to discard data, waiting for the result is only a request timeout.

Saturated, the specification has reached the maximum load, the service provider to logging in the operation of the saturated strategy of the problem, in order to monitor warnings. Remember to be careful not to repeat many times record well. (note that the default saturation strategy will not have these additional operation.) According to the frequency of the alarm, has decided to increase adjustment, etc., avoid system problems are ignored.

### The collection capacity

If to ensure element is controlled on the collection and is small enough, then you can rest assured use.This is most of the situation. If can't guarantee anything, use a bounded set. When reach the boundary, choose a suitable strategy.

## Fault tolerant - retry - recovery

High availability components to tolerate its dependence on the failure of the component.

### Dubbo service registry

The service registry using the database to store the information service providers and consumers. Different registry registry cluster through the database to synchronize data, to perceive other providers on the registry. Registry would ensure a provider and consumer data in memory, the database is unavailable, independent of the normal operation of foreign registry, just can't get other registry data. When the database recovery, retry logic will modify memory write data back to the database, and get a new database data.

### Service consumers

After the message service provider list from the registry, will save the provider list to memory and disk file. Consumers can function properly after this registry is down, even in the registry during outage restart consumers. Consumers started, find the registry is not available, will read the list stored in the disk file provider. Retry logic to ensure the registry after recovery, update the information.

## Retry delay strategy

On a bit of the subproblem. Dubbo encountered two related scenario.

### On the database lock

Registration center will regularly update the database of a record timestamp, such cluster other registry perceive it is alive. Overdue registry and its associated data will be cleared. Database is normal, the mechanism as well. But the database load is high, its every action is slow. This occurs:

A registry that B expired, delete B data. B find their data, to write their own data repeatedly. These repeated operation and increase load the database, deterioration.

Use the following logic:

When data is deleted B found themselves fail (write), choose to wait for this period of time and try again. Can choose to retry time exponentially, such as first class 1 minute, the second for 10 minutes, 100 minutes for the third time.
This decrease after operation, ensure database can cooling Down (Cool Down).

### The Client reconnection registry

When a registry downtime, other Client will receive events at the same time, and to reconnect to another registry. The Client number is relatively more, will be the impact of the registry. Avoid method can be a Client reconnection random delay for 3 minutes, when the reconnection spread out.
