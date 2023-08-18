let tape = require("tape");

let protobuf = require("..");

tape.test("empty messages", function(test) {
    let root = new protobuf.Root().addJSON({
        "Test": {
            fields: {}
        }
    });

    let Test = root.lookup("Test");

    let buf = Test.encodeDelimited({}).finish();

    test.equal(buf.length, 1, "should encodeDelimited to a buffer of length 1");
    test.equal(buf[0], 0, "should encodeDelimited a length of 0");
    
    test.end();
});
