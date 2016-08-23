/*global $, MashupPlatform, MockMP, RosJointStatePublisher, beforeAll, afterAll, beforeEach*/
(function () {
    "use strict";

    describe("Test RosJointStatePublisher", function () {
        var widget;
        beforeAll(function () {
            window.MashupPlatform = new MockMP.MockMP();
        });

        beforeEach(function () {
        });

        it("Dummy test", function () {
            expect(true).toBeTruthy();
        });

    });
})();
