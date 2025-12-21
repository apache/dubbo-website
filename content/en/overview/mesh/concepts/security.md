---
description: Describes Dubbo authentication capabilities.
linkTitle: Security
title: Security
type: docs
weight: 2
---
> The service mesh is currently in an early experimental stage. Standard features will be gradually completed and supported.

## High-level architecture

The security architecture of Dubbo Service Mesh has two core components:

- **Identity**: every workload has an identity that represents who it is.
- **Authentication**: authentication policies define how services authenticate each other.

These components work together to provide security for your service mesh.

## Dubbo identities

In Dubbo Service Mesh, every workload has an identity that represents its origin. Identities are based on the SPIFFE standard and use SPIFFE URIs of the form: `spiffe://<trust-domain>/ns/<namespace>/sa/<service-account>`.

### Identity format

A Dubbo identity consists of:

- **Trust Domain**: defines the mesh or organizational boundary, defaulting to `cluster.local`.
- **Namespace**: the Kubernetes namespace.
- **Service Account**: the Kubernetes ServiceAccount.

For example, a workload running with ServiceAccount `bookinfo-productpage` in the `default` namespace has the identity:
`spiffe://cluster.local/ns/default/sa/bookinfo-productpage`

### Trust domain aliases

Dubbo Service Mesh supports trust domain aliases, allowing a mesh to trust workloads from multiple trust domains. This is useful in multi-cluster or multi-tenant scenarios. Using `TrustDomainAliases` in MeshConfig, the control plane expands identities across trust domains automatically.

## Identity and certificate management

Dubbo Service Mesh uses the SPIFFE standard to manage workload identities and certificates. Each workload automatically obtains a SPIFFE identity and can request an X.509 certificate for mutual TLS authentication.

### Certificate issuance

The Dubbo control plane includes a certificate authority (CA) that issues certificates for workloads. Workloads communicate with the control plane through the Dubbo Agent to request certificates and rotate them periodically.

### Certificate storage

Workload certificates are stored in the following locations inside the container:

- Certificate chain: `./etc/certs/cert-chain.pem` or `./var/run/secrets/workload-spiffe-uds/credentials/cert-chain.pem`
- Private key: `./etc/certs/key.pem` or `./var/run/secrets/workload-spiffe-uds/credentials/key.pem`
- Root certificate: `./etc/certs/root-cert.pem` or `./var/run/secrets/workload-spiffe-uds/credentials/root-cert.pem`

Certificates can be delivered to workloads via SDS (Secret Discovery Service) or mounted files.

## Authentication

Dubbo Service Mesh supports peer authentication (PeerAuthentication) for service-to-service authentication.

### Mutual TLS authentication

Mutual TLS is the primary mechanism for service-to-service authentication in Dubbo Service Mesh. It provides:

- **Strong service-to-service authentication**: built-in identity and credential management.
- **Secure by default**: service-to-service traffic is encrypted by default.
- **Automatic key management**: automatic key and certificate rotation.
- **Transparent encryption**: no changes required to application code.

#### Permissive mode

In permissive mode, a service accepts both plaintext and mTLS traffic. This is useful for gradually migrating to mTLS while still supporting legacy workloads.

#### Secure naming

Secure naming ensures that only workloads with the correct ServiceAccount can access a given service. Dubbo uses SPIFFE identities to validate service identities and guarantee that only authorized services can communicate with each other.

### Authentication architecture

The authentication architecture in Dubbo Service Mesh consists of:

- **Control plane**: `dubbod` manages authentication policies and certificates.
- **Data plane**: Dubbo Agent enforces authentication policies and handles TLS handshakes.
- **Policy storage**: authentication policies are stored as Kubernetes CRDs.

### Authentication policies

Authentication policies specify authentication requirements at mesh, namespace, or workload scope. Dubbo supports the PeerAuthentication policy to define service-to-service authentication requirements.

#### Policy storage

Authentication policies are stored as Kubernetes CRDs in the API server. The Dubbo control plane watches these resources and pushes policy changes to the data plane.

#### Selector field

PeerAuthentication policies can use the `selector` field to target specific workloads. If no selector is specified, the policy applies to the entire namespace or mesh.

#### Peer authentication

PeerAuthentication policies configure service-to-service authentication. They support the following mTLS modes:

- **STRICT**: only mTLS traffic is accepted.
- **PERMISSIVE**: both plaintext and mTLS traffic are accepted.
- **DISABLE**: mTLS is disabled.

The following example configures a PeerAuthentication policy that enforces STRICT mTLS for all services in the `default` namespace:

```yaml
apiVersion: security.dubbo.apache.org/v1
kind: PeerAuthentication
metadata:
  name: default
  namespace: default
spec:
  mtls:
    mode: STRICT
```

### Updating authentication policies

When you update authentication policies, the Dubbo control plane automatically pushes the new policies to the data plane. Policy changes take effect immediately without restarting workloads.

## Learn more

After understanding the basic concepts above, you can:

* Try authentication tasks using security policies.
* Learn about example security policies that can further harden your mesh.
* Read the FAQ to troubleshoot issues related to security policies.

## Related content

- [Quickstart](/en/overview/mesh/getting-started/)
- [Traffic management](/en/overview/mesh/concepts/traffic-management/)
- [Observability](/en/overview/mesh/concepts/observability/)

