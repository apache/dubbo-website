---
type: docs
title: "Apache Official Dubbo Page Maintenance"
linkTitle: "Official Page"
weight: 5
---

Apache has an official website that maintains information about all incubation projects. 
Each incubation project has an information page under this website. 
Dubbo's information page address is https://incubator.apache.org/projects/dubbo.html.

When the project has undergone major changes, such as the addition of a new committer, 
the election of a new PMC, or a new version of Release, etc, these updates need to be maintained on this page.
The project address for this official website is 
https://svn.apache.org/repos/asf/incubator/public/trunk.

Here's how to maintain this page:

1. Install the SVN. If it is a Mac OS X system or a Linux system, it comes with SVN. If it is a Windows system, 
please install SVN first.
2. Check out the [project](https://svn.apache.org/repos/asf/incubator/public/trunk) with SVN.
3. Modify the content/projects/dubbo.xml file and save it.
4. Install ANT. And execute the ant command in the trunk directory to build.
5. After the build is complete, open the target/site/projects/dubbo.html file with your browser to see if the changes take effect.
6. Use the commit command of SVN to submit the dubbo.xml file to the server, and do not submit the dubbo.html file 
(because the server will automatically build it at regular intervals).
This process will ask for the Apache id and password.

References:

1. http://incubator.apache.org/guides/website.html
2. https://svn.apache.org/repos/asf/incubator/public/trunk/README.txt
