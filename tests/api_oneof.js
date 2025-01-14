let tape = require("tape");

let protobuf = require("..");

let def = {
    oneof: ["a", "b"],
    options: {}
};

let proto = "syntax = \"proto3\";\
import \"google/protobuf/descriptor.proto\";\
extend google.protobuf.FileOptions { optional int32 ecs_component_id = 50000;}\
option (ecs_component_id) = 1020;\
message Test {\
    oneof kind {\
        uint32 a = 1;\
        string b = 2;\
    }\
    bool c = 3;\
}";

tape.test("reflected oneofs", function(test) {

    let oneof = protobuf.OneOf.fromJSON("kind", {
        oneof: ["a", "b"],
        options: {}
    });
    test.same(oneof.toJSON(), def, "should construct from and convert back to JSON");

    let root = protobuf.parse(proto).root;
    let Test = root.lookup("Test");
    let kind = Test.get("kind");
    let field = Test.get("c");

    kind.add(field);
    test.same(kind.toJSON(), {
        oneof: ["a", "b", "c"]
    }, "should allow adding fields");
    test.ok(Test.get("c"), "should still have the field on the parent");

    kind.remove(field);
    test.same(kind.toJSON(), {
        oneof: ["a", "b"]
    }, "should allow removing fields");
    test.ok(Test.get("c"), "should still have the field on the parent");

    let Test2 = new protobuf.Type("Test2");
    root.add(Test2);
    Test2.add(field);
    kind.add(field);
    test.notOk(Test2.get("c"), "should remove the field from the previous parent");

    let looseField = new protobuf.Field("d", 4, "float");
    kind.add(looseField); // no parent
    Test.remove(looseField);
    Test.remove(kind);
    test.same(Test.fields, {}, "should remove all fields from the parent");
    test.same(kind.oneof, ["a","b","c","d"], "should still have the fields on the oneof");

    test.end();
});
