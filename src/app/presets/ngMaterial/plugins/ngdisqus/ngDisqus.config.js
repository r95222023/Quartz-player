(function() {
    'use strict';
    var pluginsModule;
    try{
        pluginsModule=angular.module('app.plugins');
    }catch(e){
        pluginsModule = angular.module('app.plugins',[]);
    }

    pluginsModule
        .config(/* @ngInject */ function($disqusProvider, $locationProvider){
            $disqusProvider.setShortname('quartzseed');
            //$locationProvider.hashPrefix('!');
            //already did in config.route
        })
})();
