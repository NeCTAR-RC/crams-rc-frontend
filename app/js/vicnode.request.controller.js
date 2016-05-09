/**
 * @File Controller for VicNode request form, handles the view in vicnode_request.html
 * @Author RJChow
 */

(function () {
    'use strict';
    angular.module('crams.nectar').controller('VicnodeRequestController', VicnodeRequestController);
    VicnodeRequestController.$inject = ['$location', '$scope', '$log', '$routeParams', 'ngDialog',
        'ContactService', 'FlashService', 'QuestionsService', 'LookupService', 'ProjectModelService',
        'VicnodeRequestService'];


    function VicnodeRequestController($location, $scope, $log, $routeParams, ngDialog, ContactService, FlashService,
                                      QuestionsService, LookupService, ProjectModelService, VicnodeRequestService) {
        var vm = this;

        var request_paths = $location.path().split('/');
        var current_path = request_paths[1];

        var project_id = $routeParams.project_id;
        var request_id = $routeParams.id;

        vm.projectModel = ProjectModelService.getVicNodeTemplate();
        vm.requestModel = ProjectModelService.getVicNodeRequests();

        /*
         * In event of an edit, populate above models
         */

        // populate form when project_id is available
        if (project_id) {
            VicnodeRequestService.getProjectRequestById(request_id).then(function (response) {
                // he populate the models
                vm.projectModel = response.data[0];
                vm.requestModel = response.data[0].requests[0];
                vm.technical_contact = response.data[0].project_contacts[0];
                vm.storage_requests = response.data[0].requests[0].storage_requests;

                // populate the domains forcode
                copyDomainsForCode();

                // populate the question responses
                vm.requestQuestionController.populateResponses(
                    response.data[0].requests[0].request_question_responses);
            });
        }

        /*  Project Fields for VicNode request are:
         *
         *  project.title (text)
         *  project.description (text)
         *  project.domains (FOR codes)
         *  project.project_contacts (set technical contact)
         *
         *  project.notes = (null)
         *  project.project_question_responses = [] (empty array)
         *  project.institutions = []  (empty array)
         *  project.publications = []  (empty array)
         *  project.grants = []  (empty array)
         *  project.project_ids (template)
         */

        vm.projectFieldsController = {};

        vm.technical_contact = ContactService.makeNewTechnicalContact();

        // listener for new contact, refer to contactsearchformcontroller.js for why this is here
        // needs to be refactored to use standard widget interface
        $scope.$on('contact-form-return', function (event, newContact) {
            vm.setContact(newContact);
        });

        vm.setContact = function (newContact) {
            //console.log("Received new contact selection, setting contact to: " + JSON.stringify(newContact));
            vm.technical_contact.contact.id = newContact.id;
            vm.technical_contact.contact.email = newContact.email;

            vm.projectModel.project_contacts[0] = vm.technical_contact;
        };

        /*
         * To make refactoring for future changes easier, project and request specific details will be split here
         * Request stuff goes below.
         */


        /*
         *  VicNode request controller takes care of:
         *   1 x Project    <handled by project fields controller>
         *   1 x Request    <handled by this controller>
         *       - {0} x Compute Requests
         *       - {1..*} x Storage Requests  <handled by VicnodeStorageRequestController>
         *       - {fixed} x RequestQuestions  <handled by RequestQuestionsResponsesController>
         */

        vm.computeRequestController = {};  // as per above this remains empty
        vm.storageRequestController = {};
        vm.requestQuestionController = {};

        vm.setStorageRequestController = function (controller) {
            vm.storageRequestController = controller;
            $log.debug("Registering Vicnode Storage Request Form as child of Vicnode Request Controller")
            vm.storageRequestController.initialise(this, vm.storageRequests)
        }

        vm.setRequestQuestionController = function (controller) {
            vm.requestQuestionController = controller;
            vm.requestQuestionController.initialise(this, vm.requestQuestions)
        }


        /*
         *  Request fields
         *
         *   request_status (template)
         *   funding_scheme (id=10,11,12,13)
         *   start_date (select)
         *   end_date   (select)
         *   created_by  (server side)
         *   updated_by  (server side)
         *   approval_notes ("")
         *   parent_request (null)
         */

        vm.transmitRequestSubmission = function () {
            //alert(JSON.stringify(vm.projectModel));

            if (validateForm()) {
                if (project_id) {
                    //console.log("Updating existing vicnode request");
                    VicnodeRequestService.updateProjectRequest(vm.projectModel, project_id).then(function (response) {
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
                    //console.log("Creating new vicnode request");
                    // send request
                    VicnodeRequestService.createProjectRequest(vm.projectModel).then(function (response) {
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
                console.log("Validation Errors check invalid fields.");
            }
        }

        vm.fetchRequestResponses = function () {
            vm.requestModel.request_question_responses = vm.requestQuestionController.getJSON();
        }

        vm.fetchStorageRequests = function () {
            $log.debug("fetching storage requests");
            vm.requestModel.storage_requests = vm.storageRequestController.getJSON();
        }

        vm.attachRequestModel = function () {
            // clear the projectModel requests so they don't double up if going through a resubmission
            vm.projectModel.requests.length = 0;
            vm.projectModel.requests.push(vm.requestModel);
        }

        function validateForm() {
            var valid = true;
            var question_responses = vm.requestModel.request_question_responses;

            /**
             *  validate Techincal Contact
             */
            if (!vm.technical_contact.contact.id) {
                //console.log("Validation error: no technical contact");
                vm.contact_invalid = true;
                valid = false;
            } else {
                vm.contact_invalid = false;
            }

            /**
             *  validate Project Title and Description
             */
            if (!vm.projectModel.title) {
                //console.log("Validation error: no project title");
                vm.project_title_invalid = true;
                valid = false;
            } else {
                vm.project_title_invalid = false;
            }

            if (!vm.projectModel.description) {
                //console.log("Validation error: no project description");
                vm.project_description_invalid = true;
                valid = false;
            } else {
                vm.project_description_invalid = false;
            }

            /**
             *  validate Storage Requests
             */
            if (!vm.storageRequestController.isValid()) {
                valid = false;
            }

            /**
             *  validate request questions
             */
            if (!vm.requestQuestionController.isValid()) {
                valid = false;
            }

            /**
             *  validate FOR
             *  TODO: validation logic is copied from the nectar request controller need to move this into a FOR Domain controller
             */
            var sumfor = 0;
            vm.sum_for_gt_100_invalid = false;
            vm.sum_for_lt_100_invalid = false;
            angular.forEach(vm.domains, function (each_domain, key) {
                var for_code_missed = false;
                var for_percentage_missed = false;

                sumfor += each_domain.percentage;

                if (each_domain.for_code != undefined && each_domain.for_code.id != 0) {
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
                //console.log("Validation error: no for code selected")
                valid = false;
            } else {
                if (sumfor > 100) {
                    vm.sum_for_gt_100_invalid = true;
                    vm.for_percentage0_invalid = true;
                    vm.for_percentage1_invalid = true;
                    vm.for_percentage2_invalid = true;
                    valid = false;
                }

                if (sumfor >= 0 && sumfor < 100) {
                    vm.sum_for_lt_100_invalid = true;
                    vm.for_percentage0_invalid = true;
                    vm.for_percentage1_invalid = true;
                    vm.for_percentage2_invalid = true;
                    valid = false;
                }
            }

            return valid;
        }

        /*
         *  Before a form can be submitted, ensure:
         *   1. Vicnode Project Form Controller is OK
         *   2. This controller is OK
         *   3. Vicnode Storage Request Controller is OK
         *   4. Requests Questions Responses Controller is OK
         *
         *    -> Attach storage requests to requestModel  (vm.fetchRequestResponses)
         *    -> Attach request responses to requestModel  (vm.fetchStorageRequests)
         *    -> Attach requestModel to projectModel  (vm.attachRequestModel)
         *
         *   projectModel ready for transmission  (vm.transmitRequestSubmission)
         *
         */
        vm.submitForm = function () {
            $log.debug("Submit Form button clicked")


            vm.setForCodes(); // this should be handled by project form controller
            vm.projectModel.project_ids[0].identifier = vm.projectModel.title; // same as nectar (?)

            vm.fetchRequestResponses();
            vm.fetchStorageRequests();
            vm.attachRequestModel();

            $log.debug(vm.projectModel);
            vm.transmitRequestSubmission();
        }

        // FOR Code widget
        // Below copy-pasted from nectar-request. Should be refactored out to FORCode service/widget or something

        function copyDomainsForCode() {
            //clean any for codes
            vm.domains = [];
            //copy to vm.projectModel.domains to vm.domains
            angular.forEach(vm.projectModel.domains, function (each_domain, key) {
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
            //console.log('domains: ' + JSON.stringify(vm.domains));
        }

        vm.setForCodes = function () {
            // clear the vm.alloc.project.domains so they don't double up if going through a resubmission
            vm.projectModel.domains.length = 0;

            //copy vm.domains to vm.alloc.project.domains
            angular.forEach(vm.domains, function (each_domain, key) {
                if (each_domain.for_code != undefined && each_domain.for_code.id != 0) {
                    vm.projectModel.domains.push(each_domain);
                }
            });
        }

        vm.domains = newEmptyDomains();
        loadFORCodes();
        vm.for_percentages = forCodePercentages();

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


        vm.checkFORDuplicate = function (scope, index) {
            var duplicated = false;
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

})();
