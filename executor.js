define([
  "./config",
  "when/when"
], function (config, when) {
  "use strict";

  var UNDEFINED;
  var HEAD = config.head;
  var NEXT = config.next;

  return function (event, handlers, args) {
    var _handlers = [];
    var _handlersCount = 0;
    var handler;

    for (handler = handlers[HEAD]; handler !== UNDEFINED; handler = handler[NEXT]) {
      _handlers[_handlersCount++] = handler;
    }

    return when.map(_handlers, function (_handler) {
      return _handler.handle(args);
    });
  };
});
