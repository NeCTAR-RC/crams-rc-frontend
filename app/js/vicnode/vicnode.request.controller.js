/**
 * Created by simonyu on 11/05/16.
 */


(function () {
    'use strict';
    angular.module('crams.nectar').controller('VNRequestController', VNRequestController);

    VNRequestController.$inject = ['$location', '$scope', '$routeParams', 'FlashService', 'VicnodeRequestService', 'VnQuestionsService', 'LookupService', 'ContactService', 'CramsUtils', '$filter'];
    function VNRequestController($location, $scope, $routeParams, FlashService, VicnodeRequestService, VnQuestionsService, LookupService, ContactService, CramsUtils, $filter) {
        var vm = this;
        vm.project = VicnodeRequestService.newProjectRequest();

        vm.technical_contact = ContactService.makeNewTechnicalContact();
        vm.authorityQuestion = VnQuestionsService.getQuestion('vn_authorization');

        // listener for new contact, refer to contactsearchformcontroller.js for why this is here
        // needs to be refactored to use standard widget interface
        $scope.$on('contact-form-return', function (event, newContact) {
            vm.setContact(newContact);
        });

        vm.setContact = function (newContact) {
            vm.technical_contact.contact.id = newContact.id;
            vm.technical_contact.contact.email = newContact.email;
            vm.project.project_contacts[0] = vm.technical_contact;
        };

        //load FOR Codes
        loadFORCodes();

        //create new domains for FOR codes
        vm.domains = newEmptyDomains();

        //FOR Code Percentages
        vm.for_percentages = forCodePercentages();

        vm.dataMigrationSrcQuestion = VnQuestionsService.getQuestion('vn_data_migration_src');
        vm.dataMigrationAstQuestion = VnQuestionsService.getQuestion('vn_data_migration_assistance');
        vm.accessMethodQuestion = VnQuestionsService.getQuestion('vn_current_access_method');
        vm.preferAccessMethodQuestion = VnQuestionsService.getQuestion('vn_preferred_access_method');
        vm.dataFormatQuestion = VnQuestionsService.getQuestion('vn_data_format');
        vm.onlyCopyQuestion = VnQuestionsService.getQuestion('vn_only_copy');
        vm.canRegeneratedQuestion = VnQuestionsService.getQuestion('vn_can_be_regenerated');
        vm.lossImpactQuestion = VnQuestionsService.getQuestion('vn_loss_impact');

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

        var request_paths = $location.path().split('/');
        var current_path = request_paths[1];

        var project_id = $routeParams.project_id;
        var request_id = $routeParams.id;

        if (project_id) {
            VicnodeRequestService.getProjectRequestById(request_id).then(function (response) {
                if (response.success) {
                    // he populate the models
                    vm.project = response.data[0];
                    vm.technical_contact = response.data[0].project_contacts[0];
                    //sort the request question response in the form order
                    var question_responses = CramsUtils.sortReqQuestionResponseInFormOrder(vm.project);
                    vm.project.requests[0].request_question_responses = question_responses.request_question_responses;

                    // populate the domains forcode 
                    //To populate the selection of for_codes after the request is loaded from the remote server.
                    copyDomainsForCode();
                    //convert current storage size of data from string to int
                    convertSpQuestionResponseToInt();
                } else {
                    var msg = "Failed to get VicNode allocation request, " + response.message;
                    FlashService.Error(msg);
                    //alert(msg);
                    console.error(msg);
                }
            });
        } else {
            //set request start and end date for new request
            setRequestStartDateEndDate();
        }

        //check storage product duplicate
        vm.duplicated_sp = false;
        vm.changeVicNodeSp = function (scope, index) {
            var found_duplicated = false;
            var current_sp_req = vm.project.requests[0].storage_requests[index];

            var sp_id = current_sp_req.storage_product.id;

            var new_sp = _.findWhere(vm.vnStorageProducts, {'id': sp_id});
            vm.project.requests[0].storage_requests[index].storage_product = angular.copy(new_sp);
            // check the duplicated sps
            angular.forEach(vm.project.requests[0].storage_requests, function (each_sp_req, key) {
                if (key != index) {
                    if (each_sp_req.storage_product.id == current_sp_req.storage_product.id) {
                        found_duplicated = true;
                    }
                }
            });
            scope.vicnodeSpForm.vicnode_sp.$setValidity('isdup', !found_duplicated);

            if (found_duplicated) {
                vm.duplicated_sp = true;
            } else {
                vm.duplicated_sp = false;
            }
        };

        // add nectar storage product
        vm.addVicNodeSp = function ($event) {
            $event.preventDefault();
            var storageQuota = newEmptyStorageQuota();
            vm.project.requests[0].storage_requests.push(storageQuota);
        };

        // remove research grant
        vm.removeVicNodeSp = function (index) {
            vm.project.requests[0].storage_requests.splice(index, 1);
        };

        vm.submitVnReq = function () {
            if (validateVnForm()) {
                //copy the requested quota as a default approved quota
                angular.forEach(vm.project.requests[0].storage_requests, function (each_storage_req, key) {
                    //set the approved_quota as requested quota
                    each_storage_req.approved_quota = each_storage_req.quota;
                });
                //copy the project ids
                vm.project.project_ids[0].identifier = vm.project.title;

                if (project_id) {
                    VicnodeRequestService.updateProjectRequest(vm.project, project_id).then(function (response) {
                        if (response.success) {
                            FlashService.Success("Update request successful", true);
                            //alert('Successfully updated request -  ' + JSON.stringify({data: response.data}));
                            //console.log("Success - " + JSON.stringify({data: response.data}));
                            $location.path('/' + current_path);
                        } else {
                            FlashService.Error("Failed to create request, server error - " + response.message);
                            console.error("Failure, server error - " + response.message);
                        }
                    });
                } else {
                    // create a new request
                    VicnodeRequestService.createProjectRequest(vm.project).then(function (response) {
                        if (response.success) {
                            FlashService.Success('Creating request successful', true);
                            //alert('Successfully created request -  ' + JSON.stringify({data: response.data}));
                            //console.log("Success - " + JSON.stringify({data: response.data}));
                            $location.path('/' + current_path);
                        } else {
                            FlashService.Error("Failed to create request, server error - " + response.message);
                            console.error("Failure, server error - " + response.message);
                        }
                    });
                }
            } else {
                FlashService.Error("Please check that all required fields have been filled in correctly.");
                //console.log("Validation Errors check invalid fields.");
            }

        }

        function validateVnForm() {
            var sumfor = 0;
            vm.authority_question_invalid = false;

            vm.title_invalid = false;
            vm.description_invalid = false;

            vm.sum_for_gt_100_invalid = false;
            vm.sum_for_lt_100_invalid = false;

            vm.vicnodeSpForm_sp_invalid = false;
            vm.vicnodeSpForm_sp_quota_invalid = false;

            vm.data_migration_src_invalid = false;

            vm.data_migration_ast_invalid = false;
            vm.access_method_invalid = false;
            vm.prefer_access_method_invalid = false;
            vm.data_formate_invalid = false;
            vm.only_copy_invalid = false;
            vm.loss_impact_invalid = false;


            if (!vm.vicnode_form.authority.$valid) {
                vm.authority_question_invalid = true;
            }

            /**
             *  validate Techincal Contact
             */
            if (!vm.technical_contact.contact.id) {
                //console.log("Validation error: no technical contact");
                vm.contact_invalid = true;
                vm.vicnode_form.$valid = false;
            } else {
                vm.contact_invalid = false;
            }


            if (!vm.vicnode_form.title.$valid) {
                vm.title_invalid = true;
            }

            if (!vm.vicnode_form.description.$valid) {
                vm.description_invalid = true;
            }

            if (!vm.vicnode_form.data_migration_src.$valid) {
                vm.data_migration_src_invalid = true;
            }
            if (!vm.vicnode_form.data_migration_ast.$valid) {
                vm.data_migration_ast_invalid = true;
            }

            if (!vm.vicnode_form.access_method.$valid) {
                vm.access_method_invalid = true;
            }
            if (!vm.vicnode_form.prefer_access_method.$valid) {
                vm.prefer_access_method_invalid = true;
            }
            if (!vm.vicnode_form.data_formate.$valid) {
                vm.data_formate_invalid = true;
            }
            if (!vm.vicnode_form.only_copy.$valid) {
                vm.only_copy_invalid = true;
            }
            if (!vm.vicnode_form.can_regenerated.$valid) {

            } else {
                if (vm.project.requests[0].request_question_responses[7].question_response == null)
                    vm.project.requests[0].request_question_responses[7].question_response = '';
            }

            if (!vm.vicnode_form.loss_impact.$valid) {
                vm.loss_impact_invalid = true;
            }

            angular.forEach(vm.domains, function (each_domain, key) {
                var for_code_missed = false;
                var for_percentage_missed = false;

                sumfor += each_domain.percentage;

                if (each_domain.for_code != undefined && each_domain.for_code.id != 0 && each_domain.for_code.id != null) {
                    if (each_domain.percentage == undefined || each_domain.percentage == 0) {
                        for_percentage_missed = true;
                    }
                } else {
                    if (each_domain.percentage != 0 && each_domain.percentage != undefined) {
                        for_code_missed = true;
                    }
                }

                if (key == 0) {
                    vm.for_code0_invalid = for_code_missed;
                    vm.for_percentage0_invalid = for_percentage_missed;
                }
                if (key == 1) {
                    vm.for_code1_invalid = for_code_missed;
                    vm.for_percentage1_invalid = for_percentage_missed;
                }
                if (key == 2) {
                    vm.for_code2_invalid = for_code_missed;
                    vm.for_percentage2_invalid = for_percentage_missed;
                }
            });

            if (vm.for_code0_invalid || vm.for_code1_invalid || vm.for_code2_invalid) {
                vm.vicnode_form.$valid = false;
            } else {
                if (sumfor > 100) {
                    vm.sum_for_gt_100_invalid = true;
                    vm.for_percentage0_invalid = true;
                    vm.for_percentage1_invalid = true;
                    vm.for_percentage2_invalid = true;
                    vm.vicnode_form.$valid = false;
                }

                if (sumfor >= 0 && sumfor < 100) {
                    vm.sum_for_lt_100_invalid = true;
                    vm.for_percentage0_invalid = true;
                    vm.for_percentage1_invalid = true;
                    vm.for_percentage2_invalid = true;
                    vm.vicnode_form.$valid = false;
                }
            }


            //clean any existed domains
            vm.project.domains = [];
            //copy vm.domains to vm.alloc.project.domains
            angular.forEach(vm.domains, function (each_domain, key) {
                if (each_domain.for_code != undefined && each_domain.for_code.id != 0) {
                    vm.project.domains.push(each_domain);
                }
            });

            vm.vicnodeSpForm_sp_invalid = false;
            vm.vicnodeSpForm_sp_quota_invalid = false;
            vm.vicnodeSpForm_sp_current_size_invalid = false;

            if (vm.vicnode_form.vicnodeSpForm != undefined) {
                angular.forEach(vm.project.requests[0].storage_requests, function (each_storage_prod_req, key) {
                    if (each_storage_prod_req.storage_product.id == 0) {
                        vm.vicnodeSpForm_sp_invalid = true;
                    }

                    if (each_storage_prod_req.quota <= 0) {
                        vm.vicnodeSpForm_sp_quota_invalid = true;
                    }
                    if (each_storage_prod_req.storage_question_responses[0].question_response <= 0) {
                        vm.vicnodeSpForm_sp_current_size_invalid = true;
                    }
                });

                if (vm.vicnodeSpForm_sp_invalid || vm.vicnodeSpForm_sp_quota_invalid || vm.vicnodeSpForm_sp_current_size_invalid) {
                    vm.vicnode_form.$valid = false;
                }
            }

            return vm.vicnode_form.$valid;
        }

        function copyDomainsForCode() {
            //clean any for codes
            vm.domains = [];
            //copy to vm.project.domains to vm.domains
            angular.forEach(vm.project.domains, function (each_domain, key) {
                if (each_domain.for_code != undefined && each_domain.for_code.id != 0) {
                    var dom = {
                        "percentage": each_domain.percentage,
                        "for_code": {
                            "id": each_domain.for_code.id
                        }
                    };
                    vm.domains.push(dom);
                }
            });

            var d_lens = vm.domains.length;
            //console.log('domains lens: ' + d_lens);
            if (d_lens < 3) {
                for (var i = 0; i < (3 - d_lens); i++) {
                    var dom = {
                        "percentage": 0,
                        "for_code": {
                            "id": 0
                        }
                    };
                    vm.domains.push(dom);
                }
            }
        }

        function convertSpQuestionResponseToInt() {
            //copy to vm.project.domains to vm.domains
            angular.forEach(vm.project.requests[0].storage_requests, function (storage_request, key) {
                var question = storage_request.storage_question_responses[0].question;
                var question_response = storage_request.storage_question_responses[0].question_response;
                var key = question.key;
                if (key == 'vn_current_size') {
                    var current_size = parseInt(question_response)
                    storage_request.storage_question_responses[0].question_response = current_size;
                }
            });
        }

        function setRequestStartDateEndDate() {
            var current = new Date();
            var current_date_str = current.toISOString().substring(0, 10);
            var end_date = current;
            end_date.setMonth(end_date.getMonth() + 1);
            var end_date_str = end_date.toISOString().substring(0, 10);
            vm.project.requests[0].start_date = current_date_str;
            vm.project.requests[0].end_date = end_date_str;
        }

        //check duplicated FOR Code
        vm.checkFORDuplicate = function (scope, index) {
            var duplicated = false;
            vm.for_code0_duplicated = duplicated;
            vm.for_code1_duplicated = duplicated;
            vm.for_code2_duplicated = duplicated;

            var current_domain = vm.domains[index];
            angular.forEach(vm.domains, function (each_domain, key) {
                if (key != index) {
                    if (each_domain.for_code != undefined && each_domain.for_code.id != 0) {
                        if (each_domain.for_code.id == current_domain.for_code.id) {
                            duplicated = true;
                        }
                    }
                }
            });
            if (index == 0) {
                vm.for_code0_duplicated = duplicated;
            }
            if (index == 1) {
                vm.for_code1_duplicated = duplicated;
            }
            if (index == 2) {
                vm.for_code2_duplicated = duplicated;
            }
        };

        function loadFORCodes() {
            //Populate FORCodes
            LookupService.forCodes().then(function (response) {
                if (response.success) {
                    vm.for_codes = response.data;
                } else {
                    var msg = "Failed to load FOR codes, " + response.message;
                    FlashService.Error(msg);
                    console.error(msg);
                }
            });
        }

        function forCodePercentages() {
            return [
                {value: 0, "label": "0%"},
                {value: 10, "label": "10%"},
                {value: 20, "label": "20%"},
                {value: 30, "label": "30%"},
                {value: 40, "label": "40%"},
                {value: 50, "label": "50%"},
                {value: 60, "label": "60%"},
                {value: 70, "label": "70%"},
                {value: 80, "label": "80%"},
                {value: 90, "label": "90%"},
                {value: 100, "label": "100%"}
            ]
        }
    }

    function newEmptyStorageQuota() {
        return {
            "quota": 0,
            "approved_quota": 0,
            "storage_product": {
                "id": 0
            },
            "storage_question_responses": [
                {
                    "question_response": 0,
                    "question": {
                        "key": "vn_current_size"
                    }
                }
            ]
        }
    }

    function newEmptyDomains() {
        return [
            {
                "percentage": 100,
                "for_code": {
                    "id": 0
                }
            },
            {
                "percentage": 0,
                "for_code": {
                    "id": 0
                }
            },
            {
                "percentage": 0,
                "for_code": {
                    "id": 0
                }
            }
        ]
    }
})();