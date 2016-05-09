/**
 * Created by simonyu on 23/08/15.
 */
(function () {
    'use strict';
    angular.module('crams.nectar').controller('ContactUsController', ContactUsController);

    ContactUsController.$inject = ['$scope'];
    function ContactUsController($scope) {
        $scope.message = 'Contact us!';
    }

})();