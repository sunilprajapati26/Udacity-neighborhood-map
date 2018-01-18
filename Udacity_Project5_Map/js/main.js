//Creating main.js for neighborhood Map
var NeighborhoodMap;

//side navigation bar
function openNav() {
    document.getElementById("Sidenav").style.width = "200px";
    console.log('sideopen')
}

function closeNav() {
    document.getElementById("Sidenav").style.width = "0";
}

//creating space for objects
function initNeighborhoodMap() {
    //lat & long for Mumbai location
    NeighborhoodMap = new google.maps.Map(document.getElementById('NeighborhoodMap'), {
        center: {
            lat: 19.07283,
            lng: 72.88261
        },
        zoom: 11
    });

    // marker location tracker function
	var VenueDetails = function(data) {
        var self = this;
        this.title = data.title;
        this.LocationId = data.LocationId;
        this.lng = data.long;
        this.lat = data.lat;
        this.ctgry = data.ctgry;
		// For marker to get visible by default
		this.visible = ko.observable(true);


    //this function give details about all vanues
        this.getInfoContent = function() {
            var PreviousComment = [];
            var baseUrl = 'https://api.foursquare.com/v2/venues/';
            var clientId = 'client_id=S2MBRPE4P4PALTFMXX04FPZ4FWFOVVQDYE25LPTWV5VUM5RX';
            var clientSecret = 'client_secret=0EW3XP2KGXQTVBUVOZ55BEVKETLDE505XC2B00NWGVIR40AM';
            var LocationUrl = baseUrl + self.LocationId + '/tips?sort=recent&v=20180115&' + clientId + '&' + clientSecret;

            $.getJSON(LocationUrl,
                function(data) {
                    $.each(data.response.tips.items, function(k, review) {
                        if (k < 4) {
                            if (review.type == 'user') {
                                PreviousComment.push('<li>' + review.user.firstName + ' -> <b>' + review.text + '</b></li>');
                            } else {
                                PreviousComment.push('<li>' + review.text + '</li>');
                            }
                        }
                    });

                }).done(function() {

                self.content = '<h2>' + self.title + '</h2>' + '<h3>Recent Comments</h3>';
                self.content += '<ol class="tips">' + PreviousComment.join('') + '</ol>';

            }).fail(function(jqXHR, textStatus, errorThrown) {
                self.content = '<h2>' + self.title + '</h2><h4>Ooops!! Error in retreaving venues\'s comments.</h4>';
            });
        }();

        this.infowindow = new google.maps.InfoWindow();

        switch (this.ctgry) {
            case "Visit":
            //Marker Icons url for visiting areas
                this.icon = 'http://www.googlemapsmarkers.com/v1/V/fccb56/';
                break;
            case "Movie Theater":
            //Marker Icons url for movie theater
                this.icon = 'http://www.googlemapsmarkers.com/v1/M/4c774c/';
                break;
            case "Food":
            //Marker Icons url for food plaza
                this.icon = 'http://www.googlemapsmarkers.com/v1/F/7f9eb2/';
                break;
            default:
                this.icon = 'http://www.googlemapsmarkers.com/v1/D/5b0000/';
        }
        this.marker = new google.maps.Marker({
            position: new google.maps.LatLng(self.lng, self.lat),
            NeighborhoodMap: NeighborhoodMap,
            title: self.title,
            icon: self.icon,
            animation: google.maps.Animation.DROP
        });
		
		this.showMarker = ko.computed(function() {
			if(this.visible() === true) {
				this.marker.setMap(NeighborhoodMap);
			} else {
				this.marker.setMap(null);
			}
			return true;
		}, this);

        // Venue Information
        this.openInfowindow = function() {
            for (var i = 0; i < locationsModel.locations.length; i++) {
                locationsModel.locations[i].infowindow.close();
            }
            NeighborhoodMap.panTo(self.marker.getPosition());
            console.log('Comments')
            //content setting
            self.infowindow.setContent(self.content);
            self.infowindow.open(NeighborhoodMap, self.marker);
			
			//marker animations
			self.marker.setAnimation(google.maps.Animation.BOUNCE);
			setTimeout(function() {
				self.marker.setAnimation(null);
			}, 2000);
        };
		
		this.bounce = function(place) {
			google.maps.event.trigger(self.marker, 'click');
		};
        console.log('animation')

        this.addListener = google.maps.event.addListener(self.marker, 'click', (this.openInfowindow));
    };
	
	var locationData = [];
	for(let i=0; i<localLocation.length; i++){
		locationData.push(new VenueDetails(localLocation[i]));
	}
	var locationsModel = {
		locations : locationData,
		query: ko.observable('')
	};

    locationsModel.availablePlaces = ko.computed(function() {
        var self = this;
        return ko.utils.arrayFilter(self.locations, function(location) {
            return location.title.toLowerCase();
        });
    }, locationsModel);

    locationsModel.search = ko.computed(function() {
        var self = this;
		var filter = this.query().toLowerCase();
		if (!filter) {
            self.locations.forEach(function(locationItem) {
                locationItem.visible(true);
            });
            return self.locations;
        } else {
            return ko.utils.arrayFilter(self.locations, function(locationItem) {
                var string = locationItem.title.toLowerCase();
                var result = (string.search(filter) >= 0);
                locationItem.visible(result);
                return result;
            });
        }
    }, locationsModel);

    ko.applyBindings(locationsModel);
}

    // venue details and locations
	let localLocation = [{
			title: 'Plaza Theater',
            LocationId: '4b0587dcf964a5208aa422e3',
			long: 19.019552, 
			lat: 72.8382497,
			ctgry:'Movie Theater'
		},{
			title: 'Pheonix Mall PVR Theater',
            LocationId: '50950f23e4b0578aae7a7a00',
			long: 19.0870,
			lat: 72.8902,
			ctgry:'Movie Theater'
		},{
			title: 'CSMVS Museum',
            LocationId: '4b0587d1f964a520cfa222e3',
			long: 18.927391,
			lat: 72.832054,
			ctgry: 'Visit'
		},{
			title: 'Taj Hotel Mumbai',
            LocationId: '4b0587caf964a520f1a122e3',
			long: 18.9217,
			lat: 72.8330,
			ctgry:'Food'
		},{
			title: 'The park Hotel',
            LocationId: '4bd79499304fce72b7b933ab',
			long: 19.025,
			lat: 73.0369,
			ctgry:'Food'
		}
	];

//if error msg pop up
function mapError() {
    $('#NeighborhoodMap').html('<span class="errorMessage">Error in Loading Map for NeighborhoodMap.</span>');
    // alert("Error");
    console.log('errorMsg')
}