;
(function(exports) {
    "use strict";

    // Router

    Backbone.BeerRouter = Backbone.Router.extend({

        initialize: function() {


            this.home = new Backbone.HomeView();
            this.about = new Backbone.AboutView();

            // forecast model is an option to details view
            this.forecastModel = new Backbone.Weather();
            this.details = new Backbone.DetailedView({
                forecast: this.forecastModel
            });


            this.search = new Backbone.SearchView();

            this.header = new Backbone.HeaderView();
            this.header.render();

            this.whereAmI = new Backbone.GeoModel();


            this.isBrewCollection = $.Deferred();
            console.log(this.isBrewCollection)
            this.whereAmI.geo().then(function(d) {
                console.log('location', d);
                // TODO: add in geolocation (radius, too)
                this.brewCollection = new Backbone.Brewery_Collection();
                // attach brew collection to SearchView (search)
                this.search.collection = this.brewCollection;
                // once brew collection pulls in breweries nearby, resolve
                this.brewCollection.fetch().then(function() {
                    this.isBrewCollection.resolve();
                }.bind(this))
            }.bind(this));

            // this.whereAmI = new Backbone.GeoWeatherModel()

            Backbone.history.start();
        },

        routes: {
            'about': 'about',
            'details/:id': 'details',
            'search': 'search',
            'searchNear': 'search',
            '*default': 'home'
        },
        home: function() {
            var self = this;
            this.whereAmI.geo()
                .then(function(thegeodata) {
                    console.log(thegeodata)
                    self.home.render();
                })
        },
        about: function(thegeodata) {
            this.about.render();
        },
        search: function(thegeodata) {
            this.isBrewCollection.then(function(d) {
                this.search.render();
            }.bind(this))
        },
        details: function(id) {
            this.isBrewCollection.then(function(d) {
                // get the brewery associated with the id passed in from the router
                var brewery = this.brewCollection.get(id)
                // store the new model on the view
                this.details.model = brewery
                // tell the forecast to update lat/long
                this.forecastModel.set({
                    lat: brewery.get('latitude'),
                    long: brewery.get('longitude')
                })
                // tell the forecast to pull latest weather
                this.forecastModel.fetch().then(function(){
                    // and finally render when that data is retrieved
                    this.details.render();
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
            "click .enter": "search",
            "click .home": "home",
            "click .search": "search",
            "click .contact": "contact"
        },

        submit: function(e) {
            e.preventDefault()
            this.options.user.set({
                query: this.el.querySelector('input[name="searchBar"]').value
            })
        },

        searchNear: function(e) {
            e.preventDefault();
            // query: this.el.querySelector('input[class="enter"]')
            window.location.hash = "searchNear"
        }
    });

    Backbone.HomeView = Backbone.TemplateView.extend({
        el: ".body",
        view: "home"
    });

    Backbone.SearchView = Backbone.TemplateView.extend({
        el: ".body",
        view: "search"
    });

    Backbone.SearchNearView = Backbone.TemplateView.extend({
        el: ".body",
        view: "search"
    });

    Backbone.DetailedView = Backbone.TemplateView.extend({
        el: ".body",
        view: "details"
    });

    Backbone.AboutView = Backbone.TemplateView.extend({
        el: ".body",
        view: "about"
    });

    // Models

    Backbone.HomeBrew = Backbone.Model.extend({
        url: function() {
            var places = ["maps.googleapis.com/maps/api/geocode/json",
                "?address=",
                "1600+Amphitheatre+Parkway,+Mountain+View,+CA",
                "&key=",
                "AIzaSyCtv4tcMsxiOedDJZexyPDOk8wda4OUNCY"
            ].join('')
        }
    });

    Backbone.Brewery = Backbone.Model.extend({
        validate: function(attrs){
            if(!attrs.latitude || !attrs.longitude){
                return "requires a lat/long"
            }
        },
        initialize: function(){
        }
    });

    Backbone.Weather = Backbone.Model.extend({
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
        validate: function(attrs){
            if(!attrs.lat || !attrs.long){
                return "Weather requests need a lat/long."
            }
        }
    });

    Backbone.GeoModel = Backbone.Model.extend({
        geo: function() {
                var x = $.Deferred(),
                    self = this;
                navigator.geolocation.getCurrentPosition(function(position) {
                    self.set('position', position, {
                        silent: true
                    })
                    x.resolve(position);
                }, function(e) {
                    x.fail(e)
                }, {
                    timeout: 12000, //12s
                    maximumAge: 10 * 60 * 1000 //600s, or 10m
                })
                return x;
            } //,
            // geofetch: function() {
            //     var self = this;
            //     return this.geo().then(function(position) {
            //         return self.fetch()
            //     })
            // }
    });

    // Collections


    Backbone.Brewery_Collection = Backbone.Collection.extend({
        model: Backbone.Brewery,
        breweryDBKey: "3c52864e7f15341096384bb8a92262da",
        url: function() {
            return [
                '/brewerydb/search',
                '?key=',
                this.breweryDBKey,
                "&lat=",
                // this.lat,
                "29.811903",
                "&lng=",
                // this.long,
                "-95.467471"
            ].join('')
        },
        parse: function(data) {
            return data.data
        }
    });

    exports.BeerRouter = Backbone.BeerRouter;

})(typeof module === 'object' ? module.exports : window);
