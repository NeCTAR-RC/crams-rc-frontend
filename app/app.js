(function () {
    'use strict';
    angular.module('crams.nectar', ['ngRoute', 'ngCookies', 'ngResource', 'ui.router', 'ui.bootstrap', 'ngSanitize', 'ngDialog', 'cramsConfig'])
        .config(config)
        .run(run);

    config.$inject = ['$httpProvider', '$routeProvider', '$locationProvider'];
    function config($httpProvider, $routeProvider, $locationProvider) {
        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
        $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        // provide an interceptor to checkout 401 error:
        $httpProvider.interceptors.push(function ($q, $location, $rootScope, $cookieStore) {
            return {
                'responseError': function (rejection) {
                    if (rejection.status === 401) {
                        var msg = rejection.data.detail;
                        // console.log('token expired msg: ' + msg);
                        $rootScope.token_expired = true;
                        // clean any previous login status first if any
                        // empty the globals in rootScope
                        $rootScope.globals = {};
                        // remove the globals from cookie
                        $cookieStore.remove('globals');
                        // force to login again
                        $location.path('/login');
                    }
                    return $q.reject(rejection)
                }
            };
        });

        $routeProvider
            .when('/login', {
                controller: "AAFLoginController",
                templateUrl: 'templates/show_aaf_login.html',
                controllerAs: 'vm'
            })
            .when('/ks-login/', {   //#Do not remove trailing slash
                controller: "KsLoginController",
                templateUrl: 'templates/ks_login.html',
                controllerAs: 'vm'
            })
            .when('/crams-login', {
                controller: "CRAMSLoginController",
                templateUrl: 'templates/crams_login.html',
                controllerAs: 'vm'
            })
            .when('/allocations', {
                controller: 'NCAllocController',
                templateUrl: 'templates/list_allocations.html',
                controllerAs: 'vm'
            })
            .when('/allocations/nectar_request', {
                controller: 'NectarRequestController',
                templateUrl: 'templates/nectar_request.html',
                controllerAs: 'vm'
            })
            .when('/allocations/vn_request', {
                controller: 'VNRequestController',
                templateUrl: 'templates/vicnode/vn_request.html',
                controllerAs: 'vm'
            })
            .when('/allocations/edit_vicnode_request/:project_id/:id', {
                controller: 'VNRequestController',
                templateUrl: 'templates/vicnode/vn_request.html',
                controllerAs: 'vm'
            })
            .when('/allocations/view_request/:request_id', {
                controller: 'AllocDetailController',
                templateUrl: 'templates/view_request.html',
                controllerAs: 'vm'
            })
            .when('/allocations/edit_request/:project_id/:id', {
                controller: 'NectarRequestController',
                templateUrl: 'templates/nectar_request.html',
                controllerAs: 'vm'
            })
            .when('/allocations/history/:id', {
                controller: 'AllocationsHistoryController',
                templateUrl: 'templates/list_allocations_history.html',
                controllerAs: 'vm'
            })
            .when('/approval', {
                controller: 'ApprovalController',
                templateUrl: 'templates/list_approval.html',
                controllerAs: 'vm'
            })
            .when('/approval/view_request/:request_id', {
                controller: 'AllocDetailController',
                templateUrl: 'templates/view_request.html',
                controllerAs: 'vm'
            })
            .when('/approval/edit_request/:project_id/:id', {
                controller: 'NectarRequestController',
                templateUrl: 'templates/nectar_request.html',
                controllerAs: 'vm'
            })
            .when('/approval/approve_request/:request_id', {
                controller: 'DeclineApproveController',
                templateUrl: 'templates/approve_alloc_request.html',
                controllerAs: 'vm'
            })
            .when('/approval/decline_request/:request_id', {
                controller: 'DeclineApproveController',
                templateUrl: 'templates/decline_alloc_request.html',
                controllerAs: 'vm'
            })
            .when('/approval/approve_vicnode_request/:request_id', {
                controller: 'VNDeclineApproveController',
                templateUrl: 'templates/vicnode/vn_approve_alloc_request.html',
                controllerAs: 'vm'
            })
            .when('/approval/decline_vicnode_request/:request_id', {
                controller: 'VNDeclineApproveController',
                templateUrl: 'templates/vicnode/vn_decline_alloc_request.html',
                controllerAs: 'vm'
            })
            .when('/approval/history/:id', {
                controller: 'AllocationsHistoryController',
                templateUrl: 'templates/list_allocations_history.html',
                controllerAs: 'vm'
            })
            .when('/reports', {
                controller: 'ReportController',
                templateUrl: 'templates/alloc_reports.html',
                controllerAs: 'vm'
            })
            .when('/settings', {
                controller: 'SettingsController',
                templateUrl: 'templates/settings.html',
                controllerAs: 'vm'
            })
            .when('/contact_us', {
                controller: 'ContactUsController',
                templateUrl: 'templates/contact_us.html',
                controllerAs: 'vm'
            })
            .when('/terms_condtions', {
                controller: 'TermConditionController',
                templateUrl: 'templates/terms_and_conditions.html',
                controllerAs: 'vm'
            })
            .when('/show_error', {
                controller: 'ErrorController',
                templateUrl: 'templates/error_action.html',
                controllerAs: 'vm'
            })
            .otherwise({redirectTo: '/allocations'});
    }

    run.$inject = ['$rootScope', '$location', '$cookieStore', '$http', 'FlashService'];
    function run($rootScope, $location, $cookieStore, $http, FlashService) {
        // keep user logged in after page refresh
        $rootScope.globals = $cookieStore.get('globals') || {};
        if ($rootScope.globals.currentUser) {
            $http.defaults.headers.common['Authorization'] = 'Token ' + $rootScope.globals.currentUser.token;
        }

        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            // redirect to login page if not logged in and trying to access a restricted page
            var restrictedPage = $.inArray($location.path(), ['/login', '/ks-login/', '/crams-login', '/show_error', '/terms_condtions']) === -1;
            var loggedIn = $rootScope.globals.currentUser;
            if (restrictedPage && !loggedIn) {
                $location.path('/login');
            }
            var current_paths = $location.path().split('/');
            // check whether the current path is admin page or not
            var current_path = current_paths[1];
            if (current_path != undefined) {
                var restrictedAdminPage = _.isEqual(current_path, 'approval');
                var isApprover = $rootScope.globals.isApprover;
                if (restrictedAdminPage && !isApprover) {
                    var msg = "Permission denied!";
                    FlashService.Error(msg, true);
                    $location.path('/show_error');
                }
            }
        });
    }
})();