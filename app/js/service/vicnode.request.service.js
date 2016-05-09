(function () {
    'use strict';
    angular.module('crams.nectar').factory('VicnodeRequestService', VicnodeRequestService);
    VicnodeRequestService.$inject = ['$http', 'ENV'];
    function VicnodeRequestService($http, ENV) {

        var crams_project_api_url = ENV.apiEndpoint + "project/";

        var service = {};
        service.createProjectRequest = createProjectRequest;
        service.updateProjectRequest = updateProjectRequest;
        service.getProjectRequestById = getProjectRequestById;


        function createProjectRequest(allocation_request) {
            return $http({
                    url: crams_project_api_url,
                    method: 'POST',
                    data: allocation_request
                }
            ).then(handleSuccess, handleError);
        }

        function updateProjectRequest(allocation_request, project_id) {
            var update_request_url = crams_project_api_url + project_id + "/";
            console.log('--- update url : ' + update_request_url);
            return $http({
                    url: update_request_url,
                    method: 'PUT',
                    data: allocation_request
                }
            ).then(handleSuccess, handleError);
        }

        function getProjectRequestById(request_id) {
            return $http.get(crams_project_api_url + "?request_id=" + request_id).then(handleSuccess, handleError);
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

        return service;
    }

})();