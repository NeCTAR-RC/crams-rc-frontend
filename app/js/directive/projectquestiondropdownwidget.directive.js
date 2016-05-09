/**
 * @File Directive for presenting project questions
 * @Author Melvin Luong
 * @Desc
 * note: requires cramsRequestQuestionsResponses above it to capture the response
 * @Example
 */
angular
    .module('crams.nectar')
    .directive('cramsQuestionDropdownWidget', cramsQuestionDropdownWidget);

function cramsQuestionDropdownWidget() {
    return {
        restrict: 'E',
        require: [ 'cramsQuestionDropdownWidget' , '^cramsRequestQuestionsResponses' ],
        templateUrl: 'templates/question_dropdown_widget.html',
        controller: 'QuestionDropdownWidgetController',
        controllerAs: 'vm',
        scope: { questionKey: '=' },
        link:function(scope, elem, attrs, controllers){
            var vm = controllers[0];
            var RequestQuestionsResponsesCtrl = controllers[1];
            vm.setParent(RequestQuestionsResponsesCtrl);
            vm.setQuestionKey(attrs.questionKey);

        }
    };
}

