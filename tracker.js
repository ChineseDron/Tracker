/** 
 * Tracker.js
 * @version 1.2
 * @author dron
 * @create 2012-12-22
 */

void function( window, factory ){
    var host;
    
    host = window.document;

    if( window != window.parent )
        return ;

    if( /msie/i.test( navigator.userAgent ) )
        return window.alert( "您使用的浏览器相对传统，建议换 chrome/firefox/safari 试试！" );

    if( !host.TrackerGlobalEvent )
        factory( window );
    
    host.TrackerGlobalEvent.fire( "TrackerJSLoad" );

}( this, function( window ){
    var global, host, location, slice, floor, max, push, version;

    global = window;
    host = global.document;
    location = global.location;
    slice = [].slice;
    push = [].push;
    floor = Math.floor;
    max = Math.max;
    version = "1.2";

    var getShareLink = function(){
        var url = "http://service.weibo.com/share/share.php";
        url = util.param( url, "title", "%40dron%E5%BE%AE%E5%8D%9A%20%E6%88%91%E6%AD%A3%E5%9C%A8%E4%BD%BF%E7%94%A8%20Tracker%20%E6%8E%92%E6%9F%A5%E7%BD%91%E9%A1%B5%E4%B8%AD%E5%86%97%E4%BD%99%E7%9A%84%E8%84%9A%E6%9C%AC%EF%BC%8C%E6%8C%BA%E7%BB%99%E5%8A%9B%E7%9A%84%EF%BC%8C%E5%85%8D%E5%AE%89%E8%A3%85%EF%BC%8C%E7%9B%B4%E6%8E%A5%E5%9C%A8%E6%B5%8F%E8%A7%88%E5%99%A8%E4%B8%AD%E5%B0%B1%E8%83%BD%E7%94%A8%EF%BC%8C%E6%8E%A8%E8%8D%90%E5%A4%A7%E5%AE%B6%E8%AF%95%E8%AF%95%E3%80%82" );
        url = util.param( url, "url", encodeURIComponent( "http://ucren.com/tracker/" ) );
        return url;
    };

    var util = function(){
        var excapeRegx = function(){
            var specials, regx;

            specials = [ "/", ".", "*", "+", "?", "|", "$", "^", "(", ")", "[", "]", "{", 
                "}", "\\" ];
            regx = new RegExp( "(\\" + specials.join("|\\") + ")", "g" );

            return function( text ){
                return text.replace( regx, "\\$1" );
            };  
        }();

        var RemoteProxy = function(){
            var callbacks, esc, service, timeout;
            
            callbacks = {};
            timeout = 5e3;

            host.remoteProxyCallback = function( data ){
                var c;
                if( c = callbacks[ data.url ] )
                    c( data.content );
            };

            esc = function(){
                var regx, rep;
                
                regx = /[\\\/ \+%&=#]/g;
                rep = function( s ){
                    return escape( s );
                };

                return function( url ){
                    return url.replace( regx, rep );  
                };
            }();

            service = "http://www.ucren.com/tracker/proxy.php";

            var getProxyUrl = function( url ){
                url = util.param( service, "url", esc( url ) );
                url = util.param( url, "callback", "remoteProxyCallback" );
                return url;
            };

            return {
                get: function( url, charset ){
                    var pm, timer, script;

                    pm = new promise;

                    script = util.makeElement( host, "script" );
                    script.src = getProxyUrl( url );
                    script.charset = charset || "utf-8";
                    host.head.appendChild( script );

                    callbacks[ url ] = function( content ){
                        clearTimeout( timer );
                        pm.resolve( content );
                        script = null;
                        delete callbacks[ url ];
                    };

                    timer = setTimeout( function(){
                        script.parentNode.removeChild( script );
                        pm.reject();
                        script = null;
                    }, timeout );

                    return pm;
                }
            };
        }();

        return {
            blank: function(){  
            },

            forEach: function( unknow, iterator ){
                var i, l;

                if( unknow instanceof Array || 
                    ( unknow && typeof unknow.length == "number" ) )
                    for( i = 0, l = unknow.length; i < l; i ++ )
                        iterator( unknow[ i ], i, unknow );
                else if( typeof unknow === "string" )
                    for( i = 0, l = unknow.length; i < l; i ++ )
                        iterator( unknow.charAt( i ), i, unknow );
            },

            id: function( id ){
                return function(){
                    return "_" + id ++;
                }
            }( 0 ),

            trim: function(){
                var regx = /^\s+|\s+$/g, rep = "";
                return function( string ){
                    return string.replace( regx, rep );
                } 
            }(),

            random: function(){
                return ( Math.random() * 1e6 ) | 0;  
            },

            getByteLength: function( string ){
                return string.replace( /[^\x00-\xff]/g, "  " ).length;  
            },

            makeElement: function( doc, tagName, cssText ){
                var el;

                if( typeof doc == "string" )
                    cssText = tagName,
                    tagName = doc,
                    doc = null;
                
                if( !doc )
                    doc = host;
                
                el = doc.createElement( tagName );

                if( cssText )
                    el.style.cssText = cssText;

                return el;
            },

            findParent: function( el, tag, endOf ){
                do{
                    if( el.tagName.toLowerCase() == tag.toLowerCase() )
                        return el;

                    if( el == endOf )
                        return null;

                    el = el.parentNode;
                }while( 1 );
            },

            tag: function( html, tagName, className ){
                var result, t;

                result = html;
                tagName = tagName.split( " " );

                while( t = tagName.pop() )
                    result = "<" + t + ">" + result + "</" + t + ">";

                if( className )
                    result = result.replace( /<(\w+)>/, 
                        "<$1 class='" + className + "'>" );

                return result;
            },

            addClass: function( el, className ){
                var name;
                
                name = " " + el.className + " ";

                if( !~name.indexOf( " " + className + " " ) )
                    el.className += " " + className;
            },

            removeClass: function( el, className ){
                var name;
                
                name = " " + el.className + " ";
                
                if( ~name.indexOf( " " + className + " " ) ){
                    name = name.replace( " " + className + " ", " " );
                    name = util.trim( name.replace( / +/g, " " ) );
                    el.className = name;
                }
            },

            html: function( string ){
                return string.replace( /&/g, "&amp;" )
                    .replace( /</g, "&lt;" )
                    .replace( />/g, "&gt;" )
                    .replace( /"/g, "&quot;" )
                    .replace( /'/g, "&#39;" );
            },

            removeHtmlComment: function(){
                var htmlCommentRegx1, htmlCommentRegx2, cDataRegx1, cDataRegx2;

                htmlCommentRegx1 = /(\n|^)\s*<!--.*?-->\s*/g;
                htmlCommentRegx2 = /(\n|^)\s*<!--\s*\n|\n?\s*-->\s*\n/g;
                cDataRegx1 = /(\n|^)\s*<!\[CDATA\[/g;
                cDataRegx2 = /\/\/\]\]>\s*/g;

                return function( string ){
                    return string.replace( htmlCommentRegx1, "" ).replace(
                        htmlCommentRegx2, "" ).replace( cDataRegx1, "" ).replace(
                        cDataRegx2, "");
                }
            }(),

            splitToLines: function(){
                var splitLineRegx = /\r\n|[\r\n]/;
                return function( string ){
                    return string.split( splitLineRegx );
                }
            }(),

            param: function( url, name, value ){
                var spliter, suffix;

                spliter = ~url.indexOf( "?" ) ? "&" : "?";
                suffix = name + "=" + value;

                return url + spliter + suffix;
            },

            excapeRegx: excapeRegx,

            fileName: function( url ){
                var start, end;

                start = url.lastIndexOf( "/" );
                end = max( url.indexOf( "#" ), url.indexOf( "?" ) );

                if( end == -1 )
                    end = url.length;

                return url.slice( start + 1, end );
            },

            time: function(){
                return new Date().getTime();
            },

            browser: function(){
                var ua, isOpera, ret;
                
                ua = navigator.userAgent;
                isOpera = Object.prototype.toString.call(window.opera) == '[object Opera]';
                ret = {
                    IE:     !!window.attachEvent && !isOpera,
                    Opera:  isOpera,
                    WebKit: ua.indexOf('AppleWebKit/') > -1,
                    Gecko:  ua.indexOf('Gecko') > -1 && ua.indexOf('KHTML') === -1
                    // MobileSafari:   /Apple.*Mobile/.test(ua)
                };

                for( var name in ret )
                    if( ret.hasOwnProperty( name ) && ret[ name ] ){
                        ret.name = name;
                        break;
                    }

                return ret;
            }(),

            isntCrossDomain: function(){
                var locationOriginRegx, hasProtocol;
                
                locationOriginRegx = new RegExp( "^" + 
                    excapeRegx( location.protocol + "//" + host.domain ), "i" );
                hasProtocol = /^(\w+:)?\/\//i;

                return function( url ){
                    return !hasProtocol.test( url ) || 
                        locationOriginRegx.test(url);
                }
            }(),

            intelligentGet: function( url ){
                return util.isntCrossDomain( url ) ? 
                    util.request( url ) : RemoteProxy.get( url );
            },

            request: function( url, charset ){
                var xhr, pm, timeout, timer;

                pm = new promise();
                timeout = 5e3;

                if( XMLHttpRequest )
                    xhr = new XMLHttpRequest();
                else
                    xhr = new ActiveXObject( "Microsoft.XMLHTTP" );

                xhr.open( "GET", url, true );

                if( charset && xhr.overrideMimeType )
                    xhr.overrideMimeType( "text/html;charset=" + charset );

                xhr.onreadystatechange = function(){
                    if( xhr.readyState == 4 && xhr.status == 200 ){
                        clearTimeout( timer );
                        pm.resolve( xhr.responseText );
                        xhr = null;
                    }
                };

                timer = setTimeout( function(){
                    xhr.abort();
                    pm.reject();
                    xhr = null;
                }, timeout );

                xhr.send( null );

                return pm;
            },

            delay: function (){
                // single thread
                var tasks, start, timer, task;
                
                tasks = [];

                start = function(){
                    clearInterval( timer );
                    timer = setInterval( function(){
                        if( tasks.length ){
                            task = tasks.shift();
                            task.apply();
                        }else{
                            clearInterval( timer );
                        }
                    }, 1e2 );
                };

                return function( fn ){
                    tasks.push( fn );
                        start();
                }
            }(),

            onCpuFree: function( fn, process ){
                var now, start, last, count, d, timer, limit, times;

                start = last = util.time();
                count = 0;
                limit = 30;
                times = 20;

                process = process || util.blank;

                timer = setInterval( function(){
                    now = util.time();

                    if( ( d = now - last ) < limit && ++ count == times ){
                        clearInterval( timer );
                        fn();
                    }else if( d > limit ){
                        count = 0;
                        process( now - start );
                    }

                    last = now;
                }, 16 );
            }
        }
    }();

    var promise = function(){
        var concat = [].concat;

        var promise = function(){
            var list;
            
            list = this.list = arguments.length ? 
                concat.apply( [], arguments[ 0 ] ) : null;
            this.resolves = [];
            this.rejects = [];
            this.resolveValues = [];
            this.rejectValues = [];
            this.parents = [];
            this.state = "pending";
            this.fired = false;

            if( list )
                for( var i = 0, l = list.length; i < l; i ++ )
                    list[ i ].parents.push( this );
        };

        promise.prototype = {
            resolve: function( arg ){
                if( this.state == "pending" )
                    this.state = "resolved",
                    this.resolveValues = concat.apply( [], arguments )
                    this.fire();
            },

            reject: function( arg ){
                if( this.state == "pending" )
                    this.state = "rejected",
                    this.rejectValues = concat.apply( [], arguments )
                    this.fire();
            },

            then: function( resolved, rejected ){
                if( resolved )
                    this.resolves.push( resolved );
                
                if( rejected )
                    this.rejects.push( rejected );

                if( this.fired )
                    switch( this.state ){
                        case "resolved":
                            resolved && 
                                resolved.apply( null, this.resolveValues );
                            break;
                        case "rejected":
                            rejected &&
                                rejected.apply( null, this.rejectValues );
                    }
                else
                    this.fire();

                return this;
            },

            fire: function(){
                var callbacks, values, list = this.list, allResolved = true,
                    allResolveValues, parents;

                if( this.fired )
                    return ;

                if( list && this.state == "pending" ){
                    allResolveValues = [];

                    for( var i = 0, l = list.length; i < l; i ++ ){
                        switch( list[ i ].state ){
                            case "pending":
                                allResolved = false;
                                break;
                            case "resolved":
                                allResolveValues[ i ] = 
                                    list[ i ].resolveValues[ 0 ];
                                break;
                            case "rejected":
                                return this.reject( list[ i ].rejectValues[ 0 ] );
                        }
                    }
                    if( allResolved )
                        return this.resolve( allResolveValues );
                }

                if( this.state == "pending" )
                    return ;

                if( this.state == "resolved" )
                    callbacks = this.resolves,
                    values = this.resolveValues;
                else if( this.state == "rejected" )
                    callbacks = this.rejects,
                    values = this.rejectValues;

                for( var i = 0, l = callbacks.length; i < l; i ++ )
                    callbacks[ i ].apply( null, values );

                this.fired = true;

                parents = this.parents;
                for( var i = 0, l = parents.length; i < l; i ++ )
                    parents[ i ].fire();
            }
        };

        promise.when = function(){
            return new promise( arguments );
        };

        promise.fuze = function(){
            var queue = [], fn, infire;

            fn = function( process ){
                infire ? process() : queue.push( process );
            };

            fn.fire = function(){
                while( queue.length )
                    queue.shift()();
                infire = true;
            };

            return fn;
        };

        return promise;
    }();

    var Event = function(){
        return {
            add: function( target, event, fn ){
                if( typeof event == "object" ){
                    for(var name in event)
                        this.add( target, name, event[ name ] );
                    return ;
                }

                var call = function(){
                    var args = slice.call( arguments ), e;

                    if( ( e = args[ 0 ] ) && typeof e == "object" ){
                        e = e || event;
                        e.target = e.target || e.srcElement;
                        args[ 0 ] = e;
                    }

                    fn.apply( target, args );
                };

                if( target.addEventListener )
                    target.addEventListener( event, call, false );
                else if( target.attachEvent )
                    target.attachEvent( "on" + event, call );
            },

            bind: function( object ){
                var events;

                object = object || {};
                events = object.events = {};

                object.on = function( name, fn ){
                    if( typeof name == "object" ){
                        for(var n in name)
                            this.on( n, name[ n ] );
                        return ;
                    }

                    if( events[ name ] )
                        events[ name ].push( fn );
                    else
                        events[ name ] = [ fn ];
                };

                object.fire = object.f = function( name ){
                    var args = slice.call( arguments, 1 ), e;

                    if( e = events[ name ] )
                        for( var i = 0, l = e.length; i < l; i ++ )
                            e[ i ].apply( this, args );
                };

                return object;
            }
        }
    }();

    var AsynStringReplacer = function(){
        var restoreRegx = /\({3}AsynStringReplacer:(\d+)\){3}/g;

        return {
            replace: function( origContent, regx, pmReplaceFn ){
                var cache, tasks = [], content = origContent, index = 0,
                    pm = new promise;

                content = content.replace( regx, function(){
                    tasks.push( pmReplaceFn.apply( null, arguments ) );
                    return "(((AsynStringReplacer:" + ( index ++ ) + ")))";
                } );

                promise.when( tasks ).then( function(){
                    cache = slice.call( arguments, 0 );
                    content = content.replace( restoreRegx, function( s, index ){
                        return cache[ index - 0 ];
                    } );
                    pm.resolve( content );
                } )
                return pm;
            }
        };
    }();

    var Code = function(){
        var klass;

        klass = function( url, content ){
            var comboCode, beautifyCode;

            if( content )
                content = util.removeHtmlComment( content );

            Feedback.lookup( this );
            this.id = util.id();
            this.url = url;
            this.type = "";
            this.state = "normal";
            this.rowsCount = 0;
            this.arriveRowsCount = 0;
            this.size = content ? util.getByteLength( content ) : -1;
            this.fileName = url ? util.fileName( url ) : "-";
            this.origContent = content || null;
            this.lastModified = util.time();
            this.beautifySize = -1;
            this.runErrors = [];
            this.syntaxErrors = [];
            this.snippetsIdSet = {}; // 已切分成代码碎片的 id 集合

            this.executiveCode = "";
            this.viewHtml = "";

            this.onReady = promise.fuze();

            if( content ){
                comboCode = new ComboCode( this );
                comboCode.onReady( function(){
                    if( comboCode.errorMessage ){
                        this.executiveCode = this.origContent;
                        this.syntaxErrors.push( comboCode );
                        this.fire( "error", "syntaxErrors" );
                    }else{
                        this.executiveCode = comboCode.getExecutiveCode();
                        beautifyCode = comboCode.getBeautifyCode();
                        this.beautifySize = util.getByteLength( beautifyCode );
                        this.rowsCount = util.splitToLines( beautifyCode ).length;
                    }

                    this.viewHtml = comboCode.getViewHtml();
                    util.delay( this.onReady.fire.bind( this.onReady ) );
                }.bind( this ) );
            }else{
                this.executiveCode = "void function (){}";
                this.beautifySize = this.size = 0;
                this.rowsCount = 0;
                this.viewHtml = "";
                this.setState( "empty" );
                util.delay( this.onReady.fire.bind( this.onReady ) );
            }
        };

        klass.prototype = Event.bind( {
            setType: function( type ){
                this.type = type; // embed, link, append
            },

            setState: function( state ){ // normal, timeout, empty
                this.state = state;
            },

            addError: function( message ){
                this.runErrors.push( new Error( message ) );
                this.lastModified = util.time();
                this.fire( "error", "runErrors" );
            }
        } );

        return klass;  
    }();

    var ComboCode = function(){
        var klass, closeTagRegx, viewHtmlRegx, executiveCodeRegx, comboCodeBoundaryRegx, 
            lineFirstIdRegx, topLocationToRegx;

        closeTagRegx = /<\/(\w{0,10})>/g;

        viewHtmlRegx = /\{<\}(<\!\-\- TRACKERINJECTHTML \-\->.*?)\{>\}/g;
        executiveCodeRegx = /\{<\}\/\* TRACKERINJECTJS \*\/.*?\{>\}/g;
        comboCodeBoundaryRegx = /\{(?:<|>)\}/g;
        lineFirstIdRegx = /id=ckey\-(\d+)/;
        topLocationToRegx = /(\s*)(top)(\.location\s*=)(?!=)/g;

        klass = function( CodeInstance ){
            this.CodeInstance = CodeInstance;
            this.code = null;
            this.errorMessage = null;

            this.onReady = promise.fuze();
            util.delay( function(){
                try{
                    this.code = host.combocodegen( CodeInstance );
                }catch(e){
                    this.errorMessage = e.message;
                }

                util.delay( this.onReady.fire.bind( this.onReady ) );
            }.bind( this ) );
        };

        klass.prototype = Event.bind( {
            getCode: function(){
                return this.code;
            },

            getBeautifyCode: function(){
                var code = this.code;
                code = code.replace( viewHtmlRegx, "" );
                code = code.replace( executiveCodeRegx, "" );
                code = code.replace( comboCodeBoundaryRegx, "" );
                return code;
            },

            getExecutiveCode: function(){
                var code = this.code;

                code = code.replace( viewHtmlRegx, "" );
                code = code.replace( comboCodeBoundaryRegx, "" );
                code = code.replace( closeTagRegx, function( s, a ){
                    return "<\\/" + a + ">";
                } );

                code = code.replace( topLocationToRegx, function( s, a, b, c ){
                    return a + "__trackerMockTop__()" + c;
                } );

                code = "try{" + code + "}catch(e){__trackerError__('" + 
                    this.CodeInstance.id + "',e.message);throw e;}";

                return code;
            },

            getViewHtml: function(){
                var code, h1, h2, lines;
                
                h1 = [];
                h2 = [];
                code = this.code || this.CodeInstance.origContent;

                code = code.replace( viewHtmlRegx, function( s, a ){
                    return a.replace( /</g, "\x00" ).replace( />/g, "\x01" );
                } );

                code = code.replace( executiveCodeRegx, "" );
                code = code.replace( comboCodeBoundaryRegx, "" );
                // return code;
                
                lines = util.splitToLines( code );

                util.forEach( lines, function( line, index ){
                    var firstId;

                    firstId = line.match( lineFirstIdRegx );

                    if( firstId )
                        StatusPool.beginOfLineSnippetPut( firstId[1] );

                    h1.push( util.tag( index + 1, "pre" ) );
                    line = util.html( line );
                    h2.push( util.tag( line || " ", "pre" ) );
                } );

                h1 = util.tag( h1.join( "" ), "div", "gutter" );
                h2 = util.tag( h2.join( "" ), "div", "lines" );

                h1 = util.tag( h1 + h2, "div", "block clearfix" );
                h1 = h1.replace( "<div", "<div style='height: " + ( lines.length * 20 + 10 ) + 
                    "px;'" );

                h1 = h1.replace( /\x00/g, "<" ).replace( /\x01/g, ">" );

                return h1;
            }
        } );

        return klass;
    }();

    var CodeList = function(){
        var single, codes;

        codes = [];
        single = Event.bind( {
            add: function(){
                var code;

                if( arguments.length == 1 ){
                    code = arguments[ 0 ];
                }else if( arguments.length == 2 ){
                    code = new Code( arguments[ 0 ], arguments[ 1 ] );
                }else{
                    return ;
                }

                codes[ code.id ] = code;
                codes.push( code );
            },

            get: function( idOrIndex ){
                return codes[ idOrIndex ];
            },

            list: function(){
                return codes;
            },

            sort: function(){
                for( var i = codes.length - 1, r; i >= 0; i -- ){
                    r = codes[ i ];
                    if( r.type == "embed" )
                        codes.splice( i, 1 ),
                        codes.push( r );
                }

                util.forEach( codes, function( code, index ){
                    code.index = index;
                } );
            },

            count: function(){
                return codes.length;
            }
        } );

        return single;
    }();

    var view = function(){
        return {
            Loading: function(){
                var layer, span1, span2, animateTimer, count, progress, body;

                count = progress = 0;
                body = host.body;

                var create = function(){
                    var span;

                    layer = util.makeElement( "div", "position: absolute; width: 350px; " +
                    "height: 90px; border-radius: 10px; background: rgba(0,0,0,.75); " + 
                    "font-size: 20px; line-height: 90px; text-align: center; " +
                    "color: #fff; top: 200px; left: 50%; margin: 0 0 0 -140px; " +
                    "z-index: 65535; font-family: \"Courier New\", \"Heiti SC\", \"Microsoft Yahei\";" );
                    layer.innerHTML = "Analysising <span>...</span> <span>(0/0)</span>";
                    body.appendChild( layer );
                    host.documentElement.scrollTop = body.scrollTop = 0;
                    span = layer.getElementsByTagName( "span" );
                    span1 = span[0];
                    span2 = span[1];
                };

                var animate = function(){
                    var count, word, n, s, e;

                    count = 0;
                    word = "......";
                    clearInterval( animateTimer );
                    animateTimer = setInterval( function(){
                        n = count % 7;
                        s = word.substr( 0, n );
                        e = word.substr( 0, 6 - n );
                        span1.innerHTML = s + "<span style='color: #000;'>" + 
                            e + "</span>";
                        count += 1;
                    }, 100 );
                };

                return {
                    show: function(){
                        if( !layer )
                            create();    
                        else
                            layer.style.display = "block";

                        animate();
                    },

                    hide: function(){
                        if( layer )
                            layer.style.display = "none";

                        clearInterval( animateTimer );
                    },

                    text: function( text ){
                        var me, pm;

                        if( layer )
                            layer.innerHTML = text;

                        me = this;
                        pm = new promise;
                        clearInterval( animateTimer );
                        setTimeout( function(){
                            me.hide();
                            pm.resolve();
                        }, 2e3 );

                        return pm;
                    },

                    addCount: function(){
                        count ++;
                        span2.innerHTML = "(" + progress + "/" + count + ")";
                    },

                    addProgress: function(){
                        progress ++;
                        span2.innerHTML = "(" + progress + "/" + count + ")";
                    }
                }
            }(),

            ControlFrame: function(){
                var document = window.document, controlWindow, hasCreateEmbeded = false,
                    currentMode = "embed", pageBuilder, controllerBuilder;

                var config = {
                    frameHeight: 300,
                    windowWidth: 800,
                    windowHeight: 600
                };

                var template = function( url, title, charset ){
                    charset = charset || "utf-8";
                    return [
                        "<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Frameset//EN'" + 
                            " 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd'>",
                        "<html>",
                        "<head>",
                            "<meta charset='" + charset + "'>",
                            "<meta name='description' content='ucren-tracker-frame'>",
                            "<title>" + title + "</title>",
                        "</head>",
                        "<frameset rows='*,0' framespacing='0' frameborder='no'>",
                            "<frame src='" + url + "' name='tracker_page' />",
                            "<frame src='about:blank' name='tracker_controller'" + 
                                " noresize='yes' />",
                        "</frameset>",
                        "</html>"
                    ].join( "" );
                };

                return Event.bind( {
                    pageBuilder: function( fn ){
                        pageBuilder = fn;
                    },

                    controllerBuilder: function( fn ){
                        controllerBuilder = fn;
                    },

                    show: function(){
                        var frameset, frame, window;

                        if( currentMode === "embed" ){
                            frameset = document.getElementsByTagName( "frameset" )[ 0 ];
                            frame = frameset.getElementsByTagName( "frame" )[ 1 ];
                            frameset.rows = "*," + config.frameHeight;
                            frame.noResize = false;
                        }else if( currentMode === "window" ){
                            window = this.getWindow( "tracker_controller" );

                            if( window && !window.closed )
                                window.focus();
                            else
                                this.createWindow();
                        }

                        this.fire( "show" );
                    },

                    hide: function(){
                        var frameset, frame;

                        if( currentMode === "embed" )
                            frameset = document.getElementsByTagName( "frameset" )[ 0 ],
                            frame = frameset.getElementsByTagName( "frame" )[ 1 ],
                            frameset.rows = "*,0",
                            frame.noResize = true;
                        else if( currentMode === "window" )
                            controlWindow.close();

                        this.fire( "hide" );
                    },

                    toggleMode: function(){
                        this.removeControllerFrame();

                        if( currentMode === "embed" )
                            currentMode = "window",
                            this.createWindow();
                        else if( currentMode === "window" )
                            currentMode = "embed",
                            this.createEmbed(),
                            this.show();
                    },

                    getMode: function(){
                        return currentMode; 
                    },

                    getWindow: function( name ){
                        // name: tracker_main | tracker_page | tracker_controller
                        if( !arguments.length || name === "tracker_main" )
                            return window;     
                        if( currentMode === "window" && name === "tracker_controller" )
                            return controlWindow;
                        else
                            return window.frames[ name ];
                    },

                    // privates
                    createEmbed: function(){
                        var page, controller;

                        promise.when( 
                            hasCreateEmbeded ? [ controllerBuilder( "embed" ) ] : 
                            [ pageBuilder(), controllerBuilder( "embed" ) ] 
                        ).then( function( pageHtml, controllerHtml ){
                            if( !controllerHtml )
                                controllerHtml = pageHtml,
                                pageHtml = null;

                            if( pageHtml ){
                                window.name = "tracker_main";
                                this.write( "tracker_main", 
                                    template( location.href, document.title, 
                                        document.characterSet ) );
                                this.write( "tracker_page", pageHtml );
                                page = this.getWindow( "tracker_page" );

                                this.fire( "pageLoad", page, page.document );
                            }

                            this.write( "tracker_controller", controllerHtml );
                            controller = this.getWindow( "tracker_controller" );
                            this.fire( "controllerLoad", controller, 
                                controller.document );
                        }.bind( this ) );

                        hasCreateEmbeded = true;
                    },

                    createWindow: function( conf ){
                        var width = screen.width - 200, height = screen.height - 200,
                            left = 100, top = 100, controller;

                        controlWindow = window.open( "about:blank", "", "width=" + width + 
                            ", height=" + height + ", left=" + left + ", top=" + top + 
                            ", toolbar=no, menubar=no, resizable=yes, status=no, " +
                            "location=no, scrollbars=yes" );

                        controllerBuilder( "window" ).then( function( html ){
                            this.write( "tracker_controller", html );
                            controller = this.getWindow( "tracker_controller" );
                            this.fire( "controllerLoad", controller, 
                                controller.document );
                        }.bind( this ) );
                    },

                    removeControllerFrame: function(){
                        this.hide();

                        if( currentMode === "embed" )
                            this.write( "tracker_controller", "about:blank" );
                        else if( currentMode === "window" )
                            controlWindow = null;
                    },

                    write: function( name, content ){
                        var document;

                        document = this.getWindow( name ).document;
                        document.open( "text/html", "replace" );
                        document.write( content );
                        document.close();
                    }
                } );
            }(),

            ControlPanel: function(){
                var actions, window, document, currentSelectedCode;
                
                actions = {};

                var rate = function( code ){
                    var r, c;

                    r = code.arriveRowsCount / code.rowsCount * 100 || 0;
                    c = r == 0 ? "stress" : "";

                    return "<span class='" + c + "'>" + r.toFixed( 2 ) + " %</span>";
                };

                var size = function( number ){
                    return ( number / 1024 ).toFixed( 2 ) + " k";
                };

                var yesno = function( bool ){
                    return ( bool && bool.length ) ? 
                    "<span class='stress'>&#26159;<span>" : "&#21542;";
                };

                var state = function( state ){
                    switch( state ){
                        case "normal":
                            return "&#27491;&#24120;"; // 正常
                        case "timeout":
                            return "<span class='stress'>&#36229;&#26102;</span>"; // 超时
                        case "empty":
                            return "<span class='stress'>&#31354;&#26631;&#31614;</span>"; // 空标签
                    }
                };

                var type = function( code ){
                    switch( code.type ){
                        case "embed":
                            return "&#20869;&#23884;"; // 内嵌
                        case "link":
                            return "&#25991;&#20214;&#38142;&#25509;"; // 文件链接
                        case "append":
                            return "&#21160;&#24577;&#25554;&#20837;"; // 动态插入
                    };
                };

                var pageTemplate = function( mode, charset ){
                    var resourcePath, toolbarBorderTop;

                    resourcePath = "http://www.ucren.com/tracker/";
                    toolbarBorderTop = mode === "window" ? "padding-top: 7px;" :
                        "border-top: 2px solid #666;";
                    charset = charset || "utf-8";
                    
                    return [
                        "<!DOCTYPE html>",
                        "<html>",
                        "<head>",
                            "<meta charset='" + charset + "'>",
                            "<meta name='author' content='dron'>",
                            "<title>Tracker!</title>",
                            "<style>",
                                "body, div, ul, ol, li, h1, h2, h3, h4, h5, h6, pre," + 
                                    " code, input, textarea, p, th, td{ margin: 0; " +
                                    "padding: 0; }",

                                "html,body{ overflow: hidden; margin: 0; padding: 0; }",
                                "body,pre{ font-family: \"Courier New\", \"Heiti SC\", \"Microsoft Yahei\"; }",
                                
                                "li{ list-style: none; }",
                                ".clearfix:after{ content: '/20'; display: block; " +
                                    "height: 0; overflow: hidden; clear: both; }",
                                ".stress{ color: #f66; }",
                                ".clearfix{ zoom: 1; }",
                                "#wrapper{ }",
                                "#toolbar{ width: auto; height: 20px; padding: 6px; " + 
                                    "border-bottom: 1px solid #505050; line-height: 20px; " +
                                    "background: #e6e6e6; " + toolbarBorderTop + " }",
                                
                                "#toolbar .version{ float: right; font-size: 12px; " +
                                    "font-style: italic; }",

                                "#toolbar .logo{ float: right; display: block; " + 
                                    "width: 54px; height: 20px; " +
                                    "background: transparent " +
                                    "url(" + resourcePath + "logo.gif) " +
                                    "no-repeat 0 center; }",

                                "#toolbar .link{ float: right; display: block; " +
                                    "font-size: 14px; text-decoration: none; " +
                                    "color: #999; margin-right: 18px; line-height: 20px }",

                                "#toolbar .link:hover{ color: #000; }",
                                
                                "#toolbar .button{ width: 20px; height: 20px; " + 
                                    "display: inline-block; border-radius: 2px; " + 
                                    "cursor: default; margin-right: 7px; }",
                                
                                "#toolbar .button:hover{ background-color: #d7dde5; " + 
                                    "border: 1px solid #666;" +
                                    "margin: -1px 6px -1px -1px; }",
                                
                                ".close{ background: transparent url(" + resourcePath + 
                                    "close.gif) no-repeat center center; }",
                                
                                ".toggle{ background-image: url(" + resourcePath + 
                                    "mode.gif); }",
                                ".toggle-win{ background-position: 0 -20px; }",
                                
                                "#main{ position: relative; }",

                                "#resource-panel{  }",
                                "#resource-panel table{ border-collapse: collapse; " +
                                    "height: 24px; min-width: 900px; }",
                                "#resource-panel table th{ background-color: #e6e6e6;" +
                                    "font-size: 14px; font-weight: 400; color: #333; }",

                                "#resource-list{ background-color: #fff; " +
                                    "overflow: auto; cursor: default; }",
                                "#resource-list table td{ font-size: 14px; " +
                                    "font-weight: 400; text-indent: 4px; }",

                                "#resource-list .ellipsis{ white-space: nowrap; " +
                                    "text-overflow: ellipsis; overflow: hidden; }",

                                "#resource-list .none{ padding: 10px; font-size: 14px;" +
                                    "color: #666; }",

                                "#resource-list .index{ width: 38px; }",
                                "#resource-list .name{ width: 158px; }",
                                "#resource-list .type{ width: 68px; }",
                                "#resource-list .cover{ width: 78px; }",
                                "#resource-list .cover-line{ width: 68px; }",
                                "#resource-list .lines{ width: 58px; }",
                                "#resource-list .size{ width: 88px; }",
                                "#resource-list .bsize{ width: 88px; }",
                                "#resource-list .rerror{ width: 68px; }",
                                "#resource-list .serror{ width: 68px; }",
                                "#resource-list .state{ width: 48px; }",

                                "#resource-list .double{ background-color: #eee; }",
                                "#resource-list .over{ background-color: #d9e5d5; }",
                                "#resource-list .selected{ background-color: #c1e5b5; }",
                                "#resource-list .embed{ color: #a8a8a8; " +
                                    "font-style: italic; }",
                                
                                "#code-panel{ position: absolute; left: 222px; " +
                                    "top: 0; border: 1px solid #b3b3b3;" +
                                    " background: #fff; display: none; }",

                                "#code-toolbar{ background-color: #e6e6e6; " +
                                    "width: auto; height: 16px; padding: 3px 0 3px 5px; " +
                                    "border-bottom: 1px solid #b3b3b3; }",

                                "#code-toolbar .button{ width: 16px; height: 16px; " + 
                                    "display: inline-block; border-radius: 2px; " + 
                                    "cursor: default; }",

                                "#code-toolbar .button:hover{ background-color: #d7dde5; " + 
                                    "border: 1px solid #666;" +
                                    "margin: -1px; }",

                                "#code-toolbar .label{ line-height: 16px; " +
                                    "font-size: 14px; display: inline-table; " + 
                                    "height: 16px; color: #333; }",

                                "#code-toolbar .arrive{ background-color: #c1e5b5; " +
                                    "width: 12px; height: 12px; margin: 1px; " +
                                    "border: 1px solid #b3b3b3; }",

                                "#code-toolbar .unarrive{ " +
                                    "background-color: transparent; }",

                                "#code{ overflow: scroll; }",
                                "#code .timeout-code, #code .empty-code{ padding: 10px; font-size: 14px; }",
                                ".block{ position: relative; background-color: #fff; }",
                                ".block pre{ display: block; line-height: 20px; " + 
                                    "font-size: 13px; margin: 0; padding: 0; }",
                                
                                ".block pre .arrive{ background-color: #c1e5b5; " +
                                    "padding: 0 3px; border-radius: 2px; " + 
                                    "margin-left: -3px; color: #000; }",
                                
                                ".block .gutter{ position: absolute; left: 0; top: 0; " +
                                    "width: 30px; background-color: #f7f7f7; " +
                                    "color: #808080; padding: 5px; text-align: right; }",
                                
                                ".block .lines{ position: absolute; left: 40px; " +
                                    "top: 0; padding: 5px; color: #333; }",

                                "#loading{ position: absolute; left: 0; top: 0; background: #000;" + 
                                    "opacity: .5; width: 100%; height: 100%; text-align: left; }",

                                "#loading span{ line-height: 35px; color: #fff; " +
                                    "font-size: 14px; font-weight: 700; padding-left: 70px; }",

                                "#loading span#waitTime{ padding-left: 10px; }",
                            "</style>",
                        "</head>",
                        "<body>",
                            "<div id='wrapper'>",
                                "<div id='toolbar'>",
                                    "<a class='version'>" + version + "</a>",
                                    "<a class='logo' target='_blank'></a>",
                                    // 推荐给好友
                                    "<a class='link' href='" + getShareLink() + "' target='_blank'>" + 
                                        "&#25512;&#33616;&#32473;&#22909;&#21451;</a>",                                    
                                    // 报错
                                    "<a class='link' href='https://github.com/ChineseDron/Tracker/issues/new' target='_blank'>" + 
                                        "&#25253;&#38169;</a>",
                                    // 帮助
                                    "<a class='link' href='http://ucren.com/tracker/docs/index.html' target='_blank'>" + 
                                        "&#24110;&#21161;</a>",
                                    "<a class='button close' action='close'></a>",
                                    "<a class='button toggle' id='toggle-btn' " +
                                        "action='toggleMode'></a>",
                                "</div>",
                                "<div id='main' class='clearfix'>",
                                    "<div id='resource-panel'>",
                                        "<table cellspacing='0' cellpadding='0'" +
                                        " border='1' borderColor='#b3b3b3' width='100%'>",
                                            "<tr>",
                                                // 序号
                                                "<th width='40'>&#24207;&#21495;</th>",
                                                // 名称
                                                "<th width='160'>&#21517;&#31216;</th>",
                                                // 类型
                                                "<th width='70'>&#31867;&#22411;</th>",
                                                // 执行覆盖率
                                                "<th width='80'>&#25191;&#34892;" +
                                                    "&#35206;&#30422;&#29575;</th>",
                                                // 执行行数
                                                "<th width='70'>",
                                                    "&#25191;&#34892;&#34892;&#25968;",
                                                "</th>",
                                                // 总行数
                                                "<th width='60'>&#24635;&#34892;" +
                                                    "&#25968;</th>",
                                                // 原始大小
                                                "<th width='90'>",
                                                    "&#21407;&#22987;&#22823;&#23567;",
                                                "</th>",
                                                // 解压大小
                                                "<th width='90'>",
                                                    "&#35299;&#21387;&#22823;&#23567;",
                                                "</th>",
                                                // 执行报错
                                                "<th width='70'>",
                                                    "&#25191;&#34892;&#25253;&#38169;",
                                                "</th>",
                                                // 语法错误
                                                "<th width='70'>",
                                                    "&#35821;&#27861;&#38169;&#35823;",
                                                "</th>",
                                                // 状态
                                                "<th width='50'>",
                                                    "&#29366;&#24577;",
                                                "</th>",
                                                "<th width='*'>&nbsp;</th>",
                                            "</tr>",
                                        "</table>",
                                        "<div id='resource-list'>",
                                        "</div>",
                                    "</div>",
                                    "<div id='code-panel'>",
                                        "<div id='code-toolbar'>",
                                            "<a class='button close' id='close-code'></a>",
                                            // 图示
                                            "<span class='label' " +
                                                "style='margin-left: 24px;'>",
                                                "&#22270;&#31034;:",
                                            "</span>",
                                            "<span class='label arrive' " +
                                                "style='margin-left: 20px;'></span>",
                                            // 已执行
                                            "<span class='label' " +
                                                "style='margin-left: 5px;'>",
                                                "&#24050;&#25191;&#34892;",
                                            "</span>",
                                            "<span class='label arrive unarrive' " +
                                                "style='margin-left: 15px;'></span>",
                                            // 未执行
                                            "<span class='label' " +
                                                "style='margin-left: 5px;'>",
                                                "&#26410;&#25191;&#34892;",
                                            "</span>",
                                        "</div>",
                                        "<div id='code'></div>",
                                    "</div>",
                                "</div>",
                            "</div>",
                            // 请稍等，收集中
                            "<div id='loading'>",
                                "<span>",
                                    "&#35831;&#31245;&#31561;&#65292;&#25910;&#38598;&#20013;...",
                                "</span>",
                                "<span id='waitTime'></span>",
                            "</div>",
                        "</body>",
                        "</html>"
                    ].join( "" );
                };

                var codeTemplate = function( code, index ){
                    var trClassName, fileNameClass;
                    
                    trClassName = index % 2 ? "double" : "";
                    fileNameClass = code.fileName == "embed" ? "embed" : "";

                    return [
                        "<tr class='" + trClassName + 
                            "' data-code-id='" + code.id + "'>",
                            "<td width='40' height='24'><div class='ellipsis index'>" + 
                            ( code.index + 1 ) + "</div></td>",
                            "<td width='160'><div class='ellipsis name " + 
                                fileNameClass + "'>" + code.fileName + "</div></td>",
                            "<td width='70'><div class='ellipsis type'>" + 
                                type( code ) + "</div></td>",
                            "<td width='80'><div id='code-" + code.id + "-rate' " +
                                "class='ellipsis cover'>" + rate( code ) + 
                                "</div></td>",
                            "<td width='70'><div id='code-" + code.id +
                                "-arriveRowsCount' class='ellipsis cover-line'>" + 
                                code.arriveRowsCount + "</div></td>",
                            "<td width='60'><div class='ellipsis lines'>" + 
                                code.rowsCount + "</div></td>",
                            "<td width='90'><div class='ellipsis size'>" + 
                                size( code.size ) + "</div></td>",
                            "<td width='90'><div class='ellipsis bsize'>" + 
                                size( code.beautifySize ) + "</div></td>",
                            "<td width='70'><div id='code-" + code.id + 
                                "-runErrors' class='ellipsis rerror'>" + 
                                yesno( code.runErrors ) + "</div></td>",
                            "<td width='70'><div class='ellipsis serror'>" + 
                                yesno( code.syntaxErrors ) + "</div></td>",
                            "<td width='50'><div class='ellipsis state'>" + 
                                state( code.state ) + "</div></td>",
                            "<td width='*'></td>",
                        "</tr>"
                    ].join( "" );
                };

                var codeListTemplate = function( codeList ){
                    var htmls;
                    
                    htmls = [];
                    
                    if( codeList.length ){
                        util.forEach( codeList, function( code, index ){
                            htmls[ index ] = codeTemplate( code, index );
                        } );

                        return [
                            "<table cellspacing='0' cellpadding='0' border='1' " +
                            "borderColor='#b3b3b3' width='100%'>",
                                htmls.join( "" ),
                            "</table>"
                        ].join( "" );   
                    }else{
                        // 该网页没有任何 JS 代码
                        return "<div class='none'>&#35813;&#32593;&#39029;&#27809;" +
                            "&#26377;&#20219;&#20309;&#32;&#74;&#83;&#32;&#20195;" +
                            "&#30721;&#12290;</div>";
                    }
                };

                var formatViewHtml = function( code ){
                    if( code.state == "empty" ){
                        return "<div class='empty-code stress'>" +
                                "&#20869;&#23481;&#20026;&#31354;</div>"; // 内容为空
                    }else if( code.state == "timeout" ){
                        return "<div class='timeout-code stress'>" +
                                "&#35299;&#26512;&#36229;&#26102;</div>"; // 解析超时
                    }
                    return code.viewHtml || "";
                };

                var makeCodeTr = function( code ){
                    var layer, html;
                    
                    layer = document.createElement( "div" );
                    html = codeListTemplate( [ code ] );
                    layer.innerHTML = html;

                    return layer.getElementsByTagName( "tr" )[ 0 ];
                };

                return Event.bind( {
                    bindWindow: function( win ){
                        window = win;
                        document = window.document;
                    },

                    addCode: function( code ){
                        var resourceList, tbody, tr, index;
                        
                        // MARKS
                        resourceList = document.getElementById( "resource-list" );
                        index = CodeList.count() - 1;

                        if( code instanceof Array ){
                            resourceList.innerHTML = codeListTemplate( code );
                        }else if( code instanceof Code ){
                            code.index = index;
                            tbody = resourceList.getElementsByTagName( "table" )[ 0 ]
                                .getElementsByTagName( "tbody" )[ 0 ];
                            tr = makeCodeTr( code );
                            tr.className = index % 2 ? "double" : "";
                            tbody.appendChild( tr );
                        }
                    },

                    showCode: function( id ){
                        var codePanel, resourceList, trs, code, idset;

                        codePanel = document.getElementById( "code-panel" );
                        resourceList = document.getElementById( "resource-list" );
                        currentSelectedCode = id || null;
                        codePanel.style.display = id ? "block" : "none";

                        if( id ){
                            code = CodeList.get( id );
                            document.getElementById( "code" ).innerHTML = formatViewHtml( code );

                            // TODO: snippetsIdSet 改为数组的形式
                        
                            idset = code.snippetsIdSet;

                            util.delay( function(){
                                for( var i in idset ){
                                    if( StatusPool.arrivedSnippetGet( i ) )
                                        document.getElementById( "ckey-" + i ).className = "arrive";
                                }
                            } );
                        }

                        trs = resourceList.getElementsByTagName( "tr" );
                        
                        util.forEach( trs, function( tr ){
                            if( tr.getAttribute( "data-code-id" ) == id )
                                util.addClass( tr, "selected" );
                            else
                                util.removeClass( tr, "selected" );
                        } );
                    },

                    updateCode: function( code ){
                        if( currentSelectedCode == code.id )
                            this.showCode( code.id );

                        var rateEl, arriveRowsCountEl, runErrorsEl;

                        rateEl = document.getElementById( "code-" + code.id + "-rate" );
                        arriveRowsCountEl = document.getElementById( "code-" + code.id + 
                            "-arriveRowsCount" );
                        runErrorsEl = document.getElementById( "code-" + code.id + 
                            "-runErrors" );

                        rateEl.innerHTML = rate( code );
                        arriveRowsCountEl.innerHTML = code.arriveRowsCount;
                        runErrorsEl.innerHTML = yesno( code.runErrors );

                        code.lastUpdate = util.time();
                    },

                    actions: function( acts ){
                        actions = acts;
                    },

                    htmlBuilder: function( mode ){
                        var pm = new promise;
                        util.delay( function(){
                            pm.resolve( pageTemplate( mode, global.document.characterSet ) );
                        } );
                        return pm;
                    },

                    eventBuilder: function(){
                        var me = this;
                        var resourceList = document.getElementById( "resource-list" );
                        var codePanel = document.getElementById( "code-panel" );
                        var code = document.getElementById( "code" );
                        var closeCode = document.getElementById( "close-code" );
                        var toggleBtn = document.getElementById( "toggle-btn" );
                        var de = document.documentElement;
                        var toolbarHeight = 36, toolbarHeight2 = 24;
                        var tr, focusInList;

                        // var preventDefaultBackScroll = function( e ){
                        //     e.preventDefault && e.preventDefault();  
                        // };

                        var resize = function(){
                            var width, height;
                            width = de.clientWidth;
                            height = de.clientHeight;
                            code.style.width = width - 220 + "px";
                            code.style.height = 
                            resourceList.style.height = height - toolbarHeight -
                                toolbarHeight2 + "px";
                        };

                        // FIXME: code 容器两指向左向右划动，导致翻前一页

                        resize();
                        Event.add( window, "resize", resize );

                        Event.add( resourceList, {
                            mouseover: function( e ){
                                if( tr = util.findParent( e.target, "tr", resourceList ) )
                                    util.addClass( tr, "over" );
                            },
                            mouseout: function( e ){
                                if( tr = util.findParent( e.target, "tr", resourceList ) )
                                    util.removeClass( tr, "over" );
                            },
                            click: function( e ){
                                var codeId;
                                if( tr = util.findParent( e.target, "tr", resourceList ) )
                                    if( codeId = tr.getAttribute( "data-code-id" ) )
                                        focusInList = true,
                                        view.ControlPanel.showCode( codeId );
                            }
                            // mousewheel: preventDefaultBackScroll
                        } );

                        Event.add( codePanel, {
                            click: function(){
                                focusInList = false;
                            }
                            // mousewheel: preventDefaultBackScroll
                        } );

                        Event.add( document, {
                            click: function( e ){
                                var action;
                                if( ( action = e.target.getAttribute( "action" ) ) &&
                                    actions[ action ] )
                                    actions[ action ].call( me, e.target );
                            },
                            keydown: function( e ){
                                // command + R, F5
                                if( ( e.metaKey && e.keyCode == 82 ) || e.keyCode == 116 ) 
                                    e.preventDefault && e.preventDefault();
                                if( focusInList && currentSelectedCode ){
                                    var offset = 0;
                                    if( e.keyCode == 38 ){ // up
                                        offset = -1;
                                    }else if( e.keyCode == 40 ){ // down
                                        offset = 1;
                                    }
                                    if( offset ){
                                        var trs = resourceList.getElementsByTagName( "tr" ),
                                            nowIndex = -1, tr;
                                        
                                        for(var i = 0, l = trs.length; i < l; i ++){
                                            if( trs[i].getAttribute( "data-code-id" ) ==
                                                currentSelectedCode ){
                                                nowIndex = i;
                                                break;
                                            }
                                        }

                                        if( ~nowIndex ){
                                            nowIndex = ( nowIndex += offset ) < 0 ?
                                                0 : nowIndex == trs.length ? 
                                                nowIndex - 1 : nowIndex;
                                            tr = trs[ nowIndex ];
                                            view.ControlPanel.showCode( 
                                                tr.getAttribute( "data-code-id" ) );
                                            e.preventDefault && e.preventDefault();
                                        }
                                    }
                                }
                            }
                        } );

                        Event.add( closeCode, "click", function( e ){
                            focusInList = true;
                            view.ControlPanel.showCode( false );
                        } );

                        if( view.ControlFrame.getMode() == "window" )
                            util.addClass( toggleBtn, "toggle-win" );

                        if( currentSelectedCode )
                            this.showCode( currentSelectedCode );
                    }
                } );
            }()
        }  
    }();

    var Feedback = function(){
        var urlBase, messageBase, url, runErrors, syntaxErrors, timer, timeout, getUrl, me, tt, uid;

        urlBase = "http://www.ucren.com/feedback/trace.php?content=";
        messageBase = "Tracker: ";
        url = location.href;
        runErrors = 0;
        syntaxErrors = 0;
        tt = host.tracker_type == "bm" ? "bookmarks" : "temp";
        uid = host.tracker_uid || "guest";
        timeout = 5e3;

        getUrl = function(){
            var errors, message;
            
            errors = [ runErrors, syntaxErrors ];
            message = encodeURIComponent( [ 
                messageBase, util.browser.name, 
                "[", tt, uid, "]",
                "[", errors.join( " " ), "]", url ].join( " " ) );

            return urlBase + message;
        };

        return me = {
            lookup: function( code ){
                code.on( "error", function( type ){
                    switch( type ){
                        case "runErrors":
                            runErrors ++;
                            break;
                        case "syntaxErrors":
                            syntaxErrors ++;
                            break;
                    }

                    clearTimeout( timer );
                    timer = setTimeout( me.send, timeout );
                } );

                clearTimeout( timer );
                timer = setTimeout( this.send, timeout );
            },

            send: function(){
                clearTimeout( timer );
                new Image().src = getUrl();
                runErrors = syntaxErrors = 0;
            }
        }
    }();

    var restorePageEnvironments = function(){
        var i, lastTimerId, tempIframe, fixList, tempArray, sourceArray, 
            tempDocument;

        lastTimerId = setTimeout( "1", 0 );

        for( i = lastTimerId, down = max( 0, lastTimerId - 200 ); 
            i >= down; i -- )
            clearTimeout( i ),
            clearInterval( i );

        // NOTE: 恢复可能被目标页面破坏掉的几个主要的 Array 方法
        tempIframe = host.createElement( "iframe" );
        tempIframe.style.cssText = "width: 1px; height: 1px; top: -1000px; " +
            "position: absolute;";
        host.body.appendChild( tempIframe );
        fixList = ( "push, pop, slice, splice, shift, unshift, concat, join, " +
            "reverse" ).split( ", " );
        tempArray = tempIframe.contentWindow.Array.prototype;
        sourceArray = Array.prototype;

        for( i = 0, l = fixList.length; i < l; i ++ )
            sourceArray[ fixList[ i ] ] = tempArray[ fixList[ i ] ];

        fixList = [ "open", "write", "close" ];
        tempDocument = tempIframe.contentDocument;

        for( i = 0, l = fixList.length; i < l; i ++ )
            host[ fixList[ i ] ] = function( fn, host ){
                return function(){
                    return fn.apply( host, arguments );
                }
            }( tempDocument[ fixList[ i ] ], host );
        
        host.body.removeChild( tempIframe );
        tempIframe = null;
        tempDocument = null;
    };

    var StatusPool = host.StatusPool = function(){
        var arrivedSnippetCache, snippetToCodeCache, beginOfLineSnippetCache;

        arrivedSnippetCache = {}; // 已到达的代码碎片池（所有代码）
        snippetToCodeCache = {}; // 代码碎片到代码的映射池
        beginOfLineSnippetCache = {}; // 处于行首的代码碎片池（所有代码）

        return {
            arrivedSnippetPut: function( id ){
                var code;
                if( !arrivedSnippetCache[ id ] ){
                    arrivedSnippetCache[ id ] = true;

                    if( beginOfLineSnippetCache[ id ] && ( code = snippetToCodeCache[ id ] ) ){
                        code.arriveRowsCount ++;
                        code.lastModified = util.time();
                    }
                }
            },

            arrivedSnippetGet: function( id ){
                return arrivedSnippetCache[ id ];
            },

            snippetToCodePut: function( id, codeIns ){
                if( !snippetToCodeCache[ id ] )
                    snippetToCodeCache[ id ] = codeIns;
            },

            snippetToCodeGet: function( id ){
                return snippetToCodeCache[ id ];
            },

            beginOfLineSnippetPut: function( /* id, id, ... */ ){
                for( var i = 0, id, l = arguments.length; i < l; i ++ )
                    if( !beginOfLineSnippetCache[ id = arguments[ i ] ] )
                        beginOfLineSnippetCache[ id ] = 1;
            },

            beginOfLineSnippetGet: function( id ){
                return beginOfLineSnippetCache[ id ];
            }
        }
    }();

    var Decorate = host.Decorate = function( window, document ){
        var Element, appendChild, insertBefore, bind, check, checklist;

        Element = window.Element.prototype;
        appendChild = Element.appendChild;
        insertBefore = Element.insertBefore;

        build = function( fn ){
            return function( node ){
                var me, args, url, code;

                me = this;
                args = slice.apply( arguments );

                if( node.tagName != "SCRIPT" )
                    return fn.apply( me, args );

                url = node.getAttribute( "src" );

                if( !url )
                    return fn.apply( me, args );

                util.intelligentGet( url ).then( function( content ){
                    code = new Code( url, content );
                    code.setType( "append" );
                    CodeList.add( code );
                    node.removeAttribute( "src" );

                    code.onReady( function(){
                        node.appendChild( document.createTextNode( code.executiveCode ) );
                        fn.apply( me, args );
                    } );

                    view.ControlPanel.addCode( code );
                }, function(){
                    code = new Code( url );
                    code.setType( "append" );
                    code.setState( "timeout" );
                    CodeList.add( code );

                    code.onReady( function(){
                        fn.apply( me, args );
                    } );
                    
                    view.ControlPanel.addCode( code );
                } );

                return node;
            };
        };

        check = function( item, name ){
            if( item && item.prototype && item.prototype[ name ] )
                if( item.prototype[ name ] != Element[ name ] )
                    item.prototype[ name ] = Element[ name ];
        };

        checklist = [ window.HTMLElement, window.HTMLHeadElement,
            window.HTMLBodyElement ];

        // Element._appendChild = Element.appendChild;
        Element.appendChild = build( appendChild );

        // Element._insertBefore = Element.insertBefore;
        Element.insertBefore = build( insertBefore );

        util.forEach( checklist, function( object ){
            check( object, "appendChild" );
            check( object, "insertBefore" );
        } );

        // var trackerTasks = [];

        // setInterval( function(){
        //     for( var i = 0, t, l = trackerTasks.length; i < l && i < 1000; i ++ )
        //         StatusPool.arrivedSnippetPut( trackerTasks.shift() );
        // }, 1e2 );
        
        window.__tracker__ = function( id /* , id, id, ... */ ){
            // push.apply( trackerTasks, arguments );
            for( var i = 0, l = arguments.length; i < l; i ++ )
                StatusPool.arrivedSnippetPut( arguments[ i ] );
        };

        window.__trackerError__ = function( codeId, msg ){
            CodeList.get( codeId ).addError( msg );
        };

        window.__trackerMockTop__ = function(){
            return {
                location: {},
                document: {
                    write: util.blank
                }
            };
        };
    };

        var Tracker = function(){
            var cmd = function( cmd ){
                var n = arguments[1];
                switch( cmd ){
                    case "code":
                        return typeof n != "undefined" ?
                            CodeList.get( n ) : CodeList.list();
                    default:
                        return "no such command";
                }
            };

            cmd.toString = function(){
                return "undefined";
            };

        return { cmd: cmd };
        }();

    // business logic
    void function(){
        var currentCodeId, controllerOnLoad, updateInterval, checkCodes, codes;

        controllerOnLoad = promise.fuze()
        host.TrackerGlobalEvent = Event.bind();

        checkCodes = function(){
            if( !codes )
                return ;
            util.forEach( codes, function( code ){
                if( !code.lastUpdate || code.lastUpdate < code.lastModified )
                    view.ControlPanel.updateCode( code );
            } );
        };

        view.ControlFrame.pageBuilder( function( html ){
            var pm = new promise,
                charset = document.characterSet,
                embedScriptRegx = /(<\bscript\b[^>]*?>)([\s\S]*?)(<\/\bscript\b>)/gi,
                srcPropertyRegx = / src=([\"\'])([^\"\']+)\1/,
                typePropertyRegx = / type=([\"\'])([^\"\']+)\1/,                
                scriptRegx = /<\bscript\b [^>]*src=([\"\'])([^\"\']+)\1[^>]*>[\r\n\s]*<\/\bscript\b>/gi,
                firstTagRegx = /(<[^>]+>)/,
                pageStartingOf = "<script> parent.document.Decorate(window, document); </script>";

            util.request( location.href, charset ).then( function( html ){
                AsynStringReplacer.replace( html, embedScriptRegx, 
                    function( raw, openTag, content, closeTag ){
                        var pm, code;
                        
                        pm = new promise;

                        if( srcPropertyRegx.test( openTag ) ){
                            pm.resolve( raw );
                            return pm;
                        }

                        if( typePropertyRegx.test( openTag ) &&
                            RegExp.$2.toLowerCase() != "text/javascript" ){
                            // TODO: 对于非 text/javascript，将来也放到 code list 中，以便于查询
                            pm.resolve( raw );
                            return pm;
                        }

                        view.Loading.addCount();
                        code = new Code( null, content );
                        code.setType( "embed" );
                        CodeList.add( code );

                        code.onReady( function(){
                            pm.resolve( openTag + "\r\n" + code.executiveCode
                                + "\r\n" + closeTag );
                            view.Loading.addProgress();
                        } );
                        return pm;
                    }
                ).then( function( html ){
                    AsynStringReplacer.replace( html, scriptRegx, 
                        function( raw, a, url ){
                            var pm;
                            
                            pm = new promise;
                            url = util.param( url, "tracker-hook", util.id() );
                            url = util.param( url, "tracker-random", util.random() );
                            view.Loading.addCount();

                            util.intelligentGet( url ).then( function( content ){
                                var code;

                                code = new Code( url, content );
                                code.setType( "link" );
                                CodeList.add( code );

                                code.onReady( function(){
                                    pm.resolve( "<script tracker-src='" + url + "'>\r\n" + 
                                        code.executiveCode + "\r\n</script>" );
                                    view.Loading.addProgress();
                                } );
                            }, function(){
                                var code;
                                
                                code = new Code( url );
                                code.setState( "timeout" );
                                CodeList.add( code );

                                code.onReady( function(){
                                    pm.resolve( raw );
                                } );
                            } );

                            return pm;
                        } 
                    ).then( function( html ){
                        view.Loading.hide();
                        util.delay( function(){
                            CodeList.sort();
                            pm.resolve( html.replace( firstTagRegx, "$1" + pageStartingOf ) );
                        } );
                    } );
                } );
            }, function(){
                var message, refresh;

                message = "&#22788;&#29702;&#36229;&#26102;"; // 处理超时
                refresh = function(){
                    location.assign( location.href );  
                };

                view.Loading.text( message ).then( refresh );
            } );

            return pm;
        } );

        view.ControlFrame.controllerBuilder( view.ControlPanel.htmlBuilder );

        view.ControlFrame.on( "pageLoad", function( window, document ){
            var base, head;

            // TODO: 如果页面本身已有 base 标签？
            base = document.createElement( "base" );
            head = document.head || document.getElementsByTagName( "head" )[0];
            base.setAttribute( "target", "tracker_main" );
            head.appendChild( base );

                Event.add( window, "unload", function(){
                    location.assign( location.href );
                } );

            global.Tracker = Tracker;
        } );

        view.ControlFrame.on( "controllerLoad", function( window, document ){
            view.ControlPanel.bindWindow( window );
            view.ControlPanel.addCode( codes = CodeList.list() );
            view.ControlPanel.eventBuilder();

            if( currentCodeId )
                view.ControlPanel.showCode( currentCodeId );

            controllerOnLoad.fire();
            updateInterval = setInterval( checkCodes, 3e3 );

            var waitTime = document.getElementById( "waitTime" );

            util.onCpuFree( function(){
                document.getElementById( "loading" ).style.display = "none";
            }, function( t ){
                waitTime.innerHTML = "(" + (t / 1000).toFixed( 3 ) + "s)";
            } );
        } );

        view.ControlFrame.on( "hide", function(){
            clearInterval( updateInterval );
        } );

        view.ControlPanel.actions( {
            close: view.ControlFrame.hide.bind( view.ControlFrame ),
            toggleMode: view.ControlFrame.toggleMode.bind( view.ControlFrame )
        } );

        host.TrackerGlobalEvent.on( "TrackerJSLoad", function(){
            controllerOnLoad( view.ControlFrame.show.bind( view.ControlFrame ) );
        } );

        restorePageEnvironments();
        view.Loading.show();
        view.ControlFrame.createEmbed();
    }();
} );

/*
  Copyright (C) 2013 Thaddee Tyl <thaddee.tyl@gmail.com>
  Copyright (C) 2012 Ariya Hidayat <ariya.hidayat@gmail.com>
  Copyright (C) 2012 Mathias Bynens <mathias@qiwi.be>
  Copyright (C) 2012 Joost-Wim Boekesteijn <joost-wim@boekesteijn.nl>
  Copyright (C) 2012 Kris Kowal <kris.kowal@cixar.com>
  Copyright (C) 2012 Yusuke Suzuki <utatane.tea@gmail.com>
  Copyright (C) 2012 Arpad Borsos <arpad.borsos@googlemail.com>
  Copyright (C) 2011 Ariya Hidayat <ariya.hidayat@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

    void function (root, factory) {
        'use strict';

        // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
        // Rhino, and plain browser loading.
        if (typeof define === 'function' && define.amd) {
            define(['exports'], factory);
        } else if (typeof exports !== 'undefined') {
            factory(exports);
        } else {
            factory((root.esprima = root.document.esprima = {}));
        }
    }(this, function (exports) {
        'use strict';

        var Token,
            TokenName,
            FnExprTokens,
            Syntax,
            PropertyKind,
            Messages,
            Regex,
            SyntaxTreeDelegate,
            source,
            strict,
            index,
            lineNumber,
            lineStart,
            length,
            delegate,
            lookahead,
            state,
            extra;

        Token = {
            BooleanLiteral: 1,
            EOF: 2,
            Identifier: 3,
            Keyword: 4,
            NullLiteral: 5,
            NumericLiteral: 6,
            Punctuator: 7,
            StringLiteral: 8,
            RegularExpression: 9
        };

        TokenName = {};
        TokenName[Token.BooleanLiteral] = 'Boolean';
        TokenName[Token.EOF] = '<end>';
        TokenName[Token.Identifier] = 'Identifier';
        TokenName[Token.Keyword] = 'Keyword';
        TokenName[Token.NullLiteral] = 'Null';
        TokenName[Token.NumericLiteral] = 'Numeric';
        TokenName[Token.Punctuator] = 'Punctuator';
        TokenName[Token.StringLiteral] = 'String';
        TokenName[Token.RegularExpression] = 'RegularExpression';

        // A function following one of those tokens is an expression.
        FnExprTokens = ["(", "{", "[", "in", "typeof", "instanceof", "new",
                        "return", "case", "delete", "throw", "void",
                        // assignment operators
                        "=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=",
                        "&=", "|=", "^=", ",",
                        // binary/unary operators
                        "+", "-", "*", "/", "%", "++", "--", "<<", ">>", ">>>", "&",
                        "|", "^", "!", "~", "&&", "||", "?", ":", "===", "==", ">=",
                        "<=", "<", ">", "!=", "!=="];

        Syntax = {
            AssignmentExpression: 'AssignmentExpression',
            ArrayExpression: 'ArrayExpression',
            BlockStatement: 'BlockStatement',
            BinaryExpression: 'BinaryExpression',
            BreakStatement: 'BreakStatement',
            CallExpression: 'CallExpression',
            CatchClause: 'CatchClause',
            ConditionalExpression: 'ConditionalExpression',
            ContinueStatement: 'ContinueStatement',
            DoWhileStatement: 'DoWhileStatement',
            DebuggerStatement: 'DebuggerStatement',
            EmptyStatement: 'EmptyStatement',
            ExpressionStatement: 'ExpressionStatement',
            ForStatement: 'ForStatement',
            ForInStatement: 'ForInStatement',
            FunctionDeclaration: 'FunctionDeclaration',
            FunctionExpression: 'FunctionExpression',
            Identifier: 'Identifier',
            IfStatement: 'IfStatement',
            Literal: 'Literal',
            LabeledStatement: 'LabeledStatement',
            LogicalExpression: 'LogicalExpression',
            MemberExpression: 'MemberExpression',
            NewExpression: 'NewExpression',
            ObjectExpression: 'ObjectExpression',
            Program: 'Program',
            Property: 'Property',
            ReturnStatement: 'ReturnStatement',
            SequenceExpression: 'SequenceExpression',
            SwitchStatement: 'SwitchStatement',
            SwitchCase: 'SwitchCase',
            ThisExpression: 'ThisExpression',
            ThrowStatement: 'ThrowStatement',
            TryStatement: 'TryStatement',
            UnaryExpression: 'UnaryExpression',
            UpdateExpression: 'UpdateExpression',
            VariableDeclaration: 'VariableDeclaration',
            VariableDeclarator: 'VariableDeclarator',
            WhileStatement: 'WhileStatement',
            WithStatement: 'WithStatement'
        };

        PropertyKind = {
            Data: 1,
            Get: 2,
            Set: 4
        };

        // Error messages should be identical to V8.
        Messages = {
            UnexpectedToken:  'Unexpected token %0',
            UnexpectedNumber:  'Unexpected number',
            UnexpectedString:  'Unexpected string',
            UnexpectedIdentifier:  'Unexpected identifier',
            UnexpectedReserved:  'Unexpected reserved word',
            UnexpectedEOS:  'Unexpected end of input',
            NewlineAfterThrow:  'Illegal newline after throw',
            InvalidRegExp: 'Invalid regular expression',
            UnterminatedRegExp:  'Invalid regular expression: missing /',
            InvalidLHSInAssignment:  'Invalid left-hand side in assignment',
            InvalidLHSInForIn:  'Invalid left-hand side in for-in',
            MultipleDefaultsInSwitch: 'More than one default clause in switch statement',
            NoCatchOrFinally:  'Missing catch or finally after try',
            UnknownLabel: 'Undefined label \'%0\'',
            Redeclaration: '%0 \'%1\' has already been declared',
            IllegalContinue: 'Illegal continue statement',
            IllegalBreak: 'Illegal break statement',
            IllegalReturn: 'Illegal return statement',
            StrictModeWith:  'Strict mode code may not include a with statement',
            StrictCatchVariable:  'Catch variable may not be eval or arguments in strict mode',
            StrictVarName:  'Variable name may not be eval or arguments in strict mode',
            StrictParamName:  'Parameter name eval or arguments is not allowed in strict mode',
            StrictParamDupe: 'Strict mode function may not have duplicate parameter names',
            StrictFunctionName:  'Function name may not be eval or arguments in strict mode',
            StrictOctalLiteral:  'Octal literals are not allowed in strict mode.',
            StrictDelete:  'Delete of an unqualified identifier in strict mode.',
            StrictDuplicateProperty:  'Duplicate data property in object literal not allowed in strict mode',
            AccessorDataProperty:  'Object literal may not have data and accessor property with the same name',
            AccessorGetSet:  'Object literal may not have multiple get/set accessors with the same name',
            StrictLHSAssignment:  'Assignment to eval or arguments is not allowed in strict mode',
            StrictLHSPostfix:  'Postfix increment/decrement may not have eval or arguments operand in strict mode',
            StrictLHSPrefix:  'Prefix increment/decrement may not have eval or arguments operand in strict mode',
            StrictReservedWord:  'Use of future reserved word in strict mode'
        };

        // See also tools/generate-unicode-regex.py.
        Regex = {
            NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
            NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
        };

        // Ensure the condition is true, otherwise throw an error.
        // This is only to have a better contract semantic, i.e. another safety net
        // to catch a logic error. The condition shall be fulfilled in normal case.
        // Do NOT use this to enforce a certain condition on any user input.

        function assert(condition, message) {
            if (!condition) {
                throw new Error('ASSERT: ' + message);
            }
        }

        function isDecimalDigit(ch) {
            return (ch >= 48 && ch <= 57);   // 0..9
        }

        function isHexDigit(ch) {
            return '0123456789abcdefABCDEF'.indexOf(ch) >= 0;
        }

        function isOctalDigit(ch) {
            return '01234567'.indexOf(ch) >= 0;
        }


        // 7.2 White Space

        function isWhiteSpace(ch) {
            return (ch === 32) ||  // space
                (ch === 9) ||      // tab
                (ch === 0xB) ||
                (ch === 0xC) ||
                (ch === 0xA0) ||
                (ch >= 0x1680 && '\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\uFEFF'.indexOf(String.fromCharCode(ch)) > 0);
        }

        // 7.3 Line Terminators

        function isLineTerminator(ch) {
            return (ch === 10) || (ch === 13) || (ch === 0x2028) || (ch === 0x2029);
        }

        // 7.6 Identifier Names and Identifiers

        function isIdentifierStart(ch) {
            return (ch === 36) || (ch === 95) ||  // $ (dollar) and _ (underscore)
                (ch >= 65 && ch <= 90) ||         // A..Z
                (ch >= 97 && ch <= 122) ||        // a..z
                (ch === 92) ||                    // \ (backslash)
                ((ch >= 0x80) && Regex.NonAsciiIdentifierStart.test(String.fromCharCode(ch)));
        }

        function isIdentifierPart(ch) {
            return (ch === 36) || (ch === 95) ||  // $ (dollar) and _ (underscore)
                (ch >= 65 && ch <= 90) ||         // A..Z
                (ch >= 97 && ch <= 122) ||        // a..z
                (ch >= 48 && ch <= 57) ||         // 0..9
                (ch === 92) ||                    // \ (backslash)
                ((ch >= 0x80) && Regex.NonAsciiIdentifierPart.test(String.fromCharCode(ch)));
        }

        // 7.6.1.2 Future Reserved Words

        function isFutureReservedWord(id) {
            switch (id) {
            case 'class':
            case 'enum':
            case 'export':
            case 'extends':
            case 'import':
            case 'super':
                return true;
            default:
                return false;
            }
        }

        function isStrictModeReservedWord(id) {
            switch (id) {
            case 'implements':
            case 'interface':
            case 'package':
            case 'private':
            case 'protected':
            case 'public':
            case 'static':
            case 'yield':
            case 'let':
                return true;
            default:
                return false;
            }
        }

        function isRestrictedWord(id) {
            return id === 'eval' || id === 'arguments';
        }

        // 7.6.1.1 Keywords

        function isKeyword(id) {
            if (strict && isStrictModeReservedWord(id)) {
                return true;
            }

            // 'const' is specialized as Keyword in V8.
            // 'yield' and 'let' are for compatiblity with SpiderMonkey and ES.next.
            // Some others are from future reserved words.

            switch (id.length) {
            case 2:
                return (id === 'if') || (id === 'in') || (id === 'do');
            case 3:
                return (id === 'var') || (id === 'for') || (id === 'new') ||
                    (id === 'try') || (id === 'let');
            case 4:
                return (id === 'this') || (id === 'else') || (id === 'case') ||
                    (id === 'void') || (id === 'with') || (id === 'enum');
            case 5:
                return (id === 'while') || (id === 'break') || (id === 'catch') ||
                    (id === 'throw') || (id === 'const') || (id === 'yield') ||
                    (id === 'class') || (id === 'super');
            case 6:
                return (id === 'return') || (id === 'typeof') || (id === 'delete') ||
                    (id === 'switch') || (id === 'export') || (id === 'import');
            case 7:
                return (id === 'default') || (id === 'finally') || (id === 'extends');
            case 8:
                return (id === 'function') || (id === 'continue') || (id === 'debugger');
            case 10:
                return (id === 'instanceof');
            default:
                return false;
            }
        }

        // 7.4 Comments

        function skipComment() {
            var ch, blockComment, lineComment;

            blockComment = false;
            lineComment = false;

            while (index < length) {
                ch = source.charCodeAt(index);

                if (lineComment) {
                    ++index;
                    if (isLineTerminator(ch)) {
                        lineComment = false;
                        if (ch === 13 && source.charCodeAt(index) === 10) {
                            ++index;
                        }
                        ++lineNumber;
                        lineStart = index;
                    }
                } else if (blockComment) {
                    if (isLineTerminator(ch)) {
                        if (ch === 13 && source.charCodeAt(index + 1) === 10) {
                            ++index;
                        }
                        ++lineNumber;
                        ++index;
                        lineStart = index;
                        if (index >= length) {
                            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                        }
                    } else {
                        ch = source.charCodeAt(index++);
                        if (index >= length) {
                            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                        }
                        // Block comment ends with '*/' (char #42, char #47).
                        if (ch === 42) {
                            ch = source.charCodeAt(index);
                            if (ch === 47) {
                                ++index;
                                blockComment = false;
                            }
                        }
                    }
                } else if (ch === 47) {
                    ch = source.charCodeAt(index + 1);
                    // Line comment starts with '//' (char #47, char #47).
                    if (ch === 47) {
                        index += 2;
                        lineComment = true;
                    } else if (ch === 42) {
                        // Block comment starts with '/*' (char #47, char #42).
                        index += 2;
                        blockComment = true;
                        if (index >= length) {
                            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                        }
                    } else {
                        break;
                    }
                } else if (isWhiteSpace(ch)) {
                    ++index;
                } else if (isLineTerminator(ch)) {
                    ++index;
                    if (ch === 13 && source.charCodeAt(index) === 10) {
                        ++index;
                    }
                    ++lineNumber;
                    lineStart = index;
                } else {
                    break;
                }
            }
        }

        function scanHexEscape(prefix) {
            var i, len, ch, code = 0;

            len = (prefix === 'u') ? 4 : 2;
            for (i = 0; i < len; ++i) {
                if (index < length && isHexDigit(source[index])) {
                    ch = source[index++];
                    code = code * 16 + '0123456789abcdef'.indexOf(ch.toLowerCase());
                } else {
                    return '';
                }
            }
            return String.fromCharCode(code);
        }

        function getEscapedIdentifier() {
            var ch, id;

            ch = source.charCodeAt(index++);
            id = String.fromCharCode(ch);

            // '\u' (char #92, char #117) denotes an escaped character.
            if (ch === 92) {
                if (source.charCodeAt(index) !== 117) {
                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                }
                ++index;
                ch = scanHexEscape('u');
                if (!ch || ch === '\\' || !isIdentifierStart(ch.charCodeAt(0))) {
                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                }
                id = ch;
            }

            while (index < length) {
                ch = source.charCodeAt(index);
                if (!isIdentifierPart(ch)) {
                    break;
                }
                ++index;
                id += String.fromCharCode(ch);

                // '\u' (char #92, char #117) denotes an escaped character.
                if (ch === 92) {
                    id = id.substr(0, id.length - 1);
                    if (source.charCodeAt(index) !== 117) {
                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                    }
                    ++index;
                    ch = scanHexEscape('u');
                    if (!ch || ch === '\\' || !isIdentifierPart(ch.charCodeAt(0))) {
                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                    }
                    id += ch;
                }
            }

            return id;
        }

        function getIdentifier() {
            var start, ch;

            start = index++;
            while (index < length) {
                ch = source.charCodeAt(index);
                if (ch === 92) {
                    // Blackslash (char #92) marks Unicode escape sequence.
                    index = start;
                    return getEscapedIdentifier();
                }
                if (isIdentifierPart(ch)) {
                    ++index;
                } else {
                    break;
                }
            }

            return source.slice(start, index);
        }

        function scanIdentifier() {
            var start, id, type;

            start = index;

            // Backslash (char #92) starts an escaped character.
            id = (source.charCodeAt(index) === 92) ? getEscapedIdentifier() : getIdentifier();

            // There is no keyword or literal with only one character.
            // Thus, it must be an identifier.
            if (id.length === 1) {
                type = Token.Identifier;
            } else if (isKeyword(id)) {
                type = Token.Keyword;
            } else if (id === 'null') {
                type = Token.NullLiteral;
            } else if (id === 'true' || id === 'false') {
                type = Token.BooleanLiteral;
            } else {
                type = Token.Identifier;
            }

            return {
                type: type,
                value: id,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }


        // 7.7 Punctuators

        function scanPunctuator() {
            var start = index,
                code = source.charCodeAt(index),
                code2,
                ch1 = source[index],
                ch2,
                ch3,
                ch4;

            switch (code) {

            // Check for most common single-character punctuators.
            case 46:   // . dot
            case 40:   // ( open bracket
            case 41:   // ) close bracket
            case 59:   // ; semicolon
            case 44:   // , comma
            case 123:  // { open curly brace
            case 125:  // } close curly brace
            case 91:   // [
            case 93:   // ]
            case 58:   // :
            case 63:   // ?
            case 126:  // ~
                ++index;
                if (extra.tokenize) {
                    if (code === 40) {
                        extra.openParenToken = extra.tokens.length;
                    } else if (code === 123) {
                        extra.openCurlyToken = extra.tokens.length;
                    }
                }
                return {
                    type: Token.Punctuator,
                    value: String.fromCharCode(code),
                    lineNumber: lineNumber,
                    lineStart: lineStart,
                    range: [start, index]
                };

            default:
                code2 = source.charCodeAt(index + 1);

                // '=' (char #61) marks an assignment or comparison operator.
                if (code2 === 61) {
                    switch (code) {
                    case 37:  // %
                    case 38:  // &
                    case 42:  // *:
                    case 43:  // +
                    case 45:  // -
                    case 47:  // /
                    case 60:  // <
                    case 62:  // >
                    case 94:  // ^
                    case 124: // |
                        index += 2;
                        return {
                            type: Token.Punctuator,
                            value: String.fromCharCode(code) + String.fromCharCode(code2),
                            lineNumber: lineNumber,
                            lineStart: lineStart,
                            range: [start, index]
                        };

                    case 33: // !
                    case 61: // =
                        index += 2;

                        // !== and ===
                        if (source.charCodeAt(index) === 61) {
                            ++index;
                        }
                        return {
                            type: Token.Punctuator,
                            value: source.slice(start, index),
                            lineNumber: lineNumber,
                            lineStart: lineStart,
                            range: [start, index]
                        };
                    default:
                        break;
                    }
                }
                break;
            }

            // Peek more characters.

            ch2 = source[index + 1];
            ch3 = source[index + 2];
            ch4 = source[index + 3];

            // 4-character punctuator: >>>=

            if (ch1 === '>' && ch2 === '>' && ch3 === '>') {
                if (ch4 === '=') {
                    index += 4;
                    return {
                        type: Token.Punctuator,
                        value: '>>>=',
                        lineNumber: lineNumber,
                        lineStart: lineStart,
                        range: [start, index]
                    };
                }
            }

            // 3-character punctuators: === !== >>> <<= >>=

            if (ch1 === '>' && ch2 === '>' && ch3 === '>') {
                index += 3;
                return {
                    type: Token.Punctuator,
                    value: '>>>',
                    lineNumber: lineNumber,
                    lineStart: lineStart,
                    range: [start, index]
                };
            }

            if (ch1 === '<' && ch2 === '<' && ch3 === '=') {
                index += 3;
                return {
                    type: Token.Punctuator,
                    value: '<<=',
                    lineNumber: lineNumber,
                    lineStart: lineStart,
                    range: [start, index]
                };
            }

            if (ch1 === '>' && ch2 === '>' && ch3 === '=') {
                index += 3;
                return {
                    type: Token.Punctuator,
                    value: '>>=',
                    lineNumber: lineNumber,
                    lineStart: lineStart,
                    range: [start, index]
                };
            }

            // Other 2-character punctuators: ++ -- << >> && ||

            if (ch1 === ch2 && ('+-<>&|'.indexOf(ch1) >= 0)) {
                index += 2;
                return {
                    type: Token.Punctuator,
                    value: ch1 + ch2,
                    lineNumber: lineNumber,
                    lineStart: lineStart,
                    range: [start, index]
                };
            }

            if ('<>=!+-*%&|^/'.indexOf(ch1) >= 0) {
                ++index;
                return {
                    type: Token.Punctuator,
                    value: ch1,
                    lineNumber: lineNumber,
                    lineStart: lineStart,
                    range: [start, index]
                };
            }

            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
        }

        // 7.8.3 Numeric Literals

        function scanHexLiteral(start) {
            var number = '';

            while (index < length) {
                if (!isHexDigit(source[index])) {
                    break;
                }
                number += source[index++];
            }

            if (number.length === 0) {
                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
            }

            if (isIdentifierStart(source.charCodeAt(index))) {
                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
            }

            return {
                type: Token.NumericLiteral,
                value: parseInt('0x' + number, 16),
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        function scanOctalLiteral(start) {
            var number = '0' + source[index++];
            while (index < length) {
                if (!isOctalDigit(source[index])) {
                    break;
                }
                number += source[index++];
            }

            if (isIdentifierStart(source.charCodeAt(index)) || isDecimalDigit(source.charCodeAt(index))) {
                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
            }

            return {
                type: Token.NumericLiteral,
                value: parseInt(number, 8),
                octal: true,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        function scanNumericLiteral() {
            var number, start, ch;

            ch = source[index];
            assert(isDecimalDigit(ch.charCodeAt(0)) || (ch === '.'),
                'Numeric literal must start with a decimal digit or a decimal point');

            start = index;
            number = '';
            if (ch !== '.') {
                number = source[index++];
                ch = source[index];

                // Hex number starts with '0x'.
                // Octal number starts with '0'.
                if (number === '0') {
                    if (ch === 'x' || ch === 'X') {
                        ++index;
                        return scanHexLiteral(start);
                    }
                    if (isOctalDigit(ch)) {
                        return scanOctalLiteral(start);
                    }

                    // decimal number starts with '0' such as '09' is illegal.
                    if (ch && isDecimalDigit(ch.charCodeAt(0))) {
                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                    }
                }

                while (isDecimalDigit(source.charCodeAt(index))) {
                    number += source[index++];
                }
                ch = source[index];
            }

            if (ch === '.') {
                number += source[index++];
                while (isDecimalDigit(source.charCodeAt(index))) {
                    number += source[index++];
                }
                ch = source[index];
            }

            if (ch === 'e' || ch === 'E') {
                number += source[index++];

                ch = source[index];
                if (ch === '+' || ch === '-') {
                    number += source[index++];
                }
                if (isDecimalDigit(source.charCodeAt(index))) {
                    while (isDecimalDigit(source.charCodeAt(index))) {
                        number += source[index++];
                    }
                } else {
                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                }
            }

            if (isIdentifierStart(source.charCodeAt(index))) {
                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
            }

            return {
                type: Token.NumericLiteral,
                value: parseFloat(number),
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        // 7.8.4 String Literals

        function scanStringLiteral() {
            var str = '', quote, start, ch, code, unescaped, restore, octal = false;

            quote = source[index];
            assert((quote === '\'' || quote === '"'),
                'String literal must starts with a quote');

            start = index;
            ++index;

            while (index < length) {
                ch = source[index++];

                if (ch === quote) {
                    quote = '';
                    break;
                } else if (ch === '\\') {
                    ch = source[index++];
                    if (!ch || !isLineTerminator(ch.charCodeAt(0))) {
                        switch (ch) {
                        case 'n':
                            str += '\n';
                            break;
                        case 'r':
                            str += '\r';
                            break;
                        case 't':
                            str += '\t';
                            break;
                        case 'u':
                        case 'x':
                            restore = index;
                            unescaped = scanHexEscape(ch);
                            if (unescaped) {
                                str += unescaped;
                            } else {
                                index = restore;
                                str += ch;
                            }
                            break;
                        case 'b':
                            str += '\b';
                            break;
                        case 'f':
                            str += '\f';
                            break;
                        case 'v':
                            str += '\v';
                            break;

                        default:
                            if (isOctalDigit(ch)) {
                                code = '01234567'.indexOf(ch);

                                // \0 is not octal escape sequence
                                if (code !== 0) {
                                    octal = true;
                                }

                                if (index < length && isOctalDigit(source[index])) {
                                    octal = true;
                                    code = code * 8 + '01234567'.indexOf(source[index++]);

                                    // 3 digits are only allowed when string starts
                                    // with 0, 1, 2, 3
                                    if ('0123'.indexOf(ch) >= 0 &&
                                            index < length &&
                                            isOctalDigit(source[index])) {
                                        code = code * 8 + '01234567'.indexOf(source[index++]);
                                    }
                                }
                                str += String.fromCharCode(code);
                            } else {
                                str += ch;
                            }
                            break;
                        }
                    } else {
                        ++lineNumber;
                        if (ch ===  '\r' && source[index] === '\n') {
                            ++index;
                        }
                    }
                } else if (isLineTerminator(ch.charCodeAt(0))) {
                    break;
                } else {
                    str += ch;
                }
            }

            if (quote !== '') {
                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
            }

            return {
                type: Token.StringLiteral,
                value: str,
                octal: octal,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        function scanRegExp() {
            var str, ch, start, pattern, flags, value, classMarker = false, restore, terminated = false;

            lookahead = null;
            skipComment();

            start = index;
            ch = source[index];
            assert(ch === '/', 'Regular expression literal must start with a slash');
            str = source[index++];

            while (index < length) {
                ch = source[index++];
                str += ch;
                if (classMarker) {
                    // NOTE: fix bug: /[\]/]/
                    if (ch === ']' && ( source[ index - 2 ] !== '\\' || source[ index - 3 ] === '\\') ) {
                        classMarker = false;
                    }
                } else {
                    if (ch === '\\') {
                        ch = source[index++];
                        // ECMA-262 7.8.5
                        if (isLineTerminator(ch.charCodeAt(0))) {
                            throwError({}, Messages.UnterminatedRegExp);
                        }
                        str += ch;
                    } else if (ch === '/') {
                        terminated = true;
                        break;
                    } else if (ch === '[') {
                        classMarker = true;
                    } else if (isLineTerminator(ch.charCodeAt(0))) {
                        throwError({}, Messages.UnterminatedRegExp);
                    }
                }
            }

            if (!terminated) {
                throwError({}, Messages.UnterminatedRegExp);
            }

            // Exclude leading and trailing slash.
            pattern = str.substr(1, str.length - 2);

            flags = '';
            while (index < length) {
                ch = source[index];
                if (!isIdentifierPart(ch.charCodeAt(0))) {
                    break;
                }

                ++index;
                if (ch === '\\' && index < length) {
                    ch = source[index];
                    if (ch === 'u') {
                        ++index;
                        restore = index;
                        ch = scanHexEscape('u');
                        if (ch) {
                            flags += ch;
                            for (str += '\\u'; restore < index; ++restore) {
                                str += source[restore];
                            }
                        } else {
                            index = restore;
                            flags += 'u';
                            str += '\\u';
                        }
                    } else {
                        str += '\\';
                    }
                } else {
                    flags += ch;
                    str += ch;
                }
            }

            try {
                value = new RegExp(pattern, flags);
            } catch (e) {
                throwError({}, Messages.InvalidRegExp);
            }

            peek();


            if (extra.tokenize) {
                return {
                    type: Token.RegularExpression,
                    value: value,
                    lineNumber: lineNumber,
                    lineStart: lineStart,
                    range: [start, index]
                };
            }
            return {
                literal: str,
                value: value,
                range: [start, index]
            };
        }

        function isIdentifierName(token) {
            return token.type === Token.Identifier ||
                token.type === Token.Keyword ||
                token.type === Token.BooleanLiteral ||
                token.type === Token.NullLiteral;
        }

        function advanceSlash() {
            var prevToken,
                checkToken;
            // Using the following algorithm:
            // https://github.com/mozilla/sweet.js/wiki/design
            prevToken = extra.tokens[extra.tokens.length - 1];
            if (!prevToken) {
                // Nothing before that: it cannot be a division.
                return scanRegExp();
            }
            if (prevToken.type === "Punctuator") {
                if (prevToken.value === ")") {
                    checkToken = extra.tokens[extra.openParenToken - 1];
                    if (checkToken &&
                            checkToken.type === "Keyword" &&
                            (checkToken.value === "if" ||
                             checkToken.value === "while" ||
                             checkToken.value === "for" ||
                             checkToken.value === "with")) {
                        return scanRegExp();
                    }
                    return scanPunctuator();
                }
                if (prevToken.value === "}") {
                    // Dividing a function by anything makes little sense,
                    // but we have to check for that.
                    if (extra.tokens[extra.openCurlyToken - 3] &&
                            extra.tokens[extra.openCurlyToken - 3].type === "Keyword") {
                        // Anonymous function.
                        checkToken = extra.tokens[extra.openCurlyToken - 4];
                        if (!checkToken) {
                            return scanPunctuator();
                        }
                    } else if (extra.tokens[extra.openCurlyToken - 4] &&
                            extra.tokens[extra.openCurlyToken - 4].type === "Keyword") {
                        // Named function.
                        checkToken = extra.tokens[extra.openCurlyToken - 5];
                        if (!checkToken) {
                            return scanRegExp();
                        }
                    } else {
                        return scanPunctuator();
                    }
                    // checkToken determines whether the function is
                    // a declaration or an expression.
                    if (FnExprTokens.indexOf(checkToken.value) >= 0) {
                        // It is an expression.
                        return scanPunctuator();
                    }
                    // It is a declaration.
                    return scanRegExp();
                }
                return scanRegExp();
            }
            if (prevToken.type === "Keyword") {
                return scanRegExp();
            }
            return scanPunctuator();
        }

        function advance() {
            var ch;

            skipComment();

            if (index >= length) {
                return {
                    type: Token.EOF,
                    lineNumber: lineNumber,
                    lineStart: lineStart,
                    range: [index, index]
                };
            }

            ch = source.charCodeAt(index);

            // Very common: ( and ) and ;
            if (ch === 40 || ch === 41 || ch === 58) {
                return scanPunctuator();
            }

            // String literal starts with single quote (#39) or double quote (#34).
            if (ch === 39 || ch === 34) {
                return scanStringLiteral();
            }

            if (isIdentifierStart(ch)) {
                return scanIdentifier();
            }

            // Dot (.) char #46 can also start a floating-point number, hence the need
            // to check the next character.
            if (ch === 46) {
                if (isDecimalDigit(source.charCodeAt(index + 1))) {
                    return scanNumericLiteral();
                }
                return scanPunctuator();
            }

            if (isDecimalDigit(ch)) {
                return scanNumericLiteral();
            }

            // Slash (/) char #47 can also start a regex.
            if (extra.tokenize && ch === 47) {
                return advanceSlash();
            }

            return scanPunctuator();
        }

        function lex() {
            var token;

            token = lookahead;
            index = token.range[1];
            lineNumber = token.lineNumber;
            lineStart = token.lineStart;

            lookahead = advance();

            index = token.range[1];
            lineNumber = token.lineNumber;
            lineStart = token.lineStart;

            return token;
        }

        function peek() {
            var pos, line, start;

            pos = index;
            line = lineNumber;
            start = lineStart;
            lookahead = advance();
            index = pos;
            lineNumber = line;
            lineStart = start;
        }

        SyntaxTreeDelegate = {

            name: 'SyntaxTree',

            postProcess: function (node) {
                return node;
            },

            createArrayExpression: function (elements) {
                return {
                    type: Syntax.ArrayExpression,
                    elements: elements
                };
            },

            createAssignmentExpression: function (operator, left, right) {
                return {
                    type: Syntax.AssignmentExpression,
                    operator: operator,
                    left: left,
                    right: right
                };
            },

            createBinaryExpression: function (operator, left, right) {
                var type = (operator === '||' || operator === '&&') ? Syntax.LogicalExpression :
                            Syntax.BinaryExpression;
                return {
                    type: type,
                    operator: operator,
                    left: left,
                    right: right
                };
            },

            createBlockStatement: function (body) {
                return {
                    type: Syntax.BlockStatement,
                    body: body
                };
            },

            createBreakStatement: function (label) {
                return {
                    type: Syntax.BreakStatement,
                    label: label
                };
            },

            createCallExpression: function (callee, args) {
                return {
                    type: Syntax.CallExpression,
                    callee: callee,
                    'arguments': args
                };
            },

            createCatchClause: function (param, body) {
                return {
                    type: Syntax.CatchClause,
                    param: param,
                    body: body
                };
            },

            createConditionalExpression: function (test, consequent, alternate) {
                return {
                    type: Syntax.ConditionalExpression,
                    test: test,
                    consequent: consequent,
                    alternate: alternate
                };
            },

            createContinueStatement: function (label) {
                return {
                    type: Syntax.ContinueStatement,
                    label: label
                };
            },

            createDebuggerStatement: function () {
                return {
                    type: Syntax.DebuggerStatement
                };
            },

            createDoWhileStatement: function (body, test) {
                return {
                    type: Syntax.DoWhileStatement,
                    body: body,
                    test: test
                };
            },

            createEmptyStatement: function () {
                return {
                    type: Syntax.EmptyStatement
                };
            },

            createExpressionStatement: function (expression) {
                return {
                    type: Syntax.ExpressionStatement,
                    expression: expression
                };
            },

            createForStatement: function (init, test, update, body) {
                return {
                    type: Syntax.ForStatement,
                    init: init,
                    test: test,
                    update: update,
                    body: body
                };
            },

            createForInStatement: function (left, right, body) {
                return {
                    type: Syntax.ForInStatement,
                    left: left,
                    right: right,
                    body: body,
                    each: false
                };
            },

            createFunctionDeclaration: function (id, params, defaults, body) {
                return {
                    type: Syntax.FunctionDeclaration,
                    id: id,
                    params: params,
                    defaults: defaults,
                    body: body,
                    rest: null,
                    generator: false,
                    expression: false
                };
            },

            createFunctionExpression: function (id, params, defaults, body) {
                return {
                    type: Syntax.FunctionExpression,
                    id: id,
                    params: params,
                    defaults: defaults,
                    body: body,
                    rest: null,
                    generator: false,
                    expression: false
                };
            },

            createIdentifier: function (name) {
                return {
                    type: Syntax.Identifier,
                    name: name
                };
            },

            createIfStatement: function (test, consequent, alternate) {
                return {
                    type: Syntax.IfStatement,
                    test: test,
                    consequent: consequent,
                    alternate: alternate
                };
            },

            createLabeledStatement: function (label, body) {
                return {
                    type: Syntax.LabeledStatement,
                    label: label,
                    body: body
                };
            },

            createLiteral: function (token) {
                return {
                    type: Syntax.Literal,
                    value: token.value,
                    raw: source.slice(token.range[0], token.range[1])
                };
            },

            createMemberExpression: function (accessor, object, property) {
                return {
                    type: Syntax.MemberExpression,
                    computed: accessor === '[',
                    object: object,
                    property: property
                };
            },

            createNewExpression: function (callee, args) {
                return {
                    type: Syntax.NewExpression,
                    callee: callee,
                    'arguments': args
                };
            },

            createObjectExpression: function (properties) {
                return {
                    type: Syntax.ObjectExpression,
                    properties: properties
                };
            },

            createPostfixExpression: function (operator, argument) {
                return {
                    type: Syntax.UpdateExpression,
                    operator: operator,
                    argument: argument,
                    prefix: false
                };
            },

            createProgram: function (body) {
                return {
                    type: Syntax.Program,
                    body: body
                };
            },

            createProperty: function (kind, key, value) {
                return {
                    type: Syntax.Property,
                    key: key,
                    value: value,
                    kind: kind
                };
            },

            createReturnStatement: function (argument) {
                return {
                    type: Syntax.ReturnStatement,
                    argument: argument
                };
            },

            createSequenceExpression: function (expressions) {
                return {
                    type: Syntax.SequenceExpression,
                    expressions: expressions
                };
            },

            createSwitchCase: function (test, consequent) {
                return {
                    type: Syntax.SwitchCase,
                    test: test,
                    consequent: consequent
                };
            },

            createSwitchStatement: function (discriminant, cases) {
                return {
                    type: Syntax.SwitchStatement,
                    discriminant: discriminant,
                    cases: cases
                };
            },

            createThisExpression: function () {
                return {
                    type: Syntax.ThisExpression
                };
            },

            createThrowStatement: function (argument) {
                return {
                    type: Syntax.ThrowStatement,
                    argument: argument
                };
            },

            createTryStatement: function (block, guardedHandlers, handlers, finalizer) {
                return {
                    type: Syntax.TryStatement,
                    block: block,
                    guardedHandlers: guardedHandlers,
                    handlers: handlers,
                    finalizer: finalizer
                };
            },

            createUnaryExpression: function (operator, argument) {
                if (operator === '++' || operator === '--') {
                    return {
                        type: Syntax.UpdateExpression,
                        operator: operator,
                        argument: argument,
                        prefix: true
                    };
                }
                return {
                    type: Syntax.UnaryExpression,
                    operator: operator,
                    argument: argument
                };
            },

            createVariableDeclaration: function (declarations, kind) {
                return {
                    type: Syntax.VariableDeclaration,
                    declarations: declarations,
                    kind: kind
                };
            },

            createVariableDeclarator: function (id, init) {
                return {
                    type: Syntax.VariableDeclarator,
                    id: id,
                    init: init
                };
            },

            createWhileStatement: function (test, body) {
                return {
                    type: Syntax.WhileStatement,
                    test: test,
                    body: body
                };
            },

            createWithStatement: function (object, body) {
                return {
                    type: Syntax.WithStatement,
                    object: object,
                    body: body
                };
            }
        };

        // Return true if there is a line terminator before the next token.

        function peekLineTerminator() {
            var pos, line, start, found;

            pos = index;
            line = lineNumber;
            start = lineStart;
            skipComment();
            found = lineNumber !== line;
            index = pos;
            lineNumber = line;
            lineStart = start;

            return found;
        }

        // Throw an exception

        function throwError(token, messageFormat) {
            var error,
                args = Array.prototype.slice.call(arguments, 2),
                msg = messageFormat.replace(
                    /%(\d)/g,
                    function (whole, index) {
                        assert(index < args.length, 'Message reference must be in range');
                        return args[index];
                    }
                );

            if (typeof token.lineNumber === 'number') {
                error = new Error('Line ' + token.lineNumber + ': ' + msg);
                error.index = token.range[0];
                error.lineNumber = token.lineNumber;
                error.column = token.range[0] - lineStart + 1;
            } else {
                error = new Error('Line ' + lineNumber + ': ' + msg);
                error.index = index;
                error.lineNumber = lineNumber;
                error.column = index - lineStart + 1;
            }

            error.description = msg;
            throw error;
        }

        function throwErrorTolerant() {
            try {
                throwError.apply(null, arguments);
            } catch (e) {
                if (extra.errors) {
                    extra.errors.push(e);
                } else {
                    throw e;
                }
            }
        }


        // Throw an exception because of the token.

        function throwUnexpected(token) {
            if (token.type === Token.EOF) {
                throwError(token, Messages.UnexpectedEOS);
            }

            if (token.type === Token.NumericLiteral) {
                throwError(token, Messages.UnexpectedNumber);
            }

            if (token.type === Token.StringLiteral) {
                throwError(token, Messages.UnexpectedString);
            }

            if (token.type === Token.Identifier) {
                throwError(token, Messages.UnexpectedIdentifier);
            }

            if (token.type === Token.Keyword) {
                if (isFutureReservedWord(token.value)) {
                    throwError(token, Messages.UnexpectedReserved);
                } else if (strict && isStrictModeReservedWord(token.value)) {
                    throwErrorTolerant(token, Messages.StrictReservedWord);
                    return;
                }
                throwError(token, Messages.UnexpectedToken, token.value);
            }

            // BooleanLiteral, NullLiteral, or Punctuator.
            throwError(token, Messages.UnexpectedToken, token.value);
        }

        // Expect the next token to match the specified punctuator.
        // If not, an exception will be thrown.

        function expect(value) {
            var token = lex();
            if (token.type !== Token.Punctuator || token.value !== value) {
                throwUnexpected(token);
            }
        }

        // Expect the next token to match the specified keyword.
        // If not, an exception will be thrown.

        function expectKeyword(keyword) {
            var token = lex();
            if (token.type !== Token.Keyword || token.value !== keyword) {
                throwUnexpected(token);
            }
        }

        // Return true if the next token matches the specified punctuator.

        function match(value) {
            return lookahead.type === Token.Punctuator && lookahead.value === value;
        }

        // Return true if the next token matches the specified keyword

        function matchKeyword(keyword) {
            return lookahead.type === Token.Keyword && lookahead.value === keyword;
        }

        // Return true if the next token is an assignment operator

        function matchAssign() {
            var op;

            if (lookahead.type !== Token.Punctuator) {
                return false;
            }
            op = lookahead.value;
            return op === '=' ||
                op === '*=' ||
                op === '/=' ||
                op === '%=' ||
                op === '+=' ||
                op === '-=' ||
                op === '<<=' ||
                op === '>>=' ||
                op === '>>>=' ||
                op === '&=' ||
                op === '^=' ||
                op === '|=';
        }

        function consumeSemicolon() {
            var line;

            // Catch the very common case first: immediately a semicolon (char #59).
            if (source.charCodeAt(index) === 59) {
                lex();
                return;
            }

            line = lineNumber;
            skipComment();
            if (lineNumber !== line) {
                return;
            }

            if (match(';')) {
                lex();
                return;
            }

            if (lookahead.type !== Token.EOF && !match('}')) {
                throwUnexpected(lookahead);
            }
        }

        // Return true if provided expression is LeftHandSideExpression

        function isLeftHandSide(expr) {
            return expr.type === Syntax.Identifier || expr.type === Syntax.MemberExpression;
        }

        // 11.1.4 Array Initialiser

        function parseArrayInitialiser() {
            var elements = [];

            expect('[');

            while (!match(']')) {
                if (match(',')) {
                    lex();
                    elements.push(null);
                } else {
                    elements.push(parseAssignmentExpression());

                    if (!match(']')) {
                        expect(',');
                    }
                }
            }

            expect(']');

            return delegate.createArrayExpression(elements);
        }

        // 11.1.5 Object Initialiser

        function parsePropertyFunction(param, first) {
            var previousStrict, body;

            previousStrict = strict;
            body = parseFunctionSourceElements();
            if (first && strict && isRestrictedWord(param[0].name)) {
                throwErrorTolerant(first, Messages.StrictParamName);
            }
            strict = previousStrict;
            return delegate.createFunctionExpression(null, param, [], body);
        }

        function parseObjectPropertyKey() {
            var token = lex();

            // Note: This function is called only from parseObjectProperty(), where
            // EOF and Punctuator tokens are already filtered out.

            if (token.type === Token.StringLiteral || token.type === Token.NumericLiteral) {
                if (strict && token.octal) {
                    throwErrorTolerant(token, Messages.StrictOctalLiteral);
                }
                return delegate.createLiteral(token);
            }

            return delegate.createIdentifier(token.value);
        }

        function parseObjectProperty() {
            var token, key, id, value, param;

            token = lookahead;

            if (token.type === Token.Identifier) {

                id = parseObjectPropertyKey();

                // Property Assignment: Getter and Setter.

                if (token.value === 'get' && !match(':')) {
                    key = parseObjectPropertyKey();
                    expect('(');
                    expect(')');
                    value = parsePropertyFunction([]);
                    return delegate.createProperty('get', key, value);
                }
                if (token.value === 'set' && !match(':')) {
                    key = parseObjectPropertyKey();
                    expect('(');
                    token = lookahead;
                    if (token.type !== Token.Identifier) {
                        throwUnexpected(lex());
                    }
                    param = [ parseVariableIdentifier() ];
                    expect(')');
                    value = parsePropertyFunction(param, token);
                    return delegate.createProperty('set', key, value);
                }
                expect(':');
                value = parseAssignmentExpression();
                return delegate.createProperty('init', id, value);
            }
            if (token.type === Token.EOF || token.type === Token.Punctuator) {
                throwUnexpected(token);
            } else {
                key = parseObjectPropertyKey();
                expect(':');
                value = parseAssignmentExpression();
                return delegate.createProperty('init', key, value);
            }
        }

        function parseObjectInitialiser() {
            var properties = [], property, name, key, kind, map = {}, toString = String;

            expect('{');

            while (!match('}')) {
                property = parseObjectProperty();

                if (property.key.type === Syntax.Identifier) {
                    name = property.key.name;
                } else {
                    name = toString(property.key.value);
                }
                kind = (property.kind === 'init') ? PropertyKind.Data : (property.kind === 'get') ? PropertyKind.Get : PropertyKind.Set;

                key = '$' + name;
                if (Object.prototype.hasOwnProperty.call(map, key)) {
                    if (map[key] === PropertyKind.Data) {
                        if (strict && kind === PropertyKind.Data) {
                            throwErrorTolerant({}, Messages.StrictDuplicateProperty);
                        } else if (kind !== PropertyKind.Data) {
                            throwErrorTolerant({}, Messages.AccessorDataProperty);
                        }
                    } else {
                        if (kind === PropertyKind.Data) {
                            throwErrorTolerant({}, Messages.AccessorDataProperty);
                        } else if (map[key] & kind) {
                            throwErrorTolerant({}, Messages.AccessorGetSet);
                        }
                    }
                    map[key] |= kind;
                } else {
                    map[key] = kind;
                }

                properties.push(property);

                if (!match('}')) {
                    expect(',');
                }
            }

            expect('}');

            return delegate.createObjectExpression(properties);
        }

        // 11.1.6 The Grouping Operator

        function parseGroupExpression() {
            var expr;

            expect('(');

            expr = parseExpression();

            expect(')');

            return expr;
        }


        // 11.1 Primary Expressions

        function parsePrimaryExpression() {
            var type, token;

            type = lookahead.type;

            if (type === Token.Identifier) {
                return delegate.createIdentifier(lex().value);
            }

            if (type === Token.StringLiteral || type === Token.NumericLiteral) {
                if (strict && lookahead.octal) {
                    throwErrorTolerant(lookahead, Messages.StrictOctalLiteral);
                }
                return delegate.createLiteral(lex());
            }

            if (type === Token.Keyword) {
                if (matchKeyword('this')) {
                    lex();
                    return delegate.createThisExpression();
                }

                if (matchKeyword('function')) {
                    return parseFunctionExpression();
                }
            }

            if (type === Token.BooleanLiteral) {
                token = lex();
                token.value = (token.value === 'true');
                return delegate.createLiteral(token);
            }

            if (type === Token.NullLiteral) {
                token = lex();
                token.value = null;
                return delegate.createLiteral(token);
            }

            if (match('[')) {
                return parseArrayInitialiser();
            }

            if (match('{')) {
                return parseObjectInitialiser();
            }

            if (match('(')) {
                return parseGroupExpression();
            }

            if (match('/') || match('/=')) {
                return delegate.createLiteral(scanRegExp());
            }

            return throwUnexpected(lex());
        }

        // 11.2 Left-Hand-Side Expressions

        function parseArguments() {
            var args = [];

            expect('(');

            if (!match(')')) {
                while (index < length) {
                    args.push(parseAssignmentExpression());
                    if (match(')')) {
                        break;
                    }
                    expect(',');
                }
            }

            expect(')');

            return args;
        }

        function parseNonComputedProperty() {
            var token = lex();

            if (!isIdentifierName(token)) {
                throwUnexpected(token);
            }

            return delegate.createIdentifier(token.value);
        }

        function parseNonComputedMember() {
            expect('.');

            return parseNonComputedProperty();
        }

        function parseComputedMember() {
            var expr;

            expect('[');

            expr = parseExpression();

            expect(']');

            return expr;
        }

        function parseNewExpression() {
            var callee, args;

            expectKeyword('new');
            callee = parseLeftHandSideExpression();
            args = match('(') ? parseArguments() : [];

            return delegate.createNewExpression(callee, args);
        }

        function parseLeftHandSideExpressionAllowCall() {
            var expr, args, property;

            expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();

            while (match('.') || match('[') || match('(')) {
                if (match('(')) {
                    args = parseArguments();
                    expr = delegate.createCallExpression(expr, args);
                } else if (match('[')) {
                    property = parseComputedMember();
                    expr = delegate.createMemberExpression('[', expr, property);
                } else {
                    property = parseNonComputedMember();
                    expr = delegate.createMemberExpression('.', expr, property);
                }
            }

            return expr;
        }


        function parseLeftHandSideExpression() {
            var expr, property;

            expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();

            while (match('.') || match('[')) {
                if (match('[')) {
                    property = parseComputedMember();
                    expr = delegate.createMemberExpression('[', expr, property);
                } else {
                    property = parseNonComputedMember();
                    expr = delegate.createMemberExpression('.', expr, property);
                }
            }

            return expr;
        }

        // 11.3 Postfix Expressions

        function parsePostfixExpression() {
            var expr = parseLeftHandSideExpressionAllowCall(), token;

            if (lookahead.type !== Token.Punctuator) {
                return expr;
            }

            if ((match('++') || match('--')) && !peekLineTerminator()) {
                // 11.3.1, 11.3.2
                if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
                    throwErrorTolerant({}, Messages.StrictLHSPostfix);
                }

                if (!isLeftHandSide(expr)) {
                    throwError({}, Messages.InvalidLHSInAssignment);
                }

                token = lex();
                expr = delegate.createPostfixExpression(token.value, expr);
            }

            return expr;
        }

        // 11.4 Unary Operators

        function parseUnaryExpression() {
            var token, expr;

            if (lookahead.type !== Token.Punctuator && lookahead.type !== Token.Keyword) {
                return parsePostfixExpression();
            }

            if (match('++') || match('--')) {
                token = lex();
                expr = parseUnaryExpression();
                // 11.4.4, 11.4.5
                if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
                    throwErrorTolerant({}, Messages.StrictLHSPrefix);
                }

                if (!isLeftHandSide(expr)) {
                    throwError({}, Messages.InvalidLHSInAssignment);
                }

                return delegate.createUnaryExpression(token.value, expr);
            }

            if (match('+') || match('-') || match('~') || match('!')) {
                token = lex();
                expr = parseUnaryExpression();
                return delegate.createUnaryExpression(token.value, expr);
            }

            if (matchKeyword('delete') || matchKeyword('void') || matchKeyword('typeof')) {
                token = lex();
                expr = parseUnaryExpression();
                expr = delegate.createUnaryExpression(token.value, expr);
                if (strict && expr.operator === 'delete' && expr.argument.type === Syntax.Identifier) {
                    throwErrorTolerant({}, Messages.StrictDelete);
                }
                return expr;
            }

            return parsePostfixExpression();
        }

        function binaryPrecedence(token, allowIn) {
            var prec = 0;

            if (token.type !== Token.Punctuator && token.type !== Token.Keyword) {
                return 0;
            }

            switch (token.value) {
            case '||':
                prec = 1;
                break;

            case '&&':
                prec = 2;
                break;

            case '|':
                prec = 3;
                break;

            case '^':
                prec = 4;
                break;

            case '&':
                prec = 5;
                break;

            case '==':
            case '!=':
            case '===':
            case '!==':
                prec = 6;
                break;

            case '<':
            case '>':
            case '<=':
            case '>=':
            case 'instanceof':
                prec = 7;
                break;

            case 'in':
                prec = allowIn ? 7 : 0;
                break;

            case '<<':
            case '>>':
            case '>>>':
                prec = 8;
                break;

            case '+':
            case '-':
                prec = 9;
                break;

            case '*':
            case '/':
            case '%':
                prec = 11;
                break;

            default:
                break;
            }

            return prec;
        }

        // 11.5 Multiplicative Operators
        // 11.6 Additive Operators
        // 11.7 Bitwise Shift Operators
        // 11.8 Relational Operators
        // 11.9 Equality Operators
        // 11.10 Binary Bitwise Operators
        // 11.11 Binary Logical Operators

        function parseBinaryExpression() {
            var expr, token, prec, previousAllowIn, stack, right, operator, left, i;

            previousAllowIn = state.allowIn;
            state.allowIn = true;

            expr = parseUnaryExpression();

            token = lookahead;
            prec = binaryPrecedence(token, previousAllowIn);
            if (prec === 0) {
                return expr;
            }
            token.prec = prec;
            lex();

            stack = [expr, token, parseUnaryExpression()];

            while ((prec = binaryPrecedence(lookahead, previousAllowIn)) > 0) {

                // Reduce: make a binary expression from the three topmost entries.
                while ((stack.length > 2) && (prec <= stack[stack.length - 2].prec)) {
                    right = stack.pop();
                    operator = stack.pop().value;
                    left = stack.pop();
                    stack.push(delegate.createBinaryExpression(operator, left, right));
                }

                // Shift.
                token = lex();
                token.prec = prec;
                stack.push(token);
                stack.push(parseUnaryExpression());
            }

            state.allowIn = previousAllowIn;

            // Final reduce to clean-up the stack.
            i = stack.length - 1;
            expr = stack[i];
            while (i > 1) {
                expr = delegate.createBinaryExpression(stack[i - 1].value, stack[i - 2], expr);
                i -= 2;
            }
            return expr;
        }


        // 11.12 Conditional Operator

        function parseConditionalExpression() {
            var expr, previousAllowIn, consequent, alternate;

            expr = parseBinaryExpression();

            if (match('?')) {
                lex();
                previousAllowIn = state.allowIn;
                state.allowIn = true;
                consequent = parseAssignmentExpression();
                state.allowIn = previousAllowIn;
                expect(':');
                alternate = parseAssignmentExpression();

                expr = delegate.createConditionalExpression(expr, consequent, alternate);
            }

            return expr;
        }

        // 11.13 Assignment Operators

        function parseAssignmentExpression() {
            var token, left, right;

            token = lookahead;
            left = parseConditionalExpression();

            if (matchAssign()) {
                // LeftHandSideExpression
                if (!isLeftHandSide(left)) {
                    throwError({}, Messages.InvalidLHSInAssignment);
                }

                // 11.13.1
                if (strict && left.type === Syntax.Identifier && isRestrictedWord(left.name)) {
                    throwErrorTolerant(token, Messages.StrictLHSAssignment);
                }

                token = lex();
                right = parseAssignmentExpression();
                return delegate.createAssignmentExpression(token.value, left, right);
            }

            return left;
        }

        // 11.14 Comma Operator

        function parseExpression() {
            var expr = parseAssignmentExpression();

            if (match(',')) {
                expr = delegate.createSequenceExpression([ expr ]);

                while (index < length) {
                    if (!match(',')) {
                        break;
                    }
                    lex();
                    expr.expressions.push(parseAssignmentExpression());
                }

            }
            return expr;
        }

        // 12.1 Block

        function parseStatementList() {
            var list = [],
                statement;

            while (index < length) {
                if (match('}')) {
                    break;
                }
                statement = parseSourceElement();
                if (typeof statement === 'undefined') {
                    break;
                }
                list.push(statement);
            }

            return list;
        }

        function parseBlock() {
            var block;

            expect('{');

            block = parseStatementList();

            expect('}');

            return delegate.createBlockStatement(block);
        }

        // 12.2 Variable Statement

        function parseVariableIdentifier() {
            var token = lex();

            if (token.type !== Token.Identifier) {
                throwUnexpected(token);
            }

            return delegate.createIdentifier(token.value);
        }

        function parseVariableDeclaration(kind) {
            var id = parseVariableIdentifier(),
                init = null;

            // 12.2.1
            if (strict && isRestrictedWord(id.name)) {
                throwErrorTolerant({}, Messages.StrictVarName);
            }

            if (kind === 'const') {
                expect('=');
                init = parseAssignmentExpression();
            } else if (match('=')) {
                lex();
                init = parseAssignmentExpression();
            }

            return delegate.createVariableDeclarator(id, init);
        }

        function parseVariableDeclarationList(kind) {
            var list = [];

            do {
                list.push(parseVariableDeclaration(kind));
                if (!match(',')) {
                    break;
                }
                lex();
            } while (index < length);

            return list;
        }

        function parseVariableStatement() {
            var declarations;

            expectKeyword('var');

            declarations = parseVariableDeclarationList();

            consumeSemicolon();

            return delegate.createVariableDeclaration(declarations, 'var');
        }

        // kind may be `const` or `let`
        // Both are experimental and not in the specification yet.
        // see http://wiki.ecmascript.org/doku.php?id=harmony:const
        // and http://wiki.ecmascript.org/doku.php?id=harmony:let
        function parseConstLetDeclaration(kind) {
            var declarations;

            expectKeyword(kind);

            declarations = parseVariableDeclarationList(kind);

            consumeSemicolon();

            return delegate.createVariableDeclaration(declarations, kind);
        }

        // 12.3 Empty Statement

        function parseEmptyStatement() {
            expect(';');
            return delegate.createEmptyStatement();
        }

        // 12.4 Expression Statement

        function parseExpressionStatement() {
            var expr = parseExpression();
            consumeSemicolon();
            return delegate.createExpressionStatement(expr);
        }

        // 12.5 If statement

        function parseIfStatement() {
            var test, consequent, alternate;

            expectKeyword('if');

            expect('(');

            test = parseExpression();

            expect(')');

            consequent = parseStatement();

            if (matchKeyword('else')) {
                lex();
                alternate = parseStatement();
            } else {
                alternate = null;
            }

            return delegate.createIfStatement(test, consequent, alternate);
        }

        // 12.6 Iteration Statements

        function parseDoWhileStatement() {
            var body, test, oldInIteration;

            expectKeyword('do');

            oldInIteration = state.inIteration;
            state.inIteration = true;

            body = parseStatement();

            state.inIteration = oldInIteration;

            expectKeyword('while');

            expect('(');

            test = parseExpression();

            expect(')');

            if (match(';')) {
                lex();
            }

            return delegate.createDoWhileStatement(body, test);
        }

        function parseWhileStatement() {
            var test, body, oldInIteration;

            expectKeyword('while');

            expect('(');

            test = parseExpression();

            expect(')');

            oldInIteration = state.inIteration;
            state.inIteration = true;

            body = parseStatement();

            state.inIteration = oldInIteration;

            return delegate.createWhileStatement(test, body);
        }

        function parseForVariableDeclaration() {
            var token = lex(),
                declarations = parseVariableDeclarationList();

            return delegate.createVariableDeclaration(declarations, token.value);
        }

        function parseForStatement() {
            var init, test, update, left, right, body, oldInIteration;

            init = test = update = null;

            expectKeyword('for');

            expect('(');

            if (match(';')) {
                lex();
            } else {
                if (matchKeyword('var') || matchKeyword('let')) {
                    state.allowIn = false;
                    init = parseForVariableDeclaration();
                    state.allowIn = true;

                    if (init.declarations.length === 1 && matchKeyword('in')) {
                        lex();
                        left = init;
                        right = parseExpression();
                        init = null;
                    }
                } else {
                    state.allowIn = false;
                    init = parseExpression();
                    state.allowIn = true;

                    if (matchKeyword('in')) {
                        // LeftHandSideExpression
                        if (!isLeftHandSide(init)) {
                            throwError({}, Messages.InvalidLHSInForIn);
                        }

                        lex();
                        left = init;
                        right = parseExpression();
                        init = null;
                    }
                }

                if (typeof left === 'undefined') {
                    expect(';');
                }
            }

            if (typeof left === 'undefined') {

                if (!match(';')) {
                    test = parseExpression();
                }
                expect(';');

                if (!match(')')) {
                    update = parseExpression();
                }
            }

            expect(')');

            oldInIteration = state.inIteration;
            state.inIteration = true;

            body = parseStatement();

            state.inIteration = oldInIteration;

            return (typeof left === 'undefined') ?
                    delegate.createForStatement(init, test, update, body) :
                    delegate.createForInStatement(left, right, body);
        }

        // 12.7 The continue statement

        function parseContinueStatement() {
            var label = null, key;

            expectKeyword('continue');

            // Optimize the most common form: 'continue;'.
            if (source.charCodeAt(index) === 59) {
                lex();

                if (!state.inIteration) {
                    throwError({}, Messages.IllegalContinue);
                }

                return delegate.createContinueStatement(null);
            }

            if (peekLineTerminator()) {
                if (!state.inIteration) {
                    throwError({}, Messages.IllegalContinue);
                }

                return delegate.createContinueStatement(null);
            }

            if (lookahead.type === Token.Identifier) {
                label = parseVariableIdentifier();

                key = '$' + label.name;
                if (!Object.prototype.hasOwnProperty.call(state.labelSet, key)) {
                    throwError({}, Messages.UnknownLabel, label.name);
                }
            }

            consumeSemicolon();

            if (label === null && !state.inIteration) {
                throwError({}, Messages.IllegalContinue);
            }

            return delegate.createContinueStatement(label);
        }

        // 12.8 The break statement

        function parseBreakStatement() {
            var label = null, key;

            expectKeyword('break');

            // Catch the very common case first: immediately a semicolon (char #59).
            if (source.charCodeAt(index) === 59) {
                lex();

                if (!(state.inIteration || state.inSwitch)) {
                    throwError({}, Messages.IllegalBreak);
                }

                return delegate.createBreakStatement(null);
            }

            if (peekLineTerminator()) {
                if (!(state.inIteration || state.inSwitch)) {
                    throwError({}, Messages.IllegalBreak);
                }

                return delegate.createBreakStatement(null);
            }

            if (lookahead.type === Token.Identifier) {
                label = parseVariableIdentifier();

                key = '$' + label.name;
                if (!Object.prototype.hasOwnProperty.call(state.labelSet, key)) {
                    throwError({}, Messages.UnknownLabel, label.name);
                }
            }

            consumeSemicolon();

            if (label === null && !(state.inIteration || state.inSwitch)) {
                throwError({}, Messages.IllegalBreak);
            }

            return delegate.createBreakStatement(label);
        }

        // 12.9 The return statement

        function parseReturnStatement() {
            var argument = null;

            expectKeyword('return');

            if (!state.inFunctionBody) {
                throwErrorTolerant({}, Messages.IllegalReturn);
            }

            // 'return' followed by a space and an identifier is very common.
            if (source.charCodeAt(index) === 32) {
                if (isIdentifierStart(source.charCodeAt(index + 1))) {
                    argument = parseExpression();
                    consumeSemicolon();
                    return delegate.createReturnStatement(argument);
                }
            }

            if (peekLineTerminator()) {
                return delegate.createReturnStatement(null);
            }

            if (!match(';')) {
                if (!match('}') && lookahead.type !== Token.EOF) {
                    argument = parseExpression();
                }
            }

            consumeSemicolon();

            return delegate.createReturnStatement(argument);
        }

        // 12.10 The with statement

        function parseWithStatement() {
            var object, body;

            if (strict) {
                throwErrorTolerant({}, Messages.StrictModeWith);
            }

            expectKeyword('with');

            expect('(');

            object = parseExpression();

            expect(')');

            body = parseStatement();

            return delegate.createWithStatement(object, body);
        }

        // 12.10 The swith statement

        function parseSwitchCase() {
            var test,
                consequent = [],
                statement;

            if (matchKeyword('default')) {
                lex();
                test = null;
            } else {
                expectKeyword('case');
                test = parseExpression();
            }
            expect(':');

            while (index < length) {
                if (match('}') || matchKeyword('default') || matchKeyword('case')) {
                    break;
                }
                statement = parseStatement();
                consequent.push(statement);
            }

            return delegate.createSwitchCase(test, consequent);
        }

        function parseSwitchStatement() {
            var discriminant, cases, clause, oldInSwitch, defaultFound;

            expectKeyword('switch');

            expect('(');

            discriminant = parseExpression();

            expect(')');

            expect('{');

            if (match('}')) {
                lex();
                return delegate.createSwitchStatement(discriminant);
            }

            cases = [];

            oldInSwitch = state.inSwitch;
            state.inSwitch = true;
            defaultFound = false;

            while (index < length) {
                if (match('}')) {
                    break;
                }
                clause = parseSwitchCase();
                if (clause.test === null) {
                    if (defaultFound) {
                        throwError({}, Messages.MultipleDefaultsInSwitch);
                    }
                    defaultFound = true;
                }
                cases.push(clause);
            }

            state.inSwitch = oldInSwitch;

            expect('}');

            return delegate.createSwitchStatement(discriminant, cases);
        }

        // 12.13 The throw statement

        function parseThrowStatement() {
            var argument;

            expectKeyword('throw');

            if (peekLineTerminator()) {
                throwError({}, Messages.NewlineAfterThrow);
            }

            argument = parseExpression();

            consumeSemicolon();

            return delegate.createThrowStatement(argument);
        }

        // 12.14 The try statement

        function parseCatchClause() {
            var param, body;

            expectKeyword('catch');

            expect('(');
            if (match(')')) {
                throwUnexpected(lookahead);
            }

            param = parseExpression();
            // 12.14.1
            if (strict && param.type === Syntax.Identifier && isRestrictedWord(param.name)) {
                throwErrorTolerant({}, Messages.StrictCatchVariable);
            }

            expect(')');
            body = parseBlock();
            return delegate.createCatchClause(param, body);
        }

        function parseTryStatement() {
            var block, handlers = [], finalizer = null;

            expectKeyword('try');

            block = parseBlock();

            if (matchKeyword('catch')) {
                handlers.push(parseCatchClause());
            }

            if (matchKeyword('finally')) {
                lex();
                finalizer = parseBlock();
            }

            if (handlers.length === 0 && !finalizer) {
                throwError({}, Messages.NoCatchOrFinally);
            }

            return delegate.createTryStatement(block, [], handlers, finalizer);
        }

        // 12.15 The debugger statement

        function parseDebuggerStatement() {
            expectKeyword('debugger');

            consumeSemicolon();

            return delegate.createDebuggerStatement();
        }

        // 12 Statements

        function parseStatement() {
            var type = lookahead.type,
                expr,
                labeledBody,
                key;

            if (type === Token.EOF) {
                throwUnexpected(lookahead);
            }

            if (type === Token.Punctuator) {
                switch (lookahead.value) {
                case ';':
                    return parseEmptyStatement();
                case '{':
                    return parseBlock();
                case '(':
                    return parseExpressionStatement();
                default:
                    break;
                }
            }

            if (type === Token.Keyword) {
                switch (lookahead.value) {
                case 'break':
                    return parseBreakStatement();
                case 'continue':
                    return parseContinueStatement();
                case 'debugger':
                    return parseDebuggerStatement();
                case 'do':
                    return parseDoWhileStatement();
                case 'for':
                    return parseForStatement();
                case 'function':
                    return parseFunctionDeclaration();
                case 'if':
                    return parseIfStatement();
                case 'return':
                    return parseReturnStatement();
                case 'switch':
                    return parseSwitchStatement();
                case 'throw':
                    return parseThrowStatement();
                case 'try':
                    return parseTryStatement();
                case 'var':
                    return parseVariableStatement();
                case 'while':
                    return parseWhileStatement();
                case 'with':
                    return parseWithStatement();
                default:
                    break;
                }
            }

            expr = parseExpression();

            // 12.12 Labelled Statements
            if ((expr.type === Syntax.Identifier) && match(':')) {
                lex();

                key = '$' + expr.name;
                if (Object.prototype.hasOwnProperty.call(state.labelSet, key)) {
                    throwError({}, Messages.Redeclaration, 'Label', expr.name);
                }

                state.labelSet[key] = true;
                labeledBody = parseStatement();
                delete state.labelSet[key];
                return delegate.createLabeledStatement(expr, labeledBody);
            }

            consumeSemicolon();

            return delegate.createExpressionStatement(expr);
        }

        // 13 Function Definition

        function parseFunctionSourceElements() {
            var sourceElement, sourceElements = [], token, directive, firstRestricted,
                oldLabelSet, oldInIteration, oldInSwitch, oldInFunctionBody;

            expect('{');

            while (index < length) {
                if (lookahead.type !== Token.StringLiteral) {
                    break;
                }
                token = lookahead;

                sourceElement = parseSourceElement();
                sourceElements.push(sourceElement);
                if (sourceElement.expression.type !== Syntax.Literal) {
                    // this is not directive
                    break;
                }
                directive = source.slice(token.range[0] + 1, token.range[1] - 1);
                if (directive === 'use strict') {
                    strict = true;
                    if (firstRestricted) {
                        throwErrorTolerant(firstRestricted, Messages.StrictOctalLiteral);
                    }
                } else {
                    if (!firstRestricted && token.octal) {
                        firstRestricted = token;
                    }
                }
            }

            oldLabelSet = state.labelSet;
            oldInIteration = state.inIteration;
            oldInSwitch = state.inSwitch;
            oldInFunctionBody = state.inFunctionBody;

            state.labelSet = {};
            state.inIteration = false;
            state.inSwitch = false;
            state.inFunctionBody = true;

            while (index < length) {
                if (match('}')) {
                    break;
                }
                sourceElement = parseSourceElement();
                if (typeof sourceElement === 'undefined') {
                    break;
                }
                sourceElements.push(sourceElement);
            }

            expect('}');

            state.labelSet = oldLabelSet;
            state.inIteration = oldInIteration;
            state.inSwitch = oldInSwitch;
            state.inFunctionBody = oldInFunctionBody;

            return delegate.createBlockStatement(sourceElements);
        }

        function parseParams(firstRestricted) {
            var param, params = [], token, stricted, paramSet, key, message;
            expect('(');

            if (!match(')')) {
                paramSet = {};
                while (index < length) {
                    token = lookahead;
                    param = parseVariableIdentifier();
                    key = '$' + token.value;
                    if (strict) {
                        if (isRestrictedWord(token.value)) {
                            stricted = token;
                            message = Messages.StrictParamName;
                        }
                        if (Object.prototype.hasOwnProperty.call(paramSet, key)) {
                            stricted = token;
                            message = Messages.StrictParamDupe;
                        }
                    } else if (!firstRestricted) {
                        if (isRestrictedWord(token.value)) {
                            firstRestricted = token;
                            message = Messages.StrictParamName;
                        } else if (isStrictModeReservedWord(token.value)) {
                            firstRestricted = token;
                            message = Messages.StrictReservedWord;
                        } else if (Object.prototype.hasOwnProperty.call(paramSet, key)) {
                            firstRestricted = token;
                            message = Messages.StrictParamDupe;
                        }
                    }
                    params.push(param);
                    paramSet[key] = true;
                    if (match(')')) {
                        break;
                    }
                    expect(',');
                }
            }

            expect(')');

            return {
                params: params,
                stricted: stricted,
                firstRestricted: firstRestricted,
                message: message
            };
        }

        function parseFunctionDeclaration() {
            var id, params = [], body, token, stricted, tmp, firstRestricted, message, previousStrict;

            expectKeyword('function');
            token = lookahead;
            id = parseVariableIdentifier();
            if (strict) {
                if (isRestrictedWord(token.value)) {
                    throwErrorTolerant(token, Messages.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord(token.value)) {
                    firstRestricted = token;
                    message = Messages.StrictFunctionName;
                } else if (isStrictModeReservedWord(token.value)) {
                    firstRestricted = token;
                    message = Messages.StrictReservedWord;
                }
            }

            tmp = parseParams(firstRestricted);
            params = tmp.params;
            stricted = tmp.stricted;
            firstRestricted = tmp.firstRestricted;
            if (tmp.message) {
                message = tmp.message;
            }

            previousStrict = strict;
            body = parseFunctionSourceElements();
            if (strict && firstRestricted) {
                throwError(firstRestricted, message);
            }
            if (strict && stricted) {
                throwErrorTolerant(stricted, message);
            }
            strict = previousStrict;

            return delegate.createFunctionDeclaration(id, params, [], body);
        }

        function parseFunctionExpression() {
            var token, id = null, stricted, firstRestricted, message, tmp, params = [], body, previousStrict;

            expectKeyword('function');

            if (!match('(')) {
                token = lookahead;
                id = parseVariableIdentifier();
                if (strict) {
                    if (isRestrictedWord(token.value)) {
                        throwErrorTolerant(token, Messages.StrictFunctionName);
                    }
                } else {
                    if (isRestrictedWord(token.value)) {
                        firstRestricted = token;
                        message = Messages.StrictFunctionName;
                    } else if (isStrictModeReservedWord(token.value)) {
                        firstRestricted = token;
                        message = Messages.StrictReservedWord;
                    }
                }
            }

            tmp = parseParams(firstRestricted);
            params = tmp.params;
            stricted = tmp.stricted;
            firstRestricted = tmp.firstRestricted;
            if (tmp.message) {
                message = tmp.message;
            }

            previousStrict = strict;
            body = parseFunctionSourceElements();
            if (strict && firstRestricted) {
                throwError(firstRestricted, message);
            }
            if (strict && stricted) {
                throwErrorTolerant(stricted, message);
            }
            strict = previousStrict;

            return delegate.createFunctionExpression(id, params, [], body);
        }

        // 14 Program

        function parseSourceElement() {
            if (lookahead.type === Token.Keyword) {
                switch (lookahead.value) {
                case 'const':
                case 'let':
                    return parseConstLetDeclaration(lookahead.value);
                case 'function':
                    return parseFunctionDeclaration();
                default:
                    return parseStatement();
                }
            }

            if (lookahead.type !== Token.EOF) {
                return parseStatement();
            }
        }

        function parseSourceElements() {
            var sourceElement, sourceElements = [], token, directive, firstRestricted;

            while (index < length) {
                token = lookahead;
                if (token.type !== Token.StringLiteral) {
                    break;
                }

                sourceElement = parseSourceElement();
                sourceElements.push(sourceElement);
                if (sourceElement.expression.type !== Syntax.Literal) {
                    // this is not directive
                    break;
                }
                directive = source.slice(token.range[0] + 1, token.range[1] - 1);
                if (directive === 'use strict') {
                    strict = true;
                    if (firstRestricted) {
                        throwErrorTolerant(firstRestricted, Messages.StrictOctalLiteral);
                    }
                } else {
                    if (!firstRestricted && token.octal) {
                        firstRestricted = token;
                    }
                }
            }

            while (index < length) {
                sourceElement = parseSourceElement();
                if (typeof sourceElement === 'undefined') {
                    break;
                }
                sourceElements.push(sourceElement);
            }
            return sourceElements;
        }

        function parseProgram() {
            var body;
            strict = false;
            peek();
            body = parseSourceElements();
            return delegate.createProgram(body);
        }

        // The following functions are needed only when the option to preserve
        // the comments is active.

        function addComment(type, value, start, end, loc) {
            assert(typeof start === 'number', 'Comment must have valid position');

            // Because the way the actual token is scanned, often the comments
            // (if any) are skipped twice during the lexical analysis.
            // Thus, we need to skip adding a comment if the comment array already
            // handled it.
            if (extra.comments.length > 0) {
                if (extra.comments[extra.comments.length - 1].range[1] > start) {
                    return;
                }
            }

            extra.comments.push({
                type: type,
                value: value,
                range: [start, end],
                loc: loc
            });
        }

        function scanComment() {
            var comment, ch, loc, start, blockComment, lineComment;

            comment = '';
            blockComment = false;
            lineComment = false;

            while (index < length) {
                ch = source[index];

                if (lineComment) {
                    ch = source[index++];
                    if (isLineTerminator(ch.charCodeAt(0))) {
                        loc.end = {
                            line: lineNumber,
                            column: index - lineStart - 1
                        };
                        lineComment = false;
                        addComment('Line', comment, start, index - 1, loc);
                        if (ch === '\r' && source[index] === '\n') {
                            ++index;
                        }
                        ++lineNumber;
                        lineStart = index;
                        comment = '';
                    } else if (index >= length) {
                        lineComment = false;
                        comment += ch;
                        loc.end = {
                            line: lineNumber,
                            column: length - lineStart
                        };
                        addComment('Line', comment, start, length, loc);
                    } else {
                        comment += ch;
                    }
                } else if (blockComment) {
                    if (isLineTerminator(ch.charCodeAt(0))) {
                        if (ch === '\r' && source[index + 1] === '\n') {
                            ++index;
                            comment += '\r\n';
                        } else {
                            comment += ch;
                        }
                        ++lineNumber;
                        ++index;
                        lineStart = index;
                        if (index >= length) {
                            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                        }
                    } else {
                        ch = source[index++];
                        if (index >= length) {
                            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                        }
                        comment += ch;
                        if (ch === '*') {
                            ch = source[index];
                            if (ch === '/') {
                                comment = comment.substr(0, comment.length - 1);
                                blockComment = false;
                                ++index;
                                loc.end = {
                                    line: lineNumber,
                                    column: index - lineStart
                                };
                                addComment('Block', comment, start, index, loc);
                                comment = '';
                            }
                        }
                    }
                } else if (ch === '/') {
                    ch = source[index + 1];
                    if (ch === '/') {
                        loc = {
                            start: {
                                line: lineNumber,
                                column: index - lineStart
                            }
                        };
                        start = index;
                        index += 2;
                        lineComment = true;
                        if (index >= length) {
                            loc.end = {
                                line: lineNumber,
                                column: index - lineStart
                            };
                            lineComment = false;
                            addComment('Line', comment, start, index, loc);
                        }
                    } else if (ch === '*') {
                        start = index;
                        index += 2;
                        blockComment = true;
                        loc = {
                            start: {
                                line: lineNumber,
                                column: index - lineStart - 2
                            }
                        };
                        if (index >= length) {
                            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                        }
                    } else {
                        break;
                    }
                } else if (isWhiteSpace(ch.charCodeAt(0))) {
                    ++index;
                } else if (isLineTerminator(ch.charCodeAt(0))) {
                    ++index;
                    if (ch ===  '\r' && source[index] === '\n') {
                        ++index;
                    }
                    ++lineNumber;
                    lineStart = index;
                } else {
                    break;
                }
            }
        }

        function filterCommentLocation() {
            var i, entry, comment, comments = [];

            for (i = 0; i < extra.comments.length; ++i) {
                entry = extra.comments[i];
                comment = {
                    type: entry.type,
                    value: entry.value
                };
                if (extra.range) {
                    comment.range = entry.range;
                }
                if (extra.loc) {
                    comment.loc = entry.loc;
                }
                comments.push(comment);
            }

            extra.comments = comments;
        }

        function collectToken() {
            var start, loc, token, range, value;

            skipComment();
            start = index;
            loc = {
                start: {
                    line: lineNumber,
                    column: index - lineStart
                }
            };

            token = extra.advance();
            loc.end = {
                line: lineNumber,
                column: index - lineStart
            };

            if (token.type !== Token.EOF) {
                range = [token.range[0], token.range[1]];
                value = source.slice(token.range[0], token.range[1]);
                extra.tokens.push({
                    type: TokenName[token.type],
                    value: value,
                    range: range,
                    loc: loc
                });
            }

            return token;
        }

        function collectRegex() {
            var pos, loc, regex, token;

            skipComment();

            pos = index;
            loc = {
                start: {
                    line: lineNumber,
                    column: index - lineStart
                }
            };

            regex = extra.scanRegExp();
            loc.end = {
                line: lineNumber,
                column: index - lineStart
            };

            if (!extra.tokenize) {
                // Pop the previous token, which is likely '/' or '/='
                if (extra.tokens.length > 0) {
                    token = extra.tokens[extra.tokens.length - 1];
                    if (token.range[0] === pos && token.type === 'Punctuator') {
                        if (token.value === '/' || token.value === '/=') {
                            extra.tokens.pop();
                        }
                    }
                }

                extra.tokens.push({
                    type: 'RegularExpression',
                    value: regex.literal,
                    range: [pos, index],
                    loc: loc
                });
            }

            return regex;
        }

        function filterTokenLocation() {
            var i, entry, token, tokens = [];

            for (i = 0; i < extra.tokens.length; ++i) {
                entry = extra.tokens[i];
                token = {
                    type: entry.type,
                    value: entry.value
                };
                if (extra.range) {
                    token.range = entry.range;
                }
                if (extra.loc) {
                    token.loc = entry.loc;
                }
                tokens.push(token);
            }

            extra.tokens = tokens;
        }

        function createLocationMarker() {
            var marker = {};

            marker.range = [index, index];
            marker.loc = {
                start: {
                    line: lineNumber,
                    column: index - lineStart
                },
                end: {
                    line: lineNumber,
                    column: index - lineStart
                }
            };

            marker.end = function () {
                this.range[1] = index;
                this.loc.end.line = lineNumber;
                this.loc.end.column = index - lineStart;
            };

            marker.applyGroup = function (node) {
                if (extra.range) {
                    node.groupRange = [this.range[0], this.range[1]];
                }
                if (extra.loc) {
                    node.groupLoc = {
                        start: {
                            line: this.loc.start.line,
                            column: this.loc.start.column
                        },
                        end: {
                            line: this.loc.end.line,
                            column: this.loc.end.column
                        }
                    };
                    node = delegate.postProcess(node);
                }
            };

            marker.apply = function (node) {
                if (extra.range) {
                    node.range = [this.range[0], this.range[1]];
                }
                if (extra.loc) {
                    node.loc = {
                        start: {
                            line: this.loc.start.line,
                            column: this.loc.start.column
                        },
                        end: {
                            line: this.loc.end.line,
                            column: this.loc.end.column
                        }
                    };
                    node = delegate.postProcess(node);
                }
            };

            return marker;
        }

        function trackGroupExpression() {
            var marker, expr;

            skipComment();
            marker = createLocationMarker();
            expect('(');

            expr = parseExpression();

            expect(')');

            marker.end();
            marker.applyGroup(expr);

            return expr;
        }

        function trackLeftHandSideExpression() {
            var marker, expr, property;

            skipComment();
            marker = createLocationMarker();

            expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();

            while (match('.') || match('[')) {
                if (match('[')) {
                    property = parseComputedMember();
                    expr = delegate.createMemberExpression('[', expr, property);
                    marker.end();
                    marker.apply(expr);
                } else {
                    property = parseNonComputedMember();
                    expr = delegate.createMemberExpression('.', expr, property);
                    marker.end();
                    marker.apply(expr);
                }
            }

            return expr;
        }

        function trackLeftHandSideExpressionAllowCall() {
            var marker, expr, args, property;

            skipComment();
            marker = createLocationMarker();

            expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();

            while (match('.') || match('[') || match('(')) {
                if (match('(')) {
                    args = parseArguments();
                    expr = delegate.createCallExpression(expr, args);
                    marker.end();
                    marker.apply(expr);
                } else if (match('[')) {
                    property = parseComputedMember();
                    expr = delegate.createMemberExpression('[', expr, property);
                    marker.end();
                    marker.apply(expr);
                } else {
                    property = parseNonComputedMember();
                    expr = delegate.createMemberExpression('.', expr, property);
                    marker.end();
                    marker.apply(expr);
                }
            }

            return expr;
        }

        function filterGroup(node) {
            var n, i, entry;

            n = (Object.prototype.toString.apply(node) === '[object Array]') ? [] : {};
            for (i in node) {
                if (node.hasOwnProperty(i) && i !== 'groupRange' && i !== 'groupLoc') {
                    entry = node[i];
                    if (entry === null || typeof entry !== 'object' || entry instanceof RegExp) {
                        n[i] = entry;
                    } else {
                        n[i] = filterGroup(entry);
                    }
                }
            }
            return n;
        }

        function wrapTrackingFunction(range, loc) {

            return function (parseFunction) {

                function isBinary(node) {
                    return node.type === Syntax.LogicalExpression ||
                        node.type === Syntax.BinaryExpression;
                }

                function visit(node) {
                    var start, end;

                    if (isBinary(node.left)) {
                        visit(node.left);
                    }
                    if (isBinary(node.right)) {
                        visit(node.right);
                    }

                    if (range) {
                        if (node.left.groupRange || node.right.groupRange) {
                            start = node.left.groupRange ? node.left.groupRange[0] : node.left.range[0];
                            end = node.right.groupRange ? node.right.groupRange[1] : node.right.range[1];
                            node.range = [start, end];
                        } else if (typeof node.range === 'undefined') {
                            start = node.left.range[0];
                            end = node.right.range[1];
                            node.range = [start, end];
                        }
                    }
                    if (loc) {
                        if (node.left.groupLoc || node.right.groupLoc) {
                            start = node.left.groupLoc ? node.left.groupLoc.start : node.left.loc.start;
                            end = node.right.groupLoc ? node.right.groupLoc.end : node.right.loc.end;
                            node.loc = {
                                start: start,
                                end: end
                            };
                            node = delegate.postProcess(node);
                        } else if (typeof node.loc === 'undefined') {
                            node.loc = {
                                start: node.left.loc.start,
                                end: node.right.loc.end
                            };
                            node = delegate.postProcess(node);
                        }
                    }
                }

                return function () {
                    var marker, node;

                    skipComment();

                    marker = createLocationMarker();
                    node = parseFunction.apply(null, arguments);
                    marker.end();

                    if (range && typeof node.range === 'undefined') {
                        marker.apply(node);
                    }

                    if (loc && typeof node.loc === 'undefined') {
                        marker.apply(node);
                    }

                    if (isBinary(node)) {
                        visit(node);
                    }

                    return node;
                };
            };
        }

        function patch() {

            var wrapTracking;

            if (extra.comments) {
                extra.skipComment = skipComment;
                skipComment = scanComment;
            }

            if (extra.range || extra.loc) {

                extra.parseGroupExpression = parseGroupExpression;
                extra.parseLeftHandSideExpression = parseLeftHandSideExpression;
                extra.parseLeftHandSideExpressionAllowCall = parseLeftHandSideExpressionAllowCall;
                parseGroupExpression = trackGroupExpression;
                parseLeftHandSideExpression = trackLeftHandSideExpression;
                parseLeftHandSideExpressionAllowCall = trackLeftHandSideExpressionAllowCall;

                wrapTracking = wrapTrackingFunction(extra.range, extra.loc);

                extra.parseAssignmentExpression = parseAssignmentExpression;
                extra.parseBinaryExpression = parseBinaryExpression;
                extra.parseBlock = parseBlock;
                extra.parseFunctionSourceElements = parseFunctionSourceElements;
                extra.parseCatchClause = parseCatchClause;
                extra.parseComputedMember = parseComputedMember;
                extra.parseConditionalExpression = parseConditionalExpression;
                extra.parseConstLetDeclaration = parseConstLetDeclaration;
                extra.parseExpression = parseExpression;
                extra.parseForVariableDeclaration = parseForVariableDeclaration;
                extra.parseFunctionDeclaration = parseFunctionDeclaration;
                extra.parseFunctionExpression = parseFunctionExpression;
                extra.parseNewExpression = parseNewExpression;
                extra.parseNonComputedProperty = parseNonComputedProperty;
                extra.parseObjectProperty = parseObjectProperty;
                extra.parseObjectPropertyKey = parseObjectPropertyKey;
                extra.parsePostfixExpression = parsePostfixExpression;
                extra.parsePrimaryExpression = parsePrimaryExpression;
                extra.parseProgram = parseProgram;
                extra.parsePropertyFunction = parsePropertyFunction;
                extra.parseStatement = parseStatement;
                extra.parseSwitchCase = parseSwitchCase;
                extra.parseUnaryExpression = parseUnaryExpression;
                extra.parseVariableDeclaration = parseVariableDeclaration;
                extra.parseVariableIdentifier = parseVariableIdentifier;

                parseAssignmentExpression = wrapTracking(extra.parseAssignmentExpression);
                parseBinaryExpression = wrapTracking(extra.parseBinaryExpression);
                parseBlock = wrapTracking(extra.parseBlock);
                parseFunctionSourceElements = wrapTracking(extra.parseFunctionSourceElements);
                parseCatchClause = wrapTracking(extra.parseCatchClause);
                parseComputedMember = wrapTracking(extra.parseComputedMember);
                parseConditionalExpression = wrapTracking(extra.parseConditionalExpression);
                parseConstLetDeclaration = wrapTracking(extra.parseConstLetDeclaration);
                parseExpression = wrapTracking(extra.parseExpression);
                parseForVariableDeclaration = wrapTracking(extra.parseForVariableDeclaration);
                parseFunctionDeclaration = wrapTracking(extra.parseFunctionDeclaration);
                parseFunctionExpression = wrapTracking(extra.parseFunctionExpression);
                parseLeftHandSideExpression = wrapTracking(parseLeftHandSideExpression);
                parseNewExpression = wrapTracking(extra.parseNewExpression);
                parseNonComputedProperty = wrapTracking(extra.parseNonComputedProperty);
                parseObjectProperty = wrapTracking(extra.parseObjectProperty);
                parseObjectPropertyKey = wrapTracking(extra.parseObjectPropertyKey);
                parsePostfixExpression = wrapTracking(extra.parsePostfixExpression);
                parsePrimaryExpression = wrapTracking(extra.parsePrimaryExpression);
                parseProgram = wrapTracking(extra.parseProgram);
                parsePropertyFunction = wrapTracking(extra.parsePropertyFunction);
                parseStatement = wrapTracking(extra.parseStatement);
                parseSwitchCase = wrapTracking(extra.parseSwitchCase);
                parseUnaryExpression = wrapTracking(extra.parseUnaryExpression);
                parseVariableDeclaration = wrapTracking(extra.parseVariableDeclaration);
                parseVariableIdentifier = wrapTracking(extra.parseVariableIdentifier);
            }

            if (typeof extra.tokens !== 'undefined') {
                extra.advance = advance;
                extra.scanRegExp = scanRegExp;

                advance = collectToken;
                scanRegExp = collectRegex;
            }
        }

        function unpatch() {
            if (typeof extra.skipComment === 'function') {
                skipComment = extra.skipComment;
            }

            if (extra.range || extra.loc) {
                parseAssignmentExpression = extra.parseAssignmentExpression;
                parseBinaryExpression = extra.parseBinaryExpression;
                parseBlock = extra.parseBlock;
                parseFunctionSourceElements = extra.parseFunctionSourceElements;
                parseCatchClause = extra.parseCatchClause;
                parseComputedMember = extra.parseComputedMember;
                parseConditionalExpression = extra.parseConditionalExpression;
                parseConstLetDeclaration = extra.parseConstLetDeclaration;
                parseExpression = extra.parseExpression;
                parseForVariableDeclaration = extra.parseForVariableDeclaration;
                parseFunctionDeclaration = extra.parseFunctionDeclaration;
                parseFunctionExpression = extra.parseFunctionExpression;
                parseGroupExpression = extra.parseGroupExpression;
                parseLeftHandSideExpression = extra.parseLeftHandSideExpression;
                parseLeftHandSideExpressionAllowCall = extra.parseLeftHandSideExpressionAllowCall;
                parseNewExpression = extra.parseNewExpression;
                parseNonComputedProperty = extra.parseNonComputedProperty;
                parseObjectProperty = extra.parseObjectProperty;
                parseObjectPropertyKey = extra.parseObjectPropertyKey;
                parsePrimaryExpression = extra.parsePrimaryExpression;
                parsePostfixExpression = extra.parsePostfixExpression;
                parseProgram = extra.parseProgram;
                parsePropertyFunction = extra.parsePropertyFunction;
                parseStatement = extra.parseStatement;
                parseSwitchCase = extra.parseSwitchCase;
                parseUnaryExpression = extra.parseUnaryExpression;
                parseVariableDeclaration = extra.parseVariableDeclaration;
                parseVariableIdentifier = extra.parseVariableIdentifier;
            }

            if (typeof extra.scanRegExp === 'function') {
                advance = extra.advance;
                scanRegExp = extra.scanRegExp;
            }
        }

        // This is used to modify the delegate.

        function extend(object, properties) {
            var entry, result = {};

            for (entry in object) {
                if (object.hasOwnProperty(entry)) {
                    result[entry] = object[entry];
                }
            }

            for (entry in properties) {
                if (properties.hasOwnProperty(entry)) {
                    result[entry] = properties[entry];
                }
            }

            return result;
        }

        function tokenize(code, options) {
            var toString,
                token,
                tokens;

            toString = String;
            if (typeof code !== 'string' && !(code instanceof String)) {
                code = toString(code);
            }

            delegate = SyntaxTreeDelegate;
            source = code;
            index = 0;
            lineNumber = (source.length > 0) ? 1 : 0;
            lineStart = 0;
            length = source.length;
            lookahead = null;
            state = {
                allowIn: true,
                labelSet: {},
                inFunctionBody: false,
                inIteration: false,
                inSwitch: false
            };

            extra = {};

            // Options matching.
            options = options || {};

            // Of course we collect tokens here.
            options.tokens = true;
            extra.tokens = [];
            extra.tokenize = true;
            // The following two fields are necessary to compute the Regex tokens.
            extra.openParenToken = -1;
            extra.openCurlyToken = -1;

            extra.range = (typeof options.range === 'boolean') && options.range;
            extra.loc = (typeof options.loc === 'boolean') && options.loc;

            if (typeof options.comment === 'boolean' && options.comment) {
                extra.comments = [];
            }
            if (typeof options.tolerant === 'boolean' && options.tolerant) {
                extra.errors = [];
            }

            if (length > 0) {
                if (typeof source[0] === 'undefined') {
                    // Try first to convert to a string. This is good as fast path
                    // for old IE which understands string indexing for string
                    // literals only and not for string object.
                    if (code instanceof String) {
                        source = code.valueOf();
                    }
                }
            }

            patch();

            try {
                peek();
                if (lookahead.type === Token.EOF) {
                    return extra.tokens;
                }

                token = lex();
                while (lookahead.type !== Token.EOF) {
                    try {
                        token = lex();
                    } catch (lexError) {
                        token = lookahead;
                        if (extra.errors) {
                            extra.errors.push(lexError);
                            // We have to break on the first error
                            // to avoid infinite loops.
                            break;
                        } else {
                            throw lexError;
                        }
                    }
                }

                filterTokenLocation();
                tokens = extra.tokens;
                if (typeof extra.comments !== 'undefined') {
                    filterCommentLocation();
                    tokens.comments = extra.comments;
                }
                if (typeof extra.errors !== 'undefined') {
                    tokens.errors = extra.errors;
                }
            } catch (e) {
                throw e;
            } finally {
                unpatch();
                extra = {};
            }
            return tokens;
        }

        function parse(code, options) {
            var program, toString;

            toString = String;
            if (typeof code !== 'string' && !(code instanceof String)) {
                code = toString(code);
            }

            delegate = SyntaxTreeDelegate;
            source = code;
            index = 0;
            lineNumber = (source.length > 0) ? 1 : 0;
            lineStart = 0;
            length = source.length;
            lookahead = null;
            state = {
                allowIn: true,
                labelSet: {},
                inFunctionBody: false,
                inIteration: false,
                inSwitch: false
            };

            extra = {};
            if (typeof options !== 'undefined') {
                extra.range = (typeof options.range === 'boolean') && options.range;
                extra.loc = (typeof options.loc === 'boolean') && options.loc;

                if (extra.loc && options.source !== null && options.source !== undefined) {
                    delegate = extend(delegate, {
                        'postProcess': function (node) {
                            node.loc.source = toString(options.source);
                            return node;
                        }
                    });
                }

                if (typeof options.tokens === 'boolean' && options.tokens) {
                    extra.tokens = [];
                }
                if (typeof options.comment === 'boolean' && options.comment) {
                    extra.comments = [];
                }
                if (typeof options.tolerant === 'boolean' && options.tolerant) {
                    extra.errors = [];
                }
            }

            if (length > 0) {
                if (typeof source[0] === 'undefined') {
                    // Try first to convert to a string. This is good as fast path
                    // for old IE which understands string indexing for string
                    // literals only and not for string object.
                    if (code instanceof String) {
                        source = code.valueOf();
                    }
                }
            }

            patch();
            try {
                program = parseProgram();
                if (typeof extra.comments !== 'undefined') {
                    filterCommentLocation();
                    program.comments = extra.comments;
                }
                if (typeof extra.tokens !== 'undefined') {
                    filterTokenLocation();
                    program.tokens = extra.tokens;
                }
                if (typeof extra.errors !== 'undefined') {
                    program.errors = extra.errors;
                }
                if (extra.range || extra.loc) {
                    program.body = filterGroup(program.body);
                }
            } catch (e) {
                throw e;
            } finally {
                unpatch();
                extra = {};
            }

            return program;
        }

        // Sync with package.json and component.json.
        exports.version = '1.1.0-dev';

        exports.tokenize = tokenize;

        exports.parse = parse;

        // Deep copy.
        exports.Syntax = (function () {
            var name, types = {};

            if (typeof Object.create === 'function') {
                types = Object.create(null);
            }

            for (name in Syntax) {
                if (Syntax.hasOwnProperty(name)) {
                    types[name] = Syntax[name];
                }
            }

            if (typeof Object.freeze === 'function') {
                Object.freeze(types);
            }

            return types;
        }());
    });

/**
 * combocodegen.js ( based on escodegen )
 * @author dron
 * @create 2013-03-09
 */
    void function( factory, global ) {
        var parseConf, generateConf, host, escodegen;
        
        host = global.document;

        if( host.combocodegen )
            return ;

        parseConf = { raw: true, loc: true  };
        generateConf = {  
            format: { indent: { style: "    " }, quotes: "double" }
        };
        factory( escodegen = {}, global );

        host.combocodegen = function( code ){
            return escodegen.generate( 
                host.esprima.parse( code.origContent, parseConf ), generateConf, code );
        };
    }(function ( exports, global ) {
        'use strict';

        var Syntax,
            Precedence,
            BinaryPrecedence,
            Regex,
            VisitorKeys,
            VisitorOption,
            SourceNode,
            isArray,
            base,
            indent,
            json,
            renumber,
            hexadecimal,
            quotes,
            escapeless,
            newline,
            space,
            parentheses,
            semicolons,
            safeConcatenation,
            extra,
            parse,
            sourceMap;

        var _slice = [].slice, _push = [].push, _join = [].join, guid, currentCode, snippetsIdSet;


        var StatusPool = document.StatusPool;

        // NOTE: 以下的代码新增了 idBuffer 和 entrustedTraceId 的设计
        // idBuffer: 上一个语法环境里预置的 id 数组，在本语法环增中会追加新的代码片断 id 到其后，一般统一在外层语法环境里去做 trace 跟踪
        // entrustedTraceId: 上一个语法环境里预置的 id 数组，用于委托到本语法环境里做 trace 跟踪（正好与上面相反）

        // NOTE: 用于生成代码关键 token 的唯一标识数字
        guid = function(){
            var index = 0;
            return function( length, joinWith ){
                if( !length )
                    return index ++;

                for(var i = 0, result = []; i < length; i ++)
                    result.push( index ++ );

                if( joinWith )
                    _push.apply( result, joinWith );

                return result;
            }
        }();

        Syntax = {
            AssignmentExpression: 'AssignmentExpression',
            ArrayExpression: 'ArrayExpression',
            BlockStatement: 'BlockStatement',
            BinaryExpression: 'BinaryExpression',
            BreakStatement: 'BreakStatement',
            CallExpression: 'CallExpression',
            CatchClause: 'CatchClause',
            ConditionalExpression: 'ConditionalExpression',
            ContinueStatement: 'ContinueStatement',
            DoWhileStatement: 'DoWhileStatement',
            DebuggerStatement: 'DebuggerStatement',
            EmptyStatement: 'EmptyStatement',
            ExpressionStatement: 'ExpressionStatement',
            ForStatement: 'ForStatement',
            ForInStatement: 'ForInStatement',
            FunctionDeclaration: 'FunctionDeclaration',
            FunctionExpression: 'FunctionExpression',
            Identifier: 'Identifier',
            IfStatement: 'IfStatement',
            Literal: 'Literal',
            LabeledStatement: 'LabeledStatement',
            LogicalExpression: 'LogicalExpression',
            MemberExpression: 'MemberExpression',
            NewExpression: 'NewExpression',
            ObjectExpression: 'ObjectExpression',
            Program: 'Program',
            Property: 'Property',
            ReturnStatement: 'ReturnStatement',
            SequenceExpression: 'SequenceExpression',
            SwitchStatement: 'SwitchStatement',
            SwitchCase: 'SwitchCase',
            ThisExpression: 'ThisExpression',
            ThrowStatement: 'ThrowStatement',
            TryStatement: 'TryStatement',
            UnaryExpression: 'UnaryExpression',
            UpdateExpression: 'UpdateExpression',
            VariableDeclaration: 'VariableDeclaration',
            VariableDeclarator: 'VariableDeclarator',
            WhileStatement: 'WhileStatement',
            WithStatement: 'WithStatement'
        };

        Precedence = {
            Sequence: 0,
            Assignment: 1,
            Conditional: 2,
            LogicalOR: 3,
            LogicalAND: 4,
            BitwiseOR: 5,
            BitwiseXOR: 6,
            BitwiseAND: 7,
            Equality: 8,
            Relational: 9,
            BitwiseSHIFT: 10,
            Additive: 11,
            Multiplicative: 12,
            Unary: 13,
            Postfix: 14,
            Call: 15,
            New: 16,
            Member: 17,
            Primary: 18
        };

        BinaryPrecedence = {
            '||': Precedence.LogicalOR,
            '&&': Precedence.LogicalAND,
            '|': Precedence.BitwiseOR,
            '^': Precedence.BitwiseXOR,
            '&': Precedence.BitwiseAND,
            '==': Precedence.Equality,
            '!=': Precedence.Equality,
            '===': Precedence.Equality,
            '!==': Precedence.Equality,
            '<': Precedence.Relational,
            '>': Precedence.Relational,
            '<=': Precedence.Relational,
            '>=': Precedence.Relational,
            'in': Precedence.Relational,
            'instanceof': Precedence.Relational,
            '<<': Precedence.BitwiseSHIFT,
            '>>': Precedence.BitwiseSHIFT,
            '>>>': Precedence.BitwiseSHIFT,
            '+': Precedence.Additive,
            '-': Precedence.Additive,
            '*': Precedence.Multiplicative,
            '%': Precedence.Multiplicative,
            '/': Precedence.Multiplicative
        };

        Regex = {
            NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
        };

        function returnSelf( string ){
            return string;
        }

        function getDefaultOptions() {
            // default options
            return {
                indent: null,
                base: null,
                parse: null,
                comment: false,
                format: {
                    indent: {
                        style: '    ',
                        base: 0,
                        adjustMultilineComment: false
                    },
                    json: false,
                    renumber: false,
                    hexadecimal: false,
                    quotes: 'single',
                    escapeless: false,
                    compact: false,
                    parentheses: true,
                    semicolons: true,
                    safeConcatenation: false
                },
                sourceMap: null,
                sourceMapWithCode: false
            };
        }

        function stringToArray(str) {
            var length = str.length,
                result = [],
                i;
            for (i = 0; i < length; i += 1) {
                result[i] = str.charAt(i);
            }
            return result;
        }

        function stringRepeat(str, num) {
            var result = '';

            for (num |= 0; num > 0; num >>>= 1, str += str) {
                if (num & 1) {
                    result += str;
                }
            }

            return result;
        }

        // NOTE: 新增各种包装函数，用于辅助实现代码入侵和代码跟踪展示
        function wrapTrackerDelimiter( string ){
            return "{<}" + string + "{>}";
        }

        function injectAssistedCode( content ){
            return wrapTrackerDelimiter( "/* TRACKERINJECTJS */" + content );
        }

        function injectCodeFragmentTrace( id /* , id, id, .. */ ){
            return injectAssistedCode( "__tracker__(" + _join.call( arguments, "," ) + ");" );
        }

        function injectCodeFragmentTraceWithReturn( id /* , id, id, .. */ ){
            return injectAssistedCode( "__tracker__(" + _join.call( arguments, "," ) + ")" );
        }

        function wrapCodeFragmentHtml( fragment, id ){
            if( !snippetsIdSet[ id ] )
                snippetsIdSet[ id ] = 1;

            StatusPool.snippetToCodePut( id, currentCode );

            return wrapTrackerDelimiter( "<!-- TRACKERINJECTHTML --><span id=ckey-" + id + ">" ) + fragment +
                wrapTrackerDelimiter( "<!-- TRACKERINJECTHTML --></span>" );
        }

        isArray = Array.isArray;

        if (!isArray)
            isArray = function isArray(array) {
                return Object.prototype.toString.call(array) === '[object Array]';
            };

        // Fallback for the non SourceMap environment
        function SourceNodeMock(line, column, filename, chunk) {
            var result = [];

            function flatten(input) {
                var i, iz;
                if (isArray(input)) {
                    for (i = 0, iz = input.length; i < iz; ++i) {
                        flatten(input[i]);
                    }
                } else if (input instanceof SourceNodeMock) {
                    result.push(input);
                } else if (typeof input === 'string' && input) {
                    result.push(input);
                }
            }

            flatten(chunk);
            this.children = result;
        }

        SourceNodeMock.prototype.toString = function toString() {
            var res = '', i, iz, node;
            for (i = 0, iz = this.children.length; i < iz; ++i) {
                node = this.children[i];
                if (node instanceof SourceNodeMock) {
                    res += node.toString();
                } else {
                    res += node;
                }
            }
            return res;
        };

        SourceNodeMock.prototype.replaceRight = function replaceRight(pattern, replacement) {
            var last = this.children[this.children.length - 1];
            if (last instanceof SourceNodeMock) {
              last.replaceRight(pattern, replacement);
            } else if (typeof last === 'string') {
              this.children[this.children.length - 1] = last.replace(pattern, replacement);
            } else {
              this.children.push(''.replace(pattern, replacement));
            }
            return this;
        };

        SourceNodeMock.prototype.join = function join(sep) {
            var i, iz, result;
            result = [];
            iz = this.children.length;
            if (iz > 0) {
                for (i = 0, iz -= 1; i < iz; ++i) {
                    result.push(this.children[i], sep);
                }
                result.push(this.children[iz]);
                this.children = result;
            }
            return this;
        };

        function endsWithLineTerminator(str) {
            var ch = str.charAt(str.length - 1);
            return ch === '\r' || ch === '\n';
        }

        function shallowCopy(obj) {
            var ret = {}, key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    ret[key] = obj[key];
                }
            }
            return ret;
        }

        function deepCopy(obj) {
            var ret = {}, key, val;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    val = obj[key];
                    if (typeof val === 'object' && val !== null) {
                        ret[key] = deepCopy(val);
                    } else {
                        ret[key] = val;
                    }
                }
            }
            return ret;
        }

        function updateDeeply(target, override) {
            var key, val;

            function isHashObject(target) {
                return typeof target === 'object' && target instanceof Object && !(target instanceof RegExp);
            }

            for (key in override) {
                if (override.hasOwnProperty(key)) {
                    val = override[key];
                    if (isHashObject(val)) {
                        if (isHashObject(target[key])) {
                            updateDeeply(target[key], val);
                        } else {
                            target[key] = updateDeeply({}, val);
                        }
                    } else {
                        target[key] = val;
                    }
                }
            }
            return target;
        }

        function generateNumber(value) {
            var result, point, temp, exponent, pos;

            if (value !== value) {
                throw new Error('Numeric literal whose value is NaN');
            }
            if (value < 0 || (value === 0 && 1 / value < 0)) {
                throw new Error('Numeric literal whose value is negative');
            }

            if (value === 1 / 0) {
                return json ? 'null' : renumber ? '1e400' : '1e+400';
            }

            result = '' + value;
            if (!renumber || result.length < 3) {
                return result;
            }

            point = result.indexOf('.');
            if (!json && result.charAt(0) === '0' && point === 1) {
                point = 0;
                result = result.slice(1);
            }
            temp = result;
            result = result.replace('e+', 'e');
            exponent = 0;
            if ((pos = temp.indexOf('e')) > 0) {
                exponent = +temp.slice(pos + 1);
                temp = temp.slice(0, pos);
            }
            if (point >= 0) {
                exponent -= temp.length - point - 1;
                temp = +(temp.slice(0, point) + temp.slice(point + 1)) + '';
            }
            pos = 0;
            while (temp.charAt(temp.length + pos - 1) === '0') {
                pos -= 1;
            }
            if (pos !== 0) {
                exponent -= pos;
                temp = temp.slice(0, pos);
            }
            if (exponent !== 0) {
                temp += 'e' + exponent;
            }
            if ((temp.length < result.length ||
                        (hexadecimal && value > 1e12 && Math.floor(value) === value && (temp = '0x' + value.toString(16)).length < result.length)) &&
                    +temp === value) {
                result = temp;
            }

            return result;
        }

        function escapeAllowedCharacter(ch, next) {
            var code = ch.charCodeAt(0), hex = code.toString(16), result = '\\';

            switch (ch) {
            case '\b':
                result += 'b';
                break;
            case '\f':
                result += 'f';
                break;
            case '\t':
                result += 't';
                break;
            default:
                if (json || code > 0xff) {
                    result += 'u' + '0000'.slice(hex.length) + hex;
                } else if (ch === '\u0000' && '0123456789'.indexOf(next) < 0) {
                    result += '0';
                } else if (ch === '\v') {
                    result += 'v';
                } else {
                    result += 'x' + '00'.slice(hex.length) + hex;
                }
                break;
            }

            return result;
        }

        function escapeDisallowedCharacter(ch) {
            var result = '\\';
            switch (ch) {
            case '\\':
                result += '\\';
                break;
            case '\n':
                result += 'n';
                break;
            case '\r':
                result += 'r';
                break;
            case '\u2028':
                result += 'u2028';
                break;
            case '\u2029':
                result += 'u2029';
                break;
            default:
                throw new Error('Incorrectly classified character');
            }

            return result;
        }

        function escapeString(str) {
            var result = '', i, len, ch, next, singleQuotes = 0, doubleQuotes = 0, single;

            if (typeof str[0] === 'undefined') {
                str = stringToArray(str);
            }

            for (i = 0, len = str.length; i < len; i += 1) {
                ch = str[i];
                if (ch === '\'') {
                    singleQuotes += 1;
                } else if (ch === '"') {
                    doubleQuotes += 1;
                } else if (ch === '/' && json) {
                    result += '\\';
                } else if ('\\\n\r\u2028\u2029'.indexOf(ch) >= 0) {
                    result += escapeDisallowedCharacter(ch);
                    continue;
                } else if ((json && ch < ' ') || !(json || escapeless || (ch >= ' ' && ch <= '~'))) {
                    result += escapeAllowedCharacter(ch, str[i + 1]);
                    continue;
                }
                result += ch;
            }

            single = !(quotes === 'double' || (quotes === 'auto' && doubleQuotes < singleQuotes));
            str = result;
            result = single ? '\'' : '"';

            if (typeof str[0] === 'undefined') {
                str = stringToArray(str);
            }

            for (i = 0, len = str.length; i < len; i += 1) {
                ch = str[i];
                if ((ch === '\'' && single) || (ch === '"' && !single)) {
                    result += '\\';
                }
                result += ch;
            }

            return result + (single ? '\'' : '"');
        }

        function isWhiteSpace(ch) {
            return '\t\v\f \xa0'.indexOf(ch) >= 0 || (ch.charCodeAt(0) >= 0x1680 && '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff'.indexOf(ch) >= 0);
        }

        function isLineTerminator(ch) {
            return '\n\r\u2028\u2029'.indexOf(ch) >= 0;
        }

        function isIdentifierPart(ch) {
            return (ch === '$') || (ch === '_') || (ch === '\\') ||
                (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') ||
                ((ch >= '0') && (ch <= '9')) ||
                ((ch.charCodeAt(0) >= 0x80) && Regex.NonAsciiIdentifierPart.test(ch));
        }

        function join(left, right) {
            var leftSource = toSourceNode(left).toString(),
                rightSource = toSourceNode(right).toString(),
                leftChar = leftSource.charAt(leftSource.length - 1),
                rightChar = rightSource.charAt(0);

            if (((leftChar === '+' || leftChar === '-') && leftChar === rightChar) || (isIdentifierPart(leftChar) && isIdentifierPart(rightChar))) {
                return [left, ' ', right];
            } else if (isWhiteSpace(leftChar) || isLineTerminator(leftChar) || isWhiteSpace(rightChar) || isLineTerminator(rightChar)) {
                return [left, right];
            }
            return [left, space, right];
        }

        function addIndent(stmt) {
            return [base, stmt];
        }

        function withIndent(fn) {
            var previousBase;
            previousBase = base;
            base += indent;
            var result = fn.call(this, base);
            base = previousBase;
            return result;
        }

        function calculateSpaces(str) {
            var i;
            for (i = str.length - 1; i >= 0; i -= 1) {
                if (isLineTerminator(str.charAt(i))) {
                    break;
                }
            }
            return (str.length - 1) - i;
        }

        function toSourceNode(generated, node) {
            if (node == null) {
                if (generated instanceof SourceNode) {
                    return generated;
                } else {
                    node = {};
                }
            }
            if (node.loc == null) {
                return new SourceNode(null, null, sourceMap, generated);
            }
            return new SourceNode(node.loc.start.line, node.loc.start.column, sourceMap, generated);
        }

        function adjustMultilineComment(value, specialBase) {
            var array, i, len, line, j, ch, spaces, previousBase;

            array = value.split(/\r\n|[\r\n]/);
            spaces = Number.MAX_VALUE;

            // first line doesn't have indentation
            for (i = 1, len = array.length; i < len; i += 1) {
                line = array[i];
                j = 0;
                while (j < line.length && isWhiteSpace(line[j])) {
                    j += 1;
                }
                if (spaces > j) {
                    spaces = j;
                }
            }

            if (typeof specialBase !== 'undefined') {
                // pattern like
                // {
                //   var t = 20;  /*
                //                 * this is comment
                //                 */
                // }
                previousBase = base;
                if (array[1][spaces] === '*') {
                    specialBase += ' ';
                }
                base = specialBase;
            } else {
                if (spaces & 1) {
                    // /*
                    //  *
                    //  */
                    // If spaces are odd number, above pattern is considered.
                    // We waste 1 space.
                    spaces -= 1;
                }
                previousBase = base;
            }

            for (i = 1, len = array.length; i < len; i += 1) {
                array[i] = toSourceNode(addIndent(array[i].slice(spaces))).join('');
            }

            base = previousBase;

            return array.join('\n');
        }

        function generateComment(comment, specialBase) {
            if (comment.type === 'Line') {
                if (endsWithLineTerminator(comment.value)) {
                    return '//' + comment.value;
                } else {
                    // Always use LineTerminator
                    return '//' + comment.value + '\n';
                }
            }
            if (extra.format.indent.adjustMultilineComment && /[\n\r]/.test(comment.value)) {
                return adjustMultilineComment('/*' + comment.value + '*/', specialBase);
            }
            return '/*' + comment.value + '*/';
        }

        function addCommentsToStatement(stmt, result) {
            var i, len, comment, save, node, tailingToStatement, specialBase, fragment;

            if (stmt.leadingComments && stmt.leadingComments.length > 0) {
                save = result;

                comment = stmt.leadingComments[0];
                result = [];
                if (safeConcatenation && stmt.type === Syntax.Program && stmt.body.length === 0) {
                    result.push('\n');
                }
                result.push(generateComment(comment));
                if (!endsWithLineTerminator(toSourceNode(result).toString())) {
                    result.push('\n');
                }

                for (i = 1, len = stmt.leadingComments.length; i < len; i += 1) {
                    comment = stmt.leadingComments[i];
                    fragment = [generateComment(comment)];
                    if (!endsWithLineTerminator(toSourceNode(fragment).toString())) {
                        fragment.push('\n');
                    }
                    result.push(addIndent(fragment));
                }

                result.push(addIndent(save));
            }

            if (stmt.trailingComments) {
                tailingToStatement = !endsWithLineTerminator(toSourceNode(result).toString());
                specialBase = stringRepeat(' ', calculateSpaces(toSourceNode([base, result, indent]).toString()));
                for (i = 0, len = stmt.trailingComments.length; i < len; i += 1) {
                    comment = stmt.trailingComments[i];
                    if (tailingToStatement) {
                        // We assume target like following script
                        //
                        // var t = 20;  /**
                        //               * This is comment of t
                        //               */
                        if (i === 0) {
                            // first case
                            result.push(indent);
                        } else {
                            result.push(specialBase);
                        }
                        result.push(generateComment(comment, specialBase));
                    } else {
                        result.push(addIndent(generateComment(comment)));
                    }
                    if (i !== len - 1 && !endsWithLineTerminator(toSourceNode(result).toString())) {
                        result.push('\n');
                    }
                }
            }

            return result;
        }

        function parenthesize( text, current, should, wrapHtml ) {
            wrapHtml = wrapHtml || returnSelf;

            if ( current < should ) {
                return [ wrapHtml( '(' ), ' ', text, ' ', wrapHtml( ')' ) ];
            }
            return text;
        }

        function maybeBlock( stmt, semicolonOptional, entrustedTraceId, idBuffer ) {
            var result, noLeadingComment;

            // NOTE: entrustedTraceId 用于接受外部语法的委托 traceId

            noLeadingComment = !extra.comment || !stmt.leadingComments;

            if (stmt.type === Syntax.BlockStatement && noLeadingComment) {
                return [ space, generateStatement( stmt, {
                    entrustedTraceId: entrustedTraceId,
                    idBuffer: idBuffer
                } ) ];
            }

            if (stmt.type === Syntax.EmptyStatement && noLeadingComment) {
                return ';';
            }

            // if( typeof isAddBlockSymbol == "undefined" || isAddBlockSymbol ){
            withIndent(function (indent) {
                var id = guid( 2, entrustedTraceId );

                result = [
                    " ",
                    wrapCodeFragmentHtml( "{", id[ 0 ] ),
                    injectCodeFragmentTrace( id ),
                    newline, 
                    addIndent( 
                        generateStatement( stmt, { semicolonOptional: semicolonOptional } ) ), 
                    newline, 
                    base.slice( 4 ),
                    wrapCodeFragmentHtml( "}", id[ 1 ] )
                ];

                if( idBuffer )
                    idBuffer.push( id[0], id[1] );
            });

            return result;
        }

        function maybeBlockSuffix( stmt, result ) {
            var ends = endsWithLineTerminator(toSourceNode(result).toString());
            if (stmt.type === Syntax.BlockStatement && (!extra.comment || !stmt.leadingComments) && !ends) {
                return [result, space];
            }
            if (ends) {
                return [result, base];
            }
            return [result, newline, base];
        }

        function generateFunctionBody( node, idBuffer ) {
            var result, i, len, wrapHtml;

            wrapHtml = idBuffer ? function( string ){
                var id;
                idBuffer.push( id = guid() );
                return wrapCodeFragmentHtml( string, id );
            } : returnSelf;

            len = node.params.length;
            result = [ wrapHtml( '(' ), len ? space : '' ];

            for (i = 0; i < len; i += 1) {
                result.push( wrapHtml( node.params[i].name ) );
                if (i + 1 < len) {
                    result.push( ',' + space );
                }
            }

            result.push( 
                len ? space : '',
                wrapHtml( ')' ),
                maybeBlock( node.body, null, null, idBuffer )
            );
            return result;
        }

        function generateExpression( expr, option ) {
            var result, precedence, currentPrecedence, i, len, raw, fragment, multiline, leftChar, leftSource, rightChar, rightSource, allowIn, allowCall, idBuffer, wrapHtml, allowUnparenthesizedNew;

            precedence = option.precedence;
            allowIn = option.allowIn;
            allowCall = option.allowCall;
            idBuffer = option.idBuffer;

            wrapHtml = idBuffer ? function( string ){
                var id;
                idBuffer.push( id = guid() );
                return wrapCodeFragmentHtml( string, id );
            } : returnSelf;

            switch (expr.type) {

            case Syntax.SequenceExpression:
                result = [];
                allowIn |= ( Precedence.Sequence < precedence );

                for (i = 0, len = expr.expressions.length; i < len; i += 1) {
                    result.push( generateExpression( expr.expressions[i], {
                        precedence: Precedence.Assignment,
                        allowIn: allowIn,
                        allowCall: true,
                        idBuffer: idBuffer
                    }) );
                    if (i + 1 < len) {
                        result.push( ',' + space );
                    }
                }
                result = parenthesize( result, Precedence.Sequence, precedence, wrapHtml );
                break;

            case Syntax.AssignmentExpression:
                allowIn |= (Precedence.Assignment < precedence);
                result = parenthesize(
                    [
                        generateExpression( expr.left, {
                            precedence: Precedence.Call,
                            allowIn: allowIn,
                            allowCall: true,
                            idBuffer: idBuffer
                        }),
                        space + wrapHtml( expr.operator ) + space,
                        generateExpression( expr.right, {
                            precedence: Precedence.Assignment,
                            allowIn: allowIn,
                            allowCall: true,
                            idBuffer: idBuffer
                        })
                    ],
                    Precedence.Assignment,
                    precedence, 
                    wrapHtml
                );
                break;

            case Syntax.ConditionalExpression:
                allowIn |= (Precedence.Conditional < precedence);
                result = parenthesize(
                    [
                        generateExpression(expr.test, {
                            precedence: Precedence.LogicalOR,
                            allowIn: allowIn,
                            allowCall: true,
                            idBuffer: idBuffer
                        }),
                        space + wrapHtml( '?' ) + space,
                        generateExpression(expr.consequent, {
                            precedence: Precedence.Assignment,
                            allowIn: allowIn,
                            allowCall: true,
                            idBuffer: idBuffer
                        }),
                        space + wrapHtml( ':' ) + space,
                        generateExpression(expr.alternate, {
                            precedence: Precedence.Assignment,
                            allowIn: allowIn,
                            allowCall: true,
                            idBuffer: idBuffer
                        })
                    ],
                    Precedence.Conditional,
                    precedence, 
                    wrapHtml
                );
                break;

            case Syntax.LogicalExpression:
            case Syntax.BinaryExpression:
                currentPrecedence = BinaryPrecedence[expr.operator];

                allowIn |= (currentPrecedence < precedence);

                result = join(
                    generateExpression(expr.left, {
                        precedence: currentPrecedence,
                        allowIn: allowIn,
                        allowCall: true,
                        idBuffer: idBuffer
                    }),
                    wrapHtml( expr.operator )
                );

                fragment = generateExpression(expr.right, {
                    precedence: currentPrecedence + 1,
                    allowIn: allowIn,
                    allowCall: true,
                    idBuffer: idBuffer
                });

                if (expr.operator === '/' && fragment.toString().charAt(0) === '/') {
                    // If '/' concats with '/', it is interpreted as comment start
                    result.push(' ', wrapHtml( fragment ));
                } else {
                    result = join(result, wrapHtml( fragment ));
                }

                if (expr.operator === 'in' && !allowIn) {
                    result = [ wrapHtml('('), result, wrapHtml( ')' ) ];
                } else {
                    result = parenthesize( result, currentPrecedence, precedence, wrapHtml );
                }

                break;

            case Syntax.CallExpression:
                result = [ generateExpression( expr.callee, {
                    precedence: Precedence.Call,
                    allowIn: true,
                    allowCall: true,
                    allowUnparenthesizedNew: false,
                    idBuffer: idBuffer
                }) ];

                result.push( wrapHtml( '(' ) );

                for (i = 0, len = expr['arguments'].length; i < len; i += 1) {
                    result.push(
                        space,
                        generateExpression( expr['arguments'][i], {
                            precedence: Precedence.Assignment,
                            allowIn: true,
                            allowCall: true,
                            idBuffer: idBuffer
                        })
                    );
                    result.push( i + 1 < len ? ',' : space );
                }

                result.push( wrapHtml( ')' ) );

                if ( !allowCall ) {
                    result = [ wrapHtml( '(' ), result, wrapHtml( ')' ) ];
                } else {
                    result = parenthesize( result, Precedence.Call, precedence, wrapHtml );
                }
                break;

            case Syntax.NewExpression:
                len = expr['arguments'].length;
                allowUnparenthesizedNew = option.allowUnparenthesizedNew === undefined || option.allowUnparenthesizedNew;

                result = join(
                    wrapHtml( 'new' ),
                    generateExpression(expr.callee, {
                        precedence: Precedence.New,
                        allowIn: true,
                        allowCall: false,
                        allowUnparenthesizedNew: allowUnparenthesizedNew && !parentheses && len === 0,
                        idBuffer: idBuffer
                    })
                );

                if (!allowUnparenthesizedNew || parentheses || len > 0) {
                    result.push( wrapHtml( '(' ) );
                    for (i = 0; i < len; i += 1) {
                        result.push( space, generateExpression(expr['arguments'][i], {
                            precedence: Precedence.Assignment,
                            allowIn: true,
                            allowCall: true,
                            idBuffer: idBuffer
                        } ));
                        result.push( i + 1 < len ? ',' : space );
                    }
                    result.push( wrapHtml( ')' ) );
                }

                result = parenthesize( result, Precedence.New, precedence, wrapHtml );
                break;

            case Syntax.MemberExpression:
                result = [ generateExpression( expr.object, {
                    precedence: Precedence.Call,
                    allowIn: true,
                    allowCall: allowCall,
                    allowUnparenthesizedNew: false,
                    idBuffer: idBuffer
                } ) ];

                if (expr.computed) {
                    result.push( wrapHtml( '[' ), generateExpression(expr.property, {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: allowCall,
                        idBuffer: idBuffer
                    }), wrapHtml( ']' ) );
                } else {
                    if (expr.object.type === Syntax.Literal && typeof expr.object.value === 'number') {
                        if (result.indexOf('.') < 0) {
                            if (!/[eExX]/.test(result) && !(result.length >= 2 && result[0] === '0')) {
                                result.push( wrapHtml( '.' ) );
                            }
                        }
                    }
                    result.push( '.' + wrapHtml( expr.property.name ) );
                }

                result = parenthesize( result, Precedence.Member, precedence, wrapHtml );
                break;

            case Syntax.UnaryExpression:
                fragment = generateExpression(expr.argument, {
                    precedence: Precedence.Unary,
                    allowIn: true,
                    allowCall: true,
                    idBuffer: idBuffer
                });

                if (space === '') {
                    result = join( wrapHtml( expr.operator ), fragment );
                } else {
                    result = [ wrapHtml( expr.operator ) ];
                    if (expr.operator.length > 2) {
                        // delete, void, typeof
                        // get `typeof []`, not `typeof[]`
                        result = join(result, fragment);
                    } else {
                        // Prevent inserting spaces between operator and argument if it is unnecessary
                        // like, `!cond`
                        leftSource = toSourceNode(result).toString();
                        leftChar = leftSource.charAt(leftSource.length - 1);
                        rightChar = fragment.toString().charAt(0);

                        if (((leftChar === '+' || leftChar === '-') && leftChar === rightChar) || (isIdentifierPart(leftChar) && isIdentifierPart(rightChar))) {
                            result.push( ' ', fragment );
                        } else {
                            result.push( fragment );
                        }
                    }
                }
                result = parenthesize( result, Precedence.Unary, precedence, wrapHtml );
                break;

            case Syntax.UpdateExpression:
                if (expr.prefix) {
                    result = parenthesize(
                        [
                            wrapHtml( expr.operator ),
                            generateExpression(expr.argument, {
                                precedence: Precedence.Unary,
                                allowIn: true,
                                allowCall: true,
                                idBuffer: idBuffer
                            })
                        ],
                        Precedence.Unary,
                        precedence, 
                        wrapHtml
                    );
                } else {
                    result = parenthesize(
                        [
                            generateExpression(expr.argument, {
                                precedence: Precedence.Postfix,
                                allowIn: true,
                                allowCall: true,
                                idBuffer: idBuffer
                            }),
                            wrapHtml( expr.operator )
                        ],
                        Precedence.Postfix,
                        precedence, 
                        wrapHtml
                    );
                }
                break;

            case Syntax.FunctionExpression:
                result = wrapHtml( 'function' );
                
                if ( expr.id ) {
                    result += ' ' + wrapHtml( expr.id.name );
                } else {
                    result += space;
                }

                result = [ result, generateFunctionBody( expr, idBuffer ) ];
                break;

            case Syntax.ArrayExpression:
                if ( !expr.elements.length ) {
                    result = wrapHtml( '[]' );
                    break;
                }
                multiline = expr.elements.length > 1;
                result = [
                    wrapHtml( '[' ), multiline ? newline : ''
                ];
                withIndent(function (indent) {
                    for (i = 0, len = expr.elements.length; i < len; i += 1) {
                        if (!expr.elements[i]) {
                            if(multiline) result.push(base);
                            if (i + 1 === len) {
                                result.push( ',' );
                            }
                        } else {
                            result.push( multiline ? base : '', generateExpression( expr.elements[i], {
                                precedence: Precedence.Assignment,
                                allowIn: true,
                                allowCall: true,
                                idBuffer: idBuffer,
                                addLine: true
                            } ) );
                        }
                        if (i + 1 < len) {
                            result.push( ',' + ( multiline ? newline : space ) );
                        }
                    }
                });
                if (multiline && !endsWithLineTerminator(toSourceNode(result).toString())) {
                    result.push(newline);
                }
                result.push( multiline ? base : '', wrapHtml( ']' ) );
                break;

            case Syntax.Property:
                // NOTE: get 和 set 在初版的时候暂不考虑
                if (expr.kind === 'get' || expr.kind === 'set') {
                    result = [
                        expr.kind + ' ',
                        generateExpression(expr.key, {
                            precedence: Precedence.Sequence,
                            allowIn: true,
                            allowCall: true,
                            idBuffer: idBuffer
                        }),
                        generateFunctionBody( expr.value )
                    ];
                } else {
                    result = [
                        generateExpression( expr.key, {
                            precedence: Precedence.Sequence,
                            allowIn: true,
                            allowCall: true,
                            idBuffer: idBuffer,
                            addLine: true
                        } ),
                        ':' + space,
                        generateExpression( expr.value, {
                            precedence: Precedence.Assignment,
                            allowIn: true,
                            allowCall: true,
                            idBuffer: idBuffer
                        } )
                    ];
                }
                break;

            case Syntax.ObjectExpression:
                if ( !expr.properties.length ) {
                    result = wrapHtml( '{}' );
                    break;
                }

                multiline = expr.properties.length > 1;
                result = [ wrapHtml( '{' ), multiline ? newline : ''];

                withIndent(function (indent) {
                    for (i = 0, len = expr.properties.length; i < len; i += 1) {
                        result.push( multiline ? base : '', generateExpression(expr.properties[i], {
                            precedence: Precedence.Sequence,
                            allowIn: true,
                            allowCall: true,
                            idBuffer: idBuffer
                        }));
                        if (i + 1 < len) {
                            result.push( ',' + (multiline ? newline : space));
                        }
                    }
                });

                if (multiline && !endsWithLineTerminator(toSourceNode(result).toString())) {
                    result.push(newline);
                }

                result.push( multiline ? base : '', wrapHtml( '}' ) );
                break;

            case Syntax.ThisExpression:
                result = wrapHtml( 'this' );
                break;

            case Syntax.Identifier:
                result = wrapHtml( expr.name );
                break;

            case Syntax.Literal:
                if (expr.hasOwnProperty('raw') && parse) {
                    try {
                        raw = parse(expr.raw).body[0].expression;
                        if (raw.type === Syntax.Literal) {
                            if (raw.value === expr.value) {
                                result = wrapHtml( expr.raw );
                                break;
                            }
                        }
                    } catch (e) {
                        // not use raw property
                    }
                }

                if (expr.value === null) {
                    result = wrapHtml( 'null' );
                    break;
                }

                if (typeof expr.value === 'string') {
                    result = wrapHtml( escapeString( expr.value ) );
                    break;
                }

                if (typeof expr.value === 'number') {
                    result = wrapHtml( generateNumber( expr.value ) );
                    break;
                }

                result = wrapHtml( expr.value.toString() );
                break;

            default:
                throw new Error('Unknown expression type: ' + expr.type);
            }

            return toSourceNode(result, expr);
        }

        function generateStatement( stmt, option ) {
            var i, len, result, node, allowIn, fragment, semicolon, idBuffer, entrustedTraceId;

            allowIn = true;
            semicolon = ';';

            if (option) {
                allowIn = option.allowIn === undefined || option.allowIn;
                idBuffer = option.idBuffer;
                entrustedTraceId = option.entrustedTraceId; // NOTE: 上一个语法委托 trace 的 id 数组
                if (!semicolons && option.semicolonOptional === true) {
                    semicolon = '';
                }
            }

            switch (stmt.type) {
            case Syntax.BlockStatement:
                void function( id ){
                    id = guid( 2, entrustedTraceId );

                    result = [
                        wrapCodeFragmentHtml( '{', id[ 0 ] ),
                        injectCodeFragmentTrace( id ),
                        newline,
                    ];

                    withIndent(function (indent) {
                        for (i = 0, len = stmt.body.length; i < len; i += 1) {
                            fragment = addIndent(generateStatement(stmt.body[i], {semicolonOptional: i === len - 1}));
                            result.push(fragment);
                            if (!endsWithLineTerminator(toSourceNode(fragment).toString())) {
                                result.push(newline);
                            }
                        }
                    });

                    result.push(addIndent(
                        wrapCodeFragmentHtml( '}', id[ 1 ] )
                    ));

                    if( idBuffer )
                        idBuffer.push( id[0], id[1] );
                }();

                break;

            case Syntax.BreakStatement:
                if (stmt.label) {
                    // NOTE: 居然可以跟 label，这种情况暂时不考虑了
                    result = 'break ' + stmt.label.name + semicolon;
                } else {
                    void function( id ){
                        id = guid( 1 );
                        result = [
                            injectCodeFragmentTrace( id ),
                            wrapCodeFragmentHtml( 'break', id[ 0 ] ),
                            semicolon
                        ];
                    }();
                }
                break;

            case Syntax.ContinueStatement:
                if (stmt.label) {
                    result = 'continue ' + stmt.label.name + semicolon;
                } else {
                    void function( id ){
                        id = guid( 1 );
                        result = [
                            injectCodeFragmentTrace( id ),
                            wrapCodeFragmentHtml( 'continue', id[ 0 ] ),
                            semicolon
                        ];
                    }();
                }
                break;

            case Syntax.DoWhileStatement:
                // Because `do 42 while (cond)` is Syntax Error. We need semicolon.
                void function( id ){
                    id = guid( 4 );
                    result = [
                        wrapCodeFragmentHtml( 'do', id[ 0 ] ),
                        maybeBlock( stmt.body )
                    ];
                
                    result = maybeBlockSuffix(stmt.body, result);
                    result = join(result, [
                        wrapCodeFragmentHtml( 'while', id[ 1 ] ),
                        space,
                        wrapCodeFragmentHtml( '(', id[ 2 ] ),
                        space,
                        generateExpression(stmt.test, {
                            precedence: Precedence.Sequence,
                            allowIn: true,
                            allowCall: true,
                            idBuffer: id
                        }),
                        space,
                        wrapCodeFragmentHtml( ')', id[ 3 ] ),
                        semicolon,
                        injectCodeFragmentTrace( id )
                    ]);

                }();
                break;

            case Syntax.CatchClause:
                void function( id ){
                    id = guid( 3 );
                    withIndent(function (indent) {
                        result = [
                            wrapCodeFragmentHtml( 'catch', id[ 0 ] ),
                            space,
                            wrapCodeFragmentHtml( '(', id[ 1 ] ),
                            space,
                            generateExpression( stmt.param, {
                                precedence: Precedence.Sequence,
                                allowIn: true,
                                allowCall: true,
                                idBuffer: id
                            } ),
                            space,
                            wrapCodeFragmentHtml( ')', id[ 2 ] )
                        ];
                    });
                    result.push( maybeBlock( stmt.body, null, id ) );
                }();
                break;

            case Syntax.DebuggerStatement:
                result = 'debugger' + semicolon;
                break;

            case Syntax.EmptyStatement:
                result = ';';
                break;

            case Syntax.ExpressionStatement:
                var trackerDelimiterRegx = /\{<\}.*?\{>\}/g;
                void function( id, tid, resultString ){
                    id = [], tid;

                    result = [generateExpression(stmt.expression, {
                        precedence: Precedence.Sequence,
                        allowIn: true,
                        allowCall: true,
                        fromStatement: true,
                        idBuffer: id
                    })];

                    // 12.4 '{', 'function' is not allowed in this position.
                    // wrap expression with parentheses
                    resultString = result.toString().replace( trackerDelimiterRegx, "" );
                    if ( resultString.charAt(0) === '{' || 
                        ( resultString.slice(0, 8) === 'function' && " (".indexOf( resultString.charAt(8) ) >= 0 ) ) {
                        _push.apply( id, tid = guid(2) );
                        result = [ 
                            wrapCodeFragmentHtml( '(', tid[0] ), 
                            result, 
                            wrapCodeFragmentHtml( ')', tid[1] ), 
                            semicolon,
                            injectCodeFragmentTrace( id )
                        ];
                    } else {
                        result.push(
                            semicolon,
                            injectCodeFragmentTrace( id )
                        );
                    }
                }();

                break;

            case Syntax.VariableDeclarator:
                void function( id ){
                    if ( stmt.init ){
                        id = guid( 2 );

                        idBuffer && _push.apply( idBuffer, id );
                        result = [
                            wrapCodeFragmentHtml( stmt.id.name, id[ 0 ] ),
                            space,
                            wrapCodeFragmentHtml( '=', id[ 1 ] ),
                            space,
                            generateExpression( stmt.init, {
                                precedence: Precedence.Assignment,
                                allowIn: allowIn,
                                allowCall: true,
                                idBuffer: idBuffer
                            } )
                        ];
                    } else {
                        id = guid();
                        idBuffer && idBuffer.push( id );
                        result = wrapCodeFragmentHtml( stmt.id.name, id );
                    }
                }();
                break;

            case Syntax.VariableDeclaration:

                void function( id, tid ){
                    id = [];
                    id.push( tid = guid() );

                    result = [
                        wrapCodeFragmentHtml( stmt.kind, tid )
                    ];

                    // special path for
                    // var x = function () {
                    // };
                    if ( stmt.declarations.length === 1 && stmt.declarations[0].init &&
                            stmt.declarations[0].init.type === Syntax.FunctionExpression ) {
                        result.push( ' ', generateStatement( stmt.declarations[0], {
                            allowIn: allowIn,
                            idBuffer: id
                        } ) );
                    } else {
                        // VariableDeclarator is typed as Statement,
                        // but joined with comma (not LineTerminator).
                        // So if comment is attached to target node, we should specialize.
                        withIndent(function (indent) {
                            node = stmt.declarations[0];

                            if ( extra.comment && node.leadingComments ) {
                                result.push( '\n', addIndent( generateStatement( node, {
                                    allowIn: allowIn
                                } ) ) );
                            } else {
                                result.push( ' ', generateStatement(node, {
                                    allowIn: allowIn,
                                    idBuffer: id
                                } ) );
                            }

                            for ( i = 1, len = stmt.declarations.length; i < len; i += 1 ) {
                                node = stmt.declarations[i];
                                if (extra.comment && node.leadingComments) {
                                    result.push( ',' + newline, addIndent( generateStatement( node, {
                                        allowIn: allowIn,
                                        idBuffer: id
                                    } ) ) );
                                } else {
                                    result.push( ',' + space, generateStatement( node, {
                                        allowIn: allowIn,
                                        idBuffer: id
                                    } ) );
                                }
                            }
                            
                        });
                    }

                    result.push(
                        injectAssistedCode( ", __trackerTempVariable__ = " ),
                        injectCodeFragmentTraceWithReturn( id ),
                        semicolon
                    );
                }();

                break;

            case Syntax.ThrowStatement:
                // TODO: throw 后面如果哪一个复杂的表达式，整段都会被绿色块包含起来，因为直接用了 wrapCodeFragmentHtml，
                // 应该改为 idBuffer 的实现
                // 但由于 throw 完成之后，代码会中断，没有机会执行 trace，暂时也无比较好的办法（用 try..finally ? ）
                // 参考 ReturnStatement 中加 try 的实现
                void function( id ){
                    id = guid( 2 );
                    result = [
                        injectCodeFragmentTrace( id ),
                        join(
                            wrapCodeFragmentHtml( 'throw', id[ 0 ] ),
                            wrapCodeFragmentHtml( generateExpression(stmt.argument, {
                                precedence: Precedence.Sequence,
                                allowIn: true,
                                allowCall: true
                            }), id[ 1 ] )
                        ),
                        semicolon
                    ];
                }();
                break;

            case Syntax.TryStatement:
                void function( id ){
                    id = guid( 1 );

                    result = [
                        wrapCodeFragmentHtml( 'try', id[ 0 ] ), 
                        maybeBlock( stmt.block, null, id )
                    ];
                }();

                result = maybeBlockSuffix(stmt.block, result);

                for (i = 0, len = stmt.handlers.length; i < len; i += 1) {
                    result = join(result, generateStatement(stmt.handlers[i]));
                    if (stmt.finalizer || i + 1 !== len) {
                        result = maybeBlockSuffix(stmt.handlers[i].body, result);
                    }
                }

                void function( id ){
                    id = guid( 1 );

                    if (stmt.finalizer) {
                        result = join(result, [
                            wrapCodeFragmentHtml( 'finally', id[ 0 ] ), 
                            maybeBlock( stmt.finalizer, null, id )
                        ]);
                    }
                }();

                break;

            case Syntax.SwitchStatement:
                void function( id ){
                    id = guid( 5 );

                    withIndent(function (indent) {
                        result = [
                            wrapCodeFragmentHtml( 'switch', id[ 0 ]),
                            space,
                            wrapCodeFragmentHtml( '(', id[ 1 ] ),
                            space,
                            generateExpression(stmt.discriminant, {
                                precedence: Precedence.Sequence,
                                allowIn: true,
                                allowCall: true,
                                idBuffer: id
                            }),
                            space,
                            wrapCodeFragmentHtml( ')', id[ 2 ] ),
                            space,
                            wrapCodeFragmentHtml( '{', id[ 3 ] ), 
                            newline
                        ];
                    });

                    if (stmt.cases) {
                        for (i = 0, len = stmt.cases.length; i < len; i += 1) {
                            fragment = addIndent(generateStatement(stmt.cases[i], {semicolonOptional: i === len - 1}));
                            result.push(fragment);
                            if (!endsWithLineTerminator(toSourceNode(fragment).toString())) {
                                result.push(newline);
                            }
                        }
                    }

                    result.push(
                        addIndent( wrapCodeFragmentHtml( '}', id[ 4 ] ) ),
                        injectCodeFragmentTrace( id )
                    );
                }();

                break;

            case Syntax.SwitchCase:
                withIndent(function (indent) {
                    if (stmt.test) {
                        void function( id ){
                            id = guid( 1 );
                            result = [
                                join(
                                    wrapCodeFragmentHtml( 'case', id[ 0 ] ), 
                                    generateExpression(stmt.test, {
                                        precedence: Precedence.Sequence,
                                        allowIn: true,
                                        allowCall: true,
                                        idBuffer: id
                                    })
                                ),
                                ':',
                                injectCodeFragmentTrace( id )
                            ];
                        }();
                    } else {
                        void function( id ){
                            id = guid( 1 );
                            result = [
                                wrapCodeFragmentHtml( 'default' ),
                                ':',
                                injectCodeFragmentTrace( id )
                            ];
                        }();
                    }

                    i = 0;
                    len = stmt.consequent.length;
                    if (len && stmt.consequent[0].type === Syntax.BlockStatement) {
                        fragment = maybeBlock(stmt.consequent[0]);
                        result.push(fragment);
                        i = 1;
                    }

                    if (i !== len && !endsWithLineTerminator(toSourceNode(result).toString())) {
                        result.push(newline);
                    }

                    for (; i < len; i += 1) {
                        fragment = addIndent(generateStatement(stmt.consequent[i], {semicolonOptional: i === len - 1 && semicolon === ''}));
                        result.push(fragment);
                        if (i + 1 !== len && !endsWithLineTerminator(toSourceNode(fragment).toString())) {
                            result.push(newline);
                        }
                    }
                });
                break;

            case Syntax.IfStatement:
                void function( id ){
                    id = guid( 3, entrustedTraceId );

                    withIndent(function (indent) {
                        result = [
                            // NOTE: 加了 wrap
                            wrapCodeFragmentHtml( 'if', id[ 0 ] ),
                            space,
                            wrapCodeFragmentHtml( '(', id[ 1 ] ),
                            space,
                            generateExpression(stmt.test, {
                                precedence: Precedence.Sequence,
                                allowIn: true,
                                allowCall: true,
                                idBuffer: id
                            }),
                            space,
                            wrapCodeFragmentHtml( ')', id[ 2 ] )
                        ];
                    });

                    if ( stmt.alternate ) {
                        result.push( maybeBlock( stmt.consequent, null, id ) );
                        result = maybeBlockSuffix( stmt.consequent, result );

                        if ( stmt.alternate.type === Syntax.IfStatement ) {
                            void function( id ){
                                id = guid( 1 );

                                result = join(
                                    result, [
                                        wrapCodeFragmentHtml( "else", id[ 0 ] )  + ' ', 
                                        generateStatement( stmt.alternate, { 
                                            semicolonOptional: semicolon === '',
                                            entrustedTraceId: id
                                        } )
                                    ]
                                );
                            }();
                        } else {
                            void function( id ){
                                id = guid( 1 );

                                result = join(
                                    result, 
                                    join(
                                        wrapCodeFragmentHtml( 'else', id[ 0 ] ), 
                                        maybeBlock(stmt.alternate, semicolon === '', id)
                                    )
                                );
                            }();
                        }

                    } else {
                        result.push( maybeBlock(stmt.consequent, semicolon === '', id ));
                    }
                }();

                break;

            case Syntax.ForStatement:
                void function( id ){
                    id = guid( 4 );

                    withIndent(function (indent) {
                        result = [
                            wrapCodeFragmentHtml( 'for', id[ 0 ] ),
                            space,
                            wrapCodeFragmentHtml( '(', id[ 1 ] ),
                            space
                        ];

                        if (stmt.init) {
                            if (stmt.init.type === Syntax.VariableDeclaration) {
                                result.push(
                                    generateStatement(
                                        stmt.init, { allowIn: false, idBuffer: id }
                                    )
                                );
                            } else {
                                result.push( generateExpression(stmt.init, {
                                    precedence: Precedence.Sequence,
                                    allowIn: false,
                                    allowCall: true,
                                    idBuffer: id
                                } ), ';' );
                            }
                        } else {
                            result.push( ';' );
                        }

                        if (stmt.test) {
                            result.push( space, generateExpression(stmt.test, {
                                precedence: Precedence.Sequence,
                                allowIn: true,
                                allowCall: true,
                                idBuffer: id
                            }), ';');
                        } else {
                            result.push( ';' );
                        }

                        if ( stmt.update ) {
                            result.push(space, generateExpression(stmt.update, {
                                precedence: Precedence.Sequence,
                                allowIn: true,
                                allowCall: true,
                                idBuffer: id
                            }), space, wrapCodeFragmentHtml( ')', id[ 2 ] ) );
                        } else {
                            result.push( space, wrapCodeFragmentHtml( ')', id[ 3 ] ) );
                        }
                    });

                    result.push( 
                        maybeBlock(stmt.body, semicolon === ''),
                        injectAssistedCode( ";" ),
                        injectCodeFragmentTrace( id )
                    );
                }();

                break;

            case Syntax.ForInStatement:
                void function( id ){
                    id = guid( 5 );
                    
                    result = [
                        wrapCodeFragmentHtml( 'for', id[ 0 ] ),
                        space,
                        wrapCodeFragmentHtml( '(', space, id[ 1 ] )
                    ];

                    withIndent(function (indent) {
                        if (stmt.left.type === Syntax.VariableDeclaration) {
                            withIndent(function (indent) {
                                result.push( 
                                    wrapCodeFragmentHtml( stmt.left.kind, id[ 2 ] ) + ' ',
                                    generateStatement(stmt.left.declarations[0], {
                                    allowIn: false,
                                    idBuffer: id
                                }));
                            });
                        } else {
                            result.push( generateExpression(stmt.left, {
                                precedence: Precedence.Call,
                                allowIn: true,
                                allowCall: true,
                                idBuffer: id
                            }));
                        }

                        result = join( result, wrapCodeFragmentHtml( 'in', id[ 3 ] ) );
                        result = [ join(
                            result,
                            generateExpression(stmt.right, {
                                precedence: Precedence.Sequence,
                                allowIn: true,
                                allowCall: true,
                                idBuffer: id
                            })
                        ), space, wrapCodeFragmentHtml( ')', id[ 4 ] ) ];
                    });

                    result.push(
                        maybeBlock(stmt.body, semicolon === ''),
                        injectAssistedCode( ";" ),
                        injectCodeFragmentTrace( id )
                    );
                }();
                break;

            case Syntax.LabeledStatement:
                void function( id ){
                    id = guid( 1 );

                    result = [
                        injectCodeFragmentTrace( id ),
                        wrapCodeFragmentHtml( stmt.label.name, id[ 0 ] ),
                        ':',
                        maybeBlock(stmt.body, semicolon === '')
                    ];
                }();
                break;

            case Syntax.Program:
                len = stmt.body.length;
                result = [safeConcatenation && len > 0 ? '\n' : ''];
                for (i = 0; i < len; i += 1) {
                    fragment = addIndent(generateStatement(stmt.body[i], {semicolonOptional: !safeConcatenation && i === len - 1}));
                    result.push(fragment);
                    if (i + 1 < len && !endsWithLineTerminator(toSourceNode(fragment).toString())) {
                        result.push(newline);
                    }
                }
                break;

            case Syntax.FunctionDeclaration:
                void function( id ){
                    id = guid( 2 );

                    result = [
                        wrapCodeFragmentHtml( "function", id[ 0 ] ),
                        ' ',
                        wrapCodeFragmentHtml( stmt.id.name, id[ 1 ] ),
                        generateFunctionBody( stmt, id ),
                        injectAssistedCode( ";" ),
                        injectCodeFragmentTrace( id )
                    ];
                }();
                break;

            case Syntax.ReturnStatement:
                void function( id ){
                    id = guid( 1 );

                    if (stmt.argument) {
                        result = [
                            injectAssistedCode( "try{" ),
                            join(
                                wrapCodeFragmentHtml( 'return', id[ 0 ] ),
                                generateExpression(stmt.argument, {
                                    precedence: Precedence.Sequence,
                                    allowIn: true,
                                    allowCall: true,
                                    idBuffer: id
                                })
                            ),
                            injectAssistedCode( "}catch(e){throw e;}finally{" ),
                            injectCodeFragmentTrace( id ),
                            injectAssistedCode( "}" ),
                            semicolon
                        ];
                    } else {
                        result = [
                            injectCodeFragmentTrace( id ),
                            wrapCodeFragmentHtml( 'return', id[ 0 ] ),
                            semicolon
                        ];
                    }
                }();
                break;

            case Syntax.WhileStatement:
                void function( id ){
                    id = guid( 3 );

                    withIndent(function (indent) {
                        result = [
                            wrapCodeFragmentHtml( 'while', id[ 0 ] ) + space + wrapCodeFragmentHtml( '(', id[ 1 ] ),
                            space,
                            generateExpression(stmt.test, {
                                precedence: Precedence.Sequence,
                                allowIn: true,
                                allowCall: true,
                                idBuffer: id
                            }),
                            space,
                            wrapCodeFragmentHtml( ')', id[ 2 ] )
                        ];
                    });
                    result.push(
                        maybeBlock(stmt.body, semicolon === ''),
                        injectAssistedCode( ";" ),
                        injectCodeFragmentTrace( id )
                    );
                }();
                break;

            case Syntax.WithStatement:
                void function( id ){
                    id = guid( 3 );

                    withIndent(function (indent) {
                        result = [
                            wrapCodeFragmentHtml( 'with', id[ 0 ] ),
                            space,
                            wrapCodeFragmentHtml( '(', id[ 1 ] ),
                            space,
                            generateExpression(stmt.object, {
                                precedence: Precedence.Sequence,
                                allowIn: true,
                                allowCall: true,
                                idBuffer: id
                            }),
                            space,
                            wrapCodeFragmentHtml( ')', id[ 2 ] )
                        ];
                    });
                    result.push(
                        maybeBlock(stmt.body, semicolon === '', id)
                    );
                }();
                break;

            default:
                throw new Error('Unknown statement type: ' + stmt.type);
            }

            // Attach comments

            if (extra.comment) {
                result = addCommentsToStatement(stmt, result);
            }

            var fragment = toSourceNode(result).toString();
            if (stmt.type === Syntax.Program && !safeConcatenation && newline === '' &&  fragment.charAt(fragment.length - 1) === '\n') {
                result = toSourceNode(result).replaceRight(/\s+$/, '');
            }

            return toSourceNode(result, stmt);
        }

        function generate( node, options, currentCodeInstance ) {
            var defaultOptions = getDefaultOptions(), result, pair;

            currentCode = currentCodeInstance;
            snippetsIdSet = currentCode.snippetsIdSet;

            if (options != null) {
                // Obsolete options
                //
                //   `options.indent`
                //   `options.base`
                //
                // Instead of them, we can use `option.format.indent`.
                if (typeof options.indent === 'string') {
                    defaultOptions.format.indent.style = options.indent;
                }
                if (typeof options.base === 'number') {
                    defaultOptions.format.indent.base = options.base;
                }
                options = updateDeeply(defaultOptions, options);
                indent = options.format.indent.style;
                if (typeof options.base === 'string') {
                    base = options.base;
                } else {
                    base = stringRepeat(indent, options.format.indent.base);
                }
            } else {
                options = defaultOptions;
                indent = options.format.indent.style;
                base = stringRepeat(indent, options.format.indent.base);
            }

            json = options.format.json;
            renumber = options.format.renumber;
            hexadecimal = json ? false : options.format.hexadecimal;
            quotes = json ? 'double' : options.format.quotes;
            escapeless = options.format.escapeless;
            if (options.format.compact) {
                newline = space = indent = base = '';
            } else {
                newline = '\n';
                space = ' ';
            }
            parentheses = options.format.parentheses;
            semicolons = options.format.semicolons;
            safeConcatenation = options.format.safeConcatenation;
            parse = json ? null : options.parse;
            sourceMap = options.sourceMap;
            extra = options;

            if (sourceMap) {
                if (typeof process !== 'undefined') {
                    // We assume environment is node.js
                    SourceNode = require('source-map').SourceNode;
                } else {
                    SourceNode = global.sourceMap.SourceNode;
                }
            } else {
                SourceNode = SourceNodeMock;
            }

            switch (node.type) {
            case Syntax.BlockStatement:
            case Syntax.BreakStatement:
            case Syntax.CatchClause:
            case Syntax.ContinueStatement:
            case Syntax.DoWhileStatement:
            case Syntax.DebuggerStatement:
            case Syntax.EmptyStatement:
            case Syntax.ExpressionStatement:
            case Syntax.ForStatement:
            case Syntax.ForInStatement:
            case Syntax.FunctionDeclaration:
            case Syntax.IfStatement:
            case Syntax.LabeledStatement:
            case Syntax.Program:
            case Syntax.ReturnStatement:
            case Syntax.SwitchStatement:
            case Syntax.SwitchCase:
            case Syntax.ThrowStatement:
            case Syntax.TryStatement:
            case Syntax.VariableDeclaration:
            case Syntax.VariableDeclarator:
            case Syntax.WhileStatement:
            case Syntax.WithStatement:
                result = generateStatement(node);
                break;

            case Syntax.AssignmentExpression:
            case Syntax.ArrayExpression:
            case Syntax.BinaryExpression:
            case Syntax.CallExpression:
            case Syntax.ConditionalExpression:
            case Syntax.FunctionExpression:
            case Syntax.Identifier:
            case Syntax.Literal:
            case Syntax.LogicalExpression:
            case Syntax.MemberExpression:
            case Syntax.NewExpression:
            case Syntax.ObjectExpression:
            case Syntax.Property:
            case Syntax.SequenceExpression:
            case Syntax.ThisExpression:
            case Syntax.UnaryExpression:
            case Syntax.UpdateExpression:
                result = generateExpression(node, {
                    precedence: Precedence.Sequence,
                    allowIn: true,
                    allowCall: true
                });
                break;

            default:
                throw new Error('Unknown node type: ' + node.type);
            }

            if (!sourceMap) {
                return result.toString();
            }

            pair = result.toStringWithSourceMap({file: options.sourceMap});

            if (options.sourceMapWithCode) {
                return pair;
            }
            return pair.map.toString();
        }

        // simple visitor implementation

        VisitorKeys = {
            AssignmentExpression: ['left', 'right'],
            ArrayExpression: ['elements'],
            BlockStatement: ['body'],
            BinaryExpression: ['left', 'right'],
            BreakStatement: ['label'],
            CallExpression: ['callee', 'arguments'],
            CatchClause: ['param', 'body'],
            ConditionalExpression: ['test', 'consequent', 'alternate'],
            ContinueStatement: ['label'],
            DoWhileStatement: ['body', 'test'],
            DebuggerStatement: [],
            EmptyStatement: [],
            ExpressionStatement: ['expression'],
            ForStatement: ['init', 'test', 'update', 'body'],
            ForInStatement: ['left', 'right', 'body'],
            FunctionDeclaration: ['id', 'params', 'body'],
            FunctionExpression: ['id', 'params', 'body'],
            Identifier: [],
            IfStatement: ['test', 'consequent', 'alternate'],
            Literal: [],
            LabeledStatement: ['label', 'body'],
            LogicalExpression: ['left', 'right'],
            MemberExpression: ['object', 'property'],
            NewExpression: ['callee', 'arguments'],
            ObjectExpression: ['properties'],
            Program: ['body'],
            Property: ['key', 'value'],
            ReturnStatement: ['argument'],
            SequenceExpression: ['expressions'],
            SwitchStatement: ['discriminant', 'cases'],
            SwitchCase: ['test', 'consequent'],
            ThisExpression: [],
            ThrowStatement: ['argument'],
            TryStatement: ['block', 'handlers', 'finalizer'],
            UnaryExpression: ['argument'],
            UpdateExpression: ['argument'],
            VariableDeclaration: ['declarations'],
            VariableDeclarator: ['id', 'init'],
            WhileStatement: ['test', 'body'],
            WithStatement: ['object', 'body']
        };

        VisitorOption = {
            Break: 1,
            Skip: 2
        };

        function traverse(top, visitor) {
            var worklist, leavelist, node, ret, current, current2, candidates, candidate, marker = {};

            worklist = [ top ];
            leavelist = [ null ];

            while (worklist.length) {
                node = worklist.pop();

                if (node === marker) {
                    node = leavelist.pop();
                    if (visitor.leave) {
                        ret = visitor.leave(node, leavelist[leavelist.length - 1]);
                    } else {
                        ret = undefined;
                    }
                    if (ret === VisitorOption.Break) {
                        return;
                    }
                } else if (node) {
                    if (visitor.enter) {
                        ret = visitor.enter(node, leavelist[leavelist.length - 1]);
                    } else {
                        ret = undefined;
                    }

                    if (ret === VisitorOption.Break) {
                        return;
                    }

                    worklist.push(marker);
                    leavelist.push(node);

                    if (ret !== VisitorOption.Skip) {
                        candidates = VisitorKeys[node.type];
                        current = candidates.length;
                        while ((current -= 1) >= 0) {
                            candidate = node[candidates[current]];
                            if (candidate) {
                                if (isArray(candidate)) {
                                    current2 = candidate.length;
                                    while ((current2 -= 1) >= 0) {
                                        if (candidate[current2]) {
                                            worklist.push(candidate[current2]);
                                        }
                                    }
                                } else {
                                    worklist.push(candidate);
                                }
                            }
                        }
                    }
                }
            }
        }

        // based on LLVM libc++ upper_bound / lower_bound
        // MIT License

        function upperBound(array, func) {
            var diff, len, i, current;

            len = array.length;
            i = 0;

            while (len) {
                diff = len >>> 1;
                current = i + diff;
                if (func(array[current])) {
                    len = diff;
                } else {
                    i = current + 1;
                    len -= diff + 1;
                }
            }
            return i;
        }

        function lowerBound(array, func) {
            var diff, len, i, current;

            len = array.length;
            i = 0;

            while (len) {
                diff = len >>> 1;
                current = i + diff;
                if (func(array[current])) {
                    i = current + 1;
                    len -= diff + 1;
                } else {
                    len = diff;
                }
            }
            return i;
        }

        function extendCommentRange(comment, tokens) {
            var target, token;

            target = upperBound(tokens, function search(token) {
                return token.range[0] > comment.range[0];
            });

            comment.extendedRange = [comment.range[0], comment.range[1]];

            if (target !== tokens.length) {
                comment.extendedRange[1] = tokens[target].range[0];
            }

            target -= 1;
            if (target >= 0) {
                if (target < tokens.length) {
                    comment.extendedRange[0] = tokens[target].range[1];
                } else if (token.length) {
                    comment.extendedRange[1] = tokens[tokens.length - 1].range[0];
                }
            }

            return comment;
        }

        function attachComments(tree, providedComments, tokens) {
            // At first, we should calculate extended comment ranges.
            var comments = [], comment, len, i;

            if (!tree.range) {
                throw new Error('attachComments needs range information');
            }

            // tokens array is empty, we attach comments to tree as 'leadingComments'
            if (!tokens.length) {
                if (providedComments.length) {
                    for (i = 0, len = providedComments.length; i < len; i += 1) {
                        comment = deepCopy(providedComments[i]);
                        comment.extendedRange = [0, tree.range[0]];
                        comments.push(comment);
                    }
                    tree.leadingComments = comments;
                }
                return tree;
            }

            for (i = 0, len = providedComments.length; i < len; i += 1) {
                comments.push(extendCommentRange(deepCopy(providedComments[i]), tokens));
            }

            // This is based on John Freeman's implementation.
            traverse(tree, {
                cursor: 0,
                enter: function (node) {
                    var comment;

                    while (this.cursor < comments.length) {
                        comment = comments[this.cursor];
                        if (comment.extendedRange[1] > node.range[0]) {
                            break;
                        }

                        if (comment.extendedRange[1] === node.range[0]) {
                            if (!node.leadingComments) {
                                node.leadingComments = [];
                            }
                            node.leadingComments.push(comment);
                            comments.splice(this.cursor, 1);
                        } else {
                            this.cursor += 1;
                        }
                    }

                    // already out of owned node
                    if (this.cursor === comments.length) {
                        return VisitorOption.Break;
                    }

                    if (comments[this.cursor].extendedRange[0] > node.range[1]) {
                        return VisitorOption.Skip;
                    }
                }
            });

            traverse(tree, {
                cursor: 0,
                leave: function (node) {
                    var comment;

                    while (this.cursor < comments.length) {
                        comment = comments[this.cursor];
                        if (node.range[1] < comment.extendedRange[0]) {
                            break;
                        }

                        if (node.range[1] === comment.extendedRange[0]) {
                            if (!node.trailingComments) {
                                node.trailingComments = [];
                            }
                            node.trailingComments.push(comment);
                            comments.splice(this.cursor, 1);
                        } else {
                            this.cursor += 1;
                        }
                    }

                    // already out of owned node
                    if (this.cursor === comments.length) {
                        return VisitorOption.Break;
                    }

                    if (comments[this.cursor].extendedRange[0] > node.range[1]) {
                        return VisitorOption.Skip;
                    }
                }
            });

            return tree;
        }

        // Sync with package.json.
        exports.version = '0.0.9-dev';

        exports.generate = generate;
        exports.traverse = traverse;
        exports.attachComments = attachComments;
    }, this );