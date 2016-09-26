/**
 * @File Controller for contact
 */

(function () {
    'use strict';
    angular.module('crams.nectar').controller('ContactController', ContactController);
    ContactController.$inject = ['$scope', 'ContactService'];

    function ContactController($scope, ContactService) {
        var vm = this;

        // flag popup is opened or not
        vm.contact_popup_opened = false;

        // search contact field
        vm.search_contact = '';

        // show new contact form flag
        vm.show_new_contact = false;

        // new contact form errors
        vm.contact_form_errors = {};

        // add or change contact popup button action
        vm.addOrChangeContact = function () {
            vm.contact_popup_opened = !vm.contact_popup_opened;
            // reset the following default value
            vm.search_contact = '';
            vm.found_contacts = [];
            vm.contact_searched = false;
            vm.contact = {};
            vm.show_new_contact = false;
        };

        // call find project contacts rest api
        vm.findProjectContacts = function () {
            //only searching contact after input more than 3 chars
            if (vm.search_contact != '' && vm.search_contact.length >= 3) {
                ContactService.findContact(vm.search_contact).then(function (response) {
                    if (response.success) {
                        vm.found_contacts = response.data;
                    } else {
                        var msg = "Failed to find a contact, " + response.message;
                        console.error(msg);
                    }
                });
                vm.contact_searched = true;
            } else {
                vm.found_contacts = [];
                vm.contact_searched = false;
            }
        };

        vm.updateContact = function (contact) {
            $scope.$emit('selected_project_ci', contact);
            vm.addOrChangeContact();
        };

        vm.newContactForm = function () {
            vm.show_new_contact = !vm.show_new_contact;
            vm.contact = {};
        };

        vm.newContact = function (contact) {
            //clear previous errors if any
            vm.contact_form_errors = {};
            ContactService.createContact(contact).then(function (response) {
                if (response.success) {
                    vm.updateContact(response.data);
                } else {
                    for (var errorField in response.data) {
                        // raise a form error for every field error in the response
                        vm.raiseFieldError(errorField, response.data[errorField].toString());
                    }
                }
            });
        };

        vm.raiseFieldError = function (fieldName, errorMessage) {
            console.log("Error in " + fieldName + ": " + errorMessage);
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
        };
    }
})();

