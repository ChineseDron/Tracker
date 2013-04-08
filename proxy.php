<?PHP
    $url = $_GET[ "url" ];
    $callback = $_GET[ "callback" ];

    if( !preg_match( "/^\w+$/", $callback ) )
        die( "" );

    function get_url( $url ){
        $reg = "/^https?:\/\/[^\/].+$/";    
        if( !preg_match( $reg, $url ) )
            return "";
        $content = file_get_contents( $url );
        return $content;
    };

    $content = get_url( $url );
    $encode_content = json_encode( $content ); 

    if ( $content && $encode_content == "null" )
        $encode_content = json_encode( iconv( "GBK", "UTF-8", $content ) );

    $data = "{\"url\":\"" . $url . "\",\"content\":" . $encode_content . "}";

    $json = "document.$callback(" . $data . ");";

    header( "Content-Type: application/x-javascript" );
    echo $json;