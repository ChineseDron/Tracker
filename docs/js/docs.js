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
} );