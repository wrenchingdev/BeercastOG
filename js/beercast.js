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
        }
    });

    Backbone.SearchView = Backbone.TemplateView.extend({

    });

    Backbone.DetailsView = Backbone.TemplateView.extend({

    });

    Backbone.ContactView = Backbone.TemplateView.extend({

    });

    // Models

    Backbone.HomeBrew = Backbone.Model.extend({

    });

    Backbone.SearchBrew = Backbone.Model.extend({
        url: function() {
            return [].join('')
        }
    });

    Backbone.DetailsBrew = Backbone.Model.extend({

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
