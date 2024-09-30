---
aliases:
  - /en/overview/reference/admin/mock/
  - /en/overview/reference/admin/mock/
description: ""
linkTitle: Service Mock
no_list: true
title: Introduction to Admin Service Mock Functionality
type: docs
weight: 4
working_in_progress: true
---

The mock functionality is designed to enhance the efficiency of microservices development and testing. It can short circuit remote calls initiated by the consumer side and return pre-set mock values in advance, allowing the consumer to continue development and testing even when no provider is available. Additionally, mocking can be used for quickly simulating test data responsible for return values and simulating server exceptions.

It is important to note that the mock capability is limited to the testing environment and should be avoided in the production environment.

# Design Background
During cross-team or multi-application development, there are often situations where dependent services have not yet been finished, leading to process blockage and impacting development efficiency. To address this, Dubbo Admin provides mock capabilities to decouple dependencies between consumer and provider, ensuring that the consumer can continue testing even when the provider is not ready, thereby enhancing development efficiency.

The Dubbo framework itself has service degradation (sometimes referred to as mock) capabilities, which can be activated by configuring the `mock` field of `org.apache.dubbo.config.ReferenceConfig`, allowing it to be set to true or an implementation of the corresponding interface. This service degradation capability is primarily designed for production environments to manage traffic and degradation, although it can also be used in local development scenarios, its flexibility is limited. To fundamentally enhance development efficiency, we have designed a service degradation capability based on Admin.

The Dubbo Admin service mock is a lighter and more convenient implementation primarily used during the development and testing phases, aiming to enhance overall development efficiency in microservice scenarios. For details on requirements, see: [Dubbo Admin Mock Requirements](https://github.com/apache/dubbo-admin/issues/757).

## Architecture Design

![admin-mock-architecture.png](/imgs/v3/reference/admin/console/mock-architecture.png)

**Capabilities to Implement Mock in Dubbo Framework and Admin Side**

* Dubbo Admin
    * Rule Management
        * Add Rule
        * Query Rule
        * Modify Rule
        * Delete Rule
    * Request History
    * Query Mock Request Data
    * MockService Provider
        * Generate Mock Data According to Rules
        * Respond to Consumer Mock Requests
        * Save Requests and Returned Data
* Dubbo
    * Forward Requests to Admin Registered MockService Based on Mock Switch Configuration
    * Process Mock Return Values and Convert Them to Strongly Typed Data Matching Method Signatures

**Mock Request Principle Sequence Diagram**

![admin-mock-workflow.png](/imgs/v3/reference/admin/console/mock-workflow.png)

## Usage

1. Add dependencies in the Consumer application

    Before enabling Mock, make sure to include the following dependency in the consumer application:

    ```xml
    <dependency>
      <groupId>org.apache.dubbo.extensions</groupId>
      <artifactId>dubbo-mock-admin</artifactId>
      <version>${version}</version>
    </dependency>
    ```

    > Check [available versions of dubbo-mock-admin](/en/download/spi-extensions/)

2. Enable Mock by configuring `-Denable.dubbo.admin.mock=true` and restarting the process.
3. Open Admin to configure Mock rules

    Users can specify the consumer IP, service name, method, and specific mock behavior that needs to be mocked via the console to achieve mocked calling results.

    ![admin-mock](/imgs/v3/reference/admin/console/mock-rule-screenshot.png)

    Some Supported Rule Types and Examples

    ```
    Numeric Type: 123

    String: "hello, world!"

    Array, List: [1, 2, 3]

    Enum: "ENUM_TYPE"

    Map, Object:
      {
        "prop1": "value1",
        "prop2": ["a", "b", "c"]
      }

    null: null
    ```

4. At this point, when the consumer initiates a remote call again, it will receive the expected Mock return value.

    > Notes
    > 1. Mock is restricted to test and development environments, therefore to ensure the stability of core dependencies, the community has not packaged the mock component in the core framework package. Users can decide whether to promote it as a default dependency within their company.
    > 2. Even if the mock binary dependency is added, the mock function will not be enabled by default; it must be configured with `-Denable.dubbo.admin.mock=true` to be activated.

## Implementation Principles

Calls initiated by the consumer will be intercepted by the local MockServiceFilter. If the mock switch is enabled, the MockServiceFilter will forward the request to the MockService (provided by Dubbo Admin). The MockService will look up the user's preconfigured mock rules based on the requested service and method; if found, it will return the mock value from the rules, and the consumer will receive the mock value and return successfully.

### How are Mock Return Values Defined?

Currently, Admin supports inputting JSON or basic type data, such as:

* Returning numeric values (when the method signature returns a numeric type)

```
123
```

* Returning strings (when the method signature returns a string type)
```
"hello, world!"
```

* Returning JSON (when the method signature returns a Map or object type)
```
{
    "prop1": "value1",
    "prop2": ["a", "b", "c"]
}
```

* Returning arrays (when the method signature returns an array or list)
```
[1, 2, 3]
```

### How does the Consumer Initiate MockService Calls?

`dubbo-mock-admin` will introduce the MockServiceFilter request interceptor for the consumer. If the user opens the mock switch, the Filter will forward the request to the Admin MockService.

### How are Mock Values Converted to Primitive Type Values?

MockService supports returning standard JSON format or basic type data. The consumer will use Dubbo's built-in type converter to convert JSON values to primitive object types.

### Future Optimization Points
* Save the Mock switch to the configuration center, allowing users to dynamically control the switch through Admin.
* Enable MySQL database connection pooling.

### Table Structure Design
Admin relies on MySQL database to store user-configured mock rules. The specific table structure design is as follows.

#### Mock Rule

```sql
CREATE TABLE `mock_rule` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Primary Key',
  `service_name` varchar(255) DEFAULT NULL COMMENT 'Service Name',
  `method_name` varchar(255) DEFAULT NULL COMMENT 'Method Name',
  `rule` text NULL DEFAULT COMMENT 'Rule',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation Time',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update Time',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Service Mock Method Table';
```
#### Mock Log

```sql
CREATE TABLE `mock_log` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Primary Key ID',
  `method_id` int(11) DEFAULT NULL COMMENT 'Rule ID',
  `request` text COMMENT 'Request Data',
  `response` text COMMENT 'Return Value',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation Time',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update Time',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Mock Request Record Table';
```

