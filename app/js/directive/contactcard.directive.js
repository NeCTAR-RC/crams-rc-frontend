/**
 * @File Directive for contact cards display
 * @Author RJChow
 */


/**
 * @Desc Directive for displaying contact cards, takes two parameters: contact-email and read-only.
 *       All fields are greyed out when read-only is set to true
 *       Uses the contact service to look up contact by email address
 *       Organisation and phone number fields are not shown if they aren't returned by the API (currently they aren't)
 *
 * @Example <crams-contact contact-email="{{ vm.CI_email }}" read-only="true"></crams-contact>
 */
angular
    .module('crams.nectar')
    .directive('cramsContact', cramsContact);

function cramsContact() {
    return {
        restrict: 'E',
        templateUrl: 'templates/contactcard.html',
        controller: 'ContactCardController',
        controllerAs: 'vm',
        scope: {
            contactEmail: '@',
            readOnly: '@'
        },
        link:function(scope, elem, attrs, vm){
            scope.$watch('contactEmail', function(contactEmail){
                vm.retrieveContactByEmail(contactEmail);
            });
        }
    };
}