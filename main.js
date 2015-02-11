define([
  "mu-emitter/main",
  "./config",
  "./executor",
  "when/when",
  "when/keys",
  "poly/array",
  "poly/object"
], function (Emitter, config, executor, when, when_keys) {
  var UNDEFINED;
  var EMPTY = {};
  var ARRAY_SLICE = Array.prototype.slice;
  var OBJECT_TOSTRING = Object.prototype.toString;
  var TOSTRING_FUNCTION = "[object Function]";
  var TOSTRING_ARRAY = "[object Array]";
  var TOSTRING_OBJECT = "[object Object]";
  var SEPARATOR = ".";
  var LENGTH = "length";
  var GET = config.get;
  var PUT = config.put;
  var TYPE = config.type;
  var EXECUTOR = config.executor;

  function _get(key, segments) {
    var me = this;
    var event = {};

    event[TYPE] = GET;
    event[EXECUTOR] = executor;

    return me
      .emit(event, key)
      .then(function () {
        return segments.reduce(function (node, segment) {
          return node === UNDEFINED
            ? node
            : node[segment];
        }, me);
      });
  }

  function _put(key, segments, value) {
    var me = this;
    var event = {};

    var last = segments[LENGTH] - 1;
    var result = segments.reduce(function (node, segment, index) {
      return index === last
        ? node
        : node.hasOwnProperty(segment)
          ? node[segment]
          : node[segment] = {};
    }, me)[segments[last]] = OBJECT_TOSTRING.call(value) === TOSTRING_FUNCTION
      ? value.call(me, segments.join(SEPARATOR))
      : value;

    event[TYPE] = PUT;
    event[EXECUTOR] = executor;

    return me
      .emit(event, key, result)
      .yield(result);
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

  State.prototype = new Emitter();

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
        result = when.map(key, function (_key) {
          return _get.call(me, _key, _key.split(SEPARATOR));
        });
        break;

      default:
        result = _get.call(me, key, key.split(SEPARATOR));
        break;
    }

    return result;
  };

  State.prototype.put = function (key, value) {
    var me = this;
    var result;

    switch(OBJECT_TOSTRING.call(key)) {
      case TOSTRING_OBJECT:
        result = when_keys(key, function (_value, _key) {
          return _put.call(me, _key, _key.split(SEPARATOR), _value);
        });
        break;

      default:
        result = _put.call(me, key, key.split(SEPARATOR), value);
        break;
    }

    return result;
  };

  State.prototype.has = function (key) {
    return _has.call(this, key.split(SEPARATOR));
  };

  State.prototype.putIfNotHas = function (key, value) {
    var me = this;

    return !me.has(key)
      ? me.put(key, value)
      : when.resolve();
  };

  return State;
});
