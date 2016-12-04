var locations = [];

var fetchLocations = function() {
    $.getJSON('/api/get/ngos/location').done(function(data) {
        locations = data;
    }).fail(function() {
        console.log("Failed to fetch locations");
    }).done(function() {
        setUpMap();
    });
}

var setUpMap = function() {
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: {
            lat: 38.2875989,
            lng: -94.6812059
        }
    });

    var markers = locations.map(function(location, i) {
        return new google.maps.Marker({
            position: location,
            icon: "/img/ngo-marker.png"
        });
    });

    // Add a marker clusterer to manage the markers.
    var markerCluster = new MarkerClusterer(map, markers, {
        imagePath: '/img/marker'
    });
}

function initMap() {
    fetchLocations();
}