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
  var ARRAY_PROTO = Array.prototype;
  var ARRAY_SLICE = ARRAY_PROTO.slice;
  var ARRAY_CONCAT = ARRAY_PROTO.concat;
  var OBJECT_TOSTRING = Object.prototype.toString;
  var TOSTRING_FUNCTION = "[object Function]";
  var TOSTRING_ARRAY = "[object Array]";
  var TOSTRING_OBJECT = "[object Object]";
  var SEPARATOR = ".";
  var LENGTH = "length";
  var GET = config.get;
  var PUT = config.put;
  var READY = config.ready;
  var TYPE = config.type;
  var EXECUTOR = config.executor;

  function _get(key) {
    var me = this;
    var event = {};

    event[TYPE] = GET;
    event[EXECUTOR] = executor;

    return me
      .emit(event, key)
      .then(function () {
        return key
          .split(SEPARATOR)
          .reduce(function (node, segment) {
            return node === UNDEFINED
              ? node
              : node[segment];
          }, me);
      });
  }

  function _put(key, value) {
    var me = this;
    var event = {};
    var segments = key.split(SEPARATOR);

    var last = segments[LENGTH] - 1;
    var result = segments.reduce(function (node, segment, index) {
      return index === last
        ? node
        : node.hasOwnProperty(segment)
          ? node[segment]
          : node[segment] = {};
    }, me)[segments[last]] = OBJECT_TOSTRING.call(value) === TOSTRING_FUNCTION
      ? value.call(me, key)
      : value;

    event[TYPE] = PUT;
    event[EXECUTOR] = executor;

    return me
      .emit(event, key, result)
      .yield(result);
  }

  function _has(key) {
    return key
        .split(SEPARATOR)
        .reduce(function (node, segment) {
          return node === EMPTY
            ? node
            : node.hasOwnProperty(segment)
            ? node[segment]
            : EMPTY;
        }, this) !== EMPTY;
  }

  function push() {
    var me = this;

    return when.map(ARRAY_SLICE.call(arguments), function (arg) {
      var result;

      switch (OBJECT_TOSTRING.call(arg)) {
        case TOSTRING_FUNCTION:
          me.on(READY, result = arg);
          break;

        default:
          result = when_keys.map(arg, function (value, key) {
            return me.put(key, value);
          });
      }

      return result;
    });
  }

  function State() {
    var me = this;
    var args = arguments;

    when(args[LENGTH] !== 0 && push.apply(me, ARRAY_CONCAT.apply(ARRAY_PROTO, args)), function () {
      return me.emit(READY);
    });
  }

  State.prototype = new Emitter();

  State.prototype.push = push;

  State.prototype.get = function (key) {
    var me = this;
    var result;

    switch (OBJECT_TOSTRING.call(key)) {
      case TOSTRING_ARRAY:
        result = when.map(key, function (_key) {
          return _get.call(me, _key);
        });
        break;

      default:
        result = _get.call(me, key);
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
          return _put.call(me, _key, _value);
        });
        break;

      default:
        result = _put.call(me, key, value);
        break;
    }

    return result;
  };

  State.prototype.has = function (key) {
    return _has.call(this, key);
  };

  State.prototype.putIfNotHas = function (key, value) {
    var me = this;

    return !me.has(key)
      ? me.put(key, value)
      : when.resolve();
  };

  return State;
});
