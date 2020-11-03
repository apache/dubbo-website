# Public Agreement

This document is Dubbo public agreement, we expect all extension points comply with it.

## URL

* All extension points must include URL parameter, design URL as a context information which throughouts the whole extension point design system.
* URL standard style: `protocol://username:password@host:port/path?key=value&key=value`

## Logging

* Print `ERROR` log for unrecoverable and NEED TO ALARM situation.
* Print `WARN` log for recoverable exception or transient state inconsistency.
* Print `INFO` log for normally status.