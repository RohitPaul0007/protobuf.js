let tape = require("tape");

let protobuf = require("..");

let proto1 = "message Test {\
  repeated uint32 a = 1 [packed = true];\
}";

let proto2 = "message Test {\
  repeated uint32 a = 1 [packed = false];\
}";

let msg = {
    a: [1,2,3]
};

tape.test("packed repeated values", function(test) {
    let root1 = protobuf.parse(proto1).root,
        root2 = protobuf.parse(proto2).root;
    let Test1 = root1.lookup("Test"),
        Test2 = root2.lookup("Test");
    
    let dec1 = Test2.decode(Test1.encode(msg).finish());
    test.same(dec1, msg, "should decode packed even if defined non-packed");
    let dec2 = Test1.decode(Test2.encode(msg).finish());
    test.same(dec2, msg, "should decode non-packed even if defined packed");

    test.end();
});
