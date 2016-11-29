/**
 * Created by simonyu on 23/08/15.
 */
(function () {
    'use strict';
    angular.module('crams.nectar').controller('NectarRequestController', NectarRequestController);

    NectarRequestController.$inject = ['$location', '$scope', '$routeParams', 'FlashService', 'NectarRequestService', 'LookupService', 'ContactService', 'CramsUtils', '$filter', '$anchorScroll'];
    function NectarRequestController($location, $scope, $routeParams, FlashService, NectarRequestService, LookupService, ContactService, CramsUtils, $filter, $anchorScroll) {
        var vm = this;
        vm.alloc = newEmptyAlloc();
        //create new domains for FOR codes
        vm.domains = newEmptyDomains();
        var project_id = $routeParams.project_id;
        var request_id = $routeParams.id;

        var request_paths = $location.path().split('/');
        var current_path = request_paths[1];
        vm.readyOnlyField = false;
        // set initail allocation json to empty
        vm.initial_alloc = {};
        if (project_id != undefined) {
            NectarRequestService.getProjectRequestById(request_id).then(function (response) {
                if (response.success) {
                    vm.alloc = response.data[0];
                    // deep copy allocation json data for a later comparision
                    vm.initial_alloc = angular.copy(response.data[0]);
                    // sort the question responses in form oder
                    var question_responses = CramsUtils.sortQuestionResponseInFormOrder(vm.alloc);
                    vm.alloc.project_question_responses = question_responses.project_question_responses;
                    vm.alloc.requests[0].request_question_responses = question_responses.request_question_responses;

                    //copy the domains for FOR_CODE.
                    //To populate the selection of for_codes after the request is loaded from the remote server.
                    copyDomainsForCode();
                    //convert the estimate users into number after the request is loaded
                    var estimated_users = vm.alloc.requests[0].request_question_responses[6].question_response;
                    vm.alloc.requests[0].request_question_responses[6].question_response = parseInt(estimated_users);
                    var req_status = vm.alloc.requests[0].request_status.code;
                    if (req_status == 'P' || req_status == 'X' || req_status == 'J') {
                        vm.readyOnlyField = true;
                    }
                } else {
                    var msg = "Failed to get NeCTAR allocation request, " + response.message;
                    FlashService.Error(msg);
                    console.error(msg);
                }
            });
        }

        //set end_date
        initEndDate();

        //load FOR Codes
        loadFORCodes();

        //FOR Code Percentages
        vm.for_percentages = forCodePercentages();

        //Populate durations lookup
        LookupService.durations().then(function (response) {
            if (response.success) {
                vm.durations = response.data;
            } else {
                var msg = "Failed to load duration, " + response.message;
                FlashService.Error(msg);
                console.error(msg);
            }
        });

        vm.project_trial_options = defaultProjTrialOptions();


        //Populate nectar storage product lookup
        LookupService.ncStorageProducts().then(function (response) {
            if (response.success) {
                vm.ncStorageProducts = response.data;
            } else {
                var msg = "Failed to load nectar storage product, " + response.message;
                FlashService.Error(msg);
                console.error(msg);
            }
        });

        //Populate AllocationHome
        LookupService.nectarAllocationHome().then(function (response) {
            if (response.success) {
                vm.alloc_homes = response.data;
                //vm.alloc.home = _.first(_.keys(response.data));
            } else {
                var msg = "Failed to load allocation home, " + response.message;
                FlashService.Error(msg);
                console.error(msg);
            }
        });

        //Populate GrantTypes
        LookupService.grantTypes().then(function (response) {
            if (response.success) {
                vm.grant_types = response.data;
            } else {
                var msg = "Failed to load grant types, " + response.message;
                FlashService.Error(msg);
                console.error(msg);
            }
        });

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

        // pre-fill the title
        vm.prefillTitle = function () {
            //preset title as description
            if (vm.alloc.description == null || vm.alloc.description == undefined) {
                vm.alloc.description = vm.alloc.project_ids[0].identifier;
            }
        }

        //DatePicker settings
        vm.date_options = {
            formatYear: 'yy',
            startingDay: 1,
            'show-weeks': false
        };

        //openCalendar method
        vm.openCalendar = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            vm.opened = true;
        };

        // closeCalendar method
        vm.closeCalendar = function () {
            vm.opened = false;
        };

        // core hours update method
        vm.updateCoreHours = function () {
            var start_date_str = $filter('date')(vm.alloc.requests[0].start_date, "yyyy-MM-dd");
            var duration = vm.alloc.requests[0].request_question_responses[0].question_response;
            var one_hour_time = 1000 * 60 * 60;
            var start_date = new Date(start_date_str);
            var end_date = new Date(start_date_str);
            end_date.setMonth(end_date.getMonth() + parseInt(duration));
            // set the end date
            vm.alloc.requests[0].end_date = end_date.toISOString().substring(0, 10);
            var hours_diff = Math.round((end_date.getTime() - start_date.getTime()) / one_hour_time);
            var num_of_cores = vm.alloc.requests[0].compute_requests[0].cores;
            var estimated_core_hours = Math.round(num_of_cores * hours_diff * 0.5);
            vm.alloc.requests[0].compute_requests[0].core_hours = estimated_core_hours;
            //copy the estimcated core hours as default approved core hours
            vm.alloc.requests[0].compute_requests[0].approved_core_hours = estimated_core_hours;
        };


        // add publication
        vm.addPublication = function ($event) {
            $event.preventDefault();
            vm.alloc.publications.push({"reference": ""});
        };

        // remove publication
        vm.removePublication = function (index) {
            vm.alloc.publications.splice(index, 1);

        };

        // rest publication invalid flag
        vm.resetPubInvalidFlag = function () {
            vm.pubForm_publication_invalid = false;
        };

        // add supported_institution
        vm.addInst = function ($event) {
            $event.preventDefault();
            vm.alloc.institutions.push({"institution": ""});
        };

        // remove supported_institution
        vm.removeInst = function (index) {
            vm.alloc.institutions.splice(index, 1);
        };

        // rest supported institution invalid flag
        vm.resetInstInvalidFlag = function () {
            vm.instForm_institution_invalid = false;
        };

        // add nectar storage product
        vm.addNcSpQutoa = function ($event) {
            $event.preventDefault();
            var storageQuota = newEmptyStorageQuota();
            vm.alloc.requests[0].storage_requests.push(storageQuota);
        };

        // remove research grant
        vm.removeNcSpQuota = function (index) {
            vm.alloc.requests[0].storage_requests.splice(index, 1);
        };

        //check storage product duplicate
        vm.checkNcSpDuplicate = function (scope, index) {
            var found_duplicated = false;
            var currentStorageRequest = vm.alloc.requests[0].storage_requests[index];
            angular.forEach(vm.alloc.requests[0].storage_requests, function (each_sp_req, key) {
                if (key != index) {
                    if (each_sp_req.storage_product.id == currentStorageRequest.storage_product.id) {
                        found_duplicated = true;
                    }
                }
            });
            scope.storageForm.nectar_sp.$setValidity('isdup', !found_duplicated);
        };

        // add research grant
        vm.addGrant = function ($event) {
            $event.preventDefault();
            var grantInfo = newEmptyGrantInfo();
            vm.alloc.grants.push(grantInfo);
        };

        // remove research grant
        vm.removeGrant = function (index) {
            vm.alloc.grants.splice(index, 1);
        };

        // reset grant invalid flag
        vm.resetGrantInvalidFlag = function () {
            vm.grantFrom_invalid = false;
        };

        // submitReq method
        vm.submitReq = function () {
            var validForm = validateForm();
            if (validForm) {
                // convert datepicker date object into string date in 'yyyy-MM-dd format.
                vm.alloc.requests[0].start_date = $filter('date')(vm.alloc.requests[0].start_date, "yyyy-MM-dd");
                //set title as description
                vm.alloc.title = vm.alloc.description;

                vm.alloc.requests[0].compute_requests[0].approved_instances = vm.alloc.requests[0].compute_requests[0].instances;
                vm.alloc.requests[0].compute_requests[0].approved_cores = vm.alloc.requests[0].compute_requests[0].cores;
                //copy the requested quota as a default approved quota
                angular.forEach(vm.alloc.requests[0].storage_requests, function (each_storage_req, key) {
                    //set the approved_quota as requested quota
                    each_storage_req.approved_quota = each_storage_req.quota;
                });

                if (project_id != undefined) {
                    //reformat estimated users json, then compare changes when updating
                    angular.forEach(vm.initial_alloc.requests[0].request_question_responses, function (q_resp, key) {
                        if (q_resp.question.key == 'estimatedusers') {
                            vm.initial_alloc.requests[0].request_question_responses[key].question_response =
                                parseInt(q_resp.question_response);
                        }
                    });
                    var no_changes = angular.equals(angular.toJson(vm.initial_alloc), angular.toJson(vm.alloc));
                    //if no changes, show no changes error to stop updating
                    if (no_changes) {
                        var msg = "No changes";
                        // scroll to top of the page
                        $anchorScroll();
                        FlashService.Error(msg);
                    } else {
                        NectarRequestService.updateProjectRequest(vm.alloc, project_id).then(function (response) {
                            if (response.success) {
                                FlashService.Success('Request updated', true);
                                $location.path('/' + current_path);
                            } else {
                                var msg = "Failed to update request, server error - " + response.message;
                                FlashService.Error(msg);
                                // scroll to top of the page
                                $anchorScroll();
                                console.error(msg);
                            }
                        });
                    }
                } else {
                    NectarRequestService.createProjectRequest(vm.alloc).then(function (response) {
                        if (response.success) {
                            FlashService.Success('Request created', true);
                            $location.path('/' + current_path);
                        } else {
                            var msg = "Failed to create request, server error - " + response.message;
                            FlashService.Error(msg);
                            // scroll to top of the page
                            $anchorScroll();
                            console.error(msg);
                        }
                    });
                }
            } else {
                var msg = "Please fix up the below errors";
                FlashService.Error(msg);
                // scroll to top of the page
                $anchorScroll();
            }
        };

        // subscribe the event to get the selected ci contact.
        $scope.$on('selected_project_ci', function (event, contact) {
            vm.updateProjectContact(contact);
        });

        vm.updateProjectContact = function (contact) {
            _.find(vm.alloc.project_contacts, function (p_contact, index) {
                // only check if it's chief investigator
                if (p_contact.contact_role.id == 2) {
                    vm.alloc.project_contacts[index].contact.id = contact.id;
                    vm.alloc.project_contacts[index].contact.title = contact.title;
                    vm.alloc.project_contacts[index].contact.given_name = contact.given_name;
                    vm.alloc.project_contacts[index].contact.surname = contact.surname;
                    vm.alloc.project_contacts[index].contact.email = contact.email;
                }
            });
        };

        // set the end_date when page loaded
        function initEndDate() {
            var start_date_str = $filter('date')(vm.alloc.requests[0].start_date, "yyyy-MM-dd");
            var duration = vm.alloc.requests[0].request_question_responses[0].question_response;
            var end_date = new Date(start_date_str);
            end_date.setMonth(end_date.getMonth() + parseInt(duration));
            vm.alloc.requests[0].end_date = end_date.toISOString().substring(0, 10);
        }

        function validateForm() {
            vm.project_ids_identifier_invalid = false;
            vm.project_ids_identifier_start_pt_invalid = false;
            vm.project_description_invalid = false;
            vm.estimated_duration_invalid = false;
            vm.convert_project_trial_invalid = false;
            vm.instances_invalid = false;
            vm.cores_invalid = false;
            vm.cores_less_invalid = false;
            vm.core_hours_invalid = false;
            vm.storageForm_sp_invalid = false;
            vm.storageForm_sp_quota_invalid = false;
            vm.use_case_invalid = false;
            vm.allocation_home_invalid = false;
            vm.estimated_users_invalid = false;
            vm.chief_investigator_invalid = false;
            vm.instForm_institution_invalid = false;

            vm.pubForm_publication_invalid = false;

            vm.grantFrom_invalid = false;

            if (!vm.request_form.project_identifier.$valid) {
                vm.project_ids_identifier_invalid = true;
                vm.request_form.$valid = false;
            }

            if (vm.alloc.project_ids[0].identifier != null && vm.alloc.project_ids[0].identifier.toLowerCase().startsWith('pt-')) {
                vm.project_ids_identifier_start_pt_invalid = true;
                vm.request_form.$valid = false;
            }

            if (!vm.request_form.project_description.$valid) {
                vm.project_description_invalid = true;
            }

            if (!vm.request_form.estimated_duration.$valid) {
                vm.estimated_duration_invalid = true;
            }

            if (!vm.request_form.convert_project_trial.$valid) {
                vm.convert_project_trial_invalid = true;
            }

            if (!vm.request_form.instances.$valid) {
                vm.instances_invalid = true;
            }

            if (!vm.request_form.cores.$valid) {
                vm.cores_invalid = true;
            } else {
                var cores = vm.alloc.requests[0].compute_requests[0].cores;
                var ins = vm.alloc.requests[0].compute_requests[0].instances;
                // cores can not be less than instances.
                if (cores < ins) {
                    vm.cores_less_invalid = true;
                }
            }

            if (!vm.request_form.core_hours.$valid) {
                vm.core_hours_invalid = true;
            }

            angular.forEach(vm.alloc.requests[0].storage_requests, function (each_storage_prod_req, key) {
                if (each_storage_prod_req.storage_product.id == 0) {
                    vm.storageForm_sp_invalid = true;
                }
                if (each_storage_prod_req.quota < 1) {
                    vm.storageForm_sp_quota_invalid = true;
                }
            });

            if (vm.storageForm_sp_invalid || vm.storageForm_sp_quota_invalid) {
                vm.request_form.$valid = false;
            }

            if (vm.request_form.pubForm != undefined) {
                if (!vm.request_form.pubForm.reference.$valid) {
                    vm.pubForm_publication_invalid = true;
                }
            }

            if (vm.request_form.instForm != undefined) {
                if (!vm.request_form.instForm.institution.$valid) {
                    vm.instForm_institution_invalid = true;
                }
            }

            if (vm.request_form.grantForm != undefined) {
                if (!vm.request_form.grantForm.funding_body_and_scheme.$valid) {
                    vm.grantFrom_invalid = true;
                }
                if (!vm.request_form.grantForm.start_year.$valid) {
                    vm.grantFrom_invalid = true;
                }
                angular.forEach(vm.alloc.requests[0].grants, function (each_grant, key) {
                    if (each_grant.grant_type.id == 0) {
                        vm.grantFrom_invalid = true;
                    }
                });
            }

            angular.forEach(vm.alloc.project_contacts, function (p_contact, index) {
                if (p_contact.contact.email == undefined || p_contact.contact.email == null) {
                    vm.chief_investigator_invalid = true;
                    vm.request_form.$valid = false;
                }
            });

            if (!vm.request_form.use_case.$valid) {
                vm.use_case_invalid = true;
            }

            if (!vm.request_form.allocation_home.$valid) {
                vm.allocation_home_invalid = true;
            }

            if (!vm.request_form.estimated_users.$valid) {
                vm.estimated_users_invalid = true;
            }

            var sumfor = 0;
            vm.sum_for_gt_100_invalid = false;
            vm.sum_for_lt_100_invalid = false;

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
                vm.request_form.$valid = false;
            } else {
                if (sumfor > 100) {
                    vm.sum_for_gt_100_invalid = true;
                    vm.for_percentage0_invalid = true;
                    vm.for_percentage1_invalid = true;
                    vm.for_percentage2_invalid = true;
                    vm.request_form.$valid = false;
                }

                if (sumfor >= 0 && sumfor < 100) {
                    vm.sum_for_lt_100_invalid = true;
                    vm.for_percentage0_invalid = true;
                    vm.for_percentage1_invalid = true;
                    vm.for_percentage2_invalid = true;
                    vm.request_form.$valid = false;
                }
            }


            //clean any existed domains
            vm.alloc.domains = [];
            //copy vm.domains to vm.alloc.project.domains
            angular.forEach(vm.domains, function (each_domain, key) {
                if (each_domain.for_code != undefined && each_domain.for_code.id != 0 && each_domain.for_code.id != null) {
                    vm.alloc.domains.push(each_domain);
                }
            });

            return vm.request_form.$valid;
        }

        //check duplicated FOR Code
        vm.checkFORDuplicate = function (scope, index) {
            var duplicated = false;
            var current_domain = vm.domains[index];
            angular.forEach(vm.domains, function (each_domain, key) {
                if (key != index) {
                    if (each_domain.for_code != undefined && each_domain.for_code.id != 0 && each_domain.for_code.id != null) {
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

        function copyDomainsForCode() {
            //clean any for codes
            vm.domains = [];
            //copy to vm.alloc.domains to vm.domains
            angular.forEach(vm.alloc.domains, function (each_domain, key) {
                if (each_domain.for_code != undefined && each_domain.for_code.id != 0 && each_domain.for_code.id != null) {
                    var dom = {
                        "percentage": each_domain.percentage,
                        "for_code": {
                            "id": each_domain.for_code.id
                        }
                    };
                    vm.domains.push(dom);
                }
            });
            //simplify the FOR code domains
            vm.initial_alloc.domains = angular.copy(vm.domains);

            var d_lens = vm.domains.length;
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
    }

    function defaultProjTrialOptions() {
        return [
            {value: "False", "label": "No, start with a blank project."},
            {value: "True", "label": "Yes, move resources from my pt- project to this new project."}
        ]
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


    function newEmptyGrantInfo() {
        return {
            "grant_type": {
                "id": 1
            },
            "funding_body_and_scheme": null,
            "grant_id": null,
            "start_year": null,
            "total_funding": 0.0
        }
    }

    function newEmptyStorageQuota() {
        return {
            "quota": 1,
            "approved_quota": 1,
            "storage_product": {
                "id": 0
            }
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

    function newEmptyAlloc() {

        return {
            "title": null,
            "description": null,
            "notes": null,
            "project_question_responses": [
                {
                    "question_response": "",
                    "question": {
                        "key": "additionalresearchers"
                    }
                },
                {
                    "question_response": "",
                    "question": {
                        "key": "nectarvls"
                    }
                },
                {
                    "question_response": "",
                    "question": {
                        "key": "ncris"
                    }
                }
            ],
            "institutions": [
                {
                    "institution": null
                }
            ],
            "publications": [],
            "grants": [],
            "project_ids": [
                {
                    "identifier": null,
                    "system": {
                        "id": 1
                    }
                }
            ],
            "project_contacts": [
                {
                    "contact": {
                        "id": 0
                    },
                    "contact_role": {
                        "id": 2
                    }
                }
            ],
            "domains": [],
            "requests": [
                {
                    "compute_requests": [
                        {
                            "instances": 2,
                            "approved_instances": 2,
                            "cores": 2,
                            "approved_cores": 2,
                            "core_hours": 744,
                            "approved_core_hours": 744,
                            "compute_product": {
                                "id": 1
                            }
                        }
                    ],
                    "storage_requests": [],
                    "request_question_responses": [
                        {
                            "question_response": "1",
                            "question": {
                                "key": "duration"
                            }
                        },
                        {
                            "question_response": "False",
                            "question": {
                                "key": "ptconversion"
                            }
                        },
                        {
                            "question_response": "",
                            "question": {
                                "key": "researchcase"
                            }
                        },
                        {
                            "question_response": "",
                            "question": {
                                "key": "usagepattern"
                            }
                        },
                        {
                            "question_response": "",
                            "question": {
                                "key": "homenode"
                            }
                        },
                        {
                            "question_response": "",
                            "question": {
                                "key": "homerequirements"
                            }
                        },
                        {
                            "question_response": 1,
                            "question": {
                                "key": "estimatedusers"
                            }
                        }
                    ],
                    "request_status": {
                        "id": 1
                    },
                    "funding_scheme": {
                        "id": 1
                    },
                    "start_date": new Date(),
                    "end_date": new Date(),
                    "created_by": {
                        "id": 2
                    },
                    "updated_by": {
                        "id": 2
                    },
                    "approval_notes": "",
                    "parent_request": null
                }
            ]
        }
    }
})();