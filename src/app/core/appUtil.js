(function (firebase) {
    'use strict';
    window._core = window._core || {};
    window._core.AppUtil = AppUtil;
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return AppUtil;
        });
    } else if (typeof module !== 'undefined' && module != null) {
        module.exports = AppUtil
    }

    //parse siteName -> get preload data of that site
    var site = 'sites/detail/:siteName',
        user = site + '/users/detail/:userId',
        analysisMonth = 'analysis/months/:month',
        analysisWeek = 'analysis/weeks/:week',
        analysisDate = 'analysis/dates/:date',


        paths = {
            'order-analysis': site + '/orders/analysis/:path',
            'order-analysis-month': site + '/orders/' + analysisMonth,
            'order-analysis-week': site + '/orders/' + analysisWeek,
            'order-analysis-date': site + '/orders/' + analysisDate,
            'servers': 'servers',
            'queue': 'queue',
            'queue-tasks': 'queue/tasks',
            'queue-task': 'queue/tasks/:id',
            'query-request': 'query/request',
            'query-response': 'query/response',
            'query-specs': 'query/specs',
            'query-cache': 'query/cache',
            'templates': 'templates/:type',
            'template': 'templates/:type/:id',
            'my-sites': 'users/detail/:uid/sites',
            'user-path': 'users/detail/:userId/:path',
            'sites': 'sites/:type',
            'site': 'sites/:type/:siteName',
            'site-path': site + '/:path',
            'site-config-preload': site + '/config/preload',
            'site-config-user': site+'/config/user',
            'site-config-payment': site + '/config/payment/',
            'files': site + '/files',
            'file-path': site + '/files/:path',
            'file-root-path': site + '/files:path',
            'user': user,
            'users-site': site + '/users/:type/:userId',
            'site-users': site + '/users/:type',
            'site-user': site + '/users/:type/:userId',
            'root-user': 'users/:type:/:userId/sites/:siteName',
            'pages': site + '/pages/:type',
            'page': site + '/pages/:type/:id',
            'page-property': site + '/pages/:type/:id/:property',
            'widgets': site + '/widgets/:type',
            'widget': site + '/widgets/:type/:id',
            'products': site + '/products/:type',
            'product-categories': site + '/products/config/categories',
            'product': site + '/products/:type/:id',
            'articles': site + '/articles/:type',
            'article-categories': site + '/articles/config/categories',
            'article': site + '/articles/:type/:id',
            'orders': site + '/orders/:type',
            'site-orders': site + '/orders/:type',
            'site-order': site + '/orders/:type/:id',
            'order-payment': site + '/orders/:type/:orderId/payment',
            'user-order-payment': user + '/orders/:type/:orderId/payment',
            'user-orders': user + '/orders/:type',
            'order-payment-allpay': site + '/orders/detail/:orderId/payment/allpay',
            'orders-analysis': site + '/orders/analysis/:dateId',
            'notifications': 'users/detail/:uid/notifications',
            'plans':'plans/:type'
        };


    var fbconfigDefault = {
        apiKey: "AIzaSyAfxA30u_wPOkVCn727MJXZ4eFhg4raKdI",
        authDomain: "quartz.firebaseapp.com",
        databaseURL: "https://quartz.firebaseio.com",
        storageBucket: "project-3415547818359859659.appspot.com",
        appName: 'quartz'
    };

    function AppUtil(fbconfig) {
        var _fbconfig = fbconfig || fbconfigDefault,
            appName = _fbconfig.appName || _fbconfig.databaseURL;
        //constructor
        this.app = firebase.initializeApp(_fbconfig, appName);
        this.paths = _fbconfig.paths || paths;

        this.database = new window._core.DatabaseUtil(this);
        this.storage = new window._core.StorageUtil(this);
        this.elasticsearch = new window._core.ElasticSearch(this);

        this.usage = new window._core.Usage(this);
        this.usage.init();

        this.auth = new window._core.Auth(this);
        this.site = new window._core.SiteUtil(this);

        this.loader = new window._core.Loader(this);
        this.analytics = new window._core.Analytics(this);
    }

    AppUtil.prototype.parseRefUrl = function (refUrl, option, isFile) {
        var res = refUrl,
            opt = typeof option === 'object' ? option.params || option : {},
            params = Object.assign({}, opt),
            refUrlAndParams = refUrl.split('?'),
            stringParams = (refUrlAndParams[1] || '').split('&');
        if (stringParams[0] !== '') {
            stringParams.forEach(function (val) {
                var hash = val.split('=');
                params[hash[0]] = hash[1];
            })
        }
        if (this.paths[refUrlAndParams[0]]) {
            res = this.paths[refUrlAndParams[0]];

            for (var key in params) {
                res = res.replace(':' + key, params[key + '']);
            }
        }
        var fileExtension = res.split('.').length === 1;

        res = isFile && fileExtension ? (res + '.js') : res;
        return res
    };


})(firebase);



