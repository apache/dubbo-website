---
type: docs
title: "The Configuration Design"
linkTitle: "Configuration"
weight: 2
---


> http://javatar.iteye.com/blog/949527

Dubbo design is now completely unobtrusive, namely the user only depends on the configuration of contract.After multiple versions of the development, in order to meet the demand of various scenarios, configuration is more and more.In order to maintain compatibility with only grow, lurking inside all sorts of styles, convention, rules.The new version will also be configured for a adjustment, remove the dubbo, properties, instead of all the spring configuration.Will think of some written in this memo. 

## Classification of configuration

First of all, the purpose is to have a variety of configuration, which can be roughly divided into: 

0. Environment configuration, such as: the number of connections, the timeout configuration, etc. 
0. Describe the configuration, such as: service interface description, service version, etc.
0. Extension configuration, such as: protocol extension, strategy to expand, etc.

## Configuration format

Usually environment configuration, using the configuration properties will be more convenient, because is some simple discrete values, with the key - value configuration can reduce the learning cost configuration. 

Describe the configuration, information more often, and even have a hierarchy, using XML configuration would be more convenient, because the tree structure configuration expression was stronger.If very complex, and can also custom DSL as configuration.Sometimes such configuration can also use the Annotation instead of, because the configuration and related business logic, in the code is also reasonable.

Another extension configuration, which may be different.If only policy interface implementation class to replace, can consider the properties of the structure.If there is a complex life cycle management, may need to configure such as XML.Sometimes extended by registering interface provided. 

## Configuration is loaded 

For environment configuration, in the Java world, comparing to conventional approach, was agreed in a project under the classpath for the name of the configuration properties, such as: log4j. Properties, velocity. The properties and so on.Product during initialization, automatically from the classpath under loading the configuration.Our platform of many programs use a similar strategy, such as: dubbo. Properties, comsat. XML, etc.This has its advantages, is based on agreement, simplifies the user to configure the loading process of intervention.But also has its disadvantages, when the classpath is the same configuration, may be loaded by mistake, and when this isolation, may can't find the configuration, and, when the user wants to configure into the unified directory, not very convenient. 

Dubbo new version removes `dubbo.properties`, because the contract often conflicts configuration. 

And to describe the configuration, because want to participate in the business logic, usually embedded into the application of life cycle management.There are more and more using spring projects, directly using the spring configuration is common, and spring permits custom schema, configuration simplified is very convenient.Also has its disadvantages, of course, is strongly dependent on the spring, can ask programming interface to do the matching scheme

In Dubbo configuration is described, but also environment configuration.Part with spring schame configuration is loaded, in part, from the classpath scanning properties configuration is loaded.Users feel very inconvenient, so in the new version of the merged, unified into spring schame configuration load, also increases the flexibility of configuration.

Extension configuration, usually to the configuration of aggregate demand is higher.Because the product need to find the third party implementation, add it to the product inside.Agreed in the Java world, usually in a specified file each jar package down load, such as: the eclipse plugin. The XML, struts 2 struts - plugin. XML, and so on, this kind of configuration can consider Java standard service discovery mechanisms, namely in the jar meta-inf/services placed under the interface class name file, content is an implementation class name of the class in a row, like encryption algorithm in the JDK extension, the script engine extension, new JDBC driver, etc., are all in this way.see：[ServiceProvider Provider](https://docs.oracle.com/en/cloud/saas/financials/22a/fafcf/service-provider-models.html)。

Dubbo old version under each jar package through agreement, place called Dubbo - context. The spring configuration XML extensions and integration, the new version to use the JDK's own meta-inf/services, spring from too much dependence.

## Programmable configuration

Configuration of programmability is very necessary, no matter in what way you load the configuration file, should provide a programming way of configuration, allows the user to not using a configuration file, complete the configuration process with code directly.As a product, especially the component products, usually require collaboration use and other products, when a user integration of your product, may need adapter configuration mode.

Dubbo new version offers one-on-one configuration class with XML configuration, such as: ServiceConfig corresponding ` < Dubbo: service / > `, and one-to-one attributes, this configuration file configuration and programming the consistency of the understanding, reduce the learning cost.

## Configure the default 

Configuration of the default, usually set the reasonable value of a regular environment, thus reducing the user's configuration.Is generally recommended that in online environment for reference, the development environment can adapt by changing the configuration.The default Settings, had better be in the outermost configuration do processing load.The underlying program if found configuration is not correct, you should direct error, fault tolerance in the outermost layer.If, when the underlying program to use, found unreasonable configuration values, just fill a default value, it is easy to cover up the surface, and trigger a deeper problem.And configuration of the middle layer, probably don't know the underlying USES a default value, some may be failure in the middle of the testing conditions.Dubbo first appeared in this problem, the middle layer with "address" as the cache Key, and the bottom, to "address" a default port number, lead to don't add port number "address" and add the default port "address" did not use the same cache. 

## Configuration consistency 

Configuration is always implied some style or hidden rules, should as far as possible to keep its consistency.For example: a lot of functions have switch, and then have a configuration value： 

0. Whether to use the registry, the registry address. 
0. Whether to allow a retry, retries. 

You may agree:
 
0. Each is to configure a Boolean type of switch, to configure a value.
0. On behalf of the closed with an invalid values, N/A address 0 retries, etc. 

No matter which way, all the configuration items, should keep the same style, Dubbo selected is the second.Also, similar to that of timeout, retry time, timer interval.If a unit is second, another unit is milliseconds (C3P0 configuration item is) so, staff will be crazy. 

## Configuration coverage 

Provide configuration, want to consider developers, testers, piping, the system administrator.Testers can't modify the code, and test environment is likely to be more complex, need to have some set aside for testers "back door", can be modified in the peripheral configuration items.Like spring is accomplished configuration, support ` SYSTEM_PROPERTIES_MODE_OVERRIDE `, can through the JVM -d parameters, or like hosts agreed a cover configuration files, on the outside of the program, modify some configuration, easy to test.

 
Dubbo support through the JVM parameter ` - Dcom. XXX. XxxService = Dubbo: / / 10.1.1.1:1234` directly make the remote service call bypass registry, point to point test.There is a kind of situation, developers to increase the configuration, can according to the deployment of online configuration, such as: ` < dubbo: registry address = "${dubbo. Registry. Address}" / > ` because only one online registry, this configuration is no problem, and the testing environment may have two registry, testers can't to modify configuration, changed to: 
`<dubbo:registry address="${dubbo.registry.address1}" />`， 
`<dubbo:registry address="${dubbo.registry.address2}" />`，So this place, Dubbo support in the ${Dubbo. Registry. Address} value, through vertical dividing multiple registry addresses, used to represent a registry address.

## Configuration inheritance 

Configuration is also "duplicate code", there is also a "generalization and elaboration" problem.Such as: Dubbo timeout Settings, each service, and each method, should be can set the timeout.But a lot of service don't care about overtime, if required each method configuration, it is not realistic.So Dubbo adopted method inherit service timeout, overtime service timeout to inherit the default timeout, no configuration, opens up search.

Dubbo, moreover, the old version all the timeout, retries, load balancing strategies are only in the service consumer configuration.But in the process of actual use, found that the service provider knows better than consumer, but the configuration items are used in consumer.The new version, joined in the provider can match these parameters, through the registry to the consumer,As a reference, if there is no configuration, consumer to provide configuration shall prevail, the equivalent of consumption ji-cheng fang the provider's advice configuration values.And at the time of the relay configuration registry, can also be on the way to modify configuration, so that achieve the purpose of governance, the equivalent of inheritance relationship：Service consumers --> Registry --> Service provider 
Dubbo, moreover, the old version all the timeout, retries, load balancing strategies are only in the service consumer configuration.But in the process of actual use, found that the service provider knows better than consumer, but the configuration items are used in consumer.The new version, joined in the provider can match these parameters, through the registry to the consumer. 
 
![configuration-override](/imgs/dev/configuration-override.png)

## Configuration backward compatibility 

Forwards compatibility is very good, as long as you guarantee configuration only grow, basically can guarantee forwards compatibility.But backward compatibility, but also should pay attention to, to prepare for subsequent to join the new configuration items.If a special configuration in configuration, you should make an appointment a compatibility for the "special" case rules, because the special case, probably will happen later.For example, have a configuration file is save "service = address mapping", one of the special line, is saved "registry = address".Now application load time to define "registry" the Key is special, do special processing, the other is "service".New version found, however, to add a "monitoring center" = address, at this point, the old version of the program will handle "monitoring center" as a "service", because the old code can't be change, compatibility is will be very troublesome.If previously agreed upon in the "special" logo + XXX for special treatment, follow-up will be more convenient. 

Backward compatibility, can learn a lot from HTML5, refer to：[HTML5 design principle](http://javatar.iteye.com/blog/949390)
