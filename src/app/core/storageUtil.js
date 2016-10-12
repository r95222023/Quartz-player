(function () {
    'use strict';
    window._core = window._core || {};
    window._core.StorageUtil = StorageUtil;
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return StorageUtil;
        });
    } else if (typeof module !== 'undefined' && module != null) {
        module.exports = StorageUtil
    }

    function StorageUtil(util) {
        //constructor
        this.util = util;
    }

    StorageUtil.prototype.update = function (targetRef, value, onState, option) {
        var self = this;
        return new Promise(function (resolve, reject) {
            var _targetRef = (typeof targetRef === 'string') ? firebase.storage(self.util.app).ref(self.util.parseRefUrl(targetRef, option, true)) : targetRef,
                _path = _targetRef.fullPath,
                id = getId(_path),
                _onState = (typeof onState === 'function') ? onState : function () {
                };
            var isCompress = true,
                _value = {
                    path: _path,
                    compressed: _core.encoding.compress({value: value})
                },
                _valStr = JSON.stringify(_value),
                dataString;
            try {
                eval("(function(){})(" + _valStr + ")");
            }
            catch (err) {
                isCompress = false;
            }
            if (!isCompress) {
                _valStr = JSON.stringify({
                    path: _path,
                    value: value
                });
            }
            dataString = "_getFBS(" + _valStr + ");";
            var data = new Blob([dataString], {type: 'text/javascript'});
            storageReload[id] = true;
            return _targetRef.put(data).on('state_changed', _onState, reject, resolve);
        });
    };

    StorageUtil.prototype.getWithCache = function (srcRef, option) {
        var _srcRef = (typeof srcRef === 'string') ? firebase.storage(this.util.app).ref(this.util.parseRefUrl(srcRef, option, true)) : srcRef,
            id = getId(_srcRef.fullPath);
        if (storagePromises[id] && !storageReload[id]) return storagePromises[id]; //prevent getting the data twice i a short period;
        storagePromises[id] = new Promise(function (resolve, reject) {
            _core._storageResolves[id] = resolve;
            _srcRef.getMetadata().catch(function (error) {
                if (error.code === 'storage/object-not-found') {
                    resolve(null);
                } else {
                    reject(error);
                }
            }).then(function (meta) {
                var url = getRandomDownloadUrl(meta.downloadURLs),
                    updated = (new Date(meta.updated)).getTime();
                if (localStorage && localStorage.getItem(id)) {
                    var cached = localStorage.getItem(id),
                        cachedVal = _core.encoding.decompress({compressed: cached});
                    if (updated < cachedVal.cachedTime) {
                        resolve(cachedVal.value);
                        console.log('from cache');
                    } else {
                        loadJsFromUrl(url, id);
                    }
                } else {
                    loadJsFromUrl(url, id);
                }
            })
        });
        storageReload[id] = false;
        return storagePromises[id]
    };
    StorageUtil.prototype.ref = function (path, opt) {
        var _opt = opt || {};
        return firebase.storage(this.util.app).ref(this.util.parseRefUrl(path, _opt, true));
    };

    function getRandomDownloadUrl(url) {
        if (Array.isArray(url)) {
            return url[Math.floor(Math.random() * (url.length))];
        } else {
            return url;
        }
    }

    function getId(path) {
        return 'FBS:' + (path.split('.js')[1] === '') ? (path.split('.js')[0]) : path;
    }

    StorageUtil.prototype.getDownloadUrls = getDownloadUrls;
    function getDownloadUrls(siteName, srcArr) {
        var promises = [],
            self = this;
        srcArr.forEach(function (src, index) {
            if (src.search('//') === -1) {
                promises[index] = self.ref('file-path?siteName='+siteName+'&path=' + src).getDownloadURL();
            } else {
                promises[index] = Promise.resolve(src);
            }
        });
        return Promise.all(promises);
    }


    var storagePromises = {},
        storageReload = {};
    _core._storageResolves = {};


    function loadJsFromUrl(url, id) {
        var script = document.createElement('script');
        script.type = "text/javascript";
        script.src = url;
        if (id) script.id = id;
        document.body.appendChild(script);
    }

    function getFBS(data, callback) {
        window._core.usage.useBandwidth(data, 'storage');
        var _data = _core.encoding.decompress(data),
            id = getId(_data.path);
        _core._storageResolves[id](_data.value);
        delete _core._storageResolves[id];

        if (callback) {
            callback(_data.value)
        }

        var element = document.getElementById(id);
        element.outerHTML = "";
        _core.syncTime().then(function (getTime) {
            if (localStorage) {
                _data.cachedTime = getTime();
                localStorage.setItem(id, _core.encoding.compress(_data));
            }
        })
    }

    window._getFBS = getFBS;
    window._getGetFBS = function () {
        return getFBS
    }


})();
