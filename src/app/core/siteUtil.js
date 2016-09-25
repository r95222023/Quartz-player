(function () {
    'use strict';
    var siteUtil = {};
    window._core = window._core || {};
    window._core.siteUtil = siteUtil;
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return siteUtil;
        });
    } else if (typeof module !== 'undefined' && module != null) {
        module.exports = siteUtil
    }

    // document.head = document.head || document.getElementsByTagName('head')[0];

    siteUtil.changeFavicon = function (src) {
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
    siteUtil.changeTitle = function (newTitle) {
        document.title = newTitle;

        // var title = document.createElement('title'),
        //     oldTitle = document.getElementById('dynamic-title');
        // title.id = 'dynamic-favicon';
        // title.innerHTML = newTitle;
        // if (oldTitle) {
        //     document.head.removeChild(oldTitle);
        // }
        // document.head.appendChild(title);
    };
    siteUtil.changeTitle = function (newTitle) {
        document.title = newTitle;

        // var title = document.createElement('title'),
        //     oldTitle = document.getElementById('dynamic-title');
        // title.id = 'dynamic-favicon';
        // title.innerHTML = newTitle;
        // if (oldTitle) {
        //     document.head.removeChild(oldTitle);
        // }
        // document.head.appendChild(title);
    };
})();
