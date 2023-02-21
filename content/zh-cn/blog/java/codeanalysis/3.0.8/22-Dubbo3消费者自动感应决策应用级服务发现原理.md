---
title: "22-Dubbo3消费者自动感应决策应用级服务发现原理 "
linkTitle: "22-Dubbo3消费者自动感应决策应用级服务发现原理 "
date: 2022-08-22
author: 宋小生
tags: ["源码解析", "Java"]
description: >
    [Dubbo 3.0.8源码解析] Dubbo3消费者自动感应决策应用级服务发现原理 。
---

# 22-Dubbo3消费者自动感应决策应用级服务发现原理
## 22.1 简介
这里要说的内容对Dubbo2迁移到Dubbo3的应用比较有帮助，消费者应用级服务发现做了一些自动决策的逻辑来决定当前消费者是应用级发现还是接口级服务发现，这里与前面说的提供者双注册的原理是对等的，提供者默认同时进行应用级注册和接口级注册，消费者对提供者注册的数据来决定使用应用级发现或者接口级发现。这些都是默认的行为，当然对于消费者来说还可以自定义其他的迁移规则，具体的需要我们详细来看逻辑。

如果说对于迁移过程比较感兴趣可以直接去官网看文档相对来说还是比较清晰:[https://dubbo.apache.org/zh-cn/docs/migration/migration-service-discovery/](/zh-cn/docs/migration/migration-service-discovery/)

这里再借官网的图来用用，迁移过程主要如下所示：
第一个图是提供者双注册的图：
![在这里插入图片描述](/imgs/v3/migration/provider-registration.png)

第二个图是消费者订阅决策的图：
![在这里插入图片描述](/imgs/v3/migration/consumer-subscription.png)

第三个图就是精确到消费者订阅的代码层的逻辑了，消费者服务间调用通过一个Invoker类型对象来进行对象，如下图所示消费者代理对象通过创建一个迁移容错的调用器对象来对应用级或者接口级订阅进行适配如下所示
![在这里插入图片描述](/imgs/v3/migration/migration-cluster-invoker.png)

第二个图和第三个图是重点要关注的这一个文章的内容主要就是说这里的逻辑。

 关于代码位置如果不知道是如何调用到这一块逻辑的可以查看博文[《21-Dubbo3消费者引用服务入口》](https://blog.elastic.link/2022/07/10/dubbo/21-dubbo-xiao-fei-zhe-yin-yong-fu-wu-de-ru-kou/)

 这里直接将代码位置定位到：RegistryProtocol类型的interceptInvoker方法中：
 如下所示：

 RegistryProtocol类型的interceptInvoker方法
 ```java
 protected <T> Invoker<T> interceptInvoker(ClusterInvoker<T> invoker, URL url, URL consumerUrl) {
  //目前存在的扩展类型为RegistryProtocolListener监听器的实现类型MigrationRuleListener 
        List<RegistryProtocolListener> listeners = findRegistryProtocolListeners(url);
        if (CollectionUtils.isEmpty(listeners)) {
            return invoker;
        }

        for (RegistryProtocolListener listener : listeners) {
            listener.onRefer(this, invoker, consumerUrl, url);
        }
        return invoker;
    }
 ```

该方法尝试加载所有RegistryProtocolListener定义，这些定义通过与定义的交互来控制调用器的行为，然后使用这些侦听器更改MigrationInvoker的状态和行为。当前可用的监听器是MigrationRuleListener，用于通过动态变化的规则控制迁移行为。

## 22.2 MigrationRuleListener 类型的onRefer方法


直接来看代码：
```java
@Override
    public void onRefer(RegistryProtocol registryProtocol, ClusterInvoker<?> invoker, URL consumerUrl, URL registryURL) {
       //创建一个对应invoker对象的MigrationRuleHandler类型对象 然后将其存放在缓存Map<MigrationInvoker, MigrationRuleHandler>类型对象handles中
        MigrationRuleHandler<?> migrationRuleHandler = handlers.computeIfAbsent((MigrationInvoker<?>) invoker, _key -> {
            ((MigrationInvoker<?>) invoker).setMigrationRuleListener(this);
            return new MigrationRuleHandler<>((MigrationInvoker<?>) invoker, consumerUrl);
        });

      //迁移规则执行 rule是封装了迁移的配置规则的信息对应类型MigrationRule类型，在初始化对象的时候进行了配置初始化
        migrationRuleHandler.doMigrate(rule);
    }
```

关于这个igrationRule的文可以直接看官方的文档比较详细：[地址迁移规则说明](/zh-cn/docs/advanced/migration-invoker/#1-%E9%85%8D%E7%BD%AE%E4%B8%AD%E5%BF%83%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6%E4%B8%8B%E5%8F%91%E6%8E%A8%E8%8D%90)


这个迁移规则是为了更细粒度的迁移决策：
相关配置可以参考下面这个样例：
```yaml
key: 消费者应用名（必填）
step: 状态名（必填）
threshold: 决策阈值（默认1.0）
proportion: 灰度比例（默认100）
delay: 延迟决策时间（默认0）
force: 强制切换（默认 false）
interfaces: 接口粒度配置（可选）
  - serviceKey: 接口名（接口 + : + 版本号）（必填）
    threshold: 决策阈值
    proportion: 灰度比例
    delay: 延迟决策时间
    force: 强制切换
    step: 状态名（必填）
  - serviceKey: 接口名（接口 + : + 版本号）
    step: 状态名
applications: 应用粒度配置（可选）
  - serviceKey: 应用名（消费的上游应用名）（必填）
    threshold: 决策阈值
    proportion: 灰度比例
    delay: 延迟决策时间
    force: 强制切换
    step: 状态名（必填）
```

不过为了简单起见暂时先不详细说这个配置细节，我们继续往下看

## 22.3 迁移规则处理器执行迁移规则MigrationRuleHandler类型的doMigrate方法
### 22.3.1 迁移规则的模版方法：

MigrationRuleHandler类型的doMigrate方法代码如下：
```java
public synchronized void doMigrate(MigrationRule rule) {
        //默认情况下这个类型是MigrationInvoker
        if (migrationInvoker instanceof ServiceDiscoveryMigrationInvoker) {
            refreshInvoker(MigrationStep.FORCE_APPLICATION, 1.0f, rule);
            return;
        }

      //迁移步骤，MigrationStep 一共有3种枚举情况：FORCE_INTERFACE, APPLICATION_FIRST, FORCE_APPLICATION
        // initial step : APPLICATION_FIRST
        MigrationStep step = MigrationStep.APPLICATION_FIRST;
        float threshold = -1f;

        try {
            //获取配置的类型 默认走APPLICATION_FIRST
            step = rule.getStep(consumerURL);
            //threshold: 决策阈值（默认-1.0）计算与获取
            threshold = rule.getThreshold(consumerURL);
        } catch (Exception e) {
            logger.error("Failed to get step and threshold info from rule: " + rule, e);
        }
        //刷洗调用器对象 来进行决策服务发现模式
        if (refreshInvoker(step, threshold, rule)) {
            // refresh success, update rule
            setMigrationRule(rule);
        }
    }
```
### 22.3.2 服务发现调用器对象的选择（决策服务发现策略）

这里就是关键代码了：通过迁移配置和当前提供者注册信息来决定创建什么类型的调用器对象（Invoker)来为后续服务调用做准备

MigrationRuleHandler的refreshInvoker，注意默认情况下这个step参数为APPLICATION_FIRST

```java
 private boolean refreshInvoker(MigrationStep step, Float threshold, MigrationRule newRule) {
        if (step == null || threshold == null) {
            throw new IllegalStateException("Step or threshold of migration rule cannot be null");
        }
        MigrationStep originStep = currentStep;

        if ((currentStep == null || currentStep != step) || !currentThreshold.equals(threshold)) {
            boolean success = true;
            switch (step) {
                case APPLICATION_FIRST:
                    //默认和配置了应用级优先的服务发现则走这里
                    migrationInvoker.migrateToApplicationFirstInvoker(newRule);
                    break;
                case FORCE_APPLICATION:
                //配置了应用级服务发现则走这里
                    success = migrationInvoker.migrateToForceApplicationInvoker(newRule);
                    break;
                case FORCE_INTERFACE:
                //配置了接口级服务发现则走这里
                default:
                    success = migrationInvoker.migrateToForceInterfaceInvoker(newRule);
            }

            if (success) {
                setCurrentStepAndThreshold(step, threshold);
                logger.info("Succeed Migrated to " + step + " mode. Service Name: " + consumerURL.getDisplayServiceKey());
                report(step, originStep, "true");
            } else {
                // migrate failed, do not save new step and rule
                logger.warn("Migrate to " + step + " mode failed. Probably not satisfy the threshold you set "
                        + threshold + ". Please try re-publish configuration if you still after check.");
                report(step, originStep, "false");
            }

            return success;
        }
        // ignore if step is same with previous, will continue override rule for MigrationInvoker
        return true;
    }
```


可以看到这个代码做了判断的逻辑分别对应了Dubbo3消费者迁移的一个状态逻辑：
三种状态分别如下枚举类型：
当前共存在三种状态，
- FORCE_INTERFACE（强制接口级）
- APPLICATION_FIRST（应用级优先）
- FORCE_APPLICATION（强制应用级）

通过代码我们可以看到默认情况下都会走APPLICATION_FIRST（应用级优先）的策略，这里我们也重点来说 APPLICATION_FIRST（应用级优先）来看下Dubbo3是如何决策使用接口级还是应用级发现模型来兼容迁移的服务的。




 ### 22.3.3 应用级优先的服务发现规则逻辑
 这个规则就是智能选择应用级还是接口级的代码了，对应类型为MigrationInvoker的migrateToApplicationFirstInvoker方法，接下来我们详细看下：

 MigrationInvoker类型的migrateToApplicationFirstInvoker方法：
 ```java
 @Override
    public void migrateToApplicationFirstInvoker(MigrationRule newRule) {
        CountDownLatch latch = new CountDownLatch(0);
        //刷新接口级服务发现Invoker 
        refreshInterfaceInvoker(latch);
        //刷新应用级服务发现Invoker类型对象
        refreshServiceDiscoveryInvoker(latch);

        // directly calculate preferred invoker, will not wait until address notify
        // calculation will re-occurred when address notify later
        //计算当前使用应用级还是接口级服务发现的Invoker对象
        calcPreferredInvoker(newRule);
    }
 ```

### 22.3.4 刷新接口级服务发现Invoker 

MigrationInvoker类型的refreshInterfaceInvoker方法
```java
protected void refreshInterfaceInvoker(CountDownLatch latch) {
        clearListener(invoker);
        if (needRefresh(invoker)) {
            if (logger.isDebugEnabled()) {
                logger.debug("Re-subscribing interface addresses for interface " + type.getName());
            }

            if (invoker != null) {
                invoker.destroy();
            }
            invoker = registryProtocol.getInvoker(cluster, registry, type, url);
        }
        setListener(invoker, () -> {
            latch.countDown();
            if (reportService.hasReporter()) {
                reportService.reportConsumptionStatus(
                    reportService.createConsumptionReport(consumerUrl.getServiceInterface(), consumerUrl.getVersion(), consumerUrl.getGroup(), "interface"));
            }
            if (step == APPLICATION_FIRST) {
                calcPreferredInvoker(rule);
            }
        });
    }
```
### 22.3.5 刷新应用级服务发现Invoker类型对象
MigrationInvoker类型的refreshServiceDiscoveryInvoker方法
```java
protected void refreshServiceDiscoveryInvoker(CountDownLatch latch) {
        clearListener(serviceDiscoveryInvoker);
        if (needRefresh(serviceDiscoveryInvoker)) {
            if (logger.isDebugEnabled()) {
                logger.debug("Re-subscribing instance addresses, current interface " + type.getName());
            }

            if (serviceDiscoveryInvoker != null) {
                serviceDiscoveryInvoker.destroy();
            }
            serviceDiscoveryInvoker = registryProtocol.getServiceDiscoveryInvoker(cluster, registry, type, url);
        }
        setListener(serviceDiscoveryInvoker, () -> {
            latch.countDown();
            if (reportService.hasReporter()) {
                reportService.reportConsumptionStatus(
                    reportService.createConsumptionReport(consumerUrl.getServiceInterface(), consumerUrl.getVersion(), consumerUrl.getGroup(), "app"));
            }
            if (step == APPLICATION_FIRST) {
                calcPreferredInvoker(rule);
            }
        });
    }
```
### 22.3.6 计算当前使用应用级还是接口级服务发现的Invoker对象

MigrationInvoker类型的的calcPreferredInvoker方法

```java
private synchronized void calcPreferredInvoker(MigrationRule migrationRule) {
        if (serviceDiscoveryInvoker == null || invoker == null) {
            return;
        }
        Set<MigrationAddressComparator> detectors = ScopeModelUtil.getApplicationModel(consumerUrl == null ? null : consumerUrl.getScopeModel())
            .getExtensionLoader(MigrationAddressComparator.class).getSupportedExtensionInstances();
        if (CollectionUtils.isNotEmpty(detectors)) {
            // pick preferred invoker
            // the real invoker choice in invocation will be affected by promotion
            if (detectors.stream().allMatch(comparator -> comparator.shouldMigrate(serviceDiscoveryInvoker, invoker, migrationRule))) {
                this.currentAvailableInvoker = serviceDiscoveryInvoker;
            } else {
                this.currentAvailableInvoker = invoker;
            }
        }
    }
```

currentAvailableInvoker是后期服务调用使用的Invoker对象



 
原文地址：[22-Dubbo3消费者自动感应决策应用级服务发现原理](https://blog.elastic.link/2022/07/10/dubbo/22-dubbo3-xiao-fei-zhe-zi-dong-gan-ying-jue-ce-ying-yong-ji-fu-wu-fa-xian-yuan-li/)