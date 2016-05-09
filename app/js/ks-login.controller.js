/**
 * Created by Melvin Luong on 21/12/15.
 */
(function () {
    'use strict';
    angular.module('crams.nectar').controller('KsLoginController', KsLoginController);

    KsLoginController.$inject = ['$scope', '$routeParams', '$location', '$templateCache', 'CRAMSAAService', 'FlashService'];
    function KsLoginController($scope, $routeParams, $location, $templateCache, CRAMSAAService, FlashService) {
        var username = $routeParams.username;
        var token = $routeParams.rest_token;
        //console.log($routeParams.username);
        //console.log($routeParams.rest_token);
        CRAMSAAService.setCredentials(username, token);
        // check user permissions
        checkUserPermissions();

        function checkUserPermissions() {
            //check user permissions
            CRAMSAAService.checkPermissions().then(function (response) {
                if (response.success) {
                    var permission = response.data;
                    var roles = _.pick(permission, 'roles');
                    CRAMSAAService.setUserPerms(roles);
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