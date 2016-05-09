/**
 * Created by simonyu on 23/08/15.
 */
(function () {
    'use strict';
    angular.module('crams.nectar').controller('SettingsController', SettingsController);

    SettingsController.$inject = ['$scope'];
    function SettingsController($scope) {
        $scope.message = 'Settings Page';
    }

})();