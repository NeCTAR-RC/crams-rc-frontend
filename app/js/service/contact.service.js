/**
 * Created by simonyu on 12/10/15.
 */
/**
 * Created by simonyu on 31/08/15.
 */
(function () {
    'use strict';
    angular.module('crams.nectar').factory('ContactService', ContactService);
    ContactService.$inject = ['$http', 'ENV'];
    function ContactService($http, ENV) {


        var service = {};
        service.createContact = createContact;
        service.findContact = findContact;
        service.makeNewChiefInvestigator = makeNewChiefInvestigator;
        service.makeNewTechnicalContact = makeNewTechnicalContact;

        return service;

        function createContact(contact) {
            var crams_api_url = ENV.apiEndpoint + "contact/";

            return $http({
                    url: crams_api_url,
                    method: 'POST',
                    data: contact
                }
            ).then(handleSuccess, handleError);
        }

        function findContact(searchString) {
            var crams_api_url = ENV.apiEndpoint + "searchcontact/";

            return $http({
                url: crams_api_url,
                method: 'GET',
                params: {search: searchString}
            }).then(handleSuccess, handleError);
        }

        function makeNewChiefInvestigator() {
            var newContact = {};
            newContact.contact = makeNewContactTemplate();
            newContact.contact_role = {"id": 2}

            return newContact;
        }

        function makeNewTechnicalContact() {
            var newContact = {};
            newContact.contact = makeNewContactTemplate();
            newContact.contact_role = {"id": 3}

            return newContact;
        }

        function makeNewContactTemplate() {
            return {
                "title": null,
                "given_name": null,
                "surname": null,
                "email": null,
                "phone": null,
                "organisation": null
            }
        }


        //private functions
        function handleSuccess(response) {
            return {
                success: true,
                data: response.data
            };
        }

        function handleError(response) {
            return {
                success: false,
                message: (response.status + " " + response.statusText),
                data: response.data
            };
        }
    }

})();