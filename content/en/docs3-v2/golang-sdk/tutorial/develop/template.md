---
type: docs
title: "Apply Template"
weight: 1
---


## 1. Preparations

- dubbo-go cli tools and dependent tools have been installed

## 2. Use dubbogo-cli to create a project template

Run `dubbogo-cli newApp .`

```plain
$ mkdir cli-create-server
$ cd cli-create-server
$ dubbogo-cli newApp .
$ tree .
.
├── Makefile
├── api
│ └── api.proto
├──build
│ └── Dockerfile
├── chart
│ ├── app
│ │ ├── Chart.yaml
│ │ ├── templates
│ │ │ ├── _helpers.tpl
│ │ │ ├── deployment.yaml
│ │ │ ├── service.yaml
│ │ │ └── serviceaccount.yaml
│ │ └── values.yaml
│ └── nacos_env
│ ├── Chart.yaml
│ ├── templates
│ │ ├── _helpers.tpl
│ │ ├── deployment.yaml
│ │ └── service.yaml
│ └── values.yaml
├── cmd
│ └── app.go
├── conf
│ └── dubbogo.yaml
├── go.mod
├── go.sum
└── pkg
    └── service
        └── service.go
```

The generated project includes several directories:

- api: place interface files: proto file and generated pb.go file

- build: place build related files

- chart: place the chart package for publishing, the chart package of the basic environment: nacos, mesh (under development)

- cmd: program entry

- conf: framework configuration

- pkg/service: RPC service implementation

- Makefile:

    - Image, application name:

        - IMAGE = $(your_repo)/$(namespace)/$(image_name)
          TAG = 1.0.0

        - APPNAME = dubbo-go-app # For helm publishing, corresponding to chart name, application name and service name (service name)

    - Provide scripts such as:

        - make build # Package the image and push it

        - make buildx-publish # The arm architecture locally packs the amd64 image and pushes it, relying on docker buildx

        - make deploy # Publish the application through helm

        - make remove # Delete the published helm application

        - make proto-gen # generate pb.go file under api/