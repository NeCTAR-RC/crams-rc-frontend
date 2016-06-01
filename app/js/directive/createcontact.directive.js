/**
 * @File Directive for creating contacts
 * @Author RJChow
 */


/**
 * @Desc Directive for displaying form to create new contacts. Takes one optional parameter, parent-dialog
 *       CreateContactFormController drives the logic behind this directive and it exposes a vm.setContact(newContact)
 *       method which (currently) emits an event on global scope that a new contact has been selected by the user.
 *
 * @Example <crams-create-contact-form parent-dialog="vm.dialogHandler"></crams-create-contact-form>
 */
angular
    .module('crams.nectar')
    .directive('cramsCreateContactForm', cramsCreateContactForm);

function cramsCreateContactForm() {
    return {
        restrict: 'E',
        templateUrl: 'templates/createcontact_form.html',
        controller: 'CreateContactFormController',
        controllerAs: 'vm',
        scope: {
            parentDialog: '=',
        },
        link: function (scope, elem, attrs, vm) {
            scope.$watch('parentDialog', function (parentDialog) {
                vm.setDialogHandler(parentDialog);
            });
        }
    };
}