"use strict";
/*
 * Send GET or POST requests
 */

const querystring = require('querystring')
  , https = require('https')
  , http = require('http')
  , urlParser = require('url');

const request = {

  // make post API call
  post: function (url, path, params) {
    return new Promise(function(onResolve, onReject){
      // Build the post string from params object
      const params_data = querystring.stringify(params)
        , parsedUrl = urlParser.parse(url)
        , httpProvider = (parsedUrl.protocol == 'https:') ?  https : http
        , sanitizedPort = (parsedUrl.port || (parsedUrl.protocol=='https:' ?  443 : 80)).toString();

      // An object of options to indicate where to post to
      const req_options = {
        host: parsedUrl.hostname,
        port: sanitizedPort,
        path: path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36'
        }
      };

      // Set up the request
      const post_req = httpProvider.request(req_options, function (res) {
        var bodyStr = '';
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
          bodyStr += chunk;
        });

        res.on('end', function () {
          try {
            var parsedResp = JSON.parse(bodyStr);
          } catch(err) {
            onReject(err);
            return;
          }

          onResolve(parsedResp);
        });
      });

      post_req.on('error', function(err) {
        onReject(err);
      });

      // make remote request
      post_req.write(params_data);
      post_req.end();
    });
  },

  // make get API call
  get: function (url, path, params) {
    return new Promise(function(onResolve, onReject){
      // Build the post string from params object
      const params_data = querystring.stringify(params)
        , parsedUrl = urlParser.parse(url)
        , httpProvider = (parsedUrl.protocol == 'https:') ?  https : http
        , sanitizedPort = (parsedUrl.port || (parsedUrl.protocol=='https:' ?  443 : 80)).toString();

      // An object of options to indicate where to post to
      const req_options = {
        host: parsedUrl.hostname,
        port: sanitizedPort,
        path: path + (params_data ? '?' + params_data : ''),
        method: 'GET',
        headers: {
          'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36'
        }
      };

      // Set up the request
      httpProvider.get(req_options, function (res) {
        var bodyStr = '';
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
          bodyStr += chunk;
        });

        res.on('end', function () {

          try {
            var parsedResp = JSON.parse(bodyStr);
          } catch(err) {
            onReject(err);
            return;
          }

          onResolve(parsedResp);
        });

      }).on('error', function(err) {
        onReject(err);
      });

    });
  }

};

module.exports = request;
