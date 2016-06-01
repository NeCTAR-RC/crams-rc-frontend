/**
 * Created by simonyu on 11/05/16.
 */

(function () {
    'use strict';
    angular.module('crams.nectar').factory('VnQuestionsService', VnQuestionsService);
    VnQuestionsService.$inject = ['$log'];
    function VnQuestionsService($log) {
        var service = {};
        service.getQuestion = getQuestion;

        function getQuestion(question_key) {
            return _.findWhere(vn_questions, {'key': question_key});
        }

        var vn_questions = angular.fromJson(
            [
                {
                    "key": "vn_authorization",
                    "question": "Please confirm that you have the authority to store this collection on VicNode infrastructure.",
                    "choices": {1: "Yes", 2: "No"}
                },
                {
                    "key": "vn_data_migration_src",
                    "question": "Where is the collection currently stored?"
                },
                {
                    "key": "vn_data_migration_assistance",
                    "question": "Do you require assistance to migrate your data?",
                    "choices": {1: "Yes", 2: "No"}
                },
                {
                    "key": "vn_current_access_method",
                    "question": "How do you or your users currently access your collection?"
                },
                {
                    "key": "vn_preferred_access_method",
                    "question": "What is your preferred access method?"
                },
                {
                    "key": "vn_data_format",
                    "question": "Identify the format(s) of the data to be stored on VicNode."
                },
                {
                    "key": "vn_only_copy",
                    "question": "Will VicNode be hosting the only copy of the collection?",
                    "choices": {1: "Yes", 2: "No"}
                },
                {
                    "key": "vn_can_be_regenerated",
                    "question": "If yes, how easily can the data be regenerated?",
                    "choices": {
                        1: "Fully Replaceable",
                        2: "Replaceable by equivalent data",
                        3: "Irreplaceable",
                        4: "Uncertain"
                    }
                },
                {
                    "key": "vn_loss_impact",
                    "question": "What would be the impact and/or cost incurred if data is lost?"
                }
            ]
        );

        return service;
    }
})();