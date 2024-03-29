/**
 * Module dependencies.
 */

function startServer() {
    var express = require('express'),
        http = require('http'),
        path = require('path'),
        app = express(),
        request = require('request'),
        _ = require('lodash');

    function querify(queryParamsObject){
        return '?'+_.map(queryParamsObject || {}, function(val, key){
            return key+'='+val
        }).join('&');
    }

    // adds a new rule to proxy a localUrl -> webUrl
    // i.e. proxify ('/my/server/google', 'http://google.com/')
    function proxify(localUrl, webUrl){
        app.get(localUrl, function(req, res) {
            var url = [
                webUrl,
                querify(req.query)
            ].join("");

            req.pipe(request(url)).pipe(res);
        });
    }

    // add your proxies here.
    //
    // examples:
    // proxify('/yummly/recipes', 'http://api.yummly.com/v1/api/recipes');
    proxify('/brewerydb/search', 'https://api.brewerydb.com/v2/search/geo/point');
    proxify('google/search', 'https://maps.googleapis.com/maps/api/geocode/json');
    app.get('/forecast/:key/:lat/:long', function(req, res){
        var url = [
            "https://api.forecast.io/forecast/",
            req.params.key,
            "/",
            req.params.lat,
            ",",
            req.params.long
        ].join('')
        req.pipe(request(url)).pipe(res);
    })
    // proxify('/brewerydb/details/:id', 'https://api.brewerydb.com/v2/brewery/')
    app.get('/brewerydb/details/:id', function(req, res){
        var url = [
            "https://api.brewerydb.com/v2/brewery/",
            req.params.id,
            querify(req.query)
        ].join('')

        req.pipe(request(url)).pipe(res)
    })

    // all environments
    app.set('port', process.argv[3] || process.env.PORT || 3000);
    app.use(express.static(path.join(__dirname, '')));

    http.createServer(app).listen(app.get('port'), function() {
        console.log('Express server listening on port ' + app.get('port'));
    });
}

module.exports.startServer = startServer;