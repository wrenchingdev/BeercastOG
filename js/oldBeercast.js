;
(function(exports) {
    "use strict";

    /**
     * Router
     */

    Backbone.BeerRouter = Backbone.Router.extend({

        initialize: function() {

            // Home View
            this.home = new Backbone.HomeView();
            // About View
            this.about = new Backbone.AboutView();

            // forecastModel is an option to details view
            this.forecastModel = new Backbone.WeatherModel();

            // Details View
            this.details = new Backbone.DetailedView();
            this.detailsNear = new Backbone.DetailedNearView();
            // Weather View (Inside Details View)
            this.weather = new Backbone.WeatherView({
                forecast: this.forecastModel
            });

            // Search Near View
            this.searchNear = new Backbone.SearchNearView();
            // Search View
            this.search = new Backbone.SearchView();

            // New instance of google search model
            this.google = new Backbone.searchGoogle();

            // Creating new instance of geomodel
            this.whereAmI = new Backbone.GeoModel();

            // Header View
            this.header = new Backbone.HeaderView();
            // Rendering out Header View (doesn't need to render multiple times)
            this.header.render();

            Backbone.history.start();
        },

        routes: {
            'about': 'about',
            'details/:id': 'details',
            'detailsNear/:id': 'detailsNear',
            // '/brewery/:id/beers': 'beers',
            'search': 'search',
            'searchNear': 'searchNear',
            '*default': 'home'
        },
        home: function() {
            this.home.render();
            //
            //
        },
        about: function() {
            this.about.render();
            //
            //
        },
        search: function(terms) {
            console.log('Fetching Google data')
            this.google.fetch().then(function(coords) {
                console.log('Google Fetch done!')
                console.log(coords);
                this.searchBrewCollection = new Backbone.Brewery_Collection_Search({
                    // latitude: coords.results[0].geometry.location.lat,
                    // longitude: coords.results[0].geometry.location.lng
                });
                var self = this;

                this.searchBrewCollection.latitude = coords.results[0].geometry.location.lat
                this.searchBrewCollection.longitude = coords.results[0].geometry.location.lng

                debugger;
                // attach Search View to searchBrewCollection (Brewery_Collection)
                this.search.collection = this.searchBrewCollection;
                this.searchBrewCollection.fetch().then(function(d) {

                    var searchFarCollection = new Backbone.Brewery_Collection_Search

                    d.data.forEach(function(brewery) {
                        var newBrew = new Backbone.Brewery(brewery)
                        searchFarCollection.add(newBrew)
                    })
                    this.brewCollection = searchFarCollection
                    this.search.render();
                }.bind(this))
            }.bind(this))
        },
        searchNear: function(latLong) {
            //==============================================
            // Creating a brewery collection promise
            this.isBrewCollection = $.Deferred();
            // Calling geo function from Geomodel
            this.whereAmI.geo().then(function(latLong) {

                //latLong exists, now need to pass over to fetch.
                // TODO: add in geolocation (radius, too)
                this.brewCollection = new Backbone.Brewery_Collection_Near(latLong)
                    // console.log(this.brewCollection)

                // attach SearchNearView to brew collection
                this.searchNear.collection = this.brewCollection;
                // once brew collection pulls in breweries nearby, resolve
                this.isBrewCollection.resolve();
            }.bind(this));
            //=====================================================

            this.isBrewCollection.then(function() {
                this.brewCollection.fetch(latLong).then(function() {
                    this.searchNear.render();
                }.bind(this))
            }.bind(this))
        },
        details: function(id) {
            this.breweryAway = this.searchFarCollection.get(id)
            this.details.model = breweryAway
            this.details.render();
            // telling the forecast to update lat/long
            this.forecastModel.set({
                    lat: brewery.get('latitude'),
                    long: brewery.get('longitude')
                })
                // telling the forecast to pull latest weather
            this.forecastModel.fetch().then(function(data) {
                // and finally render when that data is retrieved
                var onDom = document.querySelector('.weather')
                this.weather.el = this.detailsNear.el.querySelector('.weather')
                this.weather.render();
            }.bind(this))
        },
        detailsNear: function(id) {
            this.isBrewCollection.then(function(data) {
                // get the brewery associated with the id passed in from the router
                var breweriesNear = this.brewCollection.get(id)
                    // store the new model on the view
                this.detailsNear.model = breweriesNear
                this.detailsNear.render();

                // tell the forecast to update lat/long
                this.forecastModel.set({
                        lat: brewery.get('latitude'),
                        long: brewery.get('longitude')
                    })
                    // tell the forecast to pull latest weather
                this.forecastModel.fetch().then(function(data) {
                    // and finally render when that data is retrieved
                    var onDom = document.querySelector('.weather')
                    this.weather.el = this.detailsNear.el.querySelector('.weather')
                    this.weather.render();
                }.bind(this))
            }.bind(this))
        }
    });

    /**
     * Views
     */

    Backbone.HeaderView = Backbone.TemplateView.extend({
        el: ".header",
        view: "header",
        events: {
            "submit #submitForm": "submit"
        },
        submit: function(e) {
            e.preventDefault()
            this.options.user.set({
                query: this.el.querySelector('input[name="searchBar"]').value
            })
        },
    });

    Backbone.HomeView = Backbone.TemplateView.extend({
        el: ".main",
        view: "home",
        events: {
            "click .enter": "searchNear"
        },
        searchNear: function(e) {
            e.preventDefault();
            window.location.hash = "/searchNear"
        }
    });

    Backbone.AboutView = Backbone.TemplateView.extend({
        el: ".main",
        view: "about"
    });

    Backbone.SearchCityView = Backbone.TemplateView.extend({
        el: ".main",
        view: "search"
    });

    Backbone.SearchNearView = Backbone.TemplateView.extend({
        el: ".main",
        view: "searchNear"
    });

    Backbone.DetailedNearView = Backbone.TemplateView.extend({
        el: ".main",
        view: "detailsNear"
    });

    Backbone.DetailedView = Backbone.TemplateView.extend({
        el: ".main",
        view: "details"
    });

    Backbone.WeatherView = Backbone.TemplateView.extend({
        el: ".weather",
        view: "weather"
    });

    /**
     * Models
     */

    Backbone.Brewery = Backbone.Model.extend({
        validate: function(attrs) {
            if (!attrs.latitude || !attrs.longitude) {
                return "requires a lat/long"
            }
        }
    });

    Backbone.WeatherModel = Backbone.Model.extend({
        url: function() {
            var weather = [
                "/forecast/",
                "955e54ac4942a9211638a3c642a51372/",
                this.get('lat'),
                '/',
                this.get('long')
            ].join("")
            return weather
        },
        validate: function(attrs) {
            if (!attrs.lat || !attrs.long) {
                return "Weather requests need a lat/long."
            }
        }
    });

    Backbone.searchGoogle = Backbone.Model.extend({
        url: function() {
            return [
                "https://maps.googleapis.com/maps/api/geocode/json", //"google/search",
                "?address=",
                "austin",
                // "1600+Amphitheatre+Parkway,+Mountain+View,+CA",
                "&key=",
                "AIzaSyCtv4tcMsxiOedDJZexyPDOk8wda4OUNCY"
            ].join('')
        },
        parse: function(data) {
            console.log('Google results= ', data.results[0].geometry.location.lat, data.results[0].geometry.location.lng)
            debugger;
            return data.results[0].geometry.location
        }
    });

    Backbone.GeoModel = Backbone.Model.extend({
        geo: function() {
            var geoX = $.Deferred();
            var self = this;

            navigator.geolocation.getCurrentPosition(function(position) {

                    x.resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                function(e) {
                    x.fail(e)
                }, {
                    timeout: 12000, //12s
                    maximumAge: 10 * 60 * 1000 //600s, or 10m
                });

            return geoX;
        }
    });

    /**
     * Collections
     */


    Backbone.Brewery_Collection_Near = Backbone.Collection.extend({
        model: Backbone.Brewery,
        breweryDBKey: "3c52864e7f15341096384bb8a92262da",
        initialize: function(options) {
            this.options = options;
            debugger;
        },
        url: function() {
            debugger;
            console.log('Brewery search initialized')
            var url = [
                '/brewerydb/search',
                '?key=',
                this.breweryDBKey,
                "&lat=",
                this.viewLatitude(),
                "&lng=",
                this.viewLongitude(),
                "&radius=40"
            ].join('')
            return url
        },
        parse: function(data) {
            console.log(data.data)
            debugger;
            return data.data
        },

        viewLatitude: function() {
            return this.options.latitude
        },

        viewLongitude: function() {
            return this.options.longitude
        }
    });

    Backbone.Brewery_Collection_Search = Backbone.Brewery_Collection_Near.extend({
        viewLatitude: function() {
            return this.latitude
        },

        viewLongitude: function() {
            return this.longitude
        }
    })


    exports.BeerRouter = Backbone.BeerRouter;

})(typeof module === 'object' ? module.exports : window);
