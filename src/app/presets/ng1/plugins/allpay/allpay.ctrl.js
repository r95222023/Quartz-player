(function () {
    'use strict';
    var pluginsModule;
    try{
        pluginsModule=angular.module('app.plugins');
    }catch(e){
        pluginsModule = angular.module('app.plugins',[]);
    }

    pluginsModule
        .controller('AllpayCtrl', AllpayCtrl);

    ////
    /* @ngInject */
    function AllpayCtrl($ngCart, $auth, $firebase, $mdMedia, $timeout, snippets) {
        var vm = this;
        var siteName = _core.util.site.siteName;

        vm.order = {
            vendor: {},
            buyer: {},
            shipping: {},
            payment: {}
        };

        // function updateOrderData() {
        //     vm.order.items = {};
        //     $ngCart.$cart.items.forEach(function (item) {
        //         vm.order.items[item.getId()] = item.toObject();
        //     });
        //     vm.order.vendor.id = siteName;
        //     vm.order.buyer.id = $auth.currentUser.uid;
        //
        //     return new Promise(function (resolve, reject) {
        //         $firebase.ref('site-config-payment?provider=allpay').child('private').once('value', function (snap) {
        //             var publicPaymentConf = snap.val();
        //             var pricePromise;
        //             if (publicPaymentConf && publicPaymentConf.calcPrice) {
        //                 eval('pricePromise=new Promise(function(resolve,reject){' + publicPaymentConf.calcPrice + '})')
        //             } else {
        //                 var amount = 0;
        //                 angular.forEach(vm.order.items, function (item) {
        //                     amount += (item.quantity * item.price);
        //                 });
        //                 pricePromise = Promise.resolve(amount);
        //             }
        //         });
        //         pricePromise.then(function (totalAmount) {
        //             vm.order.payment = {
        //                 provider: 'allpay',
        //                 totalAmount: totalAmount,
        //                 allpay: buildAllpayParams()
        //             };
        //             resolve();
        //         });
        //     });
        // }

        // _core.syncTime().then(function (getTime) {
        //     getCurrentTime = getTime;
        //     updateOrderData().then(function () {
        //         $timeout(angular.noop, 0)
        //     });
        // });

        function buildAllpayParams(opt) {
            var items = vm.order.items || {},
                _opt = opt || {};

            //for description
            var itemName = '';
            for (var key in items) {
                itemName = itemName + (_opt.namePrefix || '') + items[key].name + (_opt.namePostfix || ' ') + (_opt.pricePrefix || '$') + items[key].price + (_opt.pricePostfix || '') + (_opt.quantityPrefix || '*') + items[key].quantity + (_opt.quantityPostfix || '') + '#'
            }
            // itemName = itemName.slice(0, -1);


            // return paymentParams;
            // var date = moment(_core.getSyncTime()).format('YYYY/MM/DD HH:mm:ss');

            var paymentParams = Object.assign({}, defaultAllpayParams, {
                ReturnURL: "http://131.193.191.5/planAllpayReceive?sitename=" + siteName + '&uid=' + $auth.currentUser.uid,
                PaymentInfoURL: "http://131.193.191.5/allpayPaymentInfo?sitename=" + siteName + '&uid=' + $auth.currentUser.uid,
                // MerchantTradeDate: date,
                // ChoosePayment: 'Credit',
                // PeriodAmount: plan.periodAmount,
                // TotalAmount: getTotalAmount(plan, currentPlan),
                // PeriodType:'M',
                // Frequency:1,
                // ExecTimes:99,
                PaymentType: 'aio'
            });

            if ($mdMedia('xs')) {
                paymentParams.DeviceSource = 'M'
            } else {
                paymentParams.DeviceSource = 'P'
            }
            paymentParams.ItemName = paymentParams.ItemName || itemName || 'required, please set a value';
            paymentParams.MerchantTradeNo = vm.order.id;

            return paymentParams;
        }

        function getOrderData() {
            vm.order.id = vm.order.id || _core.getSyncTime();
            $ngCart.$cart.items.forEach(function (item) {
                vm.order.items[item.getId()] = item.toObject();
            });
            vm.order.buyer.id = $auth.currentUser.uid;
            vm.order.siteName = siteName;
            vm.order.payer.id = $auth.currentUser.uid;
            vm.order.payment = {
                provider: 'allpay',
                allpay: buildAllpayParams()
            };
            return vm.order;
        }

        function buildRequest(orderData) {
            var req = {payment: {allpay: {}}};
            angular.extend(req, orderData);

            req['_state'] = 'order_allpay_gen_check_mac';
            return snippets.rectifyUpdateData(req);
        }

        function getCheckMacValue() {
            return new Promise(function (resolve, reject) {
                getOrderData();
                var taskRef = $firebase.queryRef('queue-task?id=' + vm.order.id);
                taskRef.set(buildRequest(vm.order))
                    .then(function () {
                        var listener = function (snap) {
                            if (snap.val() && snap.val().payment.allpay.CheckMacValue) {
                                vm.order.payment.allpay = snap.val().payment.allpay;
                                $timeout(angular.noop, 0);
                                console.log(vm.order.payment.allpay);
                                taskRef.off('value', listener);
                                resolve(vm.order);
                            }
                        };
                        taskRef.on('value', listener)
                    });
            });
        }

        // function buildRequest(orderData) {
        //     var req = {payment: {allpay: {}}};
        //     angular.extend(req, orderData);
        //
        //     if ($mdMedia('xs')) {
        //         req.payment.allpay.DeviceSource = 'M'
        //     } else {
        //         req.payment.allpay.DeviceSource = 'P'
        //     }
        //     req.id = orderData.id || orderData.payment.allpay.MerchantTradeNo;
        //     req.siteName = sitesService.siteName;
        //     req.payment.provider = 'allpay';
        //     req['_state'] = 'allpay_gen_check_mac';
        //     return snippets.rectifyUpdateData(req);
        // }
        vm.submit = function () {
            var e = document.getElementsByName('allpay-checkout');
            e[0].submit();
        };

        vm.showDialog = function ($event) {
            var parentEl = angular.element(document.body);
            $mdDialog.show({
                parent: parentEl,
                targetEvent: $event,
                templateUrl: 'app/plugins/allpay/allpayDialog.tmpl.html',
                controller: DialogController
            });

            /* @ngInject */
            function DialogController($scope, $mdDialog, ngCart) {
                var allpayFormAction = vm.stage ? 'https://payment-stage.allpay.com.tw/Cashier/AioCheckOut' : 'https://payment.allpay.com.tw/Cashier/AioCheckOut';

                $scope.allpayFormAction = $sce.trustAsResourceUrl(allpayFormAction);

                getCheckMacValue().then(function (order) {
                    $scope.data = order;
                });

                $scope.submit = function () {
                    $scope.closeDialog();
                    var e = document.getElementsByName('allpay-checkout');
                    e[0].submit();
                    //clear cart
                    ngCart.empty();
                };
                $scope.closeDialog = function () {
                    // remove data
                    // $firebase.queryRef('queue-task?id=' + data['_id']).child('status').set('canceled');
                    $mdDialog.hide();
                }
            }
        }
    }

})();
