(function () {
    'use strict';

    angular
        .module('app.plugins.stripe')
        .provider('$stripe', stripeProvider)
        .factory('stripeCheckout', stripeCheckout);

    ////
    function stripeProvider() {
        var defaultConfig = {
            key: 'pk_test_6pRNASCoBOKtIshFeQd4XMUh',
            //token:'',
            //image: '/img/documentation/checkout/marketplace.png',
            name: 'Quartz',
            description: '',
            amount: '',
            locale: 'auto',
            currency: 'USD',
            panelLabel: '{{amount}}',
            zipCode: false,
            billingAddress: false,
            shippingAddress: false,
            //email:'',
            allowRememberMe: true,
            //opened:'',
            //closed:'',
            bitcoin: false,
            alipay: false,
            alipayReusable: false
        };
        this.setParams = function (value) {
            defaultConfig = value;
        };

        function Stripe(defaultConfig) {
            this.defaultConfig = defaultConfig;
        }

        Stripe.prototype.setParams = function (value) {
            this.defaultConfig = value;
        };

        Stripe.prototype.getPaymentInfo = function (order, opt) {
            var cart = order.cart ? order.cart : {},
                items = cart.items || [],
                _opt = opt || {};

            //for descriptions
            var description = '';
            if (angular.isString(order.description) || angular.isString(_opt.description)) {
                description = order.description
            } else if (angular.isFunction(_opt.description)) {
                description = _opt.description(order)
            } else {
                angular.forEach(items, function (item, name) {
                    description = description + (_opt.namePrefix || '') + item.name + (_opt.namePostfix || ' ') + (_opt.pricePrefix || '$') + item.price + (_opt.pricePostfix || '') + (_opt.quantityPrefix || '*') + item.quantity + (_opt.quantityPostfix || '') + '#'
                });
                description = description.slice(0, -1);
            }

            //for total amount
            var amount = 0;
            if (angular.isNumber(order.totalAmount) || angular.isNumber(_opt.totalAmount)) {
                amount = order.totalAmount || _opt.totalAmount;
            } else if (angular.isFunction(_opt.totalAmount)) {
                amount = _opt.totalAmount(order);
            } else {
                angular.forEach(cart, function (item, name) {
                    amount = amount + (item.quantity * item.price);
                });
            }

            return angular.extend({}, this.defaultConfig, _opt.paymentParams||{}, {
                description: description,
                amount: amount
            });
        };

        this.$get = /* @ngInject */ function () {
            return new Stripe(defaultConfig)
        }
    }


    /* @ngInject */
    function stripeCheckout($q) {
        function _stripeCheckout(configure) {
            var def = $q.defer();
            loadStripe(function () {
                var handler = window.StripeCheckout.configure(configure);
                def.resolve(handler);
            });
            return def.promise;
        }

        return _stripeCheckout;
    }

    function loadStripe(onload) {
        if (!window.StripeCheckout) {
            var s = document.createElement("script");
            s.type = "text/javascript";
            s.src = "https://checkout.stripe.com/checkout.js";
            document.body.appendChild(s).onload = onload
        } else {
            onload();
        }
    }

})();
