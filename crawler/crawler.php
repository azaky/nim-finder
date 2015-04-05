<?php

// It may take a whils to crawl a site ...
set_time_limit(10000);

// Inculde the phpcrawl-mainclass
include("libs/PHPCrawler.class.php");

// For linebreaks
if (PHP_SAPI == "cli") $lb = "\n";
else $lb = "<br />";

// Extend the class and override the handleDocumentInfo()-method
class MyCrawler extends PHPCrawler
{
    public $file_count = 0;
    public $code;

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
                    file_put_contents('crawled/' . $this->code . '/' . $p, $DocInfo->content);
                }
            }
        } else {
            echo "Content not received" . $lb;
        }


        echo $lb;

        flush();
    }
}

// the list of supported faculty codes
$codes = [
    // FMIPA
    "101", "102", "103", "105", "160",
    // SITH
    "104", "106", "112", "114", "115", "119", "161", "198",
    // SF
    "107", "116", "162",
    // FTTM
    "121", "122", "123", "125", "164",
    // FITB
    "120", "128", "129", "151", "163",
    // FTI
    "130", "133", "134", "144", "167",
    // STEI
    "132", "135", "165", "180", "181", "182", "183",
    // FTMD
    "131", "136", "137", "169",
    // FTSL
    "150", "153", "155", "157", "158", "166",
    // SAPPK
    "152", "154", "199",
    // FSRD
    "168", "170", "172", "173", "174", "175", "179",
    // SBM
    "190", "192", "197"
];

foreach ($codes as $code) {
    // Now, create a instance of your class, define the behaviour
    // of the crawler (see class-reference for more options and details)
    // and start the crawling-process.
    $crawler = new MyCrawler();
    $crawler->code = $code;
    $crawler->file_count = 0;

    // Create new directory special for this faculty
    if (!file_exists('crawled/' . $code)) {
        mkdir('crawled/' . $code, 0755, true);
    }

    // URL to crawl
    $url = "https://six.akademik.itb.ac.id/publik/daftarkelas.php?ps=". $code ."&semester=2&tahun=2014&th_kur=2013";
    $crawler->setURL($url);

    // Only receive content of files with content-type "text/html"
    $crawler->addContentTypeReceiveRule("#text/html#");

    // Ignore links to pictures, dont even request pictures
    $crawler->addURLFilterRule("#\.(jpg|jpeg|gif|png)$# i");

    // Don't let it back to the main page
    $res = $crawler->addURLFilterRule("#displayprodikelas.php# i");

    // Thats enough, now here we go
    $crawler->go();

    // At the end, after the process is finished, we print a short
    // report (see method getProcessReport() for more information)
    $report = $crawler->getProcessReport();

    echo "Summary for " . $code . ":" . $lb;
    echo "Links followed: " . $report->links_followed . $lb;
    echo "Documents received: " . $report->files_received . $lb;
    echo "Bytes received: " . $report->bytes_received . " bytes" . $lb;
    echo "Process runtime: " . $report->process_runtime . " sec" . $lb;
}
?>