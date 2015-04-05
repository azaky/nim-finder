<?php

// It may take a whils to crawl a site ...
set_time_limit(10000);

// Inculde the phpcrawl-mainclass
include("libs/PHPCrawler.class.php");

// Extend the class and override the handleDocumentInfo()-method
class MyCrawler extends PHPCrawler
{
    public $file_count = 0;

    function handleDocumentInfo($DocInfo)
    {
        // Just detect linebreak for output ("\n" in CLI-mode, otherwise "<br>").
        if (PHP_SAPI == "cli") $lb = "\n";
        else $lb = "<br />";

        // Print the URL and the HTTP-status-Code
        echo "Page requested: " . $DocInfo->url . " (" . $DocInfo->http_status_code . ")" . $lb;

        // Print the refering URL
        echo "Referer-page: " . $DocInfo->referer_url . $lb;

        // Print the content type
        echo "Content-type: " . $DocInfo->content_type . $lb;

        // Print if the content of the document was be recieved or not
        if ($DocInfo->received == true) {
            echo "Content received: " . $DocInfo->bytes_received . " bytes" . $lb;

            // Check if we are already in the "leaf"
            if (count($DocInfo->links_found) == 0) {
                echo "Current node is a leaf" . $lb;

                // Save it. We can get the name from the parsed url
                $url_parts = parse_url($DocInfo->url);
                parse_str($url_parts['query'], $query);

                if ($query['p']) {
                    $this->file_count++;
                    $p = $this->file_count . ".txt";
                    echo "Saving as " . $p . $lb;
                    file_put_contents('crawled/' . $p, $DocInfo->content);
                }
            }
        } else {
            echo "Content not received" . $lb;
        }


        echo $lb;

        flush();
    }
}

// Now, create a instance of your class, define the behaviour
// of the crawler (see class-reference for more options and details)
// and start the crawling-process.

$crawler = new MyCrawler();

// URL to crawl
$url = "https://six.akademik.itb.ac.id/publik/displayprodikelas.php?semester=1&tahun=2014&th_kur=2013";
$crawler->setURL($url);

// Only receive content of files with content-type "text/html"
$crawler->addContentTypeReceiveRule("#text/html#");

// Ignore links to pictures, dont even request pictures
$crawler->addURLFilterRule("#\.(jpg|jpeg|gif|png)$# i");

// Store and send cookie-data like a browser does
$crawler->enableCookieHandling(true);

// Set the traffic-limit to 1 MB (in bytes,
// for testing we dont want to "suck" the whole site)
//$crawler->setTrafficLimit(1000 * 1024);

// Thats enough, now here we go
$crawler->go();

// At the end, after the process is finished, we print a short
// report (see method getProcessReport() for more information)
$report = $crawler->getProcessReport();

if (PHP_SAPI == "cli") $lb = "\n";
else $lb = "<br />";

echo "Summary:" . $lb;
echo "Links followed: " . $report->links_followed . $lb;
echo "Documents received: " . $report->files_received . $lb;
echo "Bytes received: " . $report->bytes_received . " bytes" . $lb;
echo "Process runtime: " . $report->process_runtime . " sec" . $lb;
?>