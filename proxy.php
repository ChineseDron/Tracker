<?PHP
    error_reporting( 0 );
    $url = $_GET[ "url" ];
    $callback = $_GET[ "callback" ];
    $timeConsum = -1;

    if( !preg_match( "/^\w+$/", $callback ) )
        die( "" );

    if( !function_exists( "curl_init" ) )
        die( "server does not support curl." );

    if( !function_exists('getallheaders') ){ 
        function getallheaders(){ 
               $headers = ''; 
           foreach ($_SERVER as $name => $value) 
           { 
               if (substr($name, 0, 5) == 'HTTP_') 
               { 
                   $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value; 
               } 
           } 
           return $headers; 
        }
    }

    //Makes an HTTP request via cURL, using request data that was passed directly to this script.
    function makeRequest($url) {

        //Tell cURL to make the request using the brower's user-agent if there is one, or a fallback user-agent otherwise.
        $user_agent = $_SERVER["HTTP_USER_AGENT"];
        if (empty($user_agent)) {
            $user_agent = "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)";
        }
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_USERAGENT, $user_agent);

        //Proxy the browser's request headers.
        $browserRequestHeaders = getallheaders();
        //(...but let cURL set some of these headers on its own.)
        //TODO: The unset()s below assume that browsers' request headers
        //will use casing (capitalizations) that appear within them.
        unset($browserRequestHeaders["Host"]);
        unset($browserRequestHeaders["Content-Length"]);
        //Throw away the browser's Accept-Encoding header if any;
        //let cURL make the request using gzip if possible.
        unset($browserRequestHeaders["Accept-Encoding"]);
        curl_setopt($ch, CURLOPT_ENCODING, "");
        //Transform the associative array from getallheaders() into an
        //indexed array of header strings to be passed to cURL.
        $curlRequestHeaders = array();
        foreach ($browserRequestHeaders as $name => $value) {
        $curlRequestHeaders[] = $name . ": " . $value;
        }
        curl_setopt($ch, CURLOPT_HTTPHEADER, $curlRequestHeaders);

        //Proxy any received GET/POST/PUT data.
        switch ($_SERVER["REQUEST_METHOD"]) {
        case "GET":
          // $getData = array();
          // foreach ($_GET as $key => $value) {
          //     $getData[] = urlencode($key) . "=" . urlencode($value);
          // }
          // if (count($getData) > 0) $url .= "?" . implode("&", $getData);
        break;
        case "POST":
          curl_setopt($ch, CURLOPT_POST, true);
          //For some reason, $HTTP_RAW_POST_DATA isn't working as documented at
          //http://php.net/manual/en/reserved.variables.httprawpostdata.php
          //but the php://input method works. This is likely to be flaky
          //across different server environments.
          //More info here: http://stackoverflow.com/questions/8899239/http-raw-post-data-not-being-populated-after-upgrade-to-php-5-3
          curl_setopt($ch, CURLOPT_POSTFIELDS, file_get_contents("php://input"));
        break;
        case "PUT":
          curl_setopt($ch, CURLOPT_PUT, true);
          curl_setopt($ch, CURLOPT_INFILE, fopen("php://input"));
        break;
        }

        //Other cURL options.
        curl_setopt($ch, CURLOPT_HEADER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt ($ch, CURLOPT_FAILONERROR, true);

        //Set the request URL.
        curl_setopt($ch, CURLOPT_URL, $url);

        //Make the request.
        $response = curl_exec($ch);
        $responseInfo = curl_getinfo($ch);
        $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        curl_close($ch);

        //Setting CURLOPT_HEADER to true above forces the response headers and body
        //to be output together--separate them.
        $responseHeaders = substr($response, 0, $headerSize);
        $responseBody = substr($response, $headerSize);

        return array("headers" => $responseHeaders, "body" => $responseBody, "responseInfo" => $responseInfo);
    }

    function get_url( $url ){
        global $timeConsum;
        $reg = "/^https?:\/\/[^\/].+$/";    
        if( !preg_match( $reg, $url ) )
            return "";
        $startTime = microtime( true );
        // $content = file_get_contents( $url );
        
        $response = makeRequest( $url );
        // $rawResponseHeaders = $response[ "headers" ];
        $content = $response[ "body" ];

        $timeConsum = (int)( ( microtime( true ) - $startTime ) * 1000 );
        return $content;
    };

    $content = get_url( $url );
    $encode_content = json_encode( $content ); 

    if ( $content && $encode_content == "null" )
        $encode_content = json_encode( iconv( "GBK", "UTF-8", $content ) );

    $data = "{\"url\":\"" . $url . "\",\"content\":" . $encode_content . ",\"consum\":" . $timeConsum . "}";

    $json = "document.$callback(" . $data . ");";

    header( "Content-Type: application/x-javascript" );
    echo $json;