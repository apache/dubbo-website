---
title: 如何安装 Protocol Buffer Compiler
linkTitle: Protoc安装
description: 如何安装 protocol buffer 编译器。
protoc-version: 3.15.8
toc_hide: true
type: docs
---

虽然不是强制性的，但 Apache Dubbo 支持使用 [Protocol Buffers (proto3版本)](https://protobuf.dev/programming-guides/proto3) 作为服务定义和序列化协议。

在 Protocol buffer 体系下，我们使用 `.proto` 文件定义服务和消息体格式，使用 `protoc` 编译器编译 `.proto` 文件，你可以使用以下几种方式安装 `protoc`。

### 使用包管理器安装

在 Linux 或 macOS 环境下，你可以使用包管理器安装 `protoc`。

{{% alert title="Warning" color="warning" %}}
**一定要注意检查所安装 `protoc` 的版本！** 检查方法如下文说述，因为有时一些包管理器安装的 `protoc` 版本是严重过时的。

下一节所展示的 [使用预先编译好的二进制文件安装](#binary-install) 可以确保你安装正确的 `protoc` 版本。
{{% /alert %}}

- Linux，使用 `apt` 或者 `apt-get`，比如：

  ```sh
  $ apt install -y protobuf-compiler
  $ protoc --version  # Ensure compiler version is 3+
  ```

- MacOS，使用 [Homebrew](https://brew.sh):

  ```sh
  $ brew install protobuf
  $ protoc --version  # Ensure compiler version is 3+
  ```

<a name="binary-install"></a>

### 使用预先编译好的二进制文件安装（适用任何操作系统）

参考以下步骤安装 [最新版本](https://protobuf.dev/downloads#release-packages) 的 protoc 二进制包：

 1. 根据你的操作系统类型，手动下载 [github.com/google/protobuf/releases](https://github.com/google/protobuf/releases) 二进制文件
    (`protoc-<version>-<os>-<arch>.zip`)，你也可以使用以下命令直接下载：

    ```sh
    $ PB_REL="https://github.com/protocolbuffers/protobuf/releases"
    $ curl -LO $PB_REL/download/v{{< param protoc-version >}}/protoc-{{< param protoc-version >}}-linux-x86_64.zip
    ```

 2. 将文件解压到`$HOME/.local` 目录，或者任意你想要的目录也可以。比如：

    ```sh
    $ unzip protoc-{{< param protoc-version >}}-linux-x86_64.zip -d $HOME/.local
    ```

 3. 修改系统 `PATH` 路径，将 `protoc` 加入可执行文件路径。比如：

    ```sh
    $ export PATH="$PATH:$HOME/.local/bin"
    ```

### 其他安装方法

如果你想要自行编译源码安装，或者想要安装老版本的二进制包。请参考 [下载 Protocol Buffers](https://protobuf.dev/downloads)

[download]: https://protobuf.dev/downloads
[github.com/google/protobuf/releases]: https://github.com/google/protobuf/releases
[Homebrew]: https://brew.sh
[latest release]: https://protobuf.dev/downloads#release-packages
[pb]: https://developers.google.com/protocol-buffers
[proto3]: https://protobuf.dev/programming-guides/proto3
