var map,
    directionDisplay,
    binsPlaced = [],
    browserSupportFlag = false,
    initialLocation,
    myLat = 38.1946799,
    myLong = -102.4908646,
    defaultLocation;

var setUpMap = function(ngoArr) {
    defaultLocation = new google.maps.LatLng(myLat, myLong);
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    if (navigator.geolocation) {
        browserSupportFlag = true;
        navigator.geolocation.getCurrentPosition(function(position) {
            myLat = position.coords.latitude;
            myLong = position.coords.longitude;
            initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            map.setCenter(initialLocation);
            $("#pac-input").show();
            $.getJSON('/api/get/ngos/location').then(locateNGOs, handleError);
        }, function() {
            handleNoGeolocation(browserSupportFlag);
        });
    }
    // Browser doesn't support Geolocation
    else {
        browserSupportFlag = false;
        handleNoGeolocation(browserSupportFlag);
    }
    initAutocomplete();
}

var initAutocomplete = function() {
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
    });
    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
    });

    var markers = [];
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        if (places.length != 0) {
            var location = places[0].geometry.location;
            var lat = location.lat();
            var longi = location.lng();
            $.getJSON('/api/get/ngos/location').then(locateNGOs, handleError);
        }

        // Clear out the old markers.
        markers.forEach(function(marker) {
            marker.setMap(null);
        });
        markers = [];

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
            var icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };

            // Create a marker for each place.
            markers.push(new google.maps.Marker({
                map: map,
                icon: icon,
                title: place.name,
                position: place.geometry.location
            }));


            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
    });
}


function handleNoGeolocation(errorFlag) {

    $.when($.ajax("/get/bins/12/77")).then(locateBins, handleError);
    map.setCenter(initialLocation);
}


function locateNGOs(ngoArr) {

    var infowindow, marker, i;

    infowindow = new google.maps.InfoWindow();
    marker = new google.maps.Marker({
        position: new google.maps.LatLng(myLat, myLong),
        map: map,
    });

    var markers = ngoArr.map(function(ngo, i) {
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(ngo["_source"]["location"].lat, ngo["_source"]["location"].lon),
            icon: "/img/ngo-marker.png"
        });
        google.maps.event.addListener(marker, 'click', (function(marker, i) {
            return function() {
                var contentString = "<div><a href='/ngo/" + ngo._id + "'>" + ngo["_source"].name + "</a></div>";
                infowindow.setContent(contentString);
                infowindow.open(map, marker);
            }
        })(marker, i));
        return marker;
    });

    // Add a marker clusterer to manage the markers.
    var markerCluster = new MarkerClusterer(map, markers, {
        imagePath: '/img/marker'
    });
}




function handleError() {
    console.log("Ooops error");
}




function initMap() {
    setUpMap();
}