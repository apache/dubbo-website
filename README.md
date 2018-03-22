# The Official Site for Apache Dubbo (incubating) [dubbo.incubator.apache.org](http://dubbo.incubator.apache.org)


The source code of website is hosted under the asf-site branch. Make sure you are working on asf-site barnch before publishing the site.

### Build the website

If you are running the first time, make sure you run

```sh
cd script
./bootstrap
```

To build the website locally

```sh
bundle exec jekyll build --config _config_build.yml
```


To start the server locally

```sh
cd script
./deploy
```

And you can visit the website via http://localhost:8000


### Publish the website

Make sure you have all the changed committed.

```sh
git push origin asf-site
```


