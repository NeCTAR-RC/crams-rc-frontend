/**
 * Created by RJ on 21/12/2015.
 */


(function () {
    'use strict';
    angular.module('crams.nectar').controller('VicnodeStorageRequestsController', VicnodeStorageRequestsController);
    VicnodeStorageRequestsController.$inject = ['$scope', '$log'];

    function VicnodeStorageRequestsController($scope, $log) {

        var vm = this;
        vm.parentCtrl = {};
        vm.storageRequests = [];

        // constants for storage product IDs
        const VN_STORAGEPRODUCTID = {
            MONASH_VAULT: 15,
            MONASH_MARKET: 13,
            MONASH_COMPUTATIONAL: 11,

            MELBOURNE_VAULT: 14,
            MELBOURNE_MARKET: 12,
            MELBOURNE_COMPUTATIONAL: 10
        }

        // constants for storage product Namess
        const VN_STORAGEPRODUCTNAME = {
            MONASH_VAULT: "VicNode Vault (Monash)",
            MONASH_MARKET: "VicNode Market (Monash)",
            MONASH_COMPUTATIONAL: "VicNode Computational (Monash)",

            MELBOURNE_VAULT: "VicNode Vault (Melbourne)",
            MELBOURNE_MARKET: "VicNode Market (Melbourne)",
            MELBOURNE_COMPUTATIONAL: "VicNode Computational (Melbourne)",
        }

        // defaults for monash vicnode
        vm.vst1_storageproduct_id = VN_STORAGEPRODUCTID.MONASH_VAULT;
        vm.vst2_storageproduct_id = VN_STORAGEPRODUCTID.MONASH_MARKET;
        vm.vst3_storageproduct_id = VN_STORAGEPRODUCTID.MONASH_COMPUTATIONAL;
        vm.vst1_storageproduct_name = VN_STORAGEPRODUCTNAME.MONASH_VAULT;
        vm.vst2_storageproduct_name = VN_STORAGEPRODUCTNAME.MONASH_MARKET;
        vm.vst3_storageproduct_name = VN_STORAGEPRODUCTNAME.MONASH_COMPUTATIONAL;

        vm.initialise = function initialise(parentCtrl, storageRequests) {
            $log.debug("Initialising Vicnode Storage Requests Form")
            vm.parentCtrl = parentCtrl;
            //storageRequests not currently used, use to populate fields when doing story for editing forms
        }

        vm.isValid = function isValid() {
            var valid = true;
            vm.storage_invalid = false;
            vm.storage_selection_invalid = false;
            vm.vst1_current_invalid = false;
            vm.vst1_requested_invalid = false;
            vm.vst2_current_invalid = false;
            vm.vst2_requested_invalid = false;
            vm.vst3_current_invalid = false;
            vm.vst3_requested_invalid = false;

            // check if storage request is not empty
            if (vm.storageRequests.length != 0) {
                if (vm.vst1_checked) {
                    if (!vm.vst1_current) {
                        //console.log("Validation error: missing current size of data input from Vault(VST1)");
                        vm.storage_invalid = true;
                        vm.vst1_current_invalid = true;
                        valid = false;
                    }
                    if (!vm.vst1_requested) {
                        //console.log("Validation error: missing requested quota input from Vault(VST1)");
                        vm.storage_invalid = true;
                        vm.vst1_requested_invalid = true;
                        valid = false;
                    }
                }

                if (vm.vst2_checked) {
                    if (!vm.vst2_current) {
                        //console.log("Validation error: missing current size of data input from Market(VST2)");
                        vm.storage_invalid = true;
                        vm.vst2_current_invalid = true;
                        valid = false;
                    }
                    if (!vm.vst2_requested) {
                        //console.log("Validation error: missing requested quota input from Market(VST2)");
                        vm.storage_invalid = true;
                        vm.vst2_requested_invalid = true;
                        valid = false;
                    }
                }

                if (vm.vst3_checked) {
                    if (!vm.vst3_current) {
                        //console.log("Validation error: missing current size of data input from Computational(VST3)");
                        vm.storage_invalid = true;
                        vm.vst3_current_invalid = true;
                        valid = false;
                    }
                    if (!vm.vst3_requested) {
                        //console.log("Validation error: missing requested quota input from Computational(VST3)");
                        vm.storage_invalid = true;
                        vm.vst3_requested_invalid = true;
                        valid = false;
                    }
                }
            } else {
                //console.log("Validation error: no storage requests");
                vm.storage_invalid = true;
                vm.storage_selection_invalid = true;
                valid = false;
            }

            return valid;
        }

        function determineStorageProducts() {
            switch(vm.storage_fundingbody) {
                case "melbourne":
                    vm.vst1_storageproduct_id = VN_STORAGEPRODUCTID.MELBOURNE_VAULT;
                    vm.vst2_storageproduct_id = VN_STORAGEPRODUCTID.MELBOURNE_MARKET;
                    vm.vst3_storageproduct_id = VN_STORAGEPRODUCTID.MELBOURNE_COMPUTATIONAL;

                    vm.vst1_storageproduct_name = VN_STORAGEPRODUCTNAME.MELBOURNE_VAULT;
                    vm.vst2_storageproduct_name = VN_STORAGEPRODUCTNAME.MELBOURNE_MARKET;
                    vm.vst3_storageproduct_name = VN_STORAGEPRODUCTNAME.MELBOURNE_COMPUTATIONAL;
                    break;

                case "monash":
                default:
                    vm.vst1_storageproduct_id = VN_STORAGEPRODUCTID.MONASH_VAULT;
                    vm.vst2_storageproduct_id = VN_STORAGEPRODUCTID.MONASH_MARKET;
                    vm.vst3_storageproduct_id = VN_STORAGEPRODUCTID.MONASH_COMPUTATIONAL;

                    vm.vst1_storageproduct_name = VN_STORAGEPRODUCTNAME.MONASH_VAULT;
                    vm.vst2_storageproduct_name = VN_STORAGEPRODUCTNAME.MONASH_MARKET;
                    vm.vst3_storageproduct_name = VN_STORAGEPRODUCTNAME.MONASH_COMPUTATIONAL;
            }
        }

        /**
         * Returns array of storage requests w/ storage question responses in them
         */
        vm.getJSON = function getJSON() {
            determineStorageProducts();
            $log.debug("GetJSON called");
            $log.debug(vm.vst1_checked);

            // clear storageRequests so they don't double up if going through a resubmission
            vm.storageRequests.length = 0;

            if (vm.vst1_checked) { vm.storageRequests.push(getStorageRequestTemplate(vm.vst1_current,
                                                                                     vm.vst1_requested,
                                                                                     vm.vst1_storageproduct_id,
                                                                                     vm.vst1_storageproduct_name,
                                                                                     "vn_current_size_vst1")) }

            if (vm.vst2_checked) { vm.storageRequests.push(getStorageRequestTemplate(vm.vst2_current,
                                                                                     vm.vst2_requested,
                                                                                     vm.vst2_storageproduct_id,
                                                                                     vm.vst2_storageproduct_name,
                                                                                     "vn_current_size_vst2")) }

            if (vm.vst3_checked) { vm.storageRequests.push(getStorageRequestTemplate(vm.vst3_current,
                                                                                     vm.vst3_requested,
                                                                                     vm.vst3_storageproduct_id,
                                                                                     vm.vst3_storageproduct_name,
                                                                                     "vn_current_size_vst3")) }


            return vm.storageRequests;
        }

        // TODO: quite ugly to have all product id's hardcoded, really need to be more dynamic and fetch from backend
        vm.populateStorageRequests = function populateStorageRequests(storageRequests) {
            if (storageRequests) {
                var str_req_json =  JSON.parse(storageRequests);

                // check if product name contains "monash" then populate storage location dropdown
                if (str_req_json[0].storage_product.name.toLowerCase().indexOf("monash") > -1) {
                    vm.storage_fundingbody = "monash";
                } else {
                    vm.storage_fundingbody = "melbourne";
                }

                angular.forEach(str_req_json, function (request, key) {
                    switch (request.storage_product.id) {
                        case 10: // VicNode Computational (Melbourne)
                        case 11: // VicNode Computational (Monash)
                            vm.vst3_checked = true;
                            vm.vst3_current = parseInt(request.storage_question_responses[0].question_response);
                            vm.vst3_requested = request.quota;
                            break;

                        case 12: // VicNode Market (Melbourne)
                        case 13: // VicNode Market (Monash)
                            vm.vst2_checked = true;
                            vm.vst2_current = parseInt(request.storage_question_responses[0].question_response);
                            vm.vst2_requested = request.quota;
                            break;

                        case 14: // VicNode Vault (Melbourne)
                        case 15: // VicNode Vault (Monash)
                            vm.vst1_checked = true;
                            vm.vst1_current = parseInt(request.storage_question_responses[0].question_response);
                            vm.vst1_requested = request.quota;
                            break;
                    }
                })
            }
        }

        /* move to requests model service */

        function getStorageRequestTemplate(current_size, expected_size, product, product_name, key) {
            return {
                "quota": expected_size,
                "approved_quota": expected_size,
                "storage_product": {
                    "id": product,
                    "name": product_name
                },
                "storage_question_responses":[{
                        "question_response": current_size,
                        "question": {
                            "key": key
                        }
                }]
            }


        }
    }
})();

//TODO: need to make directive so that can register this component

angular
    .module('crams.nectar')
    .directive('cramsVicnodeStorageRequestForm', cramsVicnodeStorageRequestForm);

function cramsVicnodeStorageRequestForm() {
    return {
        restrict: 'E',
        scope: {parentCall: '&', storageRequests: '@'},
        controller: 'VicnodeStorageRequestsController',
        controllerAs: 'vm',
        templateUrl: 'templates/vn_storage_requirements.html',
        link: function (scope, elem, attrs, vm) {
            scope.$watch('storageRequests', function(storageRequests){
                vm.populateStorageRequests(storageRequests);
            });
            scope.parentCall()(vm, null);
        }
    };
}