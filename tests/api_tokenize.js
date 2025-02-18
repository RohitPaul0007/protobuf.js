let tape = require("tape");

let protobuf = require("..");

let tokenize = protobuf.tokenize;

tape.test("tokenize", function(test) {

    test.test(test.name + " - unescape", function(test) {
        test.equal(tokenize.unescape("\\\\0 \\\0 \\0 \0"), "\\0  \0 \0", "should propery unescape zero-sequences");
        test.equal(tokenize.unescape("\\\t\\t\\r\\n"), "\t\r\n", "should propery unescape tabs and line feeds");
        test.end();
    });

    test.ok(expect("", [null]), "should instantly finish for an empty source");
    test.ok(expect("'hello\\nworld'", ["'", "hello\nworld", "'", null]), "should parse single quoted strings");
    test.ok(expect("\"hello\\nworld\"", ["\"", "hello\nworld", "\"", null]), "should parse double quoted strings");
    test.ok(expectError("\"as\"d\""), "should throw for invalid strings");

    let tn = tokenize("message Test {}");
    test.throws(function() {
        tn.skip("somethingelse", false);
    }, Error, "should throw when skipping non-optional tokens");
    test.doesNotThrow(function() {
        tn.skip("somethingelse", true);
    }, Error, "should not throw when skipping optional tokens");

    tn = tokenize("// line comment");
    test.equal(tn.next(), null, "should skip line comments on a single line");
    tn = tokenize("a /// line comment\n");
    tn.next();
    test.equal(tn.cmnt(1), "line comment", "should peek for trailing line comments");
    tn = tokenize("/* block comment */");
    test.equal(tn.next(), null, "should skip block comments on a single line");
    tn = tokenize("/// line comment\na\n");
    tn.next();
    test.equal(tn.cmnt(), "line comment", "should keep leading comments around while on the next line");
    tn = tokenize("/// leading comment A\na /// trailing comment A\nb /// trailing comment B\n");
    tn.next();
    test.equal(tn.cmnt(), "leading comment A", "should parse leading comment");
    test.equal(tn.cmnt(tn.line), "trailing comment A", "should parse trailing comment");
    tn.next();
    test.equal(tn.cmnt(), null, "trailing comment should not be recognized as leading comment for next line");
    test.equal(tn.cmnt(tn.line), "trailing comment B", "should parse trailing comment");
    tn = tokenize("/// leading comment A\na /// trailing comment A\n/// leading comment B\nb /// trailing comment B\n");
    tn.next();
    test.equal(tn.cmnt(tn.line), "trailing comment A", "trailing comment should not contain leading comment from next line");
    tn.next();
    test.equal(tn.cmnt(), 'leading comment B', "leading comment should be present after trailing comment");

    test.ok(expectError("something; /"), "should throw for unterminated line comments");
    test.ok(expectError("something; /* comment"), "should throw for unterminated block comments");
    test.ok(expectError("something; /* comment *"), "should throw for unterminated block comments");
    test.ok(expect("a / / b", ["a", "/", "/", "b", null]), "should not misinterpret single slashes as a comment");

    test.end();
});

function expect(proto, expected) {
    let tn = tokenize(proto);
    let token;
    let actual = [];
    do {
        actual.push(token = tn.next());
    } while (token !== null);
    if (actual.length !== expected.length) {
        // console.error("actual", actual, " != expected" , expected);
        return false;
    }
    for (var i = 0; i < expected.length; ++i)
        if (actual[i] !== expected[i]) {
            // console.error("actual", actual, " != expected" , expected);
            return false;
        }
    return true;
}

function expectError(proto) {
    let tn = tokenize(proto);
    try {
        while (tn.next());
        return null;
    } catch (e) {
        return e;
    }
}
