/**
 * @File Controller for contact card - for displaying contact details, handles the view in contactcard.html
 * @Author RJChow
 */

(function () {
    'use strict';
    angular.module('crams.nectar').controller('ContactCardController', ContactCardController);
    ContactCardController.$inject = ['$scope', '$log', 'ContactService'];

    function ContactCardController($scope, $log, ContactService) {
        var vm = this;

        vm.displayed_contact = {};
        vm.displayed_contact.displayedname = '';
        vm.displayed_contact.emailaddress = '';
        vm.displayed_contact.phonenumber = '';
        vm.displayed_contact.organisation = '';

        /**
         * Calls ContactService which calls the REST API to retrieve a user by contact email. Does nothing if not exactly one result is returned (undefined behaviour)
         * @param contactEmail String containing contact's email address
         */
        vm.retrieveContactByEmail = function (contactEmail) {
            // $log.debug("Retrieving contact by email: " + contactEmail);
            // $log.debug("Read only: " + $scope.readOnly);
            ContactService.findContact(contactEmail).then(function (response) {
                if (response.success) {
                    if (response.data.length == 1) {
                        $log.debug("Contact found, populating with: " + JSON.stringify(response.data));
                        vm.populateContactCardFields(response.data[0]);
                    }
                    else {
                        //do nothing; show empty field and log error
                        if (response.data.length == 0) {
                            $log.error("Contact card unable to be filled because more than one user by that email was found. Database inconsistent!")
                        }
                        else {
                            $log.debug("Contact card unable to be filled because no user by that email was found.")
                        }
                    }


                } else {
                    $log.error("retrieveContactByEmail failed with: " + response.message);
                }

            });
        }

        /**
         * Populates the fields in contactcard.html.
         * @param contactDetails Takes a contact profile in the format of e.g
         *                      { title: "Mr.",
         *                        given_name: "John",
         *                        surname: "Doe",
         *                        email: "text@example.org",
         *                        phone [optional]: "+61 0 1234 5678",
         *                        organisation [optional]: "Monash University"}
         *
         */
        vm.populateContactCardFields = function (contactDetails) {
            // replace null value with empty string
            function showEmptyString(obj) {
                if (obj == null) {
                    return "";
                } else {
                    return obj;
                }
            }

            vm.displayed_contact.displayedname = showEmptyString(contactDetails.title) + " " + showEmptyString(contactDetails.given_name) + " " + showEmptyString(contactDetails.surname);
            vm.displayed_contact.emailaddress = contactDetails.email;
            vm.displayed_contact.phonenumber = contactDetails.phone;
            vm.displayed_contact.organisation = contactDetails.organisation;
        }
    }
})();

