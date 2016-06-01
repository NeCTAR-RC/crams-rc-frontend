/**
 * Created by simonyu on 19/10/15.
 */
(function () {
    'use strict';
    angular.module('crams.nectar').controller('NCAllocController', NCAllocController);

    NCAllocController.$inject = ['FlashService', 'NectarRequestService', 'LookupService', '$scope', '$filter'];
    function NCAllocController(FlashService, NectarRequestService, LookupService, $scope, $filter) {
        var vm = this;
        //get nectar allocation requests
        //todo: need to link a logged in user
        vm.test = 'simon testing';
        getNectarRequests();
        function getNectarRequests() {
            //Populate Contacts
            NectarRequestService.listMyAllocations().then(function (response) {
                if (response.success) {
                    vm.nc_projects = response.data;
                } else {
                    var msg = "Failed to get NeCTAR allocation request, " + response.message;
                    FlashService.Error(msg);
                    console.error(msg);
                }
            });
        }

        vm.dummyprojects = function () {
            return [
                {
                    "id": 13703,
                    "title": "crams testing for 6 months",
                    "description": "crams testing for 6 months",
                    "notes": null,
                    "project_question_responses": [
                        {
                            "id": 9708,
                            "question_response": "Tom",
                            "question": {
                                "key": "additionalresearchers",
                                "question": "Additional Researchers"
                            }
                        },
                        {
                            "id": 9709,
                            "question_response": "nectar supporting",
                            "question": {
                                "key": "nectarvls",
                                "question": "List any NeCTAR virtual Laboratories supporting this request"
                            }
                        },
                        {
                            "id": 9710,
                            "question_response": "ncris supporting",
                            "question": {
                                "key": "ncris",
                                "question": "List NCRIS capabilities supporting this request"
                            }
                        }
                    ],
                    "institutions": [
                        {
                            "id": 320,
                            "institution": "Monash"
                        }
                    ],
                    "publications": [
                        {
                            "id": 176,
                            "reference": "pub1"
                        }
                    ],
                    "grants": [
                        {
                            "id": 76,
                            "grant_type": {
                                "id": 1,
                                "description": "ARC"
                            },
                            "funding_body_and_scheme": "arc testing funding",
                            "grant_id": "arc-test-0001",
                            "start_year": 2015,
                            "total_funding": 20
                        }
                    ],
                    "project_ids": [
                        {
                            "id": 15840,
                            "identifier": "crams_test_by_simon200",
                            "system": {
                                "system": "NeCTAR",
                                "id": 1
                            }
                        },
                        {
                            "id": 15841,
                            "identifier": "9afa1d4c92d242a2b5e1a9afb04eae91",
                            "system": {
                                "system": "NeCTAR_UUID",
                                "id": 4
                            }
                        }
                    ],
                    "project_contacts": [
                        {
                            "id": 5122,
                            "contact": {
                                "email": "xiaoming.yu@monash.edu",
                                "id": 372
                            },
                            "contact_role": {
                                "name": "Chief Investigator",
                                "id": 2
                            }
                        },
                        {
                            "id": 5123,
                            "contact": {
                                "email": "xiaoming.yu@monash.edu",
                                "id": 372
                            },
                            "contact_role": {
                                "name": "Applicant",
                                "id": 1
                            }
                        }
                    ],
                    "provision_details": [
                        {
                            "id": 4128,
                            "status": "X",
                            "message": null,
                            "provider": {
                                "id": 9,
                                "name": "NeCTAR",
                                "active": true
                            }
                        }
                    ],
                    "domains": [
                        {
                            "id": 8194,
                            "percentage": 100,
                            "for_code": {
                                "description": "Mathematical Sciences",
                                "id": 1,
                                "code": "01"
                            }
                        }
                    ],
                    "requests": [
                        {
                            "id": 4761,
                            "project": 13703,
                            "compute_requests": [
                                {
                                    "id": 4761,
                                    "instances": 5,
                                    "approved_instances": 5,
                                    "cores": 5,
                                    "approved_cores": 5,
                                    "core_hours": 10978,
                                    "approved_core_hours": 10978,
                                    "compute_product": {
                                        "name": "NeCTAR Compute",
                                        "id": 1
                                    },
                                    "compute_question_responses": [],
                                    "provision_details": {
                                        "id": 4129,
                                        "status": "X",
                                        "message": null,
                                        "provider": {
                                            "id": 9,
                                            "name": "NeCTAR",
                                            "active": true
                                        }
                                    }
                                }
                            ],
                            "storage_requests": [
                                {
                                    "id": 5513,
                                    "quota": 13,
                                    "approved_quota": 13,
                                    "storage_product": {
                                        "id": 3,
                                        "name": "Volume (Monash)",
                                        "storage_type": {
                                            "id": 1,
                                            "storage_type": "Volume"
                                        },
                                        "zone": {
                                            "id": 3,
                                            "name": "monash"
                                        }
                                    },
                                    "storage_question_responses": [],
                                    "provision_details": {
                                        "id": 4130,
                                        "status": "X",
                                        "message": null,
                                        "provider": {
                                            "id": 9,
                                            "name": "NeCTAR",
                                            "active": true
                                        }
                                    }
                                },
                                {
                                    "id": 5514,
                                    "quota": 20,
                                    "approved_quota": 20,
                                    "storage_product": {
                                        "id": 10,
                                        "name": "Object (NeCTAR)",
                                        "storage_type": {
                                            "id": 2,
                                            "storage_type": "Object"
                                        },
                                        "zone": {
                                            "id": 9,
                                            "name": "nectar"
                                        }
                                    },
                                    "storage_question_responses": [],
                                    "provision_details": {
                                        "id": 4131,
                                        "status": "X",
                                        "message": null,
                                        "provider": {
                                            "id": 9,
                                            "name": "NeCTAR",
                                            "active": true
                                        }
                                    }
                                },
                                {
                                    "id": 5515,
                                    "quota": 15,
                                    "approved_quota": 15,
                                    "storage_product": {
                                        "id": 2,
                                        "name": "Volume (UoM)",
                                        "storage_type": {
                                            "id": 1,
                                            "storage_type": "Volume"
                                        },
                                        "zone": {
                                            "id": 2,
                                            "name": "melbourne"
                                        }
                                    },
                                    "storage_question_responses": [],
                                    "provision_details": {
                                        "id": 4132,
                                        "status": "X",
                                        "message": null,
                                        "provider": {
                                            "id": 9,
                                            "name": "NeCTAR",
                                            "active": true
                                        }
                                    }
                                }
                            ],
                            "request_question_responses": [
                                {
                                    "id": 38074,
                                    "question_response": "6",
                                    "question": {
                                        "key": "duration",
                                        "question": "Estimated duration"
                                    }
                                },
                                {
                                    "id": 38075,
                                    "question_response": "False",
                                    "question": {
                                        "key": "ptconversion",
                                        "question": "Convert project trial"
                                    }
                                },
                                {
                                    "id": 38076,
                                    "question_response": "simon crams testing use case",
                                    "question": {
                                        "key": "researchcase",
                                        "question": "Research use case"
                                    }
                                },
                                {
                                    "id": 38077,
                                    "question_response": "simon crams testing patterns",
                                    "question": {
                                        "key": "usagepattern",
                                        "question": "Instance, object storage and volume storage usage patterns"
                                    }
                                },
                                {
                                    "id": 38078,
                                    "question_response": "monash",
                                    "question": {
                                        "key": "homenode",
                                        "question": "Allocation home"
                                    }
                                },
                                {
                                    "id": 38079,
                                    "question_response": "monash node",
                                    "question": {
                                        "key": "homerequirements",
                                        "question": "Additional location requirements"
                                    }
                                },
                                {
                                    "id": 38080,
                                    "question_response": "20",
                                    "question": {
                                        "key": "estimatedusers",
                                        "question": "Estimated number of users"
                                    }
                                }
                            ],
                            "request_status": {
                                "id": 4,
                                "status": "Provisioned",
                                "code": "P"
                            },
                            "funding_scheme": {
                                "id": 1,
                                "funding_scheme": "NeCTAR National Merit"
                            },
                            "created_by": {
                                "email": "xiaoming.yu@monash.edu",
                                "last_name": null,
                                "id": 1231,
                                "first_name": null
                            },
                            "updated_by": {
                                "email": "nectar@crams.org",
                                "last_name": "",
                                "id": 1232,
                                "first_name": ""
                            },
                            "creation_ts": "2016-04-14T02:35:07.979794Z",
                            "last_modified_ts": "2016-04-14T02:35:07.979855Z",
                            "start_date": "2016-04-13",
                            "end_date": "2016-10-12",
                            "approval_notes": null,
                            "parent_request": null
                        }
                    ]
                }
            ]

        }
    }
})();
