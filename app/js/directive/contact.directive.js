/**
 * Created by simonyu on 20/04/16.
 */
(function () {
    'use strict';

    angular.module('crams.nectar').directive('projectContact', projectContact);
    projectContact.$inject = ['ContactService'];
    function projectContact(ContactService) {
        return {
            restrict: 'E',
            transclude: true,
            replace: true,
            scope: true,
            terminal: true,
            templateUrl: 'templates/project_contact.html',
            controller: 'ContactController',
            controllerAs: 'vm'
        }
    }
})();