/**
 * @File Service keeps track of the question responses on a form
 * @Author RJChow
 */

(function () {
    'use strict';
    angular.module('crams.nectar').factory('ProjectQuestionResponsesService', ProjectQuestionResponsesService);
    ProjectQuestionResponsesService.$inject = ['$log'];
    function ProjectQuestionResponsesService($log) {

        var questionComponentList = [];

        var service = {};

        service.getJSON = getJSON;
        service.addQuestionComponent = addQuestionComponent;

        function addQuestionComponent(questionComponent) {
            questionComponentList.push(questionComponent);
        }

        function validateAll() {
            // iterate over all tracked question responses and generate JSON
            // return list of keys which fail validation
        }

        function getJSON() {
            // iterate over all tracked question responses and generate JSON
        }

        return service;

    }

})();