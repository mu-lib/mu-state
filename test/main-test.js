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

    "has": {
      "shallow key": function () {
        assert(this.cs.has("key1"));
      },

      "not shallow key": function () {
        refute(this.cs.has("xxx"));
      },

      "deep key": function () {
        assert(this.cs.has("key1.key2"));
      },

      "not deep key": function () {
        refute(this.cs.has("key1.xxx"));
      }
    },

    "get": {
      "shallow key": function () {
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

      "deep key": function () {
        return this.cs
          .get("key1.key2")
          .then(function (result) {
            assert.equals(result, {
              "key3": "value3"
            });
          });
      },

      "using array": function () {
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

      "non-existent deep level key": function () {
        return this.cs
          .get("key1.key2.a.b.c")
          .then(function (result) {
            assert.equals(result, UNDEFINED);
          });
      },

      "with default value": {
        "hit and string key": function () {
          return this.cs
            .get("xxx", "yyy")
            .then(function (result) {
              assert.equals(result, "yyy");
            });
        },

        "hit and function value": function () {
          return this.cs
            .get("xxx", function (_key) {
              return _key + "-yyy";
            })
            .then(function (result) {
              assert.equals(result, "xxx-yyy");
            });
        },

        "miss and string key": function () {
          return this.cs
            .get("key1", "yyy")
            .then(function (result) {
              assert.equals(result, {
                "key2": {
                  "key3": "value3"
                }
              });
            });
        },

        "and object key": function () {
          return this.cs
            .get({
              "key1": "zzz",
              "xxx": "yyy"
            })
            .then(function (results) {
              assert.equals(results.key1, {
                "key2": {
                  "key3": "value3"
                }
              });
              assert.equals(results.xxx, "yyy");
            });
        },

        "and array key": function () {
          return this.cs
            .get([ "key1", "xxx" ], "yyy")
            .spread(function (value1, value2) {
              assert.equals(value1, {
                "key2": {
                  "key3": "value3"
                }
              });
              assert.equals(value2, "yyy");
            });
        }
      }
    },

    "put": {
      "shallow key and value": function () {
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

      "deep key and value": function () {
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

      "async key and value": function () {
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
      }
    },

    "push": function () {
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