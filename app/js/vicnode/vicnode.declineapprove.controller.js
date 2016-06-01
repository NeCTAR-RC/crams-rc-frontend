/**
 * Created by simonyu on 9/05/16.
 */

(function () {
    'use strict';
    angular.module('crams.nectar').controller('VNDeclineApproveController', VNDeclineApproveController);

    VNDeclineApproveController.$inject = ['$location', '$route', '$scope', '$routeParams', 'VicnodeRequestService', 'LookupService', 'FlashService', 'CramsUtils', '$filter'];
    function VNDeclineApproveController($location, $route, $scope, $routeParams, VicnodeRequestService, LookupService, FlashService, CramsUtils, $filter) {
        var vm = this;
        var request_id = $routeParams.request_id;

        var request_paths = $location.path().split('/');
        var current_path = request_paths[1];


        VicnodeRequestService.getProjectRequestById(request_id).then(function (response) {
            if (response.success) {
                //console.log("Success - " + JSON.stringify({data: response.data}));
                vm.alloc = response.data[0];
                //console.log('vm.alloc: ' + JSON.stringify(vm.alloc))
            } else {
                var msg = "Failed to get VicNode allocation request, " + response.message;
                FlashService.Error(msg);
                console.error(msg);
            }
        });

        //Populate nectar storage product lookup
        LookupService.vnStorageProducts().then(function (response) {
            if (response.success) {
                vm.vnStorageProducts = response.data;
            } else {
                var msg = "Failed to load vicnode storage products, " + response.message;
                FlashService.Error(msg);
                console.error(msg);
            }
        });

        vm.duplicated_sp = false;

        //check storage product duplicate
        vm.changeStorageProduct = function (scope, index) {
            var found_duplicated = false;
            var current_sp_req = vm.alloc.requests[0].storage_requests[index];

            var sp_id = current_sp_req.storage_product.id;

            var new_sp = _.findWhere(vm.vnStorageProducts, {'id': sp_id});

            //console.log('---- storage products: ' + angular.toJson(vm.vnStorageProducts));

            vm.alloc.requests[0].storage_requests[index].storage_product = angular.copy(new_sp);
            // check the duplicated sps
            angular.forEach(vm.alloc.requests[0].storage_requests, function (each_sp_req, key) {
                if (key != index) {
                    if (each_sp_req.storage_product.id == current_sp_req.storage_product.id) {
                        found_duplicated = true;
                    }
                }
            });
            scope.vn_approve_form.vicnode_sp.$setValidity('isdup', !found_duplicated);

            if (found_duplicated) {
                vm.duplicated_sp = true;
            } else {
                vm.duplicated_sp = false;
            }
        };

        vm.vn_decline_alloc = function () {
            var approval_notes = vm.declineParams.approval_notes;
            VicnodeRequestService.declineRequest({'approval_notes': approval_notes}, request_id).then(function (response) {
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

        function validate_approve_form() {
            return !vm.duplicated_sp;
        }

        vm.vn_approve_alloc = function () {
            var valid = validate_approve_form();
            if (valid) {
                _.each(vm.alloc.requests, function (req, index, list) {
                    var ar = _.pick(req, 'compute_requests', 'storage_requests', 'approval_notes');

                    VicnodeRequestService.approveRequest(ar, req.id).then(function (response) {
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
            }
        };
    }
})();
