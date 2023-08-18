let tape = require("tape");

let protobuf = require("..");

tape.test("codegen", function(test) {
    test.equal(protobuf.util.codegen.verbose, false, "should not be verbose by default");
    test.end();
});
