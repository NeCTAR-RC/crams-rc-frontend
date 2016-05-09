/**
 * Created by RJ on 16/12/2015.
 */


/**
 * Directive declaration for crams-request-questions-responses
 */
angular
    .module('crams.nectar')
    .directive('cramsRequestQuestionsResponses', cramsRequestQuestionsResponses);

function cramsRequestQuestionsResponses() {
    return {
        scope: {parentCall: '&'},
        controller: 'RequestQuestionsResponsesController',
        controllerAs: 'vm',
        link: function (scope, elem, attrs, vm) {
            scope.parentCall()(vm);
        }
    };
}

/**
 * Controller definition for above
 */

(function () {
    'use strict';
    angular.module('crams.nectar').controller('RequestQuestionsResponsesController', RequestQuestionsResponsesController);
    RequestQuestionsResponsesController.$inject = ['$scope', '$log', 'ngDialog', 'ContactService', 'FlashService', 'QuestionsService', 'ProjectModelService'];

    function RequestQuestionsResponsesController($scope, $log, ngDialog, ContactService, FlashService, QuestionsService, ProjectModelService) {
        var vm = this;

        vm.allWidgets = [];
        vm.parentCtrl = {};


        vm.initialise = function (parentCtrl, requestQuestions) {
            //requestQuestions not used for now, will be used for populating fields when editing requests
            $log.debug("Request questions responses controller received initialisation call");
            vm.parentCtrl = parentCtrl;
        }

        vm.isValid = function() {
            var valid = true;
            // check all question widgets responses are valid
            angular.forEach(vm.allWidgets, function (aWidget, key) {
                if (!aWidget.validateQuestionReponse()) {
                    valid =  false;
                }
            })
            return valid;
        }

        vm.populateResponses = function populateResponse(request_question_response) {
            angular.forEach(request_question_response, function (qRes, key) {
                // get the widget using the question key
                var widget = getWidget(qRes.question.key);

                // populate widget controls value
                widget[0].question_response = qRes.question_response;
            })
        }

        // Gets a widget from allWidgets[] using question_key
        function getWidget(key) {
            var data = vm.allWidgets;

            return data.filter (
                function(data){return data.questionKey == key}
            );
        }

        vm.addWidget = function (widget) {
            vm.allWidgets.push(widget);
        }

        vm.getJSON = function () {
            var returnObj = [];
            angular.forEach(vm.allWidgets, function (aWidget, key) {
                returnObj.push(aWidget.toJSON())
            })
            return returnObj;
        }


    }
})();
