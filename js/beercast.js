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
            // Weather View (Inside Details View)
            this.weather = new Backbone.WeatherView({
                forecast: this.forecastModel
            });

            // Search View
            this.search = new Backbone.SearchView();
            // Search Near View
            this.searchNear = new Backbone.SearchView();

            // // Google maps api to fetch lat&long for specific city input
            // this.google = new Backbone.searchGoogle();
            // this.google.fetch().then(function(d) {});


            //==============================================
            // Creating new instance of geomodel
            this.whereAmI = new Backbone.GeoModel();

            // Creating a brewery collection promise
            this.isBrewCollection = $.Deferred();
            // Calling geo function from Geomodel
            this.whereAmI.geo().then(function(latLong) {
                debugger;
                //latLong exists, now need to pass over to fetch.
                // TODO: add in geolocation (radius, too)
                this.brewCollection = new Backbone.Brewery_Collection(latLong)
                    // attach brew collection to SearchView (search)
                this.search.collection = this.brewCollection;
                // once brew collection pulls in breweries nearby, resolve
                debugger;
                this.brewCollection.fetch(latLong).then(function() {
                    debugger;
                    this.isBrewCollection.resolve(latLong);
                }.bind(this))
            }.bind(this));
            //=====================================================


            // Header View
            this.header = new Backbone.HeaderView();
            // Rendering out Header View (doesn't need to render multiple times)
            this.header.render();

            Backbone.history.start();
        },

        routes: {
            'about': 'about',
            'details/:id': 'details',
            // '/brewery/:id/beers': 'beers',
            'search': 'search',
            'searchNear': 'search',
            '*default': 'home'
        },
        home: function() {
            var self = this;
            self.home.render();
        },
        about: function() {
            this.about.render();
        },
        search: function(latLong) {
            this.search.render();
        },
        searchNear: function(latLong) {
            this.searchNear.render();
        },
        details: function(id) {
            var self = this;
            this.isBrewCollection.then(function(d) {
                // get the brewery associated with the id passed in from the router
                var brewery = this.brewCollection.get(id)
                    // store the new model on the view
                this.details.model = brewery
                this.details.render();

                // tell the forecast to update lat/long
                this.forecastModel.set({
                        lat: brewery.get('latitude'),
                        long: brewery.get('longitude')
                    })
                    // tell the forecast to pull latest weather
                this.forecastModel.fetch().then(function(data) {
                    // and finally render when that data is retrieved
                    var onDom = document.querySelector('.weather')
                    this.weather.el = this.details.el.querySelector('.weather')
                    this.weather.render();
                }.bind(this))
            }.bind(this))
        }
    });

    // Views

    Backbone.HeaderView = Backbone.TemplateView.extend({
        el: ".header",
        view: "header",
        events: {
            "submit #submitForm": "submit",
            "click .home": "*default",
            "click .search": "search",
            "click .contact": "contact"
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

        search: function(e) {
            e.preventDefault();
            input: this.el.querySelector('input[class="enter"]')
            window.location.hash = "search"
        }
    });

    Backbone.AboutView = Backbone.TemplateView.extend({
        el: ".main",
        view: "about"
    });

    Backbone.SearchView = Backbone.TemplateView.extend({
        el: ".main",
        view: "search"
    });

    Backbone.SearchNearView = Backbone.TemplateView.extend({
        el: ".main",
        view: "searchNear"
    });

    Backbone.DetailedView = Backbone.TemplateView.extend({
        el: ".main",
        view: "details"
    });

    Backbone.WeatherView = Backbone.TemplateView.extend({
        el: ".weather",
        view: "weather"
    });

    // Models

    Backbone.searchGoogle = Backbone.Model.extend({
        url: function() {
            return [
                "https://maps.googleapis.com/maps/api/geocode/json", //"google/search",
                "?address=",
                "houston",
                // "1600+Amphitheatre+Parkway,+Mountain+View,+CA",
                "&key=",
                "AIzaSyCtv4tcMsxiOedDJZexyPDOk8wda4OUNCY"
            ].join('')
        },
        parse: function(data) {
            return data.data
        }
    });

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

    Backbone.GeoModel = Backbone.Model.extend({
        geo: function() {
            var x = $.Deferred();
            var self = this;

            navigator.geolocation.getCurrentPosition(function(position) {
                    debugger;
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

            return x;
        }
    });

    // Collections


    Backbone.Brewery_Collection = Backbone.Collection.extend({
        model: Backbone.Brewery,
        breweryDBKey: "3c52864e7f15341096384bb8a92262da",
        url: function() {
            debugger;
            return [
                '/brewerydb/search',
                '?key=',
                this.breweryDBKey,
                "&lat=",
                this.models[0].get('latitude'),
                "&lng=",
                this.models[0].get('longitude')
            ].join('')
        },
        parse: function(data) {
            return data.data
        }
    });


    exports.BeerRouter = Backbone.BeerRouter;

})(typeof module === 'object' ? module.exports : window);
