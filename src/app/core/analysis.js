(function () {
    'use strict';
    window._core = window._core || {};
    window._core.Analysis = Analysis;
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return Analysis;
        });
    } else if (typeof module !== 'undefined' && module != null) {
        module.exports = Analysis
    }

    function Analysis(util) {
        //constructor
        this.util = util;
        this.database = firebase.database(util.app);
    }


    function getDate(time){
        var timeDate =  time ? new Date(time) : new Date();
        var year = timeDate.getUTCFullYear()-2000,
            month = timeDate.getUTCMonth()+1,
            date = timeDate.getUTCDate(),
            weekday = timeDate.getUTCDay();
        return {
            //
        }
    }

    function getTotalSince(ref,time){
        //
    }

})();
