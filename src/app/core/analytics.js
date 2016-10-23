(function () {
    'use strict';
    window._core = window._core || {};
    window._core.Analytics = Analytics;
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return Analytics;
        });
    } else if (typeof module !== 'undefined' && module != null) {
        module.exports = Analytics
    }

    function Analytics(util) {
        //constructor
        this.util = util;
        this.tracker = [];
    }

    Analytics.prototype.applyTracker= function(analysticsSetting){

        for(var provider in analysticsSetting||{}){
            switch(provider){
                case 'ga':
                    var config = analysticsSetting[provider];
                    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
                    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
                    this.tracker.push('ga');
                    ga('create', config.id, 'auto');
                    if(config.send) ga('send', 'pageview');
                    break;
            }
        }


    };


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
