(function () {
    'use strict';
    window._core = window._core || {};
    window._core.Loader = Loader;
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return Loader;
        });
    } else if (typeof module !== 'undefined' && module != null) {
        module.exports = Loader
    }


    var PRESETS = {
        core: {
            js: ['presets/core/scripts/vendor.js','presets/core/scripts/vendor.js'],
            css: []
        }
    };
    var cdnjs = 'https://cdnjs.cloudflare.com/ajax/libs',
        googleapis = 'https://ajax.googleapis.com/ajax/libs';
    PRESETS.ng1={
        js: [
            cdnjs+'/jquery/2.2.4/jquery.min.js',
            googleapis+'/angularjs/1.5.7/angular.min.js',
            googleapis+'/angularjs/1.5.7/angular-animate.min.js',
            googleapis+'/angularjs/1.5.7/angular-aria.min.js',
            googleapis+'/angularjs/1.5.7/angular-cookies.min.js',
            googleapis+'/angularjs/1.5.7/angular-messages.min.js',
            googleapis+'/angularjs/1.5.7/angular-sanitize.min.js',
            cdnjs+'/angular-ui-router/1.0.0-beta.3/angular-ui-router.min.js',
            cdnjs+'/angular-translate/2.12.1/angular-translate.min.js',
            cdnjs+'/angular-translate/2.12.1/angular-translate-loader-partial/angular-translate-loader-partial.min.js',
            cdnjs+'/angular-translate/2.12.1/angular-translate-storage-cookie/angular-translate-storage-cookie.min.js',
            cdnjs+'/angular-translate/2.12.1/angular-translate-storage-local/angular-translate-storage-local.min.js',
            cdnjs+'/angulartics/1.2.1/angulartics.min.js',
            cdnjs+'/angulartics-google-analytics/0.2.1/angulartics-ga.min.js',
            cdnjs+'/oclazyload/1.0.9/ocLazyLoad.min.js'
        ],
        css: []
    };
    PRESETS.ngMaterial = {
        js:PRESETS.ng1.js.concat([googleapis+'/angular_material/1.1.1/angular-material.min.js',
            cdnjs+'/angular-material-data-table/0.10.9/md-data-table.min.js']),
        css:[googleapis+'/angular_material/1.1.1/angular-material.min.css',
            cdnjs+'/angular-material-data-table/0.10.9/md-data-table.min.css']
    };

    function Loader(util) {
        //constructor
        this.util = util;
    }

    Loader.prototype.loadPreset = function (preload) {
        var self= this;
        return new Promise(function(resolve, reject){
            var _preload = preload || {};
            var presetName = _preload.preset&&_preload.preset.id? _preload.preset.id : 'ng1';
            var preset = PRESETS[presetName];

            var scripts = [];
            var pushScripts = function(source){
                if(typeof source==='string'){
                    scripts.push(source);
                } else {
                    scripts.push(source._src||source.src);
                }
            };
            (_preload.scripts_1 || []).forEach(pushScripts);
            preset.js.forEach(pushScripts);
            (_preload.scripts_2 || []).forEach(pushScripts);
            scripts.push('presets/' + presetName + '/scripts/main.js');

            var styles = preset.css.concat([
                'presets/' + presetName + '/styles/vendor.css',
                'presets/' + presetName + '/styles/main.css'
            ]);
            (_preload.styles_1||[]).forEach(function(source){
                styles.push(source._src||source.src);
            });
            // loadSources('script', scripts).then(function(){
            //     resolve();
            // });
            self.loadScripts(scripts, true);
            loadSources('style', styles);
        });
    };

    function loadSources(type, sources) {
        return new Promise(function (resolve, reject) {
            var progress = 0;
            var iter = function () {
                progress++;
                if (progress < sources.length) {
                    loadSource(type, sources[progress], iter);
                } else {
                    resolve();
                }
            };
            if (sources[0]) loadSource(type, sources[0], iter)
        })
    }

    function loadSource(type, src, cb) {
        switch (type) {
            case 'style':
                var link = document.createElement('link');
                link.rel = "stylesheet";
                link.type = "text/css";
                link.href = src;
                link.onload = cb;
                link.onerror = cb;
                document.head.appendChild(link);
                break;
            case 'script':
                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.onload = cb;
                script.onerror = cb;
                document.body.appendChild(script);
                script.src = src;
                break;
        }
    }


    Loader.prototype.getExternalSourceUrls = function (sources, siteName) {
        var self = this,
            promises = [];
        var _sourcesArr = sources || [];
        _sourcesArr.forEach(function (source, index) {
            var src = source.src||source.href;
            if (src.search('//') !== -1) {
                promises.push(Promise.resolve(src));
            } else {
                var _path = src.charAt(0) === '/' ? 'file-root-path?path=' + src : 'file-path?path=' + src,
                    promise = self.util.storage.ref(_path, {siteName: siteName || self.util.site.siteName}).getDownloadURL();
                promises.push(promise);
            }
        });
        return Promise.all(promises);
    };

    Loader.prototype.getExternalSourceFromHtml = function (html) {
        var res = {},
            _html = html + '';

        res.scriptRegEx = /<script[^>]*>[\s\S]*?<\/script>/gm;
        res.cssRegEx = new RegExp('<link[^>]*.css[^>]*>', 'gm');
        res.scriptAttrs = ['src', 'async', 'defer', 'type', 'innerHtml'];
        res.cssAttrs = ['type', 'href', 'rel', 'media'];
        res.sources = [];

        ['script', 'css'].forEach(function (type) {
            res[type] = [];
            (html.match(res[type + 'RegEx']) || []).forEach(function (matchStr, index) {
                res[type][index] = {};
                res[type + 'Attrs'].forEach(function (attr) {
                    res[type][index][attr === 'href' ? 'src' : attr] = (matchStr.match(getAttrRegEx(attr)) || [])[1];
                });
                if (type === 'script') {
                    res[type][index].defer = true;
                }
                // var source=res[type][index].src||res[type][index].href;
                res.sources.push(res[type][index]);
                _html = _html.replace(matchStr, '');
            })
        });


        function getAttrRegEx(attr) {
            var regExStr = (attr === 'innerHtml') ? '>([\\s\\S]*)<' : '<[\\s\\S]*' + attr + '[\\s\\S]*?=[\\s\\S]*?[\'\"]([\\s\\S]*?)[\'\"][\\s\\S]*?>';

            return new RegExp(regExStr);
        }

        return {script: res.script, css: res.css, sources: res.sources, html: _html};
    };

    // 2012 Pablo Moretti, https://github.com/pablomoretti/jcors-loader
    function JcorsLoader(srcArr, instant){
        var document = window.document,
            node_createElementScript = document.createElement('script'),
            node_elementScript = document.getElementsByTagName('script')[0],
            buffer = [],
            promises = [],
            resolves = [],
            lastBufferIndex = 0,
            createCORSRequest = (function () {
                var xhr,
                    CORSRequest;
                if (window.XMLHttpRequest) {
                    xhr = new window.XMLHttpRequest();
                    if ("withCredentials" in xhr) {
                        CORSRequest = function (url) {
                            xhr = new window.XMLHttpRequest();
                            xhr.open('get', url, true);
                            return xhr;
                        };
                    } else if (window.XDomainRequest) {
                        CORSRequest = function (url) {
                            xhr = new window.XDomainRequest();
                            xhr.open('get', url);
                            return xhr;
                        };
                    }
                }
                return CORSRequest;
            }());

        function execute(script) {
            if (typeof script === 'string') {
                var g = node_createElementScript.cloneNode(false);
                g.text = script;
                node_elementScript.parentNode.insertBefore(g, node_elementScript);
            } else {
                script.apply(window);
            }
        }

        function saveInBuffer(index, script) {
            buffer[index] = script;
        }

        function finishedTask(index) {
            saveInBuffer(index, null);
            lastBufferIndex = index+1;
        }

        function executeBuffer() {
            if(!instant) return;
            var dep = true,
                script,
                index = lastBufferIndex,
                len = buffer.length;

            while (index < len && dep) { //excute buffer[lastBufferIndex-->the end of buffer] on every onload event this ensure every script will eventually be executed.
                script = buffer[index];
                if (script !== undefined && script !== null) {
                    execute(script);
                    finishedTask(index);
                    index += 1;
                } else {
                    dep = false;
                }
            }
        }

        function loadsAndExecuteScriptsOnChain() {
            if (buffer.length) {
                var scr = buffer.pop(),
                    script;
                if (typeof scr === 'string') {
                    script = node_createElementScript.cloneNode(true);
                    script.type = "text/javascript";
                    script.async = true;
                    script.src = scr;
                    script.onload = script.onreadystatechange = function () {
                        if (!script.readyState || /loaded|complete/.test(script.readyState)) {
                            // Handle memory leak in IE
                            script.onload = script.onreadystatechange = null;
                            // Dereference the script
                            script = undefined;
                            // Load
                            loadsAndExecuteScriptsOnChain();
                        }
                    };
                    node_elementScript.parentNode.insertBefore(script, node_elementScript);
                } else {
                    scr.apply(window);

                    loadsAndExecuteScriptsOnChain();
                }
            }
        }

        function onloadCORSHandler(request, index) {
            return function () {
                saveInBuffer(index, request.responseText);
                resolves[index](request.responseText);
                executeBuffer();
                // Dereference the script
                request = undefined;
            };
        }

        /* public */

        function loadWithCORS() {
            var index,
                request;
            srcArr.forEach(function(src){
                request = createCORSRequest(src);
                request.onload = onloadCORSHandler(request, buffer.length);
                promises[buffer.length] = new Promise(function(resolve,reject){
                    resolves[buffer.length] = resolve;
                });
                saveInBuffer(buffer.length, null);
                request.send();
            })
        }

        function loadWihtOutCORS() {
            buffer.push(Array.prototype.slice.call(srcArr, 0).reverse());
            loadsAndExecuteScriptsOnChain();
        }
        (createCORSRequest ? loadWithCORS  : loadWihtOutCORS)();
        this.promise = Promise.all(promises);
        this.exec = function(){
            if(instant) return;
            this.promise.then(function(res){
                res.forEach(function(script){
                    execute(script);
                })
            })
        }
    }

    Loader.prototype.loadScripts=function(srcArr, instant){
        return new JcorsLoader(srcArr, instant);
    };
})();
