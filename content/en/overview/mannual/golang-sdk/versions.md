---
aliases:
  - /en/docs3-v2/golang-sdk/refer/compatible_version/
  - /en/docs3-v2/golang-sdk/refer/compatible_version/
  - /en/overview/mannual/golang-sdk/preface/refer/compatible_version/
description: Dependency compatibility version number
title: Version Information
type: docs
weight: 1
---

## Recommended Versions

The current website documentation targets the actively maintained Dubbo Go SDK 3.3.x line. If you are using a different
dubbo-go version, please check the corresponding historical documents and release notes.

|  Go  | Dubbo-go         | protoc-gen-go-triple                                                                  | Description                                      |
|:----:|------------------|---------------------------------------------------------------------------------------|--------------------------------------------------|
| 1.25 | v3.3.2-20260419  | <a href="https://github.com/apache/dubbo-go/tree/main/tools/protoc-gen-go-triple" target="_blank">bundled tool</a> | Current 3.3.2 dated tag, matching the main docs  |
| 1.24 | v3.3.1           | <a href="https://github.com/apache/dubbo-go/tree/main/tools/protoc-gen-go-triple" target="_blank">bundled tool</a> | Latest regular 3.3.x release, recommended for new projects |

{{% alert title="Note" color="primary" %}}
Use the latest patch release in the same 3.3.x line when possible. The generated Triple code should be produced by the
`protoc-gen-go-triple` tool shipped in the dubbo-go repository under `tools/protoc-gen-go-triple`.
{{% /alert %}}

{{% alert title="Historical note" color="secondary" %}}
Older 3.x releases may reference the former standalone `protoc-gen-go-triple` or `dubbogo-cli` repositories. Those
links are kept below as historical context for those versions. Current tooling lives in the dubbo-go repository under
`tools/`.
{{% /alert %}}

## Historical Versions

### 3.x

View documentation for earlier 3.x versions:

|  Go  | Dubbo-go     | protoc-gen-go-triple                                       | Description                                                                                                |
|:----:|--------------|------------------------------------------------------------|------------------------------------------------------------------------------------------------------------|
| 1.20 | v3.2.0-rc1   | [v3.0.0](https://github.com/dubbogo/protoc-gen-go-triple/) | Older release-candidate documentation; upgrade to the 3.3.x line for current features                      |
| 1.16 | v3.1.1       | [v3.0.0](https://github.com/dubbogo/protoc-gen-go-triple/) | Please refer to the README for instructions on generating service stub code compatible with older versions |
| 1.16 | v3.1.0       | [v3.0.0](https://github.com/dubbogo/protoc-gen-go-triple/) | Please refer to the README for instructions on generating service stub code compatible with older versions |
| 1.16 | v3.0.4       | [v3.0.0](https://github.com/dubbogo/protoc-gen-go-triple/) | Please refer to the README for instructions on generating service stub code compatible with older versions |
| 1.16 | v3.0.3       | [v3.0.0](https://github.com/dubbogo/protoc-gen-go-triple/) | Please refer to the README for instructions on generating service stub code compatible with older versions |
| 1.16 | v3.0.2       | [v3.0.0](https://github.com/dubbogo/protoc-gen-go-triple/) | Please refer to the README for instructions on generating service stub code compatible with older versions |
| 1.16 | v3.0.1       | [v3.0.0](https://github.com/dubbogo/protoc-gen-go-triple/) | Please refer to the README for instructions on generating service stub code compatible with older versions |
| 1.16 | v3.0.0       | [v1.0.5](https://github.com/dubbogo/dubbogo-cli)           | Historical CLI packaging before the tool was moved into the dubbo-go repository                            |
| 1.16 | v3.0.0-rc4-1 | [v1.0.2](https://github.com/dubbogo/dubbogo-cli)           | Historical CLI packaging before the tool was moved into the dubbo-go repository                            |
| 1.16 | v3.0.0-rc3   | [v1.0.0](https://github.com/dubbogo/dubbogo-cli)           | Historical CLI packaging before the tool was moved into the dubbo-go repository                            |

### 1.x

| Go | Dubbo-go | Triple | protoc-gen-go-triple | Description                                                    | 
|:--:|----------|--------|----------------------|----------------------------------------------------------------|
|    | v1.5.0   | v1.1.8 | v1.0.8               | No longer maintained, please upgrade to the latest 3.x version |
