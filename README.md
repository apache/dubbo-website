# Dubbo Official Website
 
![CI Status](https://github.com/apache/dubbo-website/workflows/Website%20Deploy/badge.svg)

This project keeps all sources used for building up Dubbo official website which's served at https://dubbo.apache.org.

## Overview

The Apache Dubbo docs are built using [Hugo](https://gohugo.io/) with the [Docsy](https://docsy.dev) theme.
This project contains the hugo project, markdown files, and theme configurations.

## Pre-requisites

- [Hugo extended version](https://gohugo.io/getting-started/installing)
- [Node.js](https://nodejs.org/en/)

## Environment setup

1. Ensure pre-requisites are installed
2. Clone this repository
```sh
git clone https://github.com/apache/dubbo-website.git
```
3. Change to root directory: 
```sh
cd dubbo-website
```
4. Add Docsy submodule:
```sh
git submodule add https://github.com/google/docsy.git themes/docsy
```
5. Update submodules: 
```sh
git submodule update --init --recursive
```
6. Install npm packages: 
```sh
npm install
```

## Run local server
1. Run 
```sh
hugo server --disableFastRender
```
2. Navigate to `http://localhost:1313`

## Update docs
1. Create new branch
1. Commit and push changes to content
1. Submit pull request to **master** branch
1. Staging site will automatically get created and linked to PR to review and test
