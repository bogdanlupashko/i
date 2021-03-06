define('documents', ['angularAMD', 'service'], function (angularAMD) {
    var app = angular.module('Documents', []);

    app.config(['$stateProvider', function ($stateProvider) {
        $stateProvider
            .state('documents', {
                url: '/documents',
                views: {
                    '': angularAMD.route({
                        templateProvider: ['$templateCache', function($templateCache) {
							return $templateCache.get('html/documents/index.html');
						}],
						controller: 'DocumentsController',
                        controllerUrl: 'state/documents/controller'
                    })
                }
            })
            .state('documents.bankid', {
                url: '/bankid?code',
                parent: 'documents',
                views: {
                    'bankid': angularAMD.route({
                        templateProvider: ['$templateCache', function($templateCache) {
							return $templateCache.get('html/documents/bankid/index.html');
						}],
						controller: 'DocumentsBankIdController',
                        controllerUrl: 'state/documents/bankid/controller'
                    })
                }
            })
            .state('documents.content', {
                url: '/content?code',
                parent: 'documents',
                resolve: {
                    BankIDLogin: ['$q', '$state', '$location', '$stateParams', 'BankIDService', function($q, $state, $location, $stateParams, BankIDService) {
                        var url = $location.protocol()
                            +'://'
                            +$location.host()
                            +':'
                            +$location.port()
                            +$state.href('documents.bankid');

                        return BankIDService.login($stateParams.code, url).then(function(data) {
                            return data.hasOwnProperty('error') ? $q.reject(null): data;
                        });
                    }],
                    BankIDAccount: ['BankIDService', 'BankIDLogin', function(BankIDService, BankIDLogin) {
                        return BankIDService.account(BankIDLogin.access_token);
                    }],
                    customer: ['BankIDAccount', function (BankIDAccount) {
                        return BankIDAccount.customer;
                    }],
                    subject: ['$q', '$state', 'ServiceService', 'customer', function($q, $state, ServiceService, customer) {
                        $state.customer = customer;
                        return ServiceService.syncSubject(customer.inn).then(function(data) {
                            return data.hasOwnProperty('error') ? $q.reject(null): data;
                        });
                    }],
                    documents: ['$q', '$state', 'subject', 'ServiceService', function($q, $state, subject, ServiceService) {
                        $state.nID_Subject = subject.nID;
                        return ServiceService.getDocuments($state.nID_Subject).then(function(data) {
                            return data.hasOwnProperty('error') ? $q.reject(null) : data;
                        });
                    }]
                },
                views: {
                    'content': angularAMD.route({
                        templateProvider: ['$templateCache', function($templateCache) {
							return $templateCache.get('html/documents/content.html');
						}],
						controller: 'DocumentsContentController',
                        controllerUrl: 'state/documents/content/controller'
                    })
                }
            })
    }]);
    return app;
});

