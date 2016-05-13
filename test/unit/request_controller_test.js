/**
 * Created by simonyu on 24/08/15.
 */
describe("Test RequestController", function () {
    var $location, $scope, $routeParams, requestCtrl;
    var $filter, FlashService, NectarRequestService,  LookupService, ContactService, CramsUtils;
    beforeEach(module("crams.nectar"));

    beforeEach(inject(function (_$location_, _$routeParams_, _FlashService_, _NectarRequestService_, _LookupService_, _ContactService_, _CramsUtils_, $rootScope, _$filter_, _$controller_) {
        FlashService = _FlashService_;
        NectarRequestService = _NectarRequestService_;
        LookupService = _LookupService_;
        ContactService = _ContactService_;
        CramsUtils = _CramsUtils_;
        $filter = _$filter_;
        $location = _$location_;
        $routeParams = _$routeParams_;

        $scope = $rootScope.$new();
        requestCtrl = _$controller_("NectarRequestController", {
            '$location': $location,
            '$scope': $scope,
            '$routeParams':$routeParams,
            'FlashService': FlashService,
            'NectarRequestService': NectarRequestService,
            'LookupService': LookupService,
            'ContactService': ContactService,
            'CramsUtils': CramsUtils,
            '$filter': $filter
        });
    }));

    it("should be define", function () {
        expect(requestCtrl).toBeDefined();
    });

    it("code value should be setup", function () {
        expect(requestCtrl.alloc.requests[0].compute_requests[0].instances).toBe(2);
    })
});