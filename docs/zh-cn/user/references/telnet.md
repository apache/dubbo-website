# Telnet 命令参考手册

从 `2.0.5` 版本开始，dubbo 开始支持通过 telnet 命令来进行服务治理。

## 使用

```sh
telnet localhost 20880
```

或者：

```sh
echo status | nc -i 1 localhost 20880
```


status命令所检查的资源也可以扩展，参见：[扩展参考手册](../../dev/impls/status-checker.md)。

## 命令

以下展示了 dubbo 内建的 telnet 命令的说明和用法，此外，telnet 命令还支持用户自行扩展，参见：[Telnet 命令扩展](../../dev/impls/telnet-handler.md)。

### `ls`

0. `ls`: 显示服务列表
0. `ls -l`: 显示服务详细信息列表
0. `ls XxxService`: 显示服务的方法列表
0. `ls -l XxxService`: 显示服务的方法详细信息列表


### `ps`

0. `ps`: 显示服务端口列表
0. `ps -l`: 显示服务地址列表
0. `ps 20880`: 显示端口上的连接信息
0. `ps -l 20880`: 显示端口上的连接详细信息


### `cd`

0. `cd XxxService`: 改变缺省服务，当设置了缺省服务，凡是需要输入服务名作为参数的命令，都可以省略服务参数
0. `cd /`: 取消缺省服务

### `pwd`

`pwd`: 显示当前缺省服务

### `trace`

0. `trace XxxService`: 跟踪 1 次服务任意方法的调用情况
0. `trace XxxService 10`: 跟踪 10 次服务任意方法的调用情况
0. `trace XxxService xxxMethod`: 跟踪 1 次服务方法的调用情况
0. `trace XxxService xxxMethod 10`: 跟踪 10 次服务方法的调用情况

### `count`

0. `count XxxService`: 统计 1 次服务任意方法的调用情况
0. `count XxxService 10`: 统计 10 次服务任意方法的调用情况
0. `count XxxService xxxMethod`: 统计 1 次服务方法的调用情况
0. `count XxxService xxxMethod 10`: 统计 10 次服务方法的调用情况

### `invoke`

0. `invoke XxxService.xxxMethod({"prop": "value"})`: 调用服务的方法
0. `invoke xxxMethod({"prop": "value"})`: 调用服务的方法(自动查找包含此方法的服务)

### `status`

0. `status`: 显示汇总状态，该状态将汇总所有资源的状态，当全部 OK 时则显示 OK，只要有一个 ERROR 则显示 ERROR，只要有一个 WARN 则显示 WARN
0. `status -l`: 显示状态列表

### `log` [^1]

0. `log debug`: 修改 dubbo logger 的日志级别
0. `log 100`: 查看 file logger 的最后 100 字符的日志

### `help`

0. `help`: 显示 telnet 命帮助信息
0. `help xxx`: 显示xxx命令的详细帮助信息

### `clear`

0. `clear`: 清除屏幕上的内容
0. `clear 100`: 清除屏幕上的指定行数的内容

### `exit`

`exit`: 退出当前 telnet 命令行

[^1]: `2.0.6` 以上版本支持

## 相关参数说明

QoS提供了一些启动参数，来对启动进行配置，他们主要包括：

| 参数               | 说明              | 默认值 |
| ------------------ | ----------------- | ------ |
| qosEnable          | 是否启动QoS       | true   |
| qosPort            | 启动QoS绑定的端口 | 22222  |
| qosAcceptForeignIp | 是否允许远程访问  | false  |

> 注意，从2.6.4/2.7.0开始，qosAcceptForeignIp默认配置改为false，如果qosAcceptForeignIp设置为true，有可能带来安全风险，请仔细评估后再打开。

QoS参数可以通过如下方式进行配置

* 系统属性
* dubbo.properties
* XML方式
* Spring-boot自动装配方式

其中，上述方式的优先顺序为系统属性 > dubbo.properties > XML/Spring-boot自动装配方式。

### 使用系统属性方式进行配置

```
-Ddubbo.application.qos.enable=true
-Ddubbo.application.qos.port=33333
-Ddubbo.application.qos.accept.foreign.ip=false
```

### 使用dubbo.properties文件进行配置

在项目的`src/main/resources`目录下添加dubbo.properties文件，内容如下:
```
dubbo.application.qos.enable=true
dubbo.application.qos.port=33333
dubbo.application.qos.accept.foreign.ip=false
```

### 使用XML方法进行配置

如果要通过XML配置响应的QoS相关的参数，可以进行如下配置：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
       http://www.springframework.org/schema/beans/spring-beans.xsd
       http://dubbo.apache.org/schema/dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd">
  <dubbo:application name="demo-provider">
    <dubbo:parameter key="qos.enable" value="true"/>
    <dubbo:parameter key="qos.accept.foreign.ip" value="false"/>
    <dubbo:parameter key="qos.port" value="33333"/>
  </dubbo:application>
  <dubbo:registry address="multicast://224.5.6.7:1234"/>
  <dubbo:protocol name="dubbo" port="20880"/>
  <dubbo:service interface="org.apache.dubbo.demo.provider.DemoService" ref="demoService"/>
  <bean id="demoService" class="org.apache.dubbo.demo.provider.DemoServiceImpl"/>
</beans>
```

### 使用spring-boot自动装配方式配置

如果是spring-boot的应用，可以在`application.properties`或者`application.yml`上配置:

```
dubbo.application.qosEnable=true
dubbo.application.qosPort=33333
dubbo.application.qosAcceptForeignIp=false
```


