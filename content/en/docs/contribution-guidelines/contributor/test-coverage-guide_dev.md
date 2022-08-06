---
type: docs
title: "Test Coverage Guide"
linkTitle: "Test Coverage"
weight: 7
---

### The benefits of unit testing 

  * Unit test code can help everyone to go into details and understand the function of the code.
  * We can find bugs by test case, and then enhance the robustness of the code.
  * Test case code is also the demo usage of the core code.
  
### Some design principle of unit test case 

  * Steps, fine-grained and combination conditions should be well designed.
  * Attention to boundary condition test
  * Test code should also be designed without writing useless code.
  * When you find a `method` that is hard to write unit test, if you can be sure the `method` is "smelly code", then  refactor it with the committer.
  * The mock framework in dubbo is: [mockito](http://site.mockito.org/). Some tutorials:[mockito tutorial](https://www.baeldung.com/bdd-mockito),[mockito refcard](https://dzone.com/refcardz/mockito)
  * TDD（optional）：When you start a new issue, you can try to write test case at first 
  
### The specified value of the test coverage

  * In the stage, the test coverage specified value of delta changed codes is ：>=60%. The higher, the better.
  * We can see the coverage report in this page: https://codecov.io/gh/apache/dubbo
