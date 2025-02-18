let tape = require("tape");

let protobuf = require("..");

let root = protobuf.Root.fromJSON({
    nested: {
        Foo: {
            fields: {
                foo: {
                    id: 1,
                    type: "google.protobuf.Any"
                }
            }
        },
        Bar: {
            fields: {
                bar: {
                    id: 1,
                    type: "string"
                }
            }
        }
    }
}).addJSON(protobuf.common["google/protobuf/any.proto"].nested).resolveAll();

let Any = root.lookupType("protobuf.Any"),
    Foo = root.lookupType(".Foo"),
    Bar = root.lookupType(".Bar");

tape.test("google.protobuf.Any", function(test) {

    let foo = Foo.fromObject({
        foo: {
            type_url: "Bar",
            value: [1 << 3 | 2, 1, 97] // value = "a"
        }
    });
    test.ok(foo.foo instanceof Any.ctor, "should keep explicit Any in fromObject");
    test.same(foo.foo, { type_url: "Bar", value: [10, 1, 97] }, "should keep explicit Any in fromObject properly");

    let obj = Foo.toObject(foo);
    test.same(obj.foo, { type_url: "Bar", value: [10, 1, 97] }, "should keep explicit Any in toObject properly");

    obj = Foo.toObject(foo, { json: true });
    test.same(obj.foo, { "@type": "type.googleapis.com/Bar", bar: "a" }, "should decode explicitly Any in toObject if requested");

    foo = Foo.fromObject({
        foo: {
            "@type": ".Bar",
            bar: "a"
        }
    });
    test.ok(foo.foo instanceof Any.ctor, "should convert to Any in fromObject");
    test.same(foo.foo, { type_url: "/Bar", value: protobuf.util.newBuffer([10, 1, 97]) }, "should have correct Any object when converted with fromObject");

    let baz = Foo.fromObject({
        foo: {
            type_url: "type.someurl.com/Bar",
            value: [1 << 3 | 2, 1, 97] // value = "a"
        }
    });
    obj = Foo.toObject(baz, { json: true });
    test.same(obj.foo, { "@type": "type.someurl.com/Bar", bar: "a" }, "should keep prefix in type url");

    test.end();
});
