/**
 * @File Service that maintains a model for projects
 * @Author RJChow
 */

(function () {
    'use strict';
    angular.module('crams.nectar').factory('ProjectModelService', ProjectModelService);
    ProjectModelService.$inject = ['$log', 'ENV'];
    function ProjectModelService($log, ENV) {

        var service = {};

        service.getVicNodeTemplate = getVicNodeTemplate;
        service.getVicNodeRequests = getVicNodeRequests;
        return service;

        function getVicNodeRequests() {
            return {
                    "compute_requests": [],
                    "storage_requests": [],
                    "request_question_responses": [],
                    "request_status": {
                        "id": 1
                    },
                    "funding_scheme": {
                        "id": 13
                    },
                    "start_date": "2016-01-01",
                    "end_date": "2017-01-01",
                    "created_by": {
                        "id": 2
                    },
                    "updated_by": {
                        "id": 2
                    },
                    "approval_notes": "",
                    "parent_request": null
                }

        }

        function getVicNodeTemplate() {
            /* TODO: patch this through to backend to fetch OPTION on REST endpoint.
             * Backend currently does not support
             * this so template is provided as a string here. */

            return {
                "title": "",
                "description": "",
                "project_question_responses": [],
                "institutions": [],
                "publications": [],
                "grants": [],
                "project_ids": [
                    {
                        "identifier": "",
                        "system": {
                            "id": 2
                        }
                    }
                ],
                "project_contacts": [],
                "domains": [],
                "requests": []
            }
        }

    }

})();