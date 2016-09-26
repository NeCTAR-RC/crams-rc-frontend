/**
 * Created by simonyu on 19/10/15.
 */
(function () {
    'use strict';
    angular.module('crams.nectar').controller('NCAllocController', NCAllocController);

    NCAllocController.$inject = ['FlashService', 'NectarRequestService', 'LookupService', '$scope', '$filter'];
    function NCAllocController(FlashService, NectarRequestService, LookupService, $scope, $filter) {
        var vm = this;
        //get nectar allocation requests
        NectarRequestService.listMyAllocations().then(function (response) {
            if (response.success) {
                vm.nc_projects = response.data;
            } else {
                var msg = "Failed to get NeCTAR allocation request, " + response.message;
                FlashService.Error(msg);
                console.error(msg);
            }
        });
    }
})();
