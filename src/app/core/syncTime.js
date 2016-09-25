(function () {
    'use strict';
    window._core = window._core || {};
    window._core.syncTime = syncTime;
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return syncTime;
        });
    } else if (typeof module !== 'undefined' && module != null) {
        module.exports = syncTime;
    }

    var offset,
        promise = new Promise(function (resolve, reject) {
            var r = new XMLHttpRequest();
            var start = (new Date).getTime(),
                systemtime;

            r.open('HEAD', document.location, false);
            r.onreadystatechange = function () {
                if (r.readyState != 4) {
                    return;
                }
                var latency = (new Date).getTime() - start;
                var timestring = r.getResponseHeader("DATE");

                // Set the time to the **slightly old** date sent from the
                // server, then adjust it to a good estimate of what the
                // server time is **right now**.
                systemtime = new Date(timestring);
                systemtime.setMilliseconds(systemtime.getMilliseconds() + (latency / 2));
                offset = systemtime - (new Date());

                resolve(function () {
                    if (offset) return (new Date()).getTime() + offset;
                });
            };
            r.send(null);
        });

    function syncTime() {
        return promise
    }
})();


