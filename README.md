# nim-finder

A web application to find name/nim of people in ITB. [http://azaky.github.io/nim-finder](http://azaky.github.io/nim-finder).

The data was crawled in April 2015 and has 13855 records, which means that there are 13855 students who take at least a class in the second semester of 2014/2015. Those data are stored in [Parse](http://parse.com).

The project structure is as follows.

- `crawler`, contains PHP script used to crawl data. Crawler is provided by [PHPCrawl](http://phpcrawl.cuab.de/).
- `data-processor`, converts raw crawled data to a nicer format (e.g. CSV).
- `parse`, contains the cloud code in the backend.
- `web`, the web application itself.
