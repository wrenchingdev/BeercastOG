;
(function() {
        "use strict";
        // Router

        Backbone.BeerRouter = Backbone.Router.extend({

        });

        // Views

        Backbone.HomeView = Backbone.TemplateView.extend({
                el: ".container",
                view: "home",
                events: {
                    "submit #submitForm": "submit"
                },

                submit: function(e) {
                    e.preventDefault()
                    this.options.user.set({
                        query: this.el.querySelector('input[name="searchBar"]').value
                    })
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
                });

                Backbone.ContactView = Backbone.TemplateView.extend({
                    el: ".container",
                    view: "contact",
                    events: {
                        "submit #submitForm": "submit"
                    },

                    submit: function(e) {
                        e.preventDefault()
                        this.options.user.set({
                            query: this.el.querySelector('input[name="searchBar"]').value
                        })
                });

                // Models

                Backbone.HomeBrew = Backbone.Model.extend({

                });

                Backbone.SearchBrew = Backbone.Model.extend({

                });

                Backbone.DetailsBrew = Backbone.Model.extend({
                    url: function() {
                        return [
                        "api.brewerydb.com/v2/breweries?", "name=", this.query, "&key=", "3c52864e7f15341096384bb8a92262da"].join('')
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
                        return data.venues
                    }
                });

                Backbone.Details_Collection = Backbone.Collection.extend({
                    model: Backbone.DetailsBrews,
                    url: function() {
                        return [
                            "https://nutritions.herokuapp.com/api/v1/venues",
                            this.zip ? '?near=' + this.zip : ''
                        ].join('')
                    },
                    parse: function(data) {
                        return data.venues
                    }
                });

            })(typeof module === 'object' ? module.exports : window);
