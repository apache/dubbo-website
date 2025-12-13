---
aliases:
    - /zh/docs3-v2/dubbo-go-pixiu/user/start/
    - /zh-cn/docs3-v2/dubbo-go-pixiu/user/start/
    - /zh-cn/overview/reference/pixiu/other/user/start/
    - /zh-cn/overview/mannual/dubbo-go-pixiu/user/start/
description: 启动 dubbo-go-pixiu
linkTitle: 启动 dubbo-go-pixiu
title: 启动 dubbo-go-pixiu
type: docs
weight: 10
---

# Start

如何启动 dubbo-go-pixiu

#### 1 cd samples dir

```
cd samples/dubbo/simple
```

我们可以使用 start.sh 快速运行示例。如需更多信息，请执行以下命令获取帮助

```
./start.sh [action] [project]
./start.sh help
```

下面我们分步运行 body 示例

#### 2 准备配置文件和 docker 环境


prepare 命令会准备 dubbo-server 和 pixiu 的配置文件，并启动所需的 docker 容器

```
./start.sh prepare body
```

如果手动准备配置文件，请注意：

- 将 conf.yaml 中的 $PROJECT_DIR 修改为你电脑中的绝对路径

#### 3 启动 dubbo 或 http 服务器

```
./start.sh startServer body
```

#### 4 启动 pixiu

```
./start.sh startPixiu body
```

如果手动运行 pixiu，请使用以下命令

```
 go run cmd/pixiu/*.go gateway start -c /[absolute-path]/dubbo-go-pixiu/samples/dubbo/simple/body/pixiu/conf.yaml
```

#### 5. 尝试发送请求

使用 curl 尝试或运行单元测试

```bash
curl -X POST 'localhost:8881/api/v1/test-dubbo/user' -d '{"id":"0003","code":3,"name":"dubbogo","age":99}' --header 'Content-Type: application/json' 
./start.sh startTest body
```

#### 6. 清理

```
./start.sh clean body
```
