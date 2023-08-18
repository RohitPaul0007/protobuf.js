"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let path = require("path");
let tape = require("tape");
let protobuf = require("../index");
// to extend Root
require("../ext/descriptor");
tape.test("extensions", function (test) {
    // load document with extended field imported multiple times
    let root = protobuf.loadSync(path.resolve(__dirname, "data/test.proto"));
    root.resolveAll();
    // convert to Descriptor Set
    let decodedDescriptorSet = root.toDescriptor("proto3");
    // load back from descriptor set
    let root2 = protobuf.Root.fromDescriptor(decodedDescriptorSet);
    test.pass("should parse and resolve without errors");
    test.end();
});
