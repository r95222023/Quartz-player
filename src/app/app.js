(function () {
    'use strict';
    _core.util = new _core.AppUtil();
    _core.util.getSitePreload().then(function (res) {
        var preload = res||{};
        _core.util.loader.loadPreset(preload);
    });
    _core.util.loadPage().then(function(page){
        console.log(page);
    });
})();
