var Promise = require('promise');
var result = require('lodash.result');
var superagent = require('superagent');
var api = require('./api');

// Throw an error when a URL is needed, and none is supplied.
var urlError = function () {
  throw new Error('A "url" property or function must be specified');
};

// Map from CRUD to HTTP for our default `Backbone.sync` implementation.
var methodMap = {
  'create': 'post',
  'update': 'put',
  'patch':  'patch',
  'delete': 'del',
  'read':   'get'
};

module.exports = function(method, model, options) {
  var type = methodMap[method];
  var url = options.url || result(model, 'url') || urlError();
  var request = superagent[type](url);

  if (method == 'create' || method == 'update' || method == 'patch') {
    var data = options.data || options.attrs || model.toJSON(options);
    request.send(data);
  }

  var tokens = api.getTokens();

  if (tokens.has_auth_tokens) {
    request.set('Authorization', 'Bearer ' + tokens.access_token);
  }

  return new Promise(function(resolve, reject) {
    request.end(function(error, response) {
      if (error) {
        if (options.error) options.error(error);
        reject(error);
      } else {
        if (options.success) options.success(response.body);
        resolve(model);
      }
    });
  });
};
