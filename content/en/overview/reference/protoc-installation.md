---
title: How to Install Protocol Buffer Compiler
linkTitle: Protoc Installation
description: How to install the protocol buffer compiler.
protoc-version: 3.15.8
toc_hide: true
type: docs
---

Although not mandatory, Apache Dubbo supports using [Protocol Buffers (proto3)](https://protobuf.dev/programming-guides/proto3) for service definitions and serialization protocols.

Within the protocol buffer framework, we use `.proto` files to define services and message body formats, and the `protoc` compiler to compile `.proto` files. You can install `protoc` in the following ways.

### Installing via Package Manager

On Linux or macOS, you can use a package manager to install `protoc`.

{{% alert title="Warning" color="warning" %}}
**Be sure to check the installed version of `protoc`!** This can be done as described below, since some package managers might install severely outdated versions of `protoc`.

The [Binary Installation](#binary-install) method mentioned in the next section ensures that you install the correct version of `protoc`.
{{% /alert %}}

- Linux, using `apt` or `apt-get`, for example:

  ```sh
  $ apt install -y protobuf-compiler
  $ protoc --version  # Ensure compiler version is 3+
  ```

- macOS, using [Homebrew](https://brew.sh):

  ```sh
  $ brew install protobuf
  $ protoc --version  # Ensure compiler version is 3+
  ```

<a name="binary-install"></a>

### Binary Installation (for any OS)

Follow these steps to install the [latest version](https://protobuf.dev/downloads#release-packages) of the `protoc` binary package:

 1. Manually download the binary files for your OS from [github.com/google/protobuf/releases](https://github.com/google/protobuf/releases) 
    (`protoc-<version>-<os>-<arch>.zip`), or use the following commands to download directly:

    ```sh
    $ PB_REL="https://github.com/protocolbuffers/protobuf/releases"
    $ curl -LO $PB_REL/download/v{{< param protoc-version >}}/protoc-{{< param protoc-version >}}-linux-x86_64.zip
    ```

 2. Unzip the file to the `$HOME/.local` directory, or any directory of your choice. For example:

    ```sh
    $ unzip protoc-{{< param protoc-version >}}-linux-x86_64.zip -d $HOME/.local
    ```

 3. Modify the system `PATH` to include the `protoc` executable. For example:

    ```sh
    $ export PATH="$PATH:$HOME/.local/bin"
    ```

### Other Installation Methods

If you want to compile from the source yourself, or if you want to install an older version of the binary package, please refer to [Download Protocol Buffers](https://protobuf.dev/downloads)

[download]: https://protobuf.dev/downloads
[github.com/google/protobuf/releases]: https://github.com/google/protobuf/releases
[Homebrew]: https://brew.sh
[latest release]: https://protobuf.dev/downloads#release-packages
[pb]: https://developers.google.com/protocol-buffers
[proto3]: https://protobuf.dev/programming-guides/proto3

