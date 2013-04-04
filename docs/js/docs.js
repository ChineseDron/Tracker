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

    var $changelog = $( "#changelog-content" );

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
} );