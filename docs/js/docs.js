$( function(){
    var randomNumber = function( num ){
        return Math.floor( Math.random() * num );
    };

    var randomWord = function(){
        var cw = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        return function( length ){
            var re = [];
            for( var i = 0; i < length; i ++ )
                re[ i ] = cw.charAt( randomNumber( cw.length ));
            return re.join( "" );
        }
    }();

    var loadChangelog = function(){
        var data;
        return function(){
            if( !data ) $.get( "./changelog.json", function( json ){
                data = json;
                data.forEach( function( item ){
                    $changelogTable.append( "<tr><td>" + item.version + "</td><td>" + 
                        item.description + "</td></tr>" );
                } );
            } );  
        };
    }();

    var param = function( url, name, value ){
        var spliter, suffix;

        spliter = ~url.indexOf( "?" ) ? "&" : "?";
        suffix = name + "=" + value;

        return url + spliter + suffix;
    };

    var openShareLink = function(){
        var url, left, top;

        url = "http://service.weibo.com/share/share.php";
        url = param( url, "title", "%40dron%E5%BE%AE%E5%8D%9A%20%E6%88%91%E6%AD%A3%E5%9C%A8%E4%BD%BF%E7%94%A8%20Tracker%20%E6%8E%92%E6%9F%A5%E7%BD%91%E9%A1%B5%E4%B8%AD%E5%86%97%E4%BD%99%E7%9A%84%E8%84%9A%E6%9C%AC%EF%BC%8C%E6%8C%BA%E7%BB%99%E5%8A%9B%E7%9A%84%EF%BC%8C%E5%85%8D%E5%AE%89%E8%A3%85%EF%BC%8C%E7%9B%B4%E6%8E%A5%E5%9C%A8%E6%B5%8F%E8%A7%88%E5%99%A8%E4%B8%AD%E5%B0%B1%E8%83%BD%E7%94%A8%EF%BC%8C%E6%8E%A8%E8%8D%90%E5%A4%A7%E5%AE%B6%E8%AF%95%E8%AF%95%E3%80%82" );
        url = param( url, "url", encodeURIComponent( "http://ucren.com/tracker/" ) );

        left = ( screen.width - 680 ) / 2;
        top = ( screen.height - 380 ) / 2;

        window.open( url, "", "width=680, height=380, left=" + left + ", top=" + top + 
                            ", toolbar=no, menubar=no, resizable=yes, status=no, " +
                            "location=no, scrollbars=yes" );
    };

    var $changelog = $( "#changelog-content" );
    var $changelogTable = $( "tbody", $changelog );

    $( ".expand-changelog" ).click( function(){
        var $this = $( this );
        if( $this.data( "expanded" ) ){
            $this.html( "+ 展开" );
            $changelog.removeClass( "show" );
            $this.removeData( "expanded" );
        }else{
            $this.html( "- 收起" );
            $changelog.addClass( "show" );
            $this.data( "expanded", "1" );
            loadChangelog();
        }
    } );

    var uid = randomWord( 8 );

    $( ".replace-uid" ).each( function(){
        if( this.nodeName == "A" )
            $( this ).prop( "href", $( this ).prop( "href" ).replace( "$uid", uid ) );
        else
            $( this ).html( function( index, html ){
                return html.replace( "$uid", uid );
            } );
    } );

    $( ".bookmarks" ).popover( {
        animation: true,
        placement: "top",
        html: true,
        trigger: "hover",
        container: "body"
    } );

    $( "img" ).lazyload();

    $( ".recommend" ).click( openShareLink );
} );