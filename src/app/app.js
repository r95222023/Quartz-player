(function () {
    'use strict';
    _core.util = new _core.AppUtil();
    _core.util.site.getSitePreload().then(function (res) {
        var preload = res||{};
        if(preload.analystics){
            _core.util.analytics.applyTracker(preload.analystics);
        }
        _core.util.loader.loadPreset(preload);
    });
    _core.util.site.loadPage().then(function(page){
        console.log(page);
    });
})();
