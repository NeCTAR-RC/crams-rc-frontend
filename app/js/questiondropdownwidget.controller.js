/**
 * @File Controller for Project Question Dropdown Widget
 * @Author Melvin Luong
 */

(function () {
    'use strict';
    angular.module('crams.nectar').controller('QuestionDropdownWidgetController', QuestionDropdownWidgetController);
    QuestionDropdownWidgetController.$inject = ['$scope', '$log', 'QuestionsService'];


    function QuestionDropdownWidgetController($scope, $log, QuestionsService) {
        var vm = this;

        vm.parentCtrl = "";
        vm.questionKey = "";
        vm.questionModel = "";
        vm.questionResponseModel = "";

        // validate question
        vm.validateQuestionReponse = function validateQuestionReponse() {
            var optional = vm.questionModel.optional;
            var isValid = true;
            vm.question_invalid = false; // display error message

            // response can not be empty
            if (optional == false) {
                if (!vm.questionResponseModel.question_response) {
                    isValid = false;
                    vm.question_invalid = true;
                    console.log("Validation error on " + vm.questionKey)
                }
            }
            return isValid;
        }

        vm.setParent = function setParent(parentCtrl) {
            vm.parentCtrl = parentCtrl;
        }

        vm.setQuestionKey = function setQuestionKey(questionKey) {
            vm.questionKey = questionKey;
            vm.questionModel = QuestionsService.getQuestion(vm.questionKey);
            vm.questionResponseModel = QuestionsService.makeResponse(vm.questionModel);
            vm.parentCtrl.addWidget(this);
        }

        vm.setQuestionResponse = function setQuestionReseponse(questionResponse) {
            $log.debug("ngBlur setting response to: " + questionResponse);
            vm.questionResponseModel.question_response = questionResponse;
        }

        vm.toJSON = function toJSON() {
            return vm.questionResponseModel;
        }

    }

})();