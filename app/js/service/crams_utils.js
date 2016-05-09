/**
 * Created by simonyu on 2/02/16.
 */

(function () {
    'use strict';
    angular.module('crams.nectar').factory('CramsUtils', CramsUtils);
    CramsUtils.$inject = [];
    function CramsUtils() {

        var service = {};
        service.sortQuestionResponseInFormOrder = sortQuestionResponseInFormOrder;

        return service;

        // sort question response in form order
        function sortQuestionResponseInFormOrder(alloc) {
            var question_responses = {};
            var sorted_project_question_responses = [];
            var project_question_response_list = alloc.project_question_responses;
            var proj_question_keys = ['additionalresearchers', 'nectarvls', 'ncris'];
            _.each(proj_question_keys, function(key){
                var proj_question_response = find_question_response(project_question_response_list, key);
                if(proj_question_response != undefined){
                    sorted_project_question_responses.push(proj_question_response);
                }
            });

            question_responses['project_question_responses'] = sorted_project_question_responses;

            var sorted_req_question_responses = [];
            var req_question_response_list = alloc.requests[0].request_question_responses;
            var req_question_keys = ['duration', 'ptconversion','researchcase','usagepattern', 'homenode', 'homerequirements', 'estimatedusers'];
            _.each(req_question_keys, function(key){
                var req_question_response = find_question_response(req_question_response_list, key);
                if(req_question_response != undefined){
                    sorted_req_question_responses.push(req_question_response);
                }
            });
            question_responses['request_question_responses'] = sorted_req_question_responses;
            return question_responses;
        }

        function find_question_response(question_response_list, key) {
            var found_question_resp = _.find(question_response_list, function (question_resp) {
                var question_key = question_resp.question.key;
                if (question_key == key) {
                    return question_resp;
                }
            });
            return found_question_resp;
        }
    }
})();