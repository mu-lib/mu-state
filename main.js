define([
  "when/when",
  "when/keys",
  "poly/array",
  "poly/object"
], function (when, when_keys) {
  var UNDEFINED;
  var EMPTY = {};
  var ARRAY_SLICE = Array.prototype.slice;
  var OBJECT_TOSTRING = Object.prototype.toString;
  var TOSTRING_FUNCTION = "[object Function]";
  var TOSTRING_ARRAY = "[object Array]";
  var TOSTRING_OBJECT = "[object Object]";
  var LENGTH = "length";

  function _get(keys) {
    return keys.reduce(function (node, key) {
      return node === UNDEFINED
        ? node
        : node[key];
    }, this);
  }

  function _put(keys, value) {
    var me = this;
    var last = keys[LENGTH] - 1;

    return keys.reduce(function (node, key, index) {
      return index === last
        ? node
        : node.hasOwnProperty(key)
          ? node[key]
          : node[key] = {};
    }, me)[keys[last]] = OBJECT_TOSTRING.call(value) === TOSTRING_FUNCTION
      ? value.call(me, keys.join("."))
      : value;
  }

  function _has(keys) {
    return keys.reduce(function (node, key) {
        return node === EMPTY
          ? node
          : node.hasOwnProperty(key)
          ? node[key]
          : EMPTY;
      }, this) !== EMPTY;
  }

  function State() {
  }

  State.prototype.push = function () {
    var me = this;

    return when.map(ARRAY_SLICE.call(arguments), function (arg) {
      return when_keys.map(arg, function (value, key) {
        return me.put(key, value);
      });
    });
  };

  State.prototype.get = function (key) {
    var me = this;
    var result;

    switch (OBJECT_TOSTRING.call(key)) {
      case TOSTRING_ARRAY:
        result = key.map(function (_key) {
          return _get.call(me, _key.split("."));
        });
        break;

      default:
        result = _get.call(me, key.split("."));
        break;
    }

    return when(result);
  };

  State.prototype.put = function (key, value) {
    var me = this;
    var result;

    switch(OBJECT_TOSTRING.call(key)) {
      case TOSTRING_OBJECT:
        result = when_keys(key, function (_value, _key) {
          return _put.call(me, _key.split("."), _value);
        });
        break;

      default:
        result = _put.call(me, key.split("."), value);
        break;
    }

    return when(result);
  };

  State.prototype.has = function (key) {
    return _has.call(this, key.split("."));
  };

  return State;
});
