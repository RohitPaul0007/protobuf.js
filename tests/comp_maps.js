let tape = require("tape");

let protobuf = require("..");

let root = protobuf.Root.fromJSON({
    nested: {
        Inner: {
            fields: {
                key: {
                    type: "string",
                    id: 1
                },
                values: {
                    rule: "repeated",
                    type: "string",
                    id: 2
                }
            }
        },
        Outer: {
            fields: {
                value: {
                    keyType: "string",
                    type: "Inner",
                    id: 1
                }
            }
        }        
    }
});

let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function randomString(len) {
    let str = "";
    for (let i = 0; i < len; ++i)
        str += chars.charAt((Math.random() * chars.length)|0);
    return str;
}

function randomMap() {
    let map = {};
    for (let i = 0; i < 10; ++i) {
        let values = [];
        for (let j = 0; j < 10; ++j)
            values.push(randomString(10));
        let key; do { key = randomString(10); } while(map[key]);
        map[key] = {
            key: randomString(10),
            values: values
        };
    }
    return map;
}

tape.test("maps", function(test) {
    let Inner = root.lookup("Inner"),
        Outer = root.lookup("Outer");

    test.test(test.name + " - randomly generated", function(test) {

        let outer = { value: randomMap() };
        let buf = Outer.encode(outer).finish();
        let dec = Outer.decode(buf);

        test.deepEqual(dec, outer, "should decode back the original random map");

        test.end();
    });

    test.test(test.name + " - specifically crafted", function(test) {

        let outer = {
            value: {
                b: {
                    key: "1",
                    values: ["c", "d"]
                },
                a: {
                    key: "2",
                    values: ["a", "b"]
                }
            }
        };

        var buf = Outer.encode(outer).finish();
        verifyEncode(test, buf);

        var dec = Outer.decode(buf);
        test.deepEqual(dec, outer, "should decode back the original map");

        test.end();
    });

    test.test(test.name + " - omitted fields", function(test) {

        var mapRoot = protobuf.Root.fromJSON({
            nested: {
                MapMessage: {
                    fields: {
                        value: {
                            keyType: "int32",
                            type: "string",
                            id: 1
                        }
                    }
                }
            }
        });

        var MapMessage = mapRoot.lookup("MapMessage");

        var value = {
            value: {
                0: ''
            }
        };
        var dec;

        // 1 <chunk> = message(1 <varint> = 0, 2 <chunk> = empty chunk)
        dec = MapMessage.decode(Uint8Array.of(0x0a, 0x04, 0x08, 0x00, 0x12, 0x00));
        test.deepEqual(dec, value, "should correct decode the buffer without omitted fields");

        // 1 <chunk> = message(1 <varint> = 0)
        dec = MapMessage.decode(Uint8Array.of(0x0a, 0x02, 0x08, 0x00));
        test.deepEqual(dec, value, "should correct decode the buffer with omitted value");

        // 1 <chunk> = message(2 <chunk> = empty chunk)
        dec = MapMessage.decode(Uint8Array.of(0x0a, 0x02, 0x12, 0x00));
        test.deepEqual(dec, value, "should correct decode the buffer with omitted key");

        // 1 <chunk> = empty chunk
        dec = MapMessage.decode(Uint8Array.of(0x0a, 0x00));
        test.deepEqual(dec, value, "should correct decode the buffer with both key and value omitted");

        test.end();
    });

    test.end();
});

function verifyEncode(test, buf) {
    test.test(test.name + " - should encode", function(test) {
        test.equal(buf.length, 32, "a total of 30 bytes");

        // first kv:
        /*
            b: {
                key: "1",
                values: ["c", "d"]
            },
        */
        test.equal(buf[ 0], 10, "id 1, wireType 2"); // Outer.value
        test.equal(buf[ 1], 14, "a length of 14");
        test.equal(buf[ 2], 10, "id 1, wireType 2"); //   Outer.value $key
        test.equal(buf[ 3],  1, "a length of 1");
        test.equal(buf[ 4], 98, "'b'");
        test.equal(buf[ 5], 18, "id 2, wireType 2"); //   Outer.value $value
        test.equal(buf[ 6],  9, "a length of 9");
        test.equal(buf[ 7], 10, "id 1, wireType 2"); //     Inner.key
        test.equal(buf[ 8],  1 , "a length of 1");
        test.equal(buf[ 9], 49, "'1'");
        test.equal(buf[10], 18, "id 2, wireType 2"); //     Inner.values (1)
        test.equal(buf[11],  1, "a length of 1");
        test.equal(buf[12], 99, "'c'");
        test.equal(buf[13], 18, "id 2, wireType 2"); //     Inner.values (2)
        test.equal(buf[14],  1, "a length of 1");
        test.equal(buf[15],100, "'d'");

        // second
        test.equal(buf[16], 10, "id 1, wireType 2"); // Outer.value
        // ...

        test.end();
    });
}
