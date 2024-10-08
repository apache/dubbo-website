---
aliases:
    - /en/docs3-v2/golang-sdk/tutorial/governance/service-mesh/istio/
    - /en/docs3-v2/golang-sdk/tutorial/governance/service-mesh/istio/
description: Deploying Istio Environment
title: Deploying Istio Environment
type: docs
weight: 1
---






## 1. Preparation

- Docker, Helm, and kubectl environments are installed.
- Dubbo-go CLI tools and dependencies are installed.

## 2. Deploy Istio Environment

1. Install the Istio base CRD and istiod components using Helm. You can also refer to the [Istio Documentation](https://istio.io/) for installation using istioctl.

```bash
$ helm repo add istio https://istio-release.storage.googleapis.com/charts
$ kubectl create namespace istio-system
$ helm install istio-base istio/base -n istio-system
$ helm install istiod istio/istiod --namespace istio-system
```

2. Delete the Istio horizontal pod autoscaler resources

   *Currently, Dubbo-go relies on a single istiod instance for service discovery.

```bash
$ kubectl delete hpa istiod -n istio-system
```

After installation, you can see an istiod pod running normally in the istio-system namespace.

