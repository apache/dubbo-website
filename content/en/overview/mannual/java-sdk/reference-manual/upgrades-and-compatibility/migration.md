---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/protocol/triple/migration/
    - /en/docs3-v2/java-sdk/reference-manual/protocol/triple/migration/
    - /en/overview/mannual/java-sdk/reference-manual/upgrades-and-compatibility/migration/
description: "Upgrading from Dubbo2 to Dubbo3: covering upgrades for versions such as 2.6.x, 2.5.x, 2.7.x, etc."
linkTitle: Upgrade to Dubbo3
title: Upgrading from Dubbo2 to Dubbo3 (covering versions such as 2.5.x, 2.6.x, 2.7.x)
type: docs
weight: 1
---

Overall, the core capabilities after upgrading from Dubbo2 to Dubbo3 are compatible, and for over 90% of regular users (referring to users who have not made deep SPI extensions or source customizations), upgrading can be quite simple.

## Upgrading from 2.7.x to Dubbo3

### Step 1: Upgrade Core Dependencies

First, add the BOM dependency management in the application:

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo-dependencies-bom</artifactId>
            <version>3.3.0</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

If you previously used the `org.apache.dubbo:dubbo` dependency, please upgrade to the following version (if there are other Dubbo submodule dependencies in the project, upgrade their versions as well):

```xml
<dependency>
  <groupId>org.apache.dubbo</groupId>
  <artifactId>dubbo</artifactId>
</dependency>
```

If the previous application was Spring Boot, it is recommended to use the following starter dependency and upgrade to the latest version (if you previously did not use starters, please remove all old Dubbo module dependencies and directly use the following configuration):

```xml
<dependency>
  <groupId>org.apache.dubbo</groupId>
  <artifactId>dubbo-spring-boot-starter</artifactId>
</dependency>
```

{{% alert title="Upgrade Notes for Spring and Spring Boot related to Dubbo3" color="warning" %}}
Dubbo3 supports a wide range of compatible Spring and Spring Boot versions:
* It supports both Spring 3.x ~ Spring 5.x versions as well as Spring Boot 1.x ~ Spring Boot 2.x. If you encounter issues upgrading to higher versions of Spring or Spring Boot, you can remove the high-version Spring dependencies propagated by `dubbo-spring-boot-starter` or `dubbo`, and specify the acceptable Spring version dependencies for the project.
* Spring Boot 3.x and Spring 6 versions require JDK 17 or higher; please refer to the [Dubbo Spring Boot Manual]() for more details.
{{% /alert %}}

### Step 2: Upgrade Other Component Dependencies
1. Nacos Registry

    If you are using Nacos as the registry, ensure that the Nacos Server is upgraded to version 2.x before upgrading to Dubbo3. In addition to the Nacos Server, you also need to upgrade the Nacos Client dependency for the application.

    If it is a Spring Boot application, you can remove the nacos-client dependency and directly use the starter:

    ```xml
    <dependency>
      <groupId>org.apache.dubbo</groupId>
      <artifactId>dubbo-nacos-spring-boot-starter</artifactId>
    </dependency>
    ```

    If you are not currently using Spring Boot, simply update nacos-client to 2.x:

    ```xml
    <dependency>
      <groupId>com.alibaba</groupId>
      <artifactId>nacos-client</artifactId>
      <version>2.3.0</version>
    </dependency>
    ```

2. Zookeeper Registry

    If it is a Spring Boot application, you can remove the old Zookeeper-related dependencies and directly use the starter:

    ```xml
    <dependency>
      <groupId>org.apache.dubbo</groupId>
      <artifactId>dubbo-zookeeper-curator5-spring-boot-starter</artifactId>
    </dependency>
    ```

    Please note that the above `dubbo-zookeeper-curator5-spring-boot-starter` should be used with Zookeeper Server version 3.8.0 or higher. If you are currently using Zookeeper Server version 3.4.x, then use the following starter:

    ```xml
    <dependency>
      <groupId>org.apache.dubbo</groupId>
      <artifactId>dubbo-zookeeper-spring-boot-starter</artifactId>
    </dependency>
    ```

    If it is not a Spring Boot application, you can use the following dependencies (recommended, ensure Zookeeper Server 3.8.0 or above):

    ```xml
    <dependency>
      <groupId>org.apache.dubbo</groupId>
      <artifactId>dubbo-dependencies-zookeeper-curator5</artifactId>
    </dependency>
    ```

    Or (for Zookeeper Server 3.4.x users)

    ```xml
    <dependency>
      <groupId>org.apache.dubbo</groupId>
      <artifactId>dubbo-dependencies-zookeeper</artifactId>
    </dependency>
    ```

    {{% alert title="Zookeeper Upgrade Precautions" color="warning" %}}
    Please ensure that when managing the Zookeeper client dependencies in this way, you clean up any other zookeeper, curator dependencies in the project and fully adopt the versions provided by Dubbo.
    {{% /alert %}}

3. Other Component Upgrades

    In addition to the registry, if you are using other features of Dubbo and depend on third-party components to support these features, you need to upgrade the corresponding component versions based on specific circumstances to ensure that the components work with Dubbo3.

{{% alert title="Check Third-Party Component Versions" color="info" %}}
The goal is to confirm that the third-party dependencies in the project can work normally with Dubbo3 (maintain API compatibility). Typically, there aren't too many third-party component dependencies in Dubbo applications, so just confirm as needed. Additionally, you can refer to [Dubbo3 Version Dependencies]() to confirm suitable component versions.
{{% /alert %}}

### Step 3: Compatibility Checks
{{% alert title="Which Users Need Compatibility Checks" color="info" %}}
Most regular users can skip this section; typically, only users who have made deep customizations to Dubbo need to pay attention (SPI extensions or source customizations)! 
{{% /alert %}}

#### Checkpoint 1: Are there SPI extensions?

1. The following SPI extension points have been removed in Dubbo3; please take note if used:

    * Event Bus. Due to the complexity of event management, EventDispatcher and EventListener support has been removed in Dubbo 3.x. If there is an extension mechanism, consider refactoring to the corresponding Dubbo function extension.

2. The internal working mechanism of the following SPI extension points has been optimized and can be adjusted as needed:

    * Filter Interceptor Mechanism. You can intercept requests based on the Filter interceptor. In 2.7, this was supported after routing; in Dubbo3, a new `ClusterFilter` SPI definition has been added. Compared to the previous `Filter` extension point, `ClusterFilter` can significantly reduce memory usage, benefiting large-scale clusters.

If you have some consumer-side interceptors implemented based on Filter extensions and there is no strong binding logic to remote IP addresses, we recommend migrating the corresponding `org.apache.dubbo.rpc.Filter` SPI extension point to `org.apache.dubbo.rpc.cluster.filter.ClusterFilter`.

{{% alert title="Warning" color="info" %}}
`org.apache.dubbo.rpc.Filter` and `org.apache.dubbo.rpc.cluster.filter.ClusterFilter` are both supported in Dubbo3; ClusterFilter adaption can be adjusted as needed, and previous old Filter implementations will continue to be effective, so no need to worry.
{{% /alert %}}

#### Checkpoint 2: Is there source customization?
If the Dubbo framework you are using contains some private source customizations (modifications to Dubbo at runtime via javagent or asm also fall into this category), directly upgrading to the open-source Dubbo3 version may pose compatibility risks. For this kind of non-standard behavior, Dubbo cannot guarantee its previous compatibility. Users need to inspect all source modifications before upgrading and ensure that these modifications are compatible with the Dubbo3 version before going live.

> Such issues can be addressed with some bytecode-level tools, such as exporting the content of the process metaspace, filtering out all relevant Dubbo classes and calls, to identify the locations of direct dependencies or enhancements to the Dubbo framework's internal source in the business and secondary packages. Determine if these source calls still exist internally in Dubbo3 to decide the next upgrade steps.

### Step 4: Go Live Verification
1. Gray Release
There are no special restrictions on the release process for upgrading to Dubbo 3, and you can follow the normal business release.
Due to the cross-major version changes, try to release in as many batches as possible, while increasing the time interval between the first and second batch releases and ensuring adequate observation.
During the release process, we recommend upgrading the downstream of the application first (i.e., the service provider). After confirming that the service is functioning correctly, continue with subsequent releases.

2. Monitor Application Metrics
During the release process, the following metrics can be evaluated to determine if issues arise from the upgrade.

- CPU and memory usage of machines
- API request success rate
- API request response time (RT)
- Error messages in the logs
- Whether customized extension behaviors meet expectations

## Upgrading from 2.6.x and Below to Dubbo3

The following content is aimed at users of versions 2.6.x, 2.5.x, and below, to help understand how to upgrade to Dubbo3. For users of these versions, 80% can achieve a smooth upgrade by simply replacing dependencies; follow the steps below and ensure to perform the checks.

### Step 1: Upgrade Core Dependencies

First, you must upgrade the old `com.alibaba:dubbo` dependency coordinate to `org.apache.dubbo:dubbo`.

As shown, replace the `com.alibaba:dubbo` dependency

```xml
<dependency>
	<groupId>com.alibaba</groupId>
	<artifactId>dubbo</artifactId>
	<version>2.6.5</version>
</dependency>
```

with the `org.apache.dubbo:dubbo` dependency, and do not modify other configuration files, as shown below:

```xml
<properties>
    <dubbo.version>3.3.0</dubbo.version>
</properties>
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo-dependencies-bom</artifactId>
            <version>${dubbo.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<dependencies>
    <dependency>
        <groupId>org.apache.dubbo</groupId>
        <artifactId>dubbo</artifactId>
    </dependency>
</dependencies>
```

If you are using a Spring Boot application, you can also use `org.apache.dubbo:dubbo-spring-boot-starter` to replace the above `org.apache.dubbo:dubbo` dependency:

```xml
<dependencies>
    <dependency>
        <groupId>org.apache.dubbo</groupId>
        <artifactId>dubbo-spring-boot-starter</artifactId>
    </dependency>
</dependencies>
```

### Step 2: Upgrade Other Component Dependencies

You need to upgrade the registry (Nacos, Zookeeper, or others) and other third-party components; please refer to the detailed instructions for upgrading discussed in the previous section about Upgrading from 2.7.x to Dubbo3. The operations in both cases are exactly the same.

{{% alert title="Please Pay Attention to Third-Party Component Versions" color="info" %}}
* For many old users of Dubbo 2.6.x and below, the components (such as registries) used may be quite old. Carefully analyze all functionalities and core dependency components before upgrading to Dubbo3 to assess the target version for component upgrades.
* For some Zookeeper users, if the Zookeeper version is quite old, it is recommended to first upgrade the Zookeeper Server to version 3.8.x or higher, and then manage dependencies using Dubbo3's `dubbo-zookeeper-curator5-spring-boot-starter`, as described in the previous 2.7.x Upgrade section.
{{% /alert %}}

### Step 3: Compatibility Checks
If API or SPI extension-related compilation errors occur after upgrading dependencies, refer to the following. If your usage of Dubbo includes many SPI extension implementations, internal API calls, or changes to some core source code, focus on this part for compatibility checks.

#### Checkpoint 1: Package Name Changes
The biggest difference between Dubbo3 and versions 2.6.x and below is the changes in coordinates and package names:

1. Maven Coordinates GAV

**groupId changed from `com.alibaba` to `org.apache.dubbo`**

2. Package

**package prefix changed from `com.alibaba.dubbo.*` to `org.apache.dubbo.*`**

Upgrading Maven coordinates is straightforward; you only need to modify the relevant pom files. However, changes in packages may lead to compilation issues, but fortunately, Dubbo3 continues to support the majority of commonly used basic APIs and SPIs with compatibility for `com.alibaba.dubbo`, so theoretically upgrading the pom should still allow the project to compile successfully.

#### Checkpoint 2: API Programming Interface

- Annotations

| Annotation           | Recommended New Annotation    | Description                     |
| --------------------- | --------------------------- | ------------------------------- |
| @Reference            | @DubboReference             | Consumer service reference annotation |
| @Service              | @DubboService               | Provider service exposure annotation |
| @EnableDubbo          | @EnableDubbo                |                                 |
| Other commonly used Spring annotation APIs | Other commonly used Spring annotation APIs |                                 |

- Programming APIs

| API               | Description                          |
| ----------------- | ------------------------------------ |
| ReferenceConfig   | Service configuration collection and reference programming interface |
| ServiceConfig     | Service configuration collection and exposure programming interface |
| ApplicationConfig | Application configuration collection API |
| RegistryConfig    | Registry configuration collection API |
| ConsumerConfig    | Consumer default configuration collection API |
| ProviderConfig    | Provider default configuration collection API |
| ProtocolConfig    | RPC protocol configuration collection API |
| ArgumentConfig    | Service parameter-level configuration collection API |
| MethodConfig      | Service method-level configuration collection API |
| ModuleConfig      | Service governance Module configuration collection API |
| MonitorConfig     | Monitoring configuration collection API |
| RpcContext        | Programming context API              |

#### Checkpoint 3: SPI Extensions

If your company maintains a custom SPI extension library, be sure to ensure its compatibility with Dubbo3 before upgrading the business project to Dubbo3. If compatibility issues are found, it is recommended to complete the upgrade by adopting package name references (from `com.alibaba.dubbo.*` to `org.apache.dubbo.*`) and repackaging.

| SPI Extension Point | Description                                                    |
| ------------------- | -------------------------------------------------------------- |
| Registry            | Includes `RegistryFactory`, `Registry`, `RegistryService`, etc. |
| Protocol            | RPC protocol extension                                        |
| Serialization       | Serialization protocol extension                              |
| Cluster             | Fault tolerance strategies extension, such as Failover, Failfast, etc. |
| Loadbalance         | Load balancing strategy extension                             |
| Transporter         | Transport framework extensions, such as Netty                |
| Monitor             | Monitoring center extensions, including MonitorFactory, Monitor, MonitorService, etc. |
| Router              | Routing rule extensions                                       |
| Filter              | Interceptor extensions                                        |

### Step 4: Go Live Verification

Refer to the verification methods discussed in the previous section about Upgrading from 2.7.x to Dubbo3.

