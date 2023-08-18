let tape = require("tape");

let protobuf = require("..");

tape.test("fixed64 (grpc)", function(test) {

    let root = protobuf.Root.fromJSON({
        nested: {
            test: {
                nested: {
                    Test: {
                        fields: {
                            int_64: {
                                type: 'fixed64',
                                id: 1
                            }
                        }
                    }
                }
            }
        }
    });

    let Test = root.lookup("test.Test");

    let buffer = Test.encode({
        int_64: '314159265358979'
    }).finish();

    test.equal(buffer.length, 9, "should encode a total of 9 bytes");
    test.equal(buffer[0], 9, "should encode id 1, wireType 1");

    let decoded = Test.decode(buffer);
    // decoded.int_64 is a Long here, so this implicitly calls Long#toString:
    test.ok(decoded.int_64 == '314159265358979', "should decode back the original value");

    test.end();

});
