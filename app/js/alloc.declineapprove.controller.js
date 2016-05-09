/**
 * Created by simonyu on 26/10/2015.
 */
(function () {
    'use strict';
    angular.module('crams.nectar').controller('DeclineApproveController', DeclineApproveController);

    DeclineApproveController.$inject = ['$location', '$route', '$scope', '$routeParams', 'NectarRequestService', 'LookupService', 'FlashService', 'CramsUtils', '$filter'];
    function DeclineApproveController($location, $route, $scope, $routeParams, NectarRequestService, LookupService, FlashService, CramsUtils, $filter) {
        var vm = this;
        var request_id = $routeParams.request_id;

        var request_paths = $location.path().split('/');
        var current_path = request_paths[1];
        NectarRequestService.getProjectRequestById(request_id).then(function (response) {
            if (response.success) {
                //console.log("Success - " + JSON.stringify({data: response.data}));
                vm.alloc = response.data[0];
                // sort the question responses in form oder
                var question_responses = CramsUtils.sortQuestionResponseInFormOrder(vm.alloc);
                //console.log("Sorted question responses --> : " + JSON.stringify(question_responses));
                vm.alloc.project_question_responses = question_responses.project_question_responses;
                vm.alloc.requests[0].request_question_responses = question_responses.request_question_responses;
            } else {
                var msg = "Failed to get NeCTAR allocation request, " + response.message;
                FlashService.Error(msg);
                console.error(msg);
            }
        });

        // core hours update method
        vm.update_core_hours = function () {
            var start_date_str = $filter('date')(vm.alloc.requests[0].start_date, "yyyy-MM-dd");
            var duration = vm.alloc.requests[0].request_question_responses[0].question_response;
            //console.log('duration: ' + duration);
            var one_hour_time = 1000 * 60 * 60;
            var start_date = new Date(start_date_str);
            var end_date = new Date(start_date_str);
            end_date.setMonth(end_date.getMonth() + parseInt(duration));
            // set the end date
            vm.alloc.requests[0].end_date = end_date.toISOString().substring(0, 10);
            var hours_diff = Math.round((end_date.getTime() - start_date.getTime()) / one_hour_time);
            var num_of_cores = vm.alloc.requests[0].compute_requests[0].approved_cores;
            var estimated_core_hours = Math.round(num_of_cores * hours_diff * 0.5);
            //console.log('estimated_core_hours: ' + estimated_core_hours);
            //copy the estimcated core hours as an approved core hours
            vm.alloc.requests[0].compute_requests[0].approved_core_hours = estimated_core_hours;
        };

        vm.decline_alloc = function () {
            var approval_notes = vm.declineParams.approval_notes;

            NectarRequestService.declineRequest({'approval_notes': approval_notes}, request_id).then(function (response) {
                if (response.success) {
                    FlashService.Success('Successfully declined the request', true);
                    $location.path('/' + current_path);
                } else {
                    var msg = "Failed to decline the request, server error - " + response.message;
                    FlashService.Error(msg);
                    console.error(msg);
                }
            });
        };


        vm.approve_alloc = function () {
            _.each(vm.alloc.requests, function (req, index, list) {
                var ar = _.pick(req, 'compute_requests', 'storage_requests', 'approval_notes');
                //alert(JSON.stringify(ar));
                NectarRequestService.approveRequest(ar, req.id).then(function (response) {
                    if (response.success) {
                        FlashService.Success('Successfully approved the request', true);
                        $location.path('/' + current_path);
                    } else {
                        var msg = "Failed to approve the request, server error - " + response.message;
                        FlashService.Error(msg);
                        console.error(msg);
                    }
                });
            });
        };
    }
})();
