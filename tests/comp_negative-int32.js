let tape = require("tape");

let protobuf  = require("..");

tape.test("negative int32 values", function(test) {
    let writer = protobuf.Writer.create();
    writer.int32(-5615122);
    let buf = writer.finish();

    test.equal(buf.length, 10, "should encode to 10 bytes");

    let reader = protobuf.Reader.create(buf);

    test.equal(reader.int32(), -5615122, "should decode from 10 bytes");

    test.equal(reader.pos, 10, "should have consumed the entire test buffer");

    test.end();
});
