(function () {
    'use strict';
    angular.module('crams.nectar').controller('NavController', NavController);

    NavController.$inject = ['$rootScope', '$scope', '$location'];
    function NavController($rootScope, $scope, $location) {
        $rootScope.nav = {};
        $scope.isCurrentPath = function (path) {
            var current_paths = $location.path().split('/');
            var path_lens = current_paths.length;
            if (path_lens == 2) {
                $rootScope.nav = {
                    has_first_level: true,
                    first_path: current_paths[1],
                    first_level_title: findNavTitle(current_paths[1]),
                    has_second_level: false,
                    second_path: "",
                    second_level_title: ""
                };
                if (current_paths[1] == '') {
                    $rootScope.nav.has_first_level = false;
                }
            }
            if (path_lens >= 3) {
                var second_path = "";
                for (var i = 2; i < path_lens; i++) {
                    second_path += current_paths[i] + "/";
                }
                $rootScope.nav = {
                    has_first_level: true,
                    first_path: current_paths[1],
                    first_level_title: findNavTitle(current_paths[1]),
                    has_second_level: true,
                    second_path: second_path,
                    second_level_title: findNavTitle(current_paths[2])
                };
            }
            return '/' + current_paths[1] == path;
        };

        function findNavTitle(path) {
            return findTitleByPath(path);
        }

        function findTitleByPath(path) {
            var nav_bar_titles = {
                "allocations": "My Allocations",
                "nectar_request": "New Nectar Request",
                "edit_request": "Edit Request",
                "view_request": "View Request",
                "contact_us": "Contact Us",
                "approval": "Approval",
                "approve_request": "Approve Request",
                "decline_request": "Decline Request",
                "history": "History",
                "reports": "Reports",
                "settings": "Settings",
                "terms_condtions": "Terms and Conditions",
                "login": "Login",
                "show_error": "Action Error"
            };
            return nav_bar_titles[path];
        }
    }
})();