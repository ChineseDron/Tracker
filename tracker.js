/** 
 * Tracker Cacher
 * @version 0.9
 * @author dron
 * @create 2013-04-16
 */

void function( version, script, analyzer, parent ){
    if( window != window.parent )
        return ;

    if( /msie/i.test( navigator.userAgent ) )
        return window.alert( "您使用的浏览器相对传统，建议换 chrome/firefox/safari 试试！" );

    version = "1.8.9";
    analyzer = "http://www.ucren.com/tracker/cache.php?file=./tracker-analyzer.js&version=" + version;
    script = document.createElement( "script" );
    script.type = "text/javascript";
    script.src = analyzer;
    parent = document.head || document.body || document.documentElement;

    parent.appendChild( script );
}();