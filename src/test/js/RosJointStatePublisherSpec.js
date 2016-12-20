/* global MashupPlatform, MockMP, beforeAll, afterAll, beforeEach*/
(function () {
    "use strict";

    describe("Test RosJointStatePublisher", function () {
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
