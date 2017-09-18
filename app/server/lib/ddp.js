require('harmony-reflect');
var fs = require('fs'),
    async = require('async');

var DDPServer = function(opts) {

  opts = opts || {};
  var WebSocket = require('faye-websocket'),
      EJSON = require('ejson'),
      http = require('http'),
      server = opts.httpServer,
      methods = opts.methods || {},
      collections = {},
      subscriptions = {},
      self = this;

  if (!server) {
    server = http.createServer()
    server.listen(opts.port || 3000);
  }
  
  server.on('upgrade', function (request, socket, body) {
    if (WebSocket.isWebSocket(request)) {
      var ws = new WebSocket(request, socket, body);
      var session_id = "" + new Date().getTime();
      subscriptions[session_id] = {};

      function sendMessage(data) {
        ws.send(EJSON.stringify(data));
      }

      ws.on('message', function(event) {
        var data = JSON.parse(event.data),
            controller = null;
        switch (data.msg) {

        case "connect":

          sendMessage({
            msg: "connected",
            session: session_id
          });

          break;

        case "method":
            async.series([
                function(callback) {
                  if (!methods[data.method] || typeof(methods[data.method]) == 'undefined') {
                    var parts = data.method.split('_');
                    var controllerName = parts.shift().toString().toLowerCase(),
                        action = null;
                    if (parts[1]) {
                      action = parts.join('_').toString().toLowerCase();
                    } else {
                      action = 'index';
                    }
                    ;
                    async.series([(callback) => {
                      if (opts.application.controllers[controllerName]) {
                        controller = opts.application.controllers[controllerName];
                        callback();
                      } else {
                        var controllerClass = controllerName[0].toString().toUpperCase() + controllerName.toString().substr(1) + 'Controller';
                        var fileName = __dirname + '/../controllers/' + controllerClass + '.js';
                        fs.stat(fileName, (err, fileEntry) => {
                          if (!err && fileEntry && fileEntry.isFile()) {
                            controllerClass = require(fileName).default;
                            controller = new controllerClass(opts.application);
                            if (controller && controller.emit) {
                              callback();
                            } else {
                              callback({status: 'error', message: 'Could not load controller'})
                            }
                          } else {
                            callback({status: 'error', message: 'Controller does not exist'})
                          }
                        })
                      }
                    },
                      (callback) => {
                        var actionMethod = controller[action].bind(controller);
                        if (actionMethod && typeof(actionMethod) == 'function') {
                          methods[data.method] = actionMethod;
                          callback();
                        } else {
                          callback({status: 'error', message: 'Could not find action'})
                        }
                      }
                    ], function (result) {
                      callback()
                    })
                  } else {
                    callback();
                  }
                },
                function(callback) {
                  if (data.method in methods) {
                    try {
                      var context = this;
                      if (controller) {
                        context = controller;
                      }
                      if (data.params.delayed) {
                        methods[data.method].call(context,data.params,function(result) {
                          sendMessage({
                            msg: "result",
                            id: data.id,
                            result: result
                          });

                          sendMessage({
                            msg: "updated",
                            id: data.id
                          })
                        })
                      } else {
                        var result = methods[data.method].call(context,data.params);
                        sendMessage({
                          msg: "result",
                          id: data.id,
                          result: result
                        });

                        sendMessage({
                          msg: "updated",
                          id: data.id
                        })
                      }
                    } catch (e) {
                      sendMessage({
                        id: data.id,
                        error: {
                          error: 500,
                          reason: "Internal Server Error",
                          errorType: "Meteor.Error"
                        }
                      });
                    }

                  } else {
                    sendMessage({
                      id: data.id,
                      error: {
                        error: 404,
                        reason: "Method not found",
                        errorType: "Meteor.Error"
                      }
                    });
                  }
                }
            ], function(result) {

            })
            break;
        case "sub":

          subscriptions[session_id][data.name] = {
            added: function(id, doc) {
              sendMessage({
                msg: "added",
                collection: data.name,
                id: id,
                fields: doc
              })
            },
            changed: function(id, fields, cleared) {
              sendMessage({
                msg: "changed",
                collection: data.name,
                id: id,
                fields: fields,
                cleared: cleared
              })
            },
            removed: function(id) {
              sendMessage({
                msg: "removed",
                collection: data.name,
                id: id
              })
            }
          };

          var docs = collections[data.name];
          for (var id in docs)
            subscriptions[session_id][data.name].added(id, docs[id]);

          sendMessage({
            msg: "ready",
            subs: [data.id]
          });

          break;

        case "ping":

          sendMessage({
            msg: "pong",
            id: data.id
          });

          break;

        default:
        }
      });

      ws.on('close', function(event) {
        delete subscriptions[session_id];
        ws = null;
        session_id = null;
      });
    }
  });

  this.methods = function(newMethods) {
    for (var key in newMethods) {
      if (key in methods)
        throw new Error(500, "A method named " + key + " already exists");
      methods[key] = newMethods[key];
    }
  }

  this.publish = function(name) {
    if (name in collections)
      throw new Error(500, "A collection named " + name + " already exists");

    var documents = {};
    var proxiedDocuments = {};

    function add(id, doc) {
      documents[id] = doc;
      proxiedDocuments[id] = new Proxy(doc, {
        set: function(_, field, value) {
          var changed = {};
          doc[field] = changed[field] = value;
          sendChanged(id, changed, []);
          return value;
        },
        deleteProperty: function(_, field) {
          delete doc[field];
          sendChanged(id, {}, [field]);
          return true;
        }
      });
      for (var client in subscriptions)
        if (subscriptions[client][name])
          subscriptions[client][name].added(id, doc);
    }

    function change(id, doc) {
      var cleared = [];
      for (var field in documents[id]) {
        if (!(field in doc)) {
          cleared.push(field)
          delete documents[id][field];
        }
      }
      var changed = {};
      for (var field in doc)
        if (doc[field] != documents[id][field])
          documents[id][field] = changed[field] = doc[field];
      sendChanged(id, changed, cleared);
    }
    function sendChanged(id, changed, cleared) {
      for (var client in subscriptions)
        if (subscriptions[client][name])
          subscriptions[client][name].changed(id, changed, cleared);      
    }

    function remove(id) {
      delete documents[id];
      for (var client in subscriptions)
        if (subscriptions[client][name])
          subscriptions[client][name].removed(id);
    }

    return collections[name] = new Proxy(documents, {
      get: function(_, id) {
        return proxiedDocuments[id];
      },
      set: function(_, id, doc) {
        if (documents[id])
          change(id, doc);
        else
          add(id, doc);
        return proxiedDocuments[id];
      },
      deleteProperty: function(_, id) {
        remove(id);
        return true;
      }
    });
  }
}

module.exports = DDPServer