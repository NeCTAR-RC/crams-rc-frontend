/**
 * Created by simonyu on 22/10/15.
 */
(function () {
    'use strict';

    angular.module('crams.nectar').factory('CRAMSAAService', CRAMSAAService);

    CRAMSAAService.$inject = ['$http', '$cookieStore', '$rootScope', 'ENV'];
    function CRAMSAAService($http, $cookieStore, $rootScope, ENV) {

        var crams_authen_api_url = ENV.apiEndpoint + "api-token-auth/";

        var crams_check_perm_url = ENV.apiEndpoint + "user_roles/";

        var service = {};
        service.authen = authen;
        service.setCredentials = setCredentials;
        service.cleanCredentials = cleanCredentials;
        service.checkPermissions = checkPerms;
        service.setUserPerms = setUserPerms;
        return service;

        function authen(user) {
            return $http({
                    url: crams_authen_api_url,
                    method: 'POST',
                    data: user
                }
            ).then(handleSuccess, handleError);
        }

        function checkPerms() {
            return $http.get(crams_check_perm_url).then(handleSuccess, handleError);
        }

        function handleSuccess(response) {
            return {
                success: true,
                data: response.data
            };
        }

        function handleError(response) {
            return {
                success: false,
                message: (response.status + " " + response.statusText)
            };
        }

        function setCredentials(username, token_data) {
            $rootScope.globals = {
                currentUser: {
                    username: username,
                    token: token_data
                },
                isLoggedIn: true
            };
            //put user token in the Authorization headers
            $http.defaults.headers.common['Authorization'] = 'Token ' + token_data;
            //set the globals in cookie to make sure the authen info exist after page refresh
            $cookieStore.put('globals', $rootScope.globals);
        }

        function setUserPerms(permissions) {
            if (_.isEmpty(permissions)) {
                $rootScope.globals.isApprover = false;
            } else {
                var roles = permissions.roles;
                if (!_.isUndefined(roles)) {
                    if (_.contains(roles, 'nectar_approver')) {
                        // set user is an approver
                        $rootScope.globals.isApprover = true;
                    }
                }
            }
            //set the globals in cookie to make sure the authen info exist after page refresh
            $cookieStore.put('globals', $rootScope.globals);
        }

        function cleanCredentials() {
            //empty the globals in rootScope
            $rootScope.globals = {};
            //remove the globals from cookie
            $cookieStore.remove('globals');
            // clean the Authorization header
            $http.defaults.headers.common['Authorization'] = '';
        }
    }
})();