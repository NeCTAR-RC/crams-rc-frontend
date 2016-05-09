/**
 * @File Controller for contact search form, handles the view in contactsearch_form.html
 * @Author RJChow
 */

(function () {
    'use strict';
    angular.module('crams.nectar').controller('ContactSearchFormController', ContactSearchFormController);
    ContactSearchFormController.$inject = ['$scope', '$log', 'ngDialog', 'ContactService', 'FlashService'];


    function ContactSearchFormController($scope, $log, ngDialog, ContactService, FlashService) {
        var vm = this;

        const SHOW_NUMBER_OF_RESULTS = 5;

        /**
         * Flag for displaying create contact fields
         */
        vm.showingCreateContactDialog = false;

        /**
         * vm object for capturing the dialog handler
         */

        vm.dialogHandler = {};

        /**
         * vm field that stores errors in an associative array
         * e.g vm.contact_form_errors['too_many_results_status'] = true,
         *     vm.contact_form_errors['too_many_results_message'] = "Address already exists in database"
         */
        vm.contact_form_errors = {};


        /**
         * Generates the dialog for selecting one of the search results
         * @param searchResultArray This parameter should be an array which contains an array of contacts minmally in the format of
         *                          { id: numeric id,
         *                            email: string containing email address,
         *                            given_name: string containing given name,
         *                            surname: string containing surname }
         */
        vm.openSearchResultsDialog = function (searchResultArray) {
            vm.hideCreateContactDialog();
            vm.dialogHandler = ngDialog.open({
                template: 'templates/contactsearch_form.html',
                className: 'ngdialog-theme-default',
                scope: $scope,
                data: searchResultArray
            });
        }


        vm.showCreateContactDialog = function() {
            vm.showingCreateContactDialog = true;
        }

        vm.hideCreateContactDialog = function() {
            vm.showingCreateContactDialog = false;
        }



        /**
         * Returns selected contact back to caller
         * Currently achieved by $scope.$emit('contact-form-return', newContact)
         * @param newContact Refer to createNewContact()'s documentation for schema
         */
        vm.setContact = function (newContact) {
            $log.debug("Setting contact to: " + JSON.stringify(newContact));
            /*
             * TODO: would like to use a service for managing state of current request, but for now using $scope.emit to pass results back to NectarRequestController - RJ
             * read http://ilikekillnerds.com/2014/11/angularjs-call-controller-another-controller/
             */

            $scope.$emit('contact-form-return', newContact);
        };

        /**
         * Sends off a request to ContactService which calls the REST endpoint
         * @param contactSearchString Partial string for matching against - sends it direct through to the API endpoint
         */
        vm.searchForContact = function (contactSearchString) {
            vm.contact_form_errors = {} // clear errors
            ContactService.findContact(contactSearchString).then(function (response) {
                if (response.success) {
                    if (response.data.length > SHOW_NUMBER_OF_RESULTS) { vm.raiseFormError('too_many_results', 'Your search criteria returned too many results, please be more specific.') }
                    else { vm.openSearchResultsDialog(response.data); }
                } else {
                    $log.error("searchForContact failed with: " + response.message);
                    FlashService.Error("Failed to search for contact: " + response.message);
                }
            });

        }

        /**
         * This function sets the respective form fields to errors-states with their error messages
         * @param fieldName Possible values are 'too_many_results'.
         * @param errorMessage A descriptive error message that will show up in red below the field
         *
         * Note: broke this out into its own function so that it can be called by client-side validation functions,
         *       though currently only using server-side validation
         */
        vm.raiseFormError = function (fieldName, errorMessage) {
            $log.debug("Error in " + fieldName + ": " + errorMessage);

            switch (fieldName) {
                <!-- error handling for too many results case -->
                case "too_many_results":
                    vm.contact_form_errors['too_many_results_status'] = true;
                    vm.contact_form_errors['too_many_results_message'] = errorMessage;
                    break;

            }

        }


    }


})();
