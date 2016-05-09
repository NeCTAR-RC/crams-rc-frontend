/**
 * Created by simonyu on 9/02/16.
 */
(function () {
    'use strict';
    angular.module('crams.nectar').controller('ErrorController', ErrorController);

    ErrorController.$inject = ['$scope'];
    function ErrorController($scope) {
        $scope.message = 'Error Page';
    }
})();

