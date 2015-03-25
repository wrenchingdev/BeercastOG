;
(function(exports) {
    "use strict";

    /**
     * Router =============================================
     */

    Backbone.BeerRouter = Backbone.Router.extend({

        initialize: function() {

            //Models & Collections
            this.geoRequest = new Backbone.GeoModel();
            this.googleSearch = new Backbone.GoogleSearch();
            this.forecastModel = new Backbone.WeatherModel();
            this.breweryCollectionNear = new Backbone.BreweryCollection();
            this.breweryCollectionSearch = new Backbone.BreweryCollection();

            //Views
            this.headerView = new Backbone.HeaderView();
            this.homeView = new Backbone.HomeView();
            this.aboutView = new Backbone.AboutView();
            this.searchCityView = new Backbone.SearchCityView();
            this.searchNearView = new Backbone.SearchNearView();
            this.detailsView = new Backbone.DetailsView();
            this.weatherView = new Backbone.WeatherView({
                forecast: this.forecastModel
            });
            // this.detailsNearView = new Backbone.DetailsNearView();


            // Because i want the header to render on initial page load, not EVERY page
            this.headerView.render();

            Backbone.history.start();
        },
        routes: {
            'about': 'about',
            'details/:id': 'details',
            // 'detailsNear/:id': 'detailsNear',
            // '/brewery/:id/beers': 'beers',
            'searchCity': 'searchCity',
            'searchNear': 'searchNear',
            '*default': 'home'
        },
        home: function() {
            this.homeView.render();
        },
        about: function() {
            this.aboutView.render();
        },
        searchCity: function() {
            console.log('Search Other City Command Initialized')
            self = this;
            this.googleSearch.fetch().then(function(coords) {
                console.log(coords)
                this.breweryCollectionSearch = new Backbone.BreweryCollection()

                self.breweryCollectionSearch.myLat = coords.results[0].geometry.location.lat
                self.breweryCollectionSearch.myLong = coords.results[0].geometry.location.lng
                debugger;
                console.log(self.breweryCollectionSearch)

                debugger;
                self.breweryCollectionSearch.fetch().then(function(searchBreweriesReturned) {
                    console.log(searchBreweriesReturned)
                    var searchBreweriesArray = searchBreweriesReturned.data
                    console.log(searchBreweriesReturned.data)
                    self.searchCityView.collection = searchBreweriesArray
                    self.searchCityView.render();
                })

            })
        },
        searchNear: function() {
            var self = this

            this.geoRequest.getGeoLoc().then(function(geoData) {

                this.breweryCollectionNear = new Backbone.BreweryCollection()
                this.breweryCollectionNear.myLat = geoData.latitude
                this.breweryCollectionNear.myLong = geoData.longitude

                this.breweryCollectionNear.fetch().then(function(localBreweriesReturned) {

                    console.log(localBreweriesReturned)
                    var localBreweriesArray = localBreweriesReturned.data
                    this.searchNearView.collection = localBreweriesArray
                    this.searchNearView.render();
                }.bind(this))

            }.bind(this))
        },
        details: function(id) {
            var model = new Backbone.BreweryModel({
                id: id
            })
            var self = this

            model.fetch().then(function() {
                self.detailsView.model = model
                self.detailsView.render();

                this.forecastModel.set({
                    lat: model.get('locations')[0].latitude,
                    long: model.get('locations')[0].longitude
                })

                // tell the forecast to pull latest weather
                this.forecastModel.fetch().then(function(data) {
                    // and finally render when that data is retrieved
                    var onDom = document.querySelector('.weather')
                    this.weatherView.el = this.detailsView.el.querySelector('.weather')
                    this.weatherView.render();
                }.bind(this))
            }.bind(this))
        }
    });


    /**
     * views ==============================================
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
        }
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

    Backbone.SearchCityView = Backbone.TemplateView.extend({
        el: ".main",
        view: "searchCity"
    });

    Backbone.SearchNearView = Backbone.TemplateView.extend({
        el: ".main",
        view: "searchNear"
    });

    Backbone.DetailsView = Backbone.TemplateView.extend({
        el: ".main",
        view: "details"
    });

    // Backbone.DetailsNearView = Backbone.TemplateView.extend({
    //     el: ".main",
    //     view: "detailsNear"
    // });

    Backbone.WeatherView = Backbone.TemplateView.extend({
        el: ".weather",
        view: "weather"
    });

    Backbone.AboutView = Backbone.TemplateView.extend({
        el: ".main",
        view: "about"
    });

    /**
     * Models =============================================
     */

    Backbone.GeoModel = Backbone.Model.extend({
        getGeoLoc: function() {
            var geoX = $.Deferred();
            var self = this;

            navigator.geolocation.getCurrentPosition(function(position) {

                    geoX.resolve({
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

    Backbone.GoogleSearch = Backbone.Model.extend({
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

    Backbone.BreweryModel = Backbone.Model.extend({
        breweryDBKey: "3c52864e7f15341096384bb8a92262da",

        url: function() {
            console.log('Brewery search initialized')

            var url = [
                '/brewerydb/details/',
                this.id,
                '?key=',
                this.breweryDBKey,
                '&withLocations=Y'
            ].join('')

            return url
        },

        parse: function(response) {
            return response.data;
        },

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

    /**
     * Collections ========================================
     */

    Backbone.BreweryCollection = Backbone.Collection.extend({
        model: Backbone.BreweryModel,
        breweryDBKey: "3c52864e7f15341096384bb8a92262da",

        url: function() {
            console.log('Brewery search initialized')

            var url = [
                '/brewerydb/search',
                '?key=',
                this.breweryDBKey,
                "&lat=",
                this.myLat,
                "&lng=",
                this.myLong,
                "&radius=40"
            ].join('')

            return url
        }

    });


    exports.BeerRouter = Backbone.BeerRouter;

})(typeof module === 'object' ? module.exports : window);
