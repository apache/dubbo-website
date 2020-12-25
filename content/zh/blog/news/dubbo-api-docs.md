---
title: "Dubbo-Api-Docs -- Apache Dubbo文档展示&测试工具"
linkTitle: "Dubbo-Api-Docs -- Apache Dubbo文档展示&测试工具"
date: 2020-12-22
description: >
  本文将向你介绍Dubbo-Api-Docs
---
# Dubbo-Api-Docs 
## 简介
Dubbo-Api-Docs 是一个展示dubbo接口文档,测试接口的工具. 参考了springfox的设计,通过增加一些描述接口及参数的注解,即可展示具备测试能力的接口文档.

Dubbo-Api-Docs 目前通过直连服务节点的方式获取该服务的接口列表. 测试接口时可以直连也可以通过注册中心.未来会增加通过注册中心获取服务列表的方式.并根据Dubbo的升级规划增加新的功能支持.也会根据社区的需求增加功能.

Dubbo-Api-Docs 会在服务提供者启动完毕后扫描docs相关注解并将处理结果缓存.并增加一些Dubbo-Api-Docs相关的Dubbo提供者接口. 缓存的数据在将来可能会放到Dubbo元数据中心中.

## 当前版本: 同Dubbo版本号
> 由于Dubbo-Api-Docs目前还处于测试阶段,并未发包到maven中央仓库,需要自行编译.编译方式同大部分java工程编译方式,此处就不赘述了,[源码仓库](#源码仓库)

```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-api-docs-annotations</artifactId>
    <version>${dubbo-version}</version>
</dependency>

<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-api-docs-core</artifactId>
    <version>${dubbo-version}</version>
</dependency>
```

## 快速入门
### 1.dubbo提供者项目的方法参数中加上 Dubbo-Api-Docs 注解
* 如果 dubbo提供者的接口和方法参数在一个单独的jar项目中,则在该项目中引入: dubbo-api-docs-annotations
* dubbo提供者项目引入 dubbo-api-docs-core
* 在提供者项目的项目启动类(标注了@SpringBootApplication的类)或者配制类(标注了@Configuration的类)中增加注解 @EnableDubboApiDocs 以启用Dubbo Api Docs功能
> 为避免增加生产环境中的资源占用, 建议单独创建一个配制类用于启用Dubbo-Api-Docs, 并配合 @Profile("dev") 注解使用
> 当然, Dubbo-Api-Docs 仅在项目启动时多消耗了点CPU资源, 并使用了一点点内存用于缓存, 将来会考虑将缓存中的内容放到元数据中心.

#### 下面以[dubbo-api-docs-examples](https://github.com/apache/dubbo-spi-extensions/tree/2.7.x/dubbo-api-docs/dubbo-api-docs-examples)项目中的部分服务接口为例:
```bash
git clone -b 2.7.x https://github.com/apache/dubbo-spi-extensions.git
```
进入dubbo-spi-extensions/dubbo-api-docs 目录,编译源码并安装到本地仓库:
```bash
mvn clean install -Dmaven.test.skip=true
```
进入 dubbo-spi-extensions/dubbo-api-docs/dubbo-api-docs-examples 目录

dubbo-api-docs-examples 中有两个子模块:
* examples-api: 一个jar包项目,其中包含服务的接口和接口参数Bean
* examples-provider: 提供者服务端,包含spring boot启动器和服务的实现

下面我们在这两个子模块中增加Dubbo-Api-Docs

> examples-api:

maven引入:
```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-api-docs-annotations</artifactId>
    <version>2.7.8-SNAPSHOT</version>
</dependency>
```
org.apache.dubbo.apidocs.examples.params 中有两个Bean,我们来为它们添加docs注解
* QuickStartRequestBean 作为参数Bean, 添加 @RequestParam
```java
public class QuickStartRequestBean {

  @RequestParam(value = "You name", required = true, description = "please enter your full name", example = "Zhang San")
  private String name;

  @RequestParam(value = "You age", defaultValue = "18")
  private int age;

  @RequestParam("Are you a main?")
  private boolean man;
  
  // getter/setter略...
}
```
* QuickStartRespBean 作为响应Bean,添加 @ResponseProperty
```java
public class QuickStartRespBean {

  @ResponseProperty(value = "Response code", example = "500")
  private int code;

  @ResponseProperty("Response message")
  private String msg;

  // getter/setter略...
}
```
由于我们只挑选了部分接口作为演示,到此这些接口涉及的docs注解添加完毕
> examples-provider:

maven引入:
```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-api-docs-core</artifactId>
    <version>2.7.8-SNAPSHOT</version>
</dependency>
```
我们挑选一个接口作为演示:

org.apache.dubbo.apidocs.examples.api.impl.QuickStartDemoImpl 中的 quickStart 方法

QuickStartDemoImpl 实现了 api包中的 org.apache.dubbo.apidocs.examples.api.IQuickStartDemo 接口 

* 在 QuickStartDemoImpl 中:
```java
@DubboService
@ApiModule(value = "quick start demo", apiInterface = IQuickStartDemo.class, version = "v0.1")
public class QuickStartDemoImpl implements IQuickStartDemo {

  @ApiDoc(value = "quick start demo", version = "v0.1", description = "this api is a quick start demo", responseClassDescription="A quick start response bean")
  @Override
  public QuickStartRespBean quickStart(@RequestParam(value = "strParam", required = true) String strParam, QuickStartRequestBean beanParam) {
    return new QuickStartRespBean(200, "hello " + beanParam.getName() + ", " + beanParam.toString());
  }
}
```
到此docs相关注解已添加完毕,下面我们来开启 Dubbo-Api-Docs. 新增一个配制类,位置任意,只要能被spring boot扫描到就行.

我们在 org.apache.dubbo.apidocs.examples.cfg 包中新增一个配制类 DubboDocConfig :
```java
@Configuration
@Profile("dev")  // 配合 Profile 一起使用, 在 profile 为 dev 时才会加载该配制类
@EnableDubboApiDocs  // 开启 Dubbo-Api-Docs
public class DubboDocConfig {
}
```
到此 Dubbo-Api-Docs 相关的东西已经添加完毕.
[dubbo-api-docs-examples](https://github.com/apache/dubbo-spi-extensions/tree/2.7.x/dubbo-api-docs/dubbo-api-docs-examples)
中有更多更为详尽的例子.下文中有注解的详细说明.下面我们来看一下增加 Dubbo-Api-Docs 后的效果图.
![demoApi2](/imgs/blog/api-docs/quickStart.png)


### 2.启动提供者项目
* 示例使用nacos作为注册中心,[下载并启动nacos](https://nacos.io)
* 在上面的例子中,我们启动 examples-provider 项目中的 org.apache.dubbo.apidocs.examples.ExampleApplication.
在examples-provider目录中:
```bash
mvn spring-boot:run
```



### 3.下载 dubbo-admin
[dubbo-admin仓库](https://github.com/apache/dubbo-admin) 

[下载地址](https://github.com/apache/dubbo-admin/releases)
> 目前dubb-admin也未发布包含Dubbo-Api-Docs的版本,需要下载源码启动
> ```bash
> git clone https://github.com/apache/dubbo-admin.git
> ```

### 4.启动访问 dubbo-admin
参考 dubbo-admin 里的说明启动:
```text
1. 在 dubbo-admin-server/src/main/resources/application.properties 中修改注册中心地址
2. 编译 mvn clean package
3. 启动: 
mvn --projects dubbo-admin-server spring-boot:run
或者
cd dubbo-admin-distribution/target; java -jar dubbo-admin-0.1.jar
4. 浏览器访问: http://localhost:8080
5. 默认帐号密码都是: root
```

### 5.进入"接口文档"模块
* 在"dubbo提供者IP"和"dubbo提供者端口"中分别输入提供者所在机器IP和端口, 点击右侧 " 加载接口列表" 按钮
* 左侧接口列表中加载出接口列表,点击任意接口,右边展示出该接口信息及参数表单.
* 填入表单内容后,点击最下方测试按钮
* 响应部分展示了响应示例及实际响应结果

## 源码仓库
Dubbo-Api-Docs 根据功能拆分,分别在两个仓库中:

### dubbo-spi-extensions 
> [dubbo-spi-extensions仓库地址](https://github.com/apache/dubbo-spi-extensions)

该仓库存放dubbo的一些非核心功能的扩展, Dubbo-Api-Docs 作为该仓库中的一个子模块,由于该仓库属于Dubbo 3.0中规划的一部分,而Dubbo-Api-Docs是基于Dubbo 2.7.x 开发的,所以在该仓库中增加了[2.7.x分支,Dubbo-Api-Docs就在该分支下](https://github.com/apache/dubbo-spi-extensions/tree/2.7.x/dubbo-api-docs).
该仓库中包含了 Dubbo-Api-Docs 的文档相关注解、注解扫描能力和使用示例:
* dubbo-api-docs-annotations: 文档生成的相关注解.考虑到实际情况中 dubbo api 的接口类和接口参数会规划为一个单独的jar包, 所以注解也独立为一个jar包.本文后面会对注解做详细说明.
* dubbo-api-docs-core: 负责解析注解,生成文档信息并缓存. 前面提到的Dubbo-Api-Docs相关接口也在该包中
* dubbo-api-docs-examples: 使用示例

### Dubbo-Admin
> [Dubbo-Admin仓库地址](https://github.com/KeRan213539/dubbo-admin)

文档的展示及测试放在了 dubbo admin 项目中

## 注解说明
* @EnableDubboApiDocs: 配制注解, 启用 dubbo api docs 功能
* @ApiModule: 类注解, dubbo接口模块信息,用于标注一个接口类模块的用途
    * value: 模块名称
    * apiInterface: 提供者实现的接口
    * version: 模块版本
* @ApiDoc: 方法注解, dubbo 接口信息,用于标注一个接口的用途
    * value: 接口名称
    * description: 接口描述(可使用html标签)
    * version: 接口版本
    * responseClassDescription: 响应的数据的描述
* @RequestParam: 类属性/方法参数注解,标注请求参数
    * value: 参数名
    * required: 是否必传参数
    * description: 参数描述
    * example: 参数示例
    * defaultValue: 参数默认值
    * allowableValues: 允许的值,设置该属性后界面上将对参数生成下拉列表
        * 注:使用该属性后将生成下拉选择框
        * boolean 类型的参数不用设置该属性,将默认生成 true/false 的下拉列表
        * 枚举类型的参数会自动生成下拉列表,如果不想开放全部的枚举值,可以单独设置此属性.
* @ResponseProperty: 类属性注解, 标注响应参数
    * value: 参数名
    * example: 示例

## 使用注意

* 响应bean(接口的返回类型)支持自定义泛型, 但只支持一个泛型占位符
* 关于Map的使用:Map的key只能用基本数据类型.如果Map的key不是基础数据类型,生成的 就不是标准json格式,会出异常
* 接口的同步/异步取自 org.apache.dubbo.config.annotation.Service#async / org.apache.dubbo.config.annotation.DubboService#async

## 示例说明
[dubbo-spi-extensions / Dubbo-Api-Docs](https://github.com/apache/dubbo-spi-extensions/tree/2.7.x/dubbo-api-docs) 中的 dubbo-api-docs-examples 目录中为示例工程:
* examples-api: jar包项目,包含服务提供者的接口类及参数Bean
* examples-provider: 使用 dubbo-spring-boot-starter 的提供者项目, 注册中心使用 nacos
* examples-provider-sca: 使用 spring-cloud-starter-dubbo 的提供者项目, 注册中心使用 nacos

### 示例使用步骤
1. 示例使用nacos作为注册中心,[下载并启动nacos](https://nacos.io)
2. 任意启动 examples-provider 和 examples-provider-sca 中的任意一个,当然也可以两个都启动. examples-provider 使用 20881端口 examples-provider-sca 使用20882端口.两个项目都是spring boot项目,启动类在 org.apache.dubbo.apidocs.examples 包下.
3. 启动 [Dubbo-Admin](https://github.com/KeRan213539/dubbo-admin), 浏览器访问: http://localhost:8080
4. 进入 dubbo-admin 中的 "接口文档"模块
5. 在"dubbo提供者IP"和"dubbo提供者端口"中分别输入提供者所在机器IP和端口, 点击右侧 " 加载接口列表" 按钮
6. 左侧接口列表中加载出接口列表,点击任意接口,右边展示出该接口信息及参数表单.
7. 填入表单内容后,点击最下方测试按钮
8. 响应部分展示了响应示例及实际响应结果
