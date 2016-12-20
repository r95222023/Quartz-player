(function() {
    'use strict';

    var pluginsModule;
    try{
        pluginsModule=angular.module('app.plugins');
    }catch(e){
        pluginsModule = angular.module('app.plugins',[]);
    }

    pluginsModule

        .directive('ngcartAddtocart', /* @ngInject */ function(ngCart, $mdToast){
            return {
                restrict : 'E',
                controller : 'CartController',
                scope: {
                    id:'@',
                    name:'@',
                    quantity:'@',
                    quantityMax:'@',
                    price:'@',
                    data:'='
                },
                transclude: true,
                // template:'<div ng-transclude></div>',
                // templateUrl: function(element, attrs) {
                //     if ( typeof attrs.templateUrl == 'undefined' ) {
                //         return 'app/plugins/ngcart/addtocart.tmpl.html';
                //     } else {
                //         return attrs.templateUrl;
                //     }
                // },
                link:function(scope, element, attrs, ctrl, transclude){
                    scope.ngCart = ngCart;
                    scope.attrs = attrs;
                    scope.inCart = function () {
                        return ngCart.getItemById(attrs.id);
                    };

                    if (scope.inCart()) {
                        scope.q = ngCart.getItemById(attrs.id).getQuantity();
                    } else {
                        scope.q = parseInt(scope.quantity);
                    }

                    scope.qtyOpt = [];
                    for (var i = 1; i <= scope.quantityMax; i++) {
                        scope.qtyOpt.push(i);
                    }
                    function currentQuantity(){
                        if(scope.inCart()){
                            return parseInt(ngCart.getItemById(attrs.id).getQuantity());
                        } else {
                            return 0
                        }
                    }
                    scope.addToCart = function (id, name, price, q, data) {

                        if(parseInt(q)+currentQuantity()>scope.quantityMax){
                            addQItems(parseInt(scope.quantityMax),false, 'max quantity reached')

                        } else {
                            addQItems(q,true, 'item added ')
                        }
                        function addQItems(Q, relative, toastMsg){
                            ngCart.addItem(id, name, price, Q, data, relative);
                            $mdToast.show(
                                $mdToast.simple()
                                    .content(toastMsg)
                                    .position('top right')
                                    .hideDelay(1500)
                            );
                        }

                    };
                    transclude(scope, function(clone, scope) {
                        element.append(clone);
                    });
                }

            };
        })

        .directive('ngcartCart', [function(){
            return {
                restrict : 'E',
                controller : 'CartController',
                scope: {},
                templateUrl: function(element, attrs) {
                    if ( typeof attrs.templateUrl == 'undefined' ) {
                        return 'app/plugins/ngcart/cart.tmpl.html';
                    } else {
                        return attrs.templateUrl;
                    }
                },
                link:function(scope, element, attrs){

                }
            };
        }])

        .directive('ngcartSummary', [function(){
            return {
                restrict : 'E',
                controller : 'CartController',
                scope: {},
                transclude: true,
                templateUrl: function(element, attrs) {
                    if ( typeof attrs.templateUrl == 'undefined' ) {
                        return 'app/plugins/ngcart/summary.tmpl.html';
                    } else {
                        return attrs.templateUrl;
                    }
                }
            };
        }])

        .directive('ngcartCheckout', [function(){
            return {
                restrict : 'E',
                controller : ['$rootScope', '$scope', 'ngCart', 'fulfilmentProvider', function($rootScope, $scope, ngCart, fulfilmentProvider) {
                    $scope.ngCart = ngCart;

                    $scope.checkout = function () {
                        fulfilmentProvider.setService($scope.service);
                        fulfilmentProvider.setSettings($scope.settings);
                        fulfilmentProvider.checkout()
                            .then(function (data, status, headers, config) {
                                $rootScope.$broadcast('ngCart:checkout_succeeded', data);
                            },function (data, status, headers, config) {
                                $rootScope.$broadcast('ngCart:checkout_failed', {
                                    statusCode: status,
                                    error: data
                                });
                            })
                    }
                }],
                scope: {
                    service:'@',
                    settings:'='
                },
                transclude: true,
                templateUrl: function(element, attrs) {
                    if ( typeof attrs.templateUrl == 'undefined' ) {
                        return 'app/plugins/ngcart/checkout.tmpl.html';
                    } else {
                        return attrs.templateUrl;
                    }
                }
            };
        }]);
})();


