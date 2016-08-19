/**
 * Created by simonyu on 9/02/16.
 */
(function () {
    'use strict';
    angular.module('crams.nectar').controller('CRAMSLoginController', CRAMSLoginController);

    CRAMSLoginController.$inject = ['$scope', '$location', 'CRAMSAAService', 'FlashService', 'ENV'];
    function CRAMSLoginController($scope, $location, CRAMSAAService, FlashService, ENV) {
        var vm = this;
        vm.user = {};
        vm.login = login;
        function login() {
            //clean any previous login status first if any
            CRAMSAAService.cleanCredentials();

            vm.dataLoading = true;
            CRAMSAAService.authen(vm.user).then(function (response) {
                if (response.success) {
                    var auth_data = response.data;
                    var token = auth_data.token;
                    CRAMSAAService.setCredentials(vm.user.username, token);
                    //check user permissions
                    checkUserPermissions();
                } else {
                    FlashService.Error(response.message);
                    vm.dataLoading = false;
                }
            });
        }

        function checkUserPermissions() {
            //check user permissions
            CRAMSAAService.checkPermissions().then(function (response) {
                if (response.success) {
                    CRAMSAAService.setUserPerms(response.data);
                    $location.path('/allocations');
                } else {
                    var msg = "Failed to get user permissions, " + response.message;
                    FlashService.Error(msg);
                    console.error(msg);
                }
            });
        }
    }

})();
