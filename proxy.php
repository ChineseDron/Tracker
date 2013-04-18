<?PHP
    $url = $_GET[ "url" ];
    $callback = $_GET[ "callback" ];
    $timeConsum = -1;

    if( !preg_match( "/^\w+$/", $callback ) )
        die( "" );

    function get_url( $url ){
        global $timeConsum;
        $reg = "/^https?:\/\/[^\/].+$/";    
        if( !preg_match( $reg, $url ) )
            return "";
        $startTime = microtime( true );
        $content = file_get_contents( $url );
        $timeConsum = (int)( ( microtime( true ) - $startTime ) * 1000 );
        return $content;
    };

    $content = get_url( $url );
    $encode_content = json_encode( $content ); 

    if ( $content && $encode_content == "null" )
        $encode_content = json_encode( iconv( "GBK", "UTF-8", $content ) );

    $data = "{\"url\":\"" . $url . "\",\"content\":" . $encode_content . ",consum:" . $timeConsum . "}";

    $json = "document.$callback(" . $data . ");";

    header( "Content-Type: application/x-javascript" );
    echo $json;