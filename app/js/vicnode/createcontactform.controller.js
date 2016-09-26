/**
 * @File Controller for create contact form, handles the view in createcontact_form.html
 * @Author RJChow
 */

(function () {
    'use strict';
    angular.module('crams.nectar').controller('CreateContactFormController', CreateContactFormController);
    CreateContactFormController.$inject = ['$scope', '$log', 'ngDialog', 'ContactService'];


    function CreateContactFormController($scope, $log, ngDialog, ContactService) {
        var vm = this;


        /**
         * vm field that stores new contact details
         */
        vm.contact = {};

        /**
         * vm object for capturing the dialog handler
         */

        //vm.dialogHandler = {};

        /**
         * vm field that stores errors in an associative array
         * e.g vm.contact_form_errors['email_status'] = true,
         *     vm.contact_form_errors['email_message'] = "Address already exists in database"
         */
        vm.contact_form_errors = {};


        /**
         * Informs the controller about the dialog - this is used for closing dialogs that haven't been opened by this controller
         * @param dialogHandle An ngDialog returned dialog handle
         */
        vm.setDialogHandler = function (dialogHandle) {
            // $log.debug("Setting dialog handle to: " + dialogHandle);
            vm.dialogHandler = dialogHandle;
        }

        /**
         * Pops up create new contact form using createcontact_form.html
         */
        vm.showNewContactDialog = function () {
            vm.setDialogHandler(ngDialog.open({
                template: 'templates/vicnode/createcontact_form.html',
                className: 'ngdialog-theme-default',
                scope: $scope,
            }));
        }

        /**
         * Sends a request to the REST service to create a new contact
         * @param newContact A valid contact profile in the format of
         *                   { title: string prefixing the person's name. e.g: 'Mr.' or 'Ms.',
         *                     given_name: string with user's given name. e.g: 'John',
         *                     surname: string with user's surname. e.g: 'Doe',
         *                     email: string with valid email address. Server will error if address already exists,
         *                     phone: string with user's phone number,
         *                     organisation: string with user's organisation, e.g: 'Monash University' }
         */
        vm.createNewContact = function (newContact) {
            vm.contact_form_errors = {} // clear errors from previous attempts if any

            ContactService.createContact(newContact).then(function (response) {
                if (response.success) {
                    // $log.debug("Success - " + JSON.stringify({data: response.data}));
                    vm.setContact(response.data);
                    vm.dialogHandler.close();
                } else {
                    // $log.debug("Failure, server error - " + JSON.stringify(response.message));

                    for (var errorField in response.data) { // raise a form error for every field error in the response
                        vm.raiseFormError(errorField, response.data[errorField].toString());
                    }

                }
            });
        };

        /**
         * Returns selected contact back to caller
         * Currently achieved by $scope.$emit('contact-form-return', newContact)
         * @param newContact Refer to createNewContact()'s documentation for schema
         */
        vm.setContact = function (newContact) {
            // $log.debug("Setting contact to: " + JSON.stringify(newContact));
            /*
             * TODO: would like to use a service for managing state of current request, but for now using $scope.emit to pass results back to NectarRequestController - RJ
             * read http://ilikekillnerds.com/2014/11/angularjs-call-controller-another-controller/
             */

            $scope.$emit('contact-form-return', newContact);
        };

        /**
         * This function sets the respective form fields to errors-states with their error messages
         * @param fieldName Possible values are 'title', 'organisation', 'given_name', 'email', 'surname', 'phone' and 'too_many_results'.
         * @param errorMessage A descriptive error message that will show up in red below the field
         *
         * Note: broke this out into its own function so that it can be called by client-side validation functions,
         *       though currently only using server-side validation
         */
        vm.raiseFormError = function (fieldName, errorMessage) {
            // $log.debug("Error in " + fieldName + ": " + errorMessage);

            switch (fieldName) {
                case "title":
                    vm.contact_form_errors['title_status'] = true;
                    vm.contact_form_errors['title_message'] = errorMessage;
                    break;
                case "organisation":
                    vm.contact_form_errors['organisation_status'] = true;
                    vm.contact_form_errors['organisation_message'] = errorMessage;
                    break;
                case "given_name":
                    vm.contact_form_errors['given_name_status'] = true;
                    vm.contact_form_errors['given_name_message'] = errorMessage;
                    break;
                case "email":
                    vm.contact_form_errors['email_status'] = true;
                    vm.contact_form_errors['email_message'] = errorMessage;
                    break;
                case "surname":
                    vm.contact_form_errors['surname_status'] = true;
                    vm.contact_form_errors['surname_message'] = errorMessage;
                    break;
                case "phone":
                    vm.contact_form_errors['phone_status'] = true;
                    vm.contact_form_errors['phone_message'] = errorMessage;
                    break;

            }

        }

        /*  End of create contact functions */

    }

})();
