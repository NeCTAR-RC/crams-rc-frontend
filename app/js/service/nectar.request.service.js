/**
 * Created by simonyu on 31/08/15.
 * Updated by Rafi M Feroze
 */
(function () {
    'use strict';
    angular.module('crams.nectar').factory('NectarRequestService', NectarRequestService);
    NectarRequestService.$inject = ['$http', 'ENV'];
    function NectarRequestService($http, ENV) {

        var nectar_api_url = ENV.apiEndpoint + "project/";

        var list_my_allocations_url = ENV.apiEndpoint + "project/";

        var request_details_base_url = ENV.apiEndpoint + "project/";

        var list_approval_url = ENV.apiEndpoint + "approve_list";

        var approval_counter_url = ENV.apiEndpoint + "alloc_counter";

        var allocations_history_base_url = ENV.apiEndpoint + "request_history/";

        var approve_request_path_str = "approve_request";
        var decline_request_path_str = "decline_request";
        var buildDetailAPIUrl = function (pathStr, recordId) {
            return ENV.apiEndpoint + pathStr + "/" + recordId + '/';
        };

        var service = {};

        service.listMyAllocations = listMyAllocations;
        service.listAllocationHistory = listAllocationHistory;
        service.getProjectRequestById = getProjectRequestById;
        service.createProjectRequest = createProjectRequest;
        service.updateProjectRequest = updateProjectRequest;
        service.listApproval = listApproval;
        service.ApprovalCounter = ApprovalCounter;
        service.getPartialRequestByIdForApprove = getPartialRequestByIdForApprove;
        service.approveRequest = approveRequest;
        service.getPartialRequestByIdForDecline = getPartialRequestByIdForDecline;
        service.declineRequest = declineRequest;

        return service;

        function listMyAllocations() {
            return $http.get(list_my_allocations_url).then(handleSuccess, handleError);
        }

        function getProjectRequestById(request_id) {
            return $http.get(request_details_base_url + "?request_id=" + request_id).then(handleSuccess, handleError);
        }

        function listAllocationHistory(request_id) {
            return $http.get(allocations_history_base_url + "?request_id=" + request_id).then(handleSuccess, handleError);
        }

        function createProjectRequest(allocation_request) {
            return $http({
                    url: nectar_api_url,
                    method: 'POST',
                    data: allocation_request
                }
            ).then(handleSuccess, handleError);
        }

        function updateProjectRequest(allocation_request, project_id) {
            var update_request_url = nectar_api_url + project_id + "/";
            console.log('--- update url : ' + update_request_url);
            return $http({
                    url: update_request_url,
                    method: 'PUT',
                    data: allocation_request
                }
            ).then(handleSuccess, handleError);
        }

        function listApproval(funding_body_id, request_status) {
            var request_url = list_approval_url;
            if (funding_body_id != -1) {
                request_url = list_approval_url + "?funding_body_id=" + funding_body_id;
                if (request_status != null || request_status != undefined) {
                    request_url = request_url + "&req_status=" + request_status
                }
            } else {
                if (request_status != null || request_status != undefined){
                    request_url = request_url + "?req_status=" + request_status
                }
            }
            return $http.get(request_url).then(handleSuccess, handleError);
        }

        function ApprovalCounter(funding_body_id, request_status) {
            var request_url = approval_counter_url;
            if (funding_body_id != -1) {
                request_url = approval_counter_url + "?funding_body_id=" + funding_body_id;
                if (request_status != null || request_status != undefined) {
                    request_url = request_url + "&req_status=" + request_status
                }
            } else {
                if (request_status != null || request_status != undefined){
                    request_url = request_url + "?req_status=" + request_status
                }
            }
            return $http.get(request_url).then(handleSuccess, handleError);
        }

        /** Approve Request service methods  **/
        function getPartialRequestByIdForApprove(request_id) {
            return $http.get(buildDetailAPIUrl(approve_request_path_str, request_id)).then(handleSuccess, handleError);
        }

        function approveRequest(allocation_request_partial, request_id) {
            return $http({
                    url: buildDetailAPIUrl(approve_request_path_str, request_id),
                    method: 'PUT',
                    data: allocation_request_partial
                }
            ).then(handleSuccess, handleError);
        }

        /** Decline Request service methods  **/
        function getPartialRequestByIdForDecline(request_id) {
            return $http.get(buildDetailAPIUrl(decline_request_path_str, request_id)).then(handleSuccess, handleError);
        }

        function declineRequest(allocation_request_partial, request_id) {
            return $http({
                    url: buildDetailAPIUrl(decline_request_path_str, request_id),
                    method: 'PUT',
                    data: allocation_request_partial
                }
            ).then(handleSuccess, handleError);
        }


        function handleSuccess(response) {
            return {
                success: true,
                data: response.data
            };
        }

        function handleError(response) {
            var msg = response.status + " " + response.statusText;
            if ((response.status == 400)  && (response.data)) {
                msg = JSON.stringify(response.data);
            }
            return {
                success: false,
                message: msg
            };
        }
    }

})();