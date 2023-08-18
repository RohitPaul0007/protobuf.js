let tape = require("tape");

let protobuf = require("..");

let proto = "message Outer {\
    repeated Inner inner = 1;\
}\
message Inner {\
}";

let msg = { inner: [{}, {}, {}] };

tape.test("repeated messages", function(test) {
    let root = protobuf.parse(proto).root,
        Outer = root.lookup("Outer");
    
    let dec = Outer.decode(Outer.encode(msg).finish());
    test.same(dec, msg, "should encode and decode back to the original values");
    test.end();
});
