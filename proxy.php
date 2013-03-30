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
    $content = str_replace( "\\", "\\\\", $content );
    $content = str_replace( "\r", "\\r", $content );
    $content = str_replace( "\n", "\\n", $content );
    $content = str_replace( "\t", "\\t", $content );
    $content = str_replace( "\"", "\\\"", $content );

    $json = "document.$callback({\"url\":\"$url\",\"content\":\"$content\"});";
    header( "Content-Type: application/x-javascript" );
    echo $json;