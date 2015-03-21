
            // Asking for results from google using url from model
            this.google.fetch().then(function(data) {
                console.log('Google Fetch done!')
                console.log('lat', data.results[0].geometry.location.lat)
                console.log('lng', data.results[0].geometry.location.lng)
                // Creating new instance ofbrewery collection using google results
                this.searchCollection = new Backbone.Brewery_Collection({
                    latitude: data.results[0].geometry.location.lat,
                    longitude: data.results[0].geometry.location.lng});
            });