let tape = require("tape");

let protobuf = require("..");

let util = protobuf.util;

tape.test("util", function(test) {

    test.test(test.name + " - merge", function(test) {
        let o = {};
        util.merge(o, {});
        test.same(o, {}, "should do nothing if both objects are empty");
        util.merge(o, { a: 1 });
        test.same(o, { a: 1 }, "should merge non-existing keys");
        util.merge(o, { a: 2 });
        test.same(o, { a: 2 }, "should merge existing keys");
        util.merge(o, { a: 3 }, true);
        test.same(o, { a: 2 }, "should not merge existing keys");
        test.end();
    });

    test.test(test.name + " - lcFirst", function(test) {
        test.equal(util.lcFirst("ABC"), "aBC", "should convert the first character to lower case");
        test.end();
    });

    test.test(test.name + " - ucFirst", function(test) {
        test.equal(util.ucFirst("abc"), "Abc", "should convert the first character to upper case");
        test.end();
    });

    test.test(test.name + " - isSet", function(test) {
        // note that encoders don't check for default values either
        let neverPresent = [
            [],
            {},
            undefined,
            null
        ];
        neverPresent.forEach(function(value) {
            let proto = {};
            let instance = Object.create(proto);
            proto.p = value;
            instance.i = value;
            test.notOk(util.isSet(proto, "p"), "should return that " + JSON.stringify(value) + " on the prototype is not present");
            test.notOk(util.isSet(instance, "i"), "should return that " + JSON.stringify(value) + " on the instance is not present");
        });
        let cases = {
            "arrays": [ [], [0] ],
            "objects": [ {}, {a:1} ],
            "strings": [ undefined, "" ],
            "numbers": [ undefined, 0 ],
            "booleans": [ undefined, false ]
        };
        Object.keys(cases).forEach(function(name) {
            let empty = cases[name][0],
                value = cases[name][1];
            let proto = {};
            let instance = Object.create(proto);
            proto.pe = instance.ie = empty;
            proto.p = instance.i = value;
            if (empty !== undefined) { // not present anyway
                test.notOk(util.isSet(instance, "pe"), "should return that empty " + name + " on the prototype are not present");
                test.notOk(util.isSet(instance, "ie"), "should return that empty " + name + " on the instance are not present");
            }
            test.notOk(util.isSet(instance, "p"), "should return that " + name + " on the prototype are not present");
            test.ok(util.isSet(instance, "i"), "should return that " + name + " on the instance ARE present");
        });

         test.end();
    });

    test.test(test.name + " - setProperty", function(test) {
        let o = {};

        test.throws(function() {
            util.setProperty(5, 'prop1', 5);
        }, TypeError, "dst must be an object");

        test.throws(function () {
            util.setProperty(o, '', 5);
        }, TypeError, "path must be specified");

        util.setProperty(o, 'prop1', 5);
        test.same(o, {prop1: 5}, "should set single property value");

        util.setProperty(o, 'prop1', 6);
        test.same(o, {prop1: [5, 6]}, "should convert to array if same property is set");

        util.setProperty(o, 'prop.subprop', { subsub: 5});
        test.same(o, {prop1: [5, 6], prop: {subprop: {subsub: 5}}}, "should handle nested properties properly");

        util.setProperty(o, 'prop.subprop.subsub', 6);
        test.same(o, {prop1: [5, 6], prop: {subprop: {subsub: [5, 6]}}}, "should convert to array nested property");

        util.setProperty(o, 'prop.subprop', { subsub2: 7});
        test.same(o, {prop1: [5, 6], prop: {subprop: [{subsub: [5,6]}, {subsub2: 7}]}}, "should convert nested properties to array");
        
        util.setProperty({}, "__proto__.test", "value");
        test.is({}.test, undefined);

        util.setProperty({}, "prototype.test", "value");
        test.is({}.test, undefined);

        util.setProperty({}, "constructor.prototype.test", "value");
        test.is({}.test, undefined);

        test.end();
    });

    test.end();
});
