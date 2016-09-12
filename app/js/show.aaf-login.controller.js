/**
 * Created by simonyu on 23/08/15.
 */
(function () {
    'use strict';
    angular.module('crams.nectar').controller('AAFLoginController', AAFLoginController);

    AAFLoginController.$inject = ['$scope', '$rootScope', '$location', 'CRAMSAAService', 'FlashService', 'ENV'];
    function AAFLoginController($scope, $rootScope, $location, CRAMSAAService, FlashService, ENV) {
        var vm = this;
        vm.logout = logout;
        var path = $location.url();
        var fullUrl = $location.absUrl();
        var rc_shib_redirect = 'redirect-to-rc-shib?ks_login_url=';
        var ks_login_url = fullUrl.replace(path, '') + '/ks-login';
        vm.rc_shib_url = ENV.apiEndpoint + rc_shib_redirect + ks_login_url;
        // listen for the token expired event in the relevant $scope
        vm.token_expired = false;
        var expired = $rootScope.token_expired;
        if (expired) {
            vm.token_expired = true;
            vm.token_expired_msg = 'Token expired, please login again';
            $rootScope.token_expired = false;
        }
        function logout() {
            //just clear the credentials 
            CRAMSAAService.cleanCredentials();
            // return back to the home page
            $location.path('/');
        }
    }

})();
