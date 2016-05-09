/**
 * Created by simonyu on 19/10/15.
 */
(function () {
    'use strict';
    angular.module('crams.nectar').controller('AllocationsHistoryController', AllocationsHistoryController);

    AllocationsHistoryController.$inject = ['FlashService', 'NectarRequestService', '$routeParams'];
    function AllocationsHistoryController(FlashService, NectarRequestService, $routeParams) {
        var vm = this;
        var request_id = $routeParams.id;
        getAllocationsHistory();

        function getAllocationsHistory() {
            NectarRequestService.listAllocationHistory(request_id).then(function (response) {
                if (response.success) {
                    vm.history_list = response.data;
                } else {
                    var msg = "Action Failed, " + response.message;
                    if (response.detail)
                        msg = response.detail;
                    FlashService.Error(msg);
                    console.error(msg);
                }
            });
        }
    }
})();
