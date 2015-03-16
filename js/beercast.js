;
(function(exports) {
    "use strict";

    // Router

    Backbone.BeerRouter = Backbone.Router.extend({
        initialize: function() {


            this.house = new Backbone.HomeView();
            this.me = new Backbone.AboutView();
            this.tellMe = new Backbone.DetailsView();
            this.looking = new Backbone.SearchView();

            this.whereAmI = new Backbone.GeoModel();


            this.isBrewCollection = $.Deferred();
            console.log(this.isBrewCollection)
            this.whereAmI.geo().then(function(d) {
                console.log('location',d);
                this.brewCollection = new Backbone.Brewery_Collection();
                this.isBrewCollection.resolve(this.brewCollection);
            }.bind(this));

            // this.whereAmI = new Backbone.GeoWeatherModel()

            Backbone.history.start();
        },

        routes: {
            'about': 'about',
            'details': 'details',
            'search': 'search',
            'searchNear': 'search',
            '*default': 'home'
        },
        home: function() {
            this.house.render();
            this.whereAmI.geo()
                .then(function(thegeodata){
                console.log(thegeodata)
            })
        },
        about: function(thegeodata) {
            this.me.render();
        },
        details: function(thegeodata) {
            this.tellMe.render();
        },
        search: function(thegeodata) {
            console.log('yo');
            this.looking.render();
            this.isBrewCollection.then(function(d){
                console.log(d)
                d.fetch().then(function(d){
                    console.log(d);
                });
            })
        }
    });

    // Views

    Backbone.HomeView = Backbone.TemplateView.extend({
        el: ".container",
        view: "home",
        events: {
            "submit .submitForm": "submit",
            "click .enter": "search",
            "click .home": "home",
            "click .search": "search",
            "click .contact": "contact"
        },

        submit: function(e) {
            e.preventDefault();
            this.options.set({
                query: this.el.querySelector('input[class="searchBar"]').value
            });
        },

        searchNear: function(e) {
            e.preventDefault();
            // query: this.el.querySelector('input[class="enter"]')
            window.location.hash = "searchNear"
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

    Backbone.SearchNearView = Backbone.TemplateView.extend({
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

    Backbone.SearchBrew = Backbone.Model.extend({
        url: function() {
            //http://api.brewerydb.com/v2/search/geo/point?lat=29.811903&lng=-95.467471&key=3c52864e7f15341096384bb8a92262da
            var searching = [
                "api.brewerydb.com/v2/search/geo/point", "?lat=", "29.811903", "&lng=", "-95.467471", "&key=", "3c52864e7f15341096384bb8a92262da"].join('')
            console.log(this);

            return searching
        }
    });

    Backbone.DetailsBrew = Backbone.Model.extend({
        url: function() {
            var detailing = [
                "api.brewerydb.com/v2/breweries?", "name=", this.query, "&key=", this.key
            ].join('')
            // console.log(this);

            // return detailing
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
        }//,
        // geofetch: function() {
        //     var self = this;
        //     return this.geo().then(function(position) {
        //         return self.fetch()
        //     })
        // }
    });

    // Collections


    Backbone.Brewery_Collection = Backbone.Collection.extend({
        model: Backbone.SearchBrew,
        url: function() {
            //https://jsonp.nodejitsu.com/?callback=test&url=http%3A%2F%2Fapi.brewerydb.com%2Fv2%2Fsearch%2Fgeo%2Fpoint%3Flat%3D29.811903%26lng%3D-95.467471%26key%3D3c52864e7f15341096384bb8a92262da

            var Searching = //[
                // "https://jsonp.nodejitsu.com/?callback=test&url=", "http://api.brewerydb.com/v2/search/geo/point", "?lat=", "29.811903", "&lng=", "-95.467471", "&key=", "3c52864e7f15341096384bb8a92262da"].join('')
                "https://jsonp.nodejitsu.com/?url=http%3A%2F%2Fapi.brewerydb.com%2Fv2%2Fsearch%2Fgeo%2Fpoint%3Flat%3D29.811903%26lng%3D-95.467471%26key%3D3c52864e7f15341096384bb8a92262da"
            console.log(Searching);

            return Searching
        },
        parse: function(data) {
            return data.results;
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
