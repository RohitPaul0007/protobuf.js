let tape = require("tape");

let protobuf  = require("..");

let proto = "syntax = \"proto3\";\
message A {\
    message B {\
        message One {\
            extensions 1000 to max;\
            reserved 900 to 999, 899, \"a\", 'b';\
        }\
    }\
    message C {\
        message Two {\
            extend B.One {\
                C.Two two = 1000;\
            }\
        }\
    }\
}";

tape.test("extensions", function(test) {
    let root = protobuf.parse(proto).root;
    root.resolveAll();
    test.pass("should parse and resolve without errors");
    test.end();
});
