let tape = require("tape");

let protobuf = require("..");

let proto = "syntax = \"proto3\";\
package myservice;\
message DoSomethingRequest {\
}\
message DoSomethingResponse {\
}\
service MyService {\
  rpc DoSomething(DoSomethingRequest) returns (DoSomethingResponse) {\
    option (google.api.http) = {\
      get: \"/v1/dosomething\"\
    };\
  };\
}";

tape.test("reflected services", function(test) {
    let root = protobuf.parse(proto).root;

    let myservice = root.lookup("myservice").resolveAll(),
        MyService = myservice.MyService,
        DoSomethingRequest = myservice.DoSomethingRequest,
        DoSomethingResponse = myservice.DoSomethingResponse,
        DoSomething = MyService.get("DoSomething");

    test.throws(function() {
        MyService.create();
    }, TypeError, "should throw if rpcImpl is not specified");

    function rpcImpl(method, requestData, callback) {
        if (requestData) {
            test.equal(method, DoSomething, "rpcImpl should reference the correct method");
            test.ok(callback, "rpcImpl should provide a callback");
            setTimeout(function() {
                callback(null, DoSomethingResponse.create());
            });
        } else {
            test.equal(method, null, "rpcImpl should not reference a method when closed");
            test.equal(callback, null, "rpcImpl should not provide a callback when closed");
        }
    }

    let service = MyService.create(rpcImpl);

    test.throws(function() {
        service.doSomething();
    }, TypeError, "should throw if request is not specified");

    test.test(test.name + " - should propagate errors from rpcImpl", function(test) {
        let err = Error();
        let service2 = MyService.create(function(method, requestData, callback) { callback(err); });
        let count = 0;
        service2.on("error", function(err2) {
            test.equal(err2, err, "should emit the exact error");
            if (++count === 2)
                test.end();
        });
        service2.doSomething({}, function(err2) {
            test.equal(err2, err, "should return the exact error");
            if (++count === 2)
                test.end();
        });
    });

    test.test(test.name + " - should catch errors within rpcImpl", function(test) {
        let err = Error();
        let service2 = MyService.create(function(method, requestData, callback) { throw err; });
        let count = 0;
        service2.on("error", function(err2) {
            test.equal(err2, err, "should emit the exact error");
            if (++count === 2)
                test.end();
        });
        service2.doSomething({}, function(err2) {
            test.equal(err2, err, "should return the exact error");
            if (++count === 2)
                test.end();
        });
    });

    test.test(test.name + " - should return errors from decoding", function(test) {
        let service2 = MyService.create(function(method, requestData, callback) { callback(null, protobuf.util.newBuffer(0) ); }, true, true);
        let count = 0;
        service2.on("error", function(err2) {
            test.ok(err2, "should emit the error");
            if (++count === 2)
                test.end();
        });
        service2.doSomething({}, function(err2) {
            test.ok(err2, "should return the error");
            if (++count === 2)
                test.end();
        });
    });

    let dataEmitted = false;
    service.on("data", function(responseData) {
        dataEmitted = true;
        test.ok(responseData, "should emit the data event");
    });
    let endCalled = false;
    service.on("end", function() {
        test.notOk(endCalled, "should not emit the end event twice");
        endCalled = true;
        test.pass("should call the end event");
        service.end();
        test.end();
    });
    service.doSomething(DoSomethingRequest.create(), function(err, res) {
        test.notOk(err, "should not raise an error");
        test.ok(res instanceof DoSomethingResponse.ctor, "should return a properly typed response");
        test.ok(dataEmitted, "should have emitted the data event");
        service.end();
    });
    
});
