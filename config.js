define([
  "mu-emitter/config",
  "mu-merge/main"
], function (config, merge) {
  "use strict";

  return merge.call({}, config, {
    "get": "get",
    "put": "put",
    "ready": "ready"
  });
});
