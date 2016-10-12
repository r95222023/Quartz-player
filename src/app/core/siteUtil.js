(function () {
    'use strict';
    window._core = window._core || {};
    window._core.SiteUtil = SiteUtil;
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return SiteUtil;
        });
    } else if (typeof module !== 'undefined' && module != null) {
        module.exports = SiteUtil
    }


    var siteNameRegEx=/#!\/(.*?)\//;
    function SiteUtil(util){
        this.util=util;
        this.siteName='';
        this.host=location.host;
        var self=this;


        window.onhashchange= function(ev){
            var newURL=ev.newURL;

            if(self.host&&self.host!==newURL.split('//')[1].split('/')[0]){
                location.reload();
            } else {
                var match = location.hash.match(siteNameRegEx);
                var siteName = match ? match[1] : '';
                if(siteName&&siteName!==self.siteName) location.reload();
            }
        };
    }

    // document.head = document.head || document.getElementsByTagName('head')[0];

    SiteUtil.prototype.setSiteName = function (siteName) {
        this.siteName = siteName;
    };
    SiteUtil.prototype.getSiteName = function(){
        var self=this;
        var url = location.href,
            hostname = url.split('//')[1].split('/')[0];

        if (this.siteName) {
            return Promise.resolve(this.siteName);
        } else if (location.hostname == 'localhost'||location.hostname.search('firebaseapp\.com') !== -1) {
            var match = location.hash.match(siteNameRegEx);
            this.siteName = match ? match[1] : '';
            return Promise.resolve(this.siteName);
        } else {
            return new Promise(function (resolve, reject) {
                self.util.database.queryRef('sites', {
                    params: {type: 'list'},
                    orderBy: 'Child: domain',
                    equalTo: hostname,
                    limitToFirst: 1
                }).once('child_added', function (snap) {
                        var val = snap.val();
                        if (!!val && val.siteName) {
                            self.siteName = val.siteName;
                            resolve(val.siteName);
                        } else {
                            self.siteName = url.split('#!/')[1].split('/')[0];
                            resolve(self.siteName);
                        }
                    })
            })
        }
    };
    var siteCache = {};
    SiteUtil.prototype.getSitePreload = function () {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.getSiteName().then(function (siteName) {
                siteCache[siteName] =siteCache[siteName]||{};
                if (siteCache[siteName].preload) {
                    resolve(siteCache[siteName].preload);
                } else {
                    self.util.storage.getWithCache('site-config-preload?siteName=' + siteName).then(function (res) {
                        siteCache[siteName].preload=res;
                        resolve(res);
                    }).catch(reject);
                }
            })
        });
    };
    SiteUtil.prototype.getPageName= function(){
        if (this.pageName) {
            return this.pageName;
        } else if (location.href.search('localhost') !== -1||location.href.search('firebaseapp\.com') !== -1) {
            var regEx = /#!\/.*?\/(.*?)\//;
            var match = location.href.match(regEx);
            return match ? match[1] : 'index'
        } else {
            var url = location.href;
            return url.split('//')[1].split('/')[1];
        }
    };
    SiteUtil.prototype.loadPage = function (_siteName,_pageName) {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.getSiteName().then(function (SITENAME) {
                var siteName = _siteName||SITENAME;
                siteCache[siteName] =siteCache[siteName]||{};
                siteCache[siteName].pageCache = siteCache[siteName].pageCache||{};
                var pageName = _pageName||self.getPageName();
                if (siteCache[siteName].pageCache[pageName]) {
                    resolve(siteCache[siteName].pageCache[pageName]);
                } else {
                    self.util.storage.getWithCache('page?type=detail&id='+pageName+'&siteName=' + siteName).then(function (pageData) {
                        var _pageData = pageData||{};
                        var sources = _pageData.sources||[];
                        self.util.loader.getExternalSourceUrls(sources, siteName).then(function(srcs){
                            sources.forEach(function(source, index){
                                if(source.src) {
                                    sources[index].src = srcs[index];
                                } else if(source.href){
                                    sources[index].href = srcs[index];
                                }
                            });
                            _pageData.sources= sources;
                            resolve(_pageData);
                            siteCache[siteName].pageCache[pageName]=_pageData;
                        });
                    }).catch(reject);
                }
            })
        });
    };
    SiteUtil.prototype.changeFavicon = function (src) {
        var link = document.createElement('link'),
            oldLink = document.getElementById('dynamic-favicon');
        link.id = 'dynamic-favicon';
        link.rel = 'shortcut icon';
        link.href = src;
        if (oldLink) {
            document.head.removeChild(oldLink);
        }
        document.head.appendChild(link);
    };
    SiteUtil.prototype.changeTitle = function (newTitle) {
        document.title = newTitle;
    };
})();
