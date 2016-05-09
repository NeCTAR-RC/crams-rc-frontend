/**
 * Created by simonyu on 23/08/15.
 */
(function () {
    'use strict';
    angular.module('crams.nectar').controller('ReportController', ReportController);

    ReportController.$inject = ['$scope'];
    function ReportController($scope) {
        $scope.message = 'Reports Page';
    }
})();