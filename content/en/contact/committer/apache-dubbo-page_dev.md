---
aliases:
    - /en/contact/committer/apache-dubbo-page_dev/
description: Maintenance of the official Dubbo homepage
linkTitle: Official Homepage
title: Maintenance of the official Dubbo homepage
type: docs
weight: 5
---




Apache has an official website to maintain information about all incubator projects. Each incubator project has an information page under this site. The information page for Dubbo is [https://incubator.apache.org/projects/dubbo.html](https://incubator.apache.org/projects/dubbo.html).

When significant changes occur in the project, such as the addition of new committers, the election of new PMC members, or new version releases, this update information needs to be maintained on this page.

The project address for this official website is [https://svn.apache.org/repos/asf/incubator/public/trunk](https://svn.apache.org/repos/asf/incubator/public/trunk).

The method to maintain this page is as follows:

1. Install SVN. If you are using Mac OS X or Linux, SVN is pre-installed. For Windows, please install SVN first.

2. Checkout this [project](https://svn.apache.org/repos/asf/incubator/public/trunk) using SVN.

3. Modify the content/projects/dubbo.xml file and save it.

4. Install ANT. Execute the build.sh or build.bat script in the trunk directory to build the project.

5. After the build is complete, you can open the target/site/projects/dubbo.html file in a browser to preview whether the modifications take effect.

6. Use the SVN commit command to submit the dubbo.xml file to the server, and do not submit the dubbo.html file (as the server will automatically build it on a schedule). This process will require you to input your Apache ID and password.

References:

1. http://incubator.apache.org/guides/website.html
2. https://svn.apache.org/repos/asf/incubator/public/trunk/README.txt
