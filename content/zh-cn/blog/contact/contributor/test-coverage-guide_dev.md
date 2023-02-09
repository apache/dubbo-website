---
type: docs
title: "测试覆盖率向导"
linkTitle: "测试覆盖率向导"
weight: 7
---

### 写单元测试的收益 
* 单元测试能帮助每个人深入代码细节，了解代码的功能。
* 通过测试用例我们能发现bug，并提交代码的健壮性。
* 测试用例同时也是代码的demo用法。
### 单元测试用例的一些设计原则 
* 应该精心设计好步骤，颗粒度和组合条件。
* 注意边界条件。
* 单元测试也应该好好设计，不要写无用的代码。
* 当你发现一个`方法`很难写单元测试时，如果可以确认这个`方法`是`臭代码`，那么就和开发者一起重构它。
* Dubbo中用的mock框架是: [mockito](http://site.mockito.org/). 下面是一些开发向导:[mockito tutorial](https://www.baeldung.com/bdd-mockito),[mockito refcard](https://dzone.com/refcardz/mockito)
* TDD（可选）：当你开始写一个新的功能时，你可以试着先写测试用例。 
### 测试覆盖率设定值
* 在现阶段，Delta更改代码的测试覆盖设定值为：>＝60%，越高越好。
* 我们可以在这个页面中看到测试报告: https://codecov.io/gh/apache/dubbo
