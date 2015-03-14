;
(function(exports) {
    "use strict";

    // Router

    Backbone.BeerRouter = Backbone.Router.extend({
        initialize: function() {
            this.brewCollection = new Backbone.Brewery_Collection();

            this.house = new Backbone.HomeView();
            this.me = new Backbone.AboutView();
            this.tellMe = new Backbone.DetailsView();
            this.looking = new Backbone.SearchView();

            this.whereAmI = new Backbone.GeoWeatherModel({
                //==============================================
                //access_token:
                    //access_token: **********************************
                    //==============================================
            })

            Backbone.history.start();
        },

        routes: {
            'about': 'about',
            'details': 'details',
            'search': 'search',
            '*default': 'home'
        },
        home: function() {
            this.house.render();
            this.whereAmI.geofetch().then(function(data) {
                data;
                console.log(data);
                this.data = data;
            })
        },
        about: function() {
            this.me.render();
        },
        details: function() {
            this.tellMe.render();
        },
        search: function() {
            this.looking.render();
        }
    });

    // Views

    Backbone.HomeView = Backbone.TemplateView.extend({
        el: ".container",
        view: "home",
        events: {
            "submit .submitForm": "submit",
            "click .enter": "enter"
        },

        // submit: function(e) {
        //     e.preventDefault();
        //     this.options.set({
        //         query: this.el.querySelector('input[class="searchBar"]').value
        //     });
        // },

        enter: function(e) {
            e.preventDefault();
            query: this.el.querySelector('input[class="enter"]')
            window.location.hash = "about"
        }
    });

    Backbone.SearchView = Backbone.TemplateView.extend({
        el: ".container",
        view: "search",
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

    Backbone.DetailsView = Backbone.TemplateView.extend({
        el: ".container",
        view: "details",
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

    Backbone.AboutView = Backbone.TemplateView.extend({
        el: ".container",
        view: "about",
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

    // Models

    Backbone.HomeBrew = Backbone.Model.extend({});

    Backbone.SearchBrew = Backbone.Model.extend({});

    Backbone.DetailsBrew = Backbone.Model.extend({
        url: function() {
            return [
                "api.brewerydb.com/v2/breweries?", "name=", this.query, "&key=", this.key
            ].join('')
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
        },
        geofetch: function() {
            var self = this;
            return this.geo().then(function(position) {
                return self.fetch()
            })
        }
    });

    Backbone.GeoWeatherModel = Backbone.GeoModel.extend({

        url: function() {
            var theWeather = [
                "https://api.forecast.io/forecast/",
                this.get('access_token'),
                "/",
                this.get("position").coords.latitude + ',' + this.get("position").coords.longitude,
                "?callback=?"
            ].join('')

            return theWeather
        }
    });

    // Collections


    Backbone.Brewery_Collection = Backbone.Collection.extend({
        model: Backbone.SearchBrew,
        // url: function() {
        //     return [
        //         "https://nutritions.herokuapp.com/api/v1/venues",
        //         this.zip ? '?near=' + this.zip : ''
        //     ].join('')
        // },
        parse: function(data) {
            return data.breweries
        }
    });

    Backbone.Details_Collection = Backbone.Collection.extend({
        model: Backbone.DetailsBrews,
        // url: function() {
        //     return [
        //         "https://nutritions.herokuapp.com/api/v1/venues",
        //         this.zip ? '?near=' + this.zip : ''
        //     ].join('')
        // },
        parse: function(data) {
            return data.venues
        }
    });

    exports.BeerRouter = Backbone.BeerRouter;

})(typeof module === 'object' ? module.exports : window);
