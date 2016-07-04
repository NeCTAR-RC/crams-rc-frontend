/**
 * Created by simonyu on 23/08/15.
 */
(function () {
    'use strict';
    angular.module('crams.nectar').controller('AAFLoginController', AAFLoginController);

    AAFLoginController.$inject = ['$scope', '$location', 'CRAMSAAService', 'FlashService', 'ENV'];
    function AAFLoginController($scope, $location, CRAMSAAService, FlashService, ENV) {
        var vm = this;
        vm.logout = logout;
        var path = $location.url();
        var fullUrl = $location.absUrl();
        var rc_shib_redirect = 'redirect-to-rc-shib?ks_login_url=';
        var ks_login_url = fullUrl.replace(path, '') + '/ks-login';
        vm.rc_shib_url = ENV.apiEndpoint + rc_shib_redirect + ks_login_url;
        function logout() {
            //just clear the credentials
            //console.log('User logged out  now');
            CRAMSAAService.cleanCredentials();
            // return back to the home page
            $location.path('/');
        }
    }

})();
