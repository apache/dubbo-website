---
type: docs
title: "The Devil Is In The Details"
linkTitle: "Details"
weight: 1
---

Recently, I have been worried about the quality of the Dubbo distributed service framework. If there are more maintenance personnel or changes, there will be a decline in quality. I am thinking, is there any need for everyone to abide by it, according to a habit when writing code, I have summarized it. The code process, especially the framework code, should always keep in mind the details. Maybe the following will be said, everyone will feel very simple, very basic, but always keep in mind. Considering these factors in every line of code requires a lot of patience. It is often said that the devil is in the details.

## Prevent null pointer dereference and index out of bounds

This is the exception I least like to see, especially in the core framework, in contrast I would like to see a parameter not legal exception with detail information. This is also a robust program developer who should be prevented in the subconscious by writing every line of code. Basically, you must be able to ensure that the code that is written once will not appear in the case of no test.

## Ensure thread safety and visibility

For framework developers, a deep understanding of thread safety and visibility is the most basic requirement. Developers are required to ensure that they are correct in the subconscious when writing each line of code. Because of this kind of code, it will look normal when doing functional tests under small concurrency. However, under high concurrency, there will be inexplicable problems, and the scene is difficult to reproduce, and it is extremely difficult to check.

## Fail fast and precondition

Fail fast should also become a subconscious mind, assert at the entrance when there are incoming parameters and state changes. An illegal value and state should be reported at the first time, rather than waiting until the time is needed. Because when it is time to use, other related states may have been modified before, and few people in the program handle the rollback logic. After this error, the internal state may be confusing, and it is easy to cause the program to be unrecoverable on a hidden branch.

## Separate reliable operation and unreliable operation
 
The reliability here is narrowly defined whether it will throw an exception or cause a state inconsistency. For example, writing a thread-safe Map can be considered reliable, but writing to a database can be considered unreliable. Developers must pay attention to its reliability when writing each line of code, divide it as much as possible in the code, and handle exceptions for failures, and provide clear logic for fault-tolerant, self-protection, automatic recovery or switching. The entry point ensures that the code that is subsequently added is not misplaced, and the original fault-tolerant processing is confusing.

## Safeguard against exceptions, but does not ignore exceptions

The exception defense mentioned here refers to the maximum tolerance of the code on the non-crucial path, including the bug on the program. For example, the version number of program is retrieved by scanning the Manifest and jar package names. This logic is auxiliary, but the code is quite a bit. Although the initial test works well but you should add a try-catch block to cover the whole getVersion() function, if something goes wrong then print error message and return the basic version. Because getVersion() may encounter exception for specific unknown scene, or other developers mistakenly modify the logic (usually they won't remove try-catch). Otherwise if it throws an exception, the main process will be interrupted which we don't want to see. It should be controlled properly, do not abuse try-catch, and do not eat the exception silently.

## Reduce scope of variable and use final liberally

If a class can be an Immutable Class, it is preferred to design it as an Immutable Class. The immutable class has natural concurrency advantages, reduce synchronization and replication, it can efficiently help analyze the scope of thread safety. Even if a mutable class, for references passed in from constructor then held internally, it is better to make this field final, so as not to be mistakenly modified. Don't assume that the field won't be reassigned if this field is private or this class is written by myself. One factor to consider is that this code may be modified by others. He may not aware your weak convention， and the Final is a invariant contract.

## Reduce misunderstanding when modifying, do not bury mine
 
It is repeatedly mentioned that the code being modified by the others, and this is something developers should keep in mind. This other person includes the future of yourself, you always have to think about this code, someone may change it. I should give the modified person a hint, let him know my current design intent, instead of adding hidden rules in the program, or bury some easily overlooked mines, such as: use null to indicate that it is not available, the size is equal to 0 means black list, this is a mine. The next modifier, including yourself, will not remember to have such an agreement, may later change some of the other bugs, accidentally changed to here, directly detonated the fault. For this example, one principle is to never distinguish between null references and null values.

## Improve code testability
The testability here mainly refers to the ease of Mock and the isolation of the test cases. As for the automation, repeatability, stability, disorder, completeness (full coverage), lightweight (fast execution) of the test, the general developer, plus the assist of tools such as JUnit can do it. Can also understand its benefits, just the matter of workload. Primary emphasis on unicity(only test the target class itself) and isolation(do not propagate failure). Nowadays there is too much emphasis on completeness, a lot of crossed and repeated test cases. It seems fine, but the more test code, the higher maintenance cost. A common problem is that modifying a line of code or adding an assertion causes more than 100 test cases to fail. It will cost a lot of time to fix these variance test cases. Over time, this test cases can't really reflect the current state of the code, and it will often be compromised to bypass. In the best case, modify a line of code, and only one line of test code does not pass. If the code is modified and the test case can still pass, that doesn't work, indicating that the scenario is not covered. In addition, Mockability is the basis of isolation, it hide the logic of indirect dependencies. One of the biggest killers of Mockability is the static method, which should be avoid as possible.
