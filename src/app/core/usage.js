(function () {
    'use strict';

    window._core = window._core || {};
    window._core.Usage = Usage;
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return Usage;
        });
    } else if (typeof module !== 'undefined' && module != null) {
        module.exports = Usage
    }



    function Usage(util){
        this.util=util;
        this.storageUsage=0;
        this.databaseUsage=0;
    }

    Usage.prototype.useBandwidth = function (size, type) {
        this[type+'Usage'] += window._core.isNumeric(size)? size:encodeURI(JSON.stringify(size)).split(/%..|./).length - 1;
        console.log(type+' usage:', this[type+'Usage']);
    };

    Usage.prototype.init=function(){
        window._core.usage=this;
    };
})();
