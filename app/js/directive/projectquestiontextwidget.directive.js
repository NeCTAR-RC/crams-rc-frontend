/**
 * @File Directive for presenting project questions
 * @Author RJChow
 * @Desc
 * note: requires cramsRequestQuestionsResponses above it to capture the response
 * @Example
 */
angular
    .module('crams.nectar')
    .directive('cramsQuestionTextWidget', cramsQuestionTextWidget);

function cramsQuestionTextWidget() {
    return {
        restrict: 'E',
        require: [ 'cramsQuestionTextWidget' , '^cramsRequestQuestionsResponses' ],
        templateUrl: 'templates/questiontextwidget.html',
        controller: 'QuestionTextWidgetController',
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

