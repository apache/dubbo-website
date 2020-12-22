---
type: docs
title: "dubbo:module"
linkTitle: "dubbo:module"
weight: 1 
description: "dubbo:module element"
---

Module configuration. The corresponding class `org.apache.dubbo.config.ModuleConfig`

| Property | The corresponding class | Type | Requisite | Default | Effect | Description | Compatibility |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| name | module | string | <b>Y</b> | | service governance | Module name is for registry combing the dependencies of modules. | above 2.2.0 |
| version | module.version | string | N | | service governance | module version | above 2.2.0 |
| owner | owner | string | N | | service governance | Module manager, Pls. fill in the mailbox prefix of the person in charge | above 2.2.0 |
| organization | organization | string | N | | service governance |Organization name is for registry distinguishing between the source of service. As a suggestion, this property should be written in config file directly. Such as china,intl,itu,crm,asc,dw,aliexpress etc. | above 2.2.0 |
