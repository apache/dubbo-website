---
aliases:
    - /en/contact/contributor/test-coverage-guide_dev/
description: Test Coverage Guide
linkTitle: Test Coverage Guide
title: Test Coverage Guide
type: docs
weight: 7
---



### Benefits of Writing Unit Tests 
* Unit tests help everyone dive into the details of the code and understand its functionality.
* Through test cases, we can discover bugs and enhance the robustness of the code.
* Test cases also serve as demo usage of the code.
### Some Design Principles for Unit Test Cases 
* Steps, granularity, and combination conditions should be carefully designed.
* Pay attention to boundary conditions.
* Unit tests should also be well-designed; do not write useless code.
* When you find a `method` difficult to unit test, if it can be confirmed that this `method` is `smelly code`, then refactor it together with the developer.
* The mock framework used in Dubbo is: [mockito](http://site.mockito.org/). Below are some developer guides: [mockito tutorial](https://www.baeldung.com/bdd-mockito), [mockito refcard](https://dzone.com/refcardz/mockito)
* TDD (optional): When you start writing a new feature, you can try to write the test cases first. 
### Test Coverage Threshold
* At this stage, the test coverage threshold for Delta changes is: >=60%, the higher the better.
* We can see the test report on this page: https://codecov.io/gh/apache/dubbo
