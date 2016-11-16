(function () {
    'use strict';
    window._core = window._core || {};
    window._core.DatabaseUtil = DatabaseUtil;
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return DatabaseUtil;
        });
    } else if (typeof module !== 'undefined' && module != null) {
        module.exports = DatabaseUtil
    }

    function DatabaseUtil(util) {
        //constructor
        this.util = util;
        this.database = firebase.database(util.app);
    }

    DatabaseUtil.prototype.queryRef = function (refUrl, options) {
        var opt = options || {},
            ref, database = this.database;

        if (!refUrl) {
            return database.ref().root;
        } else if (refUrl.search('//') !== -1) {
            ref = database.refFromURL(this.util.parseRefUrl(refUrl));
        } else {
            ref = database.ref(this.util.parseRefUrl(refUrl, opt));
        }
        if (opt.orderBy) {
            var orderBy = 'orderBy' + opt.orderBy.split(':')[0];
            if (orderBy === 'orderByChild') {
                ref = ref[orderBy](opt.orderBy.split(':')[1]); //ex {orderBy:'Child:name'}
            } else {
                ref = ref[orderBy]();
            }

        } else {
            return ref
        }

        if (opt.startAt) {
            ref = ref['startAt'](opt.startAt);
        }
        if (opt.endAt) {
            ref = ref['endAt'](opt.endAt);
        }
        if (opt.equalTo) {
            ref = ref['equalTo'](opt.equalTo);
        }
        if (opt.limitToFirst) {
            ref = ref['limitToFirst'](opt.limitToFirst);
        }
        if (opt.limitToLast) {
            ref = ref['limitToLast'](opt.limitToLast);
        }
        return ref;
    };

    function isOutdated(editTime, cached) {
        var cachedVal = _core.encoding.decompress({compressed: cached});
        return !(editTime && editTime < cachedVal.cachedTime);
    }

    function fetch(srcRef, resolve, option) {
        var _option = option || {},
            cachePath = srcRef.toString().split('.com/')[1];

        srcRef.once('value', function (snap) {
            var val = _core.encoding.decompress(snap.val());
            if (!val) {
                resolve(null);
                return
            }
            if (_option.pre) _option.pre(snap, val);
            _core.syncTime().then(function (getTime) {
                if (localStorage) {
                    val.cachedTime = getTime();
                    localStorage.setItem(cachePath, _core.encoding.compress(val));
                }
                resolve(val);
            });
        });
    }

    DatabaseUtil.prototype.getWithCache = function (srcRef, option) {
        var _srcRef = (typeof srcRef === 'string') ? this.queryRef(srcRef, option) : srcRef,
            cachePath = _srcRef.toString().split('.com/')[1];
        return new Promise(function (resolve, reject) {
            if (localStorage && localStorage.getItem(cachePath)) {
                var cached = localStorage.getItem(cachePath);

                _srcRef.child('editTime').once('value', function (snap) {
                    if (isOutdated(snap.val())) {
                        fetch(_srcRef, resolve, option)
                    } else {
                        resolve(_core.encoding.decompress({compressed: cached}));
                    }
                });
            } else {
                fetch(_srcRef, resolve, option);
            }
        });
    };

    DatabaseUtil.prototype.request = function (request, response) {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.update(request.paths, request.data, request.params)
                .then(function () {
                    var resRefs = [];
                    response.forEach(function (val, index) {
                        resRefs[index] = self.queryRef(val)
                    });
                    getResponse(resRefs).then(resolve);
                })
                .catch(function (err) {
                    reject(err);
                });
        });
    };

    function getResponse(refs) {
        var promises = [];

        function promise(ref) {
            return new Promise(function (resolve, reject) {
                var onSuccess = function (snap) {
                    if (snap.val() !== null) {
                        resolve(snap.val());
                        ref.off();
                    }
                };
                ref.on('value', onSuccess, reject);
            });
        }

        refs.forEach(function (val, index) {
            promises[index] = promise(refs[index]);
        });
        return Promise.all(promises);
    }

    DatabaseUtil.prototype.update = function (paths, data, params) {
        var self = this,
            _data = {};
        paths.forEach(function (path, pathIndex) {
            var _path = self.util.parseRefUrl(path, {params: params || {}});
            _data[_path] = {};
            for (var key in data) {
                var subData = data[key],
                    subDataArr = key.split('@'),
                    whereDataGoes = subDataArr[1] || '',
                    subDataKey = subDataArr[0];
                if (whereDataGoes === '' || whereDataGoes === 'all' || whereDataGoes.indexOf(pathIndex) !== -1 || whereDataGoes.indexOf(path) !== -1) { //Issue: when array's length is larger than 10, this will go wrong, since 10 have both 1 an 0;
                    if (subDataKey) {
                        _data[_path][subDataKey] = subData;
                    } else {
                        _data[_path] = subData;
                    }
                }
            }
        });

        return this.queryRef().update(_data);
    };

    DatabaseUtil.prototype.Pagination = Pagination;

    function Pagination(listRef, query, onData) {
        var _query = query || {};
        _query.size = _query.size || 20;
        this.listRef = listRef;
        this.query = _query;
        this.cache = {};
        this.onData = onData;
        this.result = {total: 0};
        this.cache = {};
        this.maxCachedPage = 0;
    }

    Pagination.prototype.get = function (page, size, orderBy) {
        var self = this,
            preload = this.query.preload || 2,
            id = getPaginationId(page, size, orderBy);
        if (self.cache && self.cache[id] && parseInt(page) + preload < self.maxCachedPage) {
            self.result.hits =  self.cache[id];
            return Promise.resolve(self.cache[id]);
        } else {
            self.maxCachedPage = parseInt(page) + 2 * preload;
            return new Promise(function (resolve, reject) {
                self.listener(self.maxCachedPage, page, size, orderBy, resolve, reject);
            });
        }
    };

    Pagination.prototype.listener = function (maxCachedPage, page, size, orderBy, resolve, reject) {
        var self = this,
            limitTo = maxCachedPage * parseInt(size),
            isDesc = orderBy.split('-')[1],
            _orderBy = isDesc ? isDesc : orderBy,
            limitToType = isDesc ? 'limitToLast' : 'limitToFirst';

        var _ref;
        if (orderBy) {
            _ref = this.listRef.orderByChild(_orderBy.replace('.', '/'));
        } else {
            _ref = this.listRef.orderByKey();
        }

        var equalTo = this.query.equalTo === '' ? undefined : this.query.equalTo,
            startAt = this.query.startAt === '' ? undefined : this.query.startAt,
            endAt = this.query.endAt === '' ? undefined : this.query.endAt;


        if (equalTo !== undefined) {
            if (isFinite(equalTo) && typeof equalTo !== 'boolean') equalTo = Number(equalTo);
            _ref = _ref.equalTo(equalTo);

        } else {
            if (isFinite(startAt) && typeof startAt !== 'boolean') startAt = Number(startAt);
            if (isFinite(endAt) && typeof endAt !== 'boolean') endAt = Number(endAt);
            _ref = startAt !== undefined ? _ref.startAt(startAt) : _ref;
            _ref = endAt !== undefined ? _ref.endAt(endAt) : _ref;
        }

        if (typeof this.listenerCallback === 'function') {
            this.listRef.off('value', this.listenerCallback);
        }

        this.listenerCallback = _ref[limitToType](limitTo).on('value', onValue, reject);
        function onValue(snap) {
            var _page = 1,
                arr = [];
            snap.forEach(function (childSnap) {
                arr.push(Object.assign({_key: childSnap.key}, childSnap.val()));
            });
            var sortedArr = arr;
            if (self.query.filter) {
                sortedArr = self.query.filter(arr, Object.assign(self.query,{
                    page: page,
                    size: size,
                    orderBy: orderBy
                }));
            }

            sortedArr.forEach(function (value, index) {
                var itemsOnPreviousPages=_page * parseInt(size);
                if (index+1 > itemsOnPreviousPages) {
                    _page++;
                }
                var id = getPaginationId(_page, size, orderBy);
                self.cache[id] = self.cache[id] ||[];
                self.cache[id][_page===1? index: (index-itemsOnPreviousPages)]=value;
            });

            var hits = self.cache[getPaginationId(page, size, orderBy)];
            self.result.total = sortedArr.length;
            self.result.hits = self.result.total === 0 ? [] : hits;

            resolve(hits);
            if (self.onData) self.onData({total: sortedArr.length, hits: hits});
        }
    };

    function getPaginationId(page, size, orderBy) {
        return 's' + size + 'p' + page + 'o' + orderBy;
    }
})();
