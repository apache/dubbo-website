# Dubbo Official Website

[![CI Status](https://github.com/apache/dubbo-website/workflows/CI/badge.svg?branch=master)](https://github.com/apache/dubbo-website/actions)

This project keeps all sources used for building up dubbo official website which's served at https://dubbo.apache.org.

## Prerequisite

Dubbo website is powered by [Mkdocs-material](https://github.com/squidfunk/mkdocs-material).  
If your version of Mkdocs is less than `1.1.2`, please upgrade to `1.1.2`.  
Please also make sure you have proper python version installed locally.  

## Build instruction
1. Install Mkdocs  

Check [here](https://www.mkdocs.org/) for details of how to install Mkdocs.
> As we have mkdocs-material source codes embedded inside our website, installation of Mkdocs-material is not required. 

2. Build the site  

Run `mkdocs build --config-file=mkdocs_en.yml` or `mkdocs build --config-file=mkdocs_zh.yml` to build .md files into static files.
> Building is only needed when you want to check the effects of your changes locally, you do not need to build before commit,
> commit the .md source files directly. Check [serve](https://www.mkdocs.org/) command for how to test changes quickly and on the fly.

## How to send a PR
1. Just push your changed files, such as:
    * `*.md`
	* blog.js or docs.js or site.js
2. Send a PR to **master** branch.

## SEO

Make sure each .md starts with the following texts:

```
---
title: title
keywords: keywords1,keywords2,keywords3
description: some description
---
```

Refer to [this blog](blog/zh-cn/how-to-involve-dubbo-community.md)
