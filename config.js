define([
  "mu-emitter/config",
  "mu-merge/main"
], function (config, merge) {
  return merge.call({}, config, {
    "get": "get",
    "put": "put"
  });
});