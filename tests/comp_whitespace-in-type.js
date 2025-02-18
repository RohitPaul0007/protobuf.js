let tape = require("tape");
let protobuf = require("..");

tape.test("parsing line breaks", function (test) {

    test.test(test.name + " - field options (Int)", function (test) {
        let root = protobuf.loadSync("tests/data/whitespace-in-type.proto");
        let message = root.lookupType('some.really.long.name.which.does.not.really.make.any.sense.but.sometimes.we.still.see.stuff.like.this.WouldYouParseThisForMePlease');
        test.equal(message.fields.field.type, 'some.really.long.name.which.does.not.really.make.any.sense.but.sometimes.we.still.see.stuff.like.this.Test');
        test.end();
    });

    test.end();
});
