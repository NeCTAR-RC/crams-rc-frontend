/**
 * Created by simonyu on 1/09/15.
 * Updated by Rafi M Feroze on 2/09/15
 */

(function () {
    'use strict';
    angular.module('crams.nectar').factory('LookupService', LookupService);
    LookupService.$inject = ['$http', 'ENV'];
    function LookupService($http, ENV) {

        var service = {};
        service.nectarAllocationHome = nectarAllocationHome;
        service.durations = loadDurations;
        service.grantTypes = loadGrantTypes;
        service.ncStorageProducts = loadNectarSps;
        service.vnStorageProducts = loadVicnodeSps;
        service.contacts = loadContacts;
        service.forCodes = loadFORCodes;
        service.fundingBody = loadFundingBody;

        return service;

        // Allocation Home
        function nectarAllocationHome() {
            return fetchLookup('alloc_home');
        }

        function loadDurations() {
            return fetchLookup('durations');
        }

        function loadGrantTypes() {
            return fetchLookup('grant_types');
        }

        function loadNectarSps() {
            return fetchLookup('nectar_sps');
        }

        function loadVicnodeSps() {
            return fetchLookup('vicnode_sps');
        }

        function loadContacts() {
            return fetchLookup('contacts')
        }

        function loadFORCodes() {
            return fetchLookup('for_codes')
        }

        function loadFundingBody() {
            return fetchLookup('user_funding_body/')
        }

        //private functions
        function fetchLookup(apiPath) {
            var lookup_url = ENV.apiEndpoint + apiPath;
            return $http.get(lookup_url).then(handleSuccess, handleError);
        }

        function handleSuccess(response) {
            return {
                success: true,
                data: response.data
            };
        }

        function handleError(response) {
            return {
                success: false,
                message: (response.status + " " + response.statusText)
            };
        }
    }

})();