---
title: Using Routing Rules with Dubbo Admin
description: Choosing a Dubbo-go version and aligning the config center when condition and tag routing rules are published from Dubbo Admin
type: docs
weight: 2
---

When condition or tag routing rules are published from Dubbo Admin, whether they take effect in Dubbo-go depends on two things: whether your SDK version includes the relevant fixes, and whether Dubbo-go reads rules from the location Admin writes them to.

## Choosing a version

| Dubbo-go version | Condition rules below `configVersion` v3.1 | Tag rules |
|---|---|---|
| v3.3.0, v3.3.1 | `enabled` and `force` are parsed swapped; a missing `enabled` causes a panic | Rule not found on the first, uncached lookup |
| v3.3.2 | Same as above | Fixed |

- Tag routing: use v3.3.2 or later.
- Condition routing: rules with `configVersion: v3.1` are not affected by these issues. Both issues with older (v3.0) rules are fixed on `develop` (see [dubbo-go #3773](https://github.com/apache/dubbo-go/pull/3773) for the swapped flags), but not yet in a formal release. Until then, prefer the v3.1 rule format.

## Aligning the config center

Dubbo Admin and Dubbo-go must read and write the same location; connecting to the same config center is not enough.

**Nacos**: Admin uses the rule name as the data ID and writes to group `dubbo`. Set Dubbo-go's `config-center.group` to `dubbo` instead of the default `DEFAULT_GROUP`.

**ZooKeeper**: Admin writes rules to `/dubbo/config/<rule-name>`, while Dubbo-go reads `/dubbo/config/dubbo/<rule-name>` by default (see [dubbo-admin #1625](https://github.com/apache/dubbo-admin/issues/1625)). Configure it explicitly:

```yaml
dubbo:
  config-center:
    protocol: zookeeper
    address: 127.0.0.1:2181
    namespace: config
    params:
      dubbo.config-center.root-path: /dubbo
```

Rule name formats:

- Application-level condition rule: `<application>.condition-router`
- Service-level condition rule: `<interface>:<version>:<group>.condition-router`
- Tag rule: `<provider-application>.tag-router`

## Updating and deleting rules

Updating, disabling and deleting rules rely on config center watch events. Use these versions or later:

- `nacos-sdk-go/v2` v2.3.5
- `dubbogo/gost` v1.15.0

Older combinations, such as `nacos-sdk-go/v2` v2.2.5 with `gost` v1.14.5, may miss delete or update events. See [dubbo-go #3771](https://github.com/apache/dubbo-go/pull/3771) and [gost #155](https://github.com/dubbogo/gost/pull/155).

## Disabling tag rules

Older Admin versions omit the `enabled: false` field when disabling a tag rule, and Dubbo-go treats a missing `enabled` as `true`, so the rule stays active. [dubbo-admin #1595](https://github.com/apache/dubbo-admin/pull/1595) writes the field explicitly; make sure your Admin includes this fix.

## References

Regression tests and verification records are in [dubbo-go #3799](https://github.com/apache/dubbo-go/pull/3799).
