---
aliases:
  - /en/docs3-v2/dubbo-go-pixiu/user/httpfilter/saml/
  - /en/overview/reference/pixiu/other/user/httpfilter/saml/
  - /en/overview/mannual/dubbo-go-pixiu/user/httpfilter/saml/
description: SAML Introduction
linkTitle: SAML Introduction
title: SAML Introduction
type: docs
weight: 25
---

# SAML Auth Filter (dgp.filter.http.auth.saml)

---

## English

### Overview

The `dgp.filter.http.auth.saml` filter allows Pixiu to act as a SAML Service Provider (SP).

With this filter enabled, Pixiu can:

- expose SP metadata for IdP registration
- redirect unauthenticated browser requests to the IdP login page
- receive the SAML response on the ACS endpoint
- create a session cookie after a successful login
- forward selected SAML assertion attributes to upstream services as HTTP headers

Typical IdPs include Keycloak, Okta, and Microsoft Entra ID.

### Request Flow

1. A browser requests a protected Pixiu route such as `/app`.
2. Pixiu checks whether the request already carries a valid SAML session cookie.
3. If no valid session exists, Pixiu redirects the browser to the IdP login page.
4. After the user signs in, the IdP posts a `SAMLResponse` to Pixiu's ACS endpoint.
5. Pixiu validates the assertion, creates a session cookie, and redirects the browser back to the original route.
6. Later requests continue to the upstream service, with configured SAML attributes forwarded as headers.

### Minimal Configuration

```yaml
http_filters:
  - name: "dgp.filter.http.auth.saml"
    config:
      entity_id: "pixiu-saml-sp"
      acs_url: "https://pixiu.example.com/saml/acs"
      metadata_url: "https://pixiu.example.com/saml/metadata"
      idp_metadata_url: "https://idp.example.com/app/metadata"
      cert_file: "/etc/pixiu/saml/sp.crt"
      key_file: "/etc/pixiu/saml/sp.key"
      rules:
        - match:
            prefix: "/app"
      forward_attributes:
        - saml_attribute: "email"
          header: "X-User-Email"
        - saml_attribute: "displayName"
          header: "X-User-Name"
```

Instead of `idp_metadata_url`, you can load IdP metadata from a local file:

```yaml
idp_metadata_file: "/etc/pixiu/saml/idp-metadata.xml"
```

### Configuration Fields

- `entity_id`: SP entity ID advertised by Pixiu
- `acs_url`: Assertion Consumer Service endpoint that receives the `SAMLResponse`
- `metadata_url`: Pixiu SP metadata endpoint shared with the IdP administrator
- `idp_metadata_url`: URL used by Pixiu to fetch IdP metadata
- `idp_metadata_file`: local metadata file, used instead of `idp_metadata_url`
- `cert_file`: SP certificate file
- `key_file`: SP private key file
- `rules`: protected path prefixes that require SAML login
- `forward_attributes`: mapping from SAML assertion attributes to upstream HTTP headers
- `allow_idp_initiated`: development-focused escape hatch for local HTTP testing when browsers drop the request-tracking cookie on the cross-site ACS POST
- `err_msg`: custom local reply message for SAML auth failures

### Important Notes

- `acs_url` and `metadata_url` must use the same scheme and host.
- `metadata_url` is the SP metadata endpoint that the IdP imports.
- `idp_metadata_url` or `idp_metadata_file` is used by Pixiu to learn the IdP signing key and SSO endpoint.
- Pixiu removes client-supplied values for headers listed in `forward_attributes` before writing SAML-derived values.
- HTTPS is strongly recommended.

### Cookie and HTTPS Behavior

SAML SP-initiated login usually depends on a request-tracking cookie surviving the cross-site POST back from the IdP to the ACS endpoint.

- Under HTTPS, Pixiu uses `SameSite=None`, which allows the cookie to be sent on the cross-site ACS POST.
- Under plain HTTP development, browsers typically reject the combination needed for that flow, so Pixiu falls back to the browser default cookie policy.
- For local HTTP development, you may need `allow_idp_initiated: true` so the ACS flow can continue without relying on strict `InResponseTo` validation.

In some local HTTP browser environments, the first login may not return cleanly to the original route because the request-tracking cookie is dropped on the ACS POST. In that case, the session may already have been created successfully. Revisit `/app` to verify the login result when testing the local sample.

### Sample

A runnable sample is maintained in `dubbo-go-pixiu-samples` under `dubbogo/simple/saml`.
