define([ "../main" ], function (CS) {
  var UNDEFINED;
  var assert = buster.referee.assert;
  var refute = buster.referee.refute;

  buster.testCase("mu-state/main", {
    "setUp": function () {
      var cs = this.cs = new CS();

      return cs
        .push({
          "key1": {
            "key2": {
              "key3": "value3"
            }
          }
        });
    },

    "has shallow key": function () {
      assert(this.cs.has("key1"));
    },

    "has deep key": function () {
      assert(this.cs.has("key1.key2"));
    },

    "does not have shallow key": function () {
      refute(this.cs.has("xxx"));
    },

    "does not have deep key": function () {
      refute(this.cs.has("key1.xxx"));
    },

    "get shallow key": function () {
      return this.cs
        .get("key1")
        .then(function (result) {
          assert.equals(result, {
            "key2": {
              "key3": "value3"
            }
          });
        });
    },

    "get deep key": function () {
      return this.cs
        .get("key1.key2")
        .then(function (result) {
          assert.equals(result, {
            "key3": "value3"
          });
        });
    },

    "get using object": function () {
      return this.cs
        .get({
          "key1": UNDEFINED,
          "key1.key2": UNDEFINED,
          "key3": "default"
        })
        .then(function (result) {
          assert.equals(result["key1"], {
            "key2": {
              "key3": "value3"
            }
          });
          assert.equals(result["key1.key2"], {
            "key3": "value3"
          });
          assert.equals(result["key3"], "default");
        });
    },

    "get using array": function () {
      return this.cs
        .get(["key1", "key1.key2" ])
        .spread(function (value1, value2) {
          assert.equals(value1, {
            "key2": {
              "key3": "value3"
            }
          });
          assert.equals(value2, {
            "key3": "value3"
          });
        })
    },

    "get non existent deep level key": function () {
      return this.cs
        .get("key1.key2.a.b.c")
        .then(function (result) {
          assert.equals(result, UNDEFINED);
        });
    },

    "put and get shallow key and value": function () {
      var cs = this.cs;

      return cs
        .put("put_get_shallow", "value")
        .then(function (put_result) {
          assert.equals(put_result, "value");

          return cs
            .get("put_get_shallow")
            .then(function (get_result) {
              assert.equals(get_result, "value");
            });
        });
    },

    "put and get deep key and value": function () {
      var cs = this.cs;

      return cs
        .put("put_get_deep.key", "value")
        .then(function (put_result) {
          assert.equals(put_result, "value");

          return cs.get("put_get_deep.key", function (get_result) {
            assert.equals(get_result, "value");
          });
        });
    },

    "put and get async key and value": function () {
      var cs = this.cs;

      return cs
        .put("put_get_async", function (key) {
          assert.equals(key, "put_get_async");
          return "value";
        })
        .then(function (put_result) {
          assert.equals(put_result, "value");

          return cs
            .get("put_get_async")
            .then(function (get_result) {
              assert(get_result, "value");
            });
        });
    },

    "push and get": function () {
      var cs = this.cs;

      return cs
        .push({
          "push_shallow": "value1",
          "push_deep.sync": "value2"
        }, {
          "push_deep.async": function (key) {
            assert.equals(key, "push_deep.async");
            return "value3";
          }
        })
        .then(function () {
          return cs
            .get([ "push_shallow", "push_deep.sync", "push_deep.async" ])
            .spread(function (push_shallow, push_deep_sync, push_deep_async) {
            assert.equals(push_shallow, "value1");
            assert.equals(push_deep_sync, "value2");
            assert.equals(push_deep_async, "value3");
          });
        });
    },

    "put, get and has with undefined value": function () {
      var cs = this.cs;

      return cs
        .put("put_undefined", UNDEFINED)
        .then(function (put_result) {
          assert.same(put_result, UNDEFINED);
          assert(cs.has("put_undefined"));

          return cs
            .get("put_undefined")
            .then(function (get_result) {
              assert.same(get_result, UNDEFINED);
            });
        });
    }
  });
});