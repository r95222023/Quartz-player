(function () {
    /**
     * Disqus thread comment directive.
     * Used to display the comments block for a thread.
     */
    var pluginsModule;
    try{
        pluginsModule=angular.module('app.plugins');
    }catch(e){
        pluginsModule = angular.module('app.plugins',[]);
    }

    pluginsModule
        .directive('disqus', ['$disqus', function ($disqus) {

            return {
                restrict: 'AC',
                replace: true,
                scope: {
                    id: '=disqus'
                },
                template: '<div id="disqus_thread"></div>',
                link: function link(scope) {
                    scope.$watch('id', function (id) {
                        if (angular.isDefined(id)) {
                            $disqus.commit(id);
                        }
                    });
                }
            };
        }])

        /**
         * Disqus comment count directive.
         * Just wraps `disqus-identifier` to load the disqus comments count script tag on page
         */
        .directive('disqusIdentifier', ['$disqus', function ($disqus) {
            return {
                restrict: 'A',
                link: function (scope, elem, attr) {
                    $disqus.loadCount(attr.disqusIdentifier);
                }
            };
        }]);
})();
