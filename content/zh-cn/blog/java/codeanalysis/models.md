---
title: "Dubbo 3 中的三层配置隔离"
linkTitle: "配置隔离"
weight: 100
description: >-
     Dubbo 3 中的三层配置隔离
---

## Models提供的隔离

Dubbo目前提供了三个级别上的隔离：JVM级别、应用级别、服务(模块)级别，从而实现各个级别上的生命周期及配置信息的单独管理。这三个层次上的隔离由 FrameworkModel、ApplicationModel 和 ModuleModel 及它们对应的 Config 来完成。


![image](/imgs/blog/models.png)



* FrameworkModel ：Dubbo 框架的顶级模型，表示 Dubbo 框架的全局运行环境，适配多应用混合部署的场景，降低资源成本。

	如：假设我们有一个在线教育平台，平台下有多个租户，而我们希望使这些租户的服务部署在同一个 JVM 上以节省资源，但它们之间可能使用不同的注册中心、监控设施、协议等，因此我们可以为每个租户分配一个 FrameWorkModel 实例来实现这种隔离。

	FrameworkModel负责管理整个Dubbo框架的各种全局配置、元数据以及默认配置。



* ApplicationModel ：应用程序级别模型，表示一个 Dubbo 应用（通常为一个 SpringApplication）。适配单JVM多应用场景，通常结合热发布使用，降低热发布对整个应用的影响范围。

	如，以上的在线教育平台有多个子系统，如课程管理、学生管理，而每个子系统都是独立的 Spring 应用，在同个 JVM 中运行，共享一个 FrameworkModel，也会共享 Framework 级别的默认配置和资源：

	```java
	//课程管理应用
	@SpringBootApplication
	public class ClassApplication {
	    private static ApplicationModel classAppModel;
	    
	    public static void main(String[] args) {
	             classAppModel
	            .getApplicationConfigManager()
	            .addRegistry(new RegistryConfig(REGISTRY_URL_CLASS));
	        //...其它设置
	        SpringApplication.run(ClassApplication.class, args);
	    }
	    
	    public static void setApplicationModel(ApplicationModel classAppModel){
	        this.classAppModel = classAppModel;
	    }
	    
	}
	```

	```java
	//学生管理应用
	@SpringBootApplication
	public class StudentApplication {
	    
	    private static ApplicationModel studentAppModel;
	
	    public static void main(String[] args) {
	        studentAppModel
	            .getApplicationConfigManager()
	            .addRegistry(new RegistryConfig(REGISTRY_URL_STUDENT));
	        //...其它设置
	        SpringApplication.run(StudentApplication.class, args);
	    }
	    
	    public static void setApplicationModel(ApplicationModel studentAppModel){
	        this.studentAppModel = studentAppModel;
	    }
	   
	}
	```

	```java
	//单机发布多应用
	public class MultiContextLauncher {
	    
	    private static FrameworkModel frameworkModel  = new FrameworkModel();
	        
	    public static void main(String[] args) {
	        //使用同一个FrameworkModel
	        ClassApplication.setApplicationModel(frameworkModel.newApplication());
	        StudenAppication.setApplicationModel(frameworkModel.newApplication());
	        
	        new SpringApplicationBuilder(ClassApplication.class)
	                .run(args);
	        new SpringApplicationBuilder(StudentApplication.class.class)
	                .run(args);
	    }
	}
	```

	由此，我们可以重新部署单个应用与其对应的ApplicationModel，实现热发布，而不会影响到另一个应用。



* ModuleModel ：模块级别模型，表示应用下的子模块。适配一个应用下的多个模块（容器）。

	如，上述的课程管理子系统内，新增课程和发布课程两个业务模块可能使用不同的spring容器。我们可以为每个spirng容器提供一个ModuleModel实例来管理、隔离模块级别的配置和资源：

```java
@Configuration
@ComponentScan("com.example.demo.class")
public class ClassManageConfig {
    // 课程管理模块配置
}
```

```java
@Configuration
@ComponentScan("com.example.demo.student")
public class ClassPublishConfig {
    // 课程发布模块配置
}
```

```java
public class EducationPlatformApplication {
    public static void main(String[] args) {
        FrameworkModel frameworkModel = new FrameworkModel();
        ApplicationModel applicationModel = frameworkModel.newApplication();

        // 创建课程管理模块，使用自己的ApplicationContext与ModuleModel
        ModuleModel classManageModuleModel = applicationModel.newModule();
        AnnotationConfigApplicationContext classManageContext = new AnnotationConfigApplicationContext(classManageModuleModel);
        classManageContext.register(ClassManagementConfig.class);
        classManageContext.refresh();

        // 创建学生管理模块，使用自己的ApplicationContext与ModuleModel
        ModuleModel classPublishModuleModel = applicationModel.newModule();
        AnnotationConfigApplicationContext classPublishContext = new AnnotationConfigApplicationContext(classPublishModuleModel);
        classPublishContext.register(ClassPublishConfig.class);
        classPublishContext.refresh();
    }
}
```

三层的模型设计让Dubbo在处理复杂业务场景时具有更强的适应性和可扩展性。



​          以下是一个以传统方式（而非 DubboBootstrap）启动 Dubbo 的 Demo，可以帮助我们了解 FrameworkModel、ApplicationModel 和 ModuleModel 之间的组织关系。

```java
private static void startWithExportNew() throws InterruptedException {
        //创建三个层级的Model
        FrameworkModel frameworkModel = new FrameworkModel();
        ApplicationModel applicationModel = frameworkModel.newApplication();
        ModuleModel moduleModel = applicationModel.newModule();
        
        //提供配置中心、元数据中心、协议的配置
        RegistryConfig registryConfig = new RegistryConfig(REGISTRY_URL);
        MetadataReportConfig metadataReportConfig = new MetadataReportConfig(METADATA_REPORT_URL);
        ProtocolConfig protocolConfig = new ProtocolConfig(CommonConstants.DUBBO, -1);

        //如果之后需要获取注册中心或元数据中心，需要设置id，之后通过它们的Id获取（适配多注册中心）
        final String registryId = "registry-1";
        registryConfig.setId(registryId);

        //Model的配置管理通过对应的ConfigManager进行
        ConfigManager appConfigManager = applicationModel.getApplicationConfigManager();
        appConfigManager.setApplication(new ApplicationConfig("dubbo-demo-api-provider-app-1"));
        //提供应用层级的配置中心、元数据中心、协议默认设置
        appConfigManager.addRegistry(registryConfig);
        appConfigManager.addMetadataReport(metadataReportConfig);
        appConfigManager.addProtocol(protocolConfig);

        ModuleConfigManager moduleConfigManager = moduleModel.getConfigManager();
        moduleConfigManager.setModule(new ModuleConfig("dubbo-demo-api-provider-app-1-module-1"));


        ServiceConfig<DemoService> serviceConfig = new ServiceConfig<>();
        //设置该ServiceConfig对应的ModuleModel
        serviceConfig.setScopeModel(moduleModel);
        serviceConfig.setProtocol(protocolConfig);
        serviceConfig.setInterface(DemoService.class);
        serviceConfig.setRef(new DemoServiceImpl());
        //为ModuleModel添加ServiceConfig
        moduleConfigManager.addConfig(serviceConfig);

        serviceConfig.export();

        new CountDownLatch(1).await();
    }
```

* ApplicationModel 由 FrameWorkModel 创建，ModuleModel 由 ApplicationModel 创建，由此完成它们之间层级关系的引用。
* ServiceConfig 和 ReferenceConfig 需要设置其所属的 ScopeModel（实际只能为 ModuleModel ）。然后，还需将它们设置到对应的ModuleModel 中。






