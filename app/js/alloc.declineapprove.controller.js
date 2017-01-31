/**
 * Created by simonyu on 26/10/2015.
 */
(function () {
    'use strict';
    angular.module('crams.nectar').controller('DeclineApproveController', DeclineApproveController);

    DeclineApproveController.$inject = ['$location', '$route', '$scope', '$routeParams', 'NectarRequestService', 'LookupService', 'FlashService', 'CramsUtils', '$filter', '$anchorScroll'];
    function DeclineApproveController($location, $route, $scope, $routeParams, NectarRequestService, LookupService, FlashService, CramsUtils, $filter, $anchorScroll) {
        var vm = this;
        var request_id = $routeParams.request_id;

        var request_paths = $location.path().split('/');
        var current_path = request_paths[1];

        NectarRequestService.getProjectRequestById(request_id).then(function (response) {
            if (response.success) {
                vm.alloc = response.data[0];
                // sort the question responses in form oder
                var question_responses = CramsUtils.sortQuestionResponseInFormOrder(vm.alloc);
                vm.alloc.project_question_responses = question_responses.project_question_responses;
                vm.alloc.requests[0].request_question_responses = question_responses.request_question_responses;
            } else {
                var msg = "Failed to get NeCTAR allocation request, " + response.message;
                FlashService.Error(msg);
                console.error(msg);
            }
        });

        //Populate AllocationHome
        LookupService.nectarAllocationHome().then(function (response) {
            if (response.success) {
                vm.funding_nodes = response.data;
                delete vm.funding_nodes['national'];
            } else {
                var msg = "Failed to load funding nodes, " + response.message;
                FlashService.Error(msg);
                console.error(msg);
            }
        });

        // core hours update method
        vm.update_core_hours = function () {
            vm.calculate_core_hours();
            //copy the estimcated core hours as an approved core hours
            vm.alloc.requests[0].compute_requests[0].approved_core_hours = vm.estimated_core_hours;
            vm.checkInstanceAndCore();
        };

        vm.calculate_core_hours = function () {
            var start_date_str = $filter('date')(vm.alloc.requests[0].start_date, "yyyy-MM-dd");
            var duration = vm.alloc.requests[0].request_question_responses[0].question_response;
            var one_hour_time = 1000 * 60 * 60;
            var start_date = new Date(start_date_str);
            var end_date = new Date(start_date_str);
            end_date.setMonth(end_date.getMonth() + parseInt(duration));
            // set the end date
            vm.alloc.requests[0].end_date = end_date.toISOString().substring(0, 10);
            var hours_diff = Math.round((end_date.getTime() - start_date.getTime()) / one_hour_time);
            var num_of_cores = vm.alloc.requests[0].compute_requests[0].approved_cores;
            vm.estimated_core_hours = Math.round(num_of_cores * hours_diff * 0.5);
        };

        vm.checkInstanceAndCore = function () {
            vm.zero_approved_instances_invalid = false;
            vm.approved_cores_less_invalid = false;
            vm.below_recommend_core_hours_warn = false;
            vm.zero_core_hour_invalid = false;
            vm.non_zero_core_hours_invalid = false;
            var num_of_cores = vm.alloc.requests[0].compute_requests[0].approved_cores;
            var ins = vm.alloc.requests[0].compute_requests[0].approved_instances;
            if (num_of_cores < ins) {
                vm.approved_cores_less_invalid = true;
                vm.approve_form.$valid = false;
            }

            if (ins <= 0 && num_of_cores != 0) {
                vm.zero_approved_instances_invalid = true;
                vm.approve_form.$valid = false;
            }
            var approved_core_hours = vm.alloc.requests[0].compute_requests[0].approved_core_hours;
            vm.calculate_core_hours();
            //if approved core hours is less than recommended core hours. just give a warning message
            if (approved_core_hours > 0 && (approved_core_hours < vm.estimated_core_hours)) {
                vm.below_recommend_core_hours_warn = true;
            }
            if (approved_core_hours <= 0 && num_of_cores != 0) {
                vm.zero_core_hour_invalid = true;
                vm.approve_form.$valid = false;
            }
            if (approved_core_hours > 0 && num_of_cores == 0) {
                vm.non_zero_core_hours_invalid = true;
                vm.approve_form.$valid = false;
            }
        };

        vm.decline_alloc = function () {
            NectarRequestService.declineRequest({'approval_notes': vm.approval_notes}, request_id).then(function (response) {
                if (response.success) {
                    FlashService.Success('Request declined', true);
                    $location.path('/' + current_path);
                } else {
                    var msg = "Failed to decline the request, server error - " + response.message;
                    FlashService.Error(msg);
                    console.error(msg);
                }
            });
        };

        vm.approve_alloc = function () {
            if (vm.validate()) {
                _.each(vm.alloc.requests, function (req, index, list) {
                    // alert('req: ' + angular.toJson(req));
                    var ar = _.pick(req, 'compute_requests', 'storage_requests', 'national_percent', 'allocation_home', 'approval_notes');
                    NectarRequestService.approveRequest(ar, req.id).then(function (response) {
                        if (response.success) {
                            FlashService.Success('Request approved', true);
                            $location.path('/' + current_path);
                        } else {
                            var msg = "Failed to approve the request, server error - " + response.message;
                            FlashService.Error(msg);
                            console.error(msg);
                        }
                    });
                });
            } else {
                var msg = "Please fix up the below errors";
                FlashService.Error(msg);
                $anchorScroll();
            }
        };

        vm.validateNationalPercent = function () {
            vm.national_100_funding_node_invalid = false;
            vm.national_less_100_funding_node_not_provided = false;
            var national_percent = vm.alloc.requests[0].national_percent;
            var funding_node = vm.alloc.requests[0].allocation_home;
            if (national_percent == 100 && funding_node != null) {
                vm.national_100_funding_node_invalid = true;
                vm.approve_form.$valid = false;
            }
            if (national_percent < 100 && funding_node == null) {
                vm.national_less_100_funding_node_not_provided = true;
                vm.approve_form.$valid = false;
            }
        };

        vm.validate = function () {
            vm.checkInstanceAndCore();
            vm.validateNationalPercent();
            //valid storage requests approve_quota
            _.each(vm.alloc.requests, function (req, idx, list) {
                var storage_reqests_data = _.pick(req, 'storage_requests');
                angular.forEach(storage_reqests_data.storage_requests, function (storage_req, index) {
                    if (storage_req.approved_quota < 0) {
                        vm.approve_form['approved_quota_' + index].$invalid = true;
                        vm.approve_form.$valid = false;
                    }
                    if (!vm.approve_form['approved_quota_' + index].$valid) {
                        vm.approve_form.$valid = false;
                    }
                });
            });
            return vm.approve_form.$valid;
        }
    }
})();
