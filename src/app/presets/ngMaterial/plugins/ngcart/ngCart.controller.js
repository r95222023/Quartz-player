(function () {
    'use strict';

    var pluginsModule;
    try{
        pluginsModule=angular.module('app.plugins');
    }catch(e){
        pluginsModule = angular.module('app.plugins',[]);
    }

    pluginsModule

        .controller('CartController', CartController)

        .controller('AddToCartController', AddToCartController)

        .controller('CartTableAdvancedController', CartTableAdvancedController);

    /* @ngInject */
    function CartController($scope, ngCart) {
        $scope.ngCart = ngCart;
    }

    /* @ngInject */
    function AddToCartController($scope, ngCart){
        //in directive
    }

    /* @ngInject */
    function CartTableAdvancedController($scope, $timeout, $q) {
        var vm = this;
        vm.query = {
            filter: '',
            limit: '10',
            order: '-id',
            page: 1
        };
        vm.selected = [];
        vm.filter = {
            options: {
                debounce: 500
            }
        };
        //vm.getUsers = getUsers;
        vm.removeFilter = removeFilter;

        activate();

        ////////////////

        function activate() {
            var bookmark;
            $scope.$watch('vm.query.filter', function (newValue, oldValue) {
                if(!oldValue) {
                    bookmark = vm.query.page;
                }

                if(newValue !== oldValue) {
                    vm.query.page = 1;
                }

                if(!newValue) {
                    vm.query.page = bookmark;
                }
            });
        }

        function removeFilter() {
            vm.filter.show = false;
            vm.query.filter = '';

            if(vm.filter.form.$dirty) {
                vm.filter.form.$setPristine();
            }
        }
    }

})();
