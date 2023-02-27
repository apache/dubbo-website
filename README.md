# Dubbo Official Website
 
![CI Status](https://github.com/apache/dubbo-website/workflows/Website%20Deploy/badge.svg)

This project keeps all sources used for building up Dubbo official website which's served at https://dubbo.apache.org.

## Overview

The Apache Dubbo docs are built using [Hugo](https://gohugo.io/) with the [Docsy](https://docsy.dev) theme.

This project contains the markdown source files of the Dubbo documentation.

## Pre-requisites

- [Hugo extended version](https://gohugo.io/getting-started/installing)
- [Go](https://go.dev/learn/)
- [Node.js](https://nodejs.org/en/)

## Environment setup

You can directly start working on this repository even from your browser by just clicking on the following button

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/apache/dubbo-website)

Or, you can follow the manual steps given below.

1. Ensure pre-requisites are installed
2. Clone this repository
```sh
git clone https://github.com/apache/dubbo-website.git
```
3. Install `PostCSS` required by Docsy by running the following commands from the root directory of your project:

```sh
$ npm install --save-dev autoprefixer
$ npm install -D postcss
$ npm install --save-dev postcss-cli
```

## Run server locally
1. Clear up your local module cache
```sh
hugo mod clean
```

2. Start the server
```sh
hugo server --disableFastRender
# If you get stuck with 'hugo: downloading modules …' after running this command, please try to set GOPROXY by running `export GOPROXY="https://goproxy.cn|https://proxy.golang.com.cn"` and try again.
```

3. Navigate to `http://localhost:1313`

## Update docs
1. Create new branch
1. Commit and push changes to content
1. Submit pull request to **master** branch
1. Staging site will automatically get created and linked to PR to review and test
