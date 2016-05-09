/**
 * @File Service that returns question definitions given a key. Currently using hardcoded questions.
 *       TODO: Enable database-driven question management by patching this through to the Django backend
 *             refer to http://zacstewart.com/2012/04/14/http-options-method.html and
 *                      http://www.django-rest-framework.org/topics/documenting-your-api/#self-describing-apis
 * @Author RJChow
 */

(function () {
    'use strict';
    angular.module('crams.nectar').factory('QuestionsService', QuestionsService);
    QuestionsService.$inject = ['$log'];
    function QuestionsService($log) {

        var service = {};
        service.getQuestion = getQuestion;
        service.makeResponse = makeResponse;


        /**
         * Given a key this function returns a question specification in the format of
         *  { "key": <key>,
         *    "question_prompt": <question_prompt>,
         *    "response_type": <response type, possible options are Boolean, Text, Number, Choice, Choices>,
         *
         *    // validation constraints
         *    "optional" : <true/false>,  this is for specifying if this question response can be blank
         *    "valid_length" (only for Text): <length of string in characters>
         *    "valid_range" (only for Number):  { min: <minimum number>, max: <maximum number> },
         *    "valid_choices" (only for Choices): [ <array of choices> ]}
         *
         * @param key
         */
        function getQuestion(key) {

            switch(key) {
                case "vn_authorization": return vn_authorization;
                case "vn_data_migration_src": return vn_data_migration_src;
                case "vn_data_migration_assistance": return vn_data_migration_assistance;
                case "vn_current_access_method": return vn_current_access_method;
                case "vn_preferred_access_method": return vn_preferred_access_method;
                case "vn_data_format": return vn_data_format;
                case "vn_only_copy": return vn_only_copy;
                case "vn_can_be_regenerated": return vn_can_be_regenerated;
                case "vn_loss_impact": return vn_loss_impact;
                default: return null;

            }

        }

        function makeResponse(questionDef) {
            return {
                "question_response": "",
                "question_valid": "",
                "question": { "key": questionDef.key, "optional": questionDef.optional }
            }
        }

        /**
         * Question Definitions below
         * (Kept them separate to getQuestion for clarity and formatting)
         * TODO: Patch through to Django backend when it fully supports looking up question types and validation constraints
         * Maximum lengths as defined by models.py in the backend
         */


        var vn_authorization = angular.fromJson(    {   "key": "vn_authorization",
                                            "question_prompt": "Please confirm that you have the authority to store this collection on VicNode infrastructure.",
                                              "response_type": "SelectedItem",
                                              "valid_choices": {1: "Yes", 2: "No"},
                                                   "optional": false});


        var vn_data_migration_src = angular.fromJson( { "key": "vn_data_migration_src",
                                            "question_prompt": "Where is the collection currently stored?",
                                              "response_type": "Text",
                                                   "optional": false,
                                               "valid_length": 1024});

        var vn_data_migration_assistance = angular.fromJson(
                                                     {  "key": "vn_data_migration_assistance",
                                            "question_prompt": "Do you require assistance to migrate your data?",
                                              "response_type": "SelectedItem",
                                              "valid_choices": {1: "Yes", 2: "No"},
                                                   "optional": false});

        var vn_current_access_method = angular.fromJson(
                                                      { "key": "vn_current_access_method",
                                            "question_prompt": "How do you or your users currently access your collection?",
                                              "response_type": "Text",
                                                   "optional": false,
                                               "valid_length": 1024});

        var vn_preferred_access_method = angular.fromJson(
                                                       {"key": "vn_preferred_access_method",
                                            "question_prompt": "What is your preferred access method?",
                                              "response_type": "Text",
                                                   "optional": false,
                                               "valid_length": 1024});

        var vn_data_format = angular.fromJson( {        "key": "vn_data_format",
                                            "question_prompt": "Identify the format(s) of the data to be stored on VicNode.",
                                              "response_type": "Text",
                                               "valid_length": 1024,
                                                   "optional": false});

        var vn_only_copy = angular.fromJson( {          "key": "vn_only_copy",
                                            "question_prompt": "Will VicNode be hosting the only copy of the collection?",
                                              "response_type": "SelectedItem",
                                              "valid_choices": {1: "Yes", 2: "No"},
                                                   "optional": false});

        var vn_can_be_regenerated = angular.fromJson( { "key": "vn_can_be_regenerated",
                                            "question_prompt": "If yes, how easily can the data be regenerated?",
                                              "response_type": "SelectedItem",
                                              "valid_choices": {1:"Fully Replaceable", 2:"Replaceable by equivalent data", 3:"Irreplaceable", 4:"Uncertain"},
                                                   "optional": true});

        var vn_loss_impact = angular.fromJson( {        "key": "vn_loss_impact",
                                            "question_prompt": "What would be the impact and/or cost incurred if data is lost?",
                                              "response_type": "Text",
                                               "valid_length": 1024,
                                                   "optional": false});


        return service;
    }

})();