<?php
	$seconds = 315360000; // 10 years
	$now = $expires = time();
	$filepath = $_GET[ "file" ];
	$expires += $seconds;

	if( eregi( "\.php", $filepath ) || eregi( "^http", $filepath ) )
		die( "no found!" );

	header( "Last-Modified: " . gmdate( 'D, d M Y H:i:s T', $now ) );
	header( "Expires: " . gmdate( 'D, d M Y H:i:s T', $expires ) );
	header( "Cache-Control: max-age=" . $seconds );

	if( eregi( "\.css", $filepath ) )
		header("Content-Type: text/css");
	else if(eregi("\.js", $filepath))
		header("Content-Type: text/javascript");
	else if(eregi("\.gif", $filepath))
		header("Content-Type: image/gif");
	else if(eregi("\.jpg", $filepath))
		header("Content-Type: image/jpeg");

	if( eregi( "gzip", $_SERVER[ "HTTP_ACCEPT_ENCODING" ] ) !== false &&
		is_file( $filepath . ".gz") ){
		$filepath = $filepath . ".gz";
		header( "Content-Encoding: gzip" );
	}

	readfile( $filepath );
?>