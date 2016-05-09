/**
 * Created by simonyu on 26/10/2015.
 */
(function () {
    'use strict';
    angular.module('crams.nectar').controller('AllocDetailController', AllocDetailController);

    AllocDetailController.$inject = ['$location', '$route', '$scope', '$routeParams','NectarRequestService', 'LookupService', 'FlashService'];
    function AllocDetailController($location, $route, $scope, $routeParams, NectarRequestService, LookupService, FlashService) {
        var vm = this;

        var request_id = $routeParams.request_id;

        var request_paths = $location.path().split('/');
        var current_path = request_paths[1];


        vm.isEditable = function(path) {
            return path == 'allocations';
        };

        vm.isApprovable = function(status_code, path) {
            if (path != 'approval')  return false;

            var approvableStatusCodes = ['X', 'E', 'Q'];
            return _.contains(approvableStatusCodes, status_code);
        };

        vm.isDeclinable = vm.isApprovable;
        //TODO: the declinable or approvale should be based on the request status code

        NectarRequestService.getProjectRequestById(request_id).then(function (response) {
            if (response.success) {
                //console.log("Success - " + JSON.stringify({data: response.data}));
                vm.alloc_project_request = response.data[0];
            } else {
                var msg = "Failed to get NeCTAR allocation request, " + response.message;
                FlashService.Error(msg);
                console.error(msg);
            }
        });
    }
})();
