/**
  @module superapi
  @version 0.2.1
  @copyright Stéphane Bachelier <stephane.bachelier@gmail.com>
  @license MIT
  */
define("superapi/api",
  ["superagent-es6","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var superagent = __dependency1__["default"];

    function Api(config) {
      this.config = config;

      var self = this;
      for (var name in config.services) {
        if (!this.hasOwnProperty(name)) {
          this[name] = function (data, fn) {
            return self.request(name, data).end(fn ? fn : function (res) {
              this.emit(res.ok ? "success" : "error", res);
            });
          };
        }
      }
    }

    Api.prototype = {
      service: function (id) {
        return this.config.services[id];
      },

      url: function (id) {
        var url = this.config.baseUrl;
        var resource = this.service(id);

        // from time being it"s a simple map
        if (resource) {
          var path;

          if (typeof resource === "string") {
            path = resource;
          }

          if (typeof resource === "object" && resource.path !== undefined) {
            path = resource.path;
          }

          if (!path) {
            throw new Error("path is not defined for route $" + id);
          }

          url += path[0] === "/" ? path : "/" + path;
        }

        return url;
      },

      request: function (id, data) {
        var service = this.service(id);
        var method = (typeof service === "string" ? "get" : service.method || "get").toLowerCase();
        // fix for delete being a reserved word
        if (method === "delete") {
          method = "del";
        }
        var request = superagent[method];
        if (!request) {
          throw new Error("Invalid method [" + service.method + "]");
        }

        var _req = request(this.url(id), data);
        var header, opts;

        // add global headers
        for (header in this.config.headers) {
          _req.set(header, this.config.headers[header]);
        }

        // add global options to request headers
        for (opts in this.config.options) {
          _req[opts](this.config.options[opts]);
        }

        // add service options to request headers
        for (opts in service.options) {
          _req[opts](service.options[opts]);
        }

        // add service headers
        for (header in service.headers) {
          _req.set(header, service.headers[header]);
        }

        return _req;
      }
    };

    __exports__["default"] = Api;
  });
define("superapi",
  ["./superapi/api","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Api = __dependency1__["default"];

    function superapi(config) {
      return new Api(config);
    }

    superapi.prototype.Api = Api;

    // export API
    __exports__["default"] = superapi;
  });