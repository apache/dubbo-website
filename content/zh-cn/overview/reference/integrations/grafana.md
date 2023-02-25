---
type: docs
title: "Grafana"
linkTitle: "Grafana"
description: "配置 Grafana 与 Dubbo 一起工作"
weight: 3
---
### Linux
下载项目至本地到切换指定项目
```bash
wget https://dl.grafana.com/oss/release/grafana-9.3.6-1.x86_64.rpm && yum install -y grafana-9.3.6-1.x86_64.rpm
```

启动服务
```bash
systemctl daemon-reload && systemctl enable --now grafana-server
```

访问页面

`http://localhost:3000` 默认用户名与密码为`admin`
![Grafana](/imgs/v3/reference/integrations/grafana.jpg)


### Kubernetes
下载项目至本地到切换指定项目
```bash
git clone https://github.com/apache/dubbo-admin.git && cd dubbo-admin/kubernetes/grafana
```

创建项目
```bash
kubectl create -f .
```

获取登录信息
```bash
kubectl get secrets grafana -o jsonpath="{.data.admin-user}" | base64 --decode ; echo && kubectl get secrets grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo
```
访问页面

`http://localhost:3000`
![Grafana](/imgs/v3/reference/integrations/grafana.jpg)