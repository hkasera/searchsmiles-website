var fetchLocations = function() {
    $.getJSON('/api/get/ngos/location').done(function(data) {
        setUpMap(data);
    }).fail(function() {
        console.log("Failed to fetch locations");
    }).done(function() {
        
    });
}

var setUpMap = function(ngoArr) {
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: {
            lat: 38.1946799,
            lng: -102.4908646
        }
    });
    var infowindow = new google.maps.InfoWindow();
    

    var markers = ngoArr.map(function(ngo, i) {
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(ngo.lat, ngo.lng),
            icon: "/img/ngo-marker.png"
        });
        google.maps.event.addListener(marker, 'click', (function(marker, i) {
          return function() {
            var contentString = "<div><a href='/ngo/"+ngo._id+"'>"+ngo.name+"</a></div>";
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

function initMap() {
    fetchLocations();
}