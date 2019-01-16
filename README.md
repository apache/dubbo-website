# Dubbo Official WebSite

This project keeps all sources used for building up dubbo official website which's served at http://dubbo.io or http://dubbo.apache.org.


## Prerequisite

Dubbo website is powered by [docsite](https://github.com/txd-team/docsite).
If your version of docsite is less then `1.3.3`, please upgrade to `1.3.3`.
Please also make sure your node version is 8.x, versions higher than 8.x is not supported by docsite yet.

## Build instruction

1. Run `npm install docsite -g` to install the dev tool.
2. Run `npm i` in the root directory to install the dependencies.
3. Run `docsite start` in the root directory to start a local server, you will see the website in 'http://127.0.0.1:8080'.
4. Run `docsite build` to build source code.
5. Verify your change locally: `python -m SimpleHTTPServer 8000`

## How to send a PR

1. Do not use `git add .` to commit all the changes.
2. Just push your changed files, such as:
    * `*.md`
	* blog.js or docs.js or site.js
3. Send a PR to asf-site branch.

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
