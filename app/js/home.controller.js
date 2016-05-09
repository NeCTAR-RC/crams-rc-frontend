/**
 * Created by simonyu on 23/08/15.
 */
(function () {
    'use strict';
    angular.module('crams.nectar').controller('HomeController', HomeController);

    HomeController.$inject = ['$scope'];
    function HomeController($scope) {
        $scope.message = 'Welcome to Home Page!';
    }

})();

