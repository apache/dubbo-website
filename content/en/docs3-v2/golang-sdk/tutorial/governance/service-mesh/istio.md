---
title: Deploy the Istio environment
type: docs
weight: 1
---

## 1. Preparations

- The docker, helm, and kubectl environments have been installed.
- dubbo-go cli tools and dependent tools have been installed

## 2. Deploy the Istio environment

1. Use helm to install istio base CRD and istiod components. You can also refer to [Istio Documentation](https://istio.io/) to install using istioctl.

```bash
$ helm repo add istio https://istio-release.storage.googleapis.com/charts
$ kubectl create namespace istio-system
$ helm install istio-base istio/base -n istio-system
$ helm install istiod istio/istiod --namespace istio-system
```

2. Delete istio horizontal expansion resource

   *Currently dubbo-go relies on a single istiod instance for service discovery.

```bash
$ kubectl delete hpa istiod -n istio-system
```

After the installation is complete, you can see an istiod pod running normally under the istio-system namespace.